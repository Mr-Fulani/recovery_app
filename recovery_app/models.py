# recovery_app/models.py
"""
Models for the recovery_app application.

Defines the HomePage model for Wagtail, and Review and ServiceRequest models for user feedback and service requests.
"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from wagtail.models import Page
from wagtail.fields import RichTextField
from wagtail.admin.panels import FieldPanel

class HomePage(Page):
    """
    A Wagtail Page model for the homepage, including an optional video field.
    """
    intro = RichTextField(blank=True, help_text="Вступительный текст для главной страницы")
    video = models.ForeignKey(
        'wagtailmedia.Media',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+',
        help_text="Видео для герой-секции"
    )

    content_panels = Page.content_panels + [
        FieldPanel('intro'),
        FieldPanel('video'),
    ]

class Review(models.Model):
    """
    A model to store customer reviews with name, email, rating, and text.
    """
    name = models.CharField('Имя', max_length=100)
    email = models.EmailField('Email', blank=True)
    rating = models.IntegerField(
        'Оценка',
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    text = models.TextField('Текст отзыва')
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    is_approved = models.BooleanField('Одобрен', default=False)

    class Meta:
        verbose_name = 'Отзыв'
        verbose_name_plural = 'Отзывы'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.rating}★"

class ServiceRequest(models.Model):
    """
    A model to store service requests with contact details and status.
    """
    STATUS_CHOICES = [
        ('new', 'Новая'),
        ('in_progress', 'В работе'),
        ('completed', 'Выполнена'),
        ('cancelled', 'Отменена'),
    ]

    name = models.CharField(max_length=100, verbose_name='Имя')
    phone = models.CharField(max_length=20, verbose_name='Телефон')
    email = models.EmailField(blank=True, null=True, verbose_name='Email')
    car_brand = models.CharField(max_length=100, verbose_name='Марка автомобиля', blank=True, null=True)
    message = models.TextField(verbose_name='Сообщение')
    status = models.CharField(
        'Статус',
        max_length=20,
        choices=STATUS_CHOICES,
        default='new'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)
    is_processed = models.BooleanField(default=False, verbose_name='Обработано')

    class Meta:
        verbose_name = 'Заявка на услугу'
        verbose_name_plural = 'Заявки на услуги'
        ordering = ['-created_at']

    def __str__(self):
        return f'Заявка от {self.name} ({self.created_at.strftime("%d.%m.%Y %H:%M")})'