/**
 * SnapMagic Holographic Card Effects
 * Professional trading card holographic effects for AWS events
 * No dependencies - pure vanilla JavaScript
 */

class SnapMagicCard {
  constructor(cardElement, options = {}) {
    this.card = cardElement;
    this.options = {
      intensity: options.intensity || 1,
      theme: options.theme || 'tech-theme',
      enableAnimation: options.enableAnimation !== false,
      ...options
    };
    
    this.animationTimeout = null;
    this.isActive = false;
    
    this.init();
  }
  
  init() {
    // Add base classes
    this.card.classList.add('snapmagic-card');
    if (this.options.theme) {
      this.card.classList.add(this.options.theme);
    }
    
    // Create dynamic style element for hover effects
    this.createStyleElement();
    
    // Bind events
    this.bindEvents();
    
    // Initial animation if enabled
    if (this.options.enableAnimation) {
      setTimeout(() => {
        this.card.classList.add('animated');
      }, 100);
    }
  }
  
  createStyleElement() {
    // Create or find existing style element for this card
    const styleId = `snapmagic-hover-${this.getCardId()}`;
    this.styleElement = document.getElementById(styleId) || document.createElement('style');
    this.styleElement.id = styleId;
    this.styleElement.classList.add('snapmagic-hover-style');
    
    if (!document.getElementById(styleId)) {
      document.head.appendChild(this.styleElement);
    }
  }
  
