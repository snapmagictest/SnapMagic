/**
 * SnapMagic - Utility Functions
 * Common utility functions used throughout the application
 */

// Utility object to hold all utility functions
const Utils = {
    
    /**
     * Generate a unique ID
     * @returns {string} Unique identifier
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    /**
     * Debounce function to limit function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Throttle function to limit function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    /**
     * Format file size in human readable format
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    /**
     * Format duration in human readable format
     * @param {number} seconds - Duration in seconds
     * @returns {string} Formatted duration
     */
    formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
    
    /**
     * Check if device has camera support
     * @returns {boolean} True if camera is supported
     */
    isCameraSupported() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    },
    
    /**
     * Check if device is mobile
     * @returns {boolean} True if mobile device
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    /**
     * Check if device is iOS
     * @returns {boolean} True if iOS device
     */
    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent);
    },
    
    /**
     * Get device type
     * @returns {string} Device type (mobile, tablet, desktop)
     */
    getDeviceType() {
        const width = window.innerWidth;
        if (width <= 767) return 'mobile';
        if (width <= 1024) return 'tablet';
        return 'desktop';
    },
    
    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} Success status
     */
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const success = document.execCommand('copy');
                textArea.remove();
                return success;
            }
        } catch (error) {
            console.error('Failed to copy text:', error);
            return false;
        }
    },
    
    /**
     * Download file from URL
     * @param {string} url - File URL
     * @param {string} filename - Filename for download
     */
    downloadFile(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },
    
    /**
     * Convert blob to base64
     * @param {Blob} blob - Blob to convert
     * @returns {Promise<string>} Base64 string
     */
    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    },
    
    /**
     * Convert base64 to blob
     * @param {string} base64 - Base64 string
     * @param {string} mimeType - MIME type
     * @returns {Blob} Blob object
     */
    base64ToBlob(base64, mimeType) {
        const byteCharacters = atob(base64.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    },
    
    /**
     * Compress image
     * @param {File|Blob} file - Image file
     * @param {number} quality - Compression quality (0-1)
     * @param {number} maxWidth - Maximum width
     * @param {number} maxHeight - Maximum height
     * @returns {Promise<Blob>} Compressed image blob
     */
    compressImage(file, quality = 0.8, maxWidth = 1920, maxHeight = 1080) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Calculate new dimensions
                let { width, height } = img;
                
                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob(resolve, 'image/jpeg', quality);
            };
            
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    },
    
    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    /**
     * Sanitize HTML string
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized string
     */
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },
    
    /**
     * Parse URL parameters
     * @param {string} url - URL to parse (optional, defaults to current URL)
     * @returns {Object} URL parameters object
     */
    parseURLParams(url = window.location.href) {
        const params = {};
        const urlObj = new URL(url);
        for (const [key, value] of urlObj.searchParams) {
            params[key] = value;
        }
        return params;
    },
    
    /**
     * Format date for display
     * @param {Date|string} date - Date to format
     * @param {Object} options - Formatting options
     * @returns {string} Formatted date string
     */
    formatDate(date, options = {}) {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return dateObj.toLocaleDateString('en-US', { ...defaultOptions, ...options });
    },
    
    /**
     * Get relative time string (e.g., "2 minutes ago")
     * @param {Date|string} date - Date to compare
     * @returns {string} Relative time string
     */
    getRelativeTime(date) {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const now = new Date();
        const diffInSeconds = Math.floor((now - dateObj) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        
        return this.formatDate(dateObj);
    },
    
    /**
     * Local storage wrapper with error handling
     */
    storage: {
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Failed to save to localStorage:', error);
                return false;
            }
        },
        
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Failed to read from localStorage:', error);
                return defaultValue;
            }
        },
        
        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Failed to remove from localStorage:', error);
                return false;
            }
        },
        
        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.error('Failed to clear localStorage:', error);
                return false;
            }
        }
    },
    
    /**
     * Session storage wrapper with error handling
     */
    sessionStorage: {
        set(key, value) {
            try {
                sessionStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Failed to save to sessionStorage:', error);
                return false;
            }
        },
        
        get(key, defaultValue = null) {
            try {
                const item = sessionStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Failed to read from sessionStorage:', error);
                return defaultValue;
            }
        },
        
        remove(key) {
            try {
                sessionStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Failed to remove from sessionStorage:', error);
                return false;
            }
        },
        
        clear() {
            try {
                sessionStorage.clear();
                return true;
            } catch (error) {
                console.error('Failed to clear sessionStorage:', error);
                return false;
            }
        }
    }
};

// Toast notification system
const Toast = {
    container: null,
    
    init() {
        this.container = document.getElementById('toastContainer');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toastContainer';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    },
    
    show(message, type = 'info', duration = 5000, title = '') {
        if (!this.container) this.init();
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${Utils.sanitizeHTML(title)}</div>` : ''}
                <div class="toast-message">${Utils.sanitizeHTML(message)}</div>
            </div>
            <button class="toast-close" aria-label="Close notification">×</button>
        `;
        
        // Add event listeners
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.remove(toast));
        
        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => this.remove(toast), duration);
        }
        
        this.container.appendChild(toast);
        
        // Trigger animation
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        });
        
        return toast;
    },
    
    remove(toast) {
        if (toast && toast.parentNode) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    },
    
    success(message, title = 'Success') {
        return this.show(message, 'success', 5000, title);
    },
    
    error(message, title = 'Error') {
        return this.show(message, 'error', 8000, title);
    },
    
    warning(message, title = 'Warning') {
        return this.show(message, 'warning', 6000, title);
    },
    
    info(message, title = '') {
        return this.show(message, 'info', 5000, title);
    }
};

// Loading overlay utility
const Loading = {
    overlay: null,
    
    init() {
        this.overlay = document.getElementById('loadingOverlay');
        if (!this.overlay) {
            this.overlay = document.createElement('div');
            this.overlay.id = 'loadingOverlay';
            this.overlay.className = 'loading-overlay hidden';
            this.overlay.innerHTML = `
                <div class="loading-content">
                    <div class="processing-spinner"></div>
                    <p class="loading-text" id="loadingText">Loading...</p>
                </div>
            `;
            document.body.appendChild(this.overlay);
        }
    },
    
    show(text = 'Loading...') {
        if (!this.overlay) this.init();
        
        const textElement = this.overlay.querySelector('#loadingText');
        if (textElement) {
            textElement.textContent = text;
        }
        
        this.overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    },
    
    hide() {
        if (this.overlay) {
            this.overlay.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }
};

// Performance monitoring
const Performance = {
    marks: new Map(),
    
    mark(name) {
        this.marks.set(name, performance.now());
    },
    
    measure(name, startMark) {
        const startTime = this.marks.get(startMark);
        if (startTime) {
            const duration = performance.now() - startTime;
            console.log(`${name}: ${duration.toFixed(2)}ms`);
            return duration;
        }
        return 0;
    },
    
    log(message, data = {}) {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log(`[SnapMagic] ${message}`, data);
        }
    }
};

// Initialize toast system when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Toast.init());
} else {
    Toast.init();
}

// Export for use in other modules
window.Utils = Utils;
window.Toast = Toast;
window.Loading = Loading;
window.Performance = Performance;
