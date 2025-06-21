// Enhanced form functionality
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('orderForm');
    const phoneInput = document.querySelector('input[name="phone"]');
    const dateInput = document.querySelector('input[name="preferred_date"]');
    const timeSelect = document.querySelector('select[name="preferred_time_slot"]');
    
    // Phone number basic validation (no specific formatting)
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^\d\+\-\(\)\s]/g, '');
            e.target.value = value;
        });
    }
    
    // Date validation and smart defaults
    if (dateInput) {
        const today = new Date();
        const maxDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
        
        dateInput.min = today.toISOString().split('T')[0];
        dateInput.max = maxDate.toISOString().split('T')[0];
        
        dateInput.addEventListener('change', function() {
            const selectedDate = new Date(this.value);
            const now = new Date();
            
            // If today is selected and it's past 18:00, suggest ASAP
            if (selectedDate.toDateString() === now.toDateString() && now.getHours() >= 18 && timeSelect) {
                timeSelect.value = 'asap';
                showTooltip(timeSelect, 'We recommend selecting "ASAP" for same-day requests after 6 PM');
            }
        });
    }
    
    // Dynamic time slot filtering based on current time
    if (timeSelect && dateInput) {
        function updateTimeSlots() {
            const selectedDate = dateInput.value;
            const now = new Date();
            const selectedDateObj = new Date(selectedDate);
            
            if (selectedDate && selectedDateObj.toDateString() === now.toDateString()) {
                // If today is selected, disable past time slots
                const currentHour = now.getHours();
                const options = timeSelect.querySelectorAll('option');
                
                options.forEach(option => {
                    if (option.value !== 'asap' && option.value !== '') {
                        const optionHour = parseInt(option.value.split(':')[0]);
                        if (optionHour <= currentHour) {
                            option.disabled = true;
                            option.textContent = option.textContent + ' (past time)';
                        } else {
                            option.disabled = false;
                            option.textContent = option.value;
                        }
                    }
                });
            } else {
                // Enable all options for future dates
                const options = timeSelect.querySelectorAll('option');
                options.forEach(option => {
                    option.disabled = false;
                    if (option.value !== 'asap' && option.value !== '') {
                        option.textContent = option.value;
                    }
                });
            }
        }
        
        dateInput.addEventListener('change', updateTimeSlots);
        updateTimeSlots(); // Initial call
    }
    
    // Service type dependent fields
    const serviceTypeSelect = document.querySelector('select[name="service_type"]');
    const destinationGroup = document.querySelector('input[name="destination"]')?.closest('.form-group');
    
    if (serviceTypeSelect && destinationGroup) {
        serviceTypeSelect.addEventListener('change', function() {
            const selectedService = this.value;
            
            // Show/hide destination based on service type
            if (['vehicle_towing', 'transport_to_garage', 'accident_recovery'].includes(selectedService)) {
                destinationGroup.style.display = 'block';
                destinationGroup.querySelector('input').required = true;
            } else {
                destinationGroup.style.display = 'none';
                destinationGroup.querySelector('input').required = false;
            }
        });
        
        // Trigger on load
        serviceTypeSelect.dispatchEvent(new Event('change'));
    }
    
    // Form validation enhancement
    if (form) {
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            // Clear previous errors
            form.querySelectorAll('.form-errors').forEach(error => {
                if (!error.textContent.includes('форме')) {
                    error.remove();
                }
            });
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    showFieldError(field, 'This field is required');
                } else if (field.type === 'tel' && !isValidPhone(field.value)) {
                    isValid = false;
                    showFieldError(field, 'Please enter a valid phone number');
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                scrollToFirstError();
            }
        });
    }
    
    // Helper functions
    function showFieldError(field, message) {
        const existingError = field.parentNode.querySelector('.form-errors');
        if (!existingError) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'form-errors';
            errorDiv.textContent = message;
            field.parentNode.appendChild(errorDiv);
        }
        field.style.borderColor = '#dc2626';
    }
    
    function showTooltip(element, message) {
        const tooltip = document.createElement('div');
        tooltip.className = 'form-tooltip';
        tooltip.textContent = message;
        tooltip.style.cssText = `
            position: absolute;
            background: #1f2937;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            z-index: 1000;
            max-width: 200px;
            top: -40px;
            left: 0;
        `;
        
        element.parentNode.style.position = 'relative';
        element.parentNode.appendChild(tooltip);
        
        setTimeout(() => {
            tooltip.remove();
        }, 3000);
    }
    
    function isValidPhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.length >= 10 && cleaned.length <= 15;
    }
    
    function scrollToFirstError() {
        const firstError = document.querySelector('.form-errors');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    // Auto-save to localStorage for draft functionality
    const formData = {};
    const savableFields = ['name', 'phone', 'email', 'car_brand', 'pickup_location', 'destination'];
    
    savableFields.forEach(fieldName => {
        const field = form?.querySelector(`[name="${fieldName}"]`);
        if (field) {
            // Load saved data
            const savedValue = localStorage.getItem(`form_${fieldName}`);
            if (savedValue && !field.value) {
                field.value = savedValue;
            }
            
            // Save data on change
            field.addEventListener('input', function() {
                localStorage.setItem(`form_${fieldName}`, this.value);
            });
        }
    });
    
    // Clear saved data on successful submission
    form?.addEventListener('submit', function() {
        savableFields.forEach(fieldName => {
            localStorage.removeItem(`form_${fieldName}`);
        });
    });
});

// Additional CSS for tooltips and enhanced styling
const style = document.createElement('style');
style.textContent = `
    .form-tooltip {
        animation: fadeIn 0.3s ease-in;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .form-control:invalid {
        border-color: #dc2626;
        box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
    }
    
    .form-control:valid {
        border-color: #10b981;
    }
    
    .form-section:hover {
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        transition: box-shadow 0.3s ease;
    }
`;
document.head.appendChild(style); 