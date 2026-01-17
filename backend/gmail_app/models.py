from django.conf import settings
from django.db import models


class GmailAccount(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='gmail_account',
    )
    email = models.EmailField(unique=True)
    access_token = models.TextField()
    refresh_token = models.TextField(blank=True)
    token_expiry = models.DateTimeField(null=True, blank=True)
    scope = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.email


class EmailMessage(models.Model):
    account = models.ForeignKey(
        GmailAccount,
        on_delete=models.CASCADE,
        related_name='messages',
    )
    gmail_message_id = models.CharField(max_length=128, unique=True)
    thread_id = models.CharField(max_length=128, blank=True)
    subject = models.CharField(max_length=255, blank=True)
    sender = models.CharField(max_length=255, blank=True)
    snippet = models.TextField(blank=True)
    received_at = models.DateTimeField(null=True, blank=True)
    raw_payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f'{self.subject or "No subject"} ({self.gmail_message_id})'


class JobApplicationEmail(models.Model):
    STATUS_APPLIED = 'applied'
    STATUS_INTERVIEW = 'interview'
    STATUS_OFFER = 'offer'
    STATUS_REJECTION = 'rejection'
    STATUS_OTHER = 'other'

    STATUS_CHOICES = [
        (STATUS_APPLIED, 'Applied'),
        (STATUS_INTERVIEW, 'Interview'),
        (STATUS_OFFER, 'Offer'),
        (STATUS_REJECTION, 'Rejection'),
        (STATUS_OTHER, 'Other'),
    ]

    message = models.OneToOneField(
        EmailMessage,
        on_delete=models.CASCADE,
        related_name='job_application',
    )
    company_name = models.CharField(max_length=255)
    position_title = models.CharField(max_length=255)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default=STATUS_APPLIED)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f'{self.company_name} - {self.position_title}'

