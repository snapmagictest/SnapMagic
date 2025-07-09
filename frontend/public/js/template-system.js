/**
 * SnapMagic Template System - Simplified Version
 * Automatically discovers and uses logos from the logos/ directory
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
        this.NOVA_Y = 100;           // Space for header
        
        // Template areas
        this.HEADER_HEIGHT = 90;     // Header for event name
        this.FOOTER_HEIGHT = 50;     // Footer for AWS logo
        this.LOGO_SIZE = 35;         // Logo size
        
        // Set template configuration
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
            eventName: 'AWS Event'
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
     * Draw simple header with dark background for white logos
     */
     async drawHeader() {
        if (!this.templateConfig?.eventName) return;
        
        // Header background - dark for white logos
        this.ctx.fillStyle = '#2C3E50';
        this.ctx.fillRect(10, 10, this.TEMPLATE_WIDTH - 20, this.HEADER_HEIGHT);
        
        // Event name centered in header - white text on dark background
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 18px Arial, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const eventName = this.templateConfig.eventName;
        const headerCenterX = this.TEMPLATE_WIDTH / 2;
        const headerCenterY = 10 + (this.HEADER_HEIGHT / 2);
        
        this.ctx.fillText(eventName, headerCenterX, headerCenterY);
    }
    
    /**
     * Draw logos using numbered system (1.png, 2.png, etc.) with flexible centering
     */
    async drawLogos() {
        console.log('🎨 Looking for numbered logos (1.png, 2.png, etc.)...');
        
        // Check for numbered logos 1-6
        const foundLogos = [];
        
        for (let i = 1; i <= 6; i++) {
            const logoUrl = `logos/${i}.png`;
            try {
                const logoExists = await this.checkIfLogoExists(logoUrl);
                if (logoExists) {
                    foundLogos.push({
                        number: i,
                        url: logoUrl,
                        filename: `${i}.png`
                    });
                    console.log(`📁 Found logo: ${i}.png`);
                }
            } catch (error) {
                // Logo doesn't exist, continue
                continue;
            }
        }
        
        if (foundLogos.length === 0) {
            console.log('ℹ️ No numbered logos found (1.png, 2.png, etc.)');
            return;
        }
        
        console.log(`✅ Found ${foundLogos.length} logo(s), displaying centered from left to right`);
        
        // Calculate flexible centering based on number of logos
        await this.drawLogosFlexiblyCentered(foundLogos);
    }
    
    /**
     * Draw logos flexibly centered based on how many are present
     * @param {Array} logos - Array of logo objects to draw
     */
    async drawLogosFlexiblyCentered(logos) {
        const logoCount = logos.length;
        const logoSpacing = 60; // Space between logos
        
        // Calculate total width needed for all logos
        const totalLogosWidth = (logoCount * this.LOGO_SIZE) + ((logoCount - 1) * (logoSpacing - this.LOGO_SIZE));
        
        // Calculate starting X position to center all logos
        const startX = (this.TEMPLATE_WIDTH - totalLogosWidth) / 2;
        
        // Y position below the event name in header
        const logoY = 10 + 45; // Header top + space for event name
        
        console.log(`📐 Centering ${logoCount} logos: total width ${totalLogosWidth}px, starting at X=${startX}`);
        
        // Draw each logo from left to right
        for (let i = 0; i < logos.length; i++) {
            const logo = logos[i];
            const logoX = startX + (i * logoSpacing);
            
            console.log(`🎯 Drawing logo ${logo.number} at position (${logoX}, ${logoY})`);
            await this.drawLogo(logo.url, logoX, logoY, this.LOGO_SIZE, logo.filename);
        }
    }
    
    /**
     * Check if a logo file exists by trying to load it
     * @param {string} logoUrl - URL to check
     * @returns {Promise<boolean>} - True if logo exists and loads
     */
    async checkIfLogoExists(logoUrl) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = logoUrl;
        });
    }
    
    /**
     * Draw a single logo with simple error handling
     * @param {string} logoUrl - URL of the logo image (local path)
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} size - Logo size
     * @param {string} alt - Alt text for accessibility
     */
    async drawLogo(logoUrl, x, y, size, alt) {
        return new Promise((resolve) => {
            const logoImg = new Image();
            
            console.log(`📁 Loading logo: ${logoUrl}`);
            
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
                console.log(`✅ Logo loaded successfully: ${alt}`);
                resolve();
            };
            
            logoImg.onerror = (error) => {
                console.log(`ℹ️ Logo not found: ${logoUrl}`);
                resolve(); // Don't draw anything, just continue
            };
            
            logoImg.src = logoUrl;
        });
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
