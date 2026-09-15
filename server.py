"""NFC web application: SQLite persistence, account sessions, profile API and static assets.

Development: python server.py --port 4173
Production: gunicorn --config gunicorn.conf.py server:app
"""
import argparse
import base64
import hashlib
import hmac
import io
import json
import os
from pathlib import Path
import re
import secrets
import time
from urllib.parse import urlparse

from dotenv import load_dotenv
from flask import Flask, Response, jsonify, redirect, request, send_file
from PIL import Image, ImageOps, UnidentifiedImageError
from werkzeug.middleware.proxy_fix import ProxyFix
from werkzeug.exceptions import HTTPException

ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT / '.env', override=False)
from storage import AVAILABLE, DB, IntegrityError, VERCEL, connect
import translate

MODE = os.getenv('NFC_ENV', 'production' if VERCEL else 'development')
if MODE not in ('development', 'production'):
    raise ValueError('NFC_ENV must be development or production')
PUBLIC_ORIGIN = os.getenv('NFC_PUBLIC_ORIGIN', '').rstrip('/')
if not PUBLIC_ORIGIN and VERCEL and os.getenv('VERCEL_PROJECT_PRODUCTION_URL'):
    PUBLIC_ORIGIN = 'https://' + os.environ['VERCEL_PROJECT_PRODUCTION_URL']
origin_parts = urlparse(PUBLIC_ORIGIN)
if PUBLIC_ORIGIN and (origin_parts.scheme not in ('http', 'https') or not origin_parts.netloc or origin_parts.path or origin_parts.query or origin_parts.fragment or origin_parts.username):
    raise ValueError('NFC_PUBLIC_ORIGIN must be an origin, for example https://cards.example.com')
if MODE == 'production' and origin_parts.scheme != 'https':
    raise ValueError('Production requires NFC_PUBLIC_ORIGIN=https://your-domain.example')
SESSION_SECONDS = int(os.getenv('NFC_SESSION_DAYS', '7')) * 86400
if not 86400 <= SESSION_SECONDS <= 90 * 86400:
    raise ValueError('NFC_SESSION_DAYS must be between 1 and 90')
SECURE_COOKIE = origin_parts.scheme == 'https'
Image.MAX_IMAGE_PIXELS = 20_000_000


app = Flask(__name__, static_folder=None)
app.config.update(MAX_CONTENT_LENGTH=3_000_000, JSON_SORT_KEYS=False)
if MODE == 'production':
    app.config['TRUSTED_HOSTS'] = [origin_parts.hostname]
if os.getenv('NFC_TRUST_PROXY', '0') == '1':
    # Enable only when one trusted reverse proxy is the application's only ingress.
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=0)

ALLOWED = {
    'firstName': 40, 'lastName': 50, 'bio': 2000, 'job': 80, 'skills': 500,
    'opportunities': 1000, 'phone': 30, 'social': 500, 'design': 40, 'idea': 200,
    'photo': 2_800_000, 'instagram': 500, 'telegram': 500, 'whatsapp': 30,
    'contactEmail': 254, 'services': 1000, 'accent': 10,
    'titleAbout': 60, 'titleSkills': 60, 'titleServices': 60, 'titleOpportunities': 60, 'titleContacts': 60,
    'sections': 120, 'vcard': 3,
}
SECTIONS = ('about', 'skills', 'services', 'opportunities', 'contacts')
STATIC = {
    'style.css', 'app.js', 'account.js', 'i18n.js', 'hero-loader.js', 'hero-scene.js',
    'profile-card.js', 'cabinet.js', 'cabinet.css',
    'assets/concept.png', 'assets/vendor/three.module.min.js',
}
STATIC.update('assets/icons/' + icon + '.svg' for icon in (
    'phone', 'brand-instagram', 'brand-telegram', 'brand-whatsapp', 'mail', 'link', 'user-plus', 'world',
))


def error(code, status):
    return jsonify(error=code), status


def password_hash(password, salt=None):
    """Compatible with the original local SQLite accounts."""
    salt = salt or secrets.token_hex(16)
    digest = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt), n=16384, r=8, p=1).hex()
    return salt + ':' + digest


