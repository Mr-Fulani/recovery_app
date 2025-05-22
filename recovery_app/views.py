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
from django.db import models
from django.utils.html import strip_tags
from django.views.decorators.http import require_http_methods
from wagtail.models import Page
from .models import Review, ServiceRequest, WorkPhoto, HomePage
# Add import for caching
from django.views.decorators.cache import cache_page


@cache_page(60 * 15)  # Cache the page for 15 minutes (60 seconds * 15)
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
    return render(request, 'home_page.html', context)


def services(request):
    """
    Render the services page.
    """
    context = {
        'whatsapp_number': settings.WHATSAPP_NUMBER,
    }
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

        service_request = ServiceRequest.objects.create(
            name=name,
            phone=phone,
            email=email,
            car_brand=car_brand,
            message=message
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

        messages.success(request, 'Your request has been successfully submitted! We will contact you shortly.')
        return redirect('recovery_app:contact')

    context = {
        'whatsapp_number': settings.WHATSAPP_NUMBER,
    }
    return render(request, 'contact_page.html', context)


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
    return render(request, 'reviews.html', context)