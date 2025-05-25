document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('orderForm');
    const orderBtn = document.getElementById('orderBtn');

    orderBtn.addEventListener('click', function(e) {
        e.preventDefault(); // Предотвращаем обычную отправку формы

        // Проверяем, не выполняется ли уже анимация
        if (orderBtn.classList.contains('animate')) {
            return;
        }

        // Валидация формы
        if (!validateForm()) {
            return;
        }

        // Запускаем анимацию
        orderBtn.classList.add('animate');
        orderBtn.disabled = true; // Блокируем кнопку

        // Отправляем форму через 7 секунд (чтобы не прерывать анимацию)
        setTimeout(() => {
            // Отправляем форму программно
            form.submit();
        }, 5000);

        // Сбрасываем анимацию через 10 секунд (если форма не отправилась)
        setTimeout(() => {
            orderBtn.classList.remove('animate');
            orderBtn.disabled = false;
        }, 10000);
    });

    function validateForm() {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        // Очищаем предыдущие ошибки
        clearErrors();

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                showError(field, 'This field is required');
                isValid = false;
            } else if (field.type === 'email' && field.value && !isValidEmail(field.value)) {
                showError(field, 'Please enter a valid email address');
                isValid = false;
            }
        });

        return isValid;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showError(field, message) {
        field.classList.add('error');

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    function clearErrors() {
        const errorFields = form.querySelectorAll('.error');
        errorFields.forEach(field => field.classList.remove('error'));

        const errorMessages = form.querySelectorAll('.error-message');
        errorMessages.forEach(message => message.remove());
    }

    // Очистка ошибок при вводе
    form.addEventListener('input', function(e) {
        if (e.target.classList.contains('error')) {
            e.target.classList.remove('error');
            const errorMessage = e.target.parentNode.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        }
    });
});