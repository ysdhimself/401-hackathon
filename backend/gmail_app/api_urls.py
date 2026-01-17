from django.urls import path
from . import api_views

urlpatterns = [
    path('status/', api_views.gmail_status, name='api-gmail-status'),
    path('auth/init/', api_views.gmail_auth_init, name='api-gmail-auth-init'),
    path('auth/callback/', api_views.gmail_auth_callback, name='api-gmail-auth-callback'),
    path('emails/', api_views.gmail_emails, name='api-gmail-emails'),
    path('emails/fetch/', api_views.gmail_fetch_emails, name='api-gmail-fetch'),
    path('disconnect/', api_views.gmail_disconnect, name='api-gmail-disconnect'),
]
