import json
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

from django.conf import settings


GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'
GMAIL_MESSAGES_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/messages'


def build_google_auth_url(state: str) -> str:
    query = {
        'client_id': settings.GOOGLE_CLIENT_ID,
        'redirect_uri': settings.GOOGLE_REDIRECT_URI,
        'response_type': 'code',
        'scope': ' '.join(settings.GMAIL_OAUTH_SCOPES),
        'access_type': 'offline',
        'prompt': 'consent',
        'state': state,
    }
    return f'{GOOGLE_AUTH_URL}?{urllib.parse.urlencode(query)}'


def exchange_code_for_tokens(code: str) -> dict:
    payload = {
        'code': code,
        'client_id': settings.GOOGLE_CLIENT_ID,
        'client_secret': settings.GOOGLE_CLIENT_SECRET,
        'redirect_uri': settings.GOOGLE_REDIRECT_URI,
        'grant_type': 'authorization_code',
    }
    data = urllib.parse.urlencode(payload).encode('utf-8')
    request = urllib.request.Request(GOOGLE_TOKEN_URL, data=data, method='POST')
    with urllib.request.urlopen(request) as response:
        return json.loads(response.read().decode('utf-8'))


def refresh_access_token(refresh_token: str) -> dict:
    payload = {
        'client_id': settings.GOOGLE_CLIENT_ID,
        'client_secret': settings.GOOGLE_CLIENT_SECRET,
        'refresh_token': refresh_token,
        'grant_type': 'refresh_token',
    }
    data = urllib.parse.urlencode(payload).encode('utf-8')
    request = urllib.request.Request(GOOGLE_TOKEN_URL, data=data, method='POST')
    with urllib.request.urlopen(request) as response:
        return json.loads(response.read().decode('utf-8'))


def get_userinfo(access_token: str) -> dict:
    request = urllib.request.Request(
        GOOGLE_USERINFO_URL,
        headers={'Authorization': f'Bearer {access_token}'},
    )
    with urllib.request.urlopen(request) as response:
        return json.loads(response.read().decode('utf-8'))


def gmail_api_get(url: str, access_token: str, params: dict | None = None) -> dict:
    if params:
        url = f'{url}?{urllib.parse.urlencode(params, doseq=True)}'
    request = urllib.request.Request(
        url,
        headers={'Authorization': f'Bearer {access_token}'},
    )
    with urllib.request.urlopen(request) as response:
        return json.loads(response.read().decode('utf-8'))


def parse_gmail_headers(headers: list[dict]) -> dict:
    parsed = {}
    for header in headers:
        name = header.get('name', '').lower()
        value = header.get('value', '')
        if name:
            parsed[name] = value
    return parsed


def parse_rfc2822_datetime(raw_value: str | None) -> datetime | None:
    if not raw_value:
        return None
    try:
        from email.utils import parsedate_to_datetime

        dt = parsedate_to_datetime(raw_value)
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except Exception:
        return None


def compute_expiry(expires_in: int | None) -> datetime | None:
    if not expires_in:
        return None
    return datetime.now(timezone.utc) + timedelta(seconds=expires_in)
