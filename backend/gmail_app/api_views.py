import secrets
import json
from datetime import datetime, timezone

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
from django.shortcuts import render
from django.contrib.auth import get_user_model

from .gmail_client import (
    build_google_auth_url,
    compute_expiry,
    exchange_code_for_tokens,
    get_userinfo,
    gmail_api_get,
    parse_gmail_headers,
    parse_rfc2822_datetime,
    refresh_access_token,
)
from .models import GmailAccount, EmailMessage
from .serializers import GmailAccountSerializer, EmailMessageSerializer

User = get_user_model()


def _ensure_access_token(account: GmailAccount) -> str:
    """Refresh access token if expired."""
    if account.token_expiry and account.token_expiry <= datetime.now(timezone.utc):
        if not account.refresh_token:
            raise RuntimeError('Refresh token missing.')
        refreshed = refresh_access_token(account.refresh_token)
        account.access_token = refreshed.get('access_token', account.access_token)
        account.token_expiry = compute_expiry(refreshed.get('expires_in'))
        account.save(update_fields=['access_token', 'token_expiry'])
    return account.access_token


@api_view(['GET'])
def gmail_status(request):
    """Check if user has connected Gmail."""
    account_id = request.session.get('gmail_account_id')
    if not account_id:
        return Response({'connected': False})

    account = GmailAccount.objects.filter(id=account_id).first()
    if not account:
        return Response({'connected': False})

    return Response({
        'connected': True,
        'account': GmailAccountSerializer(account).data
    })


@api_view(['GET'])
def gmail_auth_init(request):
    """Initialize Gmail OAuth flow - returns auth URL for popup."""
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        return Response(
            {'error': 'Gmail integration not configured'},
            status=status.HTTP_400_BAD_REQUEST
        )

    state = secrets.token_urlsafe(16)
    request.session['google_oauth_state'] = state
    return Response({'auth_url': build_google_auth_url(state)})


def gmail_auth_callback(request):
    """Handle OAuth callback - renders HTML that posts message to parent window."""
    code = request.GET.get('code')
    state = request.GET.get('state')
    error = request.GET.get('error')

    if error:
        return render(request, 'gmail_app/oauth_popup.html', {
            'success': False,
            'error': error,
        })

    if not code or state != request.session.get('google_oauth_state'):
        return render(request, 'gmail_app/oauth_popup.html', {
            'success': False,
            'error': 'Invalid state or missing code',
        })

    try:
        token_data = exchange_code_for_tokens(code)
        access_token = token_data.get('access_token')
        refresh_token = token_data.get('refresh_token', '')
        expires_in = token_data.get('expires_in')

        if not access_token:
            return render(request, 'gmail_app/oauth_popup.html', {
                'success': False,
                'error': 'No access token returned',
            })

        userinfo = get_userinfo(access_token)
        email = userinfo.get('email')

        if not email:
            return render(request, 'gmail_app/oauth_popup.html', {
                'success': False,
                'error': 'No email returned',
            })

        user, _ = User.objects.get_or_create(username=email, defaults={'email': email})
        account, _ = GmailAccount.objects.get_or_create(user=user, email=email)
        account.access_token = access_token
        if refresh_token:
            account.refresh_token = refresh_token
        account.token_expiry = compute_expiry(expires_in)
        account.scope = token_data.get('scope', account.scope)
        account.save(update_fields=['access_token', 'refresh_token', 'token_expiry', 'scope'])

        request.session['gmail_account_id'] = account.id

        return render(request, 'gmail_app/oauth_popup.html', {
            'success': True,
            'email': email,
        })

    except Exception as e:
        return render(request, 'gmail_app/oauth_popup.html', {
            'success': False,
            'error': str(e),
        })


@api_view(['POST'])
def gmail_fetch_emails(request):
    """Fetch emails from Gmail API."""
    account_id = request.session.get('gmail_account_id')
    if not account_id:
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

    account = GmailAccount.objects.filter(id=account_id).first()
    if not account:
        return Response({'error': 'Account not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
        access_token = _ensure_access_token(account)
    except RuntimeError as e:
        return Response({'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)

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

        # Skip if already exists
        if EmailMessage.objects.filter(gmail_message_id=message_id).exists():
            continue

        detail = gmail_api_get(
            f'https://gmail.googleapis.com/gmail/v1/users/me/messages/{message_id}',
            access_token,
            params={'format': 'full'},
        )

        payload = detail.get('payload', {})
        headers = parse_gmail_headers(payload.get('headers', []))

        EmailMessage.objects.create(
            account=account,
            gmail_message_id=message_id,
            thread_id=detail.get('threadId', ''),
            subject=headers.get('subject', ''),
            sender=headers.get('from', ''),
            snippet=detail.get('snippet', ''),
            received_at=parse_rfc2822_datetime(headers.get('date')),
            raw_payload=detail,
        )
        stored += 1

    return Response({'fetched': len(messages), 'stored': stored})


@api_view(['GET'])
def gmail_emails(request):
    """Get stored emails."""
    account_id = request.session.get('gmail_account_id')
    if not account_id:
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

    messages = EmailMessage.objects.filter(
        account_id=account_id
    ).order_by('-received_at')[:50]

    return Response(EmailMessageSerializer(messages, many=True).data)


@api_view(['POST'])
def gmail_disconnect(request):
    """Disconnect Gmail account."""
    if 'gmail_account_id' in request.session:
        del request.session['gmail_account_id']
    return Response({'status': 'disconnected'})
