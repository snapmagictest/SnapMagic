/**
 * SnapMagic CardTemplate System - Perfect Art Deco Premium with cardtemplateEdit.jpg
 * Layout: AWS logo (header) + Card image (center) + Event branding (footer)
 */

class SnapMagicCardTemplateSystem {
    constructor() {
        this.templateConfig = null;
        this.canvas = null;
        this.ctx = null;
        
        // Template dimensions (matching cardtemplateEdit.jpg)
        this.TEMPLATE_WIDTH = 417;
        this.TEMPLATE_HEIGHT = 626;
        
        // Card image area (central black area in cardtemplateEdit.jpg)
        this.CARD_IMAGE_X = 75;          // Left edge of central black area
        this.CARD_IMAGE_Y = 110;         // Top edge of central black area
        this.CARD_IMAGE_WIDTH = 267;     // Width of central black area
        this.CARD_IMAGE_HEIGHT = 406;    // Height of central black area
        
        // Header area (top gold rectangle for AWS logo)
        this.HEADER_X = 75;              // Match card image left edge
        this.HEADER_Y = 107;             // Top gold rectangle position
        this.HEADER_WIDTH = 267;         // Match card image width
        this.HEADER_HEIGHT = 40;         // Header rectangle height
        
        // Footer area (bottom gold rectangle for event branding)
        this.FOOTER_X = 75;              // Match card image left edge
        this.FOOTER_Y = 516;             // Bottom gold rectangle position
        this.FOOTER_WIDTH = 267;         // Match card image width
        this.FOOTER_HEIGHT = 60;         // Footer rectangle height
        
        console.log('✅ Perfect Art Deco Premium CardTemplate System initialized');
    }
    
    /**
     * Create trading card with perfect layout: AWS logo + Card image + Event branding
     */
    async createCardTemplate(novaImageBase64, userPrompt = '') {
        try {
            console.log('🎨 Creating Perfect Art Deco Premium CardTemplate...');
            
            // Create canvas
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.TEMPLATE_WIDTH;
            this.canvas.height = this.TEMPLATE_HEIGHT;
            this.ctx = this.canvas.getContext('2d');
            
            // Load cardtemplateEdit.jpg
            const templateImg = new Image();
            
            return new Promise((resolve, reject) => {
                templateImg.onload = async () => {
                    try {
                        console.log('✅ cardtemplateEdit.jpg template loaded');
                        
                        // Draw the template background
                        this.ctx.drawImage(templateImg, 0, 0, this.TEMPLATE_WIDTH, this.TEMPLATE_HEIGHT);
                        console.log('✅ Template background drawn');
                        
                        // Draw AWS logo in header
                        await this.drawHeaderAWSLogo();
                        console.log('✅ AWS logo drawn in header');
                        
                        // Load and draw Nova Canvas image in center
                        const novaImg = new Image();
                        
                        novaImg.onload = async () => {
                            try {
                                console.log('✅ Nova Canvas image loaded');
                                
                                // Draw Nova Canvas image in the card image area
                                this.drawCardImage(novaImg);
                                console.log('✅ Card image drawn in center');
                                
                                // Draw event branding in footer
                                await this.drawFooterEventBranding();
                                console.log('✅ Event branding drawn in footer');
                                
                                // Return final card as base64
                                const finalCard = this.canvas.toDataURL('image/png').split(',')[1];
                                console.log('✅ Perfect Art Deco Premium CardTemplate created successfully');
                                resolve(finalCard);
                                
                            } catch (error) {
                                console.error('❌ Error processing Nova Canvas image:', error);
                                reject(error);
                            }
                        };
                        
                        novaImg.onerror = () => {
                            console.error('❌ Failed to load Nova Canvas image');
                            reject(new Error('Failed to load Nova Canvas image'));
                        };
                        
                        novaImg.src = `data:image/png;base64,${novaImageBase64}`;
                        
                    } catch (error) {
                        console.error('❌ Error loading template:', error);
                        reject(error);
                    }
                };
                
                templateImg.onerror = () => {
                    console.error('❌ Failed to load cardtemplateEdit.jpg');
                    reject(new Error('Failed to load cardtemplateEdit.jpg'));
                };
                
                // Load cardtemplateEdit.jpg
                templateImg.src = 'cardtemplateEdit.jpg';
            });
            
        } catch (error) {
            console.error('❌ Perfect Art Deco Premium CardTemplate creation failed:', error);
            throw error;
        }
    }
    
    /**
     * Draw AWS "Powered by AWS" logo in header area
     */
    async drawHeaderAWSLogo() {
        try {
            const awsLogo = new Image();
            
            return new Promise((resolve) => {
                awsLogo.onload = () => {
                    // Calculate logo size to fit in header
                    const maxLogoHeight = this.HEADER_HEIGHT - 10; // Leave 5px margin top/bottom
                    const logoHeight = Math.min(maxLogoHeight, 30);
                    const logoWidth = (awsLogo.width / awsLogo.height) * logoHeight;
                    
                    // Center logo in header area
                    const logoX = this.HEADER_X + (this.HEADER_WIDTH - logoWidth) / 2;
                    const logoY = this.HEADER_Y + (this.HEADER_HEIGHT - logoHeight) / 2;
                    
                    this.ctx.drawImage(awsLogo, logoX, logoY, logoWidth, logoHeight);
                    console.log('✅ AWS logo positioned in header');
                    resolve();
                };
                
                awsLogo.onerror = () => {
                    console.warn('⚠️ AWS logo not found, header will remain empty');
                    resolve();
                };
                
                awsLogo.src = 'powered-by-aws-white-horizontal.png';
            });
            
        } catch (error) {
            console.warn('⚠️ Header AWS logo failed:', error);
        }
    }
    
