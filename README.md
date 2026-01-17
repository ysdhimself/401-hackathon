Job Application Analyzer Project placeholder

Backend OAuth + Gmail MVP

Setup
1) Create a virtual environment and install dependencies (Django).
2) Source env vars:
   ```bash
   cp setup.sh.example setup.sh
   # edit setup.sh with your real values
   source setup.sh
   ```
3) Run migrations:
   ```bash
   cd backend
   python3 manage.py makemigrations
   python3 manage.py migrate
   ```
4) Start server:
   ```bash
   python3 manage.py runserver
   ```

Run
- Open `http://localhost:8000/api/`
- Click "Sign in with Gmail"
- After consent, the app auto-fetches emails and redirects to the list page
- [optional] Visit `http://localhost:8000/api/emails/page` to view up to 5 latest subjects if not directly automatically

Env vars
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REDIRECT_URI (default: http://localhost:8000/api/auth/google/callback)

<!-- Endpoints
- GET /api/
- GET /api/auth/google/login
- GET /api/auth/google/callback
- GET /api/emails/fetch
- GET /api/emails/page -->

Adding the firebase JSON FIle
1) in the secrets folder place the JSON inside there. 