def session_user():
    token = request.cookies.get('nfc_session', '')
    if not token:
        return None
    digest = hashlib.sha256(token.encode()).hexdigest()
    with connect() as db:
        return db.execute('SELECT users.* FROM sessions JOIN users ON users.id=sessions.user_id WHERE token=? AND expires>?', (digest, int(time.time()))).fetchone()


def issue_session(response, user_id):
    token = secrets.token_urlsafe(32)
    now = int(time.time())
    with connect() as db:
        db.execute('DELETE FROM sessions WHERE expires<=?', (now,))
        db.execute('INSERT INTO sessions VALUES(?,?,?)', (hashlib.sha256(token.encode()).hexdigest(), user_id, now + SESSION_SECONDS))
    response.set_cookie('nfc_session', token, max_age=SESSION_SECONDS, httponly=True, secure=SECURE_COOKIE, samesite='Strict', path='/')
    return response


@app.before_request
def validate_mutation():
    if not AVAILABLE and (request.path.startswith('/api/') or request.path.startswith('/local-login/')):
        return error('storage_unavailable', 503)
    if request.method in ('POST', 'PUT', 'PATCH', 'DELETE'):
        expected = PUBLIC_ORIGIN or request.host_url.rstrip('/')
        if request.headers.get('Origin', '').rstrip('/') != expected:
            return error('origin', 403)
        if request.mimetype != 'application/json':
            return error('content_type', 415)


@app.after_request
def response_headers(response):
    response.headers['Cache-Control'] = 'no-store'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['Referrer-Policy'] = 'same-origin'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Content-Security-Policy'] = "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"
    if MODE == 'production':
        response.headers['Strict-Transport-Security'] = 'max-age=31536000'
    return response


@app.errorhandler(HTTPException)
def http_error(exception):
    return error('too_large' if exception.code == 413 else 'not_found' if exception.code == 404 else 'invalid', exception.code)


@app.get('/healthz')
def health():
    if not AVAILABLE:
        return jsonify(ok=False, error='storage_unavailable'), 503
    with connect() as db:
        db.execute('SELECT 1').fetchone()
    return jsonify(ok=True)


@app.get('/')
@app.get('/index.html')
@app.get('/p/<public_id>')
def page(public_id=None):
    html = (ROOT / 'index.html').read_text()
    if AVAILABLE and session_user():
        html = html.replace('<span data-account-label>Войти</span>', '<span data-account-label>Личный кабинет</span>')
    return Response(html, content_type='text/html; charset=utf-8')


@app.get('/account')
def account_page():
    """Personal account for an existing card. Sign-in and first creation stay on the landing page."""
    user = session_user() if AVAILABLE else None
    if not user or not json.loads(user['profile']).get('firstName'):
        return redirect('/?account=1', code=303)
    return Response((ROOT / 'account.html').read_text(), content_type='text/html; charset=utf-8')


@app.get('/api/me')
def me():
    user = session_user()
    if not user:
        return error('unauthorized', 401)
    return jsonify(id=user['id'], email=user['email'], profile=json.loads(user['profile']), publicUrl=(PUBLIC_ORIGIN or request.host_url.rstrip('/')) + '/p/' + user['id'])


@app.get('/api/public/<public_id>')
def public_profile(public_id):
    with connect() as db:
        user = db.execute('SELECT id,profile FROM users WHERE id=?', (public_id,)).fetchone()
    if not user:
        return error('not_found', 404)
    # Physical-print notes are private. Account email and credentials never leave this API.
    profile = {key: value for key, value in json.loads(user['profile']).items() if key in ALLOWED and key not in ('idea', 'design')}
    # Profiles saved before translation existed are translated on their first public view.
    translate.refresh(user['id'], profile)
    return jsonify(id=user['id'], profile=profile, translations=translate.localized(user['id'], profile))


@app.get('/api/translations')
def translations():
    user = session_user()
    if not user:
        return error('unauthorized', 401)
    profile = json.loads(user['profile'])
    complete = translate.refresh(user['id'], profile)
    return jsonify(enabled=translate.ENABLED, complete=complete, languages=translate.editable(user['id'], profile))


