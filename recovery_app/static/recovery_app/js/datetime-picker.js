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
        
        this.container.appendChild(dropdown);
        this.dropdown = dropdown;
        
        // Create overlay for mobile
        const overlay = document.createElement('div');
        overlay.className = 'datetime-picker-overlay';
        document.body.appendChild(overlay);
        this.overlay = overlay;
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
        // Input click
        this.input.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); 
            this.toggle();
        });
        
        // Dropdown clicks with better event handling
        this.dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Handle navigation buttons (including icons inside)
            const navBtn = e.target.closest('.datetime-picker-nav-btn');
            if (navBtn) {
                this.handleNavigation(navBtn.dataset.action);
                return;
            }
            
            // Handle date selection
            const dateEl = e.target.closest('.datetime-picker-date');
            if (dateEl && !dateEl.classList.contains('disabled')) {
                this.selectDate(dateEl.dataset.date);
                return;
            }
            
            // Handle time slot selection
            const timeEl = e.target.closest('.datetime-picker-time-slot');
            if (timeEl && !timeEl.classList.contains('disabled')) {
                this.selectTime(timeEl.dataset.time);
                return;
            }
            
            // Handle quick options
            const quickBtn = e.target.closest('.datetime-picker-quick-btn');
            if (quickBtn) {
                this.handleQuickOption(quickBtn.dataset.action);
                return;
            }
            
            // Handle clear button
            if (e.target.matches('.datetime-picker-clear-btn')) {
                this.clear();
                return;
            }
            
            // Handle confirm button
            if (e.target.matches('.datetime-picker-confirm-btn')) {
                this.confirm();
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
        
        // Outside click - close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target) && this.isOpen()) {
                console.log('Outside click detected, closing calendar');
                this.close();
            }
        });
        
        // Overlay click (mobile only)
        this.overlay.addEventListener('click', () => {
            console.log('Overlay clicked, closing calendar');
            this.close();
        });
        
        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
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
        
        // Smart positioning - check if there's enough space below
        this.adjustPosition();
        
        this.dropdown.classList.add('active');
        
        // Временно отключаем overlay - он блокирует клики
        // if (window.innerWidth <= 640) {
        //     this.overlay.classList.add('active');
        // }
        
        // Update calendar for current month
        this.updateCalendar();
        
        // Calendar opened successfully
    }
    
    close() {
        this.dropdown.classList.remove('active');
        this.dropdown.classList.remove('show-above');
        this.dropdown.classList.remove('show-fixed');
        this.overlay.classList.remove('active');
    }
    
    adjustPosition() {
        const viewportWidth = window.innerWidth;
        
        if (viewportWidth > 640) {
            // Desktop: используем fixed позиционирование для правильного z-index
            this.dropdown.classList.add('show-above');
            this.dropdown.classList.add('show-fixed');
            
            const inputRect = this.input.getBoundingClientRect();
            const dropdownHeight = this.dropdown.offsetHeight || 400;
            const topPosition = inputRect.top - dropdownHeight - 10;
            
            // Используем fixed позиционирование для корректного отображения поверх других элементов
            this.dropdown.style.position = 'fixed';
            this.dropdown.style.top = `${Math.max(10, topPosition)}px`;
            this.dropdown.style.left = `${inputRect.left}px`;
            this.dropdown.style.width = `${Math.max(300, inputRect.width)}px`;
            this.dropdown.style.zIndex = '999999';
        } else {
            // Mobile: полностью полагаемся на CSS
            this.dropdown.classList.remove('show-above');
            this.dropdown.classList.remove('show-fixed');
            
            // Убираем все inline стили - пусть CSS решает
            this.dropdown.style.position = '';
            this.dropdown.style.top = '';
            this.dropdown.style.left = '';
            this.dropdown.style.right = '';
            this.dropdown.style.bottom = '';
            this.dropdown.style.width = '';
            this.dropdown.style.height = '';
            this.dropdown.style.transform = '';
            this.dropdown.style.zIndex = '';
            
            // Mobile styles cleared
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