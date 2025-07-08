/**
 * SnapMagic Template System
 * Handles dynamic trading card template composition with configurable logos and branding
 */

class SnapMagicTemplateSystem {
    constructor() {
        this.templateConfig = null;
        this.canvas = null;
        this.ctx = null;
        
        // Template dimensions (final card size)
        this.TEMPLATE_WIDTH = 500;   // ~4.2cm at 300 DPI
        this.TEMPLATE_HEIGHT = 750;  // ~6.2cm at 300 DPI
        
        // Nova Canvas image dimensions and positioning
        this.NOVA_WIDTH = 416;       // Nova Canvas width
        this.NOVA_HEIGHT = 624;      // Nova Canvas height
        this.NOVA_X = (this.TEMPLATE_WIDTH - this.NOVA_WIDTH) / 2;  // Center horizontally
        this.NOVA_Y = 80;            // Leave space for header
        
        // Template areas
        this.HEADER_HEIGHT = 70;
        this.FOOTER_HEIGHT = 50;
        this.LOGO_SIZE = 40;
        
        // Set template configuration directly (no API calls)
        this.setTemplateConfiguration();
    }
    
    /**
     * Set template configuration from injected config (secrets.json via CDK)
     */
    setTemplateConfiguration() {
        try {
            // Try to get template config from injected configuration
            if (window.SNAPMAGIC_CONFIG && window.SNAPMAGIC_CONFIG.TEMPLATE_CONFIG) {
                // Parse the injected template configuration
                if (typeof window.SNAPMAGIC_CONFIG.TEMPLATE_CONFIG === 'string') {
                    this.templateConfig = JSON.parse(window.SNAPMAGIC_CONFIG.TEMPLATE_CONFIG);
                } else {
                    this.templateConfig = window.SNAPMAGIC_CONFIG.TEMPLATE_CONFIG;
                }
                console.log('✅ Template configuration loaded from secrets.json:', this.templateConfig);
            } else {
                // Fallback to hardcoded configuration
                this.setFallbackConfiguration();
            }
        } catch (error) {
            console.error('❌ Error parsing template configuration:', error);
            this.setFallbackConfiguration();
        }
    }
    
    /**
     * Fallback template configuration if secrets.json config fails
     */
    setFallbackConfiguration() {
        this.templateConfig = {
            eventName: 'AWS Event',
            logos: [
                {
                    enabled: true,
                    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/320px-Amazon_Web_Services_Logo.svg.png',
                    alt: 'AWS',
                    position: 'top-left'
                },
                {
                    enabled: true,
                    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/320px-Amazon_logo.svg.png',
                    alt: 'Amazon',
                    position: 'top-right'
                }
            ],
            awsLogo: { enabled: true, text: 'Powered by AWS' }
        };
        console.log('⚠️ Using fallback template configuration:', this.templateConfig);
    }
    
