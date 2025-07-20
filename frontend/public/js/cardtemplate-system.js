/**
 * SnapMagic CardTemplate System - Sophisticated Art Deco Premium
 * Uses our custom sophisticated-art-deco-template.png design
 */

class SnapMagicCardTemplateSystem {
    constructor() {
        this.templateConfig = null;
        this.canvas = null;
        this.ctx = null;
        
        // Template dimensions (matching our sophisticated design)
        this.TEMPLATE_WIDTH = 420;
        this.TEMPLATE_HEIGHT = 680;
        
        // Nova Canvas area (from our sophisticated template layout)
        this.NOVA_WIDTH = 360;           // Main image area width
        this.NOVA_HEIGHT = 480;          // Main image area height
        this.NOVA_X = 30;                // X position from template
        this.NOVA_Y = 80;                // Y position from template
        
        // Header area for logos (from our template)
        this.HEADER_X = 60;
        this.HEADER_Y = 20;
        this.HEADER_WIDTH = 300;
        this.HEADER_HEIGHT = 50;
        
        // Footer area for AWS branding (from our template)
        this.FOOTER_X = 20;
        this.FOOTER_Y = 570;
        this.FOOTER_WIDTH = 380;
        this.FOOTER_HEIGHT = 90;
        
        // Our custom gradient gold colors
        this.GOLD_PRIMARY = '#D2AC47';    // Rich golden brown
        this.GOLD_SECONDARY = '#AE8625';  // Deep antique gold
        this.GOLD_ACCENT = '#F7EF8A';     // Light golden yellow
        this.GOLD_MUTED = '#EDC967';      // Warm golden yellow
        this.BLACK_PANEL = '#000000';
        this.WHITE_TEXT = '#FFFFFF';
        
        console.log('✅ Sophisticated Art Deco Premium CardTemplate System initialized');
    }
    
