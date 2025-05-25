"""
Signal handlers for the recovery_app application.
"""
# Temporarily disabled for debugging
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.cache import cache
from .models import Review

@receiver(post_save, sender=Review, dispatch_uid="clear_cache_on_review_save")
def clear_cache_on_review_save(sender, instance, created, **kwargs):
    if created:
        print(f"Clearing cache for new review {instance.id}")
        cache.delete_pattern('*homepage_section*')
        cache.delete_pattern('*reviews_stats*')