@app.put('/api/translations')
def save_translations():
    user = session_user()
    if not user:
        return error('unauthorized', 401)
    body = request.get_json()
    if not isinstance(body, dict) or set(body) - set(translate.LANGUAGES):
        return error('invalid', 400)
    for fields in body.values():
        if not isinstance(fields, dict) or set(fields) - set(translate.FIELDS) or not all(isinstance(v, str) for v in fields.values()):
            return error('invalid', 400)
    try:
        translate.save_manual(user['id'], json.loads(user['profile']), body, ALLOWED)
    except ValueError:
        return error('invalid', 400)
    return jsonify(ok=True)


def auth_throttled(email):
    now = int(time.time())
    ip = hashlib.sha256((request.remote_addr or '').encode()).hexdigest()
    email_key = hashlib.sha256(email.encode()).hexdigest()
    with connect() as db:
        db.execute('BEGIN IMMEDIATE')
        db.execute('DELETE FROM auth_attempts WHERE created<?', (now - 900,))
        count_ip = db.execute('SELECT COUNT(*) AS total FROM auth_attempts WHERE ip=?', (ip,)).fetchone()['total']
        count_email = db.execute('SELECT COUNT(*) AS total FROM auth_attempts WHERE email=?', (email_key,)).fetchone()['total']
        if count_ip >= 60 or count_email >= 12:
            return True
        db.execute('INSERT INTO auth_attempts VALUES(?,?,?)', (ip, email_key, now))
    return False


@app.post('/api/register')
@app.post('/api/login')
def authenticate():
    body = request.get_json()
    if not isinstance(body, dict):
        return error('invalid', 400)
    email, password = body.get('email', ''), body.get('password', '')
    if not isinstance(email, str) or not isinstance(password, str) or len(email) > 254 or not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', email) or not 10 <= len(password) <= 128:
        return error('credentials_format', 400)
    email = email.strip().lower()
    if auth_throttled(email):
        response = jsonify(error='rate_limited')
        response.status_code = 429
        response.headers['Retry-After'] = '900'
        return response
    with connect() as db:
        user = db.execute('SELECT * FROM users WHERE email=?', (email,)).fetchone()
        if request.path == '/api/register':
            if user:
                return error('exists', 409)
            user_id = secrets.token_urlsafe(12)
            try:
                db.execute('INSERT INTO users VALUES(?,?,?,?)', (user_id, email, password_hash(password), json.dumps({'firstName': '', 'design': 'Лайм'})))
            except IntegrityError:
                return error('exists', 409)
        else:
            encoded = user['password'] if user else password_hash('dummy-password')
            valid = hmac.compare_digest(password_hash(password, encoded.split(':')[0]), encoded)
            if not user or not valid:
                return error('credentials', 401)
            user_id = user['id']
    return issue_session(jsonify(id=user_id), user_id)


@app.post('/api/logout')
def logout():
    if not session_user():
        return error('unauthorized', 401)
    digest = hashlib.sha256(request.cookies['nfc_session'].encode()).hexdigest()
    with connect() as db:
        db.execute('DELETE FROM sessions WHERE token=?', (digest,))
    response = jsonify(ok=True)
    response.delete_cookie('nfc_session', path='/', httponly=True, secure=SECURE_COOKIE, samesite='Strict')
    return response


