/**
 * SnapMagic Trading Card Creator - Frontend Application
 * PRESERVES authentication system, REPLACES selfie functionality with card creation
 */

class SnapMagicApp {
    constructor() {
        // Authentication state - EXACT SAME AS BEFORE
        this.isAuthenticated = false;
        this.currentUser = null;
        
        // UI elements
        this.elements = {};
        
        // Initialize app
        this.init();
    }

    async init() {
        console.log('🎴 SnapMagic Trading Card Creator initializing...');
        
        // Cache DOM elements
        this.cacheElements();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load template image
        this.loadTemplate();
        
        // Check authentication status
        await this.checkAuthStatus();
        
        // Hide loading screen
        setTimeout(() => {
            this.elements.loadingScreen.classList.add('hidden');
        }, 1500);
    }

    cacheElements() {
        this.elements = {
            // Screens
            loadingScreen: document.getElementById('loadingScreen'),
            loginScreen: document.getElementById('loginScreen'),
            mainApp: document.getElementById('mainApp'),
            
            // Login elements - EXACT SAME AS BEFORE
            loginForm: document.getElementById('loginForm'),
            usernameInput: document.getElementById('username'),
            passwordInput: document.getElementById('password'),
            loginError: document.getElementById('loginError'),
            
            // Main app elements
            userInfo: document.getElementById('userInfo'),
            sessionInfo: document.getElementById('sessionInfo'),
            logoutBtn: document.getElementById('logoutBtn'),
            
            // Card creator elements
            templateImage: document.getElementById('templateImage'),
            promptInput: document.getElementById('promptInput'),
            generateBtn: document.getElementById('generateBtn'),
            
            // Status and result elements
            processingStatus: document.getElementById('processingStatus'),
            resultContainer: document.getElementById('resultContainer'),
            resultImage: document.getElementById('resultImage'),
            downloadBtn: document.getElementById('downloadBtn'),
            newCardBtn: document.getElementById('newCardBtn')
        };
    }

    setupEventListeners() {
        // Login form - EXACT SAME AS BEFORE
        this.elements.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        
        // Logout button - EXACT SAME AS BEFORE
        this.elements.logoutBtn.addEventListener('click', () => this.handleLogout());
        
        // Prompt input validation
        this.elements.promptInput.addEventListener('input', () => this.validatePrompt());
        
        // Generate button
        this.elements.generateBtn.addEventListener('click', () => this.handleGenerate());
        
        // Result actions
        this.elements.downloadBtn.addEventListener('click', () => this.handleDownload());
        this.elements.newCardBtn.addEventListener('click', () => this.handleNewCard());
    }

    loadTemplate() {
        // Load the actual template image
        const templateUrl = 'finalpink.png';
        this.elements.templateImage.src = templateUrl;
        this.elements.templateImage.alt = 'Trading card template with pink placeholder area';
        
        // Handle image load error
        this.elements.templateImage.onerror = () => {
            console.error('Failed to load template image');
            this.elements.templateImage.alt = 'Template image not available';
        };
    }

    // ========================================
    // AUTHENTICATION METHODS - EXACT SAME AS BEFORE
    // DO NOT CHANGE - THESE WORK PERFECTLY
    // ========================================