    /**
     * Create a complete trading card with template and Nova Canvas image
     * @param {string} novaImageBase64 - Base64 encoded Nova Canvas image
     * @param {string} userPrompt - Original user prompt for context
     * @returns {Promise<string>} - Base64 encoded final trading card
     */
    async createTradingCard(novaImageBase64, userPrompt = '') {
        return new Promise((resolve, reject) => {
            try {
                console.log('🎴 Starting trading card creation...');
                console.log('Template config:', this.templateConfig);
                
                // Create canvas
                this.canvas = document.createElement('canvas');
                this.canvas.width = this.TEMPLATE_WIDTH;
                this.canvas.height = this.TEMPLATE_HEIGHT;
                this.ctx = this.canvas.getContext('2d');
                
                // Set high quality rendering
                this.ctx.imageSmoothingEnabled = true;
                this.ctx.imageSmoothingQuality = 'high';
                
                console.log('✅ Canvas created:', this.TEMPLATE_WIDTH, 'x', this.TEMPLATE_HEIGHT);
                
                // Draw template background
                this.drawBackground();
                console.log('✅ Background drawn');
                
                // Load and draw Nova Canvas image
                const novaImg = new Image();
                novaImg.onload = async () => {
                    try {
                        console.log('✅ Nova Canvas image loaded');
                        
                        // Draw Nova Canvas image in center
                        this.ctx.drawImage(novaImg, this.NOVA_X, this.NOVA_Y, this.NOVA_WIDTH, this.NOVA_HEIGHT);
                        console.log('✅ Nova Canvas image drawn at', this.NOVA_X, this.NOVA_Y);
                        
                        // Add template elements
                        await this.drawHeader();
                        console.log('✅ Header drawn');
                        
                        await this.drawLogos();
                        console.log('✅ Logos drawn');
                        
                        await this.drawFooter();
                        console.log('✅ Footer drawn');
                        
                        // Export final card
                        const finalCardDataUrl = this.canvas.toDataURL('image/png', 1.0);
                        const base64Data = finalCardDataUrl.split(',')[1];
                        console.log('✅ Trading card created successfully');
                        resolve(base64Data);
                    } catch (error) {
                        console.error('❌ Error during template composition:', error);
                        reject(error);
                    }
                };
                
                novaImg.onerror = (error) => {
                    console.error('❌ Failed to load Nova Canvas image:', error);
                    reject(new Error('Failed to load Nova Canvas image'));
                };
                
                console.log('📥 Loading Nova Canvas image...');
                novaImg.src = `data:image/png;base64,${novaImageBase64}`;
                
            } catch (error) {
                console.error('❌ Error in createTradingCard:', error);
                reject(error);
            }
        });
    }
    
    /**
     * Draw template background and border
     */
    drawBackground() {
        // Fill with white background
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.TEMPLATE_WIDTH, this.TEMPLATE_HEIGHT);
        
        // Draw elegant border
        this.ctx.strokeStyle = '#E0E0E0';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(5, 5, this.TEMPLATE_WIDTH - 10, this.TEMPLATE_HEIGHT - 10);
        
