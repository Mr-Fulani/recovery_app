/**
 * Галерея с фильтрами, модальным окном и лайтбоксом
 */

class PhotoGallery {
    constructor() {
        this.modal = document.getElementById('imageModal');
        this.modalImage = document.getElementById('modalImage');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalDescription = document.getElementById('modalDescription');
        this.modalClose = document.getElementById('modalClose');
        this.modalOverlay = document.getElementById('modalOverlay');
        this.prevBtn = document.getElementById('prevImage');
        this.nextBtn = document.getElementById('nextImage');
        this.downloadBtn = document.getElementById('downloadFull');
        this.shareBtn = document.getElementById('shareBtn');
        
        this.galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.loadMoreBtn = document.getElementById('loadMoreBtn');
        
        this.currentImageIndex = 0;
        this.filteredItems = [...this.galleryItems];
        this.currentFilter = 'all';
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupLazyLoading();
        this.setupKeyboardNavigation();
    }

    bindEvents() {
        // Кнопки фильтров
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e));
        });

        // Кнопки просмотра изображений
        document.querySelectorAll('.view-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => this.openModal(index));
        });

        // Кнопки скачивания
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.downloadImage(e));
        });

        // Модальное окно
        this.modalClose?.addEventListener('click', () => this.closeModal());
        this.modalOverlay?.addEventListener('click', () => this.closeModal());
        this.prevBtn?.addEventListener('click', () => this.prevImage());
        this.nextBtn?.addEventListener('click', () => this.nextImage());
        this.downloadBtn?.addEventListener('click', () => this.downloadCurrentImage());
        this.shareBtn?.addEventListener('click', () => this.shareCurrentImage());

        // Кнопка "Загрузить еще"
        this.loadMoreBtn?.addEventListener('click', () => this.loadMore());

        // Escape для закрытия модального окна
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (!this.modal.classList.contains('active')) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prevImage();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextImage();
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.closeModal();
                    break;
            }
        });
    }

    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-loading');
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    handleFilter(e) {
        const filter = e.target.dataset.filter;
        this.currentFilter = filter;
        
        // Обновляем активную кнопку
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        // Фильтруем элементы
        this.filterItems(filter);
    }

    filterItems(filter) {
        this.galleryItems.forEach((item, index) => {
            const categories = item.dataset.category;
            const shouldShow = filter === 'all' || categories.includes(filter);
            
            if (shouldShow) {
                item.classList.remove('filtered');
                item.style.display = 'block';
            } else {
                item.classList.add('filtered');
                setTimeout(() => {
                    if (item.classList.contains('filtered')) {
                        item.style.display = 'none';
                    }
                }, 300);
            }
        });

        // Обновляем массив отфильтрованных элементов
        this.filteredItems = this.galleryItems.filter(item => !item.classList.contains('filtered'));
    }

    openModal(index) {
        // Находим правильный индекс в отфильтрованном массиве
        const visibleItems = this.galleryItems.filter(item => !item.classList.contains('filtered'));
        this.currentImageIndex = index;
        
        const item = visibleItems[index];
        if (!item) return;
        
        const viewBtn = item.querySelector('.view-btn');
        const imageUrl = viewBtn.dataset.image;
        const title = viewBtn.dataset.title;
        const description = viewBtn.dataset.description;
        
        this.modalImage.src = imageUrl;
        this.modalTitle.textContent = title;
        this.modalDescription.textContent = description;
        
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Обновляем данные для скачивания и шеринга
        this.downloadBtn.dataset.image = imageUrl;
        this.shareBtn.dataset.image = imageUrl;
        this.shareBtn.dataset.title = title;
    }

    closeModal() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    prevImage() {
        const visibleItems = this.galleryItems.filter(item => !item.classList.contains('filtered'));
        this.currentImageIndex = (this.currentImageIndex - 1 + visibleItems.length) % visibleItems.length;
        this.updateModalImage();
    }

    nextImage() {
        const visibleItems = this.galleryItems.filter(item => !item.classList.contains('filtered'));
        this.currentImageIndex = (this.currentImageIndex + 1) % visibleItems.length;
        this.updateModalImage();
    }

    updateModalImage() {
        const visibleItems = this.galleryItems.filter(item => !item.classList.contains('filtered'));
        const item = visibleItems[this.currentImageIndex];
        if (!item) return;
        
        const viewBtn = item.querySelector('.view-btn');
        const imageUrl = viewBtn.dataset.image;
        const title = viewBtn.dataset.title;
        const description = viewBtn.dataset.description;
        
        // Анимация смены изображения
        this.modalImage.style.opacity = '0';
        setTimeout(() => {
            this.modalImage.src = imageUrl;
            this.modalTitle.textContent = title;
            this.modalDescription.textContent = description;
            this.modalImage.style.opacity = '1';
            
            // Обновляем данные для скачивания и шеринга
            this.downloadBtn.dataset.image = imageUrl;
            this.shareBtn.dataset.image = imageUrl;
            this.shareBtn.dataset.title = title;
        }, 150);
    }

    downloadImage(e) {
        const imageUrl = e.target.closest('.download-btn').dataset.image;
        this.downloadFile(imageUrl);
    }

    downloadCurrentImage() {
        const imageUrl = this.downloadBtn.dataset.image;
        this.downloadFile(imageUrl);
    }

    downloadFile(url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = url.split('/').pop();
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    shareCurrentImage() {
        const imageUrl = this.shareBtn.dataset.image;
        const title = this.shareBtn.dataset.title;
        
        if (navigator.share) {
            navigator.share({
                title: title,
                text: `Check out this photo: ${title}`,
                url: window.location.href
            }).catch(err => console.log('Error sharing:', err));
        } else {
            // Fallback - копируем ссылку в буфер обмена
            const shareUrl = `${window.location.origin}${window.location.pathname}`;
            navigator.clipboard.writeText(shareUrl).then(() => {
                this.showNotification('Link copied to clipboard!');
            }).catch(() => {
                // Fallback для старых браузеров
                const textArea = document.createElement('textarea');
                textArea.value = shareUrl;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showNotification('Link copied to clipboard!');
            });
        }
    }

    loadMore() {
        // Эмуляция загрузки дополнительных фото
        this.loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Loading...';
        
        setTimeout(() => {
            this.loadMoreBtn.innerHTML = '<i class="fas fa-plus mr-2"></i>Load More Photos';
            this.showNotification('All photos loaded!');
            this.loadMoreBtn.style.display = 'none';
        }, 1500);
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Анимации для уведомлений
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Инициализация галереи
document.addEventListener('DOMContentLoaded', function() {
    const gallery = new PhotoGallery();
    
    // Добавляем плавную прокрутку к галерее при переходе с других страниц
    if (window.location.hash === '#gallery') {
        setTimeout(() => {
            document.getElementById('galleryGrid')?.scrollIntoView({ 
                behavior: 'smooth' 
            });
        }, 500);
    }
    
    // Сохраняем ссылку на галерею для глобального доступа
    window.photoGallery = gallery;
}); 