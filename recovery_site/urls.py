# recovery_site/urls.py
"""
URL configuration for recovery_site project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
"""
from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from wagtail import urls as wagtail_urls
from wagtail.admin import urls as wagtail_admin_urls
from wagtail.documents import urls as wagtaildocs_urls

from django.contrib.sitemaps.views import sitemap # Импортируем sitemap view

# Импортируем наши Sitemaps
from recovery_app.sitemaps import StaticViewSitemap, HomePageSitemap
# from recovery_app.sitemaps import ReviewSitemap # Если будете использовать

from django.views.generic import TemplateView






sitemaps = {
    'static': StaticViewSitemap,
    'wagtail_pages': HomePageSitemap,
}

urlpatterns = []

if settings.DEBUG:
    import debug_toolbar
    print("Debug Toolbar URLs included")  # Отладочный вывод
    urlpatterns += [
        path('__debug__/', include(debug_toolbar.urls)),
    ]

urlpatterns += [
    path('admin/', admin.site.urls),
    path('wagtail/', include(wagtail_admin_urls)),
    path('documents/', include(wagtaildocs_urls)),
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='django.contrib.sitemaps.views.sitemap'),
    path('robots.txt', TemplateView.as_view(template_name="robots.txt", content_type="text/plain")),
    path('', include('recovery_app.urls')),
    path('', include(wagtail_urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)