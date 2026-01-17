from django.urls import path
from . import views

app_name = 'applications'

urlpatterns = [
    path('', views.DashboardView.as_view(), name='dashboard'),
    path('applications/', views.ApplicationListView.as_view(), name='application_list'),
    path('applications/new/', views.ApplicationCreateView.as_view(), name='application_create'),
    path('applications/<int:pk>/', views.ApplicationDetailView.as_view(), name='application_detail'),
    path('applications/<int:pk>/edit/', views.ApplicationUpdateView.as_view(), name='application_update'),
    path('applications/<int:pk>/delete/', views.ApplicationDeleteView.as_view(), name='application_delete'),
    path('applications/<int:pk>/notes/<int:note_pk>/delete/', views.delete_note, name='delete_note'),
    path('follow-ups/', views.FollowUpListView.as_view(), name='followup_list'),
]
