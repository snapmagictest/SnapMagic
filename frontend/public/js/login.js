/**
 * SnapMagic - Login Page JavaScript
 * Handles login form functionality with AWS Amplify authentication
 */

class LoginPage {
    constructor() {
        this.form = null;
        this.usernameInput = null;
        this.passwordInput = null;
        this.passwordToggle = null;
        this.loginButton = null;
        this.errorContainer = null;
        this.loadingOverlay = null;
        
        this.init();
    }
    
    /**
     * Initialize login page
     */
    async init() {
        // Check if user is already authenticated
        if (await Auth.redirectIfAuthenticated()) {
            return;
        }
        
        this.setupElements();
        this.setupEventListeners();
        this.setupFormValidation();
        
        Performance.log('Login page initialized');
    }
    
    /**
     * Setup DOM elements
     */
    setupElements() {
        this.form = document.getElementById('loginForm');
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        this.passwordToggle = document.getElementById('passwordToggle');
        this.loginButton = document.getElementById('loginButton');
        this.errorContainer = document.getElementById('loginError');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        
        // Validate required elements
        const requiredElements = [
            this.form, this.usernameInput, this.passwordInput, 
            this.loginButton, this.errorContainer
        ];
        
        if (requiredElements.some(el => !el)) {
            console.error('Required login elements not found');
            Toast.error('Login form not properly initialized');
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Form submission
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
        
        // Password toggle
        if (this.passwordToggle) {
            this.passwordToggle.addEventListener('click', () => this.togglePassword());
        }
        
        // Input validation on blur
        if (this.usernameInput) {
            this.usernameInput.addEventListener('blur', () => this.validateUsername());
            this.usernameInput.addEventListener('input', () => this.clearErrors());
        }
        
        if (this.passwordInput) {
            this.passwordInput.addEventListener('blur', () => this.validatePassword());
            this.passwordInput.addEventListener('input', () => this.clearErrors());
        }
        
        // Enter key handling
        [this.usernameInput, this.passwordInput].forEach(input => {
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.handleSubmit(e);
                    }
                });
            }
        });
        
        // Auto-focus username field
        if (this.usernameInput) {
            setTimeout(() => this.usernameInput.focus(), 100);
        }
    }
    
    /**
     * Setup form validation
     */
    setupFormValidation() {
        // Real-time validation
        const validateForm = () => {
            const isValid = this.validateUsername() && this.validatePassword();
            this.updateSubmitButton(isValid);
            return isValid;
        };
        
        // Validate on input changes
        [this.usernameInput, this.passwordInput].forEach(input => {
            if (input) {
                input.addEventListener('input', Utils.debounce(validateForm, 300));
            }
        });
        
        // Initial validation
        validateForm();
    }
    
    /**
     * Handle form submission
     * @param {Event} event - Form submit event
     */
    async handleSubmit(event) {
        event.preventDefault();
        
        // Prevent double submission
        if (this.loginButton.disabled) {
            return;
        }
        
        // Validate form
        if (!this.validateForm()) {
            return;
        }
        
        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value;
        
        try {
            this.setLoadingState(true);
            this.clearErrors();
            
            Performance.mark('login_attempt');
            
            // Attempt login using Auth module
            const result = await Auth.login(username, password);
            
            if (result.success) {
                Performance.measure('Login successful', 'login_attempt');
                
                // Show success message
                Toast.success('Login successful! Redirecting...', 'Welcome');
                
                // Redirect after short delay
                setTimeout(() => {
                    window.location.href = result.redirectUrl || 'app.html';
                }, 1500);
                
            } else {
                Performance.measure('Login failed', 'login_attempt');
                this.showError(result.error || 'Login failed');
                this.setLoadingState(false);
            }
            
        } catch (error) {
            Performance.log('Login error:', error);
            this.showError('An unexpected error occurred. Please try again.');
            this.setLoadingState(false);
        }
    }
    
    /**
     * Toggle password visibility
     */
    togglePassword() {
        if (!this.passwordInput || !this.passwordToggle) return;
        
        const isPassword = this.passwordInput.type === 'password';
        this.passwordInput.type = isPassword ? 'text' : 'password';
        
        const icon = this.passwordToggle.querySelector('.password-toggle-icon');
        if (icon) {
            icon.textContent = isPassword ? '🙈' : '👁️';
        }
        
        // Update aria-label for accessibility
        this.passwordToggle.setAttribute('aria-label', 
            isPassword ? 'Hide password' : 'Show password'
        );
    }
    
    /**
     * Validate username field
     * @returns {boolean} True if valid
     */
    validateUsername() {
        if (!this.usernameInput) return false;
        
        const username = this.usernameInput.value.trim();
        const isValid = username.length >= 3;
        
        this.setFieldValidation(this.usernameInput, isValid, 
            isValid ? '' : 'Username must be at least 3 characters');
        
        return isValid;
    }
    
    /**
     * Validate password field
     * @returns {boolean} True if valid
     */
    validatePassword() {
        if (!this.passwordInput) return false;
        
        const password = this.passwordInput.value;
        const isValid = password.length >= 6;
        
        this.setFieldValidation(this.passwordInput, isValid, 
            isValid ? '' : 'Password must be at least 6 characters');
        
        return isValid;
    }
    
    /**
     * Validate entire form
     * @returns {boolean} True if form is valid
     */
    validateForm() {
        const usernameValid = this.validateUsername();
        const passwordValid = this.validatePassword();
        
        return usernameValid && passwordValid;
    }
    
    /**
     * Set field validation state
     * @param {HTMLElement} field - Input field
     * @param {boolean} isValid - Validation state
     * @param {string} message - Error message
     */
    setFieldValidation(field, isValid, message) {
        if (!field) return;
        
        // Remove existing validation classes
        field.classList.remove('is-valid', 'is-invalid');
        
        // Add appropriate class
        field.classList.add(isValid ? 'is-valid' : 'is-invalid');
        
        // Set aria-invalid for accessibility
        field.setAttribute('aria-invalid', !isValid);
        
        // Handle error message (you could add individual field error displays here)
        if (!isValid && message) {
            field.setAttribute('aria-describedby', 'field-error');
        }
    }
    
    /**
     * Update submit button state
     * @param {boolean} isValid - Form validity state
     */
    updateSubmitButton(isValid) {
        if (!this.loginButton) return;
        
        this.loginButton.disabled = !isValid;
        
        if (isValid) {
            this.loginButton.classList.remove('btn-disabled');
        } else {
            this.loginButton.classList.add('btn-disabled');
        }
    }
    
    /**
     * Set loading state
     * @param {boolean} loading - Loading state
     */
    setLoadingState(loading) {
        if (!this.loginButton) return;
        
        const btnText = this.loginButton.querySelector('.btn-text');
        const btnSpinner = this.loginButton.querySelector('.btn-spinner');
        
        if (loading) {
            this.loginButton.disabled = true;
            if (btnText) btnText.classList.add('hidden');
            if (btnSpinner) btnSpinner.classList.remove('hidden');
            
            // Show loading overlay
            if (this.loadingOverlay) {
                this.loadingOverlay.classList.remove('hidden');
            }
        } else {
            this.loginButton.disabled = false;
            if (btnText) btnText.classList.remove('hidden');
            if (btnSpinner) btnSpinner.classList.add('hidden');
            
            // Hide loading overlay
            if (this.loadingOverlay) {
                this.loadingOverlay.classList.add('hidden');
            }
        }
    }
    
    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        if (!this.errorContainer) return;
        
        const errorMessage = this.errorContainer.querySelector('#loginErrorMessage');
        if (errorMessage) {
            errorMessage.textContent = message;
        }
        
        this.errorContainer.classList.remove('hidden');
        this.errorContainer.setAttribute('role', 'alert');
        
        // Focus on error for screen readers
        this.errorContainer.focus();
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            this.clearErrors();
        }, 10000);
    }
    
    /**
     * Clear error messages
     */
    clearErrors() {
        if (this.errorContainer) {
            this.errorContainer.classList.add('hidden');
            this.errorContainer.removeAttribute('role');
        }
        
        // Clear field validation states
        [this.usernameInput, this.passwordInput].forEach(field => {
            if (field) {
                field.classList.remove('is-invalid');
                field.removeAttribute('aria-invalid');
                field.removeAttribute('aria-describedby');
            }
        });
    }
    
    /**
     * Handle demo login (for testing)
     */
    fillDemoCredentials() {
        if (this.usernameInput && this.passwordInput) {
            this.usernameInput.value = 'demo';
            this.passwordInput.value = 'demo123';
            this.validateForm();
        }
    }
}

