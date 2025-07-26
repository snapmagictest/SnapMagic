/**
 * SnapMagic Frontend - Main Application
 * Orchestrates all components and manages application state
 */

import { AuthComponent } from './components/AuthComponent.js';
import { CardComponent } from './components/CardComponent.js';
import { StorageUtils, DateUtils } from '../../shared/utils/index.ts';
import { UI_CONSTANTS } from '../../shared/constants/index.ts';

export class SnapMagicApp {
    constructor() {
        this.components = {};
        this.isInitialized = false;
        this.currentScreen = 'loading';
        
        // Bind methods
        this.init = this.init.bind(this);
        this.destroy = this.destroy.bind(this);
        this.handleError = this.handleError.bind(this);
        
        console.log('🚀 SnapMagic App created');
    }
    
    /**
     * Initialize the application
     */
    async init() {
        if (this.isInitialized) {
            console.warn('SnapMagic App already initialized');
            return;
        }
        
        try {
            console.log('🔧 Initializing SnapMagic App...');
            
            // Show loading screen
            this.showLoadingScreen();
            
            // Load configuration
            await this.loadConfiguration();
            
            // Initialize components
            await this.initializeComponents();
            
            // Setup global event listeners
            this.setupGlobalEventListeners();
            
            // Setup error handling
            this.setupErrorHandling();
            
            // Start the application flow
            await this.startApplication();
            
            this.isInitialized = true;
            console.log('✅ SnapMagic App initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize SnapMagic App:', error);
            this.handleError(error);
        }
    }
    
    /**
     * Load application configuration
     */
    async loadConfiguration() {
        // Set default configuration
        window.APP_CONFIG = {
            apiUrl: 'https://3wmz6wtgc9.execute-api.us-east-1.amazonaws.com/dev',
            version: '2.0.0',
            features: ['card_generation', 'video_generation'],
            defaultTemplate: 'cardtemplate',
            printEnabled: false
        };
        
        console.log('⚙️ Configuration loaded:', window.APP_CONFIG);
    }
    
    /**
     * Initialize all components
     */
    async initializeComponents() {
        console.log('🔧 Initializing components...');
        
        // Initialize authentication component
        this.components.auth = new AuthComponent();
        await this.components.auth.init();
        
        // Initialize card component
        this.components.card = new CardComponent(this.components.auth);
        await this.components.card.init();
        
        // Initialize video component (if needed)
        // this.components.video = new VideoComponent(this.components.auth, this.components.card);
        // await this.components.video.init();
        
        console.log('✅ All components initialized');
    }
    
