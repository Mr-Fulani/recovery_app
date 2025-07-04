/**
 * Анимированный слайдер с видео и фотографиями
 * Обеспечивает плавную анимацию, автопрокрутку и навигацию
 */

class AnimatedSlider {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.warn(`AnimatedSlider: Container with id "${containerId}" not found`);
            return;
        }

        this.sliderContainer = this.container.querySelector('#sliderContainer');
        this.preloader = this.container.querySelector('#sliderPreloader');
        this.sliderTrack = this.container.querySelector('#sliderTrack');
        this.slides = this.container.querySelectorAll('.slide');
        this.prevBtn = this.container.querySelector('#prevBtn');
        this.nextBtn = this.container.querySelector('#nextBtn');
        this.playPauseBtn = this.container.querySelector('#playPauseBtn');
        this.indicatorsContainer = this.container.querySelector('#sliderIndicators');

        // Проверяем наличие основных элементов
        if (!this.sliderTrack) {
            console.warn('AnimatedSlider: #sliderTrack not found in container');
            return;
        }

        this.currentSlide = 0;
        this.totalSlides = this.slides.length;
        this.isPlaying = true;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 5000; // 5 секунд
        this.isLoaded = false;
        this.progressBar = this.container.querySelector('#progressBar');
        this.loadedMedia = 0;
        this.totalMedia = 0;

        this.init();
    }

    init() {
        if (this.totalSlides === 0) {
            this.hidePreloader();
            return;
        }

        // Инициализируем fallback изображения
        this.initializeFallbacks();
        
        // Определяем скорость соединения
        this.detectConnectionSpeed();
        
        // Ждем загрузки всех медиа-элементов
        this.preloadMedia().then(() => {
            this.createIndicators();
            this.bindEvents();
            this.updateSlider();
            this.hidePreloader();
            this.startAutoPlay();
            this.isLoaded = true;

            // Добавляем обработчик для паузы при наведении
            this.container.addEventListener('mouseenter', () => this.pauseAutoPlay());
            this.container.addEventListener('mouseleave', () => {
                if (this.isPlaying) this.startAutoPlay();
            });

            // Обработчик для видимости страницы
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.pauseAutoPlay();
                } else if (this.isPlaying) {
                    this.startAutoPlay();
                }
            });
        });
    }

    async preloadMedia() {
        // Подсчитываем общее количество медиа-элементов
        this.slides.forEach(slide => {
            const video = slide.querySelector('video');
            const image = slide.querySelector('img');
            
            if (video) this.totalMedia++;
            if (image) this.totalMedia++;
        });

        // Показываем минимальный прогресс
        this.updateProgress(0);
        
        const mediaPromises = [];
        
        this.slides.forEach(slide => {
            const video = slide.querySelector('video');
            const image = slide.querySelector('img');
            
            if (video) {
                mediaPromises.push(this.loadVideo(video));
            }
            if (image) {
                mediaPromises.push(this.loadImage(image));
            }
        });

        // Добавляем минимальную задержку для красивого отображения preloader'а
        const minDelay = new Promise(resolve => setTimeout(resolve, 1500));
        
        // Ждем загрузки всех элементов или максимум 8 секунд
        return Promise.race([
            Promise.all([...mediaPromises, minDelay]),
            new Promise(resolve => setTimeout(() => {
                this.updateProgress(100);
                resolve();
            }, 8000))
        ]);
    }

    loadVideo(video) {
        return new Promise(resolve => {
            if (video.readyState >= 3) {
                this.onMediaLoaded();
                resolve();
                return;
            }
            
            const onLoadedData = () => {
                video.removeEventListener('loadeddata', onLoadedData);
                video.removeEventListener('error', onError);
                video.removeEventListener('progress', onProgress);
                this.onVideoLoaded(video);
                this.onMediaLoaded();
                resolve();
            };
            
            const onError = () => {
                video.removeEventListener('loadeddata', onLoadedData);
                video.removeEventListener('error', onError);
                video.removeEventListener('progress', onProgress);
                this.onMediaLoaded(); // Продолжаем даже если видео не загрузилось
                resolve();
            };
            
            const onProgress = () => {
                // Частичное обновление прогресса при загрузке видео
                const buffered = video.buffered;
                if (buffered.length > 0) {
                    const loadPercent = (buffered.end(0) / video.duration) * 100;
                    if (loadPercent > 50) { // Если загружено больше 50%
                        video.removeEventListener('progress', onProgress);
                        this.onMediaLoaded();
                        resolve();
                    }
                }
            };
            
            video.addEventListener('loadeddata', onLoadedData);
            video.addEventListener('error', onError);
            video.addEventListener('progress', onProgress);
            
            // Улучшенная стратегия загрузки для мобильных
            if (this.isMobile()) {
                video.preload = 'metadata';
                video.load();
                // На мобильных ждем только metadata
                setTimeout(() => {
                    if (video.readyState >= 1) {
                        video.removeEventListener('loadeddata', onLoadedData);
                        video.removeEventListener('error', onError);
                        video.removeEventListener('progress', onProgress);
                        this.onMediaLoaded();
                        resolve();
                    }
                }, 2000);
            } else {
                video.preload = 'auto';
                video.load();
            }
        });
    }

    loadImage(image) {
        return new Promise(resolve => {
            if (image.complete) {
                this.onMediaLoaded();
                resolve();
                return;
            }
            
            const onLoad = () => {
                image.removeEventListener('load', onLoad);
                image.removeEventListener('error', onError);
                this.onMediaLoaded();
                resolve();
            };
            
            const onError = () => {
                image.removeEventListener('load', onLoad);
                image.removeEventListener('error', onError);
                this.onMediaLoaded(); // Продолжаем даже если изображение не загрузилось
                resolve();
            };
            
            image.addEventListener('load', onLoad);
            image.addEventListener('error', onError);
        });
    }

    onMediaLoaded() {
        this.loadedMedia++;
        const progress = (this.loadedMedia / this.totalMedia) * 100;
        this.updateProgress(Math.min(progress, 95)); // Максимум 95% до полной загрузки
    }
    
    onVideoLoaded(video) {
        // Находим родительский слайд
        const slide = video.closest('.slide');
        if (slide && !slide.classList.contains('slow-connection')) {
            slide.classList.add('video-loaded');
            
            // Плавно показываем видео и скрываем fallback
            setTimeout(() => {
                video.style.opacity = '1';
                const fallback = slide.querySelector('.video-fallback');
                if (fallback) {
                    fallback.style.opacity = '0';
                }
            }, 100);
        }
    }
    
    updateProgress(percent) {
        if (this.progressBar) {
            this.progressBar.style.width = `${percent}%`;
        }
    }
    
    isMobile() {
        return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    initializeFallbacks() {
        // Показываем fallback изображения по умолчанию
        this.slides.forEach(slide => {
            const video = slide.querySelector('video');
            const fallback = slide.querySelector('.video-fallback');
            
            if (video && fallback) {
                fallback.style.opacity = '1';
                video.style.opacity = '0';
            }
        });
    }
    
    detectConnectionSpeed() {
        // Проверяем API Network Information если доступно
        if ('connection' in navigator) {
            const connection = navigator.connection;
            const slowConnections = ['slow-2g', '2g', '3g'];
            
            if (slowConnections.includes(connection.effectiveType)) {
                this.isSlowConnection = true;
                this.slides.forEach(slide => {
                    if (slide.querySelector('video')) {
                        slide.classList.add('slow-connection');
                    }
                });
                return;
            }
        }
        
        // Fallback: простой тест скорости
        this.testConnectionSpeed();
    }
    
    testConnectionSpeed() {
        const startTime = Date.now();
        const testImage = new Image();
        
        testImage.onload = () => {
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // Если загрузка небольшого изображения занимает больше 3 секунд
            if (duration > 3000) {
                this.isSlowConnection = true;
                this.slides.forEach(slide => {
                    if (slide.querySelector('video')) {
                        slide.classList.add('slow-connection');
                    }
                });
            }
        };
        
        testImage.onerror = () => {
            // В случае ошибки предполагаем медленное соединение
            this.isSlowConnection = true;
            console.warn('Connection speed test image failed to load');
        };
        
        // Маленькое тестовое изображение (1x1 пиксель)
        testImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    }

    hidePreloader() {
        // Завершаем прогресс-бар
        this.updateProgress(100);
        
        setTimeout(() => {
            if (this.preloader) {
                this.preloader.classList.add('hidden');
                setTimeout(() => {
                    this.preloader.style.display = 'none';
                }, 800);
            }
            
            if (this.sliderContainer) {
                this.sliderContainer.style.opacity = '1';
            }
        }, 300);
    }

    createIndicators() {
        if (!this.indicatorsContainer) {
            console.warn('AnimatedSlider: indicatorsContainer not found');
            return;
        }
        
        this.indicatorsContainer.innerHTML = '';
        
        for (let i = 0; i < this.totalSlides; i++) {
            const indicator = document.createElement('div');
            indicator.className = `indicator ${i === 0 ? 'active' : ''}`;
            indicator.addEventListener('click', () => this.goToSlide(i));
            this.indicatorsContainer.appendChild(indicator);
        }
    }

    bindEvents() {
        // Привязываем события кнопок только если они существуют
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }
        if (this.playPauseBtn) {
            this.playPauseBtn.addEventListener('click', () => this.toggleAutoPlay());
        }

        // Добавляем поддержку клавиатуры
        document.addEventListener('keydown', (e) => {
            if (!this.isSliderVisible()) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prevSlide();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case ' ':
                    e.preventDefault();
                    this.toggleAutoPlay();
                    break;
            }
        });

        // Поддержка touch-событий для мобильных устройств
        if (this.sliderTrack) {
            let startX = null;
            let currentX = null;

            this.sliderTrack.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                this.pauseAutoPlay();
            });

            this.sliderTrack.addEventListener('touchmove', (e) => {
                if (!startX) return;
                currentX = e.touches[0].clientX;
            });

            this.sliderTrack.addEventListener('touchend', () => {
                if (!startX || !currentX) return;
                
                const diff = startX - currentX;
                const threshold = 50;

                if (Math.abs(diff) > threshold) {
                    if (diff > 0) {
                        this.nextSlide();
                    } else {
                        this.prevSlide();
                    }
                }

                startX = null;
                currentX = null;
                
                if (this.isPlaying) {
                    setTimeout(() => this.startAutoPlay(), 1000);
                }
            });
        }
    }

    isSliderVisible() {
        if (!this.container) return false;
        
        const rect = this.container.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }

    updateSlider() {
        // Проверяем, что sliderTrack существует
        if (!this.sliderTrack) {
            console.warn('AnimatedSlider: sliderTrack not found');
            return;
        }
        
        const translateX = -this.currentSlide * 100;
        this.sliderTrack.style.transform = `translateX(${translateX}%)`;

        // Обновляем индикаторы
        if (this.indicatorsContainer) {
            const indicators = this.indicatorsContainer.querySelectorAll('.indicator');
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === this.currentSlide);
            });
        }

        // Добавляем класс активности к текущему слайду
        this.slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentSlide);
        });

        // Управление воспроизведением видео
        this.handleVideoPlayback();
    }

    handleVideoPlayback() {
        this.slides.forEach((slide, index) => {
            const video = slide.querySelector('video');
            if (video) {
                if (index === this.currentSlide) {
                    video.play().catch(() => {
                        // Видео не может быть воспроизведено автоматически
                        console.log('Autoplay prevented for video');
                    });
                } else {
                    video.pause();
                    video.currentTime = 0;
                }
            }
        });
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateSlider();
        this.addSlideAnimation('slide-in-right');
    }

    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.updateSlider();
        this.addSlideAnimation('slide-in-left');
    }

    goToSlide(index) {
        if (index === this.currentSlide) return;
        
        const direction = index > this.currentSlide ? 'slide-in-right' : 'slide-in-left';
        this.currentSlide = index;
        this.updateSlider();
        this.addSlideAnimation(direction);
    }

    addSlideAnimation(animationClass) {
        const currentSlideElement = this.slides[this.currentSlide];
        if (currentSlideElement) {
            currentSlideElement.classList.add(animationClass);
            
            setTimeout(() => {
                currentSlideElement.classList.remove(animationClass);
            }, 600);
        }
    }

    startAutoPlay() {
        if (this.autoPlayInterval) this.pauseAutoPlay();
        
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoPlayDelay);
    }

    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    toggleAutoPlay() {
        this.isPlaying = !this.isPlaying;
        
        if (this.playPauseBtn) {
            const icon = this.playPauseBtn.querySelector('i');
            if (icon) {
                if (this.isPlaying) {
                    this.startAutoPlay();
                    icon.className = 'fas fa-pause';
                } else {
                    this.pauseAutoPlay();
                    icon.className = 'fas fa-play';
                }
            }
        } else {
            // Если кнопки нет, просто переключаем состояние
            if (this.isPlaying) {
                this.startAutoPlay();
            } else {
                this.pauseAutoPlay();
            }
        }
    }

    // Метод для обновления слайдера при изменении размера окна
    handleResize() {
        // Проверяем, что слайдер существует и инициализирован
        if (this.container && this.sliderTrack) {
            this.updateSlider();
        }
    }

    // Метод для уничтожения слайдера
    destroy() {
        this.pauseAutoPlay();
        // Удаляем все обработчики событий
        if (this.prevBtn) {
            this.prevBtn.removeEventListener('click', this.prevSlide);
        }
        if (this.nextBtn) {
            this.nextBtn.removeEventListener('click', this.nextSlide);
        }
        if (this.playPauseBtn) {
            this.playPauseBtn.removeEventListener('click', this.toggleAutoPlay);
        }
    }
}

