# Job Finder

## Backend OAuth + Gmail MVP
Django REST backend with a React (Vite + Tailwind) frontend for tracking job applications, follow-ups, and Gmail-powered email ingestion.

## Prerequisites
- Python 3.11+ (recommended: `python -m venv .venv`)
- Node 18+ / npm

## Backend (API)
```bash
cd backend
cp .env.example .env  # fill Gmail OAuth values if you want email import
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver  # http://localhost:8000
```

Helpful commands:
- `python manage.py createsuperuser`
- `python manage.py makemigrations` / `python manage.py migrate`
- `python manage.py test`

<!-- Endpoints
- GET /api/
- GET /api/auth/google/login
- GET /api/auth/google/callback
- GET /api/emails/fetch
- GET /api/emails/page -->

---

## Adding the firebase JSON FIle
1) in the secrets folder place the firebase.json inside there.
## Frontend (React)
```bash
cd frontend
npm install
npm run dev       # http://localhost:5173 (proxies /api to 8000)
# or
npm run build && npm run preview
```

Highlights:
- React Router + React Query + Tailwind UI
- Dashboard with quick-add application form, stats, recent items, and follow-up list
- Full CRUD for applications, notes, and filters
- Gmail page to connect/fetch/disconnect (requires backend Gmail env vars)

## Notes
- API is under `/api/**` (Vite dev server proxies to `localhost:8000`).
- CORS is configured for `http://localhost:5173`.
- SQLite is used for development; adjust `DATABASES` in `backend/backend/settings.py` for other databases.***