    /**
     * Draw Nova Canvas image in the card image area with proper clipping
     */
    drawCardImage(novaImg) {
        // Save context for clipping
        this.ctx.save();
        
        // Create clipping path for the card image area
        this.ctx.beginPath();
        this.ctx.rect(this.CARD_IMAGE_X, this.CARD_IMAGE_Y, this.CARD_IMAGE_WIDTH, this.CARD_IMAGE_HEIGHT);
        this.ctx.clip();
        
        // Calculate scaling to fit image while maintaining aspect ratio
        const imgAspect = novaImg.width / novaImg.height;
        const areaAspect = this.CARD_IMAGE_WIDTH / this.CARD_IMAGE_HEIGHT;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imgAspect > areaAspect) {
            // Image is wider - fit to height
            drawHeight = this.CARD_IMAGE_HEIGHT;
            drawWidth = drawHeight * imgAspect;
            drawX = this.CARD_IMAGE_X - (drawWidth - this.CARD_IMAGE_WIDTH) / 2;
            drawY = this.CARD_IMAGE_Y;
        } else {
            // Image is taller - fit to width
            drawWidth = this.CARD_IMAGE_WIDTH;
            drawHeight = drawWidth / imgAspect;
            drawX = this.CARD_IMAGE_X;
            drawY = this.CARD_IMAGE_Y - (drawHeight - this.CARD_IMAGE_HEIGHT) / 2;
        }
        
        // Draw the image
        this.ctx.drawImage(novaImg, drawX, drawY, drawWidth, drawHeight);
        
        // Restore context
        this.ctx.restore();
    }
    
    /**
     * Draw event branding in footer area (event name, logos, creator)
     */
    async drawFooterEventBranding() {
        try {
            // Get event configuration
            const eventName = this.templateConfig?.eventName || 'AWS Event';
            const creatorName = this.templateConfig?.userName || 'Creator';
            
            // Set text properties
            this.ctx.fillStyle = '#FFFFFF'; // White text
            this.ctx.textAlign = 'center';
            
            // Draw event name (top of footer)
            this.ctx.font = 'bold 14px Arial';
            const eventY = this.FOOTER_Y + 15;
            this.ctx.fillText(eventName, this.FOOTER_X + this.FOOTER_WIDTH / 2, eventY);
            
            // Draw creator name (bottom of footer)
            this.ctx.font = '12px Arial';
            const creatorY = this.FOOTER_Y + this.FOOTER_HEIGHT - 10;
            this.ctx.fillText(`Created by: ${creatorName}`, this.FOOTER_X + this.FOOTER_WIDTH / 2, creatorY);
            
            // Draw event logos if available
            await this.drawEventLogos();
            
            console.log('✅ Event branding drawn in footer');
            
        } catch (error) {
            console.warn('⚠️ Footer event branding failed:', error);
        }
    }
    
    /**
     * Draw event logos in footer area (numbered logo system)
     */
    async drawEventLogos() {
        try {
            // Load numbered logos (1.png, 2.png, etc.)
            const logoPromises = [];
            const maxLogos = 6;
            
            for (let i = 1; i <= maxLogos; i++) {
                logoPromises.push(this.loadLogo(i));
            }
            
            const logos = await Promise.all(logoPromises);
            const validLogos = logos.filter(logo => logo !== null);
            
            if (validLogos.length > 0) {
                this.drawLogosInFooter(validLogos);
                console.log(`✅ Drew ${validLogos.length} event logos in footer`);
            }
            
        } catch (error) {
            console.warn('⚠️ Event logo loading failed:', error);
        }
    }
    
    /**
     * Load a single logo by number
     */
    async loadLogo(number) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ img, number });
            img.onerror = () => resolve(null);
            img.src = `logos/${number}.png`;
        });
    }
    
    /**
     * Draw logos in footer area with proper spacing
     */
    drawLogosInFooter(logos) {
        const logoHeight = 20; // Smaller logos for footer
        const spacing = 8;
        const totalWidth = logos.reduce((width, logo) => {
            const logoWidth = (logo.img.width / logo.img.height) * logoHeight;
            return width + logoWidth + spacing;
        }, -spacing); // Remove last spacing
        
        let currentX = this.FOOTER_X + (this.FOOTER_WIDTH - totalWidth) / 2;
        const logoY = this.FOOTER_Y + 25; // Position between event name and creator
        
        logos.forEach(logo => {
            const logoWidth = (logo.img.width / logo.img.height) * logoHeight;
            this.ctx.drawImage(logo.img, currentX, logoY, logoWidth, logoHeight);
            currentX += logoWidth + spacing;
        });
    }
    
    /**
     * Update template configuration
     */
    updateTemplateConfig(config) {
        this.templateConfig = config;
        console.log('✅ Perfect template config updated');
    }
    
    /**
     * Get template configuration
     */
    getTemplateConfig() {
        return this.templateConfig;
    }
}

// Make CardTemplate system available globally
window.SnapMagicCardTemplateSystem = SnapMagicCardTemplateSystem;

console.log('✅ Perfect Art Deco Premium CardTemplate System loaded with cardtemplateEdit.jpg');
