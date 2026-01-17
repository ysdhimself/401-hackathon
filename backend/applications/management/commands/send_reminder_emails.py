from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from datetime import date

from applications.models import JobApplication


class Command(BaseCommand):
    help = 'Send reminder emails for applications with upcoming follow-ups'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            help='Email address to send reminders to (required)',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Print what would be sent without actually sending emails',
        )

    def handle(self, *args, **options):
        email = options.get('email')
        dry_run = options.get('dry_run', False)

        if not email and not dry_run:
            self.stderr.write(
                self.style.ERROR('Please provide an email address with --email or use --dry-run')
            )
            return

        # Get all applications that need follow-up
        applications = JobApplication.objects.filter(follow_up_date__isnull=False)
        follow_ups = []

        for app in applications:
            if app.needs_follow_up:
                follow_ups.append(app)

        if not follow_ups:
            self.stdout.write(self.style.SUCCESS('No follow-up reminders to send.'))
            return

        # Sort by overdue first, then by follow-up date
        follow_ups.sort(key=lambda x: (not x.is_overdue, x.follow_up_date))

        overdue = [app for app in follow_ups if app.is_overdue]
        upcoming = [app for app in follow_ups if not app.is_overdue]

        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN - No emails will be sent\n'))
            self.stdout.write(f'Would send {len(follow_ups)} reminder(s):\n')

            if overdue:
                self.stdout.write(self.style.ERROR(f'\nOVERDUE ({len(overdue)}):'))
                for app in overdue:
                    self.stdout.write(f'  - {app.position_title} at {app.company_name}')
                    self.stdout.write(f'    Follow-up was due: {app.follow_up_date}')

            if upcoming:
                self.stdout.write(self.style.WARNING(f'\nUPCOMING ({len(upcoming)}):'))
                for app in upcoming:
                    self.stdout.write(f'  - {app.position_title} at {app.company_name}')
                    self.stdout.write(f'    Follow-up date: {app.follow_up_date}')

            return

        # Prepare email context
        context = {
            'applications': follow_ups,
            'overdue': overdue,
            'upcoming': upcoming,
            'today': date.today(),
        }

        # Render email templates
        subject = f'Job Application Reminders - {len(follow_ups)} follow-up(s) needed'
        html_message = render_to_string('applications/emails/reminder_email.html', context)
        text_message = render_to_string('applications/emails/reminder_email.txt', context)

        try:
            send_mail(
                subject=subject,
                message=text_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                html_message=html_message,
            )
            self.stdout.write(
                self.style.SUCCESS(f'Successfully sent {len(follow_ups)} reminder(s) to {email}')
            )
        except Exception as e:
            self.stderr.write(
                self.style.ERROR(f'Failed to send email: {str(e)}')
            )
