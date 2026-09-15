# nfctag

NFC cards and mobile contact profiles. Graphite landing page, an animated 3D NFC interaction, a shared light mobile profile, and Russian, Polish, English and German interfaces.

The application includes account registration and sign-in, editable profiles, photo uploads, contact links, vCard downloads and permanent public URLs. It runs on Flask, with Gunicorn on persistent hosts or Vercel Functions. Accounts, sessions, profiles and photos persist in SQLite locally or dedicated PostgreSQL on Vercel. Object storage is not required.

## Run locally

Python 3.13+ is recommended. Node is needed only for JavaScript checks or rebuilding the bundled Three.js library.

```sh
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
python server.py --port 4173
```

Open http://127.0.0.1:4173, select **Войти**, and register your own account. No demo accounts or credentials are included in this repository. Existing local databases remain compatible; starting the application adds missing tables without replacing profiles or IDs.

No `.env` is needed for this local command. If you already copied the production example, set `NFC_ENV=development` and leave `NFC_PUBLIC_ORIGIN` empty for local use.

## Deploy

Use a Linux service or container host with a **persistent writable disk** and an **HTTPS reverse proxy**. GitHub stores the source code; GitHub Pages cannot run this backend. Stateless function hosts and ephemeral filesystems are unsuitable for the SQLite configuration.

1. Copy `.env.example` to `.env`, or enter the variables in your hosting dashboard.
2. Replace `NFC_PUBLIC_ORIGIN` with your actual stable HTTPS domain.
3. Mount a persistent volume at `/data` and set `NFC_DB=/data/nfc.sqlite3`.
4. Start the application behind your hosting provider's HTTPS proxy.

Container commands:

```sh
docker build -t nfctag .
docker volume create nfctag-data
docker run -d --name nfctag --restart unless-stopped \
  --env-file .env \
  -v nfctag-data:/data \
  -p 127.0.0.1:8080:8080 nfctag
```

The loopback port binding assumes an HTTPS proxy on the same host. A managed container platform should connect to container port 8080 through its private service network. Do not expose the container directly while trusting forwarded headers.

Without Docker, install the requirements, configure the same environment, provision a writable persistent DB directory, then start:

```sh
gunicorn --config gunicorn.conf.py server:app
```

Production deliberately refuses to start without a public HTTPS origin. `/healthz` checks both the HTTP application and database access. A health probe must send the configured domain in its Host header. The Docker image includes this probe and runs as non-root UID 10001; a bind-mounted directory must be writable by that UID.

### Environment variables

All variables below are implemented. Put them in the hosting dashboard or an untracked `.env`, not in GitHub source files.

| Variable | Required for production | Value / purpose |
| --- | --- | --- |
| `NFC_ENV` | Yes | `production`; local default is `development`. |
| `NFC_PUBLIC_ORIGIN` | Yes | Your stable origin, e.g. `https://cards.your-domain.com`, without a path. Determines permanent links, accepted request Origin and Secure cookies. |
| `NFC_DB` | Yes for persistent hosting | Absolute SQLite file on the persistent volume, e.g. `/data/nfc.sqlite3`. Local default: `data/nfc.sqlite3`. Photos are stored in the same database. |
| `NFC_HOST` | Optional | Bind address. Container/Gunicorn default: `0.0.0.0`; local development: `127.0.0.1`. |
| `NFC_PORT` | Optional | Internal HTTP port. Container/Gunicorn: `8080`; local: `4173`. |
| `NFC_WORKERS` | Optional | Gunicorn processes, default `2`, each with four threads. Run on one host sharing one local SQLite volume. |
| `NFC_SESSION_DAYS` | Optional | Login lifetime, default `7`, allowed range `1–90`. |
| `NFC_TRUST_PROXY` | Optional | Default `0`. Set `1` only when exactly one trusted proxy is the application's only ingress and replaces client-supplied forwarded headers. |

Set `DATABASE_URL` when using PostgreSQL (required on Vercel); omit it for SQLite on a persistent disk. No S3/R2 key or session signing secret is needed. Sessions use cryptographically random, server-stored tokens. Email is an account identifier; the application does not send email.

## Permanent NFC URLs and data

Registration creates an opaque random ID once. `/p/<id>` stays the same when the owner changes their name, contacts, photo, physical-card design or digital accent. The API refuses client-supplied identity fields and edits only the profile belonging to the current session. A replacement physical NFC card may use the same URL.

A public page reads saved data from the database without requiring a login. Contact email is a separate, explicitly public field; the account's login email and private physical-design notes are not included in public API responses. Optional empty sections are hidden. Instagram and Telegram accept full HTTPS profile URLs; WhatsApp accepts a phone number with country code. The website/portfolio field accepts HTTP or HTTPS.

Photo uploads accept JPG, PNG and WebP up to 2 MiB. New images are decoded, bounded to 1600 pixels and re-encoded as JPEG without original metadata. This keeps photo storage with the profile and avoids separate storage credentials. Account passwords use salted scrypt; session tokens are hashed in the database. Cookies are HttpOnly and SameSite=Strict, and Secure when configured for HTTPS. Mutations require the configured Origin. Sign-in/registration attempts are limited over a 15-minute window using shared database state.

### Preserve links during deployment

Never write a localhost URL into a physical NFC card intended for other phones. Choose the public domain first, transfer the same database privately, and use the resulting public URL with the original ID. This repository deliberately excludes local user data and does not transfer it to the hosting provider.

