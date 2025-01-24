from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api import EventViewSet
from . import views
from django.contrib.auth import views as auth_views
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse

@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({'detail': 'CSRF cookie set'})

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event-api')

urlpatterns = [
    path('', views.index, name='index'),
    path('api/', include(router.urls)),
    path('add_person/', views.add_person, name='add_person'),
    path('events/', views.get_events, name='get_events'),
    path('api/persons/', views.get_persons, name='get_persons'),
    path('api/save-resource-order/', views.save_resource_order, name='save_resource_order'),
    path('api/get-resource-order/', views.get_resource_order, name='get_resource_order'),
    path('accounts/login/', auth_views.LoginView.as_view(), name='login'),
    path('api/csrf/', get_csrf_token, name='csrf')
]

# urlpatterns = [
#     path('', views.index, name='index'),
# ]