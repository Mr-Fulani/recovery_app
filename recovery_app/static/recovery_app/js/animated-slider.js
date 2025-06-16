/**
 * Анимированный слайдер с видео и фотографиями
 * Обеспечивает плавную анимацию, автопрокрутку и навигацию
 */

class AnimatedSlider {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.sliderTrack = this.container.querySelector('#sliderTrack');
        this.slides = this.container.querySelectorAll('.slide');
        this.prevBtn = this.container.querySelector('#prevBtn');
        this.nextBtn = this.container.querySelector('#nextBtn');
        this.playPauseBtn = this.container.querySelector('#playPauseBtn');
        this.indicatorsContainer = this.container.querySelector('#sliderIndicators');

        this.currentSlide = 0;
        this.totalSlides = this.slides.length;
        this.isPlaying = true;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 5000; // 5 секунд

        this.init();
    }

    init() {
        if (this.totalSlides === 0) return;

        this.createIndicators();
        this.bindEvents();
        this.updateSlider();
        this.startAutoPlay();

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
    }

    createIndicators() {
        this.indicatorsContainer.innerHTML = '';
        
        for (let i = 0; i < this.totalSlides; i++) {
            const indicator = document.createElement('div');
            indicator.className = `indicator ${i === 0 ? 'active' : ''}`;
            indicator.addEventListener('click', () => this.goToSlide(i));
            this.indicatorsContainer.appendChild(indicator);
        }
    }

    bindEvents() {
        this.prevBtn?.addEventListener('click', () => this.prevSlide());
        this.nextBtn?.addEventListener('click', () => this.nextSlide());
        this.playPauseBtn?.addEventListener('click', () => this.toggleAutoPlay());

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

    isSliderVisible() {
        const rect = this.container.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }

    updateSlider() {
        const translateX = -this.currentSlide * 100;
        this.sliderTrack.style.transform = `translateX(${translateX}%)`;

        // Обновляем индикаторы
        const indicators = this.indicatorsContainer.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });

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
        currentSlideElement.classList.add(animationClass);
        
        setTimeout(() => {
            currentSlideElement.classList.remove(animationClass);
        }, 600);
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
        
        const icon = this.playPauseBtn.querySelector('i');
        if (this.isPlaying) {
            this.startAutoPlay();
            icon.className = 'fas fa-pause';
        } else {
            this.pauseAutoPlay();
            icon.className = 'fas fa-play';
        }
    }

    // Метод для обновления слайдера при изменении размера окна
    handleResize() {
        this.updateSlider();
    }

    // Метод для уничтожения слайдера
    destroy() {
        this.pauseAutoPlay();
        // Удаляем все обработчики событий
        this.prevBtn?.removeEventListener('click', this.prevSlide);
        this.nextBtn?.removeEventListener('click', this.nextSlide);
        this.playPauseBtn?.removeEventListener('click', this.toggleAutoPlay);
    }
}

// Инициализация слайдера при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    // Создаем экземпляр слайдера
    const slider = new AnimatedSlider('animated-slider');
    
    // Добавляем обработчик изменения размера окна
    window.addEventListener('resize', () => {
        if (slider) slider.handleResize();
    });

    // Сохраняем ссылку на слайдер для глобального доступа
    window.animatedSlider = slider;
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
        if (!this.container) return;

        this.sliderTrack = this.container.querySelector('#backgroundSliderTrack');
        this.slides = this.container.querySelectorAll('.background-slide');

        this.currentSlide = 0;
        this.totalSlides = this.slides.length;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 3000; // 3 секунды

        this.init();
    }

    init() {
        if (this.totalSlides === 0) return;

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
        this.updateSlider();
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
    
    // Добавляем обработчик изменения размера окна
    window.addEventListener('resize', () => {
        if (backgroundSlider) backgroundSlider.handleResize();
    });

    // Сохраняем ссылку на фоновый слайдер для глобального доступа
    window.backgroundSlider = backgroundSlider;
}); 