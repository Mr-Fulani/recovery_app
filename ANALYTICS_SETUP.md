# Настройка аналитики для сайта эвакуатора

## Обзор событий отслеживания

Ваш сайт теперь отслеживает следующие события:

### 🎯 Основные конверсии
1. **service_request_submitted** - Заявка на эвакуацию отправлена
2. **contact_form_submitted** - Форма контакта отправлена  
3. **phone_call** - Клик по номеру телефона
4. **whatsapp_click** - Клик по WhatsApp
5. **review_form_submitted** - Отзыв отправлен

### 📊 Взаимодействие с формами
1. **form_started** - Пользователь начал заполнять форму
2. **form_field_completed** - Поле формы заполнено
3. **review_form_started** - Начало заполнения формы отзыва
4. **review_rating_selected** - Выбрана оценка в отзыве

### 👁️ Просмотры и навигация
1. **service_page_view** - Просмотр страницы услуги
2. **gallery_image_view** - Просмотр изображения в галерее
3. **navigation_click** - Клик по навигации
4. **service_cta_clicked** - Клик по кнопке призыва к действию

### 📈 Вовлеченность
1. **scroll_depth** - Глубина прокрутки (25%, 50%, 75%, 100%)
2. **time_on_page** - Время на странице
3. **page_loaded** - Загрузка страницы

## 🔧 Настройка Google Analytics 4

### Шаг 1: Создание пользовательских событий

В Google Analytics 4 перейдите в **Admin > Events > Create Event**:

1. **Главная конверсия - Заявки на эвакуацию**
   - Event name: `service_request_conversion`
   - Conditions: `event_name equals service_request_submitted`
   - Mark as conversion: ✅

2. **Звонки**
   - Event name: `phone_conversion`
   - Conditions: `event_name equals phone_call`
   - Mark as conversion: ✅

3. **WhatsApp**
   - Event name: `whatsapp_conversion`
   - Conditions: `event_name equals whatsapp_click`
   - Mark as conversion: ✅

### Шаг 2: Настройка аудиторий

**Admin > Audiences > New Audience**:

1. **Заинтересованные в услугах**
   - Condition: Event `service_page_view` in last 30 days
   - Membership duration: 30 days

2. **Активные пользователи форм**
   - Condition: Event `form_started` in last 7 days
   - Membership duration: 7 days

3. **Потенциальные клиенты**
   - Condition: Event `scroll_depth` >= 50% AND `time_on_page` > 60 seconds
   - Membership duration: 30 days

### Шаг 3: Custom Dimensions

**Admin > Custom Definitions > Custom Dimensions**:

1. **Service Type** - `custom_parameter_1`
2. **User Action** - `custom_parameter_2`

## 🎯 Настройка Яндекс.Метрики

### Шаг 1: Создание целей

В Яндекс.Метрике перейдите в **Настройки > Цели**:

1. **Заявка на эвакуацию**
   - Тип: JavaScript-событие
   - Идентификатор: `service_request_submitted`
   - Ценность: 1000 руб.

2. **Звонок**
   - Тип: JavaScript-событие
   - Идентификатор: `phone_call`
   - Ценность: 500 руб.

3. **WhatsApp**
   - Тип: JavaScript-событие
   - Идентификатор: `whatsapp_click`
   - Ценность: 300 руб.

4. **Отзыв**
   - Тип: JavaScript-событие
   - Идентификатор: `review_form_submitted`
   - Ценность: 100 руб.

5. **Просмотр услуг**
   - Тип: JavaScript-событие
   - Идентификатор: `service_page_view`
   - Ценность: 50 руб.

### Шаг 2: Составные цели

1. **Качественный лид**
   - Условие: `form_started` И `scroll_depth` (75%+)
   - Ценность: 800 руб.

2. **Горячий лид**
   - Условие: `service_page_view` И `phone_call` за одну сессию
   - Ценность: 1500 руб.

## 📊 Сегменты для анализа

### Google Analytics
1. **Пользователи с конверсиями**: Event `service_request_submitted` > 0
2. **Мобильные пользователи**: Device Category = mobile
3. **Высокое вовлечение**: Session duration > 2 minutes AND Pages per session > 3

### Яндекс.Метрика
1. **Заинтересованные**: Просмотрели 2+ страницы услуг
2. **Готовые к заказу**: Начали заполнять форму
3. **Постоянные клиенты**: Вернулись в течение 30 дней

## 📈 Ключевые отчеты для мониторинга

### Ежедневно
- Количество заявок (`service_request_submitted`)
- Количество звонков (`phone_call`)  
- Количество WhatsApp кликов (`whatsapp_click`)

### Еженедельно
- Конверсия по источникам трафика
- Качество лидов (заполненность полей формы)
- Популярность услуг (просмотры страниц)

### Ежемесячно
- ROI по каналам привлечения
- Анализ пути пользователя до конверсии
- Сезонность по типам услуг

## 🎛️ Настройка уведомлений

### Google Analytics
**Admin > Intelligence events**:
- Резкое снижение конверсий (>25%)
- Аномальный всплеск трафика
- Падение времени на сайте

### Яндекс.Метрика
**Настройки > Уведомления**:
- Цели: уведомления при снижении на 20%
- Трафик: уведомления при изменении на 30%
- Технические ошибки на сайте

## 🔍 A/B тестирование

### Рекомендуемые тесты:
1. **Форма заявки**: короткая vs подробная
2. **CTA кнопки**: разные тексты и цвета
3. **Страницы услуг**: разные структуры контента
4. **Виджеты контактов**: позиционирование и дизайн

## 🚀 Дополнительные возможности

### Enhanced E-commerce (если планируете)
- Стоимость услуг как продукты
- Процесс заказа как воронка
- Отслеживание отмен и возвратов

### Интеграция с CRM
- Передача событий в вашу CRM систему
- Синхронизация конверсий с реальными продажами
- Расчет lifetime value клиентов

---

## 🛠️ Техническая информация

### Отладка событий
Откройте консоль браузера (F12) для просмотра отправляемых событий.
Все события логируются с префиксом "Analytics Event Sent:".

### Проверка работы
1. **Google Analytics**: Real-time > Events
2. **Яндекс.Метрика**: Онлайн > События

### Коды событий для настройки
```javascript
// Пример ручной отправки события
trackEvent('custom_event', {
    category: 'Custom',
    label: 'Test Event',
    custom1: 'test',
    custom2: 'manual',
    value: 1
});
```

Система аналитики полностью настроена и готова к работе! 🎉 