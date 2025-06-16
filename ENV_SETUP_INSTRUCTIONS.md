# Настройка переменных окружения (.env файл)

Создайте файл `.env` в корневой директории проекта и добавьте следующие переменные:

## Основные настройки Django
```bash
SECRET_KEY=django-insecure-your-secret-key-here
DEBUG=True
```

## Настройки базы данных
```bash
DB_NAME=recovery_db
DB_USER=recovery_user
DB_PASSWORD=recovery_password
DB_HOST=db
DB_PORT=5432
```

## Настройки email
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_ADMIN=admin@yourdomain.com
SUPPORT_EMAIL=support@yourdomain.com
```

## Контактная информация
```bash
WHATSAPP_NUMBER=+449999999999
TEL_NUMBER=+449999999999
```

## Социальные сети
```bash
FACEBOOK_URL=https://facebook.com/yourpage
INSTAGRAM_URL=https://instagram.com/yourpage
TWITTER_URL=https://twitter.com/yourpage
```

## Google Services
```bash
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## 🔥 АНАЛИТИКА - ЗАМЕНИТЕ НА ВАШИ РЕАЛЬНЫЕ ID:

### Google Analytics
```bash
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```
**Где получить:**
1. Зайдите в [Google Analytics](https://analytics.google.com/)
2. Создайте аккаунт и ресурс для вашего сайта
3. Скопируйте ID измерения (начинается с G-)

### Yandex Metrica
```bash
YANDEX_METRICA_ID=12345678
```
**Где получить:**
1. Зайдите в [Яндекс.Метрику](https://metrica.yandex.ru/)
2. Добавьте счетчик для вашего сайта
3. Скопируйте номер счетчика (только цифры)

## 🌐 SEO настройки
```bash
SITE_DOMAIN=yourdomain.com
CANONICAL_URL=https://yourdomain.com
```
**Замените на:**
- `SITE_DOMAIN` - ваш домен без https://
- `CANONICAL_URL` - полный URL вашего сайта с https://

## Redis Cache
```bash
REDIS_URL=redis://127.0.0.1:6379/1
```

---

## ⚠️ ВАЖНО:
1. **Никогда не коммитьте .env файл в git!**
2. **Замените все placeholder значения на реальные**
3. **Для продакшена установите DEBUG=False**

## Пример готового .env файла:
```bash
# Django Settings
SECRET_KEY=django-insecure-your-real-secret-key-here
DEBUG=False

# Database Settings
DB_NAME=recovery_db
DB_USER=recovery_user
DB_PASSWORD=your-strong-password
DB_HOST=localhost
DB_PORT=5432

# Email Settings
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=info@dynamixrecovery.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_ADMIN=admin@dynamixrecovery.com
SUPPORT_EMAIL=support@dynamixrecovery.com

# Contact Information
WHATSAPP_NUMBER=+447123456789
TEL_NUMBER=+447123456789

# Social Media URLs
FACEBOOK_URL=https://facebook.com/dynamixrecovery
INSTAGRAM_URL=https://instagram.com/dynamixrecovery
TWITTER_URL=https://twitter.com/dynamixrecovery

# Google Services
GOOGLE_MAPS_API_KEY=AIzaSyC4R6AN7SmxxdKVQjQjQOBXOr-JL_Kx_Co

# Analytics Tracking IDs
GOOGLE_ANALYTICS_ID=G-ABC123DEF4
YANDEX_METRICA_ID=87654321

# SEO Settings
SITE_DOMAIN=dynamixrecovery.com
CANONICAL_URL=https://dynamixrecovery.com

# Redis Cache
REDIS_URL=redis://127.0.0.1:6379/1
``` 