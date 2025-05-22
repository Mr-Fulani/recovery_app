// Animated Order Button JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form[action*="contact"]');
    const orderBtn = document.getElementById('orderBtn');

    if (form && orderBtn) {
        form.addEventListener('submit', function(e) {
            // Проверяем, не выполняется ли уже анимация
            if (orderBtn.classList.contains('animate')) {
                e.preventDefault();
                return;
            }

            // Валидация формы перед отправкой
            if (!validateForm(form)) {
                e.preventDefault();
                return;
            }

            // Отключаем кнопку и запускаем анимацию
            orderBtn.disabled = true;
            orderBtn.classList.add('animate');

            // Если вы хотите использовать AJAX для отправки формы
            // Раскомментируйте следующий блок и настройте под ваши нужды:

            /*
            e.preventDefault();

            const formData = new FormData(form);

            fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                }
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Network response was not ok');
            })
            .then(data => {
                if (data.success) {
                    // Успешная отправка - анимация продолжается
                    console.log('Form submitted successfully');

                    // Можете добавить дополнительные действия после успешной отправки
                    setTimeout(() => {
                        // Перенаправление или очистка формы
                        // window.location.href = '/thank-you/';
                        // или
                        // form.reset();
                        // resetButton();
                    }, 6000);
                } else {
                    // Ошибка валидации - сбрасываем анимацию
                    resetButton();
                    displayFormErrors(data.errors);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                resetButton();
                showErrorMessage('Произошла ошибка при отправке формы. Попробуйте еще раз.');
            });
            */

            // Если используете стандартную отправку формы Django,
            // то анимация будет показана до перезагрузки страницы
        });

        // Функция для сброса состояния кнопки
        function resetButton() {
            orderBtn.classList.remove('animate');
            orderBtn.disabled = false;
        }

        // Простая валидация формы
        function validateForm(form) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;

            // Очищаем предыдущие ошибки
            clearFormErrors();

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    showFieldError(field, 'Это поле обязательно для заполнения');
                    isValid = false;
                } else if (field.type === 'email' && !isValidEmail(field.value)) {
                    showFieldError(field, 'Введите корректный email адрес');
                    isValid = false;
                } else if (field.type === 'tel' && !isValidPhone(field.value)) {
                    showFieldError(field, 'Введите корректный номер телефона');
                    isValid = false;
                }
            });

            return isValid;
        }

        // Валидация email
        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        // Валидация телефона (простая проверка на цифры и длину)
        function isValidPhone(phone) {
            const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,}$/;
            return phoneRegex.test(phone);
        }

        // Показать ошибку для конкретного поля
        function showFieldError(field, message) {
            field.classList.add('border-red-500');

            // Удаляем существующую ошибку
            const existingError = field.parentNode.querySelector('.field-error');
            if (existingError) {
                existingError.remove();
            }

            // Добавляем новую ошибку
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error text-red-500 text-sm mt-1';
            errorDiv.textContent = message;
            field.parentNode.appendChild(errorDiv);
        }

        // Очистить все ошибки формы
        function clearFormErrors() {
            const errorElements = form.querySelectorAll('.field-error');
            errorElements.forEach(error => error.remove());

            const errorFields = form.querySelectorAll('.border-red-500');
            errorFields.forEach(field => field.classList.remove('border-red-500'));
        }

        // Показать общее сообщение об ошибке
        function showErrorMessage(message) {
            // Можете использовать ваш собственный способ показа уведомлений
            alert(message);

            // Или создать красивое уведомление:
            /*
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50';
            notification.textContent = message;
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.remove();
            }, 5000);
            */
        }

        // Показать ошибки валидации с сервера
        function displayFormErrors(errors) {
            if (errors && typeof errors === 'object') {
                Object.keys(errors).forEach(fieldName => {
                    const field = form.querySelector(`[name="${fieldName}"]`);
                    if (field) {
                        showFieldError(field, errors[fieldName][0]);
                    }
                });
            }
        }

        // Очистка ошибок при вводе
        form.addEventListener('input', function(e) {
            if (e.target.classList.contains('border-red-500')) {
                e.target.classList.remove('border-red-500');
                const errorElement = e.target.parentNode.querySelector('.field-error');
                if (errorElement) {
                    errorElement.remove();
                }
            }
        });
    }
});