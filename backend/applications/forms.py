from django import forms
from .models import JobApplication, ApplicationNote


class JobApplicationForm(forms.ModelForm):
    class Meta:
        model = JobApplication
        fields = [
            'company_name',
            'position_title',
            'status',
            'date_applied',
            'job_type',
            'job_description',
            'job_url',
            'location',
            'work_location_type',
            'salary_min',
            'salary_max',
            'contact_name',
            'contact_email',
            'contact_phone',
            'follow_up_date',
            'reminder_days_before',
            'notes',
            'resume_version',
            'cover_letter_sent',
        ]
        widgets = {
            'date_applied': forms.DateInput(attrs={'type': 'date'}),
            'follow_up_date': forms.DateInput(attrs={'type': 'date'}),
            'job_description': forms.Textarea(attrs={'rows': 4}),
            'notes': forms.Textarea(attrs={'rows': 4}),
            'salary_min': forms.NumberInput(attrs={'step': '0.01', 'min': '0'}),
            'salary_max': forms.NumberInput(attrs={'step': '0.01', 'min': '0'}),
        }

    def clean(self):
        cleaned_data = super().clean()
        salary_min = cleaned_data.get('salary_min')
        salary_max = cleaned_data.get('salary_max')

        if salary_min and salary_max and salary_min > salary_max:
            raise forms.ValidationError(
                "Minimum salary cannot be greater than maximum salary."
            )

        return cleaned_data


class QuickApplicationForm(forms.ModelForm):
    """Simplified form for quick entry from dashboard."""
    class Meta:
        model = JobApplication
        fields = [
            'company_name',
            'position_title',
            'job_url',
            'status',
            'date_applied',
        ]
        widgets = {
            'date_applied': forms.DateInput(attrs={'type': 'date'}),
        }


class ApplicationNoteForm(forms.ModelForm):
    class Meta:
        model = ApplicationNote
        fields = ['content']
        widgets = {
            'content': forms.Textarea(attrs={'rows': 3, 'placeholder': 'Add a note...'}),
        }


class ApplicationFilterForm(forms.Form):
    """Form for filtering applications list."""
    STATUS_CHOICES = [('', 'All Statuses')] + list(JobApplication.STATUS_CHOICES)
    JOB_TYPE_CHOICES = [('', 'All Job Types')] + list(JobApplication.JOB_TYPE_CHOICES)
    WORK_LOCATION_CHOICES = [('', 'All Locations')] + list(JobApplication.WORK_LOCATION_CHOICES)

    search = forms.CharField(required=False, widget=forms.TextInput(attrs={
        'placeholder': 'Search company or position...',
    }))
    status = forms.ChoiceField(choices=STATUS_CHOICES, required=False)
    job_type = forms.ChoiceField(choices=JOB_TYPE_CHOICES, required=False)
    work_location_type = forms.ChoiceField(choices=WORK_LOCATION_CHOICES, required=False)
    date_from = forms.DateField(required=False, widget=forms.DateInput(attrs={'type': 'date'}))
    date_to = forms.DateField(required=False, widget=forms.DateInput(attrs={'type': 'date'}))
