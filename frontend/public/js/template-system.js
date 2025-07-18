/**
 * SnapMagic Template System - Overlapping Notched AWS Logo Design
 * Based on user's updated template with overlapping notched logo
 */

class SnapMagicTemplateSystem {
    constructor() {
        this.templateConfig = null;
        this.canvas = null;
        this.ctx = null;
        
        // Template dimensions (final card size) - Professional trading card proportions
        this.TEMPLATE_WIDTH = 500;   // ~4.2cm at 300 DPI
        this.TEMPLATE_HEIGHT = 750;  // ~6.2cm at 300 DPI
        
        // Nova Canvas - adjusted for top-integrated notch
        this.NOVA_WIDTH = 460;       // Wide for better image display
        this.NOVA_HEIGHT = 620;      // Full height
        this.NOVA_X = 20;            // Centered with margins
        this.NOVA_Y = 20;            // Start from top (notch will overlay)
        
        // Integrated top notched logo dimensions (slimmer, professional)
        this.LOGO_NOTCH_WIDTH = 220;  // Slimmer width for sleek look
        this.LOGO_NOTCH_HEIGHT = 40;  // Slimmer height, more professional
        this.LOGO_NOTCH_X = (this.TEMPLATE_WIDTH - this.LOGO_NOTCH_WIDTH) / 2; // Centered
        this.LOGO_NOTCH_Y = 0;        // Flush with top edge - part of border
        this.NOTCH_ANGLE = 15;        // Sleeker angle for professional look
        
        // Footer dimensions
        this.FOOTER_HEIGHT = 110;     // Footer for 3 sections
        this.LOGO_SIZE = 35;          // Customer logo size
        this.BORDER_WIDTH = 3;        // Black border around entire card
        
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
                console.log('🎴 Starting integrated top notched logo trading card creation...');
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
                        
                        // Draw Nova Canvas image (full area)
                        this.ctx.drawImage(novaImg, this.NOVA_X, this.NOVA_Y, this.NOVA_WIDTH, this.NOVA_HEIGHT);
                        console.log('✅ Nova Canvas image drawn at', this.NOVA_X, this.NOVA_Y);
                        
                        // Draw integrated top notched AWS logo (part of border design)
                        await this.drawIntegratedTopNotchedLogo();
                        console.log('✅ Integrated top notched AWS logo drawn');
                        
                        await this.drawSleekFooter();
                        console.log('✅ Sleek footer with event info drawn');
                        
                        await this.drawSleekBorder();
                        console.log('✅ Sleek black border drawn');
                        
                        // Export final card
                        const finalCardDataUrl = this.canvas.toDataURL('image/png', 1.0);
                        const base64Data = finalCardDataUrl.split(',')[1];
                        console.log('✅ Integrated top notched logo trading card created successfully');
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
     * Draw sleek black background
     */
    drawSleekBackground() {
        // Fill entire canvas with deep black
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.TEMPLATE_WIDTH, this.TEMPLATE_HEIGHT);
        
        console.log('✅ Sleek black background drawn');
    }
    
    /**
     * Draw sleek black border around entire card
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
     * Draw integrated top notched AWS logo (part of the border design)
     */
    async drawIntegratedTopNotchedLogo() {
        // Draw the sleek notched shape integrated into top border
        this.drawIntegratedNotchedShape();
        
        // Draw the AWS logo inside the notched area
        await this.drawAWSLogoInIntegratedNotch();
    }
    
    /**
     * Draw the integrated notched shape that's part of the top border
     */
    drawIntegratedNotchedShape() {
        this.ctx.save();
        
        // Create the sleek integrated notched path
        this.ctx.beginPath();
        
        // Start from top edge - flush with border
        const startX = this.LOGO_NOTCH_X;
        const startY = this.LOGO_NOTCH_Y; // Flush with top (Y=0)
        const endX = this.LOGO_NOTCH_X + this.LOGO_NOTCH_WIDTH;
        const endY = this.LOGO_NOTCH_Y;
        const bottomY = this.LOGO_NOTCH_Y + this.LOGO_NOTCH_HEIGHT;
        
        // Draw the sleek integrated notched shape: \____/
        // This creates a cutout that looks like part of the border design
        this.ctx.moveTo(startX - this.NOTCH_ANGLE, startY); // Top-left angled (flush with top)
        this.ctx.lineTo(startX, bottomY); // Left slope down \
        this.ctx.lineTo(endX, bottomY); // Bottom line ____
        this.ctx.lineTo(endX + this.NOTCH_ANGLE, startY); // Right slope up /
        this.ctx.closePath();
        
        // Fill with professional semi-transparent background (keep the transparency you liked)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'; // Slightly more opaque for professional look
        this.ctx.fill();
        
        // Add subtle professional border to integrate with card design
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'; // Very subtle highlight
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        this.ctx.restore();
        console.log('✅ Integrated notched shape drawn (flush with top border)');
    }
    
    /**
     * Draw AWS logo inside the integrated notched area
     */
    async drawAWSLogoInIntegratedNotch() {
        return new Promise((resolve) => {
            const awsLogo = new Image();
            
            awsLogo.onload = () => {
                this.ctx.save();
                
                // Calculate logo size for the slimmer notched area
                const maxLogoWidth = this.LOGO_NOTCH_WIDTH * 0.75; // 75% of notch width (more refined)
                const maxLogoHeight = this.LOGO_NOTCH_HEIGHT * 0.65; // 65% of notch height (professional spacing)
                
                // Calculate logo size maintaining aspect ratio
                const logoSize = this.calculateLogoSize(awsLogo, maxLogoWidth, maxLogoHeight, 25);
                
                // Center the logo in the integrated notched area
                const logoX = this.LOGO_NOTCH_X + (this.LOGO_NOTCH_WIDTH - logoSize.width) / 2;
                const logoY = this.LOGO_NOTCH_Y + (this.LOGO_NOTCH_HEIGHT - logoSize.height) / 2;
                
                // Draw the AWS logo with professional quality
                this.ctx.imageSmoothingEnabled = true;
                this.ctx.imageSmoothingQuality = 'high';
                this.ctx.drawImage(awsLogo, logoX, logoY, logoSize.width, logoSize.height);
                
                this.ctx.restore();
                console.log('✅ AWS logo drawn in integrated notched area (top-flush, professional)');
                resolve();
            };
            
            awsLogo.onerror = () => {
                console.error('❌ Failed to load AWS logo for integrated notched area');
                // Draw fallback text in integrated notched area
                this.ctx.save();
                this.ctx.fillStyle = '#FF9900';
                this.ctx.font = 'bold 14px Arial'; // Smaller font for slimmer design
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(
                    'powered by aws', 
                    this.LOGO_NOTCH_X + this.LOGO_NOTCH_WIDTH / 2, 
                    this.LOGO_NOTCH_Y + this.LOGO_NOTCH_HEIGHT / 2
                );
                this.ctx.restore();
                console.log('✅ AWS fallback text drawn in integrated notched area');
                resolve();
            };
            
            // Load the horizontal AWS logo
            awsLogo.src = 'powered-by-aws-white-horizontal.png';
        });
    }
    
    /**
     * Draw sleek footer with 3 sections
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
     * Draw footer sections: EVENT NAME + LOGOS + CREATOR
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
     * Draw customer logos in footer section 2
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