    async checkAuthStatus() {
        const sessionData = localStorage.getItem('snapmagic_session');
        
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                const now = Date.now();
                const sessionAge = now - session.timestamp;
                const maxAge = 24 * 60 * 60 * 1000; // 24 hours
                
                if (sessionAge < maxAge && session.user) {
                    this.currentUser = session.user;
                    this.isAuthenticated = true;
                    this.showMainApp();
                    return;
                }
            } catch (e) {
                console.error('Invalid session data:', e);
            }
        }
        
        this.showLoginScreen();
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const username = this.elements.usernameInput.value.trim();
        const password = this.elements.passwordInput.value.trim();
        
        if (!username || !password) {
            this.showLoginError('Please enter both username and password');
            return;
        }
        
        try {
            this.clearLoginError();
            
            const apiBaseUrl = window.SNAPMAGIC_CONFIG.API_URL;
            
            if (apiBaseUrl === 'demo-mode') {
                // Demo mode - offline functionality
                if (username && password) {
                    this.currentUser = { 
                        username: username,
                        loginTime: new Date().toISOString(),
                        token: 'demo-token'
                    };
                    this.isAuthenticated = true;
                    this.saveSession();
                    this.showMainApp();
                    return;
                }
            }
            
            // Real API mode - call backend
            const loginEndpoint = `${apiBaseUrl}/api/login`;
            console.log('🔐 Attempting login to:', loginEndpoint);
            
            const response = await fetch(loginEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'login',
                    username: username,
                    password: password
                })
            });
            
            const result = await response.json();
            console.log('🔐 Login response:', result);
            
            if (result.success && result.token) {
                this.currentUser = { 
                    username: username,
                    loginTime: new Date().toISOString(),
                    token: result.token,
                    expiresIn: result.expires_in || 86400
                };
                this.isAuthenticated = true;
                this.saveSession();
                this.showMainApp();
            } else {
                this.showLoginError(result.error || 'Login failed');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            this.showLoginError('Connection error. Please try again.');
        }
    }

    handleLogout() {
        this.isAuthenticated = false;
        this.currentUser = null;
        localStorage.removeItem('snapmagic_session');
        this.showLoginScreen();
    }

    saveSession() {
        const sessionData = {
            user: this.currentUser,
            timestamp: Date.now()
        };
        localStorage.setItem('snapmagic_session', JSON.stringify(sessionData));
    }

    showLoginScreen() {
        this.elements.loginScreen.style.display = 'flex';
        this.elements.mainApp.style.display = 'none';
        this.clearLoginError();
    }

    showMainApp() {
        this.elements.loginScreen.style.display = 'none';
        this.elements.mainApp.style.display = 'flex';
        
        if (this.currentUser) {
            this.elements.userInfo.textContent = `Welcome, ${this.currentUser.username}!`;
            this.elements.sessionInfo.textContent = `Logged in at ${new Date(this.currentUser.loginTime).toLocaleTimeString()}`;
        }
    }

    showLoginError(message) {
        this.elements.loginError.textContent = message;
    }

    clearLoginError() {
        this.elements.loginError.textContent = '';
    }

    // ========================================
    // NEW: TRADING CARD FUNCTIONALITY
    // ========================================

    validatePrompt() {
        const prompt = this.elements.promptInput.value.trim();
        const length = prompt.length;
        
        // Check character limits
        const minLength = 10; // More reasonable minimum for meaningful content
        const maxLength = 1024; // Nova Canvas maximum (corrected)
        
        // Enforce maximum length
        if (length > maxLength) {
            this.elements.promptInput.value = prompt.substring(0, maxLength);
            return;
        }
        
        const isValid = length >= minLength && length <= maxLength;
        this.elements.generateBtn.disabled = !isValid;
        
        if (isValid) {
            this.elements.generateBtn.textContent = '✨ Generate My Trading Card';
        } else if (length < minLength) {
            this.elements.generateBtn.textContent = `Enter description (min ${minLength} characters)`;
        } else {
            this.elements.generateBtn.textContent = 'Description too long';
        }
        
        // Update character counter
        this.updateCharacterCounter(length, maxLength);
    }
    
    updateCharacterCounter(current, max) {
        // Find or create character counter
        let counter = document.getElementById('characterCounter');
        if (!counter) {
            counter = document.createElement('div');
            counter.id = 'characterCounter';
            counter.style.cssText = 'font-size: 0.9rem; opacity: 0.8; margin-top: 0.5rem; text-align: right;';
            this.elements.promptInput.parentNode.appendChild(counter);
        }
        
        counter.textContent = `${current}/${max} characters`;
        counter.style.color = current > max * 0.9 ? '#ff6b6b' : 'rgba(255, 255, 255, 0.8)';
    }

    async handleGenerate() {
        const prompt = this.elements.promptInput.value.trim();
        
        if (!prompt || prompt.length < 10) {
            alert('Please enter a description of at least 10 characters');
            return;
        }
        
        if (prompt.length > 1024) {
            alert('Description must be less than 1024 characters');
            return;
        }

        if (!this.isAuthenticated || !this.currentUser.token) {
            alert('Authentication required. Please log in again.');
            this.handleLogout();
            return;
        }

        try {
            // Show processing status
            this.showProcessing();
            
            const apiBaseUrl = window.SNAPMAGIC_CONFIG.API_URL;
            
            if (apiBaseUrl === 'demo-mode') {
                // Demo mode - simulate processing
                await this.simulateCardGeneration(prompt);
                return;
            }
            
            // Real API call
            const endpoint = `${apiBaseUrl}/api/transform-card`;
            console.log('🎴 Generating card with prompt:', prompt);
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentUser.token}`
                },
                body: JSON.stringify({
                    action: 'transform_card',
                    prompt: prompt
                })
            });
            
            const result = await response.json();
            console.log('🎴 Card generation response:', {
                success: result.success,
                hasResult: !!result.result,
                resultLength: result.result ? result.result.length : 0,
                resultPreview: result.result ? result.result.substring(0, 100) + '...' : 'null',
                metadata: result.metadata,
                error: result.error
            });
            
            if (result.success && result.result) {
                this.showResult(result.result, result.metadata);
            } else {
                console.error('❌ API returned error:', result.error);
                throw new Error(result.error || 'Card generation failed');
            }
            
        } catch (error) {
            console.error('Card generation error:', error);
            this.hideProcessing();
            alert(`Card generation failed: ${error.message}`);
        }
    }

    async simulateCardGeneration(prompt) {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Show demo result
        const demoImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        this.showResult(demoImageData, { prompt_used: prompt, method: 'demo_mode' });
    }

    showProcessing() {
        this.elements.processingStatus.classList.remove('hidden');
        this.elements.resultContainer.classList.add('hidden');
        this.elements.generateBtn.disabled = true;
    }

    hideProcessing() {
        this.elements.processingStatus.classList.add('hidden');
        this.elements.generateBtn.disabled = false;
    }

    showResult(imageBase64, metadata) {
        console.log('🎴 showResult called with:', {
            imageBase64Length: imageBase64 ? imageBase64.length : 0,
            imageBase64Preview: imageBase64 ? imageBase64.substring(0, 100) + '...' : 'null',
            metadata: metadata
        });
        
        this.hideProcessing();
        
        // Check if we have valid image data
        if (!imageBase64 || imageBase64.length < 100) {
            console.error('❌ Invalid image data received');
            alert('Error: No image data received from server');
            return;
        }
        
        // Ensure we have the base64 prefix
        let imageSrc;
        if (imageBase64.startsWith('data:image/')) {
            imageSrc = imageBase64;
        } else {
            imageSrc = `data:image/png;base64,${imageBase64}`;
        }
        
        console.log('🖼️ Setting image src:', imageSrc.substring(0, 100) + '...');
        
        // Display the result image
        this.elements.resultImage.src = imageSrc;
        this.elements.resultImage.alt = `Trading card: ${metadata?.prompt_used || 'Generated content'}`;
        
        // Add error handler for image loading
        this.elements.resultImage.onerror = () => {
            console.error('❌ Failed to load generated image');
            alert('Error: Failed to display generated card');
        };
        
        this.elements.resultImage.onload = () => {
            console.log('✅ Image loaded successfully');
        };
        
        // Show result container
        this.elements.resultContainer.classList.remove('hidden');
        
        // Scroll to result
        this.elements.resultContainer.scrollIntoView({ behavior: 'smooth' });
        
        console.log('✅ Card display setup complete');
    }

    handleDownload() {
        const imageData = this.elements.resultImage.src;
        
        console.log('📥 Download attempt - Image data:', {
            hasImageData: !!imageData,
            imageDataLength: imageData ? imageData.length : 0,
            imageDataPreview: imageData ? imageData.substring(0, 50) + '...' : 'null'
        });
        
        if (!imageData || imageData === '' || imageData.includes('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB')) {
            console.error('❌ No valid image data for download');
            alert('No card available to download. Please generate a card first.');
            return;
        }
        
        try {
            // Create download link
            const link = document.createElement('a');
            link.href = imageData;
            link.download = `snapmagic-trading-card-${Date.now()}.png`;
            
            // Ensure the link works on all browsers
            link.style.display = 'none';
            document.body.appendChild(link);
            
            // Trigger download
            link.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(link);
            }, 100);
            
            console.log('📥 Trading card download initiated successfully');
            
            // Show success message
            const originalText = this.elements.downloadBtn.textContent;
            this.elements.downloadBtn.textContent = '✅ Downloaded!';
            setTimeout(() => {
                this.elements.downloadBtn.textContent = originalText;
            }, 2000);
            
        } catch (error) {
            console.error('❌ Download failed:', error);
            alert('Download failed. Please try again.');
        }
    }

    handleNewCard() {
        // Reset the interface for new card creation
        this.elements.promptInput.value = '';
        this.elements.generateBtn.disabled = true;
        this.elements.generateBtn.textContent = 'Enter description (min 10 characters)';
        this.elements.resultContainer.classList.add('hidden');
        this.elements.processingStatus.classList.add('hidden');
        
        // Reset character counter
        this.updateCharacterCounter(0, 1024);
        
        // Focus on prompt input
        this.elements.promptInput.focus();
        
        console.log('🎴 Ready for new card creation');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.snapMagicApp = new SnapMagicApp();
});
