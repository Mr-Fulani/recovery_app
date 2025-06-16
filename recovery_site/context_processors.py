from django.conf import settings

def footer_context(request):
    return {
        'whatsapp_number': settings.WHATSAPP_NUMBER,
        'tel_number': settings.TEL_NUMBER,
        'support_email': settings.SUPPORT_EMAIL,
        'facebook_url': settings.FACEBOOK_URL,
        'instagram_url': settings.INSTAGRAM_URL,
        'twitter_url': settings.TWITTER_URL,
        'google_analytics_id': settings.GOOGLE_ANALYTICS_ID,
        'yandex_metrica_id': settings.YANDEX_METRICA_ID,
        'site_domain': settings.SITE_DOMAIN,
        'canonical_url': settings.CANONICAL_URL,
    }