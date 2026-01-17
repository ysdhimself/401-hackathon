from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import JobApplicationViewSet, ApplicationNoteViewSet

router = DefaultRouter()
router.register(r'applications', JobApplicationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('applications/<int:application_pk>/notes/',
         ApplicationNoteViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('applications/<int:application_pk>/notes/<int:pk>/',
         ApplicationNoteViewSet.as_view({'delete': 'destroy'})),
]
