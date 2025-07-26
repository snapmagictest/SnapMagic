/**
 * SnapMagic Frontend - Authentication Component
 * Handles user login and authentication state management
 */

import { BaseComponent } from './BaseComponent.js';
import { ApiUtils, StorageUtils, ValidationUtils } from '../../../shared/utils/index.ts';
import { API_ENDPOINTS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../../shared/constants/index.ts';

export class AuthComponent extends BaseComponent {
    constructor() {
        super('AuthComponent');
        this.apiUrl = window.APP_CONFIG?.apiUrl || '';
        this.currentUser = null;
        this.authToken = null;
    }
    
    getElements() {
        this.elements = {
            loginScreen: this.getElementById('loginScreen'),
            loginForm: this.getElementById('loginForm'),
            usernameInput: this.getElementById('username'),
            passwordInput: this.getElementById('password'),
            loginButton: this.getElementById('loginButton') || this.elements.loginForm?.querySelector('button[type="submit"]'),
            errorContainer: this.getElementById('loginError'),
            staffOverrideBtn: this.getElementById('staffOverrideBtn')
        };
    }
    
    getRequiredElements() {
        return ['loginScreen', 'loginForm', 'usernameInput', 'passwordInput'];
    }
    
    setupEventListeners() {
        // Login form submission
        if (this.elements.loginForm) {
            this.addEventListener(this.elements.loginForm, 'submit', this.handleLogin.bind(this));
        }
        
        // Staff override button
        if (this.elements.staffOverrideBtn) {
            this.addEventListener(this.elements.staffOverrideBtn, 'click', this.handleStaffOverride.bind(this));
        }
        
        // Enter key handling
        [this.elements.usernameInput, this.elements.passwordInput].forEach(input => {
            if (input) {
                this.addEventListener(input, 'keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.handleLogin(e);
                    }
                });
            }
        });
        
        // Clear errors on input
        [this.elements.usernameInput, this.elements.passwordInput].forEach(input => {
            if (input) {
                this.addEventListener(input, 'input', () => {
                    this.clearError(this.elements.errorContainer);
                });
            }
        });
    }
    
    async render() {
        // Check for existing authentication
        const savedToken = StorageUtils.getItem('authToken');
        const savedUser = StorageUtils.getItem('currentUser');
        
        if (savedToken && savedUser && !this.isTokenExpired(savedToken)) {
            this.authToken = savedToken;
            this.currentUser = savedUser;
            this.emit('login-success', { user: savedUser, fromStorage: true });
            return;
        }
        
        // Show login screen
        this.showLoginScreen();
    }
    
    /**
     * Handle login form submission
     */
    async handleLogin(event) {
        event.preventDefault();
        
        const username = this.elements.usernameInput.value.trim();
        const password = this.elements.passwordInput.value;
        
        // Validate input
        if (!this.validateLoginInput(username, password)) {
            return;
        }
        
        // Set loading state
        this.setLoading(this.elements.loginButton, true);
        this.clearError(this.elements.errorContainer);
        
        try {
            const response = await this.performLogin(username, password);
            
            if (response.success) {
                await this.handleLoginSuccess(response);
            } else {
                this.handleLoginError(response.error || ERROR_MESSAGES.INVALID_CREDENTIALS);
            }
            
        } catch (error) {
            console.error('Login error:', error);
            this.handleLoginError(ERROR_MESSAGES.NETWORK_ERROR);
        } finally {
            this.setLoading(this.elements.loginButton, false);
        }
    }
    
    /**
     * Handle staff override
     */
    async handleStaffOverride(event) {
        event.preventDefault();
        
        // Use override credentials
        this.elements.usernameInput.value = 'staff';
        this.elements.passwordInput.value = 'snap';
        
        // Trigger login
        await this.handleLogin(event);
    }
    
    /**
     * Validate login input
     */
    validateLoginInput(username, password) {
        if (!username) {
            this.showError('Username is required', this.elements.errorContainer);
            this.elements.usernameInput.focus();
            return false;
        }
        
        if (!password) {
            this.showError('Password is required', this.elements.errorContainer);
            this.elements.passwordInput.focus();
            return false;
        }
        
        return true;
    }
    
    /**
     * Perform login API call
     */
    async performLogin(username, password) {
        const loginData = { username, password };
        
        const response = await ApiUtils.fetchWithTimeout(
            `${this.apiUrl}${API_ENDPOINTS.LOGIN}`,
            {
                method: 'POST',
                headers: ApiUtils.getAuthHeaders(),
                body: JSON.stringify(loginData)
            }
        );
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    }
    
    /**
     * Handle successful login
     */
    async handleLoginSuccess(response) {
        console.log('✅ Login successful:', response);
        
        // Store authentication data
        this.authToken = response.token;
        this.currentUser = response.user;
        
        StorageUtils.setItem('authToken', response.token);
        StorageUtils.setItem('currentUser', response.user);
        StorageUtils.setItem('usageLimits', response.remaining);
        
        // Hide login screen
        this.hideLoginScreen();
        
        // Emit success event
        this.emit('login-success', {
            user: response.user,
            token: response.token,
            usageLimits: response.remaining
        });
        
        // Show success message briefly
        this.showSuccess(SUCCESS_MESSAGES.LOGIN_SUCCESS);
    }
    
    /**
     * Handle login error
     */
    handleLoginError(errorMessage) {
        console.error('❌ Login failed:', errorMessage);
        this.showError(errorMessage, this.elements.errorContainer);
        
        // Focus on username field for retry
        if (this.elements.usernameInput) {
            this.elements.usernameInput.focus();
        }
        
        // Emit error event
        this.emit('login-error', { error: errorMessage });
    }
    
    /**
     * Show login screen
     */
    showLoginScreen() {
        this.show(this.elements.loginScreen);
        
        // Focus on username input
        if (this.elements.usernameInput) {
            setTimeout(() => {
                this.elements.usernameInput.focus();
            }, 100);
        }
    }
    
    /**
     * Hide login screen
     */
    hideLoginScreen() {
        this.hide(this.elements.loginScreen);
    }
    
    /**
     * Show success message
     */
    showSuccess(message) {
        // Create temporary success message
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <span class="success-icon">✅</span>
            <span class="success-text">${message}</span>
        `;
        
        // Add to login screen
        if (this.elements.loginScreen) {
            this.elements.loginScreen.appendChild(successDiv);
            
            // Remove after delay
            setTimeout(() => {
                if (successDiv.parentNode) {
                    successDiv.parentNode.removeChild(successDiv);
                }
            }, 2000);
        }
    }
    
    /**
     * Logout user
     */
    logout() {
        console.log('🚪 Logging out user');
        
        // Clear stored data
        StorageUtils.removeItem('authToken');
        StorageUtils.removeItem('currentUser');
        StorageUtils.removeItem('usageLimits');
        
        // Reset component state
        this.authToken = null;
        this.currentUser = null;
        
        // Clear form
        if (this.elements.usernameInput) this.elements.usernameInput.value = '';
        if (this.elements.passwordInput) this.elements.passwordInput.value = '';
        
        // Show login screen
        this.showLoginScreen();
        
        // Emit logout event
        this.emit('logout');
    }
    
    /**
     * Check if token is expired
     */
    isTokenExpired(token) {
        try {
            // Simple token expiration check (in production, use proper JWT validation)
            const tokenData = JSON.parse(atob(token));
            const expiresAt = new Date(tokenData.expires_at);
            return expiresAt < new Date();
        } catch (error) {
            return true; // Treat invalid tokens as expired
        }
    }
    
    /**
     * Get current authentication token
     */
    getAuthToken() {
        return this.authToken;
    }
    
    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }
    
    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!(this.authToken && this.currentUser && !this.isTokenExpired(this.authToken));
    }
}
