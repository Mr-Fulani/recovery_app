# Сайт эвакуаторной службы

Веб-сайт для эвакуаторной службы с функциями заказа эвакуатора, отзывами и контактной информацией.

## Требования

- Python 3.8+
- Docker и Docker Compose
- PostgreSQL
- SMTP-сервер для отправки email

## Установка

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd recovery_site
```

2. Создайте файл `.env` на основе `.env.example` и заполните необходимые переменные окружения:
```bash
cp .env.example .env
```

3. Запустите проект с помощью Docker Compose:
```bash
docker-compose up -d
```

4. Примените миграции:
```bash
docker-compose exec web python manage.py migrate
```

5. Создайте суперпользователя:
```bash
docker-compose exec web python manage.py createsuperuser
```

## Настройка

### Переменные окружения

Создайте файл `.env` со следующими параметрами:

- `SECRET_KEY`: Секретный ключ Django
- `DEBUG`: Режим отладки (True/False)
- `ALLOWED_HOSTS`: Разрешенные хосты
- `DB_NAME`: Имя базы данных
- `DB_USER`: Пользователь базы данных
- `DB_PASSWORD`: Пароль базы данных
- `DB_HOST`: Хост базы данных
- `DB_PORT`: Порт базы данных
- `EMAIL_HOST`: SMTP-сервер
- `EMAIL_PORT`: Порт SMTP-сервера
- `EMAIL_USE_TLS`: Использовать TLS
- `EMAIL_HOST_USER`: Email для отправки
- `EMAIL_HOST_PASSWORD`: Пароль от email
- `GOOGLE_MAPS_API_KEY`: API ключ Google Maps
- `WHATSAPP_NUMBER`: Номер WhatsApp для связи

### Настройка Google Maps

1. Получите API ключ Google Maps в [Google Cloud Console](https://console.cloud.google.com)
2. Добавьте ключ в переменную окружения `GOOGLE_MAPS_API_KEY`

### Настройка Email

1. Настройте SMTP-сервер для отправки email
2. Добавьте учетные данные в переменные окружения

## Разработка

### Запуск в режиме разработки

```bash
docker-compose up
```

### Сбор статических файлов

```bash
docker-compose exec web python manage.py collectstatic
```

### Создание миграций

```bash
docker-compose exec web python manage.py makemigrations
```

### Применение миграций

```bash
docker-compose exec web python manage.py migrate
```

## Структура проекта

```
recovery_site/
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
├── .env.example
├── recovery_site/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
└── recovery_app/
    ├── models.py
    ├── views.py
    ├── urls.py
    ├── admin.py
    ├── static/
    │   └── recovery_app/
    │       ├── css/
    │       └── js/
    └── templates/
        └── recovery_app/
            ├── base.html
            ├── home_page.html
            ├── service_page.html
            ├── contact_page.html
            └── reviews.html
```

## Лицензия

MIT 