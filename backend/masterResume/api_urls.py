from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import MasterResumeViewSet, ResumeSectionViewSet, ResumeEntryViewSet

router = DefaultRouter()
router.register(r'resumes', MasterResumeViewSet, basename='masterresume')

urlpatterns = [
    path('', include(router.urls)),
    # Nested routes for sections
    path('resumes/<int:resume_pk>/sections/',
         ResumeSectionViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('resumes/<int:resume_pk>/sections/<int:pk>/',
         ResumeSectionViewSet.as_view({'get': 'retrieve', 'put': 'update', 
                                        'patch': 'partial_update', 'delete': 'destroy'})),
    # Nested routes for entries
    path('sections/<int:section_pk>/entries/',
         ResumeEntryViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('sections/<int:section_pk>/entries/<int:pk>/',
         ResumeEntryViewSet.as_view({'get': 'retrieve', 'put': 'update', 
                                      'patch': 'partial_update', 'delete': 'destroy'})),
]
