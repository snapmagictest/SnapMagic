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
        this.NOVA_Y = 100;           // More space for redesigned header
        
        // Redesigned template areas
        this.HEADER_HEIGHT = 90;     // Larger header for event + logos
        this.FOOTER_HEIGHT = 50;
        this.EVENT_TEXT_HEIGHT = 35; // Space for event name
        this.LOGOS_HEIGHT = 45;      // Space for logos below event
        this.LOGO_SIZE = 35;         // Logo size
        
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
            ]
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
     * Draw redesigned header with event name at top and logos centered below
     */
     async drawHeader() {
        if (!this.templateConfig?.eventName) return;
        
        // Header background
        this.ctx.fillStyle = '#F8F9FA';
        this.ctx.fillRect(10, 10, this.TEMPLATE_WIDTH - 20, this.HEADER_HEIGHT);
        
        // Event name at the top of header
        this.ctx.fillStyle = '#2C3E50';
        this.ctx.font = 'bold 16px Arial, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const eventName = this.templateConfig.eventName;
        const headerCenterX = this.TEMPLATE_WIDTH / 2;
        const eventTextY = 10 + (this.EVENT_TEXT_HEIGHT / 2);
        
        this.ctx.fillText(eventName, headerCenterX, eventTextY);
        
        // Draw logos centered below event name
        await this.drawHeaderLogos();
    }
    
    /**
     * Draw logos centered horizontally below the event name
     */
    async drawHeaderLogos() {
        if (!this.templateConfig?.logos) return;
        
        // Filter enabled logos
        const enabledLogos = this.templateConfig.logos.filter(logo => logo.enabled);
        
        if (enabledLogos.length === 0) {
            console.log('No enabled logos to draw');
            return;
        }
        
        console.log(`Drawing ${enabledLogos.length} enabled logos out of ${this.templateConfig.logos.length} total`);
        
        // Calculate spacing for centered logos
        const logoSpacing = 60; // Space between logos
        const totalLogosWidth = (enabledLogos.length * this.LOGO_SIZE) + ((enabledLogos.length - 1) * (logoSpacing - this.LOGO_SIZE));
        const startX = (this.TEMPLATE_WIDTH - totalLogosWidth) / 2;
        const logoY = 10 + this.EVENT_TEXT_HEIGHT + ((this.LOGOS_HEIGHT - this.LOGO_SIZE) / 2);
        
        // Draw each enabled logo
        for (let i = 0; i < enabledLogos.length; i++) {
            const logo = enabledLogos[i];
            const logoX = startX + (i * logoSpacing);
            
            console.log(`Drawing logo: ${logo.alt} at centered position (${logoX}, ${logoY})`);
            await this.drawLogo(logo.url, logoX, logoY, this.LOGO_SIZE, logo.alt);
        }
    }
    
    /**
     * Draw all enabled logos in their specified positions
     */
    /**
     * Draw logos (header logos are now handled in drawHeaderLogos, this handles any other positioned logos)
     */
    async drawLogos() {
        // Header logos are now handled in drawHeaderLogos() - all logos go in the centered header
        console.log('Logos are now drawn in the header via drawHeaderLogos()');
        return;
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
     * Draw footer with AWS branding logo (mandatory)
     */
    async drawFooter() {
        const footerY = this.TEMPLATE_HEIGHT - this.FOOTER_HEIGHT;
        
        // Footer background
        this.ctx.fillStyle = '#F8F9FA';
        this.ctx.fillRect(10, footerY, this.TEMPLATE_WIDTH - 20, this.FOOTER_HEIGHT - 10);
        
        // Draw the mandatory AWS "Powered by AWS" logo
        await this.drawAwsPoweredByLogo(footerY);
    }
    
    /**
     * Draw the mandatory AWS "Powered by AWS" logo in footer
     * @param {number} footerY - Y position of footer
     */
    async drawAwsPoweredByLogo(footerY) {
        return new Promise((resolve) => {
            const awsLogo = new Image();
            
            awsLogo.onload = () => {
                // Calculate logo dimensions to fit nicely in footer
                const maxLogoHeight = this.FOOTER_HEIGHT - 20; // Leave 10px margin top/bottom
                const logoAspectRatio = awsLogo.width / awsLogo.height; // 200/72 = ~2.78
                
                let logoHeight = maxLogoHeight;
                let logoWidth = logoHeight * logoAspectRatio;
                
                // If logo is too wide, scale it down
                const maxLogoWidth = this.TEMPLATE_WIDTH - 40; // Leave margins
                if (logoWidth > maxLogoWidth) {
                    logoWidth = maxLogoWidth;
                    logoHeight = logoWidth / logoAspectRatio;
                }
                
                // Center the logo in the footer
                const logoX = (this.TEMPLATE_WIDTH - logoWidth) / 2;
                const logoY = footerY + (this.FOOTER_HEIGHT - logoHeight) / 2;
                
                // Draw the AWS logo
                this.ctx.drawImage(awsLogo, logoX, logoY, logoWidth, logoHeight);
                console.log('✅ AWS Powered by logo drawn in footer');
                resolve();
            };
            
            awsLogo.onerror = () => {
                console.error('❌ Failed to load AWS Powered by logo, drawing fallback text');
                // Fallback to text if logo fails to load
                this.ctx.fillStyle = '#FF9900'; // AWS Orange
                this.ctx.font = 'bold 12px Arial, sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                
                const footerCenterX = this.TEMPLATE_WIDTH / 2;
                const footerCenterY = footerY + (this.FOOTER_HEIGHT / 2);
                
                this.ctx.fillText('Powered by AWS', footerCenterX, footerCenterY);
                resolve();
            };
            
            // Load the local AWS logo (no CORS issues since it's same-origin)
            awsLogo.src = 'powered-by-aws-white.png';
        });
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
