/**
 * Analytics Events Tracking Module
 * Отслеживание событий для Google Analytics и Яндекс.Метрики
 */

class AnalyticsTracker {
    constructor() {
        this.isGoogleAnalyticsLoaded = typeof gtag !== 'undefined';
        this.isYandexMetricaLoaded = typeof ym !== 'undefined';
        this.yandexMetricaId = this.getYandexMetricaId();
        
        console.log('AnalyticsTracker initialized:', {
            gtagLoaded: this.isGoogleAnalyticsLoaded,
            ymLoaded: this.isYandexMetricaLoaded,
            ymId: this.yandexMetricaId
        });
        
        this.init();
    }

    /**
     * Получить ID Яндекс.Метрики из DOM
     */
    getYandexMetricaId() {
        const scripts = document.getElementsByTagName('script');
        for (let script of scripts) {
            if (script.innerHTML.includes('ym(') && script.innerHTML.includes(', "init"')) {
                const match = script.innerHTML.match(/ym\((\d+),/);
                return match ? match[1] : null;
            }
        }
        return null;
    }

    /**
     * Инициализация отслеживания
     */
    init() {
        this.trackPhoneCalls();
        this.trackWhatsAppClicks();
        this.trackFormSubmissions();
        this.trackServiceViews();
        this.trackGalleryInteractions();
        this.trackScrollDepth();
        this.trackNavigationClicks();
        this.trackTimeOnPage();
        
        // Отправляем событие загрузки страницы
        this.sendEvent('page_loaded', {
            category: 'Page Load',
            label: this.getCurrentServiceType(),
            custom1: 'page_load',
            custom2: window.location.pathname
        });
        
        // Отправляем тестовое событие для проверки работы
        setTimeout(() => {
            this.sendEvent('analytics_test', {
                category: 'Test',
                label: 'Analytics Test Event',
                custom1: 'test',
                custom2: 'working',
                value: 1
            });
        }, 2000);
    }

    /**
     * Универсальный метод отправки события
     */
    sendEvent(eventName, eventData = {}) {
        const defaultData = {
            page_url: window.location.href,
            page_title: document.title,
            timestamp: new Date().toISOString()
        };

        const finalData = { ...defaultData, ...eventData };

        // Google Analytics 4
        if (this.isGoogleAnalyticsLoaded) {
            gtag('event', eventName, {
                category: finalData.category || 'User Interaction',
                label: finalData.label || '',
                value: finalData.value || 0,
                custom1: finalData.custom1 || '',
                custom2: finalData.custom2 || '',
                page_location: finalData.page_url,
                page_title: finalData.page_title,
                // Добавляем дополнительные параметры для лучшего отслеживания
                service_type: finalData.custom1 || '',
                urgency: finalData.custom2 || '',
                page_path: window.location.pathname,
                timestamp: finalData.timestamp
            });
        }

        // Яндекс.Метрика
        if (this.isYandexMetricaLoaded && this.yandexMetricaId) {
            ym(this.yandexMetricaId, 'reachGoal', eventName, {
                category: finalData.category || 'User Interaction',
                label: finalData.label || '',
                value: finalData.value || 0,
                custom1: finalData.custom1 || '',
                custom2: finalData.custom2 || ''
            });
        }

        // Логирование для отладки
        console.log('Analytics Event Sent:', {
            eventName,
            data: finalData,
            gtagLoaded: this.isGoogleAnalyticsLoaded,
            ymLoaded: this.isYandexMetricaLoaded,
            ymId: this.yandexMetricaId
        });
    }

    /**
     * Отслеживание звонков
     */
    trackPhoneCalls() {
        document.addEventListener('click', (e) => {
            const phoneLink = e.target.closest('a[href^="tel:"]');
            if (phoneLink) {
                const phoneNumber = phoneLink.getAttribute('href').replace('tel:', '');
                const linkText = phoneLink.textContent.trim();
                
                this.sendEvent('phone_call', {
                    category: 'Contact',
                    label: linkText || phoneNumber,
                    custom1: 'phone_click',
                    custom2: phoneNumber
                });
                
                console.log('Phone call detected:', {
                    number: phoneNumber,
                    text: linkText,
                    element: phoneLink
                });
            }
        });
    }

    /**
     * Отслеживание WhatsApp кликов
     */
    trackWhatsAppClicks() {
        document.addEventListener('click', (e) => {
            const whatsappLink = e.target.closest('a[href*="wa.me"], a[href*="whatsapp.com"], a[href*="api.whatsapp.com"], a[href*="whatsapp"]');
            if (whatsappLink) {
                const whatsappUrl = whatsappLink.getAttribute('href');
                const linkText = whatsappLink.textContent.trim();
                
                this.sendEvent('whatsapp_click', {
                    category: 'Contact',
                    label: linkText || 'WhatsApp',
                    custom1: 'whatsapp_click',
                    custom2: whatsappUrl
                });
                
                console.log('WhatsApp click detected:', {
                    url: whatsappUrl,
                    text: linkText,
                    element: whatsappLink
                });
            }
        });
    }

    /**
     * Отслеживание отправки форм
     */
    trackFormSubmissions() {
        // Отслеживаем все формы на странице
        document.addEventListener('submit', (e) => {
            const form = e.target;
            const formData = new FormData(form);
            
            // Определяем тип формы
            let formType = 'general';
            let serviceType = 'not_specified';
            let urgency = 'medium';
            let rating = '0';
            
            // Проверяем различные селекторы для определения типа формы
            if (form.action.includes('contact') || form.id.includes('contact') || form.className.includes('contact')) {
                formType = 'contact';
                serviceType = formData.get('service_type') || formData.get('service') || 'not_specified';
                urgency = formData.get('urgency') || formData.get('priority') || 'medium';
            } else if (form.action.includes('review') || form.id.includes('review') || form.className.includes('review')) {
                formType = 'review';
                rating = formData.get('rating') || '0';
            } else if (form.action.includes('order') || form.id.includes('order') || form.className.includes('order')) {
                formType = 'order';
                serviceType = formData.get('service_type') || formData.get('service') || 'not_specified';
            }
            
            // Отправляем событие
            this.sendEvent(`${formType}_form_submitted`, {
                category: 'Form Submission',
                label: `${formType.charAt(0).toUpperCase() + formType.slice(1)} Form`,
                custom1: serviceType,
                custom2: formType === 'review' ? rating : urgency,
                value: formType === 'review' ? parseInt(rating) : 1
            });
            
            console.log(`Form submitted: ${formType}`, {
                serviceType,
                urgency,
                rating,
                formAction: form.action,
                formId: form.id,
                formClass: form.className
            });
        });
    }

    /**
     * Отслеживание просмотров страниц услуг
     */
    trackServiceViews() {
        const currentPath = window.location.pathname;
        const servicePages = {
            '/services/': 'services_overview',
            '/car-towing/': 'car_towing_service', 
            '/roadside-assistance/': 'roadside_assistance_service',
            '/motorcycle-towing/': 'motorcycle_towing_service',
            '/gallery/': 'gallery_page',
            '/reviews/': 'reviews_page',
            '/contact/': 'contact_page'
        };

        Object.keys(servicePages).forEach(path => {
            if (currentPath === path || currentPath === path.slice(0, -1)) {
                this.sendEvent('service_page_view', {
                    category: 'Page View',
                    label: servicePages[path],
                    custom1: 'service_view',
                    custom2: path,
                    value: 1
                });
            }
        });
        
        // Отслеживание кликов по кнопкам CTA на страницах услуг
        this.trackServiceCTAButtons();
    }
    
    /**
     * Отслеживание кнопок призыва к действию на страницах услуг
     */
    trackServiceCTAButtons() {
        document.addEventListener('click', (e) => {
            const ctaButton = e.target.closest('.cta-button, .order-button, .call-now-button, .btn-primary, .btn-success, button[type="submit"], a[href*="contact"], a[href*="order"]');
            if (ctaButton) {
                const buttonText = ctaButton.textContent.trim();
                const currentService = this.getCurrentServiceType();
                const buttonHref = ctaButton.getAttribute('href') || '';
                
                this.sendEvent('service_cta_clicked', {
                    category: 'CTA Interaction',
                    label: buttonText,
                    custom1: currentService,
                    custom2: buttonText.toLowerCase().replace(/\s+/g, '_'),
                    value: 1
                });
                
                console.log('CTA button clicked:', {
                    text: buttonText,
                    service: currentService,
                    href: buttonHref,
                    element: ctaButton
                });
            }
        });
    }
    
    /**
     * Определить тип текущей услуги по URL
     */
    getCurrentServiceType() {
        const path = window.location.pathname;
        if (path.includes('car-towing')) return 'car_towing';
        if (path.includes('roadside-assistance')) return 'roadside_assistance';
        if (path.includes('motorcycle-towing')) return 'motorcycle_towing';
        if (path.includes('services')) return 'services_overview';
        if (path.includes('contact')) return 'contact';
        if (path.includes('reviews')) return 'reviews';
        if (path.includes('gallery')) return 'gallery';
        if (path === '/' || path === '') return 'home';
        return 'other';
    }

    /**
     * Отслеживание взаимодействий с галереей
     */
    trackGalleryInteractions() {
        // Клики по изображениям в галерее
        document.addEventListener('click', (e) => {
            const galleryImage = e.target.closest('.gallery-image, .work-photo, .slider-image');
            if (galleryImage) {
                this.sendEvent('gallery_image_view', {
                    category: 'Gallery',
                    label: 'Image View',
                    custom1: 'gallery_interaction',
                    custom2: galleryImage.src || 'unknown'
                });
            }
        });
    }

    /**
     * Отслеживание глубины скроллинга
     */
    trackScrollDepth() {
        let maxScroll = 0;
        let sentEvents = new Set();

        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                
                // Отправляем события на 25%, 50%, 75%, 100%
                [25, 50, 75, 100].forEach(threshold => {
                    if (scrollPercent >= threshold && !sentEvents.has(threshold)) {
                        sentEvents.add(threshold);
                        this.sendEvent('scroll_depth', {
                            category: 'Engagement',
                            label: `${threshold}% scrolled`,
                            custom1: 'scroll_depth',
                            custom2: threshold.toString(),
                            value: threshold
                        });
                    }
                });
            }
        });
    }

    /**
     * Отслеживание кликов по элементам навигации
     */
    trackNavigationClicks() {
        document.addEventListener('click', (e) => {
            const navLink = e.target.closest('nav a, .nav-link, .nav-link-mobile');
            if (navLink) {
                const linkText = navLink.textContent.trim();
                const linkHref = navLink.getAttribute('href');
                
                this.sendEvent('navigation_click', {
                    category: 'Navigation',
                    label: linkText,
                    custom1: 'navigation',
                    custom2: linkHref
                });
            }
        });
    }

    /**
     * Отслеживание времени на странице
     */
    trackTimeOnPage() {
        const startTime = Date.now();
        
        window.addEventListener('beforeunload', () => {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            
            // Отправляем событие только если пользователь провел больше 10 секунд
            if (timeSpent > 10) {
                this.sendEvent('time_on_page', {
                    category: 'Engagement',
                    label: `${timeSpent} seconds`,
                    custom1: 'time_spent',
                    custom2: timeSpent.toString(),
                    value: timeSpent
                });
            }
        });
    }
}

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsTracker = new AnalyticsTracker();
});

