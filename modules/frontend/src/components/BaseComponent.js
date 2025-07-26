/**
 * SnapMagic Frontend - Base Component Class
 * Abstract base class for all frontend components
 */

import { ApiUtils, StringUtils, StorageUtils } from '../../../shared/utils/index.ts';
import { UI_CONSTANTS } from '../../../shared/constants/index.ts';

export class BaseComponent {
    /**
     * Base component class for SnapMagic frontend components
     * @param {string} name - Component name
     * @param {HTMLElement} container - Container element
     */
    constructor(name, container = null) {
        this.name = name;
        this.container = container;
        this.elements = {};
        this.eventListeners = [];
        this.isInitialized = false;
        
        // Bind methods to preserve context
        this.init = this.init.bind(this);
        this.destroy = this.destroy.bind(this);
        this.render = this.render.bind(this);
        this.handleError = this.handleError.bind(this);
    }
    
    /**
     * Initialize component
     */
    async init() {
        if (this.isInitialized) {
            console.warn(`Component ${this.name} already initialized`);
            return;
        }
        
        try {
            console.log(`🔧 Initializing ${this.name} component`);
            
            // Get DOM elements
            this.getElements();
            
            // Validate required elements
            this.validateElements();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Render initial state
            await this.render();
            
            this.isInitialized = true;
            console.log(`✅ ${this.name} component initialized`);
            
        } catch (error) {
            console.error(`❌ Failed to initialize ${this.name}:`, error);
            this.handleError(error);
        }
    }
    
    /**
     * Destroy component and cleanup
     */
    destroy() {
        console.log(`🧹 Destroying ${this.name} component`);
        
        // Remove event listeners
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
        
        // Clear elements
        this.elements = {};
        
        // Component-specific cleanup
        this.cleanup();
        
        this.isInitialized = false;
        console.log(`✅ ${this.name} component destroyed`);
    }
    
    /**
     * Get DOM elements - must be implemented by subclasses
     */
    getElements() {
        throw new Error(`getElements() must be implemented by ${this.name}`);
    }
    
    /**
     * Validate required elements
     */
    validateElements() {
        const requiredElements = this.getRequiredElements();
        const missing = [];
        
        for (const elementName of requiredElements) {
            if (!this.elements[elementName]) {
                missing.push(elementName);
            }
        }
        
        if (missing.length > 0) {
            throw new Error(`Missing required elements in ${this.name}: ${missing.join(', ')}`);
        }
    }
    
    /**
     * Get required elements list - can be overridden by subclasses
     */
    getRequiredElements() {
        return [];
    }
    
    /**
     * Setup event listeners - can be overridden by subclasses
     */
    setupEventListeners() {
        // Override in subclasses
    }
    
    /**
     * Render component - can be overridden by subclasses
     */
    async render() {
        // Override in subclasses
    }
    
    /**
     * Component-specific cleanup - can be overridden by subclasses
     */
    cleanup() {
        // Override in subclasses
    }
    
    /**
     * Add event listener with automatic cleanup tracking
     */
    addEventListener(element, event, handler, options = {}) {
        if (!element) {
            console.warn(`Cannot add ${event} listener: element is null`);
            return;
        }
        
        element.addEventListener(event, handler, options);
        this.eventListeners.push({ element, event, handler });
    }
    
    /**
     * Show element
     */
    show(element) {
        if (element) {
            element.classList.remove('hidden');
            element.style.display = '';
        }
    }
    
    /**
     * Hide element
     */
    hide(element) {
        if (element) {
            element.classList.add('hidden');
        }
    }
    
    /**
     * Toggle element visibility
     */
    toggle(element, show = null) {
        if (!element) return;
        
        if (show === null) {
            show = element.classList.contains('hidden');
        }
        
        if (show) {
            this.show(element);
        } else {
            this.hide(element);
        }
    }
    
    /**
     * Set loading state
     */
    setLoading(element, loading = true) {
        if (!element) return;
        
        if (loading) {
            element.classList.add('loading');
            element.disabled = true;
        } else {
            element.classList.remove('loading');
            element.disabled = false;
        }
    }
    
    /**
     * Show error message
     */
    showError(message, container = null) {
        console.error(`❌ ${this.name} error:`, message);
        
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <span class="error-icon">⚠️</span>
                    <span class="error-text">${message}</span>
                </div>
            `;
            this.show(container);
        }
    }
    
    /**
     * Clear error message
     */
    clearError(container) {
        if (container) {
            container.innerHTML = '';
            this.hide(container);
        }
    }
    
    /**
     * Handle component errors
     */
    handleError(error) {
        console.error(`❌ ${this.name} component error:`, error);
        
        // Emit error event for global error handling
        this.emit('error', {
            component: this.name,
            error: error.message || error,
            timestamp: new Date().toISOString()
        });
    }
    
    /**
     * Emit custom event
     */
    emit(eventName, data = {}) {
        const event = new CustomEvent(`snapmagic:${eventName}`, {
            detail: { component: this.name, ...data }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Listen for custom events
     */
    on(eventName, handler) {
        const wrappedHandler = (event) => handler(event.detail);
        document.addEventListener(`snapmagic:${eventName}`, wrappedHandler);
        
        // Track for cleanup
        this.eventListeners.push({
            element: document,
            event: `snapmagic:${eventName}`,
            handler: wrappedHandler
        });
    }
    
    /**
     * Debounced method execution
     */
    debounce(func, wait = UI_CONSTANTS.DEBOUNCE_DELAY) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
    
    /**
     * Animate element
     */
    animate(element, animation, duration = UI_CONSTANTS.ANIMATION_DURATION) {
        if (!element) return Promise.resolve();
        
        return new Promise((resolve) => {
            element.style.animationDuration = `${duration}ms`;
            element.classList.add(animation);
            
            setTimeout(() => {
                element.classList.remove(animation);
                resolve();
            }, duration);
        });
    }
    
    /**
     * Get element by ID with error handling
     */
    getElementById(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Element with ID '${id}' not found in ${this.name}`);
        }
        return element;
    }
    
    /**
     * Get elements by selector with error handling
     */
    querySelectorAll(selector) {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
            console.warn(`No elements found for selector '${selector}' in ${this.name}`);
        }
        return elements;
    }
}
