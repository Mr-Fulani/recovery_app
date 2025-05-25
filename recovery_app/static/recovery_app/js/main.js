document.addEventListener('DOMContentLoaded', function() {
    // Обработка формы обратной связи
    const contactForm = document.querySelector('form[action*="contact"]');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            const phoneInput = this.querySelector('input[name="phone"]');
            if (phoneInput) {
                phoneInput.value = phoneInput.value.replace(/\D/g, '');
            }
        });
    }

    // Обработка рейтинга в форме отзывов
    const ratingInputs = document.querySelectorAll('input[name="rating"]');
    const starIcons = document.querySelectorAll('.fa-star');
    ratingInputs.forEach((input, index) => {
        input.addEventListener('change', function() {
            starIcons.forEach((star, starIndex) => {
                if (starIndex <= index) {
                    star.classList.remove('far');
                    star.classList.add('fas');
                } else {
                    star.classList.remove('fas');
                    star.classList.add('far');
                }
            });
        });
    });

    // Обработка мобильного меню
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        // Сброс состояния мобильного меню при загрузке
        if (mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            const burgerIcon = mobileMenuButton.querySelector('i');
            if (burgerIcon) {
                burgerIcon.classList.remove('fa-times');
                burgerIcon.classList.add('fa-bars');
            }
        }

        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            const burgerIcon = this.querySelector('i');
            if (mobileMenu.classList.contains('active')) {
                burgerIcon.classList.remove('fa-bars');
                burgerIcon.classList.add('fa-times');
            } else {
                burgerIcon.classList.remove('fa-times');
                burgerIcon.classList.add('fa-bars');
            }
        });

        // Закрытие меню при клике вне его
        document.addEventListener('click', function(e) {
            if (!mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
                if (mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.remove('active');
                    const burgerIcon = mobileMenuButton.querySelector('i');
                    if (burgerIcon) {
                        burgerIcon.classList.remove('fa-times');
                        burgerIcon.classList.add('fa-bars');
                    }
                }
            }
        });

        // Закрытие меню при клике на ссылку
        mobileMenu.querySelectorAll('.nav-link-mobile').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                const burgerIcon = mobileMenuButton.querySelector('i');
                if (burgerIcon) {
                    burgerIcon.classList.remove('fa-times');
                    burgerIcon.classList.add('fa-bars');
                }
            });
        });
    }

    // Плавная прокрутка к якорям
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Анимация счетчика чисел
    function startNumberCounting(targetElement) {
        const numbers = targetElement.querySelectorAll('.js-count');
        numbers.forEach(numberElement => {
            if (numberElement.dataset.animated) {
                return;
            }
            numberElement.dataset.animated = true;
            const target = parseFloat(numberElement.dataset.target);
            const postfix = numberElement.dataset.postfix || '';
            const duration = 2000;
            const start = 0;
            let current = 0;
            const increment = target / (duration / 10);
            const isFloat = target % 1 !== 0;

            const updateCount = () => {
                if (current < target) {
                    current += increment;
                    if (current > target) {
                        current = target;
                    }
                    numberElement.textContent = isFloat ? current.toFixed(1) : Math.floor(current);
                    requestAnimationFrame(updateCount);
                } else {
                    numberElement.textContent = target + postfix;
                }
            };
            requestAnimationFrame(updateCount);
        });
    }

    // Анимация появления элементов при скролле
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                if (entry.target.querySelector('.js-count')) {
                    startNumberCounting(entry.target);
                }
                const photoCards = entry.target.querySelectorAll('.work-photo-card');
                photoCards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('animate-fade-in');
                    }, index * 100);
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(element => {
        observer.observe(element);
    });
});