// Дополнительные функции для ручного вызова
window.trackEvent = function(eventName, eventData = {}) {
    if (window.analyticsTracker) {
        window.analyticsTracker.sendEvent(eventName, eventData);
    } else {
        console.warn('AnalyticsTracker not initialized');
    }
};

window.trackConversion = function(conversionType, value = 0) {
    if (window.analyticsTracker) {
        window.analyticsTracker.sendEvent('conversion', {
            category: 'Conversion',
            label: conversionType,
            custom1: 'conversion',
            custom2: conversionType,
            value: value
        });
    } else {
        console.warn('AnalyticsTracker not initialized');
    }
};

// Функция для тестирования всех событий
window.testAnalytics = function() {
    if (!window.analyticsTracker) {
        console.warn('AnalyticsTracker not initialized');
        return;
    }
    
    console.log('Testing analytics events...');
    
    // Тестируем различные события
    window.analyticsTracker.sendEvent('test_phone_call', {
        category: 'Contact',
        label: '+1234567890',
        custom1: 'phone_click',
        custom2: '+1234567890'
    });
    
    window.analyticsTracker.sendEvent('test_whatsapp_click', {
        category: 'Contact',
        label: 'WhatsApp',
        custom1: 'whatsapp_click',
        custom2: 'https://wa.me/1234567890'
    });
    
    window.analyticsTracker.sendEvent('test_form_submission', {
        category: 'Form Submission',
        label: 'Contact Form',
        custom1: 'car_towing',
        custom2: 'urgent',
        value: 1
    });
    
    window.analyticsTracker.sendEvent('test_cta_click', {
        category: 'CTA Interaction',
        label: 'Call Now',
        custom1: 'car_towing',
        custom2: 'call_now',
        value: 1
    });
    
    console.log('Analytics test events sent. Check Google Analytics in 24-48 hours.');
}; 