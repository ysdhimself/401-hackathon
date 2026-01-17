from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
import requests
from urllib.parse import quote
import tempfile
import os
from .models import MasterResume, ResumeSection, ResumeEntry
from .serializers import (
    MasterResumeListSerializer,
    MasterResumeDetailSerializer,
    ResumeSectionSerializer,
    ResumeSectionCreateSerializer,
    ResumeEntrySerializer,
    ResumeEntryCreateSerializer,
)
from .latex_generator import generate_latex_resume


class MasterResumeViewSet(viewsets.ModelViewSet):
    queryset = MasterResume.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return MasterResumeListSerializer
        return MasterResumeDetailSerializer
    
    @action(detail=False, methods=['get'])
    def default(self, request):
        """Get the default master resume."""
        default_resume = MasterResume.objects.filter(is_default=True).first()
        if not default_resume:
            return Response(
                {'detail': 'No default resume set'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = MasterResumeDetailSerializer(default_resume)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Create a copy of a resume for tailoring."""
        original = self.get_object()
        
        # Create new resume with modified name
        duplicate = MasterResume.objects.create(
            name=f"{original.name} (Copy)",
            is_default=False,
            full_name=original.full_name,
            email=original.email,
            phone=original.phone,
            location=original.location,
            linkedin_url=original.linkedin_url,
            portfolio_url=original.portfolio_url,
            github_url=original.github_url,
            summary=original.summary,
        )
        
        # Copy all sections and entries
        for section in original.sections.all():
            new_section = ResumeSection.objects.create(
                resume=duplicate,
                section_type=section.section_type,
                section_title=section.section_title,
                order=section.order,
            )
            
            for entry in section.entries.all():
                ResumeEntry.objects.create(
                    section=new_section,
                    title=entry.title,
                    organization=entry.organization,
                    location=entry.location,
                    start_date=entry.start_date,
                    end_date=entry.end_date,
                    description=entry.description,
                    link=entry.link,
                    technologies=entry.technologies,
                    order=entry.order,
                    is_active=entry.is_active,
                )
        
        serializer = MasterResumeDetailSerializer(duplicate)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def latex(self, request, pk=None):
        """Generate LaTeX code for this resume."""
        resume = self.get_object()
        latex_code = generate_latex_resume(resume)
        
        # Return as downloadable .tex file
        response = HttpResponse(latex_code, content_type='text/plain')
        response['Content-Disposition'] = f'attachment; filename="{resume.name.replace(" ", "_")}.tex"'
        return response
    
    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        """Generate and download PDF resume using LaTeX.Online API."""
        resume = self.get_object()
        latex_code = generate_latex_resume(resume)
        
        try:
            # Use LaTeX.Online API with text parameter
            # URL encode the LaTeX content
            encoded_latex = quote(latex_code)
            api_url = f'https://latexonline.cc/compile?text={encoded_latex}'
            
            response = requests.get(api_url, timeout=60)
            
            # Check if compilation succeeded
            if response.status_code == 200 and 'application/pdf' in response.headers.get('content-type', ''):
                pdf_content = response.content
                
                http_response = HttpResponse(pdf_content, content_type='application/pdf')
                http_response['Content-Disposition'] = f'attachment; filename="{resume.name.replace(" ", "_")}.pdf"'
                return http_response
            else:
                return Response(
                    {
                        'error': 'PDF generation failed',
                        'details': response.text[:500] if response.text else 'Unknown error',
                        'status_code': response.status_code
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        except requests.Timeout:
            return Response(
                {'error': 'PDF generation timed out'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except requests.RequestException as e:
            return Response(
                {'error': f'PDF generation failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            return Response(
                {'error': f'Unexpected error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ResumeSectionViewSet(viewsets.ModelViewSet):
    queryset = ResumeSection.objects.all()
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ResumeSectionCreateSerializer
        return ResumeSectionSerializer
    
    def get_queryset(self):
        resume_pk = self.kwargs.get('resume_pk')
        if resume_pk:
            return self.queryset.filter(resume_id=resume_pk)
        return self.queryset


class ResumeEntryViewSet(viewsets.ModelViewSet):
    queryset = ResumeEntry.objects.all()
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ResumeEntryCreateSerializer
        return ResumeEntrySerializer
    
    def get_queryset(self):
        section_pk = self.kwargs.get('section_pk')
        if section_pk:
            return self.queryset.filter(section_id=section_pk)
        return self.queryset
