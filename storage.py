"""SQLite locally; PostgreSQL for hosts without a persistent filesystem."""
from contextlib import contextmanager
import os
from pathlib import Path
import sqlite3
import threading

import psycopg
from psycopg.rows import dict_row

DATABASE_URL = os.getenv('DATABASE_URL', '')
VERCEL = os.getenv('VERCEL') == '1'
AVAILABLE = bool(DATABASE_URL) or not VERCEL
DB = Path(os.getenv('NFC_DB', str(Path(__file__).resolve().parent / 'data' / 'nfc.sqlite3'))).expanduser().resolve()
IntegrityError = (sqlite3.IntegrityError, psycopg.IntegrityError)
SCHEMA = (
    'CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL,profile TEXT NOT NULL)',
    'CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id TEXT NOT NULL,expires BIGINT NOT NULL)',
    'CREATE TABLE IF NOT EXISTS local_links(token TEXT PRIMARY KEY,user_id TEXT NOT NULL,expires BIGINT NOT NULL)',
    'CREATE TABLE IF NOT EXISTS auth_attempts(ip TEXT NOT NULL,email TEXT NOT NULL,created BIGINT NOT NULL)',
    'CREATE INDEX IF NOT EXISTS auth_attempts_time ON auth_attempts(created)',
    # Additive: translations live beside profiles; the users table is never rewritten.
    'CREATE TABLE IF NOT EXISTS profile_translations(user_id TEXT NOT NULL,lang TEXT NOT NULL,auto TEXT NOT NULL,manual TEXT NOT NULL,PRIMARY KEY(user_id,lang))',
)
_ready = False
_lock = threading.Lock()


class PostgresConnection:
    def __init__(self, connection):
        self.connection = connection

    def execute(self, sql, params=()):
        if sql == 'BEGIN IMMEDIATE':
            # Serialize the short rate-limit / one-time-link transaction across workers.
            return self.connection.execute('SELECT pg_advisory_xact_lock(78243012)')
        return self.connection.execute(sql.replace('?', '%s'), params)


@contextmanager
def connect():
    global _ready
    if not AVAILABLE:
        raise RuntimeError('Persistent DATABASE_URL is required on Vercel')
    if DATABASE_URL:
        raw = psycopg.connect(DATABASE_URL, row_factory=dict_row, connect_timeout=10, prepare_threshold=None)
        db = PostgresConnection(raw)
    else:
        DB.parent.mkdir(parents=True, exist_ok=True)
        raw = sqlite3.connect(DB, timeout=15)
        raw.row_factory = sqlite3.Row
        db = raw
    try:
        with _lock:
            if not _ready:
                if DATABASE_URL:
                    raw.execute('SELECT pg_advisory_xact_lock(78243011)')
                else:
                    raw.execute('PRAGMA journal_mode=WAL')
                for statement in SCHEMA:
                    raw.execute(statement)
                raw.commit()
                if not DATABASE_URL:
                    os.chmod(DB, 0o600)
                _ready = True
        with raw:
            yield db
    finally:
        raw.close()