// Initialize login page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new LoginPage();
});

// Add demo credentials button for development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    document.addEventListener('DOMContentLoaded', () => {
        const demoBtn = document.createElement('button');
        demoBtn.textContent = 'Fill Demo Credentials';
        demoBtn.className = 'btn btn-outline btn-sm';
        demoBtn.style.position = 'fixed';
        demoBtn.style.bottom = '20px';
        demoBtn.style.right = '20px';
        demoBtn.style.zIndex = '9999';
        
        demoBtn.addEventListener('click', () => {
            const username = document.getElementById('username');
            const password = document.getElementById('password');
            if (username && password) {
                username.value = 'demo';
                password.value = 'demo123';
                // Trigger validation
                username.dispatchEvent(new Event('input'));
                password.dispatchEvent(new Event('input'));
            }
        });
        
        document.body.appendChild(demoBtn);
    });
}

// Add CSS for validation states
const validationStyles = document.createElement('style');
validationStyles.textContent = `
    .form-control.is-valid {
        border-color: var(--success-color);
        box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
    }
    
    .form-control.is-invalid {
        border-color: var(--error-color);
        box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
    }
    
    .btn-disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    @media (prefers-reduced-motion: reduce) {
        .form-control {
            transition: none;
        }
    }
`;
document.head.appendChild(validationStyles);