Back up the entire SQLite database using SQLite's backup API. Do not copy only the live `.sqlite3` file while WAL writes are in progress. Example, run on the host with the correct `NFC_DB` path:

```sh
python -c "import os,sqlite3; source=sqlite3.connect(os.environ['NFC_DB']); target=sqlite3.connect('/private-backups/nfctag.sqlite3'); source.backup(target); target.close(); source.close()"
```

Keep backups outside the web root and limit filesystem access. Losing the database or the domain can break old NFC links; maintaining both is required. The SQLite configuration targets one host with local persistent storage, not multiple machines sharing a database over network storage.

## Interface and file map

| File | Responsibility |
| --- | --- |
| `index.html` | Landing sections, account forms, mobile preview and success dialog. |
| `style.css` | Responsive design, separate brand/navigation/account header, light public card, contact rows and motion preferences. |
| `app.js` | Profile rendering, editable contact fields, templates, upload selection and vCard export. |
| `account.js` | Session-aware navigation, API calls, save/error behavior and permanent-link confirmation. |
| `i18n.js` | RU/PL/EN/DE dictionaries, language persistence and document language updates. User-entered profile content is not translated. |
| `hero-loader.js` | Loads the 3D runtime only when the landing hero approaches the viewport; public profiles do not load Three.js. |
| `hero-scene.js` | Three.js hands, card, phone, notification, tap sequence and light profile. Includes pause, reduced-motion handling and offscreen suspension. This is a rendered 3D animation, not recorded video. |
| `server.py` | Flask application, configuration, SQLite, authorization, upload validation and explicit static-file allowlist. |
| `gunicorn.conf.py` | Production server binding, worker/thread limits and graceful restart settings. |
| `requirements.txt` | Pinned Python dependencies. |
| `Dockerfile`, `.dockerignore` | Non-root container build and private-file exclusions. |
| `.env.example` | Actual supported deployment configuration, with no secrets. |
| `tests/test_server.py` | Account isolation, immutable IDs, persistence, public reads and edit validation. |
| `tests/test_production.py` | Gunicorn startup, HTTPS configuration, session flags, uploads and login throttling. |
| `deploy/github-actions-check.yml.example` | Optional GitHub Actions template: Python integration tests, JavaScript syntax checks and container build. Copy to `.github/workflows/check.yml` using credentials with workflow permission to enable CI. |
| `assets/icons/` | Tabler Icons 3.46.0 SVGs; MIT license included. |
| `assets/vendor/` | Bundled Three.js 0.186.0, approximately 725 KiB; MIT license included. |
| `assets/concept.png` | Original generated product illustration used only if WebGL is unavailable. It is not a customer photo. |

The initial repository README title `nfctag` is retained. Local `.codex` settings, environments, databases, sessions, customer uploads and logs are excluded from Git and Docker builds.

## Tests

```sh
python -m unittest discover -s tests -v
for file in app.js account.js i18n.js hero-loader.js hero-scene.js; do
  node --check "$file"
done
```

Tests create temporary databases and accounts. They do not modify the operator's local database. To regenerate the vendor bundle, use the `three@0.186.0` npm package and esbuild to bundle/minify its `build/three.module.js` as ESM; keep the supplied MIT license.

## Scope

Working: accounts, profiles, photos, all listed contacts, immutable public pages, saved physical-design preferences, mobile previews, confirmation flow, four languages and the 3D demonstration.

Not included: payment processing, order submission/fulfillment, delivery tracking, email verification, password recovery, an operator dashboard, public hosting activation or writing a physical NFC tag. Saving a design preference is not an order or a payment. The physical-card artwork remains a concept; final print assets and the owner's author mark must be approved before manufacturing.

The development-only `python server.py --local-login EMAIL` command creates a one-use link valid for 90 seconds for an existing local account. It requires filesystem access and is disabled in production or whenever a public origin is configured. No test passwords are distributed.

## Vercel deployment

Import this repository with the Flask preset. `server.py` exports the WSGI app;
`vercel.json` copies public assets to the CDN during the build. Gunicorn and Docker
settings are only used by persistent-server deployments.

Vercel requires **a dedicated PostgreSQL database**. Connect a new database for
this project (for example Neon via Vercel Storage), and securely set `DATABASE_URL`
to its PostgreSQL connection string with TLS. The psycopg adapter is implemented
in `storage.py`; profiles, normalized photos, sessions and rate limits all persist
in PostgreSQL. Schema creation is automatic and serialized across instances.
Do not connect another application's database.

Set `NFC_ENV=production`. Set `NFC_PUBLIC_ORIGIN` to the stable HTTPS production
domain, or omit it to use Vercel's `VERCEL_PROJECT_PRODUCTION_URL`. Optional
`NFC_SESSION_DAYS=7` controls session lifetime. `NFC_DB`, `NFC_WORKERS`, `NFC_HOST`
and `NFC_PORT` are not needed on Vercel. Never set SQLite to `/tmp`: it loses data.
Without `DATABASE_URL`, the landing page works, account APIs and `/healthz` return
503, and the account dialog shows an unavailable message. Registration cannot
silently create disposable accounts. Redeploy after connecting the database.

Local SQLite remains supported. No local accounts, passwords or photos are copied
to PostgreSQL automatically. Keep existing NFC links on their original domain;
changing domains requires redirects and an explicit data migration preserving IDs.

Production site: https://nfctag-zeta.vercel.app/ — project: https://vercel.com/ewgeen/nfctag. The dedicated Neon database is named `nfctag`; its integration supplies `DATABASE_URL` securely. Local private data is not deployed.
