/**
 * DateTime Picker Component
 * A beautiful calendar and time picker for the recovery service form
 */

class DateTimePicker {
    constructor(input, options = {}) {
        this.input = input;
        this.options = {
            minDate: new Date(),
            maxDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            timeSlots: [
                'ASAP',
                '08:00', '09:00', '10:00', '11:00', '12:00',
                '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
            ],
            quickOptions: [
                { label: 'ASAP', action: 'asap' },
                { label: 'Today', action: 'today' },
                { label: 'Tomorrow', action: 'tomorrow' },
                { label: 'This Weekend', action: 'weekend' }
            ],
            ...options
        };
        
        this.selectedDate = null;
        this.selectedTime = null;
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        
        this.monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        this.weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        this.init();
    }
    
    init() {
        try {
            console.log('DateTimePicker init started'); // Debug log
            this.createContainer();
            console.log('Container created'); // Debug log
            this.createDropdown();
            console.log('Dropdown created'); // Debug log
            this.bindEvents();
            console.log('Events bound'); // Debug log
            this.updateInputValue();
            console.log('DateTimePicker init completed'); // Debug log
        } catch (error) {
            console.error('Error in DateTimePicker init:', error); // Debug log
            throw error;
        }
    }
    
    createContainer() {
        // Wrap the input in a container
        const container = document.createElement('div');
        container.className = 'datetime-picker-container';
        
        this.input.parentNode.insertBefore(container, this.input);
        container.appendChild(this.input);
        
        // Add icon
        const icon = document.createElement('i');
        icon.className = 'fas fa-calendar-alt datetime-picker-icon';
        container.appendChild(icon);
        
        // Make input readonly and add custom class
        this.input.readOnly = true;
        this.input.classList.add('datetime-picker-input');
        
        this.container = container;
        console.log('Container created:', container);
    }
    
    createDropdown() {
        const dropdown = document.createElement('div');
        dropdown.className = 'datetime-picker-dropdown';
        dropdown.innerHTML = this.getDropdownHTML();
        
        // ВСЕГДА добавляем в body для полной изоляции от родительских элементов
        document.body.appendChild(dropdown);
        this.dropdown = dropdown;
        
        // Create overlay - всегда создаем для блокировки фона
        const overlay = document.createElement('div');
        overlay.className = 'datetime-picker-overlay';
        document.body.appendChild(overlay);
        this.overlay = overlay;
        
        // Добавляем ID для уникальности
        dropdown.id = 'datetime-picker-' + Date.now();
        console.log('Dropdown created with ID:', dropdown.id);
    }
    
    getDropdownHTML() {
        return `
            <div class="datetime-picker-quick-options">
                <h4>Quick Options</h4>
                <div class="datetime-picker-quick-buttons">
                    ${this.options.quickOptions.map(option => 
                        `<button type="button" class="datetime-picker-quick-btn" data-action="${option.action}">${option.label}</button>`
                    ).join('')}
                </div>
            </div>
            
            <div class="datetime-picker-header">
                <button type="button" class="datetime-picker-nav-btn" data-action="prev-month">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <div class="datetime-picker-month-year">
                    ${this.monthNames[this.currentMonth]} ${this.currentYear}
                </div>
                <button type="button" class="datetime-picker-nav-btn" data-action="next-month">
                    <i class="fas fa-chevron-right"></i>
                </button>
                <button type="button" class="datetime-picker-close-btn" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 8px; border-radius: 4px; cursor: pointer; font-size: 14px; margin-left: 10px;">×</button>
            </div>
            
            <div class="datetime-picker-body">
                <div class="datetime-picker-weekdays">
                    ${this.weekdays.map(day => `<div class="datetime-picker-weekday">${day}</div>`).join('')}
                </div>
                <div class="datetime-picker-dates">
                    ${this.getCalendarDates()}
                </div>
                
                <div class="datetime-picker-time-section">
                    <div class="datetime-picker-time-header">
                        <i class="fas fa-clock"></i>
                        Select Time
                    </div>
                    <div class="datetime-picker-time-slots">
                        ${this.options.timeSlots.map(time => 
                            `<button type="button" class="datetime-picker-time-slot" data-time="${time}">${time}</button>`
                        ).join('')}
                    </div>
                </div>
            </div>
            
            <div class="datetime-picker-actions">
                <button type="button" class="datetime-picker-clear-btn">Clear</button>
                <button type="button" class="datetime-picker-confirm-btn" disabled>Confirm</button>
            </div>
        `;
    }
    
