"""Production configuration and WSGI behavior against a disposable database."""
import os
from pathlib import Path
import socket
import subprocess
import sys
import tempfile
import time
import unittest
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]


class ProductionTest(unittest.TestCase):
    def test_https_sessions_validation_uploads_and_throttle(self):
        script = r'''
import base64, io
from PIL import Image
from server import app
client = app.test_client()
base = 'https://cards.example.test'
headers = {'Origin': base}
credentials = {'email': 'production@example.test', 'password': 'test-production-password'}
result = client.post('/api/register', json=credentials, headers=headers, base_url=base)
assert result.status_code == 200, result.data
cookie = result.headers['Set-Cookie']
assert all(flag in cookie for flag in ('HttpOnly', 'Secure', 'SameSite=Strict'))
me = client.get('/api/me', base_url=base)
assert me.status_code == 200
identifier = me.json['id']
assert me.json['publicUrl'] == base + '/p/' + identifier
assert client.get('/healthz', base_url=base).status_code == 200
assert client.get('/healthz', base_url='https://evil.example').status_code == 400
assert client.get('/local-login/anything', base_url=base).status_code == 404
assert client.get('/.env', base_url=base).status_code == 404
assert client.put('/api/profile',json={'firstName':'Blocked'},headers={'Origin':'https://evil.example'},base_url=base).status_code == 403
image = Image.new('RGB', (1800, 1200), '#d8fa86')
output = io.BytesIO(); image.save(output, format='PNG')
photo = 'data:image/png;base64,' + base64.b64encode(output.getvalue()).decode()
saved = client.put('/api/profile',json={'firstName':'Sample','photo':photo},headers=headers,base_url=base)
assert saved.status_code == 200, saved.data
public = client.get('/api/public/' + identifier, base_url=base).json['profile']
assert public['photo'].startswith('data:image/jpeg;base64,')
normalized = Image.open(io.BytesIO(base64.b64decode(public['photo'].split(',')[1])))
assert max(normalized.size) <= 1600
bad = client.put('/api/profile',json={'photo':'data:image/png;base64,YmFk'},headers=headers,base_url=base)
assert bad.status_code == 400
assert client.get('/api/public/' + identifier,base_url=base).json['profile']['photo'] == public['photo']
for _ in range(12):
    result = client.post('/api/login',json={**credentials,'password':'incorrect-password'},headers=headers,base_url=base)
assert result.status_code == 429
page = client.get('/',base_url=base)
assert 'Локальный прототип' not in page.text
assert 'Личный кабинет' in page.text
assert page.headers['Strict-Transport-Security']
'''
        with tempfile.TemporaryDirectory() as tmp:
            env = {**os.environ, 'NFC_ENV': 'production', 'NFC_PUBLIC_ORIGIN': 'https://cards.example.test', 'NFC_DB': str(Path(tmp) / 'production.sqlite3')}
            subprocess.run([sys.executable, '-c', script], cwd=ROOT, env=env, check=True, capture_output=True)

    def test_gunicorn_starts_with_production_env(self):
        with tempfile.TemporaryDirectory() as tmp:
            with socket.socket() as sock:
                sock.bind(('127.0.0.1', 0))
                port = sock.getsockname()[1]
            env = {**os.environ, 'NFC_ENV': 'production', 'NFC_PUBLIC_ORIGIN': 'https://cards.example.test', 'NFC_DB': str(Path(tmp) / 'gunicorn.sqlite3'), 'NFC_HOST': '127.0.0.1', 'NFC_PORT': str(port), 'NFC_WORKERS': '1'}
            process = subprocess.Popen([sys.executable, '-m', 'gunicorn', '--config', 'gunicorn.conf.py', 'server:app'], cwd=ROOT, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            try:
                for attempt in range(100):
                    try:
                        req = Request(f'http://127.0.0.1:{port}/healthz', headers={'Host': 'cards.example.test'})
                        with urlopen(req, timeout=.5) as result:
                            self.assertEqual(result.status, 200)
                        break
                    except OSError:
                        if attempt == 99:
                            self.fail('Gunicorn health check failed')
                        time.sleep(.05)
            finally:
                process.terminate()
                process.wait(timeout=10)


if __name__ == '__main__':
    unittest.main()