    /**
     * Create trading card with our sophisticated art deco design
     */
    async createCardTemplate(novaImageBase64, userPrompt = '') {
        try {
            console.log('🎨 Creating Sophisticated Art Deco Premium CardTemplate...');
            
            // Create canvas
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.TEMPLATE_WIDTH;
            this.canvas.height = this.TEMPLATE_HEIGHT;
            this.ctx = this.canvas.getContext('2d');
            
            // Load our sophisticated art deco template
            const templateImg = new Image();
            
            return new Promise((resolve, reject) => {
                templateImg.onload = async () => {
                    try {
                        console.log('✅ Sophisticated Art Deco template loaded');
                        
                        // Draw the template background
                        this.ctx.drawImage(templateImg, 0, 0, this.TEMPLATE_WIDTH, this.TEMPLATE_HEIGHT);
                        console.log('✅ Template background drawn');
                        
                        // Load and draw Nova Canvas image
                        const novaImg = new Image();
                        
                        novaImg.onload = async () => {
                            try {
                                console.log('✅ Nova Canvas image loaded');
                                
                                // Draw Nova Canvas image in the designated area
                                this.drawNovaImage(novaImg);
                                console.log('✅ Nova Canvas image drawn');
                                
                                // Draw branding elements
                                await this.drawBranding();
                                console.log('✅ Branding drawn');
                                
                                // Return final card as base64
                                const finalCard = this.canvas.toDataURL('image/png').split(',')[1];
                                console.log('✅ Sophisticated Art Deco Premium CardTemplate created successfully');
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
                    console.error('❌ Failed to load sophisticated art deco template');
                    reject(new Error('Failed to load sophisticated art deco template'));
                };
                
                // Load our sophisticated art deco template
                templateImg.src = 'sophisticated-art-deco-template.png';
            });
            
        } catch (error) {
            console.error('❌ Sophisticated Art Deco Premium CardTemplate creation failed:', error);
            throw error;
        }
    }
    
    /**
     * Draw Nova Canvas image in the designated area with proper clipping
     */
    drawNovaImage(novaImg) {
        // Save context for clipping
        this.ctx.save();
        
        // Create clipping path for the image area
        this.ctx.beginPath();
        this.ctx.rect(this.NOVA_X, this.NOVA_Y, this.NOVA_WIDTH, this.NOVA_HEIGHT);
        this.ctx.clip();
        
        // Calculate scaling to fit image while maintaining aspect ratio
        const imgAspect = novaImg.width / novaImg.height;
        const areaAspect = this.NOVA_WIDTH / this.NOVA_HEIGHT;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imgAspect > areaAspect) {
            // Image is wider - fit to height
            drawHeight = this.NOVA_HEIGHT;
            drawWidth = drawHeight * imgAspect;
            drawX = this.NOVA_X - (drawWidth - this.NOVA_WIDTH) / 2;
            drawY = this.NOVA_Y;
        } else {
            // Image is taller - fit to width
            drawWidth = this.NOVA_WIDTH;
            drawHeight = drawWidth / imgAspect;
            drawX = this.NOVA_X;
            drawY = this.NOVA_Y - (drawHeight - this.NOVA_HEIGHT) / 2;
        }
        
        // Draw the image
        this.ctx.drawImage(novaImg, drawX, drawY, drawWidth, drawHeight);
        
        // Restore context
        this.ctx.restore();
    }
    
    /**
     * Draw branding elements (header logos and footer AWS)
     */
    async drawBranding() {
        try {
            // Draw header logos if available
            await this.drawHeaderLogos();
            
            // Draw footer AWS branding
            await this.drawFooterBranding();
            
        } catch (error) {
            console.warn('⚠️ Branding drawing failed:', error);
        }
    }
    
    /**
     * Draw header logos in the header area (numbered logo system)
     */
    async drawHeaderLogos() {
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
                this.drawLogosInHeader(validLogos);
                console.log(`✅ Drew ${validLogos.length} header logos`);
            } else {
                console.log('📋 No header logos found, header area remains as designed');
            }
            
        } catch (error) {
            console.warn('⚠️ Header logo loading failed:', error);
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
     * Draw logos in header area with proper spacing
     */
    drawLogosInHeader(logos) {
        const logoHeight = 30;
        const spacing = 10;
        const totalWidth = logos.reduce((width, logo) => {
            const logoWidth = (logo.img.width / logo.img.height) * logoHeight;
            return width + logoWidth + spacing;
        }, -spacing); // Remove last spacing
        
        let currentX = this.HEADER_X + (this.HEADER_WIDTH - totalWidth) / 2;
        const logoY = this.HEADER_Y + (this.HEADER_HEIGHT - logoHeight) / 2;
        
        logos.forEach(logo => {
            const logoWidth = (logo.img.width / logo.img.height) * logoHeight;
            this.ctx.drawImage(logo.img, currentX, logoY, logoWidth, logoHeight);
            currentX += logoWidth + spacing;
        });
    }
    
    /**
     * Draw footer AWS branding
     */
    async drawFooterBranding() {
        try {
            // Load AWS "Powered by AWS" logo
            const awsLogo = new Image();
            
            return new Promise((resolve) => {
                awsLogo.onload = () => {
                    // Draw AWS logo in footer area
                    const logoHeight = 30;
                    const logoWidth = (awsLogo.width / awsLogo.height) * logoHeight;
                    const logoX = this.FOOTER_X + (this.FOOTER_WIDTH - logoWidth) / 2;
                    const logoY = this.FOOTER_Y + (this.FOOTER_HEIGHT - logoHeight) / 2;
                    
                    this.ctx.drawImage(awsLogo, logoX, logoY, logoWidth, logoHeight);
                    console.log('✅ AWS footer logo drawn');
                    resolve();
                };
                
                awsLogo.onerror = () => {
                    console.warn('⚠️ AWS logo not found, skipping footer branding');
                    resolve();
                };
                
                awsLogo.src = 'powered-by-aws-white-horizontal.png';
            });
            
        } catch (error) {
            console.warn('⚠️ Footer branding failed:', error);
        }
    }
    
    /**
     * Update template configuration
     */
    updateTemplateConfig(config) {
        this.templateConfig = config;
        console.log('✅ Sophisticated template config updated');
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

console.log('✅ SnapMagic Sophisticated Art Deco Premium CardTemplate System loaded');