// Инициализация слайдера при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    // Создаем экземпляр слайдера
    const slider = new AnimatedSlider('animated-slider');
    
    // Добавляем обработчик изменения размера окна только если слайдер создан успешно
    if (slider && slider.container) {
        window.addEventListener('resize', () => {
            if (slider) slider.handleResize();
        });

        // Сохраняем ссылку на слайдер для глобального доступа
        window.animatedSlider = slider;
    }
});

// Дополнительные функции для улучшения производительности
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Intersection Observer для оптимизации производительности
function createSliderObserver() {
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Слайдер виден, возобновляем автопрокрутку
                    if (window.animatedSlider && window.animatedSlider.isPlaying) {
                        window.animatedSlider.startAutoPlay();
                    }
                } else {
                    // Слайдер не виден, останавливаем автопрокрутку
                    if (window.animatedSlider) {
                        window.animatedSlider.pauseAutoPlay();
                    }
                }
            });
        }, {
            threshold: 0.1
        });

        const sliderContainer = document.getElementById('animated-slider');
        if (sliderContainer) {
            observer.observe(sliderContainer);
        }
    }
}

// Запускаем observer после полной загрузки
window.addEventListener('load', createSliderObserver);

/**
 * Фоновый слайдер для страниц (без элементов управления)
 * Автоматическое переключение каждые 3 секунды
 */
