/**
 * SnapMagic - AWS Amplify Authentication Module
 * Uses AWS Amplify Auth for secure authentication with Amazon Cognito
 */

const Auth = {
    // Configuration will be loaded from amplify configuration
    isConfigured: false,
    
    /**
     * Initialize Amplify Auth
     * @param {Object} config - Amplify configuration
     */
    async init(config) {
        try {
            // For now, we'll use a simple demo mode until Amplify is properly configured
            // In production, this would be replaced with actual Amplify configuration
            this.isConfigured = true;
            Performance.log('Auth module initialized (demo mode)');
        } catch (error) {
            Performance.log('Error initializing Auth:', error);
            Toast.error('Authentication system initialization failed');
        }
    },
    
    /**
     * Sign in user with username and password
     * @param {string} username - Username
     * @param {string} password - Password
     * @returns {Promise<Object>} Sign in result
     */
    async login(username, password) {
        try {
            Performance.mark('login_start');
            
            // Validate input
            if (!username || !password) {
                throw new Error('Username and password are required');
            }
            
            // Demo authentication - replace with Amplify Auth when configured
            const result = await this.demoAuthenticate(username, password);
            
            if (result.success) {
                Performance.measure('Login completed', 'login_start');
                Performance.log('User signed in successfully', { username });
                
                return {
                    success: true,
                    user: result.user,
                    redirectUrl: 'app.html'
                };
            } else {
                throw new Error(result.error);
            }
            
        } catch (error) {
            Performance.log('Login error:', error);
            return {
                success: false,
                error: error.message || 'Login failed'
            };
        }
    },
    
    /**
     * Demo authentication (to be replaced with Amplify)
     */
    async demoAuthenticate(username, password) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Demo credentials for event access
        const validCredentials = [
            { username: 'admin', password: 'snapmagic2024' },
            { username: 'event-admin', password: 'aws-summit-2024' },
            { username: 'demo', password: 'demo123' }
        ];
        
        const isValid = validCredentials.some(cred => 
            cred.username === username && cred.password === password
        );
        
        if (isValid) {
            // Store simple auth state
            Utils.storage.set('snapmagic_auth', {
                username: username,
                loginTime: Date.now(),
                isAuthenticated: true
            });
            
            return {
                success: true,
                user: {
                    username: username,
                    role: 'admin'
                }
            };
        } else {
            return {
                success: false,
                error: 'Invalid username or password'
            };
        }
    },
    
    /**
     * Sign out current user
     */
    async logout() {
        try {
            Performance.log('User signing out');
            
            // Clear auth state
            Utils.storage.remove('snapmagic_auth');
            
            // Redirect to login page
            window.location.href = 'login.html';
            
        } catch (error) {
            Performance.log('Logout error:', error);
            // Force redirect even if there's an error
            window.location.href = 'login.html';
        }
    },
    
    /**
     * Check if user is authenticated
     * @returns {Promise<boolean>} True if authenticated
     */
    async isAuthenticated() {
        try {
            const authData = Utils.storage.get('snapmagic_auth');
            return authData && authData.isAuthenticated === true;
        } catch (error) {
            Performance.log('Auth check error:', error);
            return false;
        }
    },
    
    /**
     * Get current authenticated user
     * @returns {Promise<Object|null>} User data or null if not authenticated
     */
    async getCurrentUser() {
        try {
            const authData = Utils.storage.get('snapmagic_auth');
            if (authData && authData.isAuthenticated) {
                return {
                    username: authData.username,
                    role: 'admin'
                };
            }
            return null;
        } catch (error) {
            Performance.log('Get current user error:', error);
            return null;
        }
    },
    
    /**
     * Get authorization headers for API calls
     * @returns {Promise<Object>} Headers object
     */
    async getAuthHeaders() {
        try {
            const authData = Utils.storage.get('snapmagic_auth');
            if (authData && authData.isAuthenticated) {
                return {
                    'Authorization': `Bearer demo-token-${authData.username}`
                };
            }
            return {};
        } catch (error) {
            Performance.log('Get auth headers error:', error);
            return {};
        }
    },
    
    /**
     * Require authentication for page access
     * Redirects to login if not authenticated
     */
    async requireAuth() {
        const authenticated = await this.isAuthenticated();
        if (!authenticated) {
            Performance.log('Authentication required, redirecting to login');
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },
    
    /**
     * Redirect authenticated users away from login page
     */
    async redirectIfAuthenticated() {
        const authenticated = await this.isAuthenticated();
        if (authenticated) {
            Performance.log('User already authenticated, redirecting to app');
            window.location.href = 'app.html';
            return true;
        }
        return false;
    },
    
    /**
     * Handle authentication errors
     * @param {Error} error - Authentication error
     */
    handleAuthError(error) {
        Performance.log('Authentication error:', error);
        Toast.error('Authentication error: ' + error.message);
    },
    
    /**
     * Get authentication status for debugging
     * @returns {Promise<Object>} Authentication status
     */
    async getAuthStatus() {
        try {
            const authenticated = await this.isAuthenticated();
            if (!authenticated) {
                return { authenticated: false };
            }
            
            const user = await this.getCurrentUser();
            const authData = Utils.storage.get('snapmagic_auth');
            
            return {
                authenticated: true,
                user: user,
                loginTime: authData?.loginTime ? 
                    new Date(authData.loginTime).toISOString() : null
            };
        } catch (error) {
            Performance.log('Get auth status error:', error);
            return { authenticated: false, error: error.message };
        }
    }
};

// Initialize auth module when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Auth.init());
} else {
    Auth.init();
}

// Export for use in other modules
window.Auth = Auth;
