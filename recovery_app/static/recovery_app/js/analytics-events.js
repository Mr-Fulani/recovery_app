/**
 * Analytics Events Tracking Module
 * Отслеживание событий для Google Analytics и Яндекс.Метрики
 */

class AnalyticsTracker {
    constructor() {
        this.isGoogleAnalyticsLoaded = typeof gtag !== 'undefined';
        this.isYandexMetricaLoaded = typeof ym !== 'undefined';
        this.yandexMetricaId = this.getYandexMetricaId();
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
                event_category: finalData.category || 'User Interaction',
                event_label: finalData.label || '',
                value: finalData.value || 0,
                custom_parameter_1: finalData.custom1 || '',
                custom_parameter_2: finalData.custom2 || '',
                page_location: finalData.page_url,
                page_title: finalData.page_title
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
        console.log('Analytics Event Sent:', eventName, finalData);
    }

    /**
     * Отслеживание звонков
     */
    trackPhoneCalls() {
        document.addEventListener('click', (e) => {
            const phoneLink = e.target.closest('a[href^="tel:"]');
            if (phoneLink) {
                const phoneNumber = phoneLink.getAttribute('href').replace('tel:', '');
                this.sendEvent('phone_call', {
                    category: 'Contact',
                    label: phoneNumber,
                    custom1: 'phone_click',
                    custom2: phoneNumber
                });
            }
        });
    }

    /**
     * Отслеживание WhatsApp кликов
     */
    trackWhatsAppClicks() {
        document.addEventListener('click', (e) => {
            const whatsappLink = e.target.closest('a[href*="wa.me"], a[href*="whatsapp.com"], a[href*="api.whatsapp.com"]');
            if (whatsappLink) {
                const whatsappUrl = whatsappLink.getAttribute('href');
                this.sendEvent('whatsapp_click', {
                    category: 'Contact',
                    label: 'WhatsApp',
                    custom1: 'whatsapp_click',
                    custom2: whatsappUrl
                });
            }
        });
    }

    /**
     * Отслеживание отправки форм
     */
    trackFormSubmissions() {
        // Форма заявки на эвакуацию
        const contactForm = document.querySelector('form[action*="contact"]');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                const formData = new FormData(contactForm);
                const serviceType = formData.get('service_type') || 'not_specified';
                const urgency = formData.get('urgency') || 'medium';
                
                this.sendEvent('service_request_submitted', {
                    category: 'Form Submission',
                    label: 'Contact Form',
                    custom1: serviceType,
                    custom2: urgency,
                    value: 1
                });
            });
        }

        // Форма отзывов
        const reviewForm = document.querySelector('form[action*="review"]');
        if (reviewForm) {
            reviewForm.addEventListener('submit', (e) => {
                const formData = new FormData(reviewForm);
                const rating = formData.get('rating') || '0';
                
                this.sendEvent('review_submitted', {
                    category: 'Form Submission',
                    label: 'Review Form',
                    custom1: 'review',
                    custom2: rating,
                    value: parseInt(rating)
                });
            });
        }
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
            const ctaButton = e.target.closest('.cta-button, .order-button, .call-now-button, button[type="submit"]');
            if (ctaButton) {
                const buttonText = ctaButton.textContent.trim();
                const currentService = this.getCurrentServiceType();
                
                this.sendEvent('service_cta_clicked', {
                    category: 'CTA Interaction',
                    label: buttonText,
                    custom1: currentService,
                    custom2: buttonText.toLowerCase().replace(/\s+/g, '_'),
                    value: 1
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
    }
}; 