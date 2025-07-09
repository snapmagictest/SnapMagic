/**
 * SnapMagic - Modern UI Application
 * AI-Powered Trading Card Creator with Professional Interface
 */

class SnapMagicApp {
    constructor() {
        // Authentication state
        this.isAuthenticated = false;
        this.authToken = null;
        this.currentUser = null;
        
        // UI state
        this.currentTab = 'instructions';
        this.generatedCardData = null;
        this.videoGenerationInProgress = false;
        
        // Initialize app
        this.init();
    }

    init() {
        console.log('🎴 SnapMagic App Initializing...');
        console.log('🔧 Configuration:', window.SNAPMAGIC_CONFIG);
        
        // Get DOM elements
        this.getElements();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Show login screen after loading
        setTimeout(() => {
            this.hideLoading();
            this.showLogin();
        }, 2000);
    }

    getElements() {
        // Screens
        this.elements = {
            loadingScreen: document.getElementById('loadingScreen'),
            loginScreen: document.getElementById('loginScreen'),
            mainApp: document.getElementById('mainApp'),
            
            // Login form
            loginForm: document.getElementById('loginForm'),
            usernameInput: document.getElementById('username'),
            passwordInput: document.getElementById('password'),
            
            // Header (removed user elements for events)
            // usernameDisplay: document.getElementById('usernameDisplay'),
            // signOutBtn: document.getElementById('signOutBtn'),
            
            // Tab navigation
            tabNavItems: document.querySelectorAll('.tab-nav-item'),
            tabContents: document.querySelectorAll('.tab-content'),
            
            // Card generation
            promptInput: document.getElementById('promptInput'),
            generateBtn: document.getElementById('generateBtn'),
            resultContainer: document.getElementById('resultContainer'),
            resultActions: document.getElementById('resultActions'),
            downloadBtn: document.getElementById('downloadBtn'),
            createVideoBtn: document.getElementById('createVideoBtn'),
            createAnotherBtn: document.getElementById('createAnotherBtn'),
            
            // Video generation
            videoSection: document.getElementById('videoSection'),
            videoControls: document.getElementById('videoControls'),
            videoResult: document.getElementById('videoResult'),
            animationPrompt: document.getElementById('animationPrompt'),
            generateVideoBtn: document.getElementById('generateVideoBtn'),
            videoPlayer: document.getElementById('videoPlayer'),
            videoSource: document.getElementById('videoSource'),
            downloadVideoBtn: document.getElementById('downloadVideoBtn'),
            createAnotherVideoBtn: document.getElementById('createAnotherVideoBtn'),
            backToCardBtn: document.getElementById('backToCardBtn'),
            
            // Processing overlay
            processingOverlay: document.getElementById('processingOverlay')
        };
    }

    setupEventListeners() {
        // Login form
        this.elements.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        
        // Sign out (removed for events)
        // this.elements.signOutBtn.addEventListener('click', () => this.handleSignOut());
        
        // Tab navigation
        this.elements.tabNavItems.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
        
        // Card generation
        this.elements.generateBtn.addEventListener('click', () => this.handleGenerateCard());
        this.elements.downloadBtn.addEventListener('click', () => this.handleDownloadCard());
        this.elements.createVideoBtn.addEventListener('click', () => this.handleCreateVideo());
        this.elements.createAnotherBtn.addEventListener('click', () => this.handleCreateAnother());
        
        // Video generation
        this.elements.generateVideoBtn.addEventListener('click', () => this.handleGenerateVideo());
        this.elements.downloadVideoBtn.addEventListener('click', () => this.handleDownloadVideo());
        this.elements.createAnotherVideoBtn.addEventListener('click', () => this.handleCreateAnotherVideo());
        this.elements.backToCardBtn.addEventListener('click', () => this.switchTab('card-generation'));
        
        // Example prompt buttons
        this.setupExamplePrompts();
    }

