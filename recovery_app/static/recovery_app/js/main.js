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
            // Переключаем класс 'active' для анимации выезда/скрытия
            mobileMenu.classList.toggle('active');

            // Переключаем класс 'hidden' TailwindCSS для фактического скрытия/показа
            // Это важно, так как Tailwind's `hidden` имеет `display: none !important;`
            if (mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.remove('hidden');
            } else {
                // Добавляем hidden с небольшой задержкой, чтобы анимация успела завершиться
                setTimeout(() => {
                    mobileMenu.classList.add('hidden');
                }, 300); // Время должно совпадать с transition в CSS (0.3s)
            }

            // Изменить иконку бургера на крестик
            const burgerIcon = mobileMenuButton.querySelector('i'); // Ищем тег <i> (Font Awesome)
            if (burgerIcon) {
                if (mobileMenu.classList.contains('active')) {
                    burgerIcon.classList.remove('fa-bars'); // Убрать иконку бургера
                    burgerIcon.classList.add('fa-times');   // Добавить иконку крестика
                } else {
                    burgerIcon.classList.remove('fa-times'); // Убрать иконку крестика
                    burgerIcon.classList.add('fa-bars');    // Добавить иконку бургера
                }
            }
        });

        // Закрывать меню при клике на ссылку (опционально)
        const mobileLinks = mobileMenu.querySelectorAll('.nav-link-mobile');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.remove('active');
                    // С небольшой задержкой скрываем, чтобы анимация завершилась
                    setTimeout(() => {
                        mobileMenu.classList.add('hidden');
                    }, 300);
                    // Возвращаем иконку бургера
                    const burgerIcon = mobileMenuButton.querySelector('i');
                    if (burgerIcon) {
                        burgerIcon.classList.remove('fa-times');
                        burgerIcon.classList.add('fa-bars');
                    }
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

    // Анимация появления элементов при скролле
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                // Анимация для карточек фотографий
                const photoCards = entry.target.querySelectorAll('.work-photo-card');
                photoCards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('animate-fade-in');
                    }, index * 100); // Задержка для последовательной анимации
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(element => {
        observer.observe(element);
    });
});