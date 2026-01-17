import secrets
from datetime import datetime, timezone

from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.http import require_GET

from .gmail_client import (
    build_google_auth_url,
    compute_expiry,
    exchange_code_for_tokens,
    gmail_api_get,
    get_userinfo,
    parse_gmail_headers,
    parse_rfc2822_datetime,
    refresh_access_token,
)
from .models import EmailMessage, GmailAccount

User = get_user_model()


@require_GET
def google_login(request):
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        return JsonResponse(
            {'error': 'Missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET in env.'},
            status=400,
        )
    state = secrets.token_urlsafe(16)
    request.session['google_oauth_state'] = state
    return JsonResponse({'auth_url': build_google_auth_url(state)})


@require_GET
def login_page(request):
    return render(request, 'gmail_app/login.html')


@require_GET
def google_callback(request):
    code = request.GET.get('code')
    state = request.GET.get('state')
    if not code or not state:
        return JsonResponse({'error': 'Missing code or state.'}, status=400)
    if state != request.session.get('google_oauth_state'):
        return JsonResponse({'error': 'Invalid state.'}, status=400)

    token_data = exchange_code_for_tokens(code)
    access_token = token_data.get('access_token')
    refresh_token = token_data.get('refresh_token', '')
    expires_in = token_data.get('expires_in')
    if not access_token:
        return JsonResponse({'error': 'No access token returned.'}, status=400)

    userinfo = get_userinfo(access_token)
    email = userinfo.get('email')
    if not email:
        return JsonResponse({'error': 'No email returned.'}, status=400)

    user, _ = User.objects.get_or_create(username=email, defaults={'email': email})
    account, _ = GmailAccount.objects.get_or_create(user=user, email=email)
    account.access_token = access_token
    if refresh_token:
        account.refresh_token = refresh_token
    account.token_expiry = compute_expiry(expires_in)
    account.scope = token_data.get('scope', account.scope)
    account.save(update_fields=['access_token', 'refresh_token', 'token_expiry', 'scope'])

    request.session['gmail_account_id'] = account.id
    return render(
        request,
        'gmail_app/connected.html',
        {'email': email, 'emails_url': reverse('email-list-page')},
    )


def _ensure_access_token(account: GmailAccount) -> str:
    if account.token_expiry and account.token_expiry <= datetime.now(timezone.utc):
        if not account.refresh_token:
            raise RuntimeError('Refresh token missing.')
        refreshed = refresh_access_token(account.refresh_token)
        account.access_token = refreshed.get('access_token', account.access_token)
        account.token_expiry = compute_expiry(refreshed.get('expires_in'))
        account.save(update_fields=['access_token', 'token_expiry'])
    return account.access_token


@require_GET
def fetch_emails(request):
    account_id = request.session.get('gmail_account_id')
    if not account_id:
        return JsonResponse({'error': 'Not authenticated with Gmail.'}, status=401)

    account = GmailAccount.objects.filter(id=account_id).first()
    if not account:
        return JsonResponse({'error': 'Account not found.'}, status=404)

    access_token = _ensure_access_token(account)
    list_response = gmail_api_get(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages',
        access_token,
        params={'maxResults': 100},
    )
    messages = list_response.get('messages', [])

    stored = 0
    for message in messages:
        message_id = message.get('id')
        if not message_id:
            continue
        detail = gmail_api_get(
            f'https://gmail.googleapis.com/gmail/v1/users/me/messages/{message_id}',
            access_token,
            params={'format': 'full'},
        )
        payload = detail.get('payload', {})
        headers = parse_gmail_headers(payload.get('headers', []))
        subject = headers.get('subject', '')
        sender = headers.get('from', '')
        received_at = parse_rfc2822_datetime(headers.get('date'))
        existing = EmailMessage.objects.filter(gmail_message_id=message_id).first()
        if existing:
            needs_update = False
            if subject and existing.subject != subject:
                existing.subject = subject
                needs_update = True
            if sender and existing.sender != sender:
                existing.sender = sender
                needs_update = True
            if received_at and existing.received_at != received_at:
                existing.received_at = received_at
                needs_update = True
            if needs_update:
                existing.snippet = detail.get('snippet', existing.snippet)
                existing.raw_payload = detail
                existing.save(update_fields=['subject', 'sender', 'received_at', 'snippet', 'raw_payload'])
            continue

        EmailMessage.objects.create(
            account=account,
            gmail_message_id=message_id,
            thread_id=detail.get('threadId', ''),
            subject=subject,
            sender=sender,
            snippet=detail.get('snippet', ''),
            received_at=received_at,
            raw_payload=detail,
        )
        stored += 1

    return JsonResponse({'fetched': len(messages), 'stored': stored})


@require_GET
def email_list_page(request):
    account_id = request.session.get('gmail_account_id')
    if not account_id:
        return render(request, 'gmail_app/login_required.html', status=401)

    account = GmailAccount.objects.filter(id=account_id).first()
    if not account:
        return render(request, 'gmail_app/login_required.html', status=404)

    messages = EmailMessage.objects.filter(account=account).order_by('-received_at')[:5]
    return render(request, 'gmail_app/email_list.html', {'messages': messages})



# Create your views here.