  getCardId() {
    // Generate unique ID for this card
    return this.card.id || `card-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  bindEvents() {
    // Mouse and touch events
    this.card.addEventListener('mousemove', (e) => this.handleMove(e));
    this.card.addEventListener('touchmove', (e) => this.handleMove(e));
    this.card.addEventListener('mouseout', () => this.handleLeave());
    this.card.addEventListener('touchend', () => this.handleLeave());
    this.card.addEventListener('touchcancel', () => this.handleLeave());
    
    // Prevent default touch behaviors
    this.card.addEventListener('touchstart', (e) => {
      e.preventDefault();
    });
  }
  
  handleMove(e) {
    e.preventDefault();
    
    // Get position - normalize touch/mouse
    let pos = [e.offsetX, e.offsetY];
    if (e.type === 'touchmove') {
      const rect = this.card.getBoundingClientRect();
      pos = [
        e.touches[0].clientX - rect.left,
        e.touches[0].clientY - rect.top
      ];
    }
    
    // Calculate card dimensions and mouse position
    const rect = this.card.getBoundingClientRect();
    const l = pos[0];
    const t = pos[1];
    const h = rect.height;
    const w = rect.width;
    
    // Calculate percentages and angles
    const px = Math.abs(Math.floor(100 / w * l) - 100);
    const py = Math.abs(Math.floor(100 / h * t) - 100);
    const pa = (50 - px) + (50 - py);
    
    // Calculate gradient and sparkle positions
    const lp = 50 + (px - 50) / 1.5;
    const tp = 50 + (py - 50) / 1.5;
    const px_spark = 50 + (px - 50) / 7;
    const py_spark = 50 + (py - 50) / 7;
    const p_opc = 20 + (Math.abs(pa) * 1.5);
    
    // Calculate 3D rotation
    const ty = ((tp - 50) / 2) * -1 * this.options.intensity;
    const tx = ((lp - 50) / 1.5) * 0.5 * this.options.intensity;
    
    // Apply transformations
    this.applyHoverEffect(lp, tp, px_spark, py_spark, p_opc, tx, ty);
    
    // Set active state
    this.setActiveState(true);
    
    // Clear any pending animation timeout
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
    }
    
    // Return false for touch events
    if (e.type === 'touchmove') {
      return false;
    }
  }
  
  handleLeave() {
    // Remove hover effects
    this.removeHoverEffect();
    this.setActiveState(false);
    
    // Add animation after delay
    this.animationTimeout = setTimeout(() => {
      if (this.options.enableAnimation) {
        this.card.classList.add('animated');
      }
    }, 2500);
  }
  
  applyHoverEffect(lp, tp, px_spark, py_spark, p_opc, tx, ty) {
    // Create CSS for pseudo-elements
    const cardId = this.getCardId();
    const style = `
      #${cardId}.snapmagic-card:hover:before { 
        background-position: ${lp}% ${tp}%;
      }
      #${cardId}.snapmagic-card:hover:after { 
        background-position: ${px_spark}% ${py_spark}%;
        opacity: ${Math.min(p_opc / 100, 1)};
      }
    `;
    
    // Apply 3D transform to card
    this.card.style.transform = `rotateX(${ty}deg) rotateY(${tx}deg)`;
    
    // Update style element
    this.styleElement.textContent = style;
    
    // Ensure card has ID for CSS targeting
    if (!this.card.id) {
      this.card.id = cardId;
    }
  }
  
  removeHoverEffect() {
    // Clear styles
    this.styleElement.textContent = '';
    this.card.style.transform = '';
  }
  
  setActiveState(active) {
    this.isActive = active;
    if (active) {
      this.card.classList.add('active');
      this.card.classList.remove('animated');
    } else {
      this.card.classList.remove('active');
    }
  }
  
  // Public methods
  setTheme(theme) {
    // Remove old theme classes
    const themeClasses = ['aws-theme', 'cloud-theme', 'ai-theme', 'serverless-theme', 'rainbow-theme', 'tech-theme'];
    themeClasses.forEach(cls => this.card.classList.remove(cls));
    
    // Add new theme
    this.card.classList.add(theme);
    this.options.theme = theme;
  }
  
  setIntensity(intensity) {
    this.options.intensity = Math.max(0, Math.min(2, intensity));
  }
  
  enableAnimation() {
    this.options.enableAnimation = true;
  }
  
  disableAnimation() {
    this.options.enableAnimation = false;
    this.card.classList.remove('animated');
    this.card.classList.add('no-animation');
  }
  
  destroy() {
    // Clean up
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
    }
    
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
    }
    
    // Remove event listeners would require storing bound functions
    // For now, just remove classes
    this.card.classList.remove('snapmagic-card', 'active', 'animated');
    this.card.style.transform = '';
  }
}

/**
 * SnapMagic Card Manager
 * Manages multiple holographic cards
 */
class SnapMagicCardManager {
  constructor() {
    this.cards = new Map();
  }
  
  // Initialize a single card
  initCard(cardElement, options = {}) {
    const card = new SnapMagicCard(cardElement, options);
    this.cards.set(cardElement, card);
    return card;
  }
  
  // Initialize all cards with a specific selector
  initCards(selector = '.snapmagic-card', options = {}) {
    const elements = document.querySelectorAll(selector);
    const cards = [];
    
    elements.forEach((element, index) => {
      // Stagger animation delays
      const cardOptions = {
        ...options,
        animationDelay: index * 0.25
      };
      
      const card = this.initCard(element, cardOptions);
      cards.push(card);
      
      // Apply staggered animation delay
      if (cardOptions.animationDelay > 0) {
        setTimeout(() => {
          element.classList.add('animated');
        }, cardOptions.animationDelay * 1000);
      }
    });
    
    return cards;
  }
  
  // Get card instance for an element
  getCard(cardElement) {
    return this.cards.get(cardElement);
  }
  
  // Set theme for all cards
  setThemeAll(theme) {
    this.cards.forEach(card => card.setTheme(theme));
  }
  
  // Enable/disable animation for all cards
  setAnimationAll(enabled) {
    this.cards.forEach(card => {
      if (enabled) {
        card.enableAnimation();
      } else {
        card.disableAnimation();
      }
    });
  }
  
  // Destroy all cards
  destroyAll() {
    this.cards.forEach(card => card.destroy());
    this.cards.clear();
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Auto-initialize cards with data-snapmagic attribute
  const autoCards = document.querySelectorAll('[data-snapmagic]');
  if (autoCards.length > 0) {
    window.snapMagicManager = new SnapMagicCardManager();
    
    autoCards.forEach(card => {
      const options = {};
      
      // Read options from data attributes
      if (card.dataset.theme) options.theme = card.dataset.theme;
      if (card.dataset.intensity) options.intensity = parseFloat(card.dataset.intensity);
      if (card.dataset.animation === 'false') options.enableAnimation = false;
      
      window.snapMagicManager.initCard(card, options);
    });
  }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SnapMagicCard, SnapMagicCardManager };
}

// Global access
window.SnapMagicCard = SnapMagicCard;
window.SnapMagicCardManager = SnapMagicCardManager;
