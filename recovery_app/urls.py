from django.urls import path
from . import views

app_name = 'recovery_app'

urlpatterns = [
    path('', views.home, name='home'),
    path('services/', views.services, name='services'),
    path('contact/', views.contact, name='contact'),
    path('reviews/', views.reviews, name='reviews'),
] 