from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters import rest_framework as filters
from django.db.models import Count
from datetime import date, timedelta

from .models import JobApplication, ApplicationNote
from .serializers import (
    JobApplicationListSerializer,
    JobApplicationDetailSerializer,
    ApplicationNoteSerializer,
    DashboardStatsSerializer,
)


class JobApplicationFilter(filters.FilterSet):
    date_from = filters.DateFilter(field_name='date_applied', lookup_expr='gte')
    date_to = filters.DateFilter(field_name='date_applied', lookup_expr='lte')

    class Meta:
        model = JobApplication
        fields = ['status', 'job_type', 'work_location_type']


class JobApplicationViewSet(viewsets.ModelViewSet):
    queryset = JobApplication.objects.all()
    filterset_class = JobApplicationFilter
    search_fields = ['company_name', 'position_title', 'location']
    ordering_fields = ['date_applied', 'created_at', 'company_name', 'status']
    ordering = ['-date_applied']

    def get_serializer_class(self):
        if self.action == 'list':
            return JobApplicationListSerializer
        return JobApplicationDetailSerializer

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get dashboard statistics."""
        applications = JobApplication.objects.all()
        status_counts = dict(
            applications.values_list('status').annotate(count=Count('status'))
        )

        data = {
            'total_applications': applications.count(),
            'applied_count': status_counts.get('applied', 0),
            'interviewing_count': sum([
                status_counts.get('phone_screen', 0),
                status_counts.get('interview', 0),
                status_counts.get('technical', 0),
                status_counts.get('onsite', 0),
            ]),
            'offers_count': sum([
                status_counts.get('offered', 0),
                status_counts.get('accepted', 0),
            ]),
            'status_counts': status_counts,
        }
        return Response(DashboardStatsSerializer(data).data)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent applications (last 7 days)."""
        week_ago = date.today() - timedelta(days=7)
        recent = self.queryset.filter(date_applied__gte=week_ago)[:5]
        serializer = JobApplicationListSerializer(recent, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def follow_ups(self, request):
        """Get applications needing follow-up."""
        applications = self.queryset.filter(follow_up_date__isnull=False)
        follow_ups = [app for app in applications if app.needs_follow_up]
        follow_ups.sort(key=lambda x: (not x.is_overdue, x.follow_up_date))
        serializer = JobApplicationListSerializer(follow_ups, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_note(self, request, pk=None):
        """Add a note to an application."""
        application = self.get_object()
        serializer = ApplicationNoteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(application=application)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ApplicationNoteViewSet(viewsets.ModelViewSet):
    queryset = ApplicationNote.objects.all()
    serializer_class = ApplicationNoteSerializer

    def get_queryset(self):
        application_pk = self.kwargs.get('application_pk')
        if application_pk:
            return self.queryset.filter(application_id=application_pk)
        return self.queryset
