from django.urls import path

from . import views

urlpatterns = [
    path('', views.login_page, name='login-page'),
    path('auth/google/login', views.google_login, name='google-login'),
    path('auth/google/callback', views.google_callback, name='google-callback'),
    path('emails/page', views.email_list_page, name='email-list-page'),
    path('emails/fetch', views.fetch_emails, name='fetch-emails'),
]