class BackgroundSlider {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.warn(`BackgroundSlider: Container with id "${containerId}" not found`);
            return;
        }

        this.sliderTrack = this.container.querySelector('#backgroundSliderTrack');
        if (!this.sliderTrack) {
            console.warn('BackgroundSlider: #backgroundSliderTrack not found in container');
            return;
        }
        
        this.slides = this.container.querySelectorAll('.background-slide');

        this.currentSlide = 0;
        this.totalSlides = this.slides.length;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 3000; // 3 секунды

        this.init();
    }

    init() {
        if (this.totalSlides === 0) {
            console.warn('BackgroundSlider: No slides found');
            return;
        }

        this.updateSlider();
        this.startAutoPlay();

        // Добавляем эффект Ken Burns к изображениям
        this.addKenBurnsEffect();

        // Обработчик для видимости страницы
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoPlay();
            } else {
                this.startAutoPlay();
            }
        });

        // Пауза при наведении
        this.container.addEventListener('mouseenter', () => this.pauseAutoPlay());
        this.container.addEventListener('mouseleave', () => this.startAutoPlay());
    }

    addKenBurnsEffect() {
        const images = this.container.querySelectorAll('.background-slide-image');
        images.forEach(img => {
            img.classList.add('ken-burns');
        });
    }

    updateSlider() {
        // Проверяем, что sliderTrack существует
        if (!this.sliderTrack) {
            console.warn('BackgroundSlider: sliderTrack not found');
            return;
        }
        
        const translateX = -this.currentSlide * 100;
        this.sliderTrack.style.transform = `translateX(${translateX}%)`;

        // Добавляем класс активности к текущему слайду
        this.slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentSlide);
            
            // Добавляем анимацию появления
            if (index === this.currentSlide) {
                slide.classList.add('fade-in');
                setTimeout(() => slide.classList.remove('fade-in'), 800);
            }
        });

        // Управление воспроизведением видео
        this.handleVideoPlayback();
    }

    handleVideoPlayback() {
        this.slides.forEach((slide, index) => {
            const video = slide.querySelector('video');
            if (video) {
                if (index === this.currentSlide) {
                    video.play().catch(() => {
                        console.log('Background video autoplay prevented');
                    });
                } else {
                    video.pause();
                    video.currentTime = 0;
                }
            }
        });
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateSlider();
    }

    startAutoPlay() {
        if (this.autoPlayInterval) this.pauseAutoPlay();
        
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoPlayDelay);
    }

    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    // Метод для обновления слайдера при изменении размера окна
    handleResize() {
        // Проверяем, что слайдер существует и инициализирован
        if (this.container && this.sliderTrack) {
            this.updateSlider();
        }
    }

    // Метод для уничтожения слайдера
    destroy() {
        this.pauseAutoPlay();
    }
}

// Инициализация фонового слайдера
document.addEventListener('DOMContentLoaded', function() {
    // Создаем экземпляр фонового слайдера если он есть на странице
    const backgroundSlider = new BackgroundSlider('background-slider');
    
    // Добавляем обработчик изменения размера окна только если слайдер создан успешно
    if (backgroundSlider && backgroundSlider.container) {
        window.addEventListener('resize', () => {
            if (backgroundSlider) backgroundSlider.handleResize();
        });

        // Сохраняем ссылку на фоновый слайдер для глобального доступа
        window.backgroundSlider = backgroundSlider;
    }
}); 