/**
 * SnapMagic Modern App Entry Point
 * Uses Amplify SDK v6 with latest patterns
 */

// Import modern Amplify modules
import './amplify.js'; // Initialize Amplify
import { signIn, signOut, getCurrentUser } from './amplify.js';

// App state management
class SnapMagicApp {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    async init() {
        console.log('🎉 SnapMagic Gen 2 App Initializing...');
        
        // Check authentication status
        await this.checkAuthStatus();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Display device information
        this.displayDeviceInfo();
        
        // Add magical effects
        this.addMagicalEffects();
        
        console.log('✅ SnapMagic App Ready!');
    }

    async checkAuthStatus() {
        try {
            this.currentUser = await getCurrentUser();
            this.isAuthenticated = true;
            console.log('✅ User authenticated:', this.currentUser.username);
            this.showMainApp();
        } catch (error) {
            console.log('ℹ️ User not authenticated, showing login');
            this.isAuthenticated = false;
            this.showLoginScreen();
        }
    }

    setupEventListeners() {
        // Login form handling
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Feature buttons
        const transformPictureBtn = document.getElementById('transformPictureBtn');
        const transformVideoBtn = document.getElementById('transformVideoBtn');
        const rateExperienceBtn = document.getElementById('rateExperienceBtn');

        if (transformPictureBtn) {
            transformPictureBtn.addEventListener('click', () => this.handleTransformPicture());
        }
        if (transformVideoBtn) {
            transformVideoBtn.addEventListener('click', () => this.handleTransformVideo());
        }
        if (rateExperienceBtn) {
            rateExperienceBtn.addEventListener('click', () => this.handleRateExperience());
        }

        // Mobile navigation
        this.setupMobileNavigation();
        
        // Window resize handler
        window.addEventListener('resize', () => this.displayDeviceInfo());
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const loginError = document.getElementById('loginError');
        
        try {
            loginError.textContent = '';
            console.log('🔐 Attempting login...');
            
            // Use modern Amplify Auth
            const user = await signIn({ username, password });
            
            this.currentUser = user;
            this.isAuthenticated = true;
            
            console.log('✅ Login successful');
            this.showMainApp();
            
        } catch (error) {
            console.error('❌ Login failed:', error);
            loginError.textContent = 'Login failed. Please check your credentials.';
        }
    }

    async handleLogout() {
        try {
            await signOut();
            this.currentUser = null;
            this.isAuthenticated = false;
            console.log('✅ Logout successful');
            this.showLoginScreen();
        } catch (error) {
            console.error('❌ Logout failed:', error);
        }
    }

    showLoginScreen() {
        const loginScreen = document.getElementById('loginScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (loginScreen) loginScreen.style.display = 'flex';
        if (mainApp) mainApp.style.display = 'none';
    }

    showMainApp() {
        const loginScreen = document.getElementById('loginScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (loginScreen) loginScreen.style.display = 'none';
        if (mainApp) mainApp.style.display = 'block';
        
        // Update user info
        const userInfo = document.getElementById('userInfo');
        if (userInfo && this.currentUser) {
            userInfo.textContent = `Welcome, ${this.currentUser.username}!`;
        }
    }

    // Feature handlers (placeholders for now)
    handleTransformPicture() {
        console.log('🖼️ Transform Picture feature clicked');
        // TODO: Implement with Bedrock Nova Canvas
        alert('Transform Picture feature coming soon!');
    }

    handleTransformVideo() {
        console.log('🎥 Transform Video feature clicked');
        // TODO: Implement with Bedrock Nova Reel
        alert('Transform Video feature coming soon!');
    }

    handleRateExperience() {
        console.log('👍 Rate Experience feature clicked');
        // TODO: Implement with Rekognition
        alert('Rate Experience feature coming soon!');
    }

    setupMobileNavigation() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', function() {
                navMenu.classList.toggle('active');
                const icon = navToggle.textContent;
                navToggle.textContent = icon === '☰' ? '✕' : '☰';
            });
        }
    }

    displayDeviceInfo() {
        const deviceInfo = document.getElementById('deviceInfo');
        if (!deviceInfo) return;
        
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const deviceType = this.getDeviceType(screenWidth);
        
        deviceInfo.innerHTML = `
            <strong>Device:</strong> ${deviceType}<br>
            <strong>Screen:</strong> ${screenWidth} × ${screenHeight}<br>
            <strong>Status:</strong> ${this.isAuthenticated ? '🟢 Authenticated' : '🔴 Not Authenticated'}
        `;
    }

    getDeviceType(width) {
        if (width < 768) return '📱 Mobile';
        if (width < 1024) return '📱 Tablet';
        if (width < 1920) return '💻 Desktop';
        return '📺 Large Screen';
    }

    addMagicalEffects() {
        // Add some visual flair
        console.log(`
        ╔══════════════════════════════════════╗
        ║            SNAPMAGIC                 ║
        ║         Gen 2 Ready! ✨              ║
        ║                                      ║
        ║  📱 Mobile Ready                     ║
        ║  💻 Desktop Optimized                ║
        ║  🔐 Modern Auth                      ║
        ║  ⚡ Amplify SDK v6                   ║
        ╚══════════════════════════════════════╝
        `);
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.snapMagicApp = new SnapMagicApp();
});

// Export for potential module usage
export default SnapMagicApp;
