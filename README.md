# Job Finder

A Django 5.2 web application for job searching functionality.

## Setup

1. Navigate to the backend directory:
   ```bash
   cd backend/
   ```

2. Run database migrations:
   ```bash
   python manage.py migrate
   ```

3. Start the development server:
   ```bash
   python manage.py runserver
   ```

## Commands

```bash
# Database operations
python manage.py migrate
python manage.py makemigrations

# Create admin user
python manage.py createsuperuser

# Run tests
python manage.py test

# Django shell
python manage.py shell
```

## Architecture

- **Framework**: Django 5.2.8 (MVT pattern)
- **Database**: SQLite3 (development)
- **Server**: WSGI/ASGI compatible
