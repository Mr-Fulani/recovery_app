from django.shortcuts import render, redirect
from django.contrib import messages
from django.conf import settings
from .models import Review, ServiceRequest
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.db import models
from django.utils.html import strip_tags
from django.views.decorators.http import require_http_methods

def home(request):
    reviews = Review.objects.filter(is_approved=True)[:6]
    average_rating = Review.objects.filter(is_approved=True).aggregate(
        avg_rating=models.Avg('rating')
    )['avg_rating'] or 4.8
    
    context = {
        'reviews': reviews,
        'average_rating': round(average_rating, 1),
        'total_reviews': Review.objects.filter(is_approved=True).count(),
        'total_services': 5000,  # Это значение можно сделать динамическим
        'whatsapp_number': settings.WHATSAPP_NUMBER,
    }
    return render(request, 'home_page.html', context)

def services(request):
    context = {
        'whatsapp_number': settings.WHATSAPP_NUMBER,
    }
    return render(request, 'service_page.html', context)

@require_http_methods(["GET", "POST"])
def contact(request):
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

        # Отправка уведомления на email
        subject = 'Новая заявка на эвакуацию'
        html_message = render_to_string('email/service_request.html', {
            'service_request': service_request
        })
        plain_message = strip_tags(html_message)
        from_email = settings.DEFAULT_FROM_EMAIL
        to_email = settings.ADMIN_EMAIL

        send_mail(
            subject,
            plain_message,
            from_email,
            [to_email],
            html_message=html_message,
            fail_silently=False,
        )

        messages.success(request, 'Ваша заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.')
        return redirect('recovery_app:contact')

    context = {
        'whatsapp_number': settings.WHATSAPP_NUMBER,
    }
    return render(request, 'contact_page.html', context)

def reviews(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email', '')
        rating = request.POST.get('rating')
        text = request.POST.get('text')

        # Создаем отзыв
        Review.objects.create(
            name=name,
            email=email,
            rating=rating,
            text=text
        )

        messages.success(request, 'Спасибо за ваш отзыв! Он будет опубликован после проверки.')
        return redirect('reviews')

    reviews = Review.objects.filter(is_approved=True)
    context = {
        'reviews': reviews,
        'whatsapp_number': settings.WHATSAPP_NUMBER,
    }
    return render(request, 'reviews.html', context)
