"""Portable production HTTP worker settings; HTTPS is handled by the hosting proxy."""
import os
from dotenv import load_dotenv

load_dotenv(override=False)
bind = f"{os.getenv('NFC_HOST', '0.0.0.0')}:{int(os.getenv('NFC_PORT', '8080'))}"
workers = int(os.getenv('NFC_WORKERS', '2'))
worker_class = 'gthread'
threads = 4
timeout = 60
graceful_timeout = 30
accesslog = None  # Do not write one-time URLs or public profile IDs into access logs.
errorlog = '-'
max_requests = 1000
max_requests_jitter = 100
