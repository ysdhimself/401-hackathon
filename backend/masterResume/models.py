from django.db import models
from django.urls import reverse


class MasterResume(models.Model):
    """Store master resume templates that can be tailored for specific applications."""
    
    # Basic info
    name = models.CharField(max_length=200, help_text="Name/version of this resume template")
    is_default = models.BooleanField(default=False, help_text="Set as default resume template")
    
    # Contact information
    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True)
    location = models.CharField(max_length=200, blank=True)
    linkedin_url = models.URLField(max_length=500, blank=True)
    portfolio_url = models.URLField(max_length=500, blank=True)
    github_url = models.URLField(max_length=500, blank=True)
    
    # Professional summary
    summary = models.TextField(blank=True, help_text="Professional summary or objective")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_default', '-updated_at']
    
    def __str__(self):
        default_marker = " (Default)" if self.is_default else ""
        return f"{self.name}{default_marker}"
    
    def save(self, *args, **kwargs):
        # If this resume is set as default, unset all other defaults
        if self.is_default:
            MasterResume.objects.filter(is_default=True).update(is_default=False)
        super().save(*args, **kwargs)


class ResumeSection(models.Model):
    """Flexible sections for resume content (education, experience, skills, etc.)."""
    
    SECTION_TYPE_CHOICES = [
        ('experience', 'Work Experience'),
        ('education', 'Education'),
        ('skills', 'Skills'),
        ('projects', 'Projects'),
        ('certifications', 'Certifications'),
        ('awards', 'Awards & Achievements'),
        ('custom', 'Custom Section'),
    ]
    
    resume = models.ForeignKey(
        MasterResume,
        on_delete=models.CASCADE,
        related_name='sections'
    )
    section_type = models.CharField(max_length=20, choices=SECTION_TYPE_CHOICES)
    section_title = models.CharField(max_length=200, help_text="Display title for this section")
    order = models.PositiveIntegerField(default=0, help_text="Order to display sections")
    
    class Meta:
        ordering = ['resume', 'order', 'id']
    
    def __str__(self):
        return f"{self.resume.name} - {self.section_title}"


class ResumeEntry(models.Model):
    """Individual entries within a section (e.g., a job, a degree, a skill)."""
    
    section = models.ForeignKey(
        ResumeSection,
        on_delete=models.CASCADE,
        related_name='entries'
    )
    
    # Generic fields that can be used flexibly
    title = models.CharField(max_length=300, blank=True, help_text="Job title, degree, skill name, etc.")
    organization = models.CharField(max_length=300, blank=True, help_text="Company, university, etc.")
    location = models.CharField(max_length=200, blank=True)
    start_date = models.CharField(max_length=100, blank=True, help_text="Can be flexible format")
    end_date = models.CharField(max_length=100, blank=True, help_text="Can be 'Present' or specific date")
    description = models.TextField(blank=True, help_text="Main description or bullet points")
    
    # Additional fields for flexibility
    link = models.URLField(max_length=500, blank=True, help_text="Link to project, certificate, etc.")
    technologies = models.CharField(max_length=500, blank=True, help_text="Technologies/tools used")
    
    order = models.PositiveIntegerField(default=0, help_text="Order within section")
    is_active = models.BooleanField(default=True, help_text="Include in resume")
    
    class Meta:
        ordering = ['section', 'order', '-start_date', 'id']
    
    def __str__(self):
        if self.title and self.organization:
            return f"{self.title} at {self.organization}"
        elif self.title:
            return self.title
        elif self.organization:
            return self.organization
        return f"Entry in {self.section.section_title}"