    setupExamplePrompts() {
        // Card generation example prompts
        const cardExampleBtns = document.querySelectorAll('.example-btn:not(.video-example)');
        cardExampleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const prompt = btn.getAttribute('data-prompt');
                this.elements.promptInput.value = prompt;
                this.elements.promptInput.focus();
            });
        });

        // Video generation example prompts
        const videoExampleBtns = document.querySelectorAll('.example-btn.video-example');
        videoExampleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const prompt = btn.getAttribute('data-prompt');
                this.elements.animationPrompt.value = prompt;
                this.elements.animationPrompt.focus();
            });
        });
    }

    // Screen Management
    hideLoading() {
        this.elements.loadingScreen.classList.add('hidden');
    }

    showLogin() {
        this.elements.loginScreen.classList.remove('hidden');
        this.elements.mainApp.style.display = 'none';
    }

    showMainApp() {
        this.elements.loginScreen.classList.add('hidden');
        this.elements.mainApp.style.display = 'block';
    }

    // Tab Management
    switchTab(tabName) {
        console.log(`🔄 Switching to tab: ${tabName}`);
        
        // Update navigation
        this.elements.tabNavItems.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Update content
        this.elements.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === tabName);
        });
        
        this.currentTab = tabName;
        
        // Handle tab-specific logic
        if (tabName === 'video-generation') {
            this.updateVideoTab();
        }
    }

    updateVideoTab() {
        if (this.generatedCardData) {
            this.elements.videoSection.classList.add('hidden');
            this.elements.videoControls.classList.remove('hidden');
        } else {
            this.elements.videoSection.classList.remove('hidden');
            this.elements.videoControls.classList.add('hidden');
            this.elements.videoResult.classList.add('hidden');
        }
    }

    // Authentication
    async handleLogin(e) {
        e.preventDefault();
        
        const username = this.elements.usernameInput.value.trim();
        const password = this.elements.passwordInput.value.trim();
        
        console.log('🔐 Login attempt for username:', username);
        
        if (!username || !password) {
            this.showError('Please enter both username and password');
            return;
        }

        try {
            this.showProcessing('Signing you in...');
            
            const apiBaseUrl = window.SNAPMAGIC_CONFIG.API_URL;
            const response = await fetch(`${apiBaseUrl}api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            
            if (data.success) {
                console.log('✅ Login successful');
                this.isAuthenticated = true;
                this.authToken = data.token;
                this.currentUser = { username, token: data.token };
                
                // Username display removed for events
                // this.elements.usernameDisplay.textContent = username;
                this.hideProcessing();
                this.showMainApp();
                
                // Reset form
                this.elements.loginForm.reset();
            } else {
                console.error('❌ Login failed:', data.error);
                this.hideProcessing();
                this.showError(data.error || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            this.hideProcessing();
            this.showError('Login failed. Please check your connection and try again.');
        }
    }

    handleSignOut() {
        console.log('👋 User signing out');
        this.isAuthenticated = false;
        this.authToken = null;
        this.currentUser = null;
        this.generatedCardData = null;
        
        // Reset UI
        this.switchTab('instructions');
        this.clearResults();
        this.showLogin();
    }

    // Card Generation
    async handleGenerateCard() {
        const userPrompt = this.elements.promptInput.value.trim();
        
        console.log('🎴 Generate card request:', userPrompt);
        
        if (!userPrompt || userPrompt.length < 10) {
            this.showError('Please enter a description of at least 10 characters');
            return;
        }
        
        if (userPrompt.length > 1024) {
            this.showError('Description must be less than 1024 characters');
            return;
        }

        if (!this.isAuthenticated || !this.authToken) {
            this.showError('Authentication required. Please log in again.');
            this.handleSignOut();
            return;
        }

        try {
            this.showProcessing('Creating your magical trading card...');
            this.elements.generateBtn.disabled = true;
            
            const apiBaseUrl = window.SNAPMAGIC_CONFIG.API_URL;
            const endpoint = `${apiBaseUrl}api/transform-card`;
            
            console.log('🎯 API call to:', endpoint);
            
            const requestBody = {
                action: 'transform_card',
                prompt: userPrompt
            };
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentUser.token}`
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            
            if (data.success) {
                console.log('✅ Card generation successful');
                this.generatedCardData = data;
                this.displayGeneratedCard(data);
                this.hideProcessing();
            } else {
                console.error('❌ Card generation failed:', data.error);
                this.hideProcessing();
                
                // Check for content filter message specifically
                if (data.error && data.error.includes('content filters')) {
                    this.showError(`🚫 Content Blocked by AI Safety Filters\n\n${data.error}\n\nPlease try a different prompt that doesn't include potentially sensitive content.`);
                } else {
                    this.showError(data.error || 'Card generation failed. Please try again.');
                }
            }
        } catch (error) {
            console.error('❌ Card generation error:', error);
            this.hideProcessing();
            this.showError('Card generation failed. Please check your connection and try again.');
        } finally {
            this.elements.generateBtn.disabled = false;
        }
    }

    async displayGeneratedCard(data) {
        const novaImageBase64 = data.result; // Raw Nova Canvas image
        const userPrompt = this.elements.promptInput.value.trim();
        
        try {
            // Initialize template system if not already done
            if (!this.templateSystem) {
                this.templateSystem = new window.SnapMagicTemplateSystem();
                // Wait for template configuration to load
                await new Promise(resolve => {
                    const checkConfig = () => {
                        if (this.templateSystem.templateConfig) {
                            resolve();
                        } else {
                            setTimeout(checkConfig, 100);
                        }
                    };
                    checkConfig();
                });
            }
            
            // Create final trading card with template
            console.log('🎴 Compositing trading card with template...');
            const finalCardBase64 = await this.templateSystem.createTradingCard(novaImageBase64, userPrompt);
            const finalImageSrc = `data:image/png;base64,${finalCardBase64}`;
            
            // Store both Nova image and final card
            this.generatedCardData = {
                ...data,
                novaImageBase64: novaImageBase64,
                finalCardBase64: finalCardBase64,
                finalImageSrc: finalImageSrc
            };
            
            // Display the final composed card
            this.elements.resultContainer.innerHTML = `
                <img src="${finalImageSrc}" alt="Generated Trading Card" class="result-image">
            `;
            
            this.elements.resultActions.classList.remove('hidden');
            
        } catch (error) {
            console.error('❌ Template composition failed:', error);
            // Fallback to raw Nova Canvas image
            const imageSrc = data.imageSrc || `data:image/png;base64,${data.result}`;
            this.elements.resultContainer.innerHTML = `
                <img src="${imageSrc}" alt="Generated Trading Card" class="result-image">
                <p class="error-text">Template composition failed. Showing raw AI-generated image.</p>
            `;
            this.elements.resultActions.classList.remove('hidden');
        }
    }

    handleDownloadCard() {
        if (!this.generatedCardData) return;
        
        // Download the final composed card (with template) if available, otherwise raw Nova image
        const imageSrc = this.generatedCardData.finalImageSrc || 
                         this.generatedCardData.imageSrc || 
                         `data:image/png;base64,${this.generatedCardData.result}`;
        
        const link = document.createElement('a');
        link.href = imageSrc;
        
        // Generate filename with event name if available
        const eventName = this.templateSystem?.templateConfig?.eventName || 'Event';
        const sanitizedEventName = eventName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        link.download = `snapmagic-${sanitizedEventName}-card-${Date.now()}.png`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('💾 Trading card downloaded');
    }

    handleCreateVideo() {
        console.log('🎬 Switching to video creation');
        this.switchTab('video-generation');
    }

    handleCreateAnother() {
        console.log('🔄 Creating another card');
        this.clearResults();
        this.elements.promptInput.focus();
    }

    // Video Generation
    async handleGenerateVideo() {
        const userPrompt = this.elements.animationPrompt.value.trim();
        
        if (!userPrompt) {
            this.showError('Please describe your action for the video');
            return;
        }

        // Automatically prepend the frame 1 prefix to ensure immediate action
        const animationPrompt = `From frame 1 and immediately visible: ${userPrompt}`;
        console.log('🎬 Video prompt with prefix:', animationPrompt);

        if (!this.generatedCardData) {
            this.showError('Please generate a trading card first');
            this.switchTab('card-generation');
            return;
        }

        try {
            this.showProcessing('Creating your animated video... This takes about 2 minutes.');
            this.elements.generateVideoBtn.disabled = true;
            this.videoGenerationInProgress = true;
            
            const apiBaseUrl = window.SNAPMAGIC_CONFIG.API_URL;
            const endpoint = `${apiBaseUrl}api/transform-card`;
            
            // Convert card image to letterboxed JPEG format for video generation
            const letterboxedImage = await this.letterboxCardForVideo(this.generatedCardData.result);
            
            const requestBody = {
                action: 'generate_video',
                card_image: letterboxedImage,  // Send JPEG letterboxed 1280x720 image (no transparency)
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

            const data = await response.json();
            
            if (data.success && data.metadata?.invocation_arn) {
                console.log('✅ Video generation initiated');
                const invocationArn = data.metadata.invocation_arn;
                console.log('🔍 Using full invocation ARN:', invocationArn);
                this.startVideoPolling(invocationArn, data.metadata);
            } else {
                console.error('❌ Video generation failed:', data.error);
                this.hideProcessing();
                this.showError(data.error || 'Video generation failed. Please try again.');
                this.videoGenerationInProgress = false;
            }
        } catch (error) {
            console.error('❌ Video generation error:', error);
            this.hideProcessing();
            this.showError('Video generation failed. Please check your connection and try again.');
            this.videoGenerationInProgress = false;
        } finally {
            this.elements.generateVideoBtn.disabled = false;
        }
    }

    /**
     * Letterbox trading card image to 1280x720 for Nova Reel
     * Places card centered on black background as JPEG (no transparency)
     */
    async letterboxCardForVideo(cardImageBase64) {
        return new Promise((resolve, reject) => {
            try {
                console.log('📐 Starting letterboxing for Nova Reel...');
                
                // Create canvas for letterboxing
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set Nova Reel required dimensions
                canvas.width = 1280;
                canvas.height = 720;
                
                // Fill with solid black background
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, 1280, 720);
                
                // Load the card image
                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                img.onload = function() {
                    console.log(`📏 Original card: ${img.width}x${img.height}`);
                    
                    // Calculate scaling to fit within 1280x720 while maintaining aspect ratio
                    const scale = Math.min(1280 / img.width, 720 / img.height);
                    const newWidth = img.width * scale;
                    const newHeight = img.height * scale;
                    
                    // Center the card
                    const x = (1280 - newWidth) / 2;
                    const y = (720 - newHeight) / 2;
                    
                    console.log(`📐 Scaled card: ${newWidth.toFixed(0)}x${newHeight.toFixed(0)} at (${x.toFixed(0)}, ${y.toFixed(0)})`);
                    
                    // Draw the card on black background
                    ctx.drawImage(img, x, y, newWidth, newHeight);
                    
                    // CRITICAL: Use JPEG format to guarantee no transparency
                    const letterboxedBase64 = canvas.toDataURL('image/jpeg', 1.0).split(',')[1];
                    
                    console.log('✅ Letterboxing complete: 1280x720 JPEG on black background (no transparency possible)');
                    console.log(`📊 Base64 length: ${letterboxedBase64.length} characters`);
                    resolve(letterboxedBase64);
                };
                
                img.onerror = function() {
                    console.error('❌ Failed to load card image for letterboxing');
                    reject(new Error('Failed to load card image'));
                };
                
                // Set image source (add data URL prefix if needed)
                const imageData = cardImageBase64.startsWith('data:image/') 
                    ? cardImageBase64 
                    : `data:image/png;base64,${cardImageBase64}`;
                img.src = imageData;
                
            } catch (error) {
                console.error('❌ Letterboxing error:', error);
                reject(error);
            }
        });
    }

    /**
     * Start polling for video completion with specified timing
     * Wait 2 minutes initially, then poll every 10 seconds (max 10 times)
     */
    startVideoPolling(invocationArn, metadata) {
        console.log('⏰ Starting video polling - waiting 2 minutes before first check...');
        
        // Update UI to show waiting status
        this.updateVideoProcessingStatus('Video is being generated... Please wait 2 minutes for initial processing.');
        
        // Wait 2 minutes (120 seconds) before first check
        setTimeout(() => {
            console.log('⏰ 2 minutes elapsed - starting polling every 10 seconds (max 10 attempts)');
            this.updateVideoProcessingStatus('Checking video status...');
            
            // Start polling every 10 seconds with retry counter
            this.pollVideoStatus(invocationArn, metadata, 0);
        }, 2 * 60 * 1000); // 2 minutes in milliseconds
    }

    /**
     * Poll video status every 10 seconds until ready (max 10 retries)
     */
    async pollVideoStatus(invocationArn, metadata, retryCount = 0) {
        const MAX_RETRIES = 10;
        
        // Check if we've exceeded max retries
        if (retryCount >= MAX_RETRIES) {
            console.error(`❌ Max retries (${MAX_RETRIES}) exceeded for video polling`);
            this.hideProcessing();
            this.showError(`Video generation timed out after ${MAX_RETRIES} attempts. Please try again.`);
            this.videoGenerationInProgress = false;
            return;
        }
        
        try {
            console.log(`🔍 Polling video status for: ${invocationArn} (attempt ${retryCount + 1}/${MAX_RETRIES})`);
            
            const apiBaseUrl = window.SNAPMAGIC_CONFIG.API_URL;
            const endpoint = `${apiBaseUrl}api/transform-card`;
            
            const requestBody = {
                action: 'get_video_status',
                invocation_arn: invocationArn  // This is actually the full ARN, not just ID
            };

            console.log('📤 Sending video status request:', requestBody);
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentUser.token}`
                },
                body: JSON.stringify(requestBody)
            });

            console.log('📥 Response status:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ HTTP Error Response:', errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
            }

            const result = await response.json();
            console.log('📊 Video status response:', result);

            if (result.success && (result.status === 'SUCCEEDED' || result.status === 'completed') && result.video_url) {
                console.log('✅ Video generation completed successfully!');
                this.hideProcessing();
                this.displayGeneratedVideo(result.video_url);
                this.videoGenerationInProgress = false;
            } else if (result.success && (result.status === 'IN_PROGRESS' || result.status === 'PROCESSING')) {
                console.log(`⏳ Video still processing, will check again in 10 seconds (attempt ${retryCount + 1}/${MAX_RETRIES})`);
                this.updateVideoProcessingStatus(`Video processing... Attempt ${retryCount + 1}/${MAX_RETRIES}. ${result.message || 'Checking again in 10 seconds'}`);
                
                // Poll again in 10 seconds with incremented retry count
                setTimeout(() => {
                    this.pollVideoStatus(invocationArn, metadata, retryCount + 1);
                }, 10 * 1000); // 10 seconds
            } else {
                // Failed, blocked, or unknown status
                console.error('❌ Video generation failed or blocked:', result);
                this.hideProcessing();
                
                // Check for content filter message specifically
                if (result.message && result.message.includes('content filters')) {
                    this.showError(`🚫 Content Blocked by AI Safety Filters\n\n${result.message}\n\nPlease try a different prompt that doesn't include potentially sensitive content.`);
                } else if (result.message) {
                    this.showError(result.message);
                } else {
                    this.showError(result.error || `Video generation failed with status: ${result.status}`);
                }
                this.videoGenerationInProgress = false;
            }

        } catch (error) {
            console.error('❌ Error polling video status:', error);
            
            // Increment retry count for errors too
            const nextRetryCount = retryCount + 1;
            
            if (nextRetryCount >= MAX_RETRIES) {
                console.error(`❌ Max retries (${MAX_RETRIES}) exceeded due to errors`);
                this.hideProcessing();
                this.showError(`Video status check failed after ${MAX_RETRIES} attempts. Error: ${error.message}`);
                this.videoGenerationInProgress = false;
                return;
            }
            
            // Continue polling on error (might be temporary)
            console.log(`⚠️ Polling error, retrying in 10 seconds... (attempt ${nextRetryCount}/${MAX_RETRIES})`);
            this.updateVideoProcessingStatus(`Error checking status (attempt ${nextRetryCount}/${MAX_RETRIES}), retrying...`);
            
            setTimeout(() => {
                this.pollVideoStatus(invocationArn, metadata, nextRetryCount);
            }, 10 * 1000); // 10 seconds
        }
    }

    /**
     * Update video processing status message
     */
    updateVideoProcessingStatus(message) {
        const processingText = this.elements.processingOverlay.querySelector('.processing-text');
        if (processingText) {
            processingText.textContent = message;
        }
        console.log('📢 Status update:', message);
    }

    displayGeneratedVideo(videoUrl) {
        console.log('🎥 Displaying video result...');
        
        // Set video source (prefer URL for better performance)
        let videoSrc;
        if (videoUrl) {
            videoSrc = videoUrl;
            console.log('🔗 Using S3 video URL');
        } else {
            console.error('❌ No video URL available');
            this.showError('Error: No video data received');
            return;
        }
        
        // Set video source and show result container
        this.elements.videoSource.src = videoSrc;
        this.elements.videoPlayer.load();
        
        // Hide controls, show result
        this.elements.videoControls.classList.add('hidden');
        this.elements.videoResult.classList.remove('hidden');
        
        console.log('✅ Video displayed successfully');
    }

    handleDownloadVideo() {
        const videoUrl = this.elements.videoSource.src;
        if (!videoUrl) return;
        
        const link = document.createElement('a');
        link.href = videoUrl;
        link.download = `snapmagic-video-${Date.now()}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('💾 Video downloaded');
    }

    handleCreateAnotherVideo() {
        console.log('🔄 Creating another video');
        this.elements.videoResult.classList.add('hidden');
        this.elements.videoControls.classList.remove('hidden');
        this.elements.animationPrompt.value = '';
        this.elements.animationPrompt.focus();
    }

    // Utility Methods
    clearResults() {
        this.elements.resultContainer.innerHTML = `
            <p style="color: var(--text-secondary); text-align: center; padding: 2rem;">
                Your generated trading card will appear here
            </p>
        `;
        this.elements.resultActions.classList.add('hidden');
        this.elements.promptInput.value = '';
    }

    showProcessing(message = 'Processing...') {
        const processingText = this.elements.processingOverlay.querySelector('.processing-text');
        if (processingText) {
            processingText.textContent = message;
        }
        this.elements.processingOverlay.style.display = 'flex';
    }

    hideProcessing() {
        this.elements.processingOverlay.style.display = 'none';
    }

    showError(message) {
        // Create modern error notification
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #e53e3e, #c53030);
            color: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            z-index: 3000;
            max-width: 450px;
            font-weight: 500;
            animation: slideIn 0.3s ease;
            line-height: 1.5;
        `;
        
        // Handle multi-line messages by converting \n to <br>
        const formattedMessage = message.replace(/\n/g, '<br>');
        
        errorDiv.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 0.8rem;">
                <span style="font-size: 1.2rem; margin-top: 0.1rem;">⚠️</span>
                <div style="flex: 1;">
                    ${formattedMessage}
                </div>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto remove after 8 seconds (longer for content filter messages)
        const autoRemoveTime = message.includes('Content Blocked') ? 10000 : 6000;
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (errorDiv.parentNode) {
                        document.body.removeChild(errorDiv);
                    }
                }, 300);
            }
        }, autoRemoveTime);
        
        // Add CSS animations if not already present
        if (!document.querySelector('#error-animations')) {
            const style = document.createElement('style');
            style.id = 'error-animations';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, initializing SnapMagic...');
    window.snapMagicApp = new SnapMagicApp();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('📱 App hidden');
    } else {
        console.log('📱 App visible');
    }
});

// Service Worker registration for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('✅ SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('❌ SW registration failed: ', registrationError);
            });
    });
}
