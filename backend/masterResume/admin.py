from django.contrib import admin
from .models import MasterResume, ResumeSection, ResumeEntry


class ResumeEntryInline(admin.TabularInline):
    model = ResumeEntry
    extra = 1
    fields = ['title', 'organization', 'start_date', 'end_date', 'order', 'is_active']


class ResumeSectionInline(admin.StackedInline):
    model = ResumeSection
    extra = 1
    fields = ['section_type', 'section_title', 'order']
    show_change_link = True


@admin.register(MasterResume)
class MasterResumeAdmin(admin.ModelAdmin):
    list_display = ['name', 'full_name', 'email', 'is_default', 'created_at', 'updated_at']
    list_filter = ['is_default', 'created_at']
    search_fields = ['name', 'full_name', 'email']
    inlines = [ResumeSectionInline]
    
    fieldsets = (
        ('Resume Info', {
            'fields': ('name', 'is_default')
        }),
        ('Contact Information', {
            'fields': ('full_name', 'email', 'phone', 'location', 
                      'linkedin_url', 'portfolio_url', 'github_url')
        }),
        ('Professional Summary', {
            'fields': ('summary',)
        }),
    )


@admin.register(ResumeSection)
class ResumeSectionAdmin(admin.ModelAdmin):
    list_display = ['section_title', 'resume', 'section_type', 'order']
    list_filter = ['section_type', 'resume']
    search_fields = ['section_title', 'resume__name']
    inlines = [ResumeEntryInline]


@admin.register(ResumeEntry)
class ResumeEntryAdmin(admin.ModelAdmin):
    list_display = ['title', 'organization', 'section', 'start_date', 'end_date', 'order', 'is_active']
    list_filter = ['is_active', 'section__section_type']
    search_fields = ['title', 'organization', 'description']
    list_editable = ['order', 'is_active']
