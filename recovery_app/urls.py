from django.urls import path
from . import views

app_name = 'recovery_app'

urlpatterns = [
    path('', views.home, name='home'),
    path('services/', views.services, name='services'),
    path('services/car-towing/', views.car_towing, name='car_towing'),
    path('services/roadside-assistance/', views.roadside_assistance, name='roadside_assistance'),
    path('services/motorcycle-towing/', views.motorcycle_towing, name='motorcycle_towing'),
    path('contact/', views.contact, name='contact'),
    path('reviews/', views.reviews, name='reviews'),
    path('gallery/', views.gallery, name='gallery'),
    path('sitemap.xml', views.sitemap, name='sitemap'),
    path('robots.txt', views.robots_txt, name='robots_txt'),
] 