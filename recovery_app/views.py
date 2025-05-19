from django.shortcuts import render, redirect
from django.contrib import messages
from django.conf import settings
from .models import Review, ServiceRequest
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.db import models

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

def contact(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        phone = request.POST.get('phone')
        email = request.POST.get('email', '')
        message = request.POST.get('message')

        # Создаем заявку
        service_request = ServiceRequest.objects.create(
            name=name,
            phone=phone,
            email=email,
            message=message
        )

        # Отправляем email администратору
        subject = 'Новая заявка на эвакуацию'
        html_message = render_to_string('email/service_request.html', {
            'service_request': service_request
        })
        
        try:
            send_mail(
                subject=subject,
                message='',
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[settings.EMAIL_HOST_USER],
                html_message=html_message,
                fail_silently=False,
            )
            messages.success(request, 'Ваша заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.')
        except Exception as e:
            messages.error(request, 'Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже.')
            print(f"Email error: {e}")

        return redirect('contact')

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
