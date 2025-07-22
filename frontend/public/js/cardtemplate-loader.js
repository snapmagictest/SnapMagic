/**
 * SnapMagic CardTemplate Loader
 * Loads all CardTemplate components in the correct order
 */

(function() {
    'use strict';
    
    console.log('🎨 Loading SnapMagic CardTemplate System...');
    
    // Configuration
    const CARDTEMPLATE_VERSION = '1.0.0';
    const CARDTEMPLATE_COMPONENTS = [
        'cardtemplate-system.js',
        'cardtemplate-3d-effects.js', 
        'cardtemplate-branding.js',
        'cardtemplate-integration.js'
    ];
    
    // Component loading status
    let loadedComponents = 0;
    let totalComponents = CARDTEMPLATE_COMPONENTS.length;
    
    /**
     * Load CardTemplate component
     */
    function loadComponent(componentPath) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `js/${componentPath}`;
            script.async = false; // Maintain load order
            
            script.onload = () => {
                loadedComponents++;
                console.log(`✅ Loaded CardTemplate component: ${componentPath} (${loadedComponents}/${totalComponents})`);
                resolve();
            };
            
            script.onerror = () => {
                console.error(`❌ Failed to load CardTemplate component: ${componentPath}`);
                reject(new Error(`Failed to load ${componentPath}`));
            };
            
            document.head.appendChild(script);
        });
    }
    
    /**
     * Load all CardTemplate components
     */
    async function loadAllComponents() {
        try {
            console.log(`📦 Loading ${totalComponents} CardTemplate components...`);
            
            // Load components in sequence to maintain dependencies
            for (const component of CARDTEMPLATE_COMPONENTS) {
                await loadComponent(component);
            }
            
            console.log('🎉 All CardTemplate components loaded successfully!');
            
            // Initialize CardTemplate system
            initializeCardTemplate();
            
        } catch (error) {
            console.error('❌ Failed to load CardTemplate system:', error);
            
            // Show user-friendly error
            showLoadingError();
        }
    }
    
    /**
     * Initialize CardTemplate system after all components are loaded
     */
    function initializeCardTemplate() {
        // Verify all required classes are available
        const requiredClasses = [
            'SnapMagicCardTemplateSystem',
            'SnapMagicTemplateSelector'
        ];
        
        const missingClasses = requiredClasses.filter(className => !window[className]);
        
        if (missingClasses.length > 0) {
            console.error('❌ Missing required CardTemplate classes:', missingClasses);
            return;
        }
        
        // Set up global CardTemplate configuration
        window.CARDTEMPLATE_CONFIG = {
            version: CARDTEMPLATE_VERSION,
            loaded: true,
            timestamp: new Date().toISOString(),
            features: [
                'art-deco-frame',
                'holographic-effects',
                '3d-depth-effects',
                'view-dependent-sparkles',
                'premium-branding',
                'template-selection'
            ]
        };
        
        // Dispatch ready event
        const readyEvent = new CustomEvent('cardtemplate:ready', {
            detail: {
                version: CARDTEMPLATE_VERSION,
                components: CARDTEMPLATE_COMPONENTS,
                config: window.CARDTEMPLATE_CONFIG
            }
        });
        
        document.dispatchEvent(readyEvent);
        
        console.log(`🎴 CardTemplate System v${CARDTEMPLATE_VERSION} ready!`);
        console.log('✨ Features available:', window.CARDTEMPLATE_CONFIG.features);
        
        // Show success notification
        showSuccessNotification();
    }
    
    /**
     * Show loading error notification
     */
    function showLoadingError() {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        `;
        errorDiv.innerHTML = '❌ Failed to load Premium CardTemplate. Using standard template.';
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (document.body.contains(errorDiv)) {
                document.body.removeChild(errorDiv);
            }
        }, 5000);
    }
    
    /**
     * Show success notification
     */
    function showSuccessNotification() {
        // Popup removed - just log to console instead
        console.log('✨ Premium CardTemplate System Loaded!');
        
        /* Original popup code disabled:
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #D4AF37, #FFD700);
            color: #000;
            padding: 1rem 2rem;
            border-radius: 8px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
            animation: cardtemplate-fade-in 0.5s ease;
        `;
        successDiv.innerHTML = '✨ Premium CardTemplate System Loaded!';
        
        // Add fade-in animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes cardtemplate-fade-in {
                from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.style.animation = 'cardtemplate-fade-in 0.5s ease reverse';
            setTimeout(() => {
                if (document.body.contains(successDiv)) {
                    document.body.removeChild(successDiv);
                }
                if (document.head.contains(style)) {
                    document.head.removeChild(style);
                }
            }, 500);
        }, 3000);
        */
    }
    
    /**
     * Check if CardTemplate should be loaded
     */
    function shouldLoadCardTemplate() {
        // Check for feature flags or configuration
        const urlParams = new URLSearchParams(window.location.search);
        const forceLoad = urlParams.get('cardtemplate') === 'true';
        const disableLoad = urlParams.get('cardtemplate') === 'false';
        
        if (disableLoad) {
            console.log('🚫 CardTemplate loading disabled by URL parameter');
            return false;
        }
        
        if (forceLoad) {
            console.log('🔧 CardTemplate loading forced by URL parameter');
            return true;
        }
        
        // Default: load CardTemplate
        return true;
    }
    
    /**
     * Main initialization
     */
    function init() {
        if (!shouldLoadCardTemplate()) {
            console.log('⏭️ Skipping CardTemplate loading');
            return;
        }
        
        console.log('🚀 Initializing CardTemplate System...');
        
        // Check browser compatibility
        if (!window.HTMLCanvasElement || !window.CanvasRenderingContext2D) {
            console.error('❌ Browser does not support Canvas API required for CardTemplate');
            showLoadingError();
            return;
        }
        
        // Check for WebGL support (optional but recommended)
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (!gl) {
            console.warn('⚠️ WebGL not available. 3D effects will use 2D fallback.');
        } else {
            console.log('✅ WebGL support detected for enhanced 3D effects');
        }
        
        // Start loading components
        loadAllComponents();
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Export loader info
    window.CARDTEMPLATE_LOADER = {
        version: CARDTEMPLATE_VERSION,
        components: CARDTEMPLATE_COMPONENTS,
        loaded: false,
        init: init
    };
    
})();

console.log('📋 CardTemplate Loader initialized');