    getCalendarDates() {
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const dates = [];
        const today = new Date();
        
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const isCurrentMonth = date.getMonth() === this.currentMonth;
            const isToday = this.isSameDay(date, today);
            const isSelected = this.selectedDate && this.isSameDay(date, this.selectedDate);
            const isDisabled = date < this.options.minDate || date > this.options.maxDate;
            
            let classes = 'datetime-picker-date';
            if (!isCurrentMonth) classes += ' other-month';
            if (isToday) classes += ' today';
            if (isSelected) classes += ' selected';
            if (isDisabled) classes += ' disabled';
            
            dates.push(`
                <div class="${classes}" data-date="${date.toISOString().split('T')[0]}">
                    ${date.getDate()}
                </div>
            `);
        }
        
        return dates.join('');
    }
    
    bindEvents() {
        // Input click - разная логика для десктопа и мобильных
        this.input.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Input clicked, current state:', this.isOpen(), 'viewport width:', window.innerWidth); // Debug log
            
            // На десктопе всегда открываем, на мобильных - toggle
            if (window.innerWidth > 640) {
                if (!this.isOpen()) {
                    console.log('Desktop: Opening calendar');
                    this.open();
                }
            } else {
                // Мобильная логика остается прежней
                if (this.isOpen()) {
                    this.close();
                } else {
                    this.open();
                }
            }
        });
        
        // Dropdown clicks with better event handling
        this.dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Dropdown clicked, target:', e.target, 'closest clear:', e.target.closest('.datetime-picker-clear-btn'), 'closest confirm:', e.target.closest('.datetime-picker-confirm-btn'));
            
            // Handle navigation buttons (including icons inside)
            const navBtn = e.target.closest('.datetime-picker-nav-btn');
            if (navBtn) {
                e.preventDefault();
                this.handleNavigation(navBtn.dataset.action);
                return;
            }
            
            // Handle date selection
            const dateEl = e.target.closest('.datetime-picker-date');
            if (dateEl && !dateEl.classList.contains('disabled')) {
                e.preventDefault();
                this.selectDate(dateEl.dataset.date);
                return;
            }
            
            // Handle time slot selection
            const timeEl = e.target.closest('.datetime-picker-time-slot');
            if (timeEl && !timeEl.classList.contains('disabled')) {
                e.preventDefault();
                this.selectTime(timeEl.dataset.time);
                return;
            }
            
            // Handle quick options
            const quickBtn = e.target.closest('.datetime-picker-quick-btn');
            if (quickBtn) {
                e.preventDefault();
                this.handleQuickOption(quickBtn.dataset.action);
                return;
            }
            
            // Handle clear button
            const clearBtn = e.target.closest('.datetime-picker-clear-btn');
            if (clearBtn) {
                e.preventDefault();
                console.log('Clear button clicked');
                this.clear();
                return;
            }
            
            // Handle confirm button
            const confirmBtn = e.target.closest('.datetime-picker-confirm-btn');
            if (confirmBtn) {
                e.preventDefault();
                console.log('Confirm button clicked');
                this.confirm();
                return;
            }
            
            // Handle close button (X)
            const closeBtn = e.target.closest('.datetime-picker-close-btn');
            if (closeBtn) {
                e.preventDefault();
                console.log('Close X button clicked');
                this.close();
                return;
            }
        });
        
        // ТОЛЬКО для мобильных - добавляем touch события
        if (window.innerWidth <= 640) {
            this.dropdown.addEventListener('touchend', (e) => {
                // Имитируем click событие для touch
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                e.target.dispatchEvent(clickEvent);
                e.preventDefault();
            });
        }
        
        // Удаляем ненужный флаг isOpening
        
        // Дополнительные обработчики для кнопок на десктопе
        if (window.innerWidth > 640) {
            // Используем mousedown для более надежной обработки кликов на десктопе
            this.dropdown.addEventListener('mousedown', (e) => {
                const clearBtn = e.target.closest('.datetime-picker-clear-btn');
                const confirmBtn = e.target.closest('.datetime-picker-confirm-btn');
                const closeBtn = e.target.closest('.datetime-picker-close-btn');
                
                if (clearBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Desktop: Clear button mousedown');
                    this.clear();
                    return;
                }
                
                if (confirmBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Desktop: Confirm button mousedown');
                    this.confirm();
                    return;
                }
                
                if (closeBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Desktop: Close X button mousedown');
                    this.close();
                    return;
                }
            });
        }
        
        // Overlay click - закрываем календарь - НЕСКОЛЬКО обработчиков для надежности
        this.overlay.addEventListener('click', (e) => {
            console.log('Overlay clicked - closing dropdown');
            e.preventDefault();
            e.stopPropagation();
            this.close();
        });
        
        this.overlay.addEventListener('mousedown', (e) => {
            console.log('Overlay mousedown - closing dropdown');
            e.preventDefault();
            e.stopPropagation();
            this.close();
        });
        
        this.overlay.addEventListener('touchstart', (e) => {
            console.log('Overlay touchstart - closing dropdown');
            e.preventDefault();
            e.stopPropagation();
            this.close();
        });
        
        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
        
        // Клик вне модального окна для закрытия - ТОЛЬКО для десктопа
        document.addEventListener('click', (e) => {
            if (this.isOpen() && 
                window.innerWidth > 640 && // Только на десктопе
                !this.dropdown.contains(e.target) && 
                !this.input.contains(e.target) &&
                !this.overlay.contains(e.target)) {
                console.log('Desktop: Clicked outside modal - closing');
                this.close();
            }
        });
        
        // Additional touch debugging
        this.dropdown.addEventListener('touchstart', (e) => {
            console.log('Touch start on dropdown:', e.target);
        }, { passive: true });
    }
    
    toggle() {
        console.log('Toggle called, isOpen:', this.isOpen()); // Debug log
        if (this.isOpen()) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        console.log('Opening calendar, window width:', window.innerWidth); // Debug log
        console.log('Dropdown element:', this.dropdown);
        
        // Сначала устанавливаем позиционирование
        this.adjustPosition();
        
        // Принудительно устанавливаем стили для видимости ПЕРЕД добавлением класса active
        this.dropdown.style.display = 'block';
        this.dropdown.style.visibility = 'visible';
        this.dropdown.style.opacity = '1';
        
        // Потом добавляем класс active
        this.dropdown.classList.add('active');
        
        // Показываем overlay БЕЗ задержки для десктопа, с задержкой для мобильных
        if (window.innerWidth <= 640) {
            setTimeout(() => {
                this.overlay.classList.add('active');
            }, 50);
        } else {
            this.overlay.classList.add('active');
        }
        
        // Update calendar for current month
        this.updateCalendar();
        
        console.log('Dropdown styles after open:', {
            position: this.dropdown.style.position,
            zIndex: this.dropdown.style.zIndex,
            top: this.dropdown.style.top,
            left: this.dropdown.style.left,
            display: this.dropdown.style.display,
            visibility: this.dropdown.style.visibility,
            opacity: this.dropdown.style.opacity
        });
        
        // Calendar opened successfully
    }
    
    close() {
        console.log('Closing calendar - removing all styles and classes');
        
        // Убираем все классы
        this.dropdown.classList.remove('active');
        this.dropdown.classList.remove('show-above');
        this.dropdown.classList.remove('show-fixed');
        this.overlay.classList.remove('active');
        
        // ПРИНУДИТЕЛЬНО сбрасываем все стили для скрытия
        this.dropdown.style.display = 'none';
        this.dropdown.style.visibility = 'hidden';
        this.dropdown.style.opacity = '0';
        
        // Скрываем overlay
        this.overlay.style.display = 'none';
        this.overlay.style.visibility = 'hidden';
        this.overlay.style.opacity = '0';
        
        console.log('Calendar closed - all styles reset');
    }
    
    // Cleanup method for proper removal
    destroy() {
        if (this.dropdown && this.dropdown.parentNode) {
            this.dropdown.parentNode.removeChild(this.dropdown);
        }
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
    }
    
    adjustPosition() {
        const viewportWidth = window.innerWidth;
        
        // ВСЕГДА используем position: fixed и максимальный z-index
        this.dropdown.style.position = 'fixed';
        this.dropdown.style.zIndex = '2147483647';
        
        if (viewportWidth > 640) {
            // Desktop: умное позиционирование
            this.dropdown.classList.remove('show-fixed');
            
            const inputRect = this.input.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            
            // Фиксированные размеры для предсказуемости
            const dropdownWidth = 380;
            const dropdownHeight = 500;
            
            // Проверяем где больше места - сверху или снизу от input
            const spaceAbove = inputRect.top;
            const spaceBelow = viewportHeight - inputRect.bottom;
            
            let topPosition, leftPosition;
            
            // Позиционирование по вертикали - улучшенная логика
            if (spaceBelow >= 400) {
                // Достаточно места снизу - позиционируем под input
                topPosition = inputRect.bottom + 10;
                this.dropdown.classList.remove('show-above');
                this.dropdown.style.maxHeight = `${Math.min(dropdownHeight, spaceBelow - 30)}px`;
            } else if (spaceAbove >= 400) {
                // Достаточно места сверху - позиционируем над input
                topPosition = inputRect.top - Math.min(dropdownHeight, spaceAbove - 30) - 10;
                this.dropdown.classList.add('show-above');
                this.dropdown.style.maxHeight = `${Math.min(dropdownHeight, spaceAbove - 30)}px`;
            } else {
                // Мало места и сверху и снизу - размещаем там где больше места
                if (spaceBelow > spaceAbove) {
                    // Снизу больше места
                    topPosition = inputRect.bottom + 10;
                    this.dropdown.style.maxHeight = `${Math.max(300, spaceBelow - 30)}px`;
                    this.dropdown.classList.remove('show-above');
                } else {
                    // Сверху больше места
                    topPosition = 20;
                    this.dropdown.style.maxHeight = `${Math.max(300, spaceAbove - 30)}px`;
                    this.dropdown.classList.add('show-above');
                }
            }
            
            // Всегда добавляем скролл если контент не помещается
            this.dropdown.style.overflowY = 'auto';
            
            // Позиционирование по горизонтали
            leftPosition = inputRect.left;
            
            // Проверяем, не выходит ли за правую границу экрана
            if (leftPosition + dropdownWidth > viewportWidth - 20) {
                leftPosition = Math.max(20, viewportWidth - dropdownWidth - 20);
            }
            
            // Применяем стили
            this.dropdown.style.position = 'fixed';
            this.dropdown.style.top = `${topPosition}px`;
            this.dropdown.style.left = `${leftPosition}px`;
            this.dropdown.style.width = `${dropdownWidth}px`;
            this.dropdown.style.height = 'auto';
            this.dropdown.style.right = 'auto';
            this.dropdown.style.bottom = 'auto';
            this.dropdown.style.transform = 'none';
            this.dropdown.style.margin = '0';
            
            console.log('Desktop positioning:', {
                inputRect,
                viewportHeight,
                viewportWidth,
                spaceAbove,
                spaceBelow,
                finalTop: topPosition,
                finalLeft: leftPosition,
                finalWidth: dropdownWidth,
                finalHeight: this.dropdown.style.maxHeight || 'auto'
            });
        } else {
            // Mobile: по центру экрана
            this.dropdown.classList.remove('show-above');
            this.dropdown.classList.add('show-fixed');
            
            this.dropdown.style.top = '50%';
            this.dropdown.style.left = '50%';
            this.dropdown.style.transform = 'translate(-50%, -50%)';
            this.dropdown.style.width = '90vw';
            this.dropdown.style.maxWidth = '400px';
            this.dropdown.style.height = 'auto';
            this.dropdown.style.maxHeight = '80vh';
            
            console.log('Mobile positioning applied');
        }
    }
    
    isOpen() {
        return this.dropdown.classList.contains('active');
    }
    
    handleNavigation(action) {
        if (action === 'prev-month') {
            this.currentMonth--;
            if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
            }
        } else if (action === 'next-month') {
            this.currentMonth++;
            if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
            }
        }
        
        this.updateCalendar();
    }
    
    updateCalendar() {
        // Update header
        const monthYear = this.dropdown.querySelector('.datetime-picker-month-year');
        monthYear.textContent = `${this.monthNames[this.currentMonth]} ${this.currentYear}`;
        
        // Update dates
        const datesContainer = this.dropdown.querySelector('.datetime-picker-dates');
        datesContainer.innerHTML = this.getCalendarDates();
        
        // Update time slots if date is selected
        if (this.selectedDate) {
            this.updateTimeSlots();
        }
    }
    
    selectDate(dateString) {
        this.selectedDate = new Date(dateString);
        
        // Update visual selection
        this.dropdown.querySelectorAll('.datetime-picker-date').forEach(el => {
            el.classList.remove('selected');
        });
        this.dropdown.querySelector(`[data-date="${dateString}"]`).classList.add('selected');
        
        // Update time slots
        this.updateTimeSlots();
        
        // Update confirm button
        this.updateConfirmButton();
    }
    
    selectTime(time) {
        this.selectedTime = time;
        
        // Update visual selection
        this.dropdown.querySelectorAll('.datetime-picker-time-slot').forEach(el => {
            el.classList.remove('selected');
        });
        this.dropdown.querySelector(`[data-time="${time}"]`).classList.add('selected');
        
        // Update confirm button
        this.updateConfirmButton();
    }
    
    updateTimeSlots() {
        if (!this.selectedDate) return;
        
        const today = new Date();
        const isToday = this.isSameDay(this.selectedDate, today);
        const currentHour = today.getHours();
        
        this.dropdown.querySelectorAll('.datetime-picker-time-slot').forEach(slot => {
            const time = slot.dataset.time;
            
            if (time === 'ASAP') {
                slot.classList.remove('disabled');
                return;
            }
            
            if (isToday) {
                const slotHour = parseInt(time.split(':')[0]);
                if (slotHour <= currentHour) {
                    slot.classList.add('disabled');
                } else {
                    slot.classList.remove('disabled');
                }
            } else {
                slot.classList.remove('disabled');
            }
        });
    }
    
    handleQuickOption(action) {
        const today = new Date();
        
        switch (action) {
            case 'asap':
                this.selectedDate = today;
                this.selectedTime = 'ASAP';
                this.confirm();
                break;
                
            case 'today':
                this.selectDate(today.toISOString().split('T')[0]);
                this.currentMonth = today.getMonth();
                this.currentYear = today.getFullYear();
                this.updateCalendar();
                break;
                
            case 'tomorrow':
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                this.selectDate(tomorrow.toISOString().split('T')[0]);
                this.currentMonth = tomorrow.getMonth();
                this.currentYear = tomorrow.getFullYear();
                this.updateCalendar();
                break;
                
            case 'weekend':
                const weekend = this.getNextWeekend();
                this.selectDate(weekend.toISOString().split('T')[0]);
                this.currentMonth = weekend.getMonth();
                this.currentYear = weekend.getFullYear();
                this.updateCalendar();
                break;
        }
    }
    
    getNextWeekend() {
        const today = new Date();
        const daysUntilSaturday = 6 - today.getDay();
        const saturday = new Date(today);
        saturday.setDate(today.getDate() + daysUntilSaturday);
        return saturday;
    }
    
    updateConfirmButton() {
        const confirmBtn = this.dropdown.querySelector('.datetime-picker-confirm-btn');
        confirmBtn.disabled = !this.selectedDate || !this.selectedTime;
    }
    
    clear() {
        this.selectedDate = null;
        this.selectedTime = null;
        this.input.value = '';
        
        // Clear visual selections
        this.dropdown.querySelectorAll('.datetime-picker-date').forEach(el => {
            el.classList.remove('selected');
        });
        this.dropdown.querySelectorAll('.datetime-picker-time-slot').forEach(el => {
            el.classList.remove('selected');
        });
        
        this.updateConfirmButton();
        this.close();
    }
    
    confirm() {
        if (!this.selectedDate || !this.selectedTime) return;
        
        this.updateInputValue();
        this.close();
        
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        this.input.dispatchEvent(event);
    }
    
    updateInputValue() {
        if (!this.selectedDate || !this.selectedTime) {
            this.input.value = '';
            return;
        }
        
        const dateStr = this.formatDate(this.selectedDate);
        
        if (this.selectedTime === 'ASAP') {
            this.input.value = `${dateStr} - ASAP`;
        } else {
            this.input.value = `${dateStr} at ${this.selectedTime}`;
        }
    }
    
    formatDate(date) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (this.isSameDay(date, today)) {
            return 'Today';
        } else if (this.isSameDay(date, tomorrow)) {
            return 'Tomorrow';
        } else {
            const options = { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            };
            return date.toLocaleDateString('en-US', options);
        }
    }
    
    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
}

