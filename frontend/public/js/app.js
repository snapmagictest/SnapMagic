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
        
        // Gallery system for user's videos
        this.videoGallery = {
            videos: [], // Array of user's generated videos
            currentIndex: 0, // Currently displayed video index
            totalVideos: 0 // Total videos in user's session
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
        console.log('🚨 EMERGENCY MINIMAL INIT - BYPASSING COMPLEX INITIALIZATION');
        
        // EMERGENCY: Show login immediately without any complex setup
        setTimeout(() => {
            console.log('🚨 Emergency login display');
            
            // Force hide loading screen
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
                console.log('✅ Loading screen hidden');
            }
            
            // Force show login screen
            const loginScreen = document.getElementById('loginScreen');
            if (loginScreen) {
                loginScreen.classList.remove('hidden');
                console.log('✅ Login screen shown');
            } else {
                console.error('❌ Login screen element not found');
            }
            
            // Basic login functionality
            const loginBtn = document.getElementById('loginBtn');
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            
            if (loginBtn && usernameInput && passwordInput) {
                loginBtn.addEventListener('click', () => {
                    const username = usernameInput.value;
                    const password = passwordInput.value;
                    
                    if (username === 'demo' && password === 'demo') {
                        console.log('✅ Emergency login successful');
                        loginScreen.classList.add('hidden');
                        
                        // Show main app
                        const mainApp = document.getElementById('mainApp');
                        if (mainApp) {
                            mainApp.classList.remove('hidden');
                            console.log('✅ Main app shown');
                        }
                    } else {
                        alert('Invalid credentials. Use demo/demo');
                    }
                });
                console.log('✅ Emergency login handler attached');
            } else {
                console.error('❌ Login elements not found');
            }
            
        }, 500); // Much shorter delay
        
        // Try to run normal initialization in background (non-blocking)
        setTimeout(() => {
            try {
                console.log('🔄 Attempting normal initialization in background...');
                this.normalInit();
            } catch (error) {
                console.error('❌ Normal init failed, but emergency login should work:', error);
            }
        }, 1000);
    }
    
    normalInit() {
        console.log('🎴 SnapMagic App Normal Initialization...');
        console.log('🔧 Configuration:', window.SNAPMAGIC_CONFIG);
        
        // Start localStorage persistence monitoring
        console.log('📊 Starting localStorage monitoring...');
        this.startLocalStorageMonitoring();
        
        // Get DOM elements
        console.log('🔍 Getting DOM elements...');
        this.getElements();
        console.log('✅ DOM elements retrieved successfully');
        
        // Configure optional features
        console.log('⚙️ Configuring optional features...');
        this.configureOptionalFeatures();
        console.log('✅ Optional features configured successfully');
        
        // Setup event listeners
        console.log('🎧 Setting up event listeners...');
        this.setupEventListeners();
        console.log('✅ Event listeners setup successfully');
        
        console.log('🎉 Normal initialization completed successfully');
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
            
            // AWS logo (hidden staff override trigger)
            awsLogoOverride: document.getElementById('awsLogoOverride'),
            
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
            printBtn: document.getElementById('printBtn'),
            createAnotherBtn: document.getElementById('createAnotherBtn'),
            shareLinkedInBtn: document.getElementById('shareLinkedInBtn'),
            
            // Video generation elements
            videoPromptInput: document.getElementById('videoPromptInput'),
            videoPrompt: document.getElementById('videoPrompt'),
            videoCharCount: document.getElementById('videoCharCount'),
            videoClearBtn: document.getElementById('videoClearBtn'),
            generateVideoBtn: document.getElementById('generateVideoBtn'),
            noCardSelectedVideo: document.getElementById('noCardSelectedVideo'),
            backToCardBtn: document.getElementById('backToCardBtn'),
            
            // Video gallery elements
            videoGallery: document.getElementById('videoGallery'),
            videoResultContainer: document.getElementById('videoResultContainer'),
            videoGalleryNavigation: document.getElementById('videoGalleryNavigation'),
            videoGalleryPrevBtn: document.getElementById('videoGalleryPrevBtn'),
            videoGalleryNextBtn: document.getElementById('videoGalleryNextBtn'),
            videoGalleryDots: document.getElementById('videoGalleryDots'),
            videoResultActions: document.getElementById('videoResultActions'),
            downloadVideoBtn: document.getElementById('downloadVideoBtn'),
            createAnotherVideoBtn: document.getElementById('createAnotherVideoBtn'),
            noVideosPlaceholder: document.getElementById('noVideosPlaceholder'),
            
            // Legacy video elements (for compatibility)
            videoSection: document.getElementById('videoSection'),
            videoControls: document.getElementById('videoControls'),
            videoResult: document.getElementById('videoResult'),
            animationPrompt: document.getElementById('animationPrompt'),
            videoPlayer: document.getElementById('videoPlayer'),
            videoSource: document.getElementById('videoSource'),
            
            // Video gallery elements (removed - no longer needed)
            // videoSelectedCard: document.getElementById('videoSelectedCard'),
            // videoGalleryNavigation: document.getElementById('videoGalleryNavigation'),
            // videoGalleryInfo: document.getElementById('videoGalleryInfo'),
            // videoGalleryNumbers: document.getElementById('videoGalleryNumbers'),
            // videoGalleryPrevBtn: document.getElementById('videoGalleryPrevBtn'),
            // videoGalleryNextBtn: document.getElementById('videoGalleryNextBtn'),
            generateAnimationPromptBtn: document.getElementById('generateAnimationPromptBtn'),
            optimizeAnimationPromptBtn: document.getElementById('optimizeAnimationPromptBtn'),
            
            // Processing overlay
            processingOverlay: document.getElementById('processingOverlay'),
            
            // Name input modals - Dual Line System
            nameInputModal: document.getElementById('nameInputModal'),
            nameInputLine1: document.getElementById('nameInputLine1'),
            nameInputLine2: document.getElementById('nameInputLine2'),
            line1CharCount: document.getElementById('line1CharCount'),
            line2CharCount: document.getElementById('line2CharCount'),
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

    /**
     * Configure optional features based on configuration
     */
    configureOptionalFeatures() {
        console.log('🔧 Configuring optional features...');
        
        // Configure print button visibility
        const printEnabled = window.SNAPMAGIC_CONFIG?.PRINT_ENABLED === true || 
                            window.SNAPMAGIC_CONFIG?.PRINT_ENABLED === 'true';
        const printBtn = document.getElementById('printBtn');
        
        if (printBtn) {
            if (printEnabled) {
                console.log('✅ Print feature enabled - showing print button');
                printBtn.style.display = '';
            } else {
                console.log('❌ Print feature disabled - hiding print button');
                printBtn.style.display = 'none';
            }
        } else {
            console.warn('⚠️ Print button element not found');
        }
        
        // Configure print usage display visibility
        const printUsageItem = document.querySelector('.usage-item:has(#printUsage)');
        if (printUsageItem) {
            if (printEnabled) {
                console.log('✅ Print feature enabled - showing print usage');
                printUsageItem.style.display = '';
            } else {
                console.log('❌ Print feature disabled - hiding print usage');
                printUsageItem.style.display = 'none';
            }
        } else {
            console.warn('⚠️ Print usage element not found');
        }
        
        console.log('🔧 Optional features configured:', {
            printConfigValue: window.SNAPMAGIC_CONFIG?.PRINT_ENABLED,
            printEnabled: printEnabled,
            printButtonVisible: printBtn ? printBtn.style.display !== 'none' : false,
            printUsageVisible: printUsageItem ? printUsageItem.style.display !== 'none' : false
        });
    }

    setupEventListeners() {
        // Login form
        this.elements.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        
        // AWS logo as hidden staff override trigger
        this.elements.awsLogoOverride.addEventListener('click', () => this.handleStaffOverride());
        
        // Sign out (removed for events)
        // this.elements.signOutBtn.addEventListener('click', () => this.handleSignOut());
        
        // Tab navigation
        this.elements.tabNavItems.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
        
        // Card generation
        this.elements.generateBtn.addEventListener('click', () => this.handleGenerateCard());
        
        // Add animated GIF download button event listener
        const downloadAnimatedBtn = document.getElementById('downloadAnimatedBtn');
        if (downloadAnimatedBtn) {
            downloadAnimatedBtn.addEventListener('click', () => this.handleDownloadAnimatedGIF());
        }
        
        this.elements.printBtn.addEventListener('click', () => this.handlePrintCard());
        this.elements.createAnotherBtn.addEventListener('click', () => this.handleCreateAnother());
        
        // Prompt flow buttons
        document.getElementById('generatePromptBtn').addEventListener('click', () => this.handleGeneratePrompt());
        document.getElementById('optimizePromptBtn').addEventListener('click', () => this.handleOptimizePrompt());
        
        // Enable/disable optimize button based on text input - with null checks
        const userPromptElement = this.elements.promptInput; // Use correct element reference
        if (userPromptElement) {
            const updateOptimizeButton = () => {
                const optimizeBtn = document.getElementById('optimizePromptBtn');
                if (optimizeBtn) {
                    const hasMinText = userPromptElement.value.trim().length >= 10;
                    optimizeBtn.disabled = !hasMinText;
                    if (hasMinText) {
                        optimizeBtn.classList.remove('disabled');
                    } else {
                        optimizeBtn.classList.add('disabled');
                    }
                }
            };
            
            userPromptElement.addEventListener('input', updateOptimizeButton);
            
            // Initialize based on current text content
            updateOptimizeButton();
        }
        
        // Sharing
        this.elements.shareLinkedInBtn.addEventListener('click', () => this.handleShareLinkedIn());
        
        // Gallery navigation
        this.setupGalleryNavigation();
        
        // Video gallery navigation (removed - no longer needed)
        // this.setupVideoGalleryNavigation();
        
        // AI prompt generation buttons (moved from removed setupVideoGalleryNavigation)
        const generateAnimationPromptBtn = document.getElementById('generateAnimationPromptBtn');
        const optimizeAnimationPromptBtn = document.getElementById('optimizeAnimationPromptBtn');
        
        if (generateAnimationPromptBtn) {
            generateAnimationPromptBtn.addEventListener('click', () => this.handleGenerateAnimationPrompt());
        }
        
        if (optimizeAnimationPromptBtn) {
            optimizeAnimationPromptBtn.addEventListener('click', () => this.handleOptimizeAnimationPrompt());
        }
        
        // Video generation
        this.elements.generateVideoBtn.addEventListener('click', () => this.handleGenerateVideo());
        this.elements.downloadVideoBtn.addEventListener('click', () => this.handleDownloadVideo());
        this.elements.createAnotherVideoBtn.addEventListener('click', () => this.handleCreateAnotherVideo());
        this.elements.backToCardBtn.addEventListener('click', () => this.switchTab('card-generation'));
        
        // Legacy video generation buttons
        const generateVideoBtn2 = document.getElementById('generateVideoBtn2');
        const downloadVideoBtn2 = document.getElementById('downloadVideoBtn2');
        const createAnotherVideoBtn2 = document.getElementById('createAnotherVideoBtn2');
        const backToCardBtn2 = document.getElementById('backToCardBtn2');
        
        if (generateVideoBtn2) {
            generateVideoBtn2.addEventListener('click', () => this.handleGenerateVideo());
        }
        if (downloadVideoBtn2) {
            downloadVideoBtn2.addEventListener('click', () => this.handleDownloadVideo());
        }
        if (createAnotherVideoBtn2) {
            createAnotherVideoBtn2.addEventListener('click', () => this.handleCreateAnotherVideo());
        }
        if (backToCardBtn2) {
            backToCardBtn2.addEventListener('click', () => this.switchTab('card-generation'));
        }
        
        // Video prompt character count and clear button
        if (this.elements.videoPrompt) {
            this.elements.videoPrompt.addEventListener('input', () => this.updateVideoCharCount());
        }
        if (this.elements.videoClearBtn) {
            this.elements.videoClearBtn.addEventListener('click', () => this.clearVideoPrompt());
        }
        
        // Video gallery navigation
        this.setupVideoGalleryNavigation();
        
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
        
        // Enter key support for dual line inputs
        this.elements.nameInputLine1.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleNameConfirm();
            }
        });

        this.elements.nameInputLine2.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleNameConfirm();
            }
        });

        // Real-time character counting for Line 1
        this.elements.nameInputLine1.addEventListener('input', (e) => {
            // Hard stop at 11 characters
            if (e.target.value.length > 11) {
                e.target.value = e.target.value.substring(0, 11);
            }
            this.updateLine1CharacterCount();
        });

        // Real-time character counting for Line 2
        this.elements.nameInputLine2.addEventListener('input', (e) => {
            // Hard stop at 11 characters
            if (e.target.value.length > 11) {
                e.target.value = e.target.value.substring(0, 11);
            }
            this.updateLine2CharacterCount();
        });

        // Prevent typing beyond 11 characters on keypress for Line 1
        this.elements.nameInputLine1.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleNameConfirm();
                return;
            }
            if (e.target.value.length >= 11 && e.key !== 'Backspace' && e.key !== 'Delete') {
                e.preventDefault();
            }
        });

        // Prevent typing beyond 11 characters on keypress for Line 2
        this.elements.nameInputLine2.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleNameConfirm();
                return;
            }
            if (e.target.value.length >= 11 && e.key !== 'Backspace' && e.key !== 'Delete') {
                e.preventDefault();
            }
        });

        // Initialize character counter
        this.updateNameCharacterCount();
        
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
        console.log('🎬 updateVideoTab called');
        
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
                
                // AWS logo is always visible - no need to show/hide for staff override
                
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
                
                // Load existing videos from previous sessions
                await this.loadExistingVideos();
                
                this.hideProcessing();
                this.showMainApp();
                
                // Reset form
                this.elements.loginForm.reset();
            } else {
                console.error('❌ Login failed:', data.error);
                this.hideProcessing();
                this.showErrorModal('Login Failed', data.error || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            this.hideProcessing();
            this.showErrorModal('Login Failed', 'Login failed. Please check your connection and try again.');
        }
    }

    // Staff Override Functionality
    async handleStaffOverride() {
        // Simple password prompt
        const password = prompt('🔓 Override Password:');
        if (!password) return;
        
        // Check password (using the override code as password)
        if (password !== 'snap') {
            this.showErrorModal('Incorrect Password', 'The password you entered is incorrect. Please try again.');
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
                // this.hideVideoGalleryNavigation(); // Removed - no longer needed
                this.generatedCardData = null;
                
                // Clear result container
                this.elements.resultContainer.innerHTML = `
                    <p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Your generated trading card will appear here</p>
                `;
                this.elements.resultActions.classList.add('hidden');
                
                this.showSuccessModal('Override Applied!', `Override #${data.override_number} Applied!\n\nYour limits have been reset:\n• Cards: 5\n• Videos: 3\n• Prints: 1\n\nYou can now generate new content.`);
                console.log(`✅ Override #${data.override_number} applied successfully`);
                console.log(`📝 Client IP: ${data.client_ip}`);
                console.log(`🔄 Gallery reset for new session`);
            } else {
                this.showErrorModal('Override Failed', data.error || 'Unknown error occurred during override.');
            }
            
        } catch (error) {
            console.error('❌ Override error:', error);
            this.showErrorModal('Override Failed', 'Connection error occurred. Please check your network and try again.');
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
        // Calculate remaining counts
        const cardRemaining = this.usageLimits.cards.total - this.usageLimits.cards.used;
        const videoRemaining = this.usageLimits.videos.total - this.usageLimits.videos.used;
        const printRemaining = this.usageLimits.prints.total - this.usageLimits.prints.used;
        
        console.log('🎯 Updating button text with usage limits:', { cardRemaining, videoRemaining, printRemaining });
        
        // Update Generate Card button text
        if (this.elements.generateBtn) {
            this.elements.generateBtn.innerHTML = `🎨 Generate Trading Card (${cardRemaining} of ${this.usageLimits.cards.total} remaining)`;
        }
        
        // Update Generate Video button text
        const generateVideoBtn = document.getElementById('generateVideoBtn');
        if (generateVideoBtn) {
            generateVideoBtn.innerHTML = `🎬 Generate Video (${videoRemaining} of ${this.usageLimits.videos.total} remaining)`;
        }
        
        // Update Print button text (if print is enabled)
        if (this.elements.printBtn) {
            this.elements.printBtn.innerHTML = `🖨️ Save for Print (${printRemaining} of ${this.usageLimits.prints.total} remaining)`;
        }
        
        // Update button states
        this.updateButtonStates(cardRemaining, videoRemaining, printRemaining);
        
        console.log('✅ Button text updated with usage limits successfully');
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
                this.elements.generateBtn.innerHTML = `🎨 Generate Trading Card (${cardRemaining} of ${this.usageLimits.cards.total} remaining)`;
            }
        }
        
        // Update generate video button (different from create video)
        const generateVideoBtn = document.getElementById('generateVideoBtn');
        const generateVideoBtn2 = document.getElementById('generateVideoBtn2');
        
        if (generateVideoBtn) {
            if (videoRemaining <= 0) {
                generateVideoBtn.disabled = true;
                generateVideoBtn.innerHTML = '🚫 Video Limit Reached';
            } else {
                generateVideoBtn.disabled = false;
                generateVideoBtn.innerHTML = `🎬 Generate Video (${videoRemaining} of ${this.usageLimits.videos.total} remaining)`;
            }
        }
        
        if (generateVideoBtn2) {
            if (videoRemaining <= 0) {
                generateVideoBtn2.disabled = true;
                generateVideoBtn2.innerHTML = '🚫 Video Limit Reached';
            } else {
                generateVideoBtn2.disabled = false;
                generateVideoBtn2.innerHTML = `🎬 Generate Video (${videoRemaining} of ${this.usageLimits.videos.total} remaining)`;
            }
        }
        
        // Update print button
        if (this.elements.printBtn) {
            if (printRemaining <= 0) {
                this.elements.printBtn.disabled = true;
                this.elements.printBtn.innerHTML = '🚫 Print Used';
            } else {
                this.elements.printBtn.disabled = false;
                this.elements.printBtn.innerHTML = `🖨️ Save for Print (${printRemaining} of ${this.usageLimits.prints.total} remaining)`;
            }
        }
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
                
                // Show visual feedback instead of popup
                this.showTextBoxFeedback('userPrompt');
                
                // Optional: Show what seed was used (for debugging)
                if (data.seed_used) {
                    console.log('🎯 Seed concept used:', data.seed_used);
                }
            } else {
                throw new Error(data.error || 'Failed to generate prompt');
            }
            
        } catch (error) {
            console.error('❌ Generate prompt error:', error);
            this.showErrorModal('Prompt Generation Failed', 'Failed to generate prompt. Please try again.');
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
        
        // Validation: Check if prompt exists and is at least 10 characters
        if (!userPrompt) {
            this.showError('Please enter a prompt to optimize first.');
            return;
        }
        
        if (userPrompt.length < 10) {
            this.showError('Prompt must be at least 10 characters long to optimize.');
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
                
                // Show visual feedback instead of popup
                this.showTextBoxFeedback('userPrompt');
            } else {
                throw new Error(data.error || 'Failed to optimize prompt');
            }
            
        } catch (error) {
            console.error('❌ Optimize prompt error:', error);
            this.showErrorModal('Prompt Optimization Failed', 'Failed to optimize prompt. Please try again.');
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
        const aiImageSrc = `data:image/png;base64,${novaImageBase64}`;
        
        try {
            console.log('🎴 Creating holographic trading card...');
            
            // Create the beautiful holographic card directly
            const cardHTML = this.createHolographicCard(aiImageSrc, userName, userPrompt);
            
            // Store the card data with proper user name mapping
            this.generatedCardData = {
                ...data,
                novaImageBase64: novaImageBase64,
                finalImageSrc: aiImageSrc,
                cardHTML: cardHTML,
                userName: userName,      // Store as userName for consistency
                user_name: userName,     // Also store as user_name for API compatibility
                prompt: userPrompt       // Store the prompt
            };
            
            // Add to user's gallery
            this.addCardToGallery(this.generatedCardData);
            
            // Store in S3
            await this.storeFinalCardInS3(novaImageBase64, userPrompt, userName);
            
            // Display the holographic card
            this.elements.resultContainer.innerHTML = cardHTML;
            
            console.log('✅ Holographic card displayed successfully!');
            
        } catch (error) {
            console.error('❌ Card display failed:', error);
            
            // Simple fallback
            const imageSrc = data.imageSrc || `data:image/png;base64,${data.result}`;
            this.elements.resultContainer.innerHTML = `
                <img src="${imageSrc}" alt="Generated Trading Card" class="result-image">
            `;
            
            this.generatedCardData = { ...data, finalImageSrc: imageSrc };
            this.addCardToGallery(this.generatedCardData);
            await this.storeFinalCardInS3(novaImageBase64, userPrompt, userName);
        }
        
        this.elements.resultActions.classList.remove('hidden');
    }
    
    /**
     * Create holographic trading card with Nova image
     */
    createHolographicCard(aiImageSrc, userName, userPrompt) {
        // Parse creator info and FORCE UPPERCASE
        const fullName = (userName || 'NOVA').toUpperCase(); // ALWAYS UPPERCASE
        const creatorTitle = 'Creator';
        
        // Split name intelligently for two-line display
        const nameParts = fullName.split(' ');
        let nameHTML;
        
        if (nameParts.length >= 2) {
            // Two lines: First name and rest
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');
            nameHTML = `
                <div class="creator-name-line">${firstName}</div>
                <div class="creator-name-line">${lastName}</div>
            `;
        } else {
            // Single line
            nameHTML = `<div class="creator-name-line">${fullName}</div>`;
        }
        
        return `
        <div class="snapmagic-card animated" id="holoCard">
            <style>
                ${this.getCardCSS()}
            </style>
            
            <div class="card-content">
                <!-- 1. 3D Bulk Head Header -->
                <div class="bulk-head-header">
                    <img src="/powered-by-aws-white-horizontal.png" alt="Powered by AWS" class="popping-logo">
                </div>

                <!-- 2. AI Generated Image -->
                <div class="card-image">
                    <img src="${aiImageSrc}" alt="AI Generated Trading Card" 
                         style="width: 100%; height: 100%; object-fit: fill; border-radius: 8px; 
                                image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges; 
                                max-width: 100%; max-height: 100%;">
                </div>

                <!-- 3. Event Name -->
                <div class="event-name">
                    AWS re:Invent 2024
                </div>

                <!-- Bottom section container -->
                <div class="card-bottom-section">
                    <!-- 4. Customer/Partner Logos and Creator Section -->
                    <div class="card-footer">
                        <div class="customer-logo" title="Customer Logo">
                            <img src="/logos/1.png" alt="Customer" onerror="this.style.display='none'">
                        </div>
                        <div class="partner-logo" title="Partner Logo">
                            <img src="/logos/2.png" alt="Partner" onerror="this.style.display='none'">
                        </div>
                        <div class="creator-info">
                            <div class="creator-name">${nameHTML}</div>
                            <div class="creator-title">${creatorTitle}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    }

    /**
     * 🎯 PARALLEL SYSTEM: Create hidden card specifically for GIF generation
     * Flexible dimensions - easy to change size requirements
     * Independent of main display system - works with gallery switching
     */
    createHiddenCardForGIF(cardData, options = {}) {
        const { 
            width = 275, 
            height = 358,
            containerId = 'gif-hidden-container'
        } = options;
        
        console.log(`🎬 Creating hidden card for GIF: ${width}×${height}`);
        
        // Extract card data (works for new cards and gallery cards)
        const aiImageSrc = cardData.finalImageSrc || 
                          cardData.imageSrc || 
                          `data:image/png;base64,${cardData.result}`;
        const userName = cardData.userName || cardData.user_name || 'NOVA';
        const userPrompt = cardData.prompt || cardData.userPrompt || 'AI Generated Card';
        
        // Create hidden container with exact dimensions
        const hiddenContainer = document.createElement('div');
        hiddenContainer.id = containerId;
        hiddenContainer.style.position = 'absolute';
        hiddenContainer.style.left = '-9999px';
        hiddenContainer.style.top = '-9999px';
        hiddenContainer.style.width = `${width}px`;
        hiddenContainer.style.height = `${height}px`;
        hiddenContainer.style.backgroundColor = 'transparent';
        hiddenContainer.style.overflow = 'hidden';
        
        // Create the exact same card HTML as main system
        const cardHTML = this.createHolographicCard(aiImageSrc, userName, userPrompt);
        hiddenContainer.innerHTML = cardHTML;
        
        // Force the card to exact dimensions (override responsive CSS)
        const hiddenCard = hiddenContainer.querySelector('.snapmagic-card');
        if (hiddenCard) {
            hiddenCard.style.width = `${width}px`;
            hiddenCard.style.height = `${height}px`;
            hiddenCard.style.maxWidth = `${width}px`;
            hiddenCard.style.maxHeight = `${height}px`;
            hiddenCard.style.minWidth = `${width}px`;
            hiddenCard.style.minHeight = `${height}px`;
            hiddenCard.style.aspectRatio = 'unset'; // Override responsive aspect ratio
            hiddenCard.style.margin = '0';
            hiddenCard.style.padding = '0';
            
            // Add special class for GIF animations
            hiddenCard.classList.add('gif-card', 'animated');
        }
        
        // Add to DOM for rendering
        document.body.appendChild(hiddenContainer);
        
        console.log(`✅ Hidden card created: ${width}×${height} with data:`, {
            userName,
            hasImage: !!aiImageSrc,
            prompt: userPrompt.substring(0, 50) + '...'
        });
        
        return {
            container: hiddenContainer,
            card: hiddenCard,
            cleanup: () => {
                if (document.body.contains(hiddenContainer)) {
                    document.body.removeChild(hiddenContainer);
                    console.log('🧹 Hidden card cleaned up');
                }
            }
        };
    }
    
    /**
     * Parse creator info from userName or use defaults
     */
    parseCreatorInfo(userName) {
        if (!userName || userName.trim() === '') {
            return {
                name: 'NOVA',
                title: 'Creator'
            };
        }
        
        // If userName contains a pipe separator, split into name and title
        if (userName.includes('|')) {
            const [name, title] = userName.split('|').map(s => s.trim());
            return {
                name: name || 'NOVA',
                title: title || 'Creator'
            };
        }
        
        // Otherwise, use userName as name with default title
        return {
            name: userName.trim(),
            title: 'Creator'
        };
    }
    
    /**
     * Get the holographic card CSS (from our perfected template)
     */
    getCardCSS() {
        return `
        :root {
            --aws-orange: #FF9900;
            --aws-blue: #4B9CD3;
            --aws-dark: #232F3E;
            --holo-color1: #FF9900;
            --holo-color2: #4B9CD3;
            --holo-color3: #DAA520;
            --holo-color4: #E67E22;
            --holo-color5: #FF7F50;
        }

        .snapmagic-card {
            /* MAXIMIZE card within expanded SPACE 4 */
            width: 100%;
            max-width: calc(100% - 1rem); /* Fill SPACE 4 <-- --> minus small margin */
            /* Fixed aspect ratio for consistent trading card appearance */
            aspect-ratio: 5/6.5;
            position: relative;
            /* SPACE 5: Minimize margins to get close to SPACE 4 boundaries */
            margin: 0 auto;
            /* Prevent overflow from gallery */
            box-sizing: border-box;
            overflow: hidden;
            border-radius: 15px;
            background: linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            border: 2px solid rgba(255, 153, 0, 0.3);
            cursor: pointer;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            margin: 20px auto;
        }

        .snapmagic-card.animated {
            box-shadow: 
                -5px -5px 5px -5px var(--holo-color3), 
                5px 5px 5px -5px var(--holo-color2), 
                0 55px 35px -20px rgba(0, 0, 0, 0.5);
            animation: autoFloat 8s ease-in-out infinite;
        }

        @keyframes autoFloat {
            0%, 100% {
                transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
                box-shadow: 
                    -5px -5px 5px -5px var(--holo-color3), 
                    5px 5px 5px -5px var(--holo-color2), 
                    0 55px 35px -20px rgba(0, 0, 0, 0.5);
            }
            25% {
                transform: rotateX(2deg) rotateY(-3deg) rotateZ(0.5deg);
                box-shadow: 
                    -15px -15px 20px -15px var(--holo-color4), 
                    15px 15px 20px -15px var(--holo-color1), 
                    0 0 8px 2px rgba(255,100,50,0.3),
                    0 55px 35px -20px rgba(0, 0, 0, 0.5);
            }
            50% {
                transform: rotateX(-1deg) rotateY(4deg) rotateZ(-0.3deg);
                box-shadow: 
                    -10px -10px 15px -10px var(--holo-color5), 
                    10px 10px 15px -10px var(--holo-color2), 
                    0 0 10px 3px rgba(255,69,0,0.4),
                    0 55px 35px -20px rgba(0, 0, 0, 0.5);
            }
            75% {
                transform: rotateX(3deg) rotateY(2deg) rotateZ(0.8deg);
                box-shadow: 
                    -15px -15px 20px -15px var(--holo-color1), 
                    15px 15px 20px -15px var(--holo-color2), 
                    0 0 4px 1px rgba(220,20,60,0.08),
                    0 55px 35px -20px rgba(0, 0, 0, 0.5);
            }
        }

        .snapmagic-card.animated:before,
        .snapmagic-card.animated:after {
            content: "";
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            top: 0;
            background-repeat: no-repeat;
            pointer-events: none;
        }

        .snapmagic-card.animated:before {
            background-size: 300% 300%;
            background-image: linear-gradient(
                115deg,
                transparent 0%,
                var(--holo-color4) 15%,
                var(--holo-color1) 25%,
                var(--holo-color5) 35%,
                transparent 47%,
                transparent 53%,
                var(--holo-color2) 65%,
                var(--holo-color3) 75%,
                var(--holo-color4) 85%,
                transparent 100%
            );
            opacity: .3;
            filter: brightness(.7) contrast(1.2);
            z-index: 1;
            animation: autoGradientSweep 6s ease-in-out infinite;
        }

        .snapmagic-card.animated:after {
            opacity: 1;
            background-image: 
                linear-gradient(125deg, 
                    #FFD70020 10%, 
                    #FFA50025 20%, 
                    #FF8C0018 30%, 
                    #ffff0025 40%, 
                    #DAA52010 50%, 
                    #00ff8a15 60%, 
                    #00cfff30 70%, 
                    #FFB84D25 80%, 
                    #cc4cfa35 90%);
            background-size: 160%;
            background-blend-mode: overlay;
            z-index: 2;
            filter: brightness(1.1) contrast(1.1);
            mix-blend-mode: color-dodge;
            opacity: .3;
            animation: autoSparkleMove 10s ease-in-out infinite;
        }

        @keyframes autoGradientSweep {
            0%, 100% {
                background-position: 0% 0%;
                opacity: 0.3;
                filter: brightness(.7) contrast(1.2);
            }
            20% {
                background-position: 100% 100%;
                opacity: 0.5;
                filter: brightness(.9) contrast(1.4);
            }
            40% {
                background-position: 0% 100%;
                opacity: 0.4;
                filter: brightness(.6) contrast(1.1);
            }
            60% {
                background-position: 100% 0%;
                opacity: 0.6;
                filter: brightness(1) contrast(1.5);
            }
            80% {
                background-position: 50% 50%;
                opacity: 0.4;
                filter: brightness(.6) contrast(1.0);
            }
        }

        @keyframes autoSparkleMove {
            0%, 100% {
                background-position: 50% 50%;
                opacity: 0.3;
                filter: brightness(1.1) contrast(1.1);
            }
            15% {
                background-position: 30% 70%;
                opacity: 0.4;
                filter: brightness(1.3) contrast(1.3);
            }
            30% {
                background-position: 70% 30%;
                opacity: 0.2;
                filter: brightness(.9) contrast(.9);
            }
            45% {
                background-position: 20% 40%;
                opacity: 0.8;
                filter: brightness(1.1) contrast(1.1);
            }
            60% {
                background-position: 80% 60%;
                opacity: 0.3;
                filter: brightness(1) contrast(1);
            }
            75% {
                background-position: 40% 80%;
                opacity: 0.4;
                filter: brightness(1.2) contrast(1.2);
            }
            90% {
                background-position: 60% 20%;
                opacity: 0.5;
                filter: brightness(0.9) contrast(0.9);
            }
        }

        .card-content {
            position: relative;
            z-index: 3;
            height: 100%;
            display: flex;
            flex-direction: column;
            color: white;
            padding: clamp(10px, 2vw, 16px) clamp(10px, 2vw, 16px) 8px clamp(10px, 2vw, 16px);
        }

        /* 3D Bulk Head Header with Popping Logo */
        .bulk-head-header {
            position: relative;
            margin: -12px -12px 6px -12px;
            padding: clamp(12px, 2.5vw, 20px) clamp(16px, 3vw, 24px);
            min-height: clamp(32px, 6vw, 48px);
            display: flex;
            align-items: center;
            justify-content: center;
            
            /* 3D Bulk Head Background */
            background: 
                linear-gradient(135deg, #4a5568 0%, #2d3748 25%, #1a202c 50%, #0f1419 75%, #000000 100%),
                radial-gradient(ellipse at top left, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
                radial-gradient(ellipse at bottom right, rgba(255, 153, 0, 0.1) 0%, transparent 50%);
            background-blend-mode: normal, overlay, multiply;
            
            /* 3D Bulk Effect */
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-top: 2px solid rgba(255, 255, 255, 0.3);
            border-left: 2px solid rgba(255, 255, 255, 0.25);
            border-right: 1px solid rgba(0, 0, 0, 0.3);
            border-bottom: 2px solid rgba(0, 0, 0, 0.4);
            border-radius: clamp(8px, 2vw, 12px) clamp(8px, 2vw, 12px) clamp(6px, 1.5vw, 8px) clamp(6px, 1.5vw, 8px);
            
            /* Deep 3D Shadow System */
            box-shadow: 
                inset 2px 2px 6px rgba(255, 255, 255, 0.1),     /* Inner highlight */
                inset -2px -2px 6px rgba(0, 0, 0, 0.3),         /* Inner shadow */
                0 4px 8px rgba(0, 0, 0, 0.4),                   /* Outer shadow */
                0 8px 16px rgba(0, 0, 0, 0.2),                  /* Depth shadow */
                0 0 20px rgba(255, 153, 0, 0.15);               /* AWS glow */
            
            /* Subtle texture overlay */
            background-image: 
                repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 2px,
                    rgba(255, 255, 255, 0.02) 2px,
                    rgba(255, 255, 255, 0.02) 4px
                );
        }
        
        /* Popping Logo with Shine */
        .popping-logo {
            height: clamp(20px, 4vw, 32px) !important;
            width: auto !important;
            max-width: 100% !important;
            object-fit: contain !important;
            
            /* 3D Popping Effect */
            transform: translateZ(10px) scale(1.05);
            filter: 
                drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))
                drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))
                brightness(1.1)
                contrast(1.1);
            
            /* Shine Animation */
            position: relative;
            animation: logoShine 3s ease-in-out infinite;
        }
        
        /* Shine Animation Keyframes */
        @keyframes logoShine {
            0%, 100% {
                filter: 
                    drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))
                    drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))
                    brightness(1.1)
                    contrast(1.1);
            }
            50% {
                filter: 
                    drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))
                    drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))
                    drop-shadow(0 0 12px rgba(255, 255, 255, 0.4))
                    brightness(1.2)
                    contrast(1.15);
            }
        }
        
        /* ===== ENHANCED GIF CARD ANIMATIONS - CLASSY & PROFESSIONAL ===== */
        
        /* Graceful Swivel Animation for GIF Cards Only */
        @keyframes gifGracefulSwivel {
            0%, 100% {
                transform: perspective(1000px) rotateX(0deg) rotateY(0deg) rotateZ(0deg);
                box-shadow: 
                    -8px -8px 16px -8px rgba(255, 215, 0, 0.3), 
                    8px 8px 16px -8px rgba(138, 43, 226, 0.3), 
                    0 0 20px 4px rgba(255, 255, 255, 0.1),
                    0 60px 40px -25px rgba(0, 0, 0, 0.4);
            }
            12.5% {
                transform: perspective(1000px) rotateX(1deg) rotateY(-2deg) rotateZ(0.3deg);
                box-shadow: 
                    -12px -12px 24px -12px rgba(255, 140, 0, 0.4), 
                    12px 12px 24px -12px rgba(75, 0, 130, 0.4), 
                    0 0 25px 6px rgba(255, 215, 0, 0.15),
                    0 60px 40px -25px rgba(0, 0, 0, 0.4);
            }
            25% {
                transform: perspective(1000px) rotateX(2deg) rotateY(-3deg) rotateZ(0.5deg);
                box-shadow: 
                    -16px -16px 32px -16px rgba(255, 69, 0, 0.5), 
                    16px 16px 32px -16px rgba(148, 0, 211, 0.5), 
                    0 0 30px 8px rgba(255, 140, 0, 0.2),
                    0 60px 40px -25px rgba(0, 0, 0, 0.4);
            }
            37.5% {
                transform: perspective(1000px) rotateX(1.5deg) rotateY(-1deg) rotateZ(0.2deg);
                box-shadow: 
                    -14px -14px 28px -14px rgba(255, 105, 180, 0.4), 
                    14px 14px 28px -14px rgba(72, 61, 139, 0.4), 
                    0 0 28px 7px rgba(255, 20, 147, 0.18),
                    0 60px 40px -25px rgba(0, 0, 0, 0.4);
            }
            50% {
                transform: perspective(1000px) rotateX(-1deg) rotateY(4deg) rotateZ(-0.4deg);
                box-shadow: 
                    -10px -10px 20px -10px rgba(0, 191, 255, 0.5), 
                    10px 10px 20px -10px rgba(255, 20, 147, 0.5), 
                    0 0 35px 10px rgba(0, 191, 255, 0.25),
                    0 60px 40px -25px rgba(0, 0, 0, 0.4);
            }
            62.5% {
                transform: perspective(1000px) rotateX(-0.5deg) rotateY(2deg) rotateZ(-0.1deg);
                box-shadow: 
                    -12px -12px 24px -12px rgba(50, 205, 50, 0.4), 
                    12px 12px 24px -12px rgba(255, 69, 0, 0.4), 
                    0 0 32px 9px rgba(50, 205, 50, 0.22),
                    0 60px 40px -25px rgba(0, 0, 0, 0.4);
            }
            75% {
                transform: perspective(1000px) rotateX(3deg) rotateY(2deg) rotateZ(0.6deg);
                box-shadow: 
                    -18px -18px 36px -18px rgba(255, 215, 0, 0.5), 
                    18px 18px 36px -18px rgba(138, 43, 226, 0.5), 
                    0 0 25px 6px rgba(255, 215, 0, 0.15),
                    0 60px 40px -25px rgba(0, 0, 0, 0.4);
            }
            87.5% {
                transform: perspective(1000px) rotateX(1deg) rotateY(0.5deg) rotateZ(0.2deg);
                box-shadow: 
                    -10px -10px 20px -10px rgba(255, 182, 193, 0.4), 
                    10px 10px 20px -10px rgba(106, 90, 205, 0.4), 
                    0 0 22px 5px rgba(255, 182, 193, 0.12),
                    0 60px 40px -25px rgba(0, 0, 0, 0.4);
            }
        }

        /* Elegant Shimmer Animation for GIF Cards */
        @keyframes gifElegantShimmer {
            0%, 100% {
                background-position: -200% 0%;
                opacity: 0.2;
                filter: brightness(0.8) contrast(1.1) saturate(1.2);
            }
            10% {
                background-position: -150% 25%;
                opacity: 0.3;
                filter: brightness(0.9) contrast(1.2) saturate(1.3);
            }
            25% {
                background-position: -100% 50%;
                opacity: 0.5;
                filter: brightness(1.1) contrast(1.4) saturate(1.5);
            }
            40% {
                background-position: -50% 75%;
                opacity: 0.4;
                filter: brightness(1.0) contrast(1.3) saturate(1.4);
            }
            50% {
                background-position: 0% 100%;
                opacity: 0.6;
                filter: brightness(1.2) contrast(1.5) saturate(1.6);
            }
            60% {
                background-position: 50% 75%;
                opacity: 0.4;
                filter: brightness(1.0) contrast(1.3) saturate(1.4);
            }
            75% {
                background-position: 100% 50%;
                opacity: 0.5;
                filter: brightness(1.1) contrast(1.4) saturate(1.5);
            }
            90% {
                background-position: 150% 25%;
                opacity: 0.3;
                filter: brightness(0.9) contrast(1.2) saturate(1.3);
            }
        }

        /* Professional Sparkle Animation for GIF Cards */
        @keyframes gifProfessionalSparkle {
            0%, 100% {
                background-position: 0% 0%;
                opacity: 0.15;
                filter: brightness(1.0) contrast(1.0) saturate(1.1);
            }
            8% {
                background-position: 12% 15%;
                opacity: 0.25;
                filter: brightness(1.1) contrast(1.1) saturate(1.2);
            }
            16% {
                background-position: 25% 30%;
                opacity: 0.35;
                filter: brightness(1.2) contrast(1.2) saturate(1.3);
            }
            25% {
                background-position: 40% 45%;
                opacity: 0.45;
                filter: brightness(1.3) contrast(1.3) saturate(1.4);
            }
            33% {
                background-position: 55% 60%;
                opacity: 0.4;
                filter: brightness(1.25) contrast(1.25) saturate(1.35);
            }
            41% {
                background-position: 70% 75%;
                opacity: 0.5;
                filter: brightness(1.4) contrast(1.4) saturate(1.5);
            }
            50% {
                background-position: 85% 90%;
                opacity: 0.3;
                filter: brightness(1.2) contrast(1.2) saturate(1.3);
            }
            58% {
                background-position: 70% 75%;
                opacity: 0.4;
                filter: brightness(1.3) contrast(1.3) saturate(1.4);
            }
            66% {
                background-position: 55% 60%;
                opacity: 0.35;
                filter: brightness(1.25) contrast(1.25) saturate(1.35);
            }
            75% {
                background-position: 40% 45%;
                opacity: 0.45;
                filter: brightness(1.35) contrast(1.35) saturate(1.45);
            }
            83% {
                background-position: 25% 30%;
                opacity: 0.3;
                filter: brightness(1.15) contrast(1.15) saturate(1.25);
            }
            91% {
                background-position: 12% 15%;
                opacity: 0.2;
                filter: brightness(1.05) contrast(1.05) saturate(1.15);
            }
        }

        /* Apply Enhanced Animations to GIF Cards Only */
        .snapmagic-card.gif-card.animated {
            animation: gifGracefulSwivel 8s ease-in-out infinite;
            transform-style: preserve-3d;
            backface-visibility: hidden;
        }

        .snapmagic-card.gif-card.animated:before {
            animation: gifElegantShimmer 6s ease-in-out infinite;
            background: linear-gradient(
                135deg,
                transparent 0%,
                rgba(255, 215, 0, 0.1) 15%,
                rgba(255, 140, 0, 0.2) 25%,
                rgba(255, 69, 0, 0.3) 35%,
                rgba(255, 20, 147, 0.25) 45%,
                rgba(138, 43, 226, 0.2) 55%,
                rgba(75, 0, 130, 0.15) 65%,
                rgba(0, 191, 255, 0.2) 75%,
                rgba(50, 205, 50, 0.1) 85%,
                transparent 100%
            );
            background-size: 400% 400%;
        }

        .snapmagic-card.gif-card.animated:after {
            animation: gifProfessionalSparkle 10s ease-in-out infinite;
            background: radial-gradient(
                circle at 20% 20%, rgba(255, 215, 0, 0.3) 0%, transparent 25%
            ),
            radial-gradient(
                circle at 80% 30%, rgba(255, 140, 0, 0.25) 0%, transparent 20%
            ),
            radial-gradient(
                circle at 40% 70%, rgba(138, 43, 226, 0.2) 0%, transparent 15%
            ),
            radial-gradient(
                circle at 70% 80%, rgba(0, 191, 255, 0.25) 0%, transparent 18%
            ),
            radial-gradient(
                circle at 15% 60%, rgba(255, 20, 147, 0.2) 0%, transparent 22%
            ),
            radial-gradient(
                circle at 90% 15%, rgba(50, 205, 50, 0.15) 0%, transparent 20%
            );
            background-size: 300% 300%;
        }

        /* ===== END GIF CARD ANIMATIONS ===== */
        .bulk-head-header:hover .popping-logo {
            transform: translateZ(15px) scale(1.08);
            filter: 
                drop-shadow(0 3px 6px rgba(0, 0, 0, 0.4))
                drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3))
                drop-shadow(0 0 16px rgba(255, 255, 255, 0.5))
                brightness(1.25)
                contrast(1.2);
        }

        .card-image {
            background: #2a2a3e;
            border-radius: clamp(8px, 1.5vw, 12px);
            margin-bottom: 6px;
            position: relative;
            overflow: hidden;
            border: 2px solid rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            height: clamp(200px, 35vw, 300px);
            width: 100%;
            aspect-ratio: 16/9;
        }

        .event-name {
            text-align: center;
            font-size: clamp(14px, 2.5vw, 18px);
            font-weight: bold;
            margin-bottom: 6px;
            color: var(--aws-orange);
            text-shadow: 0 0 5px rgba(255, 153, 0, 0.3);
            line-height: 1.2;
        }

        .card-bottom-section {
            margin-top: 6px;
        }

        .card-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            margin-bottom: 6px;
            
            /* 3D Etched/Inset Effect */
            box-shadow: 
                inset 2px 2px 4px rgba(0, 0, 0, 0.6),     /* Top-left inner shadow (dark) */
                inset -2px -2px 4px rgba(255, 255, 255, 0.1), /* Bottom-right inner highlight */
                inset 0 0 8px rgba(0, 0, 0, 0.3);         /* Overall inner depth */
        }

        .customer-logo, .partner-logo {
            height: clamp(35px, 6vw, 50px);
            width: auto;
            max-width: clamp(60px, 10vw, 80px);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .partner-logo {
            margin-left: clamp(4px, 0.8vw, 6px);
        }

        .customer-logo img, .partner-logo img {
            height: 100%;
            width: auto;
            max-width: 100%;
            object-fit: contain;
        }

        .creator-info {
            text-align: right;
            flex: 1;
            margin-left: clamp(6px, 1vw, 10px);
        }

        .creator-name {
            font-size: clamp(11px, 2vw, 15px);
            font-weight: bold;
            color: white;
            margin-bottom: 1px;
            text-transform: uppercase; /* FORCE UPPERCASE */
            letter-spacing: 0.5px; /* Better spacing for uppercase */
        }

        .creator-name-line {
            line-height: 1.1;
            margin-bottom: 1px;
        }

        .creator-name-line:last-child {
            margin-bottom: 0;
        }

        .creator-title {
            font-size: clamp(9px, 1.5vw, 12px);
            color: rgba(255, 255, 255, 0.7);
        }

        /* Trading Card Responsive Sizing - MAXIMIZE within SPACE 4 */
        
        /* Large Desktop (≥1200px) - Fill expanded SPACE 4 */
        @media (min-width: 1200px) {
            .snapmagic-card {
                max-width: calc(100% - 1rem); /* Fill available SPACE 4 <-- --> */
            }
        }
        
        /* Tablet (768px-1199px) - Fill expanded SPACE 4 */
        @media (max-width: 1199px) and (min-width: 768px) {
            .snapmagic-card {
                max-width: calc(100% - 1rem); /* Fill available SPACE 4 <-- --> */
            }
        }
        
        /* Mobile (≤767px) - Fill expanded SPACE 4 with containment */
        @media (max-width: 767px) {
            .snapmagic-card {
                max-width: calc(100% - 0.5rem); /* Fill available SPACE 4 <-- --> */
                min-width: 280px; /* Ensure readability on tiny screens */
            }
        }

        .no-logos-text {
            font-size: 12px;
            color: white;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        `;
    }

    handleCreateAnother() {
        console.log('🔄 Creating another card - preserving gallery');
        
        // DON'T call clearResults() - this was removing the gallery!
        // Instead, just navigate to the card input section
        
        // Navigate to card generation tab if not already there
        this.switchTab('card-generation');
        
        // IMPORTANT: Show the prompt input area (it's hidden on login)
        const promptInputArea = document.getElementById('promptInputArea');
        if (promptInputArea) {
            promptInputArea.classList.remove('hidden');
        }
        
        // Scroll to the prompt input area
        if (promptInputArea) {
            promptInputArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // Add yellow border highlight effect to the prompt input
        const promptInput = this.elements.promptInput;
        if (promptInput) {
            // Clear any existing text (user can decide what to do)
            promptInput.value = '';
            
            // Add yellow border highlight (not background)
            promptInput.style.border = '3px solid #ffff00';
            promptInput.style.boxShadow = '0 0 10px rgba(255, 255, 0, 0.5)';
            promptInput.style.transition = 'border 0.3s ease, box-shadow 0.3s ease';
            
            // Focus the input
            promptInput.focus();
            
            // Remove highlight after 3 seconds
            setTimeout(() => {
                promptInput.style.border = '';
                promptInput.style.boxShadow = '';
            }, 3000);
        }
    }

    // ========================================
    // ANIMATED GIF GENERATION SYSTEM
    // ========================================
    
    /**
     * Download animated GIF for current card
     */
    async handleDownloadAnimatedGIF() {
        if (!this.generatedCardData) {
            this.showError('No card data available for animated GIF generation');
            return;
        }
        
        try {
            console.log('🎬 Starting animated GIF download...');
            this.showProcessing('Generating animated GIF...');
            
            // Generate animated GIF
            const gifBlob = await this.generateAnimatedCardGIF(this.generatedCardData);
            
            // SIMPLE WORKING METHOD: Direct blob download (same as working PNG downloads)
            const link = document.createElement('a');
            link.href = URL.createObjectURL(gifBlob);
            
            // Generate filename
            const eventName = this.templateSystem?.templateConfig?.eventName || 'Event';
            const sanitizedEventName = eventName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
            const today = new Date().toISOString().slice(0, 10);
            const time = new Date().toTimeString().slice(0, 5).replace(':', '');
            link.download = `snapmagic-${sanitizedEventName}-animated-card-${today}-${time}.gif`;
            
            // Trigger download (same method that works for PNG)
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up blob URL
            URL.revokeObjectURL(link.href);
            
            this.hideProcessing();
            console.log('✅ Animated GIF download completed');
            
        } catch (error) {
            console.error('❌ Animated GIF download failed:', error);
            this.hideProcessing();
            this.showError(`Animated GIF generation failed: ${error.message}`);
        }
    }

    /**
     * Detect if user is on mobile device
     */
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
    }

    /**
     * Generate consistent filename for GIF downloads
     */
    generateGifFilename() {
        const eventName = this.templateSystem?.templateConfig?.eventName || 'Event';
        const sanitizedEventName = eventName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        const today = new Date().toISOString().slice(0, 10);
        const time = new Date().toTimeString().slice(0, 5).replace(':', '');
        return `snapmagic-${sanitizedEventName}-animated-card-${today}-${time}.gif`;
    }

    /**
     * Mobile-optimized blob download
     */
    async downloadBlobOnMobile(blob, filename) {
        try {
            // Method 1: Try native share API if available
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], filename, { type: blob.type })] })) {
                console.log('📱 Using Web Share API');
                const file = new File([blob], filename, { type: blob.type });
                await navigator.share({
                    files: [file],
                    title: 'SnapMagic Animated Card',
                    text: 'Check out my animated trading card!'
                });
                return;
            }

            // Method 2: Try direct download with mobile-specific handling
            console.log('📱 Using mobile blob download');
            const url = URL.createObjectURL(blob);
            
            // Create a more mobile-friendly download approach
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            
            // Add to DOM temporarily
            document.body.appendChild(link);
            
            // Trigger download with mobile-specific events
            if (typeof link.click === 'function') {
                link.click();
            } else {
                // Fallback for older mobile browsers
                const event = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                });
                link.dispatchEvent(event);
            }
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);
            
        } catch (error) {
            console.error('❌ Mobile download failed:', error);
            // Fallback to desktop method
            this.downloadBlobOnDesktop(blob, filename);
        }
    }

    /**
     * Desktop blob download (original method)
     */
    downloadBlobOnDesktop(blob, filename) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up blob URL
        URL.revokeObjectURL(link.href);
    }

    // Video Generation
    async handleGenerateVideo() {
        // Use videoPrompt if available (new system), otherwise use animationPrompt (legacy)
        let userPrompt = '';
        if (this.elements.videoPrompt && this.elements.videoPrompt.value.trim()) {
            userPrompt = this.elements.videoPrompt.value.trim();
        } else if (this.elements.animationPrompt && this.elements.animationPrompt.value.trim()) {
            userPrompt = this.elements.animationPrompt.value.trim();
        }
        
        if (!userPrompt) {
            this.showError('Please describe your action for the video');
            return;
        }

        // Automatically prepend the frame 1 prefix to ensure immediate action
        const animationPrompt = `From frame 1 and immediately visible: ${userPrompt}`;
        console.log('🎬 Video prompt with prefix:', animationPrompt);

        if (!this.generatedCardData) {
            this.showError('Please generate a trading card first');
            return;
        }

        try {
            this.showProcessing('Creating your animated video... This takes about 2 minutes.');
            
            // Disable both video generation buttons
            if (this.elements.generateVideoBtn) {
                this.elements.generateVideoBtn.disabled = true;
            }
            const generateVideoBtn2 = document.getElementById('generateVideoBtn2');
            if (generateVideoBtn2) {
                generateVideoBtn2.disabled = true;
            }
            
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
            
            // Nova Canvas generates 1280x720 images - convert to JPEG for Nova Reel
            console.log('🎯 Converting 1280x720 Nova Canvas image to JPEG for Nova Reel');
            const jpegImage = await this.convertImageToJPEG(imageForVideo);
            
            const requestBody = {
                action: 'generate_video',
                card_image: jpegImage, // Send JPEG format as required by Nova Reel
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
            // Re-enable both video generation buttons
            if (this.elements.generateVideoBtn) {
                this.elements.generateVideoBtn.disabled = false;
            }
            const generateVideoBtn2 = document.getElementById('generateVideoBtn2');
            if (generateVideoBtn2) {
                generateVideoBtn2.disabled = false;
            }
        }
    }

    /**
     * Convert Nova Canvas PNG to JPEG format for Nova Reel compatibility
     * Simple format conversion without letterboxing (image is already 1280x720)
     */
    async convertImageToJPEG(imageBase64) {
        return new Promise((resolve, reject) => {
            try {
                console.log('🔄 Converting Nova Canvas PNG to JPEG for Nova Reel...');
                
                // Create canvas for format conversion
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Load the 1280x720 Nova Canvas image
                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                img.onload = function() {
                    console.log(`📏 Nova Canvas image: ${img.width}x${img.height}`);
                    
                    // Set canvas to exact image dimensions (should be 1280x720)
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    // Draw the image directly (no letterboxing needed)
                    ctx.drawImage(img, 0, 0);
                    
                    // Convert to JPEG format (quality 1.0 for best quality)
                    const jpegBase64 = canvas.toDataURL('image/jpeg', 1.0).split(',')[1];
                    
                    console.log('✅ PNG→JPEG conversion complete');
                    console.log(`📊 JPEG Base64 length: ${jpegBase64.length} characters`);
                    resolve(jpegBase64);
                };
                
                img.onerror = function() {
                    console.error('❌ Failed to load Nova Canvas image for JPEG conversion');
                    reject(new Error('Failed to load image for JPEG conversion'));
                };
                
                // Set image source (add data URL prefix if needed)
                const imageData = imageBase64.startsWith('data:image/') 
                    ? imageBase64 
                    : `data:image/png;base64,${imageBase64}`;
                img.src = imageData;
                
            } catch (error) {
                console.error('❌ JPEG conversion error:', error);
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
                this.displayGeneratedVideo(result.video_url, result); // Pass complete result data
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

    displayGeneratedVideo(videoUrl, videoResult = null) {
        console.log('🎥 Displaying video result...');
        console.log('🎥 Video URL:', videoUrl);
        console.log('🎥 Video Result:', videoResult);
        
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
        
        // Set video source and show result container (legacy support)
        if (this.elements.videoSource && this.elements.videoPlayer) {
            this.elements.videoSource.src = videoSrc;
            this.elements.videoPlayer.load();
        }
        
        // Hide controls, show result (legacy support)
        if (this.elements.videoControls) {
            this.elements.videoControls.classList.add('hidden');
        }
        if (this.elements.videoResult) {
            this.elements.videoResult.classList.remove('hidden');
        }
        
        // Create complete video data for gallery
        const videoData = {
            video_url: videoSrc,
            videoUrl: videoSrc, // Alias for compatibility
            finalVideoSrc: videoSrc,
            animation_prompt: (this.elements.videoPrompt?.value || this.elements.animationPrompt?.value || '').trim(),
            prompt: (this.elements.videoPrompt?.value || this.elements.animationPrompt?.value || '').trim(), // Alias
            timestamp: Date.now(),
            success: true,
            // Include backend data if available
            ...(videoResult && videoResult.storage ? {
                key: videoResult.storage.s3_key,
                video_number: videoResult.storage.video_number,
                session_id: videoResult.storage.session_id
            } : {})
        };
        
        console.log('🎬 Adding video to gallery:', videoData);
        this.addVideoToGallery(videoData);
        
        console.log('✅ Video displayed successfully and added to gallery');
    }

    handleDownloadVideo() {
        // Try to get video URL from current gallery video or legacy video source
        let videoUrl;
        
        if (this.videoGallery.totalVideos > 0) {
            const currentVideo = this.videoGallery.videos[this.videoGallery.currentIndex];
            videoUrl = currentVideo?.videoUrl;
        }
        
        // Fallback to legacy video source
        if (!videoUrl && this.elements.videoSource) {
            videoUrl = this.elements.videoSource.src;
        }
        
        if (!videoUrl) {
            this.showError('No video available to download');
            return;
        }
        
        const link = document.createElement('a');
        link.href = videoUrl;
        link.download = `snapmagic-video-${Date.now()}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('💾 Video downloaded');
    }

    handleCreateAnotherVideo() {
        console.log('🔄 Creating another video - preserving gallery');
        
        // Navigate to video generation tab if not already there
        this.switchTab('video-generation');
        
        // IMPORTANT: Show the video prompt input area (it's hidden on login)
        const videoPromptInputArea = document.getElementById('videoPromptInput');
        if (videoPromptInputArea) {
            videoPromptInputArea.classList.remove('hidden');
        }
        
        // Scroll to the video prompt input area
        if (videoPromptInputArea) {
            videoPromptInputArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // Find the correct video prompt input (try both possible elements)
        let videoPromptElement = this.elements.videoPrompt || this.elements.animationPrompt;
        
        if (videoPromptElement) {
            // Clear any existing text (user can decide what to do)
            videoPromptElement.value = '';
            
            // Add yellow border highlight effect (not background)
            videoPromptElement.style.border = '3px solid #ffff00';
            videoPromptElement.style.boxShadow = '0 0 10px rgba(255, 255, 0, 0.5)';
            videoPromptElement.style.transition = 'border 0.3s ease, box-shadow 0.3s ease';
            
            // Focus the input
            videoPromptElement.focus();
            
            // Remove highlight after 3 seconds
            setTimeout(() => {
                videoPromptElement.style.border = '';
                videoPromptElement.style.boxShadow = '';
            }, 3000);
        }
        
        // Hide video result if showing
        if (this.elements.videoResult) {
            this.elements.videoResult.classList.add('hidden');
        }
        
        // Show video controls if hidden
        if (this.elements.videoControls) {
            this.elements.videoControls.classList.remove('hidden');
        }
    }

    // New Video System Methods
    updateVideoCharCount() {
        const videoPrompt = this.elements.videoPrompt;
        const videoCharCount = this.elements.videoCharCount;
        
        if (videoPrompt && videoCharCount) {
            const currentLength = videoPrompt.value.length;
            const maxLength = videoPrompt.getAttribute('maxlength') || 512;
            videoCharCount.textContent = `${currentLength}/${maxLength}`;
            
            // Color coding for character limit
            if (currentLength > maxLength * 0.9) {
                videoCharCount.style.color = '#ff6b6b';
            } else if (currentLength > maxLength * 0.7) {
                videoCharCount.style.color = '#ffa726';
            } else {
                videoCharCount.style.color = 'var(--text-cream)';
            }
        }
    }

    clearVideoPrompt() {
        if (this.elements.videoPrompt) {
            this.elements.videoPrompt.value = '';
            this.updateVideoCharCount();
        }
    }

    async handleGenerateVideoPrompt() {
        console.log('🎭 Generating video prompt from selected card');
        
        if (!this.generatedCardData) {
            this.showError('Please generate a card first');
            return;
        }

        // Ensure videoPrompt element exists
        if (!this.elements.videoPrompt) {
            console.error('❌ videoPrompt element not found');
            this.showError('Video prompt input not available');
            return;
        }

        try {
            this.showProcessing('Generating animation prompt...');
            
            console.log('🔍 DEBUG: Current card data structure:', {
                keys: Object.keys(this.generatedCardData),
                hasResult: !!this.generatedCardData.result,
                hasFinalImageSrc: !!this.generatedCardData.finalImageSrc,
                hasImageSrc: !!this.generatedCardData.imageSrc,
                resultLength: this.generatedCardData.result ? this.generatedCardData.result.length : 'N/A'
            });
            
            const apiBaseUrl = window.SNAPMAGIC_CONFIG.API_URL;
            const endpoint = `${apiBaseUrl}api/transform-card`;
            
            console.log('🔍 DEBUG: API endpoint:', endpoint);
            console.log('🔍 DEBUG: Auth token exists:', !!this.authToken);
            
            const cardData = await this.ensureCardDataForActions();
            
            console.log('🔍 DEBUG: Card data after ensureCardDataForActions:', {
                keys: Object.keys(cardData),
                hasResult: !!cardData.result,
                resultLength: cardData.result ? cardData.result.length : 'N/A',
                resultPreview: cardData.result ? cardData.result.substring(0, 50) + '...' : 'N/A'
            });
            
            const requestPayload = {
                action: 'generate_animation_prompt',
                card_image: cardData.result || cardData.finalImageBase64 || cardData.imageBase64 || cardData.image_base64,
                original_prompt: cardData.prompt || cardData.originalPrompt || ''
            };
            
            console.log('🔍 DEBUG: Request payload:', {
                action: requestPayload.action,
                hasCardImage: !!requestPayload.card_image,
                cardImageLength: requestPayload.card_image ? requestPayload.card_image.length : 'N/A',
                originalPrompt: requestPayload.original_prompt
            });
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: JSON.stringify(requestPayload)
            });

            console.log('🔍 DEBUG: Response status:', response.status);
            console.log('🔍 DEBUG: Response ok:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ DEBUG: Response error text:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            
            console.log('🔍 DEBUG: Response result:', result);
            
            if (result.success && result.animation_prompt) {
                this.elements.videoPrompt.value = result.animation_prompt;
                this.updateVideoCharCount();
                console.log('✅ Video prompt generated successfully');
            } else {
                throw new Error(result.error || 'Failed to generate video prompt');
            }
        } catch (error) {
            console.error('❌ Video prompt generation failed:', error);
            console.error('❌ Error stack:', error.stack);
            this.showError(`Failed to generate video prompt: ${error.message}`);
        } finally {
            this.hideProcessing();
        }
    }

    async handleOptimizeVideoPrompt() {
        console.log('⚡ Optimizing video prompt');
        
        // Ensure videoPrompt element exists
        if (!this.elements.videoPrompt) {
            console.error('❌ videoPrompt element not found');
            this.showError('Video prompt input not available');
            return;
        }
        
        const currentPrompt = this.elements.videoPrompt.value.trim();
        if (!currentPrompt) {
            this.showError('Please enter a video prompt to optimize');
            return;
        }

        if (!this.generatedCardData) {
            this.showError('Please generate a card first');
            return;
        }

        try {
            this.showProcessing('Optimizing animation prompt...');
            
            const apiBaseUrl = window.SNAPMAGIC_CONFIG.API_URL;
            const endpoint = `${apiBaseUrl}api/transform-card`;
            
            const cardData = await this.ensureCardDataForActions();
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: JSON.stringify({
                    action: 'optimize_animation_prompt',
                    user_prompt: currentPrompt,
                    card_image: cardData.result || cardData.finalImageBase64 || cardData.imageBase64 || cardData.image_base64,
                    original_prompt: cardData.prompt || cardData.originalPrompt || ''
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success && result.optimized_prompt) {
                this.elements.videoPrompt.value = result.optimized_prompt;
                this.updateVideoCharCount();
                console.log('✅ Video prompt optimized successfully');
            } else {
                throw new Error(result.error || 'Failed to optimize video prompt');
            }
        } catch (error) {
            console.error('❌ Video prompt optimization failed:', error);
            this.showError(`Failed to optimize video prompt: ${error.message}`);
        } finally {
            this.hideProcessing();
        }
    }

    setupVideoGalleryNavigation() {
        if (this.elements.videoGalleryPrevBtn) {
            this.elements.videoGalleryPrevBtn.addEventListener('click', () => this.navigateVideoGallery('prev'));
        }
        if (this.elements.videoGalleryNextBtn) {
            this.elements.videoGalleryNextBtn.addEventListener('click', () => this.navigateVideoGallery('next'));
        }
    }

    navigateVideoGallery(direction) {
        if (this.videoGallery.totalVideos === 0) return;
        
        if (direction === 'prev' && this.videoGallery.currentIndex > 0) {
            this.videoGallery.currentIndex--;
        } else if (direction === 'next' && this.videoGallery.currentIndex < this.videoGallery.totalVideos - 1) {
            this.videoGallery.currentIndex++;
        }
        
        this.updateVideoGalleryDisplay();
    }

    updateVideoGalleryDisplay() {
        console.log(`🎬 updateVideoGalleryDisplay called - ${this.videoGallery.totalVideos} videos`);
        
        if (this.videoGallery.totalVideos === 0) {
            console.log('📭 No videos - hiding gallery');
            if (this.elements.videoGallery) this.elements.videoGallery.classList.add('hidden');
            if (this.elements.noVideosPlaceholder) this.elements.noVideosPlaceholder.style.display = 'block';
            return;
        }

        console.log('🎬 Showing video gallery with videos');
        
        // CRITICAL: Show the video gallery container
        if (this.elements.videoGallery) {
            this.elements.videoGallery.classList.remove('hidden');
            console.log('✅ Video gallery container made visible');
        }
        
        // Hide the placeholder
        if (this.elements.noVideosPlaceholder) {
            this.elements.noVideosPlaceholder.style.display = 'none';
        }
        
        // Hide video counter text - dots already show position
        const videoGalleryCounter = document.getElementById('videoGalleryCounter');
        if (videoGalleryCounter) {
            videoGalleryCounter.style.display = 'none'; // Hide "Video X of Y" text
            console.log('✅ Video counter text hidden (dots show position instead)');
        }
        
        // Show gallery info
        const videoGalleryInfo = document.getElementById('videoGalleryInfo');
        if (videoGalleryInfo) {
            videoGalleryInfo.style.display = 'block';
            console.log('✅ Video gallery info made visible');
        } else {
            console.error('❌ videoGalleryInfo element not found');
        }
        
        const currentVideo = this.videoGallery.videos[this.videoGallery.currentIndex];
        if (currentVideo) {
            console.log('🎥 Displaying current video:', currentVideo);
            this.displayVideoInGallery(currentVideo);
        } else {
            console.error('❌ No current video found');
        }
        
        this.updateVideoGalleryNavigation();
    }

    displayVideoInGallery(videoData) {
        this.elements.videoResultContainer.innerHTML = `
            <video class="video-player" controls style="width: 100%; max-width: 100%; border-radius: 12px;">
                <source src="${videoData.videoUrl}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        `;
        
        this.elements.videoResultActions.classList.remove('hidden');
        this.elements.videoGalleryNavigation.classList.remove('hidden');
    }

    updateVideoGalleryNavigation() {
        // Show navigation if we have more than 1 video
        if (this.elements.videoGalleryNavigation && this.videoGallery.totalVideos > 1) {
            this.elements.videoGalleryNavigation.classList.remove('hidden');
        } else if (this.elements.videoGalleryNavigation) {
            this.elements.videoGalleryNavigation.classList.add('hidden');
        }
        
        // Update navigation buttons
        if (this.elements.videoGalleryPrevBtn) {
            this.elements.videoGalleryPrevBtn.disabled = this.videoGallery.currentIndex === 0;
        }
        if (this.elements.videoGalleryNextBtn) {
            this.elements.videoGalleryNextBtn.disabled = this.videoGallery.currentIndex === this.videoGallery.totalVideos - 1;
        }
        
        // VIDEO CAROUSEL SHOULD ONLY HAVE DOTS (NOT NUMBERS)
        // Remove number buttons - video gallery uses dots only
        const videoGalleryNumbers = document.getElementById('videoGalleryNumbers');
        if (videoGalleryNumbers) {
            videoGalleryNumbers.innerHTML = ''; // Clear any numbers
            videoGalleryNumbers.style.display = 'none'; // Hide numbers section
        }
        
        // Update dots (this is what video carousel should show)
        this.updateVideoGalleryDots();
    }

    updateVideoGalleryDots() {
        if (!this.elements.videoGalleryDots) return;
        
        this.elements.videoGalleryDots.innerHTML = '';
        
        for (let i = 0; i < this.videoGallery.totalVideos; i++) {
            const dot = document.createElement('div');
            dot.className = `gallery-dot ${i === this.videoGallery.currentIndex ? 'active' : ''}`;
            dot.addEventListener('click', () => {
                this.videoGallery.currentIndex = i;
                this.updateVideoGalleryDisplay();
            });
            this.elements.videoGalleryDots.appendChild(dot);
        }
    }

    addVideoToGallery(videoData) {
        this.videoGallery.videos.push(videoData);
        this.videoGallery.totalVideos = this.videoGallery.videos.length;
        this.videoGallery.currentIndex = this.videoGallery.totalVideos - 1; // Show newest video
        
        this.updateVideoGalleryDisplay();
        console.log(`📹 Video added to gallery. Total: ${this.videoGallery.totalVideos}`);
    }

    // ========================================
    // ANIMATED GIF GENERATION CORE FUNCTIONS
    // ========================================
    
    /**
     * Generate animated GIF using canvas-based holographic card renderer
     */
    /**
     * 🎯 PARALLEL SYSTEM: Generate animated GIF using canvas-based holographic card renderer
     * Flexible dimensions, works with gallery switching
     */
    async generateAnimatedCardGIF(cardData, options = {}) {
        const { 
            frames = 7,      // OPTIMIZED: Dramatic file size reduction (was 20)
            framerate = 8    // SUBTLE: Slower playback for gentle effect (was 10)
        } = options;
        
        console.log(`🎬 Starting canvas-based animated GIF generation with optimized settings...`);
        console.log(`⚡ OPTIMIZED: ${frames} frames @ ${framerate}fps + quality 1 (target: <3MB)`);
        console.log('🔍 DEBUG: cardData structure for canvas:', {
            keys: Object.keys(cardData),
            userName: cardData.userName,
            user_name: cardData.user_name,
            prompt: cardData.prompt,
            hasResult: !!cardData.result
        });
        
        // Use current card data directly - no S3 URL conversion needed for canvas rendering
        const activeCardData = this.generatedCardData;
        
        if (!activeCardData) {
            throw new Error('No card data available');
        }
        
        console.log('✅ Using card data directly for canvas rendering (no S3 fetch needed)');
        
        // Initialize holographic canvas renderer with configurable dimensions
        const renderer = new HolographicCanvasRenderer();
        
        // Generate animated GIF with optimized dimensions - NO FALLBACK
        const gifBlob = await renderer.generateAnimatedGIF(activeCardData, {
            frames,
            framerate,
            quality: 1 // MAXIMUM quality for crisp visuals
        });
        
        console.log('✅ Canvas animated GIF created:', { 
            size: Math.round(gifBlob.size / 1024) + 'KB',
            dimensions: 'Natural card size in 1080×1080 background',
            frames: frames,
            framerate: framerate,
            method: 'Canvas-based (no fallback)',
            system: 'Direct HolographicCanvasRenderer'
        });
        
        return gifBlob;
    }

    /**
     * 🎯 PARALLEL SYSTEM: Generate animated GIF using hidden card approach
     * Flexible dimensions, premium quality, works with gallery switching
     */
    async generateAnimatedCardGIFHTML2Canvas(cardData, options = {}) {
        const { 
            width = 275, 
            height = 358,
            frames = 30,
            framerate = 15
        } = options;
        
        console.log(`🎬 Starting PARALLEL SYSTEM animated GIF generation (${width}×${height})...`);
        
        try {
            // Load HTML2Canvas library
            await this.loadHTML2CanvasLibrary();
            
            // Get current active card data (works for new cards and gallery cards)
            const activeCardData = await this.ensureCardDataForActions();
            
            // Create hidden card system for GIF capture
            const hiddenSystem = this.createHiddenCardForGIF(activeCardData, { width, height });
            const { container, card, cleanup } = hiddenSystem;
            
            // Wait for images and CSS to load in hidden card
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Animation settings
            const totalFrames = frames;
            const frameDuration = Math.round(1000 / framerate); // Convert to ms
            
            // Store original animation state
            const originalAnimationPlayState = card.style.animationPlayState;
            const originalAnimationDelay = card.style.animationDelay;
            
            // Generate frames by capturing CSS animation states
            const capturedFrames = [];
            for (let frame = 0; frame < totalFrames; frame++) {
                const progress = Math.round((frame / totalFrames) * 100);
                console.log(`📸 Capturing frame ${frame + 1}/${totalFrames} (${progress}%) at ${width}×${height}`);
                
                // Set animation to specific frame
                const animationProgress = frame / totalFrames;
                const animationDelay = -(animationProgress * 8000); // 8s animation cycle
                
                card.style.animationPlayState = 'paused';
                card.style.animationDelay = `${animationDelay}ms`;
                
                // Force reflow to apply animation state
                card.offsetHeight;
                
                // Wait for animation state to settle
                await new Promise(resolve => setTimeout(resolve, 50));
                
                // Capture the hidden card at exact dimensions
                const canvas = await html2canvas(card, {
                    width: width,
                    height: height,
                    scale: 1,
                    useCORS: false,
                    allowTaint: true,
                    backgroundColor: null,
                    logging: false,
                    onclone: (clonedDoc) => {
                        // Ensure animation state is applied in cloned document
                        const clonedCard = clonedDoc.querySelector('.snapmagic-card');
                        if (clonedCard) {
                            clonedCard.style.animationPlayState = 'paused';
                            clonedCard.style.animationDelay = `${animationDelay}ms`;
                            // Force exact dimensions in clone
                            clonedCard.style.width = `${width}px`;
                            clonedCard.style.height = `${height}px`;
                            clonedCard.style.aspectRatio = 'unset';
                        }
                    }
                });
                
                // Verify canvas dimensions and resize if needed
                let finalCanvas = canvas;
                if (canvas.width !== width || canvas.height !== height) {
                    console.log(`📏 Resizing canvas from ${canvas.width}×${canvas.height} to ${width}×${height}`);
                    finalCanvas = document.createElement('canvas');
                    finalCanvas.width = width;
                    finalCanvas.height = height;
                    const ctx = finalCanvas.getContext('2d');
                    
                    // Use high-quality scaling
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(canvas, 0, 0, width, height);
                }
                
                // Convert to data URL with maximum quality
                const frameDataURL = finalCanvas.toDataURL('image/png', 1.0);
                capturedFrames.push(frameDataURL);
            }
            
            // Restore original animation state
            card.style.animationPlayState = originalAnimationPlayState;
            card.style.animationDelay = originalAnimationDelay;
            
            // Clean up hidden system
            cleanup();
            
            console.log(`🎬 All frames captured at ${width}×${height}, creating GIF...`);
            
            // Create GIF from captured frames
            const gifBlob = await this.createGIFFromFrames(capturedFrames, frameDuration);
            
            console.log('✅ PARALLEL SYSTEM animated GIF created:', { 
                size: Math.round(gifBlob.size / 1024) + 'KB',
                dimensions: `${width}×${height}`,
                frames: totalFrames,
                quality: 'Maximum (parallel hidden system)',
                system: 'Flexible & Gallery Compatible'
            });
            
            return gifBlob;
            
        } catch (error) {
            console.error('❌ PARALLEL SYSTEM animated GIF generation failed:', error);
            throw error;
        }
    }
    
    /**
     * Load HTML2Canvas library dynamically
     */
    async loadHTML2CanvasLibrary() {
        if (window.html2canvas) {
            return; // Already loaded
        }
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = () => {
                console.log('✅ HTML2Canvas library loaded');
                resolve();
            };
            script.onerror = () => {
                reject(new Error('Failed to load HTML2Canvas library'));
            };
            document.head.appendChild(script);
        });
    }
    
    /**
     * Create GIF from frame images using local gif.js library
     */
    async createGIFFromFrames(frames, frameDuration) {
        console.log('🎬 Creating GIF from', frames.length, 'frames...');
        
        // Load gif.js library from local file
        await this.loadGifJSLibrary();
        
        return new Promise((resolve, reject) => {
            const gif = new GIF({
                workers: 2,
                quality: 1, // Highest quality possible (1 = best quality)
                // Removed: width: 400 - let it use natural card size
                // Removed: height: 600 - let it use natural card size
                workerScript: '/gif.worker.js', // Use local worker file
                comment: 'SnapMagic Animated Trading Card - Highest Quality'
            });
            
            let loadedFrames = 0;
            
            // Add frames to GIF
            frames.forEach((frameDataURL, index) => {
                const img = new Image();
                img.onload = () => {
                    gif.addFrame(img, { delay: frameDuration });
                    loadedFrames++;
                    
                    // Start rendering when all frames are loaded
                    if (loadedFrames === frames.length) {
                        gif.render();
                    }
                };
                img.src = frameDataURL;
            });
            
            // Handle GIF completion
            gif.on('finished', (blob) => {
                console.log('✅ GIF rendering completed');
                resolve(blob);
            });
            
            gif.on('progress', (progress) => {
                console.log(`🎬 GIF rendering: ${Math.round(progress * 100)}%`);
            });
        });
    }
    
    /**
     * Load gif.js library from local file
     */
    async loadGifJSLibrary() {
        if (window.GIF) {
            return; // Already loaded
        }
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = '/gif.min.js'; // Use local file instead of CDN
            script.onload = () => {
                console.log('✅ gif.js library loaded from local file');
                resolve();
            };
            script.onerror = () => {
                reject(new Error('Failed to load local gif.js library'));
            };
            document.head.appendChild(script);
        });
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

    /**
     * Show visual feedback by highlighting and focusing text box
     */
    showTextBoxFeedback(textareaId) {
        const textarea = document.getElementById(textareaId);
        if (textarea) {
            // Add highlight animation
            textarea.classList.add('textarea-highlight');
            
            // Focus the textarea
            textarea.focus();
            
            // Remove animation class after animation completes
            setTimeout(() => {
                textarea.classList.remove('textarea-highlight');
            }, 1500);
        }
    }

    /**
     * Show proper error modal with OK button
     */
    showErrorModal(title, message) {
        const modalHtml = `
            <div id="errorModal" class="modal">
                <div class="modal-content" style="border: 3px solid #e53e3e;">
                    <h3>⚠️ ${title}</h3>
                    <p style="white-space: pre-line;">${message}</p>
                    <div class="modal-buttons">
                        <button id="errorModalOkBtn" class="art-deco-btn">OK</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Setup event listener
        document.getElementById('errorModalOkBtn').addEventListener('click', () => {
            const modal = document.getElementById('errorModal');
            if (modal) {
                modal.remove();
            }
        });
    }

    /**
     * Show proper success modal with OK button
     */
    showSuccessModal(title, message) {
        const modalHtml = `
            <div id="successModal" class="modal">
                <div class="modal-content" style="border: 3px solid #38a169;">
                    <h3>✅ ${title}</h3>
                    <p style="white-space: pre-line;">${message}</p>
                    <div class="modal-buttons">
                        <button id="successModalOkBtn" class="art-deco-btn">OK</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Setup event listener
        document.getElementById('successModalOkBtn').addEventListener('click', () => {
            const modal = document.getElementById('successModal');
            if (modal) {
                modal.remove();
            }
        });
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
    
    /**
     * Update Line 1 character count display
     */
    updateLine1CharacterCount() {
        const nameInput = this.elements.nameInputLine1;
        const charCount = this.elements.line1CharCount;
        
        if (!nameInput || !charCount) return;
        
        const currentLength = nameInput.value.length;
        const maxLength = 11;
        
        charCount.textContent = `${currentLength}/${maxLength}`;
        
        // Add warning class when approaching limit
        if (currentLength >= 9) {
            charCount.classList.add('warning');
        } else {
            charCount.classList.remove('warning');
        }
    }

    /**
     * Update Line 2 character count display
     */
    updateLine2CharacterCount() {
        const nameInput = this.elements.nameInputLine2;
        const charCount = this.elements.line2CharCount;
        
        if (!nameInput || !charCount) return;
        
        const currentLength = nameInput.value.length;
        const maxLength = 11;
        
        charCount.textContent = `${currentLength}/${maxLength}`;
        
        // Add warning class when approaching limit
        if (currentLength >= 9) {
            charCount.classList.add('warning');
        } else {
            charCount.classList.remove('warning');
        }
    }

    /**
     * Update both character counts
     */
    updateNameCharacterCount() {
        this.updateLine1CharacterCount();
        this.updateLine2CharacterCount();
    }

    // Name Input Modal Functions
    showNameInputModal() {
        this.elements.nameInputLine1.value = '';
        this.elements.nameInputLine2.value = '';
        this.elements.nameInputModal.classList.remove('hidden');
        this.elements.nameInputLine1.focus();
        this.updateNameCharacterCount(); // Reset character counters
    }
    
    hideNameInputModal() {
        this.elements.nameInputModal.classList.add('hidden');
    }
    
    showNameConfirmModal(name) {
        this.elements.namePreview.textContent = name ? name.toUpperCase() : 'NOVA';
        this.elements.nameConfirmModal.classList.remove('hidden');
    }
    
    hideNameConfirmModal() {
        this.elements.nameConfirmModal.classList.add('hidden');
    }
    
    handleNameConfirm() {
        const line1 = this.elements.nameInputLine1.value.trim();
        const line2 = this.elements.nameInputLine2.value.trim();
        
        // Combine lines with space if both exist
        let enteredName = line1;
        if (line2) {
            enteredName += ' ' + line2;
        }
        
        // Use NOVA if no name entered
        if (!enteredName) {
            enteredName = 'NOVA';
        }
        
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
        
        // Split the pending name back into lines for editing
        const nameParts = this.pendingName.split(' ');
        if (nameParts.length >= 2) {
            this.elements.nameInputLine1.value = nameParts[0];
            this.elements.nameInputLine2.value = nameParts.slice(1).join(' ').substring(0, 11);
        } else {
            this.elements.nameInputLine1.value = this.pendingName;
            this.elements.nameInputLine2.value = '';
        }
        
        this.elements.nameInputModal.classList.remove('hidden');
        this.elements.nameInputLine1.focus();
        this.updateNameCharacterCount();
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
        
        // Get the AI image for template recreation
        const aiImageSrc = this.generatedCardData.finalImageSrc || 
                          this.generatedCardData.imageSrc || 
                          `data:image/png;base64,${this.generatedCardData.result}`;
        
        // Extract user info from stored data (if available)
        const userName = this.generatedCardData.userName || this.generatedCardData.user_name || 'NOVA';
        const userPrompt = this.generatedCardData.prompt || this.generatedCardData.userPrompt || 'AI Generated Card';
        
        // CRITICAL FIX: Use the same template system as new cards
        const cardHTML = this.createHolographicCard(aiImageSrc, userName, userPrompt);
        
        // Display with full template (same as new cards)
        this.elements.resultContainer.innerHTML = cardHTML;
        
        // Show action buttons for gallery cards (same as newly generated cards)
        this.elements.resultActions.classList.remove('hidden');
        
        // Update gallery navigation display
        this.updateGalleryDisplay();
        
        console.log('✅ Gallery card displayed with full template - consistent with new cards');
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
            console.log('🔗 Image URL:', imageUrl);
            
            // Check if URL is already base64 data
            if (imageUrl.startsWith('data:image/')) {
                console.log('✅ URL is already base64 data, extracting...');
                const base64 = imageUrl.split(',')[1];
                return base64;
            }
            
            console.log('📡 Fetching image from URL...');
            const response = await fetch(imageUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            console.log('✅ Image fetched successfully, converting to blob...');
            const blob = await response.blob();
            
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    // Remove the data:image/png;base64, prefix to get just the base64 data
                    const base64 = reader.result.split(',')[1];
                    console.log('✅ Image converted to base64, length:', base64.length);
                    resolve(base64);
                };
                reader.onerror = (error) => {
                    console.error('❌ FileReader error:', error);
                    reject(error);
                };
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('❌ Failed to convert image URL to base64:', error);
            console.error('❌ Error details:', {
                message: error.message,
                type: error.constructor.name,
                url: imageUrl
            });
            throw new Error(`Image conversion failed: ${error.message}`);
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
            
            try {
                const imageUrl = this.generatedCardData.finalImageSrc || this.generatedCardData.imageSrc;
                const base64Data = await this.convertImageUrlToBase64(imageUrl);
                
                // Create a complete card data object with base64
                return {
                    ...this.generatedCardData,
                    result: base64Data,
                    finalImageBase64: base64Data
                };
            } catch (conversionError) {
                console.error('❌ Image URL conversion failed:', conversionError);
                console.log('🔄 Falling back to raw result data...');
                
                // Fallback: try to use raw result if available
                if (this.generatedCardData.result && this.generatedCardData.result.length > 100) {
                    return this.generatedCardData;
                }
                
                throw new Error(`Cannot access card image. URL conversion failed: ${conversionError.message}`);
            }
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
                    
                    // Get the AI image for template recreation
                    const aiImageSrc = this.generatedCardData.finalImageSrc || 
                                      this.generatedCardData.imageSrc || 
                                      `data:image/png;base64,${this.generatedCardData.result}`;
                    
                    // Extract user info from stored data (if available)
                    const userName = this.generatedCardData.userName || this.generatedCardData.user_name || 'NOVA';
                    const userPrompt = this.generatedCardData.prompt || this.generatedCardData.userPrompt || 'AI Generated Card';
                    
                    // CRITICAL FIX: Use the same template system as new cards
                    const cardHTML = this.createHolographicCard(aiImageSrc, userName, userPrompt);
                    
                    // Display with full template (same as new cards)
                    this.elements.resultContainer.innerHTML = cardHTML;
                    
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
     * Load existing videos from S3 for current session - EXACTLY LIKE CARDS
     */
    async loadExistingVideos() {
        try {
            console.log('📹 Loading existing videos from session...');
            
            const apiBaseUrl = window.SNAPMAGIC_CONFIG.API_URL;
            console.log('🔗 API Base URL:', apiBaseUrl);
            
            const response = await fetch(`${apiBaseUrl}api/transform-card`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`,
                    'X-Device-ID': this.deviceId
                },
                body: JSON.stringify({ action: 'load_session_videos' })
            });

            console.log('📡 Response status:', response.status);
            const data = await response.json();
            console.log('📦 Response data:', data);
            
            if (data.success && data.videos && data.videos.length > 0) {
                console.log(`✅ Found ${data.videos.length} existing videos`);
                
                // Load videos into gallery (newest first, so reverse to show oldest first in gallery)
                this.videoGallery.videos = data.videos.reverse();
                this.videoGallery.totalVideos = data.videos.length;
                this.videoGallery.currentIndex = this.videoGallery.totalVideos - 1; // Show newest video
                
                console.log('🎬 Video gallery state:', {
                    totalVideos: this.videoGallery.totalVideos,
                    currentIndex: this.videoGallery.currentIndex,
                    videos: this.videoGallery.videos
                });
                
                // Update video gallery display
                console.log('🔄 Calling updateVideoGalleryDisplay...');
                this.updateVideoGalleryDisplay();
                
                // CRITICAL: Also ensure video tab shows the gallery if it's currently active
                const videoTab = document.querySelector('[data-tab="video-generation"]');
                if (videoTab && videoTab.classList.contains('active')) {
                    console.log('🎬 Video tab is active - ensuring gallery is visible');
                    this.updateVideoGalleryDisplay();
                }
                
                console.log(`🎬 Loaded ${this.videoGallery.totalVideos} videos into gallery`);
                console.log(`🎬 Displaying most recent video (${this.videoGallery.currentIndex + 1} of ${this.videoGallery.totalVideos})`);
            } else {
                console.log('📭 No existing videos found for this session');
                console.log('📊 Response details:', data);
            }
        } catch (error) {
            console.error('❌ Error loading existing videos:', error);
            // Don't show error to user - just continue without loading videos
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
     * REMOVED - No longer needed since video card selection section was removed
     */
    /*
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
    */

    /**
     * Show specific card from video gallery
     * REMOVED - No longer needed since video card selection section was removed
     */
    /*
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
    */

    /**
     * Jump directly to specific card number in video gallery
     * REMOVED - No longer needed since video card selection section was removed
     */
    /*
    jumpToVideoCard(cardNumber) {
        const cardIndex = cardNumber - 1; // Convert to 0-based index
        this.showVideoCardFromGallery(cardIndex);
    }
    */

    /**
     * Show video gallery navigation (when user has multiple cards)
     * REMOVED - No longer needed since video card selection section was removed
     */
    /*
    showVideoGalleryNavigation() {
        const galleryNav = document.getElementById('videoGalleryNavigation');
        if (galleryNav && this.userGallery.totalCards > 1) {
            galleryNav.classList.remove('hidden');
        }
    }
    */

    /**
     * Hide video gallery navigation
     * REMOVED - No longer needed since video card selection section was removed
     */
    /*
    hideVideoGalleryNavigation() {
        const galleryNav = document.getElementById('videoGalleryNavigation');
        if (galleryNav) {
            galleryNav.classList.add('hidden');
        }
    }
    */

    /**
     * Initialize video tab with gallery
     */
    initializeVideoGallery() {
        console.log('🎬 initializeVideoGallery called');
        console.log('📊 Video gallery state:', {
            totalVideos: this.videoGallery.totalVideos,
            totalCards: this.userGallery.totalCards,
            videos: this.videoGallery.videos
        });
        
        // CRITICAL FIX: Check if we have existing videos and show them
        if (this.videoGallery.totalVideos > 0) {
            console.log(`🎬 Found ${this.videoGallery.totalVideos} existing videos - showing gallery`);
            this.updateVideoGalleryDisplay();
        } else {
            console.log('📭 No existing videos found');
        }
        
        if (this.userGallery.totalCards > 0) {
            // Show the most recent card by default
            this.userGallery.currentIndex = this.userGallery.totalCards - 1;
            console.log(`🎬 Video gallery initialized with ${this.userGallery.totalCards} cards`);
        } else {
            console.log('📭 No cards available for video generation');
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
                
                // Show visual feedback instead of popup
                this.showTextBoxFeedback('animationPrompt');
                
                console.log('✅ Animation prompt generated:', data.animation_prompt);
                
            } else {
                console.error('❌ Animation prompt generation failed:', data.error);
                this.showErrorModal('Animation Prompt Generation Failed', data.error || 'Failed to generate animation prompt. Please try again.');
            }
            
        } catch (error) {
            console.error('❌ Animation prompt generation error:', error);
            this.showErrorModal('Animation Prompt Generation Failed', 'Failed to generate animation prompt. Please try again.');
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
        
        // Button workflow prevents this scenario - no validation needed
        
        if (!this.generatedCardData) {
            this.showErrorModal('No Card Selected', 'Please generate a card first before optimizing animation prompts.');
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
                
                // Show visual feedback instead of popup
                this.showTextBoxFeedback('animationPrompt');
                
                console.log('✅ Animation prompt optimized:', data.optimized_prompt);
                
            } else {
                console.error('❌ Animation prompt optimization failed:', data.error);
                this.showErrorModal('Animation Prompt Optimization Failed', data.error || 'Failed to optimize animation prompt. Please try again.');
            }
            
        } catch (error) {
            console.error('❌ Animation prompt optimization error:', error);
            this.showErrorModal('Animation Prompt Optimization Failed', 'Failed to optimize animation prompt. Please try again.');
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
                            <span class="step-text">Click "Share on LinkedIn" to open LinkedIn</span>
                        </div>
                        <div class="step-item">
                            <span class="step-number">2</span>
                            <span class="step-text">The post text will be pre-filled for you</span>
                        </div>
                        <div class="step-item">
                            <span class="step-number">3</span>
                            <span class="step-text">Add your card image manually using LinkedIn's "Add media" option</span>
                        </div>
                    </div>

                    <div class="linkedin-buttons">
                        <button id="downloadAnimatedGifLinkedIn" class="art-deco-btn">🎬 Download Card</button>
                        <button id="shareToLinkedIn" class="art-deco-btn">📱 Share on LinkedIn</button>
                    </div>
                    
                    <div class="modal-buttons">
                        <button id="cancelLinkedInSharing" class="art-deco-btn">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Setup event listeners
        document.getElementById('downloadAnimatedGifLinkedIn').addEventListener('click', () => {
            this.handleDownloadAnimatedGIF();
        });
        
        document.getElementById('shareToLinkedIn').addEventListener('click', () => {
            this.openLinkedInForSharing();
        });
        
        document.getElementById('cancelLinkedInSharing').addEventListener('click', () => {
            this.closeLinkedInSharingPopup();
        });
    }


    /**
     * Open LinkedIn with clean post text (no URL)
     */
    openLinkedInForSharing() {
        // Get event name from template configuration and LinkedIn mentions from app configuration
        let eventName = 'AWS events'; // Default fallback
        let linkedinMentions = {
            eventOrganizer: { enabled: false, name: '', handle: '' },
            partnerOrCustomer: { enabled: false, name: '', handle: '' }
        };
        
        try {
            // Get event name from template config
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
            
            // Get LinkedIn mentions from app config
            if (window.SNAPMAGIC_CONFIG && window.SNAPMAGIC_CONFIG.APP_CONFIG) {
                let appConfig;
                if (typeof window.SNAPMAGIC_CONFIG.APP_CONFIG === 'string') {
                    appConfig = JSON.parse(window.SNAPMAGIC_CONFIG.APP_CONFIG);
                } else {
                    appConfig = window.SNAPMAGIC_CONFIG.APP_CONFIG;
                }
                
                if (appConfig && appConfig.linkedinMentions) {
                    linkedinMentions = appConfig.linkedinMentions;
                }
            }
        } catch (error) {
            console.warn('Could not parse configuration for event name or LinkedIn mentions:', error);
        }
        
        console.log('🎯 Using event name for LinkedIn:', eventName);
        console.log('🎯 Using LinkedIn mentions:', linkedinMentions);
        
        // Generate clean share text with LinkedIn mentions
        const eventHashtag = eventName.replace(/[^a-zA-Z0-9]/g, '');
        
        // Build LinkedIn mentions dynamically
        let mentionText = '';
        
        // Add event organizer mention if enabled
        if (linkedinMentions.eventOrganizer && linkedinMentions.eventOrganizer.enabled) {
            mentionText += ` @${linkedinMentions.eventOrganizer.name}`;
        }
        
        // Add partner/customer mention if enabled
        if (linkedinMentions.partnerOrCustomer && linkedinMentions.partnerOrCustomer.enabled) {
            mentionText += ` @${linkedinMentions.partnerOrCustomer.name}`;
        }
        
        // Fixed SnapMagic mention (hardcoded handle - will be updated when you provide it)
        const snapmagicHandle = 'SnapMagic'; // TODO: Replace with actual LinkedIn handle when provided
        
        const shareText = `🎴✨ Just created my AI-powered trading card with @${snapmagicHandle} - Powered by AWS! Generated using Amazon Bedrock Nova Canvas at ${eventName}.${mentionText} #SnapMagic #AI #TradingCards #${eventHashtag} #AmazonBedrock #Nova #Innovation`;
        
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

// Service Worker registration removed - was causing 404 errors
// PWA functionality disabled until sw.js file is created
