FROM python:3.13-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 NFC_HOST=0.0.0.0 NFC_PORT=8080 NFC_ENV=production NFC_DB=/data/nfc.sqlite3
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt \
    && useradd --uid 10001 --create-home app \
    && mkdir /data && chown app:app /data
COPY --chown=app:app server.py storage.py translate.py gunicorn.conf.py index.html account.html style.css cabinet.css profile-card.js app.js account.js cabinet.js i18n.js hero-loader.js hero-scene.js ./
COPY --chown=app:app assets/ ./assets/
USER app
EXPOSE 8080
VOLUME ["/data"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s CMD python -c "import os,urllib.request,urllib.parse; u=os.getenv('NFC_PUBLIC_ORIGIN','http://localhost'); r=urllib.request.Request('http://127.0.0.1:'+os.getenv('NFC_PORT','8080')+'/healthz',headers={'Host':urllib.parse.urlparse(u).netloc}); urllib.request.urlopen(r,timeout=3)"
CMD ["gunicorn", "--config", "gunicorn.conf.py", "server:app"]