        // Draw inner shadow effect
        this.ctx.strokeStyle = '#F5F5F5';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(10, 10, this.TEMPLATE_WIDTH - 20, this.TEMPLATE_HEIGHT - 20);
    }
    
    /**
     * Draw header with event name
     */
    async drawHeader() {
        if (!this.templateConfig?.eventName) return;
        
        // Header background
        this.ctx.fillStyle = '#F8F9FA';
        this.ctx.fillRect(10, 10, this.TEMPLATE_WIDTH - 20, this.HEADER_HEIGHT);
        
        // Event name text
        this.ctx.fillStyle = '#2C3E50';
        this.ctx.font = 'bold 16px Arial, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const eventName = this.templateConfig.eventName;
        const headerCenterX = this.TEMPLATE_WIDTH / 2;
        const headerCenterY = 10 + (this.HEADER_HEIGHT / 2);
        
        this.ctx.fillText(eventName, headerCenterX, headerCenterY);
    }
    
    /**
     * Draw all enabled logos in their specified positions
     */
    async drawLogos() {
        if (!this.templateConfig?.logos || !Array.isArray(this.templateConfig.logos)) {
            console.log('No logos configured or invalid logos array');
            return;
        }
        
        const logoSize = this.LOGO_SIZE;
        const enabledLogos = this.templateConfig.logos.filter(logo => logo.enabled);
        
        console.log(`Drawing ${enabledLogos.length} enabled logos out of ${this.templateConfig.logos.length} total`);
        
        for (const logo of enabledLogos) {
            const position = this.getLogoPosition(logo.position, logoSize);
            if (position) {
                console.log(`Drawing logo: ${logo.alt} at position ${logo.position}`);
                await this.drawLogo(logo.url, position.x, position.y, logoSize, logo.alt);
            }
        }
    }
    
    /**
     * Calculate logo position based on position string
     * @param {string} positionStr - Position identifier (e.g., 'top-left', 'header-center')
     * @param {number} logoSize - Size of the logo
     * @returns {Object} - {x, y} coordinates or null if invalid position
     */
    getLogoPosition(positionStr, logoSize) {
        const margin = 15;
        const headerY = 15;
        const topY = 5;
        
        switch (positionStr) {
            case 'top-left':
                return { x: margin, y: topY };
            case 'top-right':
                return { x: this.TEMPLATE_WIDTH - margin - logoSize, y: topY };
            case 'top-center':
                return { x: (this.TEMPLATE_WIDTH - logoSize) / 2, y: topY };
            case 'header-left':
                return { x: margin, y: headerY };
            case 'header-right':
                return { x: this.TEMPLATE_WIDTH - margin - logoSize, y: headerY };
            case 'header-center':
                return { x: (this.TEMPLATE_WIDTH - logoSize) / 2, y: headerY };
            default:
                console.warn(`Unknown logo position: ${positionStr}`);
                return null;
        }
    }
    
    /**
     * Draw a single logo
     * @param {string} logoUrl - URL of the logo image
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} size - Logo size
     * @param {string} alt - Alt text for accessibility
     */
    async drawLogo(logoUrl, x, y, size, alt) {
        return new Promise((resolve) => {
            const logoImg = new Image();
            logoImg.crossOrigin = 'anonymous'; // Handle CORS
            
            logoImg.onload = () => {
                // Calculate aspect ratio to maintain proportions
                const aspectRatio = logoImg.width / logoImg.height;
                let drawWidth = size;
                let drawHeight = size;
                
                if (aspectRatio > 1) {
                    // Wider than tall
                    drawHeight = size / aspectRatio;
                } else {
                    // Taller than wide
                    drawWidth = size * aspectRatio;
                }
                
                // Center the logo in the allocated space
                const drawX = x + (size - drawWidth) / 2;
                const drawY = y + (size - drawHeight) / 2;
                
                this.ctx.drawImage(logoImg, drawX, drawY, drawWidth, drawHeight);
                resolve();
            };
            
            logoImg.onerror = () => {
                console.warn(`Failed to load logo: ${logoUrl}`);
                // Draw placeholder
                this.drawLogoPlaceholder(x, y, size, alt);
                resolve();
            };
            
            logoImg.src = logoUrl;
        });
    }
    
    /**
     * Draw logo placeholder when image fails to load
     */
    drawLogoPlaceholder(x, y, size, alt) {
        // Draw placeholder rectangle
        this.ctx.strokeStyle = '#DDD';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, size, size);
        
        // Draw placeholder text
        this.ctx.fillStyle = '#999';
        this.ctx.font = '10px Arial, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(alt, x + size/2, y + size/2);
    }
    
    /**
     * Draw footer with AWS branding
     */
    async drawFooter() {
        if (!this.templateConfig?.awsLogo?.enabled) return;
        
        const footerY = this.TEMPLATE_HEIGHT - this.FOOTER_HEIGHT;
        
        // Footer background
        this.ctx.fillStyle = '#F8F9FA';
        this.ctx.fillRect(10, footerY, this.TEMPLATE_WIDTH - 20, this.FOOTER_HEIGHT - 10);
        
        // AWS branding text
        this.ctx.fillStyle = '#FF9900'; // AWS Orange
        this.ctx.font = 'bold 14px Arial, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const awsText = this.templateConfig.awsLogo.text || 'Powered by AWS';
        const footerCenterX = this.TEMPLATE_WIDTH / 2;
        const footerCenterY = footerY + (this.FOOTER_HEIGHT / 2) - 5;
        
        this.ctx.fillText(awsText, footerCenterX, footerCenterY);
    }
    
    /**
     * Get template configuration for external use
     */
    getTemplateConfig() {
        return this.templateConfig;
    }
    
    /**
     * Update template configuration
     */
    updateTemplateConfig(newConfig) {
        this.templateConfig = { ...this.templateConfig, ...newConfig };
    }
}

// Export for use in other scripts
window.SnapMagicTemplateSystem = SnapMagicTemplateSystem;
