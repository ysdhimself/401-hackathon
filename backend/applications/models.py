from django.db import models
from django.urls import reverse
from datetime import date, timedelta


class JobApplication(models.Model):
    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('phone_screen', 'Screening'),
        ('interview', 'Interview'),
        ('technical', 'Technical Interview'),
        ('onsite', 'On-site Interview'),
        ('offered', 'Offered'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn'),
    ]

    JOB_TYPE_CHOICES = [
        ('full_time', 'Full-time'),
        ('part_time', 'Part-time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
        ('freelance', 'Freelance'),
    ]

    WORK_LOCATION_CHOICES = [
        ('remote', 'Remote'),
        ('onsite', 'On-site'),
        ('hybrid', 'Hybrid'),
    ]

    # Basic info
    company_name = models.CharField(max_length=200)
    position_title = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    date_applied = models.DateField(default=date.today)

    # Job details
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, default='full_time')
    job_description = models.TextField(blank=True)
    job_url = models.URLField(max_length=500, blank=True)
    location = models.CharField(max_length=200, blank=True)
    work_location_type = models.CharField(
        max_length=20,
        choices=WORK_LOCATION_CHOICES,
        default='onsite'
    )

    # Salary info
    salary_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    # Contact info
    contact_name = models.CharField(max_length=200, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=50, blank=True)

    # Follow-up
    follow_up_date = models.DateField(null=True, blank=True)
    reminder_days_before = models.PositiveIntegerField(default=1)

    # Additional info
    notes = models.TextField(blank=True)
    resume_version = models.CharField(max_length=100, blank=True)
    cover_letter_sent = models.BooleanField(default=False)
    
    # Link to master resume (for tailored resumes)
    master_resume = models.ForeignKey(
        'masterResume.MasterResume',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='applications',
        help_text="Master resume this application's resume was based on"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_applied', '-created_at']

    def __str__(self):
        return f"{self.position_title} at {self.company_name}"

    def get_absolute_url(self):
        return reverse('applications:application_detail', kwargs={'pk': self.pk})

    @property
    def reminder_date(self):
        """Date when reminder should start showing."""
        if self.follow_up_date:
            return self.follow_up_date - timedelta(days=self.reminder_days_before)
        return None

    @property
    def needs_follow_up(self):
        """Check if this application needs follow-up based on reminder settings."""
        if self.follow_up_date and self.reminder_date:
            return date.today() >= self.reminder_date
        return False

    @property
    def is_overdue(self):
        """Check if the follow-up date has passed."""
        if self.follow_up_date:
            return date.today() > self.follow_up_date
        return False

    @property
    def salary_range(self):
        """Return formatted salary range."""
        if self.salary_min and self.salary_max:
            return f"${self.salary_min:,.0f} - ${self.salary_max:,.0f}"
        elif self.salary_min:
            return f"${self.salary_min:,.0f}+"
        elif self.salary_max:
            return f"Up to ${self.salary_max:,.0f}"
        return None


class ApplicationNote(models.Model):
    application = models.ForeignKey(
        JobApplication,
        on_delete=models.CASCADE,
        related_name='application_notes'
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Note for {self.application} - {self.created_at.strftime('%Y-%m-%d')}"
