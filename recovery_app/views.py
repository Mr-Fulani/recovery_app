# recovery_app/views.py
"""
Views for the recovery_app application.

Handles rendering of the homepage with Wagtail HomePage, services, reviews, and contact form with email notifications.
"""
from django.shortcuts import render, redirect
from django.contrib import messages
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.http import HttpResponse
from django.db import models
from django.utils.html import strip_tags
from django.views.decorators.http import require_http_methods
from wagtail.models import Page
from .models import Review, ServiceRequest, WorkPhoto, HomePage
from django.views.decorators.cache import cache_page, cache_control
from django.views.decorators.vary import vary_on_cookie
from django.core.cache import cache

def get_cache_key(view_name, *args, **kwargs):
    """Generate a cache key for a view."""
    return f"view_{view_name}_{args}_{kwargs}"

def get_slider_context(limit_photos=6):
    """
    Get common slider context for all pages.
    """
    home_page = HomePage.objects.live().first()
    work_photos = WorkPhoto.objects.filter(is_published=True)
    if limit_photos:
        work_photos = work_photos[:limit_photos]
    
    return {
        'slider_video': home_page.video if home_page else None,
        'slider_video_mobile': home_page.video_mobile if home_page else None,
        'slider_work_photos': work_photos,
    }

@cache_page(settings.CACHE_TIMEOUTS['home_page'])
@vary_on_cookie
def home(request):
    """
    Render the homepage using Wagtail's HomePage model and display reviews, statistics, and work photos.
    """
    page = HomePage.objects.live().first()
    reviews = Review.objects.filter(is_approved=True)[:3]  # Limit to 3 reviews
    work_photos = WorkPhoto.objects.filter(is_published=True)[:6]  # Limit to 6 photos
    average_rating = Review.objects.filter(is_approved=True).aggregate(
        avg_rating=models.Avg('rating')
    )['avg_rating'] or 4.8

    context = {
        'page': page,
        'reviews': reviews,
        'work_photos': work_photos,
        'average_rating': round(average_rating, 1),
        'total_reviews': Review.objects.filter(is_approved=True).count(),
        'total_services': 1000,
        'whatsapp_number': settings.WHATSAPP_NUMBER,
    }
    
    # Add slider context
    context.update(get_slider_context())
    
    return render(request, 'home_page.html', context)

@cache_page(settings.CACHE_TIMEOUTS['static_content'])
def services(request):
    """
    Render the services page.
    """
    context = {
        'whatsapp_number': settings.WHATSAPP_NUMBER,
    }
    
    # Add slider context
    context.update(get_slider_context())
    
    return render(request, 'service_page.html', context)

@require_http_methods(["GET", "POST"])
def contact(request):
    """
    Handle the contact form submission, save service request, and send email notification.
    """
    if request.method == 'POST':
        name = request.POST.get('name')
        phone = request.POST.get('phone')
        email = request.POST.get('email')
        car_brand = request.POST.get('car_brand')
        message = request.POST.get('message')
        
        # New optional fields
        pickup_location = request.POST.get('pickup_location')
        destination = request.POST.get('destination')
        service_type = request.POST.get('service_type')
        urgency = request.POST.get('urgency', 'medium')
        preferred_time = request.POST.get('preferred_time')

        service_request = ServiceRequest.objects.create(
            name=name,
            phone=phone,
            email=email,
            car_brand=car_brand,
            message=message,
            pickup_location=pickup_location,
            destination=destination,
            service_type=service_type,
            urgency=urgency,
            preferred_time=preferred_time,
        )

        # Send email notification
        subject = 'New Evacuation Request'
        html_message = render_to_string('email/service_request.html', {
            'service_request': service_request
        })
        plain_message = strip_tags(html_message)
        from_email = settings.DEFAULT_FROM_EMAIL
        to_email = settings.SUPPORT_EMAIL

        send_mail(
            subject,
            plain_message,
            from_email,
            [to_email],
            html_message=html_message,
            fail_silently=False,
        )

        # Invalidate relevant caches
        cache.delete_pattern('view_home_*')
        cache.delete_pattern('view_services_*')

        messages.success(request, 'Your request has been successfully submitted! We will contact you shortly.')
        return redirect('recovery_app:home')

    context = {
        'whatsapp_number': settings.WHATSAPP_NUMBER,
    }
    
    # Add slider context
    context.update(get_slider_context())
    
    return render(request, 'contact_page.html', context)

@cache_page(settings.CACHE_TIMEOUTS['dynamic_content'])
@vary_on_cookie
def reviews(request):
    """
    Handle review submission and render the reviews page with approved reviews.
    """
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email', '')
        rating = request.POST.get('rating')
        text = request.POST.get('text')

        # Create review
        Review.objects.create(
            name=name,
            email=email,
            rating=rating,
            text=text
        )

        # Invalidate relevant caches
        cache.delete_pattern('view_home_*')
        cache.delete_pattern('view_reviews_*')

        messages.success(request, 'Thank you for your review! It will be published after moderation.')
        return redirect('recovery_app:reviews')

    reviews = Review.objects.filter(is_approved=True)

    # Add these lines to calculate and pass statistics to the reviews template
    average_rating = reviews.aggregate(
        avg_rating=models.Avg('rating')
    )['avg_rating'] or 4.8  # Use 4.8 as default if no reviews yet

    total_reviews_count = reviews.count()

    # Assuming total_services is a fixed number or retrieved similarly to home page
    total_services_completed = 1000  # Or fetch from your Service model if it's dynamic

    context = {
        'reviews': reviews,
        'whatsapp_number': settings.WHATSAPP_NUMBER,
        'average_rating': round(average_rating, 1),  # Round to one decimal place
        'total_reviews': total_reviews_count,
        'total_services': total_services_completed,
    }
    
    # Add slider context
    context.update(get_slider_context())
    
    return render(request, 'reviews.html', context)

@cache_page(settings.CACHE_TIMEOUTS['static_content'])
def gallery(request):
    """
    Render the gallery page with all work photos and videos.
    """
    work_photos = WorkPhoto.objects.filter(is_published=True).order_by('-created_at')
    
    # Разделяем на фото и видео если нужно
    photos_with_images = work_photos.filter(image__isnull=False)
    
    context = {
        'work_photos': work_photos,
        'photos_with_images': photos_with_images,
        'total_photos': work_photos.count(),
        'whatsapp_number': settings.WHATSAPP_NUMBER,
    }
    
    # Add slider context without photo limit for gallery
    context.update(get_slider_context(limit_photos=None))
    
    return render(request, 'gallery.html', context)

def sitemap(request):
    """
    Generate XML sitemap for SEO.
    """
    context = {
        'request': request,
    }
    return render(request, 'sitemap.xml', context, content_type='application/xml')

def robots_txt(request):
    """
    Generate robots.txt for SEO.
    """
    lines = [
        "User-agent: *",
        "Allow: /",
        "Sitemap: {}/sitemap.xml".format(request.build_absolute_uri('/')[:-1]),
    ]
    return HttpResponse("\n".join(lines), content_type="text/plain")