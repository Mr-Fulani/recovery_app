from django.conf import settings

def footer_context(request):
    return {
        'whatsapp_number': settings.WHATSAPP_NUMBER,
        'support_email': settings.SUPPORT_EMAIL,
        'facebook_url': settings.FACEBOOK_URL,
        'instagram_url': settings.INSTAGRAM_URL,
        'twitter_url': settings.TWITTER_URL,
    }