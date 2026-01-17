from rest_framework import serializers
from .models import JobApplication, ApplicationNote


class ApplicationNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationNote
        fields = ['id', 'content', 'created_at']
        read_only_fields = ['created_at']


class JobApplicationListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list views."""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    job_type_display = serializers.CharField(source='get_job_type_display', read_only=True)
    work_location_type_display = serializers.CharField(source='get_work_location_type_display', read_only=True)
    needs_follow_up = serializers.BooleanField(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            'id', 'company_name', 'position_title', 'status', 'status_display',
            'date_applied', 'job_type', 'job_type_display', 'location',
            'work_location_type', 'work_location_type_display', 'job_description',
            'follow_up_date', 'needs_follow_up', 'is_overdue', 'master_resume'
        ]


class JobApplicationDetailSerializer(serializers.ModelSerializer):
    """Full serializer for detail/create/update views."""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    job_type_display = serializers.CharField(source='get_job_type_display', read_only=True)
    work_location_type_display = serializers.CharField(source='get_work_location_type_display', read_only=True)
    application_notes = ApplicationNoteSerializer(many=True, read_only=True)
    salary_range = serializers.CharField(read_only=True)
    needs_follow_up = serializers.BooleanField(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = JobApplication
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, data):
        salary_min = data.get('salary_min')
        salary_max = data.get('salary_max')
        if salary_min and salary_max and salary_min > salary_max:
            raise serializers.ValidationError({
                'salary_max': 'Maximum salary cannot be less than minimum salary.'
            })
        return data


class DashboardStatsSerializer(serializers.Serializer):
    total_applications = serializers.IntegerField()
    applied_count = serializers.IntegerField()
    interviewing_count = serializers.IntegerField()
    offers_count = serializers.IntegerField()
    status_counts = serializers.DictField()
