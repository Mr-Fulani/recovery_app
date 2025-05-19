from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _

class Review(models.Model):
    name = models.CharField(_('Имя'), max_length=100)
    email = models.EmailField(_('Email'), blank=True)
    rating = models.IntegerField(
        _('Оценка'),
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    text = models.TextField(_('Текст отзыва'))
    created_at = models.DateTimeField(_('Дата создания'), auto_now_add=True)
    is_approved = models.BooleanField(_('Одобрен'), default=False)

    class Meta:
        verbose_name = _('Отзыв')
        verbose_name_plural = _('Отзывы')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.rating}★"

class ServiceRequest(models.Model):
    STATUS_CHOICES = [
        ('new', _('Новая')),
        ('in_progress', _('В работе')),
        ('completed', _('Выполнена')),
        ('cancelled', _('Отменена')),
    ]

    name = models.CharField(max_length=100, verbose_name='Имя')
    phone = models.CharField(max_length=20, verbose_name='Телефон')
    email = models.EmailField(blank=True, null=True, verbose_name='Email')
    car_brand = models.CharField(max_length=100, verbose_name='Марка автомобиля', blank=True, null=True)
    message = models.TextField(verbose_name='Сообщение')
    status = models.CharField(
        _('Статус'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='new'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(_('Дата обновления'), auto_now=True)
    is_processed = models.BooleanField(default=False, verbose_name='Обработано')

    class Meta:
        verbose_name = 'Заявка на услугу'
        verbose_name_plural = 'Заявки на услуги'
        ordering = ['-created_at']

    def __str__(self):
        return f'Заявка от {self.name} ({self.created_at.strftime("%d.%m.%Y %H:%M")})'
