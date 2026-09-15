"""Automatic profile translation through DeepL, cached per field in profile_translations.

Each cached entry remembers a hash of the source text, so only changed fields are sent
to DeepL. Owner corrections (manual) apply while their source text stays unchanged.
"""
import hashlib
import json
import logging
import os
import time
from urllib.request import Request, urlopen

from storage import connect

LANGUAGES = ('ru', 'pl', 'en', 'de')
TARGETS = {'ru': 'RU', 'pl': 'PL', 'en': 'EN-GB', 'de': 'DE'}
# Names and contact values are never translated.
FIELDS = (
    'job', 'bio', 'skills', 'services', 'opportunities',
    'titleAbout', 'titleSkills', 'titleServices', 'titleOpportunities', 'titleContacts',
)
KEY = os.getenv('DEEPL_API_KEY', '').strip()
ENDPOINT = os.getenv('DEEPL_API_URL', '').strip() or (
    'https://api-free.deepl.com/v2/translate' if KEY.endswith(':fx') else 'https://api.deepl.com/v2/translate'
)
ENABLED = bool(KEY)
RETRY_SECONDS = 300
_failed_until = 0.0
log = logging.getLogger(__name__)


def digest(text):
    return hashlib.sha256(text.encode()).hexdigest()[:20]


def sources(profile):
    return {field: profile.get(field, '').strip() for field in FIELDS if profile.get(field, '').strip()}


def load(user_id):
    rows = {lang: {'auto': {}, 'manual': {}} for lang in LANGUAGES}
    with connect() as db:
        for row in db.execute('SELECT lang,auto,manual FROM profile_translations WHERE user_id=?', (user_id,)).fetchall():
            if row['lang'] in rows:
                rows[row['lang']] = {'auto': json.loads(row['auto']), 'manual': json.loads(row['manual'])}
    return rows


def deepl(texts, target):
    body = json.dumps({'text': texts, 'target_lang': target, 'preserve_formatting': True}).encode()
    request = Request(ENDPOINT, data=body, method='POST', headers={
        'Authorization': 'DeepL-Auth-Key ' + KEY, 'Content-Type': 'application/json',
    })
    with urlopen(request, timeout=8) as response:
        items = json.load(response)['translations']
    if len(items) != len(texts):
        raise ValueError('DeepL returned an unexpected number of translations')
    return [(item['text'], item.get('detected_source_language', '').lower()[:2]) for item in items]


def refresh(user_id, profile):
    """Translate changed fields into every language. Returns False if some remain untranslated."""
    global _failed_until
    texts = sources(profile)
    rows = load(user_id)
    pending = {lang: [f for f, text in texts.items() if rows[lang]['auto'].get(f, {}).get('h') != digest(text)] for lang in LANGUAGES}
    if not any(pending.values()):
        return True
    if not ENABLED or time.time() < _failed_until:
        return False
    detected = {}
    for lang in LANGUAGES:
        for field, text in texts.items():
            entry = rows[lang]['auto'].get(field)
            if entry and entry['h'] == digest(text) and entry.get('src'):
                detected[field] = entry['src']
    changed = set()
    complete = True
    try:
        for lang in LANGUAGES:
            remote = []
            for field in pending[lang]:
                if detected.get(field) == lang:
                    rows[lang]['auto'][field] = {'h': digest(texts[field]), 'text': texts[field], 'src': lang}
                    changed.add(lang)
                else:
                    remote.append(field)
            if not remote:
                continue
            for field, (text, source) in zip(remote, deepl([texts[f] for f in remote], TARGETS[lang])):
                detected[field] = source
                rows[lang]['auto'][field] = {'h': digest(texts[field]), 'text': texts[field] if source == lang else text, 'src': source}
            changed.add(lang)
    except (OSError, ValueError, KeyError, TypeError) as exception:
        _failed_until = time.time() + RETRY_SECONDS
        log.warning('DeepL translation failed: %s', exception)
        complete = False
    if changed:
        with connect() as db:
            for lang in changed:
                db.execute(
                    "INSERT INTO profile_translations(user_id,lang,auto,manual) VALUES(?,?,?,'{}') "
                    'ON CONFLICT(user_id,lang) DO UPDATE SET auto=excluded.auto',
                    (user_id, lang, json.dumps(rows[lang]['auto'], ensure_ascii=False)),
                )
    return complete


def localized(user_id, profile, rows=None):
    """Per-language text for the current profile: owner correction, else fresh machine translation."""
    rows = rows or load(user_id)
    result = {}
    for lang in LANGUAGES:
        values = {}
        for field, text in sources(profile).items():
            for kind in ('manual', 'auto'):
                entry = rows[lang][kind].get(field)
                if entry and entry['h'] == digest(text):
                    values[field] = entry['text']
                    break
        result[lang] = values
    return result


def editable(user_id, profile):
    """Owner view: source, machine translation and correction for every language and field."""
    rows = load(user_id)
    result = {}
    for lang in LANGUAGES:
        result[lang] = {}
        for field, text in sources(profile).items():
            auto, manual = rows[lang]['auto'].get(field), rows[lang]['manual'].get(field)
            result[lang][field] = {
                'source': text,
                'sourceLang': auto.get('src', '') if auto and auto['h'] == digest(text) else '',
                'auto': auto['text'] if auto and auto['h'] == digest(text) else '',
                'manual': manual['text'] if manual and manual['h'] == digest(text) else '',
            }
    return result


def save_manual(user_id, profile, changes, limits):
    """changes: {lang: {field: text}}. An empty text removes the correction."""
    texts = sources(profile)
    rows = load(user_id)
    for lang, fields in changes.items():
        manual = {f: entry for f, entry in rows[lang]['manual'].items() if f in texts and entry['h'] == digest(texts[f])}
        for field, value in fields.items():
            value = value.strip()
            if field not in texts:
                continue
            if len(value) > limits[field]:
                raise ValueError(field)
            if value:
                manual[field] = {'h': digest(texts[field]), 'text': value}
            else:
                manual.pop(field, None)
        rows[lang]['manual'] = manual
    with connect() as db:
        for lang in changes:
            db.execute(
                "INSERT INTO profile_translations(user_id,lang,auto,manual) VALUES(?,?,'{}',?) "
                'ON CONFLICT(user_id,lang) DO UPDATE SET manual=excluded.manual',
                (user_id, lang, json.dumps(rows[lang]['manual'], ensure_ascii=False)),
            )
