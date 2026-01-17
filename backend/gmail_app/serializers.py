from rest_framework import serializers
from .models import GmailAccount, EmailMessage, JobApplicationEmail


class GmailAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = GmailAccount
        fields = ['id', 'email', 'created_at']


class EmailMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailMessage
        fields = ['id', 'gmail_message_id', 'thread_id', 'subject', 'sender', 'snippet', 'received_at']


class JobApplicationEmailSerializer(serializers.ModelSerializer):
    message = EmailMessageSerializer(read_only=True)

    class Meta:
        model = JobApplicationEmail
        fields = '__all__'