    /**
     * Setup global event listeners
     */
    setupGlobalEventListeners() {
        // Listen for authentication events
        document.addEventListener('snapmagic:login-success', (event) => {
            this.handleLoginSuccess(event.detail);
        });
        
        document.addEventListener('snapmagic:logout', (event) => {
            this.handleLogout(event.detail);
        });
        
        // Listen for component errors
        document.addEventListener('snapmagic:error', (event) => {
            this.handleComponentError(event.detail);
        });
        
        // Listen for page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('📱 App hidden');
                this.handleAppHidden();
            } else {
                console.log('📱 App visible');
                this.handleAppVisible();
            }
        });
        
        // Listen for beforeunload to cleanup
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }
    
    /**
     * Setup error handling
     */
    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.handleError(event.error);
        });
        
        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.handleError(event.reason);
        });
    }
    
    /**
     * Start the application flow
     */
    async startApplication() {
        console.log('🚀 Starting application flow...');
        
        // Wait for loading delay
        await this.delay(UI_CONSTANTS.LOADING_DELAY);
        
        // Hide loading screen
        this.hideLoadingScreen();
        
        // Check if user is already authenticated
        if (this.components.auth.isAuthenticated()) {
            this.showMainApp();
        } else {
            this.showLoginScreen();
        }
    }
    
    /**
     * Handle successful login
     */
    handleLoginSuccess(data) {
        console.log('✅ Login successful, showing main app');
        
        // Update usage limits if provided
        if (data.usageLimits) {
            StorageUtils.setItem('usageLimits', data.usageLimits);
        }
        
        // Show main application
        this.showMainApp();
        
        // Log user activity
        this.logUserActivity('login', { username: data.user?.username });
    }
    
    /**
     * Handle logout
     */
    handleLogout(data) {
        console.log('🚪 User logged out, showing login screen');
        
        // Clear user data
        StorageUtils.removeItem('usageLimits');
        
        // Show login screen
        this.showLoginScreen();
        
        // Log user activity
        this.logUserActivity('logout');
    }
    
    /**
     * Handle component errors
     */
    handleComponentError(data) {
        console.error(`❌ Component error in ${data.component}:`, data.error);
        
        // Show user-friendly error message
        this.showErrorMessage(`Something went wrong in ${data.component}. Please try again.`);
        
        // Log error for debugging
        this.logError(data);
    }
    
    /**
     * Show loading screen
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            this.currentScreen = 'loading';
        }
    }
    
    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }
    
    /**
     * Show login screen
     */
    showLoginScreen() {
        const loginScreen = document.getElementById('loginScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (loginScreen) {
            loginScreen.classList.remove('hidden');
            this.currentScreen = 'login';
        }
        
        if (mainApp) {
            mainApp.style.display = 'none';
        }
    }
    
    /**
     * Show main application
     */
    showMainApp() {
        const loginScreen = document.getElementById('loginScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (loginScreen) {
            loginScreen.classList.add('hidden');
        }
        
        if (mainApp) {
            mainApp.style.display = 'block';
            this.currentScreen = 'main';
        }
    }
    
    /**
     * Show error message
     */
    showErrorMessage(message) {
        // Create or update error modal
        let errorModal = document.getElementById('globalErrorModal');
        
        if (!errorModal) {
            errorModal = document.createElement('div');
            errorModal.id = 'globalErrorModal';
            errorModal.className = 'error-modal';
            errorModal.innerHTML = `
                <div class="error-modal-content">
                    <div class="error-icon">⚠️</div>
                    <div class="error-message"></div>
                    <button class="error-close-btn">OK</button>
                </div>
            `;
            document.body.appendChild(errorModal);
            
            // Add close handler
            errorModal.querySelector('.error-close-btn').addEventListener('click', () => {
                errorModal.style.display = 'none';
            });
        }
        
        // Update message and show
        errorModal.querySelector('.error-message').textContent = message;
        errorModal.style.display = 'flex';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (errorModal.style.display === 'flex') {
                errorModal.style.display = 'none';
            }
        }, 5000);
    }
    
    /**
     * Handle application hidden
     */
    handleAppHidden() {
        // Pause any ongoing operations
        // Save current state
        this.saveAppState();
    }
    
    /**
     * Handle application visible
     */
    handleAppVisible() {
        // Resume operations
        // Check for updates
        this.checkForUpdates();
    }
    
    /**
     * Save application state
     */
    saveAppState() {
        const state = {
            currentScreen: this.currentScreen,
            timestamp: DateUtils.formatTimestamp(),
            isAuthenticated: this.components.auth?.isAuthenticated() || false
        };
        
        StorageUtils.setItem('appState', state);
    }
    
    /**
     * Check for updates
     */
    checkForUpdates() {
        // Check if authentication is still valid
        if (this.components.auth && !this.components.auth.isAuthenticated() && this.currentScreen === 'main') {
            console.log('🔐 Authentication expired, redirecting to login');
            this.handleLogout({});
        }
    }
    
    /**
     * Log user activity
     */
    logUserActivity(action, data = {}) {
        const activity = {
            action,
            timestamp: DateUtils.formatTimestamp(),
            screen: this.currentScreen,
            ...data
        };
        
        console.log('📊 User activity:', activity);
        
        // Store activity log
        const activities = StorageUtils.getItem('userActivities') || [];
        activities.push(activity);
        
        // Keep only last 50 activities
        if (activities.length > 50) {
            activities.splice(0, activities.length - 50);
        }
        
        StorageUtils.setItem('userActivities', activities);
    }
    
    /**
     * Log error
     */
    logError(errorData) {
        const error = {
            ...errorData,
            timestamp: DateUtils.formatTimestamp(),
            screen: this.currentScreen,
            userAgent: navigator.userAgent
        };
        
        // Store error log
        const errors = StorageUtils.getItem('errorLog') || [];
        errors.push(error);
        
        // Keep only last 20 errors
        if (errors.length > 20) {
            errors.splice(0, errors.length - 20);
        }
        
        StorageUtils.setItem('errorLog', errors);
    }
    
    /**
     * Handle general errors
     */
    handleError(error) {
        console.error('❌ Application error:', error);
        
        const errorMessage = error?.message || error || 'An unexpected error occurred';
        this.showErrorMessage(errorMessage);
        
        // Log error
        this.logError({
            component: 'SnapMagicApp',
            error: errorMessage,
            stack: error?.stack
        });
    }
    
    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Cleanup resources
     */
    cleanup() {
        console.log('🧹 Cleaning up SnapMagic App...');
        
        // Save final state
        this.saveAppState();
        
        // Destroy components
        Object.values(this.components).forEach(component => {
            if (component && typeof component.destroy === 'function') {
                component.destroy();
            }
        });
        
        this.components = {};
        this.isInitialized = false;
    }
    
    /**
     * Destroy the application
     */
    destroy() {
        this.cleanup();
        console.log('✅ SnapMagic App destroyed');
    }
    
    /**
     * Get application info
     */
    getInfo() {
        return {
            version: window.APP_CONFIG?.version || 'unknown',
            isInitialized: this.isInitialized,
            currentScreen: this.currentScreen,
            components: Object.keys(this.components),
            isAuthenticated: this.components.auth?.isAuthenticated() || false
        };
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, initializing SnapMagic...');
    window.snapMagicApp = new SnapMagicApp();
    window.snapMagicApp.init();
});

// Export for module usage
export default SnapMagicApp;
