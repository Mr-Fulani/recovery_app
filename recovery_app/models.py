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

    name = models.CharField(_('Имя'), max_length=100)
    phone = models.CharField(_('Телефон'), max_length=20)
    email = models.EmailField(_('Email'), blank=True)
    message = models.TextField(_('Сообщение'))
    status = models.CharField(
        _('Статус'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='new'
    )
    created_at = models.DateTimeField(_('Дата создания'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Дата обновления'), auto_now=True)

    class Meta:
        verbose_name = _('Заявка на эвакуацию')
        verbose_name_plural = _('Заявки на эвакуацию')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.get_status_display()}"
