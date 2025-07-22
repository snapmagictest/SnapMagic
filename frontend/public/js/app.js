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
        
        // Device identification for session isolation
        this.deviceId = this.getDeviceId();
        
        // UI state
        this.currentTab = 'instructions';
        this.generatedCardData = null;
        this.videoGenerationInProgress = false;
        
        // Gallery system for user's cards
        this.userGallery = {
            cards: [], // Array of user's generated cards
            currentIndex: 0, // Currently displayed card index
            totalCards: 0 // Total cards in user's session
        };
        
        // Usage tracking
        this.usageLimits = {
            cards: { used: 0, total: 5 },
            videos: { used: 0, total: 3 },
            prints: { used: 0, total: 1 }
        };
        
        // Initialize app
        this.init();
    }

    /**
     * Generate or retrieve device ID for session isolation with comprehensive debugging
     * @returns {string} Unique device identifier
     */
    getDeviceId() {
        // Comprehensive localStorage debugging
        console.log('🔍 localStorage Debug Analysis:', {
            // Basic support check
            supported: typeof(Storage) !== "undefined",
            
            // Environment info
            domain: window.location.hostname,
            protocol: window.location.protocol,
            isSecure: window.location.protocol === 'https:',
            userAgent: navigator.userAgent.substring(0, 100),
            
            // Browser mode detection
            isIncognito: (() => {
                try {
                    // Test for incognito mode
                    localStorage.setItem('incognito_test', '1');
                    localStorage.removeItem('incognito_test');
                    return false; // Not incognito if we can write/remove
                } catch (e) {
                    return true; // Likely incognito if localStorage throws error
                }
            })(),
            
            // Storage capabilities test
            canWrite: (() => {
                try {
                    const testKey = 'snapmagic_capability_test';
                    const testValue = 'test_' + Date.now();
                    localStorage.setItem(testKey, testValue);
                    const retrieved = localStorage.getItem(testKey);
                    localStorage.removeItem(testKey);
                    return retrieved === testValue;
                } catch(e) {
                    console.error('❌ localStorage write capability test failed:', e);
                    return false;
                }
            })(),
            
            // Current storage info
            currentKeys: (() => {
                try {
                    const keys = [];
                    for (let i = 0; i < localStorage.length; i++) {
                        keys.push(localStorage.key(i));
                    }
                    return keys;
                } catch(e) {
                    return ['Error accessing keys: ' + e.message];
                }
            })(),
            
            // Storage quota info (if available)
            storageQuota: (() => {
                try {
                    if ('storage' in navigator && 'estimate' in navigator.storage) {
                        navigator.storage.estimate().then(estimate => {
                            console.log('📊 Storage Quota:', {
                                quota: estimate.quota,
                                usage: estimate.usage,
                                available: estimate.quota - estimate.usage
                            });
                        });
                        return 'Checking quota...';
                    }
                    return 'Quota API not available';
                } catch(e) {
                    return 'Error checking quota: ' + e.message;
                }
            })()
        });

        // Try to get existing device ID
        let deviceId = null;
        let retrievalError = null;
        
        try {
            deviceId = localStorage.getItem('snapmagic_device_id');
            console.log('📖 localStorage retrieval result:', {
                found: deviceId !== null,
                value: deviceId,
                type: typeof deviceId
            });
        } catch (error) {
            retrievalError = error;
            console.error('❌ Failed to retrieve from localStorage:', error);
        }
        
        if (!deviceId) {
            // Generate new device ID
            deviceId = 'device_' + Math.random().toString(36).substr(2, 12);
            console.log('🆕 Generated new device ID:', deviceId);
            
            // Attempt to store it
            try {
                localStorage.setItem('snapmagic_device_id', deviceId);
                console.log('💾 Attempted to store device ID in localStorage');
                
                // Immediate verification
                const immediateVerification = localStorage.getItem('snapmagic_device_id');
                console.log('🔍 Immediate storage verification:', {
                    stored: deviceId,
                    retrieved: immediateVerification,
                    match: immediateVerification === deviceId,
                    success: immediateVerification === deviceId
                });
                
                // Delayed verification (to test persistence)
                setTimeout(() => {
                    try {
                        const delayedVerification = localStorage.getItem('snapmagic_device_id');
                        console.log('⏰ Delayed storage verification (after 1 second):', {
                            stored: deviceId,
                            retrieved: delayedVerification,
                            match: delayedVerification === deviceId,
                            persistent: delayedVerification === deviceId
                        });
                    } catch (e) {
                        console.error('❌ Delayed verification failed:', e);
                    }
                }, 1000);
                
            } catch (error) {
                console.error('❌ Failed to store device ID in localStorage:', error);
                console.log('🔧 Storage error details:', {
                    name: error.name,
                    message: error.message,
                    code: error.code || 'No code'
                });
            }
        } else {
            console.log('✅ Using existing device ID from localStorage:', deviceId);
            
            // Test if we can still write (refresh the value)
            try {
                localStorage.setItem('snapmagic_device_id', deviceId);
                console.log('🔄 Successfully refreshed device ID in localStorage');
            } catch (error) {
                console.error('❌ Failed to refresh device ID in localStorage:', error);
            }
        }
        
        // Final verification and summary
        console.log('📋 Device ID Session Summary:', {
            finalDeviceId: deviceId,
            hadRetrievalError: retrievalError !== null,
            retrievalError: retrievalError?.message,
            timestamp: new Date().toISOString(),
            sessionStart: true
        });
        
        return deviceId;
    }

    /**
     * Monitor localStorage persistence over time
     */
    startLocalStorageMonitoring() {
        const originalDeviceId = this.deviceId;
        let checkCount = 0;
        
        console.log('🔍 Starting localStorage persistence monitoring for device ID:', originalDeviceId);
        
        // Check every 30 seconds for the first 5 minutes
        const monitoringInterval = setInterval(() => {
            checkCount++;
            
            try {
                const currentDeviceId = localStorage.getItem('snapmagic_device_id');
                const isConsistent = currentDeviceId === originalDeviceId;
                
                console.log(`📊 localStorage Check #${checkCount}:`, {
                    timestamp: new Date().toISOString(),
                    original: originalDeviceId,
                    current: currentDeviceId,
                    consistent: isConsistent,
                    exists: currentDeviceId !== null,
                    timeElapsed: `${checkCount * 30} seconds`
                });
                
                if (!isConsistent) {
                    console.error('🚨 localStorage INCONSISTENCY DETECTED!', {
                        expected: originalDeviceId,
                        found: currentDeviceId,
                        checkNumber: checkCount,
                        timeWhenLost: `${checkCount * 30} seconds after initialization`
                    });
                }
                
                // Stop monitoring after 10 checks (5 minutes)
                if (checkCount >= 10) {
                    clearInterval(monitoringInterval);
                    console.log('✅ localStorage monitoring completed after 5 minutes');
                }
                
            } catch (error) {
                console.error(`❌ localStorage monitoring check #${checkCount} failed:`, error);
            }
        }, 30000); // Check every 30 seconds
        
        // Also add a check when the page becomes visible again (tab switching)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                try {
                    const currentDeviceId = localStorage.getItem('snapmagic_device_id');
                    console.log('👁️ Page visibility change - localStorage check:', {
                        timestamp: new Date().toISOString(),
                        original: originalDeviceId,
                        current: currentDeviceId,
                        consistent: currentDeviceId === originalDeviceId,
                        pageVisible: true
                    });
                } catch (error) {
                    console.error('❌ Visibility change localStorage check failed:', error);
                }
            }
        });
        
        // Check on page unload
        window.addEventListener('beforeunload', () => {
            try {
                const currentDeviceId = localStorage.getItem('snapmagic_device_id');
                console.log('🚪 Page unload - final localStorage check:', {
                    timestamp: new Date().toISOString(),
                    original: originalDeviceId,
                    current: currentDeviceId,
                    consistent: currentDeviceId === originalDeviceId
                });
            } catch (error) {
                console.error('❌ Page unload localStorage check failed:', error);
            }
        });
    }

    init() {
        console.log('🎴 SnapMagic App Initializing...');
        console.log('🔧 Configuration:', window.SNAPMAGIC_CONFIG);
        
        // Start localStorage persistence monitoring
        this.startLocalStorageMonitoring();
        
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
            
            // Staff override
            staffOverrideBtn: document.getElementById('staffOverrideBtn'),
            
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
            printBtn: document.getElementById('printBtn'),
            createVideoBtn: document.getElementById('createVideoBtn'),
            createAnotherBtn: document.getElementById('createAnotherBtn'),
            enterCompetitionBtn: document.getElementById('enterCompetitionBtn'),
            shareLinkedInBtn: document.getElementById('shareLinkedInBtn'),
            
            // Usage limits display
            cardUsage: document.getElementById('cardUsage'),
            videoUsage: document.getElementById('videoUsage'),
            printUsage: document.getElementById('printUsage'),
            
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
            
            // Video gallery elements
            videoSelectedCard: document.getElementById('videoSelectedCard'),
            videoGalleryNavigation: document.getElementById('videoGalleryNavigation'),
            videoGalleryInfo: document.getElementById('videoGalleryInfo'),
            videoGalleryNumbers: document.getElementById('videoGalleryNumbers'),
            videoGalleryPrevBtn: document.getElementById('videoGalleryPrevBtn'),
            videoGalleryNextBtn: document.getElementById('videoGalleryNextBtn'),
            generateAnimationPromptBtn: document.getElementById('generateAnimationPromptBtn'),
            optimizeAnimationPromptBtn: document.getElementById('optimizeAnimationPromptBtn'),
            
            // Processing overlay
            processingOverlay: document.getElementById('processingOverlay'),
            
            // Name input modals
            nameInputModal: document.getElementById('nameInputModal'),
            nameInput: document.getElementById('nameInput'),
            nameConfirmBtn: document.getElementById('nameConfirmBtn'),
            nameCancelBtn: document.getElementById('nameCancelBtn'),
            nameConfirmModal: document.getElementById('nameConfirmModal'),
            namePreview: document.getElementById('namePreview'),
            nameYesBtn: document.getElementById('nameYesBtn'),
            nameEditBtn: document.getElementById('nameEditBtn'),
            
            // Competition modals
            competitionModal: document.getElementById('competitionModal'),
            phoneInput: document.getElementById('phoneInput'),
            competitionSubmitBtn: document.getElementById('competitionSubmitBtn'),
            competitionCancelBtn: document.getElementById('competitionCancelBtn'),
            competitionSuccessModal: document.getElementById('competitionSuccessModal'),
            competitionDetails: document.getElementById('competitionDetails'),
            competitionSuccessOkBtn: document.getElementById('competitionSuccessOkBtn'),
            
            // Competition Error Modal
            competitionErrorModal: document.getElementById('competitionErrorModal'),
            competitionErrorOkBtn: document.getElementById('competitionErrorOkBtn'),
            
            // Limit Reached Modal
            limitReachedModal: document.getElementById('limitReachedModal'),
            limitReachedOkBtn: document.getElementById('limitReachedOkBtn'),
            
            // Print success modal
            printSuccessModal: document.getElementById('printSuccessModal'),
            printSuccessOkBtn: document.getElementById('printSuccessOkBtn')
        };
    }

    setupEventListeners() {
        // Login form
        this.elements.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        
        // Staff override button
        this.elements.staffOverrideBtn.addEventListener('click', () => this.handleStaffOverride());
        
        // Sign out (removed for events)
        // this.elements.signOutBtn.addEventListener('click', () => this.handleSignOut());
        
        // Tab navigation
        this.elements.tabNavItems.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
        
        // Card generation
        this.elements.generateBtn.addEventListener('click', () => this.handleGenerateCard());
        this.elements.downloadBtn.addEventListener('click', () => this.handleDownloadCard());
        this.elements.printBtn.addEventListener('click', () => this.handlePrintCard());
        this.elements.createVideoBtn.addEventListener('click', () => this.handleCreateVideo());
        this.elements.createAnotherBtn.addEventListener('click', () => this.handleCreateAnother());
        
        // Prompt flow buttons
        document.getElementById('generatePromptBtn').addEventListener('click', () => this.handleGeneratePrompt());
        document.getElementById('optimizePromptBtn').addEventListener('click', () => this.handleOptimizePrompt());
        
        // Competition and sharing
        this.elements.enterCompetitionBtn.addEventListener('click', () => this.handleEnterCompetition());
        this.elements.shareLinkedInBtn.addEventListener('click', () => this.handleShareLinkedIn());
        
        // Gallery navigation
        this.setupGalleryNavigation();
        
        // Video gallery navigation
        this.setupVideoGalleryNavigation();
        
        // Video generation
        this.elements.generateVideoBtn.addEventListener('click', () => this.handleGenerateVideo());
        this.elements.downloadVideoBtn.addEventListener('click', () => this.handleDownloadVideo());
        this.elements.createAnotherVideoBtn.addEventListener('click', () => this.handleCreateAnotherVideo());
        this.elements.backToCardBtn.addEventListener('click', () => this.switchTab('card-generation'));
        
        // Name input modal event listeners
        this.elements.nameConfirmBtn.addEventListener('click', () => this.handleNameConfirm());
        this.elements.nameCancelBtn.addEventListener('click', () => this.handleNameCancel());
        this.elements.nameYesBtn.addEventListener('click', () => this.handleNameYes());
        this.elements.nameEditBtn.addEventListener('click', () => this.handleNameEdit());
        
        // Competition modal event listeners
        this.elements.competitionSubmitBtn.addEventListener('click', () => this.handleCompetitionSubmit());
        this.elements.competitionCancelBtn.addEventListener('click', () => this.handleCompetitionCancel());
        this.elements.competitionSuccessOkBtn.addEventListener('click', () => this.handleCompetitionSuccessOk());
        this.elements.competitionErrorOkBtn.addEventListener('click', () => this.handleCompetitionErrorOk());
        this.elements.limitReachedOkBtn.addEventListener('click', () => this.handleLimitReachedOk());
        
        // Print success modal
        this.elements.printSuccessOkBtn.addEventListener('click', () => this.handlePrintSuccessOk());
        
        // Enter key support for name input
        this.elements.nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleNameConfirm();
            }
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
        
        // Don't call initializeUsageLimits() here - login already set correct limits
        console.log('📱 Main app displayed - usage limits already set from login');
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
        if (this.userGallery.totalCards > 0) {
            // User has cards - show video controls and initialize gallery
            this.elements.videoSection.classList.add('hidden');
            this.elements.videoControls.classList.remove('hidden');
            this.initializeVideoGallery();
        } else {
            // No cards available - show message to generate cards first
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
                    'Content-Type': 'application/json',
                    'X-Device-ID': this.deviceId
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            
            if (data.success) {
                console.log('✅ Login successful');
                this.isAuthenticated = true;
                this.authToken = data.token;
                this.currentUser = { 
                    username, 
                    token: data.token
                };
                
                // Show staff override button for all users
                this.elements.staffOverrideBtn.style.display = 'block';
                
                // Update usage limits from login response
                if (data.remaining) {
                    this.updateUsageLimits(data.remaining);
                    console.log('📊 Usage limits loaded from server:', data.remaining);
                    
                    // Ensure limits are displayed after a short delay (in case elements aren't ready)
                    setTimeout(() => {
                        this.displayUsageLimits();
                        console.log('🔄 Usage limits re-displayed after delay');
                    }, 100);
                }
                
                // Username display removed for events
                // this.elements.usernameDisplay.textContent = username;
                
                // Load existing cards from previous sessions
                await this.loadExistingCards();
                
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

    // Staff Override Functionality
    async handleStaffOverride() {
        // Simple password prompt
        const password = prompt('🔓 Override Password:');
        if (!password) return;
        
        // Check password (using the override code as password)
        if (password !== 'snap') {
            alert('❌ Incorrect password');
            return;
        }
        
        try {
            this.showProcessing('Applying override...');
            
            const apiBaseUrl = window.SNAPMAGIC_CONFIG.API_URL;
            const response = await fetch(`${apiBaseUrl}api/transform-card`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentUser.token}`,
                    'X-Device-ID': this.deviceId
                },
                body: JSON.stringify({
                    action: 'apply_override',
                    prompt: 'Override system reset',
                    override_code: 'snap'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Reset usage limits structure for display
                this.usageLimits = {
                    cards: { total: 5, used: 0 },
                    videos: { total: 3, used: 0 },
                    prints: { total: 1, used: 0 }
                };
                
                // Update display immediately
                this.displayUsageLimits();
                
                // Store override info (simplified)
                this.overrideNumber = data.override_number;
                this.clientIP = data.client_ip;
                
                // Reset gallery for new session
                this.userGallery = {
                    cards: [],
                    currentIndex: 0,
                    totalCards: 0
                };
                this.hideGalleryNavigation();
                this.hideVideoGalleryNavigation();
                this.generatedCardData = null;
                
                // Clear result container
                this.elements.resultContainer.innerHTML = `
                    <p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Your generated trading card will appear here</p>
                `;
                this.elements.resultActions.classList.add('hidden');
                
                alert(`✅ Override #${data.override_number} Applied!\n\nYour limits have been reset:\n• Cards: 5\n• Videos: 3\n• Prints: 1\n\nYou can now generate new content.`);
                console.log(`✅ Override #${data.override_number} applied successfully`);
                console.log(`📝 Client IP: ${data.client_ip}`);
                console.log(`🔄 Gallery reset for new session`);
            } else {
                alert('❌ Override failed: ' + (data.error || 'Unknown error'));
            }
            
        } catch (error) {
            console.error('❌ Override error:', error);
            alert('❌ Override failed: Connection error');
        } finally {
            this.hideProcessing();
        }
    }

    handleSignOut() {
        console.log('👋 User signing out');
        this.isAuthenticated = false;
        this.authToken = null;
        this.currentUser = null;
        this.generatedCardData = null;
        
        // Reset gallery
        this.userGallery = {
            cards: [],
            currentIndex: 0,
            totalCards: 0
        };
        this.hideGalleryNavigation();
        
        // Reset UI
        this.switchTab('instructions');
        this.clearResults();
        this.showLogin();
    }

    // Usage Limits Management
    updateUsageLimits(remaining) {
        if (remaining) {
            // Backend sends remaining counts directly, so use them directly
            console.log('📊 Updating usage limits with:', remaining);
            
            // Update internal tracking (for compatibility)
            this.usageLimits.cards.total = 5; // From secrets.json
            this.usageLimits.videos.total = 3; // From secrets.json
            this.usageLimits.prints.total = 1; // From secrets.json
            this.usageLimits.cards.used = this.usageLimits.cards.total - remaining.cards;
            this.usageLimits.videos.used = this.usageLimits.videos.total - remaining.videos;
            this.usageLimits.prints.used = this.usageLimits.prints.total - remaining.prints;
            
            // Display the limits immediately
            this.displayUsageLimits();
        }
    }

    displayUsageLimits() {
        if (this.elements.cardUsage && this.elements.videoUsage && this.elements.printUsage) {
            // Use the remaining counts directly from backend
            const cardRemaining = this.usageLimits.cards.total - this.usageLimits.cards.used;
            const videoRemaining = this.usageLimits.videos.total - this.usageLimits.videos.used;
            const printRemaining = this.usageLimits.prints.total - this.usageLimits.prints.used;
            
            console.log('🎯 Displaying usage limits:', { cardRemaining, videoRemaining, printRemaining });
            
            // Update card usage display
            this.elements.cardUsage.innerHTML = `<span class="usage-count ${this.getUsageClass(cardRemaining, this.usageLimits.cards.total)}">${cardRemaining} of ${this.usageLimits.cards.total} remaining</span>`;
            
            // Update video usage display  
            this.elements.videoUsage.innerHTML = `<span class="usage-count ${this.getUsageClass(videoRemaining, this.usageLimits.videos.total)}">${videoRemaining} of ${this.usageLimits.videos.total} remaining</span>`;
            
            // Update print usage display
            this.elements.printUsage.innerHTML = `<span class="usage-count ${this.getUsageClass(printRemaining, this.usageLimits.prints.total)}">${printRemaining} of ${this.usageLimits.prints.total} remaining</span>`;
            
            // Update button states
            this.updateButtonStates(cardRemaining, videoRemaining, printRemaining);
            
            console.log('✅ Usage limits displayed successfully');
        } else {
            console.error('❌ Usage limit elements not found:', {
                cardUsage: !!this.elements.cardUsage,
                videoUsage: !!this.elements.videoUsage,
                printUsage: !!this.elements.printUsage
            });
        }
    }

    getUsageClass(remaining, total) {
        const percentage = remaining / total;
        if (remaining === 0) return 'danger';
        if (percentage <= 0.3) return 'warning';
        return 'success';
    }

    updateButtonStates(cardRemaining, videoRemaining, printRemaining) {
        // Update generate card button
        if (this.elements.generateBtn) {
            if (cardRemaining <= 0) {
                this.elements.generateBtn.disabled = true;
                this.elements.generateBtn.innerHTML = '🚫 Card Limit Reached';
            } else {
                this.elements.generateBtn.disabled = false;
                this.elements.generateBtn.innerHTML = '🎨 Generate Trading Card';
            }
        }
        
        // Update create video button
        if (this.elements.createVideoBtn) {
            if (videoRemaining <= 0) {
                this.elements.createVideoBtn.disabled = true;
                this.elements.createVideoBtn.innerHTML = '🚫 Video Limit Reached';
            } else {
                this.elements.createVideoBtn.disabled = false;
                this.elements.createVideoBtn.innerHTML = '🎬 Create Video';
            }
        }
        
        // Update print button
        if (this.elements.printBtn) {
            if (printRemaining <= 0) {
                this.elements.printBtn.disabled = true;
                this.elements.printBtn.innerHTML = '🚫 Print Used';
            } else {
                this.elements.printBtn.disabled = false;
                this.elements.printBtn.innerHTML = '🖨️ Save for Print';
            }
        }
    }

    initializeUsageLimits() {
        // Set initial display
        this.elements.cardUsage.innerHTML = `<span class="usage-count success">${this.usageLimits.cards.total} of ${this.usageLimits.cards.total} remaining</span>`;
        this.elements.videoUsage.innerHTML = `<span class="usage-count success">${this.usageLimits.videos.total} of ${this.usageLimits.videos.total} remaining</span>`;
        this.elements.printUsage.innerHTML = `<span class="usage-count success">${this.usageLimits.prints.total} of ${this.usageLimits.prints.total} remaining</span>`;
    }

    // Print Card Handler
    async handlePrintCard() {
        if (!this.generatedCardData) {
            this.showError('No card available to print. Please generate a card first.');
            return;
        }

        try {
            console.log('🖨️ Print queue request initiated');
            console.log('🔍 Card data type:', typeof this.generatedCardData);
            console.log('🔍 Card data keys:', Object.keys(this.generatedCardData));
            
            // Check if print limit is reached
            const printRemaining = this.usageLimits.prints.total - this.usageLimits.prints.used;
            if (printRemaining <= 0) {
                this.elements.limitReachedModal.classList.remove('hidden');
                return;
            }
            
            this.showProcessing('Adding card to print queue...');
            
            // Ensure we have the card data in the right format (works for both new and gallery cards)
            const cardData = await this.ensureCardDataForActions();
            
            console.log('✅ Card image data prepared, length:', cardData.result.length);
            
            const apiBaseUrl = window.SNAPMAGIC_CONFIG.API_URL;
            const endpoint = `${apiBaseUrl}api/print-card`;
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentUser.token}`,
                    'X-Device-ID': this.deviceId
                },
                body: JSON.stringify({
                    action: 'print_card',
                    card_prompt: this.lastUsedPrompt || 'Generated card',
                    card_image: cardData.result
                })
            });

            const data = await response.json();
            
            if (data.success) {
                console.log('✅ Card added to print queue successfully');
                
                // Update usage limits after print is queued
                if (data.remaining) {
                    this.updateUsageLimits(data.remaining);
                }
                
                this.hideProcessing();
                
                // Show success message with print number using existing modal system
                console.log('✅ Card added to print successfully');
                // Handle both old and new field names during deployment transition
                const printNumber = data.global_print_number || data.print_number;
                this.showPrintSuccessModal(printNumber);
                
            } else {
                console.error('❌ Print queue request failed:', data.error);
                this.hideProcessing();
                
                if (response.status === 429) {
                    this.elements.limitReachedModal.classList.remove('hidden');
                } else {
                    this.showError(`Print queue failed: ${data.error}`);
                }
            }
            
        } catch (error) {
            console.error('❌ Print queue error:', error);
            this.hideProcessing();
            this.showError(`Print queue failed: ${error.message}`);
        }
    }
    
    // Show Print Success Modal (using existing modal system)
    showPrintSuccessModal(printNumber) {
        console.log('🔍 showPrintSuccessModal called with:', printNumber);
        
        // Set the print number in the modal
        const printNumberElement = document.getElementById('printNumber');
        if (printNumberElement) {
            printNumberElement.textContent = `#${printNumber}`;
            console.log('✅ Set print number element to:', `#${printNumber}`);
        } else {
            console.error('❌ printNumber element not found');
        }
        
        // Show the modal by removing hidden class
        const modal = document.getElementById('printSuccessModal');
        if (modal) {
            modal.classList.remove('hidden');
            console.log('✅ Modal shown');
        } else {
            console.error('❌ printSuccessModal not found');
        }
        
        // Set up close button event listener
        const closeBtn = document.getElementById('printSuccessOkBtn');
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.classList.add('hidden');
            };
        }
        
        // Close modal when clicking outside
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        };
    }

    // ========================================
    // PROMPT FLOW FUNCTIONS
    // ========================================

    async handleGeneratePrompt() {
        const generateBtn = document.getElementById('generatePromptBtn');
        const promptInput = this.elements.promptInput;
        
        try {
            // Show loading state
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            
            console.log('🎨 Generating creative prompt...');
            
            const apiBaseUrl = window.SNAPMAGIC_CONFIG.API_URL;
            const response = await fetch(`${apiBaseUrl}api/transform-card`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`,
                    'X-Device-ID': this.deviceId
                },
                body: JSON.stringify({
                    action: 'generate_prompt'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Fill the prompt input with generated prompt
                promptInput.value = data.prompt;
                
                // Show success feedback
                this.showNotification('✨ Creative prompt generated!', 'success');
                
                // Optional: Show what seed was used (for debugging)
                if (data.seed_used) {
                    console.log('🎯 Seed concept used:', data.seed_used);
                }
                
                // Show fallback indicator if needed
                if (data.fallback) {
                    this.showNotification('⚠️ Using fallback prompt generation', 'warning');
                }
            } else {
                throw new Error(data.error || 'Failed to generate prompt');
            }
            
        } catch (error) {
            console.error('❌ Generate prompt error:', error);
            this.showNotification('Failed to generate prompt. Please try again.', 'error');
        } finally {
            // Reset button state
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Prompt';
        }
    }

    async handleOptimizePrompt() {
        const optimizeBtn = document.getElementById('optimizePromptBtn');
        const promptInput = this.elements.promptInput;
        const userPrompt = promptInput.value.trim();
        
        if (!userPrompt) {
            this.showNotification('Please enter a prompt to optimize first', 'warning');
            return;
        }
        
        try {
            // Show loading state
            optimizeBtn.disabled = true;
            optimizeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Optimizing...';
            
            console.log('🔧 Optimizing prompt:', userPrompt);
            
            const apiBaseUrl = window.SNAPMAGIC_CONFIG.API_URL;
            const response = await fetch(`${apiBaseUrl}api/transform-card`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`,
                    'X-Device-ID': this.deviceId
                },
                body: JSON.stringify({
                    action: 'optimize_prompt',
                    user_prompt: userPrompt
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Replace the prompt input with optimized version
                promptInput.value = data.prompt;
                
                // Show success feedback
                this.showNotification('✨ Prompt optimized and enhanced!', 'success');
                
                // Show fallback indicator if needed
                if (data.fallback) {
                    this.showNotification('⚠️ Using fallback prompt optimization', 'warning');
                }
            } else {
                throw new Error(data.error || 'Failed to optimize prompt');
            }
            
        } catch (error) {
            console.error('❌ Optimize prompt error:', error);
            this.showNotification('Failed to optimize prompt. Please try again.', 'error');
        } finally {
            // Reset button state
            optimizeBtn.disabled = false;
            optimizeBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Optimize Prompt';
        }
    }

    // ========================================
    // CARD GENERATION
    // ========================================

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

        // Store the prompt and show name input modal
        this.pendingPrompt = userPrompt;
        this.showNameInputModal();
    }

    async displayGeneratedCard(data, userName = '') {
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
            
            // Set the user name in template config
            this.templateSystem.templateConfig.userName = userName;
            console.log('👤 Template userName set to:', userName || 'No name (AWS logo)');
            
            // Get selected template from template selector
            const selectedTemplate = window.snapMagicTemplateSelector ? 
                window.snapMagicTemplateSelector.getCurrentTemplate() : 'cardtemplate';
            
            console.log(`🎴 Compositing trading card with template: ${selectedTemplate}`);
            
            // Create final trading card with selected template
            const finalCardBase64 = this.templateSystem.createTradingCardWithTemplate ? 
                await this.templateSystem.createTradingCardWithTemplate(novaImageBase64, userPrompt, selectedTemplate) :
                await this.templateSystem.createTradingCard(novaImageBase64, userPrompt);
            const finalImageSrc = `data:image/png;base64,${finalCardBase64}`;
            
            // Store both Nova image and final card
            this.generatedCardData = {
                ...data,
                novaImageBase64: novaImageBase64,
                finalCardBase64: finalCardBase64,
                finalImageSrc: finalImageSrc
            };
            
            // Add to user's gallery
            this.addCardToGallery(this.generatedCardData);
            
            // Store the final composited card in S3 (what user actually downloads)
            await this.storeFinalCardInS3(finalCardBase64, userPrompt, userName);
            
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
            
            // Store the raw Nova Canvas image as fallback
            try {
                await this.storeFinalCardInS3(novaImageBase64, userPrompt, userName);
            } catch (storageError) {
                console.warn('⚠️ Failed to store fallback card in S3:', storageError);
            }
        }
    }

    async handleDownloadCard() {
        if (!this.generatedCardData) return;
        
        try {
            // Ensure we have the card data in the right format (works for both new and gallery cards)
            const cardData = await this.ensureCardDataForActions();
            
            // Use base64 data for direct download (not presigned URL)
            const imageSrc = `data:image/png;base64,${cardData.result}`;
            
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
        } catch (error) {
            console.error('❌ Download failed:', error);
            this.showError('Download failed. Please try again.');
        }
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
            
            // Ensure we have the card data in the right format (works for both new and gallery cards)
            const cardData = await this.ensureCardDataForActions();
            
            // For video generation, prefer raw Nova image over final composed card
            let imageForVideo;
            if (cardData.novaImageBase64) {
                // Use raw Nova Canvas image for better video quality (newly generated cards)
                imageForVideo = cardData.novaImageBase64;
                console.log('🎬 Using raw Nova Canvas image for video generation');
            } else {
                // Use final card image for gallery cards (only option available)
                imageForVideo = cardData.result;
                console.log('🎬 Using final card image for video generation');
            }
            
            // Convert card image to letterboxed JPEG format for video generation
            const letterboxedImage = await this.letterboxCardForVideo(imageForVideo);
            
            const requestBody = {
                action: 'generate_video',
                card_image: letterboxedImage,  // Send JPEG letterboxed 1280x720 image (no transparency)
                animation_prompt: animationPrompt
            };
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentUser.token}`,
                    'X-Device-ID': this.deviceId
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            
            if (data.success && data.metadata?.invocation_arn) {
                console.log('✅ Video generation initiated');
                
                // Don't update usage limits here - wait until video completes and is stored in S3
                // The actual usage count changes when the video is completed and stored with session filename
                
                const invocationArn = data.metadata.invocation_arn;
                console.log('🔍 Using full invocation ARN:', invocationArn);
                this.startVideoPolling(invocationArn, data.metadata);
            } else {
                console.error('❌ Video generation failed:', data.error);
                this.hideProcessing();
                
                // Check for limit reached error
                if (response.status === 429) {
                    this.elements.limitReachedModal.classList.remove('hidden');
                } else {
                    this.showError(data.error || 'Video generation failed. Please try again.');
                }
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
     * Start polling for video completion with progress bar
     * Wait 30 seconds initially, then poll every 15 seconds (max 15 times)
     */
    startVideoPolling(invocationArn, metadata) {
        console.log('⏰ Starting video polling with progress bar...');
        
        // Initialize progress tracking
        this.videoProgress = {
            startTime: Date.now(),
            currentProgress: 0,
            invocationArn: invocationArn,
            metadata: metadata
        };
        
        // Start progress bar animation
        this.startVideoProgressBar();
        
        // Wait 30 seconds before first check
        setTimeout(() => {
            console.log('⏰ 30 seconds elapsed - starting polling every 15 seconds');
            
            // Start polling every 15 seconds with retry counter
            this.pollVideoStatus(invocationArn, metadata, 0);
        }, 30 * 1000); // 30 seconds in milliseconds
    }

    /**
     * Start video progress bar animation
     */
    startVideoProgressBar() {
        // Update processing overlay to show progress bar
        this.showVideoProgress(0, 'Initializing video generation...');
        
        // Start progress animation
        this.updateVideoProgressBar();
    }

    /**
     * Update video progress bar based on elapsed time
     */
    updateVideoProgressBar() {
        if (!this.videoProgress) return;
        
        const elapsed = Date.now() - this.videoProgress.startTime;
        const elapsedSeconds = Math.floor(elapsed / 1000);
        
        let progress = 0;
        let message = '';
        
        // Progress calculation based on time elapsed
        if (elapsedSeconds <= 30) {
            // 0-30 seconds: 0% → 30%
            progress = (elapsedSeconds / 30) * 30;
            message = 'Starting video generation...';
        } else if (elapsedSeconds <= 90) {
            // 30-90 seconds: 30% → 80%
            progress = 30 + ((elapsedSeconds - 30) / 60) * 50;
            message = 'Processing your animation...';
        } else if (elapsedSeconds <= 150) {
            // 90-150 seconds: 80% → 95%
            progress = 80 + ((elapsedSeconds - 90) / 60) * 15;
            message = 'Finalizing video...';
        } else {
            // 150+ seconds: Stay at 95%
            progress = 95;
            message = 'Almost ready...';
        }
        
        // Update progress display
        this.showVideoProgress(Math.min(progress, 95), message);
        
        // Continue updating if video generation is still in progress
        if (this.videoGenerationInProgress && progress < 95) {
            setTimeout(() => this.updateVideoProgressBar(), 1000); // Update every second
        }
    }

    /**
     * Show video progress with percentage and message
     */
    showVideoProgress(percentage, message) {
        const processingText = document.querySelector('.processing-text');
        const processingSubtext = document.querySelector('.processing-subtext');
        
        if (processingText) {
            processingText.innerHTML = `
                <div style="margin-bottom: 1rem;">${message}</div>
                <div style="background: rgba(255,255,255,0.2); border-radius: 10px; height: 20px; overflow: hidden; margin-bottom: 0.5rem;">
                    <div style="background: linear-gradient(90deg, #667eea, #764ba2); height: 100%; width: ${percentage}%; transition: width 0.5s ease;"></div>
                </div>
                <div style="font-size: 0.9rem; opacity: 0.8;">${Math.round(percentage)}% Complete</div>
            `;
        }
        
        if (processingSubtext) {
            processingSubtext.textContent = `Estimated time: ${this.getEstimatedTimeRemaining(percentage)}`;
        }
    }

    /**
     * Get estimated time remaining based on progress
     */
    getEstimatedTimeRemaining(percentage) {
        if (percentage < 30) return '60-90 seconds';
        if (percentage < 80) return '30-60 seconds';
        if (percentage < 95) return '10-30 seconds';
        return 'Almost done!';
    }

    /**
     * Poll video status every 15 seconds until ready (max 15 retries)
     */
    async pollVideoStatus(invocationArn, metadata, retryCount = 0) {
        const MAX_RETRIES = 15;
        
        // Check if we've exceeded max retries
        if (retryCount >= MAX_RETRIES) {
            console.error(`❌ Max retries (${MAX_RETRIES}) exceeded for video polling`);
            this.videoGenerationInProgress = false;
            this.videoProgress = null; // Clean up progress tracking
            this.hideProcessing();
            this.showError(`Video generation timed out. Please try again.`);
            return;
        }
        
        try {
            console.log(`🔍 Polling video status for: ${invocationArn} (attempt ${retryCount + 1}/${MAX_RETRIES})`);
            
            const apiBaseUrl = window.SNAPMAGIC_CONFIG.API_URL;
            const endpoint = `${apiBaseUrl}api/transform-card`;
            
            const requestBody = {
                action: 'get_video_status',
                invocation_arn: invocationArn,  // This is actually the full ARN, not just ID
                animation_prompt: metadata.animation_prompt || ''  // Include prompt for session storage
            };

            console.log('📤 Sending video status request:', requestBody);
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentUser.token}`,
                    'X-Device-ID': this.deviceId
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
                
                // Complete progress bar
                this.showVideoProgress(100, 'Video ready!');
                
                // Update usage limits after video completion (same as cards)
                if (result.remaining) {
                    console.log('📊 Updating usage limits after video completion:', result.remaining);
                    this.updateUsageLimits(result.remaining);
                } else {
                    // Fallback: refresh usage limits if not provided in response
                    console.log('🔄 Refreshing usage limits after video completion...');
                    await this.refreshUsageLimits();
                }
                
                // Clean up progress tracking
                this.videoProgress = null;
                
                this.hideProcessing();
                this.displayGeneratedVideo(result.video_url);
                this.videoGenerationInProgress = false;
            } else if (result.success && (result.status === 'IN_PROGRESS' || result.status === 'PROCESSING')) {
                console.log(`⏳ Video still processing, will check again in 10 seconds (attempt ${retryCount + 1}/${MAX_RETRIES})`);
                this.updateVideoProcessingStatus(`Video processing... Attempt ${retryCount + 1}/${MAX_RETRIES}. ${result.message || 'Checking again in 10 seconds'}`);
                
                // Poll again in 10 seconds with incremented retry count
                setTimeout(() => {
                    this.pollVideoStatus(invocationArn, metadata, retryCount + 1);
                }, 15 * 1000); // 15 seconds
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
            
            // Continue polling on error (might be temporary) - don't show user error message
            console.log(`⚠️ Polling error, retrying in 15 seconds... (attempt ${nextRetryCount}/${MAX_RETRIES})`);
            
            setTimeout(() => {
                this.pollVideoStatus(invocationArn, metadata, nextRetryCount);
            }, 15 * 1000); // 15 seconds
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

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 3000;
            max-width: 400px;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        `;
        
        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.background = 'linear-gradient(45deg, #38a169, #2f855a)';
                notification.innerHTML = `✅ ${message}`;
                break;
            case 'warning':
                notification.style.background = 'linear-gradient(45deg, #d69e2e, #b7791f)';
                notification.innerHTML = `⚠️ ${message}`;
                break;
            case 'error':
                notification.style.background = 'linear-gradient(45deg, #e53e3e, #c53030)';
                notification.innerHTML = `❌ ${message}`;
                break;
            default:
                notification.style.background = 'linear-gradient(45deg, #3182ce, #2c5aa0)';
                notification.innerHTML = `ℹ️ ${message}`;
        }
        
        document.body.appendChild(notification);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 4000);
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

    showSuccess(message) {
        // Create modern success notification
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #38a169, #2f855a);
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
        
        successDiv.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 0.8rem;">
                <span style="font-size: 1.2rem; margin-top: 0.1rem;">🎉</span>
                <div style="flex: 1;">
                    ${formattedMessage}
                </div>
            </div>
        `;
        
        document.body.appendChild(successDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (successDiv.parentNode) {
                        document.body.removeChild(successDiv);
                    }
                }, 300);
            }
        }, 5000);
    }
    
    // Name Input Modal Functions
    showNameInputModal() {
        this.elements.nameInput.value = '';
        this.elements.nameInputModal.classList.remove('hidden');
        this.elements.nameInput.focus();
    }
    
    hideNameInputModal() {
        this.elements.nameInputModal.classList.add('hidden');
    }
    
    showNameConfirmModal(name) {
        this.elements.namePreview.textContent = name ? name.toUpperCase() : 'AWS Logo (no name entered)';
        this.elements.nameConfirmModal.classList.remove('hidden');
    }
    
    hideNameConfirmModal() {
        this.elements.nameConfirmModal.classList.add('hidden');
    }
    
    handleNameConfirm() {
        const enteredName = this.elements.nameInput.value.trim();
        this.pendingName = enteredName;
        this.hideNameInputModal();
        this.showNameConfirmModal(enteredName);
    }
    
    handleNameCancel() {
        this.hideNameInputModal();
        this.pendingPrompt = null;
    }
    
    handleNameYes() {
        this.hideNameConfirmModal();
        // Proceed with card generation using stored prompt and name
        this.generateCardWithName(this.pendingPrompt, this.pendingName);
    }
    
    handleNameEdit() {
        this.hideNameConfirmModal();
        this.elements.nameInput.value = this.pendingName;
        this.elements.nameInputModal.classList.remove('hidden');
        this.elements.nameInput.focus();
    }
    
    async generateCardWithName(userPrompt, userName) {
        try {
            this.showProcessing('Creating your magical trading card...');
            this.elements.generateBtn.disabled = true;
            
            const apiBaseUrl = window.SNAPMAGIC_CONFIG.API_URL;
            const endpoint = `${apiBaseUrl}api/transform-card`;
            
            console.log('🎯 API call to:', endpoint);
            console.log('👤 User name:', userName || 'No name (AWS logo)');
            
            const requestBody = {
                action: 'transform_card',
                prompt: userPrompt,
                user_name: userName || '' // Send empty string if no name
            };
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentUser.token}`,
                    'X-Device-ID': this.deviceId
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            
            if (data.success) {
                console.log('✅ Card generation successful');
                this.generatedCardData = data;
                
                // Don't update usage limits here - wait until after S3 storage
                // The actual usage count changes when the card is stored in S3
                
                this.displayGeneratedCard(data, userName);
                this.hideProcessing();
            } else {
                console.error('❌ Card generation failed:', data.error);
                this.hideProcessing();
                
                // Check for limit reached error
                if (response.status === 429) {
                    this.elements.limitReachedModal.classList.remove('hidden');
                } else if (data.error && data.error.includes('content filters')) {
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
    
    /**
     * Store the final composited card in S3 cards/ folder
     */
    async storeFinalCardInS3(finalCardBase64, userPrompt, userName) {
        try {
            console.log('💾 Storing final card in S3 cards/ folder...');
            
            const apiBaseUrl = window.SNAPMAGIC_CONFIG.API_URL;
            const endpoint = `${apiBaseUrl}api/store-card`;
            
            const requestBody = {
                action: 'store_final_card',
                final_card_base64: finalCardBase64,
                prompt: userPrompt,
                user_name: userName || ''
            };
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentUser.token}`,
                    'X-Device-ID': this.deviceId
                },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Final card stored in S3:', result.s3_key);
                
                // Now update usage limits after successful storage
                // This is when the actual usage count changes
                await this.refreshUsageLimits();
                
            } else {
                console.warn('⚠️ Failed to store card in S3:', result.error);
            }
        } catch (error) {
            console.warn('⚠️ Error storing card in S3:', error);
            // Don't throw - this is not critical for user experience
        }
    }
    
    /**
     * Refresh usage limits by making a new login call to get updated counts
     */
    async refreshUsageLimits() {
        try {
            console.log('🔄 Refreshing usage limits after card storage...');
            
            const apiBaseUrl = window.SNAPMAGIC_CONFIG.API_URL;
            const endpoint = `${apiBaseUrl}api/login`;
            
            // Make a fresh login call to get updated usage limits
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Device-ID': this.deviceId
                },
                body: JSON.stringify({
                    username: 'demo', // Use the current credentials
                    password: 'demo'
                })
            });

            const data = await response.json();
            
            if (data.success && data.remaining) {
                console.log('📊 Updated usage limits:', data.remaining);
                this.updateUsageLimits(data.remaining);
            } else {
                console.warn('⚠️ Failed to refresh usage limits');
            }
        } catch (error) {
            console.warn('⚠️ Error refreshing usage limits:', error);
        }
    }

    // Competition Feature Handlers
    handleEnterCompetition() {
        console.log('🏆 Opening competition entry modal');
        if (!this.generatedCardData) {
            this.showError('Please generate a card first before entering the competition!');
            return;
        }
        
        this.elements.competitionModal.classList.remove('hidden');
        this.elements.phoneInput.focus();
    }

    handleCompetitionCancel() {
        console.log('❌ Competition entry cancelled');
        this.elements.competitionModal.classList.add('hidden');
        this.elements.phoneInput.value = '';
    }

    async handleCompetitionSubmit() {
        const phoneNumber = this.elements.phoneInput.value.trim();
        
        if (!phoneNumber) {
            this.showError('Please enter your phone number');
            return;
        }

        if (!this.generatedCardData) {
            this.showError('No card data available for competition entry');
            return;
        }

        try {
            console.log('🏆 Submitting competition entry...');
            this.showProcessing('Submitting competition entry...');

            // Ensure we have the card data in the right format (works for both new and gallery cards)
            const cardData = await this.ensureCardDataForActions();

            const response = await fetch(`${window.SNAPMAGIC_CONFIG.API_URL}api/transform-card`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentUser.token}`,
                    'X-Device-ID': this.deviceId
                },
                body: JSON.stringify({
                    action: 'enter_competition',
                    phone_number: phoneNumber,
                    card_data: { result: cardData.result }  // Send as object with result field
                })
            });

            const data = await response.json();
            this.hideProcessing();

            if (data.success) {
                console.log('✅ Competition entry submitted successfully');
                this.elements.competitionModal.classList.add('hidden');
                this.elements.phoneInput.value = '';
                
                // Show green success message
                this.showSuccess(data.message || 'Entry submitted successfully! Good luck in the competition!');
                
                // Show simplified success details
                this.elements.competitionDetails.innerHTML = `
                    <p><strong>Status:</strong> Successfully submitted!</p>
                `;
                this.elements.competitionSuccessModal.classList.remove('hidden');
            } else {
                // Handle duplicate phone number error specifically
                if (response.status === 409) {
                    // Close the competition entry modal first
                    this.elements.competitionModal.classList.add('hidden');
                    this.elements.phoneInput.value = '';
                    
                    // Show error modal instead of slide message
                    this.elements.competitionErrorModal.classList.remove('hidden');
                } else {
                    this.showError(data.error || 'Failed to submit competition entry');
                }
            }
        } catch (error) {
            console.error('❌ Competition submission error:', error);
            this.hideProcessing();
            this.showError('Failed to submit competition entry. Please try again.');
        }
    }

    handleCompetitionSuccessOk() {
        console.log('✅ Competition success acknowledged');
        this.elements.competitionSuccessModal.classList.add('hidden');
    }

    handleCompetitionErrorOk() {
        console.log('⚠️ Competition error acknowledged - user will visit staff');
        this.elements.competitionErrorModal.classList.add('hidden');
    }

    handleLimitReachedOk() {
        console.log('🚫 Limit reached acknowledged - user will visit staff');
        this.elements.limitReachedModal.classList.add('hidden');
    }

    /**
     * Setup gallery navigation event listeners
     */
    setupGalleryNavigation() {
        // Gallery navigation buttons
        const prevBtn = document.getElementById('galleryPrevBtn');
        const nextBtn = document.getElementById('galleryNextBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigateGallery(-1));
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigateGallery(1));
        }
        
        // Add swipe support for mobile gallery navigation
        this.setupGallerySwipeSupport();
    }
    
    /**
     * Setup swipe support for gallery navigation
     */
    setupGallerySwipeSupport() {
        const cardDisplay = document.querySelector('.card-display');
        if (!cardDisplay) return;
        
        let startX = 0;
        let startY = 0;
        let isSwipeActive = false;
        
        // Touch start
        cardDisplay.addEventListener('touchstart', (e) => {
            if (this.userGallery.totalCards <= 1) return;
            
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isSwipeActive = true;
            cardDisplay.classList.add('swiping');
        }, { passive: true });
        
        // Touch end
        cardDisplay.addEventListener('touchend', (e) => {
            if (!isSwipeActive || this.userGallery.totalCards <= 1) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            // Check if it's a horizontal swipe (not vertical scroll)
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    // Swipe right - go to previous card
                    this.navigateGallery(-1);
                } else {
                    // Swipe left - go to next card
                    this.navigateGallery(1);
                }
            }
            
            isSwipeActive = false;
            cardDisplay.classList.remove('swiping');
        }, { passive: true });
        
        // Prevent default touch behavior during swipe
        cardDisplay.addEventListener('touchmove', (e) => {
            if (isSwipeActive && this.userGallery.totalCards > 1) {
                const deltaX = e.touches[0].clientX - startX;
                const deltaY = e.touches[0].clientY - startY;
                
                // If horizontal swipe is dominant, prevent vertical scroll
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    e.preventDefault();
                }
            }
        }, { passive: false });
    }

    /**
     * Navigate gallery (previous/next)
     */
    navigateGallery(direction) {
        if (this.userGallery.totalCards <= 1) return;
        
        const newIndex = this.userGallery.currentIndex + direction;
        
        // Check bounds
        if (newIndex >= 0 && newIndex < this.userGallery.totalCards) {
            this.showCardFromGallery(newIndex);
        }
    }

    /**
     * Show specific card from gallery
     */
    showCardFromGallery(cardIndex) {
        if (cardIndex < 0 || cardIndex >= this.userGallery.totalCards) return;
        
        console.log(`🖼️ Showing card ${cardIndex + 1} of ${this.userGallery.totalCards}`);
        
        // Update current index
        this.userGallery.currentIndex = cardIndex;
        
        // Load the selected card data
        this.generatedCardData = this.userGallery.cards[cardIndex];
        
        // Update the display (same as current system)
        const finalImageSrc = this.generatedCardData.finalImageSrc || 
                              this.generatedCardData.imageSrc || 
                              `data:image/png;base64,${this.generatedCardData.result}`;
        
        this.elements.resultContainer.innerHTML = `
            <img src="${finalImageSrc}" alt="Generated Trading Card" class="result-image">
        `;
        
        // Show action buttons for gallery cards (same as newly generated cards)
        this.elements.resultActions.classList.remove('hidden');
        
        // Update gallery navigation display
        this.updateGalleryDisplay();
        
        console.log('✅ Card switched - all buttons now act on this displayed card');
    }

    /**
     * Jump directly to specific card number
     */
    jumpToCard(cardNumber) {
        const cardIndex = cardNumber - 1; // Convert to 0-based index
        this.showCardFromGallery(cardIndex);
    }

    /**
     * Convert image URL to base64 (for gallery cards that only have URLs)
     */
    async convertImageUrlToBase64(imageUrl) {
        try {
            console.log('🔄 Converting image URL to base64 for processing...');
            
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    // Remove the data:image/png;base64, prefix to get just the base64 data
                    const base64 = reader.result.split(',')[1];
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('❌ Failed to convert image URL to base64:', error);
            throw error;
        }
    }

    /**
     * Ensure gallery card has the data needed for button functions
     */
    async ensureCardDataForActions() {
        if (!this.generatedCardData) {
            throw new Error('No card data available');
        }

        console.log('🔍 Card data keys:', Object.keys(this.generatedCardData));
        console.log('🔍 Has finalImageSrc:', !!this.generatedCardData.finalImageSrc);
        console.log('🔍 Has result field:', !!this.generatedCardData.result);
        console.log('🔍 Result field length:', this.generatedCardData.result ? this.generatedCardData.result.length : 'N/A');

        // Priority 1: Use finalImageSrc (styled card) if available - same logic as display functions
        if (this.generatedCardData.finalImageSrc || this.generatedCardData.imageSrc) {
            console.log('✅ Using finalImageSrc (styled card) - same as working gallery method');
            
            const imageUrl = this.generatedCardData.finalImageSrc || this.generatedCardData.imageSrc;
            const base64Data = await this.convertImageUrlToBase64(imageUrl);
            
            // Create a complete card data object with base64
            return {
                ...this.generatedCardData,
                result: base64Data,
                finalImageBase64: base64Data
            };
        }

        // Priority 2: Fallback to raw result if no styled version available
        if (this.generatedCardData.result && this.generatedCardData.result.length > 100) {
            console.log('⚠️ Fallback: Using raw result (no styled version available)');
            return this.generatedCardData;
        }

        throw new Error('Card data missing required image information');
    }

    /**
     * Load existing cards from S3 for current session
     */
    async loadExistingCards() {
        try {
            console.log('📚 Loading existing cards from session...');
            
            const apiBaseUrl = window.SNAPMAGIC_CONFIG.API_URL;
            const response = await fetch(`${apiBaseUrl}api/transform-card`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`,
                    'X-Device-ID': this.deviceId
                },
                body: JSON.stringify({ action: 'load_session_cards' })
            });

            const data = await response.json();
            
            if (data.success && data.cards && data.cards.length > 0) {
                console.log(`✅ Found ${data.cards.length} existing cards`);
                
                // Load cards into gallery (newest first, so reverse to show oldest first in gallery)
                this.userGallery.cards = data.cards.reverse();
                this.userGallery.totalCards = data.cards.length;
                this.userGallery.currentIndex = this.userGallery.totalCards - 1; // Show newest card
                
                // Show the most recent card
                if (this.userGallery.totalCards > 0) {
                    this.generatedCardData = this.userGallery.cards[this.userGallery.currentIndex];
                    
                    // Update the display
                    const finalImageSrc = this.generatedCardData.finalImageSrc || this.generatedCardData.imageSrc;
                    this.elements.resultContainer.innerHTML = `
                        <img src="${finalImageSrc}" alt="Generated Trading Card" class="result-image">
                    `;
                    
                    // Show action buttons for loaded gallery cards
                    this.elements.resultActions.classList.remove('hidden');
                    
                    // Show gallery navigation
                    this.updateGalleryDisplay();
                    this.showGalleryNavigation();
                    
                    console.log(`🖼️ Displaying most recent card (${this.userGallery.currentIndex + 1} of ${this.userGallery.totalCards})`);
                }
            } else {
                console.log('📭 No existing cards found for this session');
            }
        } catch (error) {
            console.error('❌ Error loading existing cards:', error);
            // Don't show error to user - just continue without loading cards
        }
    }

    /**
     * Add new card to gallery
     */
    addCardToGallery(cardData) {
        // Add to gallery
        this.userGallery.cards.push(cardData);
        this.userGallery.totalCards = this.userGallery.cards.length;
        this.userGallery.currentIndex = this.userGallery.totalCards - 1; // Show newest card
        
        console.log(`📚 Gallery updated: ${this.userGallery.totalCards} cards total`);
        
        // Update gallery display
        this.updateGalleryDisplay();
        this.showGalleryNavigation();
    }

    /**
     * Update gallery navigation display
     */
    updateGalleryDisplay() {
        const galleryDots = document.getElementById('galleryDots');
        const prevBtn = document.getElementById('galleryPrevBtn');
        const nextBtn = document.getElementById('galleryNextBtn');
        
        if (!galleryDots) return;
        
        // Update dot indicators
        galleryDots.innerHTML = '';
        for (let i = 0; i < this.userGallery.totalCards; i++) {
            const dot = document.createElement('div');
            dot.className = `gallery-dot ${i === this.userGallery.currentIndex ? 'active' : ''}`;
            dot.addEventListener('click', () => this.jumpToCard(i + 1));
            galleryDots.appendChild(dot);
        }
        
        // Update prev/next button states
        if (prevBtn) {
            prevBtn.disabled = this.userGallery.currentIndex === 0;
        }
        if (nextBtn) {
            nextBtn.disabled = this.userGallery.currentIndex === this.userGallery.totalCards - 1;
        }
    }

    /**
     * Show gallery navigation (when user has multiple cards)
     */
    showGalleryNavigation() {
        const galleryNav = document.getElementById('galleryNavigation');
        if (galleryNav && this.userGallery.totalCards > 1) {
            galleryNav.classList.remove('hidden');
        }
    }

    /**
     * Hide gallery navigation
     */
    hideGalleryNavigation() {
        const galleryNav = document.getElementById('galleryNavigation');
        if (galleryNav) {
            galleryNav.classList.add('hidden');
        }
    }

    // ========================================
    // VIDEO GALLERY NAVIGATION FUNCTIONS
    // ========================================

    /**
     * Setup video gallery navigation event listeners
     */
    setupVideoGalleryNavigation() {
        // Video gallery navigation buttons
        const prevBtn = document.getElementById('videoGalleryPrevBtn');
        const nextBtn = document.getElementById('videoGalleryNextBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigateVideoGallery(-1));
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigateVideoGallery(1));
        }

        // AI prompt generation buttons
        const generateAnimationPromptBtn = document.getElementById('generateAnimationPromptBtn');
        const optimizeAnimationPromptBtn = document.getElementById('optimizeAnimationPromptBtn');
        
        if (generateAnimationPromptBtn) {
            generateAnimationPromptBtn.addEventListener('click', () => this.handleGenerateAnimationPrompt());
        }
        
        if (optimizeAnimationPromptBtn) {
            optimizeAnimationPromptBtn.addEventListener('click', () => this.handleOptimizeAnimationPrompt());
        }
    }

    /**
     * Navigate video gallery (previous/next)
     */
    navigateVideoGallery(direction) {
        if (this.userGallery.totalCards <= 1) return;
        
        const newIndex = this.userGallery.currentIndex + direction;
        
        // Check bounds
        if (newIndex >= 0 && newIndex < this.userGallery.totalCards) {
            this.showVideoCardFromGallery(newIndex);
        }
    }

    /**
     * Show specific card from video gallery
     */
    showVideoCardFromGallery(cardIndex) {
        if (cardIndex < 0 || cardIndex >= this.userGallery.totalCards) return;
        
        console.log(`🎬 Showing video card ${cardIndex + 1} of ${this.userGallery.totalCards}`);
        
        // Update current index
        this.userGallery.currentIndex = cardIndex;
        
        // Load the selected card data
        this.generatedCardData = this.userGallery.cards[cardIndex];
        
        // Update the video card display
        const videoSelectedCard = document.getElementById('videoSelectedCard');
        if (videoSelectedCard) {
            const finalImageSrc = this.generatedCardData.finalImageSrc || 
                                  this.generatedCardData.imageSrc || 
                                  `data:image/png;base64,${this.generatedCardData.result}`;
            
            videoSelectedCard.src = finalImageSrc;
            videoSelectedCard.alt = `Trading Card ${cardIndex + 1}`;
        }
        
        // Update video gallery navigation display
        this.updateVideoGalleryDisplay();
        
        console.log('✅ Video card switched - ready for animation');
    }

    /**
     * Jump directly to specific card number in video gallery
     */
    jumpToVideoCard(cardNumber) {
        const cardIndex = cardNumber - 1; // Convert to 0-based index
        this.showVideoCardFromGallery(cardIndex);
    }

    /**
     * Update video gallery navigation display
     */
    updateVideoGalleryDisplay() {
        const galleryInfo = document.getElementById('videoGalleryInfo');
        const galleryNumbers = document.getElementById('videoGalleryNumbers');
        const prevBtn = document.getElementById('videoGalleryPrevBtn');
        const nextBtn = document.getElementById('videoGalleryNextBtn');
        
        if (!galleryInfo || !galleryNumbers) return;
        
        // Update info text
        galleryInfo.textContent = `Card ${this.userGallery.currentIndex + 1} of ${this.userGallery.totalCards}`;
        
        // Update number buttons
        galleryNumbers.innerHTML = '';
        for (let i = 0; i < this.userGallery.totalCards; i++) {
            const btn = document.createElement('button');
            btn.className = `gallery-num ${i === this.userGallery.currentIndex ? 'active' : ''}`;
            btn.textContent = i + 1;
            btn.addEventListener('click', () => this.jumpToVideoCard(i + 1));
            galleryNumbers.appendChild(btn);
        }
        
        // Update prev/next button states
        if (prevBtn) {
            prevBtn.disabled = this.userGallery.currentIndex === 0;
        }
        if (nextBtn) {
            nextBtn.disabled = this.userGallery.currentIndex === this.userGallery.totalCards - 1;
        }
    }

    /**
     * Show video gallery navigation (when user has multiple cards)
     */
    showVideoGalleryNavigation() {
        const galleryNav = document.getElementById('videoGalleryNavigation');
        if (galleryNav && this.userGallery.totalCards > 1) {
            galleryNav.classList.remove('hidden');
        }
    }

    /**
     * Hide video gallery navigation
     */
    hideVideoGalleryNavigation() {
        const galleryNav = document.getElementById('videoGalleryNavigation');
        if (galleryNav) {
            galleryNav.classList.add('hidden');
        }
    }

    /**
     * Initialize video tab with gallery
     */
    initializeVideoGallery() {
        if (this.userGallery.totalCards > 0) {
            // Show the most recent card by default
            this.userGallery.currentIndex = this.userGallery.totalCards - 1;
            this.showVideoCardFromGallery(this.userGallery.currentIndex);
            this.showVideoGalleryNavigation();
            
            console.log(`🎬 Video gallery initialized with ${this.userGallery.totalCards} cards`);
        }
    }

    /**
     * Generate AI animation prompt based on selected card
     */
    async handleGenerateAnimationPrompt() {
        if (!this.generatedCardData) {
            this.showError('Please select a card first');
            return;
        }

        const generateBtn = document.getElementById('generateAnimationPromptBtn');
        const animationPrompt = document.getElementById('animationPrompt');
        
        try {
            // Show loading state
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing Card...';
            
            console.log('🎨 Generating animation prompt from card...');
            
            // Get card data for analysis
            const cardData = await this.ensureCardDataForActions();
            
            const apiBaseUrl = window.SNAPMAGIC_CONFIG.API_URL;
            const response = await fetch(`${apiBaseUrl}api/transform-card`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`,
                    'X-Device-ID': this.deviceId
                },
                body: JSON.stringify({
                    action: 'generate_animation_prompt',
                    card_image: cardData.result,
                    original_prompt: this.generatedCardData.prompt || 'Trading card character'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Fill the animation prompt input with generated prompt
                animationPrompt.value = data.animation_prompt;
                
                // Show success feedback
                this.showNotification('✨ Animation prompt generated from your card!', 'success');
                
                console.log('✅ Animation prompt generated:', data.animation_prompt);
                
            } else {
                console.error('❌ Animation prompt generation failed:', data.error);
                this.showError(data.error || 'Failed to generate animation prompt');
            }
            
        } catch (error) {
            console.error('❌ Animation prompt generation error:', error);
            this.showError('Failed to generate animation prompt. Please try again.');
        } finally {
            // Reset button state
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate AI Prompt';
        }
    }

    /**
     * Optimize existing animation prompt
     */
    async handleOptimizeAnimationPrompt() {
        const animationPrompt = document.getElementById('animationPrompt');
        const userPrompt = animationPrompt.value.trim();
        
        if (!userPrompt) {
            this.showError('Please enter an animation prompt to optimize');
            return;
        }

        if (!this.generatedCardData) {
            this.showError('Please select a card first');
            return;
        }

        const optimizeBtn = document.getElementById('optimizeAnimationPromptBtn');
        
        try {
            // Show loading state
            optimizeBtn.disabled = true;
            optimizeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Optimizing...';
            
            console.log('🔧 Optimizing animation prompt with card analysis...');
            
            // Get card data for analysis
            const cardData = await this.ensureCardDataForActions();
            
            const apiBaseUrl = window.SNAPMAGIC_CONFIG.API_URL;
            const response = await fetch(`${apiBaseUrl}api/transform-card`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`,
                    'X-Device-ID': this.deviceId
                },
                body: JSON.stringify({
                    action: 'optimize_animation_prompt',
                    user_prompt: userPrompt,
                    card_image: cardData.result,
                    original_prompt: this.generatedCardData.prompt || 'Trading card character'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Replace with optimized prompt
                animationPrompt.value = data.optimized_prompt;
                
                // Show success feedback
                this.showNotification('✨ Animation prompt optimized with card analysis!', 'success');
                
                console.log('✅ Animation prompt optimized:', data.optimized_prompt);
                
            } else {
                console.error('❌ Animation prompt optimization failed:', data.error);
                this.showError(data.error || 'Failed to optimize animation prompt');
            }
            
        } catch (error) {
            console.error('❌ Animation prompt optimization error:', error);
            this.showError('Failed to optimize animation prompt. Please try again.');
        } finally {
            // Reset button state
            optimizeBtn.disabled = false;
            optimizeBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Optimize My Prompt';
        }
    }
    handleShareLinkedIn() {
        console.log('📱 LinkedIn sharing with download + share approach');
        
        if (!this.generatedCardData) {
            this.showError('Please generate a card first before sharing!');
            return;
        }

        // Show the LinkedIn sharing popup
        this.showLinkedInSharingPopup();
    }

    /**
     * Show LinkedIn sharing popup with download + share buttons
     */
    showLinkedInSharingPopup() {
        const modalHtml = `
            <div id="linkedinSharingPopup" class="modal">
                <div class="modal-content">
                    <h3>📱 Share on LinkedIn</h3>
                    <p>To share your trading card on LinkedIn, follow these simple steps:</p>
                    
                    <div class="linkedin-steps">
                        <div class="step-item">
                            <span class="step-number">1</span>
                            <span class="step-text">Download your card image first</span>
                        </div>
                        <div class="step-item">
                            <span class="step-number">2</span>
                            <span class="step-text">Click "Share on LinkedIn" (will be enabled after download)</span>
                        </div>
                        <div class="step-item">
                            <span class="step-number">3</span>
                            <span class="step-text">In LinkedIn, click "Add media" and select your downloaded image</span>
                        </div>
                    </div>

                    <div class="linkedin-buttons">
                        <button id="downloadForLinkedIn" class="btn btn-primary">📥 Download Card</button>
                        <button id="shareToLinkedIn" class="btn btn-linkedin disabled" disabled>📱 Share on LinkedIn</button>
                    </div>
                    
                    <div class="modal-buttons">
                        <button id="cancelLinkedInSharing" class="btn btn-secondary">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Setup event listeners
        document.getElementById('downloadForLinkedIn').addEventListener('click', () => {
            this.downloadCardForLinkedIn();
        });
        
        document.getElementById('shareToLinkedIn').addEventListener('click', () => {
            this.openLinkedInForSharing();
        });
        
        document.getElementById('cancelLinkedInSharing').addEventListener('click', () => {
            this.closeLinkedInSharingPopup();
        });
    }

    /**
     * Download card and enable LinkedIn share button
     */
    async downloadCardForLinkedIn() {
        if (!this.generatedCardData) return;
        
        try {
            // Use the same working method as main download button
            const cardData = await this.ensureCardDataForActions();
            
            // Use base64 data for direct download (same as normal download button)
            const imageSrc = `data:image/png;base64,${cardData.result}`;
            
            // Create filename with date
            const today = new Date().toISOString().slice(0, 10);
            const time = new Date().toTimeString().slice(0, 5).replace(':', '');
            const filename = `SnapMagic-Card-${today}-${time}.png`;
            
            // Download the card
            const link = document.createElement('a');
            link.href = imageSrc;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log(`📥 LinkedIn card downloaded (styled): ${filename}`);
            
            // Enable the LinkedIn share button
            const shareButton = document.getElementById('shareToLinkedIn');
            const downloadButton = document.getElementById('downloadForLinkedIn');
            
            if (shareButton && downloadButton) {
                shareButton.disabled = false;
                shareButton.classList.remove('disabled');
                downloadButton.textContent = '✅ Downloaded';
                downloadButton.disabled = true;
                downloadButton.classList.add('disabled');
            }
        } catch (error) {
            console.error('❌ LinkedIn download failed:', error);
            
            // Fallback to direct download if ensureCardDataForActions fails
            const imageSrc = `data:image/png;base64,${this.generatedCardData.result}`;
            const today = new Date().toISOString().slice(0, 10);
            const time = new Date().toTimeString().slice(0, 5).replace(':', '');
            const filename = `SnapMagic-Card-${today}-${time}.png`;
            
            const link = document.createElement('a');
            link.href = imageSrc;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log(`📥 LinkedIn fallback download: ${filename}`);
        }
    }

    /**
     * Open LinkedIn with clean post text (no URL)
     */
    openLinkedInForSharing() {
        // Get event name from template configuration
        let eventName = 'AWS events'; // Default fallback
        
        try {
            if (window.SNAPMAGIC_CONFIG && window.SNAPMAGIC_CONFIG.TEMPLATE_CONFIG) {
                let templateConfig;
                if (typeof window.SNAPMAGIC_CONFIG.TEMPLATE_CONFIG === 'string') {
                    templateConfig = JSON.parse(window.SNAPMAGIC_CONFIG.TEMPLATE_CONFIG);
                } else {
                    templateConfig = window.SNAPMAGIC_CONFIG.TEMPLATE_CONFIG;
                }
                
                if (templateConfig && templateConfig.eventName) {
                    eventName = templateConfig.eventName;
                }
            }
        } catch (error) {
            console.warn('Could not parse template config for event name:', error);
        }
        
        console.log('🎯 Using event name for LinkedIn:', eventName);
        
        // Generate clean share text without URL and without prompt
        // Create hashtag version of event name (remove spaces and special characters)
        const eventHashtag = eventName.replace(/[^a-zA-Z0-9]/g, '');
        
        const shareText = `🎴✨ Just created my AI-powered trading card with SnapMagic - Powered by AWS! Generated using Amazon Bedrock Nova Canvas at ${eventName}. #SnapMagic #AI #TradingCards #${eventHashtag} #AmazonBedrock #Nova #Innovation`;
        
        // LinkedIn sharing URL with text only (no URL parameter)
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?text=${encodeURIComponent(shareText)}`;
        
        console.log('🔗 Opening LinkedIn with clean text (no URL)');
        console.log('📝 Share text:', shareText);
        window.open(linkedInUrl, '_blank', 'width=600,height=600,scrollbars=yes,resizable=yes');
        
        // Close the popup
        this.closeLinkedInSharingPopup();
    }

    /**
     * Close LinkedIn sharing popup
     */
    closeLinkedInSharingPopup() {
        const popup = document.getElementById('linkedinSharingPopup');
        if (popup) {
            popup.remove();
        }
    }

    // Print Success Modal Handler
    handlePrintSuccessOk() {
        console.log('✅ Print success acknowledged');
        this.elements.printSuccessModal.classList.add('hidden');
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
