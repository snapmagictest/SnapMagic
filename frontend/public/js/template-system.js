/**
 * SnapMagic Template System - Sleek Black Design
 * Based on user's template design with AWS logo in header
 */

class SnapMagicTemplateSystem {
    constructor() {
        this.templateConfig = null;
        this.canvas = null;
        this.ctx = null;
        
        // Template dimensions (final card size) - Professional trading card proportions
        this.TEMPLATE_WIDTH = 500;   // ~4.2cm at 300 DPI
        this.TEMPLATE_HEIGHT = 750;  // ~6.2cm at 300 DPI
        
        // Nova Canvas - large area for AI image (matching user's design)
        this.NOVA_WIDTH = 460;       // Wide for better image display
        this.NOVA_HEIGHT = 520;      // Tall for better proportions
        this.NOVA_X = 20;            // Centered with margins
        this.NOVA_Y = 100;           // Below header
        
        // Sleek design dimensions (matching user's template)
        this.BORDER_WIDTH = 3;       // Black border around entire card
        this.HEADER_HEIGHT = 80;     // Header for AWS logo
        this.FOOTER_HEIGHT = 130;    // Footer for 3 sections (event/logos/creator)
        this.LOGO_SIZE = 35;         // Customer logo size
        
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
            eventName: 'AWS Event',
            logos: false,
            userName: ''
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
                console.log('🎴 Starting sleek black trading card creation...');
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
                
                // Draw sleek black background
                this.drawSleekBackground();
                console.log('✅ Sleek background drawn');
                
                // Load and draw Nova Canvas image
                const novaImg = new Image();
                novaImg.onload = async () => {
                    try {
                        console.log('✅ Nova Canvas image loaded');
                        
                        // Draw Nova Canvas image in center area
                        this.ctx.drawImage(novaImg, this.NOVA_X, this.NOVA_Y, this.NOVA_WIDTH, this.NOVA_HEIGHT);
                        console.log('✅ Nova Canvas image drawn at', this.NOVA_X, this.NOVA_Y);
                        
                        // Add template elements with sleek design
                        await this.drawSleekHeader();
                        console.log('✅ Sleek header with AWS logo drawn');
                        
                        await this.drawSleekFooter();
                        console.log('✅ Sleek footer with event info drawn');
                        
                        await this.drawSleekBorder();
                        console.log('✅ Sleek black border drawn');
                        
                        // Export final card
                        const finalCardDataUrl = this.canvas.toDataURL('image/png', 1.0);
                        const base64Data = finalCardDataUrl.split(',')[1];
                        console.log('✅ Sleek trading card created successfully');
                        resolve(base64Data);
                    } catch (error) {
                        console.error('❌ Error in template drawing:', error);
                        reject(error);
                    }
                };
                
                novaImg.onerror = () => {
                    console.error('❌ Failed to load Nova Canvas image');
                    reject(new Error('Failed to load Nova Canvas image'));
                };
                
                // Load the Nova Canvas image
                novaImg.src = `data:image/png;base64,${novaImageBase64}`;
                
            } catch (error) {
                console.error('❌ Error in createTradingCard:', error);
                reject(error);
            }
        });
    }
    
    /**
     * Draw sleek black background (matching user's design)
     */
    drawSleekBackground() {
        // Fill entire canvas with deep black
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.TEMPLATE_WIDTH, this.TEMPLATE_HEIGHT);
        
        console.log('✅ Sleek black background drawn');
    }
    
    /**
     * Draw sleek black border around entire card (matching user's design)
     */
    async drawSleekBorder() {
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = this.BORDER_WIDTH;
        this.ctx.strokeRect(
            this.BORDER_WIDTH / 2, 
            this.BORDER_WIDTH / 2, 
            this.TEMPLATE_WIDTH - this.BORDER_WIDTH, 
            this.TEMPLATE_HEIGHT - this.BORDER_WIDTH
        );
        
        console.log('✅ Sleek border drawn');
    }
    
    /**
     * Draw sleek header with centered AWS logo (exactly like user's design)
     */
    async drawSleekHeader() {
        // Header background (slightly lighter black for contrast)
        this.ctx.fillStyle = '#111111';
        this.ctx.fillRect(0, 0, this.TEMPLATE_WIDTH, this.HEADER_HEIGHT);
        
        // Draw centered AWS logo image (not text!)
        await this.drawCenteredAWSLogo();
    }
    
    /**
     * Draw centered AWS logo IMAGE in header (matching user's template)
     */
    async drawCenteredAWSLogo() {
        return new Promise((resolve) => {
            const awsLogo = new Image();
            
            awsLogo.onload = () => {
                this.ctx.save();
                
                // Calculate centered position for logo
                const maxLogoWidth = this.TEMPLATE_WIDTH * 0.7; // 70% of card width
                const maxLogoHeight = this.HEADER_HEIGHT * 0.6; // 60% of header height
                
                // Calculate logo size maintaining aspect ratio
                const logoSize = this.calculateLogoSize(awsLogo, maxLogoWidth, maxLogoHeight, 30);
                
                // Center the logo exactly like user's design
                const logoX = (this.TEMPLATE_WIDTH - logoSize.width) / 2;
                const logoY = (this.HEADER_HEIGHT - logoSize.height) / 2;
                
                // Draw the AWS logo image
                this.ctx.imageSmoothingEnabled = true;
                this.ctx.imageSmoothingQuality = 'high';
                this.ctx.drawImage(awsLogo, logoX, logoY, logoSize.width, logoSize.height);
                
                this.ctx.restore();
                console.log('✅ Centered AWS logo image drawn in header');
                resolve();
            };
            
            awsLogo.onerror = () => {
                console.error('❌ Failed to load AWS logo image for header');
                // Draw fallback text if logo fails
                this.ctx.save();
                this.ctx.fillStyle = '#FF9900';
                this.ctx.font = 'bold 20px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('POWERED BY AWS', this.TEMPLATE_WIDTH / 2, this.HEADER_HEIGHT / 2);
                this.ctx.restore();
                console.log('✅ AWS fallback text drawn in header');
                resolve();
            };
            
            // Load the horizontal AWS logo
            awsLogo.src = 'powered-by-aws-white-horizontal.png';
        });
    }
    
    /**
     * Draw sleek footer with 3 sections (matching user's design)
     * Section 1: EVENT NAME
     * Section 2: LOGOS (if enabled)
     * Section 3: CREATOR - NAME
     */
    async drawSleekFooter() {
        const footerY = this.TEMPLATE_HEIGHT - this.FOOTER_HEIGHT;
        
        // Footer background (slightly lighter black for contrast)
        this.ctx.fillStyle = '#111111';
        this.ctx.fillRect(0, footerY, this.TEMPLATE_WIDTH, this.FOOTER_HEIGHT);
        
        // Draw footer content in 3 sections
        await this.drawFooterSections(footerY);
    }
    
    /**
     * Draw footer sections: EVENT NAME + LOGOS + CREATOR (matching user's design)
     */
    async drawFooterSections(footerY) {
        const sectionHeight = this.FOOTER_HEIGHT / 3; // Divide footer into 3 equal sections
        
        // Section 1: Event Name (top section)
        if (this.templateConfig?.eventName) {
            this.ctx.save();
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = 'bold 18px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(
                this.templateConfig.eventName.toUpperCase(),
                this.TEMPLATE_WIDTH / 2,
                footerY + sectionHeight / 2
            );
            this.ctx.restore();
            console.log('✅ Event name drawn in footer section 1');
        }
        
        // Section 2: Customer Logos (middle section - if enabled)
        if (this.templateConfig?.logos === true) {
            await this.drawFooterLogos(footerY + sectionHeight, sectionHeight);
        }
        
        // Section 3: Creator Name (bottom section)
        if (this.templateConfig?.userName) {
            this.ctx.save();
            this.ctx.fillStyle = '#CCCCCC';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(
                `CREATOR - ${this.templateConfig.userName.toUpperCase()}`,
                this.TEMPLATE_WIDTH / 2,
                footerY + sectionHeight * 2.5
            );
            this.ctx.restore();
            console.log('✅ Creator name drawn in footer section 3');
        }
    }
    
    /**
     * Draw customer logos in footer section 2 (dynamic based on logos: true/false)
     */
    async drawFooterLogos(startY, sectionHeight) {
        console.log('🎨 Looking for customer logos in footer section 2...');
        
        // Check for numbered logos 1-6
        const foundLogos = [];
        for (let i = 1; i <= 6; i++) {
            try {
                const logoImg = new Image();
                logoImg.src = `logos/${i}.png`;
                
                // Test if logo exists
                await new Promise((resolve) => {
                    logoImg.onload = () => {
                        foundLogos.push({ number: i, image: logoImg });
                        console.log(`✅ Found logo ${i}.png`);
                        resolve();
                    };
                    logoImg.onerror = () => {
                        console.log(`ℹ️ Logo ${i}.png not found (this is normal)`);
                        resolve(); // Don't reject, just continue
                    };
                    
                    // Timeout after 100ms
                    setTimeout(() => resolve(), 100);
                });
            } catch (error) {
                console.log(`ℹ️ Logo ${i}.png not available`);
            }
        }
        
        if (foundLogos.length > 0) {
            await this.drawLogosInFooterSection(foundLogos, startY, sectionHeight);
        } else {
            console.log('ℹ️ No customer logos found - footer section 2 left blank');
        }
    }
    
    /**
     * Draw logos horizontally centered in footer section 2
     */
    async drawLogosInFooterSection(logos, startY, sectionHeight) {
        const maxLogos = Math.min(logos.length, 6);
        const logoSize = Math.min(this.LOGO_SIZE, sectionHeight * 0.8);
        const totalWidth = maxLogos * logoSize + (maxLogos - 1) * 10; // 10px spacing
        const startX = (this.TEMPLATE_WIDTH - totalWidth) / 2;
        
        for (let i = 0; i < maxLogos; i++) {
            const logo = logos[i];
            const logoX = startX + i * (logoSize + 10);
            const logoY = startY + (sectionHeight - logoSize) / 2;
            
            this.ctx.save();
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';
            this.ctx.drawImage(logo.image, logoX, logoY, logoSize, logoSize);
            this.ctx.restore();
        }
        
        console.log(`✅ Drew ${maxLogos} customer logos in footer section 2`);
    }
    
    /**
     * Calculate optimal logo size maintaining aspect ratio
     */
    calculateLogoSize(image, maxWidth, maxHeight, minSize = 20) {
        const aspectRatio = image.width / image.height;
        
        let width = maxWidth;
        let height = width / aspectRatio;
        
        if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
        }
        
        // Ensure minimum size
        if (width < minSize) {
            width = minSize;
            height = width / aspectRatio;
        }
        
        return { width: Math.round(width), height: Math.round(height) };
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
