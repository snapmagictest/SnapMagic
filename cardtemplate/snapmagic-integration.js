/**
 * SnapMagic Trading Card Integration
 * Helper functions to create and manage holographic trading cards
 */

class SnapMagicTradingCard {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            eventName: options.eventName || 'AWS Event',
            creatorName: options.creatorName || 'Creator Name',
            creatorTitle: options.creatorTitle || 'Title',
            logoText: options.logoText || 'AWS',
            logoImage: options.logoImage || null,
            aiImage: options.aiImage || null,
            enableHolographic: options.enableHolographic !== false,
            ...options
        };
        
        this.cardElement = null;
        this.hoverStyleElement = null;
        
        this.init();
    }
    
    init() {
        this.createCard();
        if (this.options.enableHolographic) {
            this.setupHolographicEffect();
        }
    }
    
    createCard() {
        // Create the card HTML structure
        this.cardElement = document.createElement('div');
        this.cardElement.className = 'snapmagic-trading-card';
        
        this.cardElement.innerHTML = `
            <div class="snapmagic-card-content">
                <!-- Powered by AWS Header -->
                <div class="snapmagic-powered-header">
                    ⚡ Powered by AWS ⚡
                </div>

                <!-- AI Generated Image -->
                <div class="snapmagic-image-container">
                    ${this.options.aiImage ? 
                        `<img src="${this.options.aiImage}" alt="AI Generated Image">` : 
                        `<div class="snapmagic-image-placeholder">
                            🎨 AI Generated Image<br>
                            <small>Loading...</small>
                        </div>`
                    }
                </div>

                <!-- Event Name -->
                <div class="snapmagic-event-name">
                    ${this.options.eventName}
                </div>

                <!-- Footer: Logo and Creator -->
                <div class="snapmagic-card-footer">
                    <div class="snapmagic-event-logo">
                        ${this.options.logoImage ? 
                            `<img src="${this.options.logoImage}" alt="Event Logo">` : 
                            this.options.logoText
                        }
                    </div>
                    <div class="snapmagic-creator-info">
                        <div class="snapmagic-creator-name">${this.options.creatorName}</div>
                        <div class="snapmagic-creator-title">${this.options.creatorTitle}</div>
                    </div>
                </div>
            </div>
        `;
        
        // Add to container
        this.container.appendChild(this.cardElement);
    }
    
    setupHolographicEffect() {
        // Create style element for dynamic hover effects
        this.hoverStyleElement = document.createElement('style');
        this.hoverStyleElement.className = 'snapmagic-hover-style';
        document.head.appendChild(this.hoverStyleElement);
        
        // Generate unique ID for this card
        const cardId = `snapmagic-card-${Math.random().toString(36).substr(2, 9)}`;
        this.cardElement.id = cardId;
        
        // Add event listeners
        this.cardElement.addEventListener('mousemove', (e) => this.handleMouseMove(e, cardId));
        this.cardElement.addEventListener('mouseleave', () => this.handleMouseLeave(cardId));
        this.cardElement.addEventListener('touchmove', (e) => this.handleMouseMove(e, cardId));
        this.cardElement.addEventListener('touchend', () => this.handleMouseLeave(cardId));
    }
    
    handleMouseMove(e, cardId) {
        e.preventDefault();
        
        const rect = this.cardElement.getBoundingClientRect();
        let x, y;
        
        if (e.type === 'touchmove') {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }
        
        const w = rect.width;
        const h = rect.height;
        
        // Calculate holographic effect parameters
        const px = Math.abs(Math.floor(100 / w * x) - 100);
        const py = Math.abs(Math.floor(100 / h * y) - 100);
        const pa = (50 - px) + (50 - py);
        
        const lp = 50 + (px - 50) / 1.5;
        const tp = 50 + (py - 50) / 1.5;
        const px_spark = 50 + (px - 50) / 7;
        const py_spark = 50 + (py - 50) / 7;
        const p_opc = 20 + (Math.abs(pa) * 1.5);
        
        // Calculate 3D rotation
        const ty = ((tp - 50) / 2) * -1;
        const tx = ((lp - 50) / 1.5) * 0.5;
        
        // Apply transform
        this.cardElement.style.transform = `rotateX(${ty}deg) rotateY(${tx}deg)`;
        
        // Update hover effects
        this.hoverStyleElement.textContent = `
            #${cardId}:hover:before { 
                background-position: ${lp}% ${tp}%;
            }
            #${cardId}:hover:after { 
                background-position: ${px_spark}% ${py_spark}%;
                opacity: ${Math.min(p_opc / 100, 1)};
            }
        `;
    }
    
    handleMouseLeave(cardId) {
        this.cardElement.style.transform = '';
        this.hoverStyleElement.textContent = '';
    }
    
    // Public methods to update card content
    updateImage(imageUrl) {
        const imageContainer = this.cardElement.querySelector('.snapmagic-image-container');
        if (imageUrl) {
            imageContainer.innerHTML = `<img src="${imageUrl}" alt="AI Generated Image">`;
        } else {
            imageContainer.innerHTML = `
                <div class="snapmagic-image-placeholder">
                    🎨 AI Generated Image<br>
                    <small>Loading...</small>
                </div>
            `;
        }
    }
    
    updateCanvas(canvas) {
        const imageContainer = this.cardElement.querySelector('.snapmagic-image-container');
        imageContainer.innerHTML = '';
        imageContainer.appendChild(canvas);
        this.cardElement.classList.add('canvas-integrated');
    }
    
    updateEventName(eventName) {
        const eventNameElement = this.cardElement.querySelector('.snapmagic-event-name');
        eventNameElement.textContent = eventName;
    }
    
    updateCreator(name, title) {
        const nameElement = this.cardElement.querySelector('.snapmagic-creator-name');
        const titleElement = this.cardElement.querySelector('.snapmagic-creator-title');
        nameElement.textContent = name;
        titleElement.textContent = title;
    }
    
    updateLogo(logoText, logoImage = null) {
        const logoElement = this.cardElement.querySelector('.snapmagic-event-logo');
        if (logoImage) {
            logoElement.innerHTML = `<img src="${logoImage}" alt="Event Logo">`;
        } else {
            logoElement.textContent = logoText;
        }
    }
    
    destroy() {
        if (this.hoverStyleElement && this.hoverStyleElement.parentNode) {
            this.hoverStyleElement.parentNode.removeChild(this.hoverStyleElement);
        }
        if (this.cardElement && this.cardElement.parentNode) {
            this.cardElement.parentNode.removeChild(this.cardElement);
        }
    }
}

