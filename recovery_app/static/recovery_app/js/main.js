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

    // Мобильное меню
    const menuButton = document.querySelector('.md\\:hidden button');
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'hidden fixed inset-0 bg-gray-800 bg-opacity-50 z-50';
    mobileMenu.innerHTML = `
        <div class="bg-white w-64 h-full p-4">
            <div class="flex justify-between items-center mb-4">
                <span class="text-xl font-bold text-blue-600">Меню</span>
                <button class="text-gray-600 hover:text-blue-600">
                    <i class="fas fa-times text-2xl"></i>
                </button>
            </div>
            <nav class="space-y-4">
                <a href="/" class="nav-link block text-gray-600 hover:text-blue-600">Главная</a>
                <a href="/services/" class="nav-link block text-gray-600 hover:text-blue-600">Услуги</a>
                <a href="/reviews/" class="nav-link block text-gray-600 hover:text-blue-600">Отзывы</a>
                <a href="/contact/" class="nav-link block text-gray-600 hover:text-blue-600">Контакты</a>
            </nav>
        </div>
    `;

    if (menuButton) {
        document.body.appendChild(mobileMenu);
        const closeButton = mobileMenu.querySelector('button');
        const menuContent = mobileMenu.querySelector('div');

        menuButton.addEventListener('click', function() {
            mobileMenu.classList.remove('hidden');
            menuContent.classList.add('animate-slide-in');
        });

        closeButton.addEventListener('click', function() {
            mobileMenu.classList.add('hidden');
        });

        mobileMenu.addEventListener('click', function(e) {
            if (e.target === mobileMenu) {
                mobileMenu.classList.add('hidden');
            }
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