// Simple test
console.log('DateTime Picker script loaded!');
console.log('Touch support:', 'ontouchstart' in window);
console.log('User agent:', navigator.userAgent);

// Глобальная функция аварийного закрытия
window.forceCloseDatetimePicker = function() {
    console.log('EMERGENCY: Force closing all datetime pickers');
    document.querySelectorAll('.datetime-picker-dropdown').forEach(dropdown => {
        dropdown.style.display = 'none';
        dropdown.style.visibility = 'hidden';
        dropdown.style.opacity = '0';
        dropdown.classList.remove('active');
    });
    document.querySelectorAll('.datetime-picker-overlay').forEach(overlay => {
        overlay.style.display = 'none';
        overlay.style.visibility = 'hidden';
        overlay.style.opacity = '0';
        overlay.classList.remove('active');
    });
};

// Initialize datetime pickers when DOM is loaded  
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing datetime picker'); // Debug log
    
    const preferredTimeInput = document.getElementById('preferred_time');
    console.log('Input found:', preferredTimeInput); // Debug log
    console.log('Input type:', typeof preferredTimeInput); // Debug log
    
    if (preferredTimeInput) {
        console.log('Input element details:', {
            id: preferredTimeInput.id,
            name: preferredTimeInput.name,
            value: preferredTimeInput.value,
            tagName: preferredTimeInput.tagName
        });
        
        try {
            const picker = new DateTimePicker(preferredTimeInput, {
                timeSlots: [
                    'ASAP',
                    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
                    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
                ],
                quickOptions: [
                    { label: 'ASAP', action: 'asap' },
                    { label: 'Today', action: 'today' },
                    { label: 'Tomorrow', action: 'tomorrow' },
                    { label: 'This Weekend', action: 'weekend' }
                ]
            });
            console.log('DateTimePicker initialized successfully:', picker); // Debug log
            
            // Test click manually
            preferredTimeInput.addEventListener('click', function() {
                console.log('Manual click listener triggered!');
            });
            
        } catch (error) {
            console.error('Error initializing DateTimePicker:', error); // Debug log
            console.error('Error stack:', error.stack); // Debug log
        }
    } else {
        console.log('preferred_time input not found'); // Debug log
        console.log('All inputs on page:', document.querySelectorAll('input')); // Debug log
    }
});