from django.contrib import admin
from .models import JobApplication, ApplicationNote


class ApplicationNoteInline(admin.TabularInline):
    model = ApplicationNote
    extra = 1


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = [
        'company_name',
        'position_title',
        'status',
        'date_applied',
        'follow_up_date',
        'location',
    ]
    list_filter = [
        'status',
        'job_type',
        'work_location_type',
        'date_applied',
    ]
    search_fields = [
        'company_name',
        'position_title',
        'location',
        'notes',
    ]
    date_hierarchy = 'date_applied'
    ordering = ['-date_applied']
    inlines = [ApplicationNoteInline]

    fieldsets = (
        ('Basic Information', {
            'fields': ('company_name', 'position_title', 'status', 'date_applied')
        }),
        ('Job Details', {
            'fields': ('job_type', 'job_description', 'job_url', 'location', 'work_location_type')
        }),
        ('Salary', {
            'fields': ('salary_min', 'salary_max'),
            'classes': ('collapse',)
        }),
        ('Contact Information', {
            'fields': ('contact_name', 'contact_email', 'contact_phone'),
            'classes': ('collapse',)
        }),
        ('Follow-up', {
            'fields': ('follow_up_date', 'reminder_days_before')
        }),
        ('Additional Info', {
            'fields': ('notes', 'resume_version', 'cover_letter_sent'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ApplicationNote)
class ApplicationNoteAdmin(admin.ModelAdmin):
    list_display = ['application', 'created_at']
    list_filter = ['created_at']
    search_fields = ['content', 'application__company_name', 'application__position_title']