def normalize_photo(value):
    """Validate uploads, bound dimensions, remove metadata and store portable image bytes."""
    match = re.fullmatch(r'data:image/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)', value)
    if not match:
        raise ValueError('invalid photo')
    raw = base64.b64decode(match[2], validate=True)
    if len(raw) > 2_097_152:
        raise ValueError('photo too large')
    with Image.open(io.BytesIO(raw)) as image:
        image.load()
        image = ImageOps.exif_transpose(image)
        image.thumbnail((1600, 1600))
        image = image.convert('RGB')
        output = io.BytesIO()
        image.save(output, format='JPEG', quality=90, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(output.getvalue()).decode()


@app.put('/api/profile')
def save_profile():
    user = session_user()
    if not user:
        return error('unauthorized', 401)
    body = request.get_json()
    if not isinstance(body, dict):
        return error('invalid', 400)
    if set(body) - set(ALLOWED):
        return error('forbidden', 403)
    existing = json.loads(user['profile'])
    profile = {}
    for key, limit in ALLOWED.items():
        value = body.get(key, existing.get(key, ''))
        if not isinstance(value, str) or len(value) > limit:
            return error('invalid', 400)
        profile[key] = value.strip() if key != 'photo' else value
    if not profile['firstName']:
        return error('name_required', 400)
    if profile['social']:
        url = urlparse(profile['social'])
        if url.scheme not in ('https', 'http') or not url.netloc or url.username or url.password:
            return error('contacts_invalid', 400)
    for field, hosts in [('instagram', {'instagram.com', 'www.instagram.com'}), ('telegram', {'t.me', 'telegram.me', 'www.t.me', 'www.telegram.me'})]:
        if profile[field]:
            url = urlparse(profile[field])
            if url.scheme != 'https' or url.hostname not in hosts or not url.path.strip('/') or url.username or url.password:
                return error('contacts_invalid', 400)
    if profile['whatsapp'] and not re.fullmatch(r'[1-9][0-9]{6,14}', re.sub(r'[\s()+.-]', '', profile['whatsapp'])):
        return error('contacts_invalid', 400)
    if profile['contactEmail'] and not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', profile['contactEmail']):
        return error('contacts_invalid', 400)
    if profile['accent'] not in ('', 'lime', 'lilac', 'silver'):
        return error('invalid', 400)
    if profile['vcard'] not in ('', 'off'):
        return error('invalid', 400)
    if profile['sections']:
        # Ordered section IDs, each exactly once; "!" hides a section.
        if sorted(token.removeprefix('!') for token in profile['sections'].split(',')) != sorted(SECTIONS):
            return error('invalid', 400)
    if profile['photo'] and profile['photo'] != existing.get('photo'):
        try:
            profile['photo'] = normalize_photo(profile['photo'])
        except (ValueError, OSError, UnidentifiedImageError, Image.DecompressionBombError, Image.DecompressionBombWarning):
            return error('invalid', 400)
    with connect() as db:
        db.execute('UPDATE users SET profile=? WHERE id=?', (json.dumps(profile, ensure_ascii=False), user['id']))
    # Best effort: the profile is already saved even if the translation provider is unavailable.
    return jsonify(ok=True, id=user['id'], translated=translate.refresh(user['id'], profile))


@app.get('/local-login/<token>')
def local_login(token):
    if MODE != 'development' or PUBLIC_ORIGIN:
        return error('not_found', 404)
    digest = hashlib.sha256(token.encode()).hexdigest()
    with connect() as db:
        db.execute('BEGIN IMMEDIATE')
        link = db.execute('SELECT user_id FROM local_links WHERE token=? AND expires>?', (digest, int(time.time()))).fetchone()
        db.execute('DELETE FROM local_links WHERE token=? OR expires<=?', (digest, int(time.time())))
    if not link:
        return error('not_found', 404)
    return issue_session(redirect('/?account=1', code=303), link['user_id'])


@app.get('/<path:filename>')
def asset(filename):
    if filename not in STATIC:
        return error('not_found', 404)
    return send_file(ROOT / filename)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=int(os.getenv('NFC_PORT', '4173')))
    parser.add_argument('--host', default=os.getenv('NFC_HOST', '127.0.0.1'))
    parser.add_argument('--local-login', metavar='EMAIL')
    args = parser.parse_args()
    if args.local_login:
        if MODE != 'development' or PUBLIC_ORIGIN:
            raise SystemExit('Local login links are disabled outside local development')
        token = secrets.token_urlsafe(32)
        with connect() as db:
            user = db.execute('SELECT id FROM users WHERE email=?', (args.local_login.lower(),)).fetchone()
            if not user:
                raise SystemExit('Account not found')
            db.execute('INSERT INTO local_links VALUES(?,?,?)', (hashlib.sha256(token.encode()).hexdigest(), user['id'], int(time.time()) + 90))
        print(f'http://127.0.0.1:{args.port}/local-login/{token}')
    elif MODE == 'production':
        raise SystemExit('Run production with: gunicorn --config gunicorn.conf.py server:app')
    else:
        app.run(host=args.host, port=args.port, debug=False)
