// Обработка формы обратной связи
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('form[action*="contact"]');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            const phoneInput = this.querySelector('input[name="phone"]');
            if (phoneInput) {
                // Очищаем телефон от всего кроме цифр
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

    // --- МОБИЛЬНОЕ МЕНЮ (НОВАЯ логика) ---
    const mobileMenuButton = document.getElementById('mobile-menu-button'); // Получаем кнопку по ID
    const mobileMenu = document.getElementById('mobile-menu');             // Получаем контейнер меню по ID

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('active'); // Переключаем класс 'active'
            const burgerIcon = this.querySelector('i'); // Находим иконку внутри кнопки
            if (mobileMenu.classList.contains('active')) {
                // Если меню активно, меняем иконку на крестик
                burgerIcon.classList.remove('fa-bars');
                burgerIcon.classList.add('fa-times');
            } else {
                // Если меню не активно, меняем иконку на бургер
                burgerIcon.classList.remove('fa-times');
                burgerIcon.classList.add('fa-bars');
            }
        });

        // Закрытие меню при клике вне его или на ссылку
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

        // Закрытие меню при клике на ссылку внутри него
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

    // Function to start number counting animation
    function startNumberCounting(targetElement) {
        const numbers = targetElement.querySelectorAll('.js-count');

        numbers.forEach(numberElement => {
            // Ensure animation only runs once per element
            if (numberElement.dataset.animated) {
                return;
            }
            numberElement.dataset.animated = true; // Mark as animated

            const target = parseFloat(numberElement.dataset.target);
            const postfix = numberElement.dataset.postfix || '';
            const duration = 2000; // Animation duration in milliseconds (2 seconds)
            const start = 0;
            let current = 0;
            const increment = target / (duration / 10); // Calculate increment based on duration and ~10ms update interval

            const isFloat = target % 1 !== 0; // Check if the target is a float

            const updateCount = () => {
                if (current < target) {
                    current += increment;
                    if (current > target) { // Prevent overshooting the target
                        current = target;
                    }
                    // Format the number based on whether it's a float or integer
                    numberElement.textContent = isFloat ? current.toFixed(1) : Math.floor(current);
                    requestAnimationFrame(updateCount); // Continue animation
                } else {
                    numberElement.textContent = target + postfix; // Set final value with postfix
                }
            };

            requestAnimationFrame(updateCount); // Start the animation
        });
    }

    // Анимация появления элементов при скролле
    const observerOptions = {
        threshold: 0.1 // Trigger when 10% of the element is visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');

                // Check if the intersected element is the Statistics Section
                // by checking if it contains elements with '.js-count'
                if (entry.target.querySelector('.js-count')) {
                    startNumberCounting(entry.target);
                }

                // Анимация для карточек фотографий
                const photoCards = entry.target.querySelectorAll('.work-photo-card');
                photoCards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('animate-fade-in');
                    }, index * 100); // Задержка для последовательной анимации
                });
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(element => {
        observer.observe(element);
    });
});