/**
 * Helper function to create a SnapMagic trading card
 * @param {HTMLElement} container - Container element
 * @param {Object} options - Card options
 * @returns {SnapMagicTradingCard} Card instance
 */
function createSnapMagicCard(container, options = {}) {
    return new SnapMagicTradingCard(container, options);
}

/**
 * Integration with existing SnapMagic Canvas generation
 * @param {HTMLCanvasElement} canvas - Generated card canvas
 * @param {HTMLElement} container - Container element
 * @param {Object} cardData - Card data (eventName, creatorName, etc.)
 * @returns {SnapMagicTradingCard} Card instance with holographic effects
 */
function wrapCanvasWithHolographicCard(canvas, container, cardData = {}) {
    const card = new SnapMagicTradingCard(container, cardData);
    card.updateCanvas(canvas);
    return card;
}

/**
 * Quick setup for existing SnapMagic application
 * Call this after your canvas card is generated
 */
function enhanceExistingCard(canvasId, cardData = {}) {
    const canvas = document.getElementById(canvasId);
    const container = canvas.parentElement;
    
    // Create wrapper container
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.justifyContent = 'center';
    wrapper.style.alignItems = 'center';
    wrapper.style.perspective = '750px';
    
    container.insertBefore(wrapper, canvas);
    
    // Create holographic card
    const card = new SnapMagicTradingCard(wrapper, cardData);
    card.updateCanvas(canvas);
    
    return card;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        SnapMagicTradingCard, 
        createSnapMagicCard, 
        wrapCanvasWithHolographicCard,
        enhanceExistingCard 
    };
}

// Global access
window.SnapMagicTradingCard = SnapMagicTradingCard;
window.createSnapMagicCard = createSnapMagicCard;
window.wrapCanvasWithHolographicCard = wrapCanvasWithHolographicCard;
window.enhanceExistingCard = enhanceExistingCard;
