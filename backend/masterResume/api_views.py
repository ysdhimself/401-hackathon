from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
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
from .html_generator import generate_html_resume
from .parser import parse_resume_file


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

    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def parse(self, request):
        """Parse an uploaded resume and return extracted fields."""
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response(
                {'detail': 'No file uploaded. Please attach a file.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            parsed = parse_resume_file(uploaded_file)
            return Response(parsed)
        except ValueError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            return Response(
                {'detail': f'Failed to parse resume: {str(exc)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
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
    def html(self, request, pk=None):
        """Generate HTML preview of this resume."""
        resume = self.get_object()
        html_code = generate_html_resume(resume)
        
        return HttpResponse(html_code, content_type='text/html')
    
    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        """Generate and download PDF resume. Try LaTeX first, fallback to HTML."""
        resume = self.get_object()
        
        # Debug mode: return raw LaTeX/HTML instead of PDF
        if request.query_params.get('debug') == 'true':
            latex_code = generate_latex_resume(resume)
            html_code = generate_html_resume(resume)
            return Response({'latex': latex_code, 'html': html_code})
        
        # Try LaTeX first (better quality but prone to errors with special chars)
        try:
            latex_code = generate_latex_resume(resume)
            
            # LaTeX.Online only supports GET for raw text; for long resumes,
            # upload to a paste service and compile via the URL.
            if len(latex_code) > 2000:
                paste_response = requests.post(
                    'https://paste.rs',
                    data=latex_code.encode('utf-8'),
                    timeout=30
                )
                if paste_response.status_code not in (200, 201):
                    raise Exception('Failed to upload LaTeX to paste service')
                latex_url = paste_response.text.strip()
                api_url = f'https://latexonline.cc/compile?url={quote(latex_url)}'
            else:
                encoded_latex = quote(latex_code)
                api_url = f'https://latexonline.cc/compile?text={encoded_latex}'

            response = requests.get(api_url, timeout=60)
            
            # Check if compilation succeeded
            if response.status_code == 200 and 'application/pdf' in response.headers.get('content-type', ''):
                pdf_content = response.content
                
                http_response = HttpResponse(pdf_content, content_type='application/pdf')
                
                # Check if download parameter is present
                if request.query_params.get('download') == 'true':
                    http_response['Content-Disposition'] = f'attachment; filename="{resume.name.replace(" ", "_")}.pdf"'
                else:
                    # Inline display for preview
                    http_response['Content-Disposition'] = f'inline; filename="{resume.name.replace(" ", "_")}.pdf"'
                
                return http_response
            else:
                # LaTeX failed, try HTML fallback
                raise Exception(f'LaTeX compilation failed: {response.text[:200]}')
        
        except Exception as latex_error:
            # Fallback to HTML + xhtml2pdf (more forgiving, Windows-compatible)
            try:
                from xhtml2pdf import pisa
                import io
                
                html_code = generate_html_resume(resume)
                pdf_buffer = io.BytesIO()
                
                # Convert HTML to PDF
                pisa_status = pisa.CreatePDF(html_code, dest=pdf_buffer)
                
                if pisa_status.err:
                    raise Exception('HTML to PDF conversion failed')
                
                pdf_content = pdf_buffer.getvalue()
                
                http_response = HttpResponse(pdf_content, content_type='application/pdf')
                
                if request.query_params.get('download') == 'true':
                    http_response['Content-Disposition'] = f'attachment; filename="{resume.name.replace(" ", "_")}.pdf"'
                else:
                    http_response['Content-Disposition'] = f'inline; filename="{resume.name.replace(" ", "_")}.pdf"'
                
                return http_response
            
            except Exception as html_error:
                return Response(
                    {
                        'error': 'PDF generation failed',
                        'latex_error': str(latex_error)[:200],
                        'html_error': str(html_error)[:200]
                    },
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
