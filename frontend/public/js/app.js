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
            newCardBtn: document.getElementById('newCardBtn'),
            
            // Video elements - NEW
            videoContainer: document.getElementById('videoContainer'),
            resultVideo: document.getElementById('resultVideo'),
            animateBtn: document.getElementById('animateBtn'),
            downloadVideoBtn: document.getElementById('downloadVideoBtn'),
            videoProcessingStatus: document.getElementById('videoProcessingStatus')
        };
        
        // Store current card data for video generation
        this.currentCardData = null;
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
        
        // Video actions - NEW
        this.elements.animateBtn.addEventListener('click', () => this.handleAnimateCard());
        this.elements.downloadVideoBtn.addEventListener('click', () => this.handleDownloadVideo());
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
        
        console.log('🎴 Generate button clicked with prompt:', prompt);
        console.log('🔧 API Configuration:', window.SNAPMAGIC_CONFIG);
        
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
            console.log('🌐 API Base URL:', apiBaseUrl);
            
            // Real API call - no demo mode
            const endpoint = `${apiBaseUrl}api/transform-card`;
            console.log('🎯 Making API call to:', endpoint);
            console.log('🔑 Using token:', this.currentUser.token ? 'Present' : 'Missing');
            
            const requestBody = {
                action: 'transform_card',
                prompt: prompt
            };
            console.log('📤 Request body:', requestBody);
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentUser.token}`
                },
                body: JSON.stringify(requestBody)
            });
            
            console.log('📥 Response status:', response.status);
            console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error Response:', errorText);
                throw new Error(`API request failed with status ${response.status}: ${response.statusText}. ${errorText}`);
            }
            
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
                console.log('✅ Card generation successful, displaying result');
                this.showResult(result.result, result.metadata);
            } else {
                const errorMsg = result.error || 'Card generation failed - no error message provided';
                console.error('❌ API returned error:', errorMsg);
                this.hideProcessing();
                alert(`Sorry, card generation failed: ${errorMsg}\n\nPlease try again with a different description.`);
            }
            
        } catch (error) {
            console.error('❌ Card generation error:', error);
            this.hideProcessing();
            
            let userMessage = 'Sorry, we couldn\'t generate your trading card. ';
            if (error.message.includes('Failed to fetch')) {
                userMessage += 'Please check your internet connection and try again.';
            } else if (error.message.includes('401')) {
                userMessage += 'Your session has expired. Please log in again.';
                this.handleLogout();
                return;
            } else if (error.message.includes('500')) {
                userMessage += 'Our servers are experiencing issues. Please try again in a moment.';
            } else if (error.message.includes('timeout')) {
                userMessage += 'The request took too long. Please try again.';
            } else {
                userMessage += 'Please try again with a different description.';
            }
            
            alert(userMessage);
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
        
        // Store card data for video generation
        this.currentCardData = {
            imageBase64: imageBase64,
            imageSrc: imageSrc,
            metadata: metadata
        };
        
        // Add error handler for image loading
        this.elements.resultImage.onerror = () => {
            console.error('❌ Failed to load generated image');
            alert('Error: Failed to display generated card');
        };
        
        this.elements.resultImage.onload = () => {
            console.log('✅ Image loaded successfully');
        };
        
        // Reset video display
        this.hideVideoResult();
        
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

    // ========================================
    // VIDEO GENERATION METHODS - NEW
    // ========================================

    async handleAnimateCard() {
        if (!this.currentCardData) {
            alert('No card available to animate. Please generate a card first.');
            return;
        }

        console.log('🎬 Starting card animation...');
        
        try {
            // Show video processing status
            this.showVideoProcessing();
            
            // Get animation prompt from user (optional)
            const animationPrompt = prompt(
                'How would you like to animate your trading card?',
                'Make this trading card come alive with magical energy and subtle movement'
            );
            
            if (animationPrompt === null) {
                // User cancelled
                this.hideVideoProcessing();
                return;
            }

            // Generate video
            await this.generateVideo(this.currentCardData.imageBase64, animationPrompt || 'Make this trading card come alive with subtle animation');
            
        } catch (error) {
            console.error('❌ Video generation error:', error);
            this.hideVideoProcessing();
            alert('Video generation failed. Please try again.');
        }
    }

    async generateVideo(cardImageBase64, animationPrompt) {
        console.log('🎬 Generating video with Nova Reel...');
        
        try {
            // Get API base URL
            const apiBaseUrl = window.SNAPMAGIC_API_URL || 'https://jlnqp1gs21.execute-api.us-east-1.amazonaws.com/dev/';
            const endpoint = `${apiBaseUrl}api/generate_video`;
            
            console.log('🎯 Making video API call to:', endpoint);
            
            const requestBody = {
                action: 'generate_video',
                card_image: cardImageBase64,
                animation_prompt: animationPrompt
            };
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentUser.token}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('🎬 Video API response:', {
                success: result.success,
                hasVideoBase64: !!result.result,
                hasVideoUrl: !!result.video_url,
                metadata: result.metadata
            });

            if (result.success && (result.result || result.video_url)) {
                console.log('✅ Video generation successful');
                this.showVideoResult(result.result, result.video_url, result.metadata);
            } else {
                const errorMsg = result.error || 'Video generation failed';
                console.error('❌ Video API error:', errorMsg);
                throw new Error(errorMsg);
            }

        } catch (error) {
            console.error('❌ Video generation failed:', error);
            this.hideVideoProcessing();
            
            let userMessage = 'Sorry, we couldn\'t generate your animated card. ';
            if (error.message.includes('Failed to fetch')) {
                userMessage += 'Please check your internet connection and try again.';
            } else if (error.message.includes('401')) {
                userMessage += 'Your session has expired. Please log in again.';
                this.handleLogout();
                return;
            } else if (error.message.includes('500')) {
                userMessage += 'Our servers are experiencing issues. Please try again in a moment.';
            } else {
                userMessage += 'Please try again with a different animation style.';
            }
            
            alert(userMessage);
        }
    }

    showVideoResult(videoBase64, videoUrl, metadata) {
        console.log('🎥 Displaying video result...');
        
        this.hideVideoProcessing();
        
        // Set video source (prefer URL over base64 for better performance)
        let videoSrc;
        if (videoUrl) {
            videoSrc = videoUrl;
            console.log('🔗 Using S3 video URL');
        } else if (videoBase64) {
            videoSrc = `data:video/mp4;base64,${videoBase64}`;
            console.log('📦 Using base64 video data');
        } else {
            console.error('❌ No video data available');
            alert('Error: No video data received');
            return;
        }
        
        // Set video source and show container
        this.elements.resultVideo.src = videoSrc;
        this.elements.videoContainer.classList.remove('hidden');
        this.elements.downloadVideoBtn.classList.remove('hidden');
        
        // Store video data for download
        this.currentVideoData = {
            videoBase64: videoBase64,
            videoUrl: videoUrl,
            metadata: metadata
        };
        
        // Add video event handlers
        this.elements.resultVideo.onloadeddata = () => {
            console.log('✅ Video loaded successfully');
        };
        
        this.elements.resultVideo.onerror = () => {
            console.error('❌ Failed to load video');
            alert('Error: Failed to display video');
        };
        
        // Scroll to video
        this.elements.videoContainer.scrollIntoView({ behavior: 'smooth' });
        
        console.log('✅ Video display setup complete');
    }

    async handleDownloadVideo() {
        if (!this.currentVideoData) {
            alert('No video available to download.');
            return;
        }

        console.log('📹 Starting video download...');
        
        try {
            let videoData;
            
            // Try to use S3 URL first, fallback to base64
            if (this.currentVideoData.videoUrl) {
                console.log('🔗 Downloading from S3 URL...');
                const response = await fetch(this.currentVideoData.videoUrl);
                const blob = await response.blob();
                videoData = URL.createObjectURL(blob);
            } else if (this.currentVideoData.videoBase64) {
                console.log('📦 Using base64 video data...');
                videoData = `data:video/mp4;base64,${this.currentVideoData.videoBase64}`;
            } else {
                throw new Error('No video data available');
            }
            
            // Create download link
            const link = document.createElement('a');
            link.href = videoData;
            link.download = `snapmagic-animated-card-${Date.now()}.mp4`;
            
            // Trigger download
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(link);
                if (this.currentVideoData.videoUrl) {
                    URL.revokeObjectURL(videoData);
                }
            }, 100);
            
            console.log('📹 Video download initiated successfully');
            
            // Show success message
            const originalText = this.elements.downloadVideoBtn.textContent;
            this.elements.downloadVideoBtn.textContent = '✅ Downloaded!';
            setTimeout(() => {
                this.elements.downloadVideoBtn.textContent = originalText;
            }, 2000);
            
        } catch (error) {
            console.error('❌ Video download failed:', error);
            alert('Video download failed. Please try again.');
        }
    }

    showVideoProcessing() {
        this.elements.videoProcessingStatus.classList.remove('hidden');
        this.elements.animateBtn.disabled = true;
        this.elements.animateBtn.textContent = '🎬 Creating Video...';
    }

    hideVideoProcessing() {
        this.elements.videoProcessingStatus.classList.add('hidden');
        this.elements.animateBtn.disabled = false;
        this.elements.animateBtn.textContent = '🎬 Animate Card';
    }

    hideVideoResult() {
        this.elements.videoContainer.classList.add('hidden');
        this.elements.downloadVideoBtn.classList.add('hidden');
        this.currentVideoData = null;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.snapMagicApp = new SnapMagicApp();
});
