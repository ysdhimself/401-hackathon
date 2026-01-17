from rest_framework import serializers
from .models import MasterResume, ResumeSection, ResumeEntry


class ResumeEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeEntry
        fields = [
            'id', 'title', 'organization', 'location', 'start_date', 
            'end_date', 'description', 'link', 'technologies', 
            'order', 'is_active'
        ]


class ResumeSectionSerializer(serializers.ModelSerializer):
    entries = ResumeEntrySerializer(many=True, read_only=True)
    section_type_display = serializers.CharField(source='get_section_type_display', read_only=True)
    
    class Meta:
        model = ResumeSection
        fields = [
            'id', 'section_type', 'section_type_display', 
            'section_title', 'order', 'entries'
        ]


class MasterResumeListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list views."""
    section_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MasterResume
        fields = [
            'id', 'name', 'full_name', 'email', 'is_default', 
            'created_at', 'updated_at', 'section_count'
        ]
    
    def get_section_count(self, obj):
        return obj.sections.count()


class MasterResumeDetailSerializer(serializers.ModelSerializer):
    """Full serializer for detail/create/update views."""
    sections = ResumeSectionSerializer(many=True, read_only=True)
    
    class Meta:
        model = MasterResume
        fields = [
            'id', 'name', 'is_default', 'full_name', 'email', 'phone', 
            'location', 'linkedin_url', 'portfolio_url', 'github_url', 
            'summary', 'sections', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ResumeSectionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating sections."""
    
    class Meta:
        model = ResumeSection
        fields = ['id', 'resume', 'section_type', 'section_title', 'order']


class ResumeEntryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating entries."""
    
    class Meta:
        model = ResumeEntry
        fields = [
            'id', 'section', 'title', 'organization', 'location', 
            'start_date', 'end_date', 'description', 'link', 
            'technologies', 'order', 'is_active'
        ]
