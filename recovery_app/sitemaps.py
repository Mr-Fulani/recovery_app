# recovery_app/sitemaps.py
from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from .models import Review, ServiceRequest, WorkPhoto, HomePage # Импортируем ваши модели, если они нужны в Sitemap



class StaticViewSitemap(Sitemap):
    priority = 0.8
    changefreq = 'weekly'

    def items(self):
        # Возвращаем имена URL-путей для статических страниц
        return ['recovery_app:home', 'recovery_app:services', 'recovery_app:reviews', 'recovery_app:contact']

    def location(self, item):
        # Возвращаем фактический URL для каждого имени URL-пути
        return reverse(item)


class HomePageSitemap(Sitemap):
    priority = 1.0 # Главная страница имеет самый высокий приоритет
    changefreq = 'daily' # Главная страница может меняться чаще

    def items(self):
        return HomePage.objects.live()

    def location(self, obj):
        return obj.get_full_url() # Wagtail Pages имеют метод get_full_url()



# Если вы хотите включить другие динамические страницы, например, отдельные отзывы
# class ReviewSitemap(Sitemap):
#     changefreq = "monthly"
#     priority = 0.6
#
#     def items(self):
#         return Review.objects.filter(is_approved=True)
#
#     def lastmod(self, obj):
#         return obj.created_at # Если у вас есть поле даты изменения