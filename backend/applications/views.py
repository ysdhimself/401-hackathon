from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import (
    ListView, DetailView, CreateView, UpdateView, DeleteView, TemplateView
)
from django.urls import reverse_lazy
from django.db.models import Q, Count
from django.contrib import messages
from datetime import date, timedelta

from .models import JobApplication, ApplicationNote
from .forms import (
    JobApplicationForm, QuickApplicationForm,
    ApplicationNoteForm, ApplicationFilterForm
)


class DashboardView(TemplateView):
    template_name = 'applications/dashboard.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        today = date.today()

        # Statistics
        applications = JobApplication.objects.all()
        context['total_applications'] = applications.count()
        status_counts = dict(
            applications.values_list('status').annotate(count=Count('status'))
        )
        context['status_counts'] = status_counts
        context['applied_count'] = status_counts.get('applied', 0)
        context['interviewing_count'] = (
            status_counts.get('phone_screen', 0) +
            status_counts.get('interview', 0) +
            status_counts.get('technical', 0) +
            status_counts.get('onsite', 0)
        )
        context['offers_count'] = (
            status_counts.get('offered', 0) +
            status_counts.get('accepted', 0)
        )

        # Recent applications (last 7 days)
        week_ago = today - timedelta(days=7)
        context['recent_applications'] = applications.filter(
            date_applied__gte=week_ago
        ).order_by('-date_applied')[:5]

        # Pending follow-ups
        follow_ups = []
        for app in applications.filter(follow_up_date__isnull=False):
            if app.needs_follow_up:
                follow_ups.append(app)
        context['pending_followups'] = sorted(
            follow_ups,
            key=lambda x: (not x.is_overdue, x.follow_up_date)
        )
        context['followup_count'] = len(follow_ups)

        # Quick add form
        context['quick_form'] = QuickApplicationForm()

        return context

    def post(self, request, *args, **kwargs):
        form = QuickApplicationForm(request.POST)
        if form.is_valid():
            application = form.save()
            messages.success(request, f'Application for {application.position_title} at {application.company_name} created!')
            return redirect('applications:application_detail', pk=application.pk)
        context = self.get_context_data(**kwargs)
        context['quick_form'] = form
        return self.render_to_response(context)


class ApplicationListView(ListView):
    model = JobApplication
    template_name = 'applications/application_list.html'
    context_object_name = 'applications'
    paginate_by = 20

    def get_queryset(self):
        queryset = JobApplication.objects.all()

        # Search
        search = self.request.GET.get('search', '')
        if search:
            queryset = queryset.filter(
                Q(company_name__icontains=search) |
                Q(position_title__icontains=search)
            )

        # Status filter
        status = self.request.GET.get('status', '')
        if status:
            queryset = queryset.filter(status=status)

        # Job type filter
        job_type = self.request.GET.get('job_type', '')
        if job_type:
            queryset = queryset.filter(job_type=job_type)

        # Work location filter
        work_location_type = self.request.GET.get('work_location_type', '')
        if work_location_type:
            queryset = queryset.filter(work_location_type=work_location_type)

        # Date range filter
        date_from = self.request.GET.get('date_from', '')
        if date_from:
            queryset = queryset.filter(date_applied__gte=date_from)

        date_to = self.request.GET.get('date_to', '')
        if date_to:
            queryset = queryset.filter(date_applied__lte=date_to)

        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['filter_form'] = ApplicationFilterForm(self.request.GET)
        return context


class ApplicationDetailView(DetailView):
    model = JobApplication
    template_name = 'applications/application_detail.html'
    context_object_name = 'application'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['notes'] = self.object.application_notes.all()
        context['note_form'] = ApplicationNoteForm()
        return context

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        form = ApplicationNoteForm(request.POST)
        if form.is_valid():
            note = form.save(commit=False)
            note.application = self.object
            note.save()
            messages.success(request, 'Note added successfully!')
            return redirect('applications:application_detail', pk=self.object.pk)
        context = self.get_context_data(**kwargs)
        context['note_form'] = form
        return self.render_to_response(context)


class ApplicationCreateView(CreateView):
    model = JobApplication
    form_class = JobApplicationForm
    template_name = 'applications/application_form.html'

    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(
            self.request,
            f'Application for {self.object.position_title} at {self.object.company_name} created!'
        )
        return response


class ApplicationUpdateView(UpdateView):
    model = JobApplication
    form_class = JobApplicationForm
    template_name = 'applications/application_form.html'

    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, 'Application updated successfully!')
        return response


class ApplicationDeleteView(DeleteView):
    model = JobApplication
    template_name = 'applications/application_confirm_delete.html'
    success_url = reverse_lazy('applications:application_list')

    def form_valid(self, form):
        messages.success(
            self.request,
            f'Application for {self.object.position_title} at {self.object.company_name} deleted.'
        )
        return super().form_valid(form)


class FollowUpListView(ListView):
    template_name = 'applications/followup_list.html'
    context_object_name = 'applications'

    def get_queryset(self):
        today = date.today()
        applications = JobApplication.objects.filter(follow_up_date__isnull=False)
        follow_ups = []
        for app in applications:
            if app.needs_follow_up:
                follow_ups.append(app)
        return sorted(follow_ups, key=lambda x: (not x.is_overdue, x.follow_up_date))


def delete_note(request, pk, note_pk):
    """Delete a note from an application."""
    application = get_object_or_404(JobApplication, pk=pk)
    note = get_object_or_404(ApplicationNote, pk=note_pk, application=application)
    if request.method == 'POST':
        note.delete()
        messages.success(request, 'Note deleted.')
    return redirect('applications:application_detail', pk=pk)
