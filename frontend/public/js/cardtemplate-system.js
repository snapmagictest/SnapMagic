/**
 * SnapMagic CardTemplate System - Clean Art Deco Design
 * Matches cardtemplate.jpg exactly with sophisticated golden frame
 */

class SnapMagicCardTemplateSystem {
    constructor() {
        this.templateConfig = null;
        this.canvas = null;
        this.ctx = null;
        
        // Template dimensions (matching cardtemplate.jpg exactly)
        this.TEMPLATE_WIDTH = 500;
        this.TEMPLATE_HEIGHT = 750;
        
        // Art Deco frame specifications (from detailed cardtemplate.jpg analysis)
        this.FRAME_BORDER = 80;          // Space taken by complex frame decorations
        
        // Nova Canvas area (optimized for the sophisticated frame design)
        // Calculated to avoid all frame decorations while maximizing image area
        this.NOVA_WIDTH = 280;           // Image width (optimized for complex frame)
        this.NOVA_HEIGHT = 520;          // Image height (optimized for complex frame)
        this.NOVA_X = (this.TEMPLATE_WIDTH - this.NOVA_WIDTH) / 2;   // Centered: (500-280)/2 = 110
        this.NOVA_Y = (this.TEMPLATE_HEIGHT - this.NOVA_HEIGHT) / 2; // Centered: (750-520)/2 = 115
        
        // Art Deco colors (clean golden palette)
        this.GOLD_PRIMARY = '#D4AF37';
        this.GOLD_SECONDARY = '#B8860B';
        this.GOLD_ACCENT = '#FFD700';
        this.BLACK_PANEL = '#000000';
        this.WHITE_TEXT = '#FFFFFF';
        
        console.log('✅ CardTemplate System initialized with clean Art Deco design');
    }
    
    /**
     * Create trading card with Art Deco template
     * @param {string} novaImageBase64 - Base64 encoded Nova Canvas image
     * @param {string} userPrompt - Original user prompt
     * @returns {Promise<string>} - Base64 encoded final trading card
     */
    async createCardTemplate(novaImageBase64, userPrompt = '') {
        try {
            console.log('🎨 Creating CardTemplate with Art Deco design...');
            
            // Create canvas
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.TEMPLATE_WIDTH;
            this.canvas.height = this.TEMPLATE_HEIGHT;
            this.ctx = this.canvas.getContext('2d');
            
            // Draw Art Deco background and frame
            this.drawArtDecoBackground();
            this.drawSimpleGoldenFrame();
            console.log('✅ Art Deco frame drawn');
            
            // Load and draw Nova Canvas image
            const novaImg = new Image();
            
            return new Promise((resolve, reject) => {
                novaImg.onload = async () => {
                    try {
                        console.log('✅ Nova Canvas image loaded for CardTemplate');
                        
                        // Draw Nova Canvas image
                        this.drawNovaImageWith3D(novaImg);
                        console.log('✅ Nova Canvas image drawn');
                        
                        // Draw AWS logo and branding
                        await this.drawCardTemplateLogo();
                        await this.drawCardTemplateFooter();
                        console.log('✅ CardTemplate branding drawn');
                        
                        // Return final card as base64
                        const finalCard = this.canvas.toDataURL('image/png').split(',')[1];
                        console.log('✅ CardTemplate created successfully');
                        resolve(finalCard);
                        
                    } catch (error) {
                        console.error('❌ Error creating CardTemplate:', error);
                        reject(error);
                    }
                };
                
                novaImg.onerror = () => {
                    console.error('❌ Failed to load Nova Canvas image');
                    reject(new Error('Failed to load Nova Canvas image'));
                };
                
                novaImg.src = `data:image/png;base64,${novaImageBase64}`;
            });
            
        } catch (error) {
            console.error('❌ CardTemplate creation failed:', error);
            throw error;
        }
    }
    
    /**
     * Draw Art Deco background - SOLID BLACK ONLY (matching cardtemplate.jpg)
     */
    drawArtDecoBackground() {
        // Fill entire canvas with solid black background (exactly like cardtemplate.jpg)
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.TEMPLATE_WIDTH, this.TEMPLATE_HEIGHT);
        
        console.log('✅ Solid black background drawn (matching cardtemplate.jpg)');
    }
    
    /**
     * Draw Art Deco frame matching cardtemplate.jpg EXACTLY
     */
    drawSimpleGoldenFrame() {
        this.ctx.save();
        
        // Set golden color matching the reference image
        this.ctx.strokeStyle = this.GOLD_PRIMARY;
        this.ctx.fillStyle = this.GOLD_PRIMARY;
        this.ctx.lineWidth = 2;
        
        // Draw the complex Art Deco frame exactly as shown in cardtemplate.jpg
        this.drawComplexArtDecoFrame();
        
        this.ctx.restore();
        console.log('✅ Complex Art Deco frame drawn matching cardtemplate.jpg exactly');
    }
    
    /**
     * Draw the complete Art Deco frame system matching cardtemplate.jpg EXACTLY
     */
    drawComplexArtDecoFrame() {
        // Draw multiple parallel border lines (the layered frame system)
        this.drawMultipleParallelBorders();
        
        // Draw the complex corner decorations with precise geometric patterns
        this.drawPreciseCornerDecorations();
        
        // Draw top and bottom decorative panels with stepped designs
        this.drawTopBottomDecorativePanels();
        
        // Draw side decorative elements with vertical patterns
        this.drawSideDecorativeElements();
    }
    
    /**
     * Draw multiple parallel border lines exactly as shown in cardtemplate.jpg
     */
    drawMultipleParallelBorders() {
        // Outer border system - multiple parallel lines
        const borderLevels = [
            { margin: 8, lineWidth: 2 },   // Outermost border
            { margin: 15, lineWidth: 1.5 }, // Second border
            { margin: 22, lineWidth: 1 },   // Third border
            { margin: 28, lineWidth: 1.5 }, // Inner border
        ];
        
        borderLevels.forEach(level => {
            this.ctx.lineWidth = level.lineWidth;
            this.ctx.strokeRect(
                level.margin, 
                level.margin, 
                this.TEMPLATE_WIDTH - (level.margin * 2), 
                this.TEMPLATE_HEIGHT - (level.margin * 2)
            );
        });
    }
    
    /**
     * Draw precise corner decorations matching the geometric patterns in cardtemplate.jpg
     */
    drawPreciseCornerDecorations() {
        const corners = [
            { x: 0, y: 0, rotation: 0 },                    // Top-left
            { x: this.TEMPLATE_WIDTH, y: 0, rotation: 90 }, // Top-right
            { x: this.TEMPLATE_WIDTH, y: this.TEMPLATE_HEIGHT, rotation: 180 }, // Bottom-right
            { x: 0, y: this.TEMPLATE_HEIGHT, rotation: 270 } // Bottom-left
        ];
        
        corners.forEach(corner => {
            this.ctx.save();
            this.ctx.translate(corner.x, corner.y);
            this.ctx.rotate((corner.rotation * Math.PI) / 180);
            
            // Draw the precise geometric corner pattern from cardtemplate.jpg
            this.drawPreciseCornerPattern();
            
            this.ctx.restore();
        });
    }
    
    /**
     * Draw a single precise corner pattern matching cardtemplate.jpg EXACTLY
     */
    drawPreciseCornerPattern() {
        // Main angular corner decoration with more precise measurements
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(110, 0);     // Extended top horizontal line
        this.ctx.lineTo(95, 15);     // First diagonal cut
        this.ctx.lineTo(95, 20);     // First vertical segment
        this.ctx.lineTo(80, 20);     // First horizontal step
        this.ctx.lineTo(80, 35);     // Second vertical segment
        this.ctx.lineTo(65, 35);     // Second horizontal step
        this.ctx.lineTo(65, 50);     // Third vertical segment
        this.ctx.lineTo(50, 50);     // Third horizontal step
        this.ctx.lineTo(50, 65);     // Fourth vertical segment
        this.ctx.lineTo(35, 65);     // Fourth horizontal step
        this.ctx.lineTo(35, 80);     // Fifth vertical segment
        this.ctx.lineTo(20, 80);     // Fifth horizontal step
        this.ctx.lineTo(20, 95);     // Sixth vertical segment
        this.ctx.lineTo(15, 95);     // Final horizontal step
        this.ctx.lineTo(15, 110);    // Extended final vertical line
        this.ctx.lineTo(0, 110);     // Left vertical line
        this.ctx.closePath();
        this.ctx.fill();
        
        // Add multiple inner geometric details for sophistication
        this.ctx.strokeStyle = '#000000'; // Black lines for definition
        this.ctx.lineWidth = 1;
        
        // Primary inner stepped pattern
        this.ctx.beginPath();
        this.ctx.moveTo(25, 25);
        this.ctx.lineTo(85, 25);
        this.ctx.lineTo(70, 40);
        this.ctx.lineTo(70, 55);
        this.ctx.lineTo(55, 55);
        this.ctx.lineTo(55, 70);
        this.ctx.lineTo(40, 70);
        this.ctx.lineTo(40, 85);
        this.ctx.lineTo(25, 85);
        this.ctx.closePath();
        this.ctx.stroke();
        
        // Secondary inner pattern
        this.ctx.strokeRect(35, 35, 40, 40);
        this.ctx.strokeRect(40, 40, 30, 30);
        this.ctx.strokeRect(45, 45, 20, 20);
        
        // Add corner accent lines
        this.ctx.beginPath();
        this.ctx.moveTo(25, 0);
        this.ctx.lineTo(25, 25);
        this.ctx.lineTo(0, 25);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(50, 0);
        this.ctx.lineTo(50, 15);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, 50);
        this.ctx.lineTo(15, 50);
        this.ctx.stroke();
        
        // Reset styles
        this.ctx.strokeStyle = this.GOLD_PRIMARY;
        this.ctx.lineWidth = 2;
    }
    
    /**
     * Draw top and bottom decorative panels matching cardtemplate.jpg
     */
    drawTopBottomDecorativePanels() {
        const centerX = this.TEMPLATE_WIDTH / 2;
        const panelWidth = 300;
        const panelHeight = 30;
        
        // Top decorative panel
        this.drawGeometricDecorativePanel(centerX - panelWidth/2, 15, panelWidth, panelHeight);
        
        // Bottom decorative panel
        this.drawGeometricDecorativePanel(centerX - panelWidth/2, this.TEMPLATE_HEIGHT - 45, panelWidth, panelHeight);
    }
    
    /**
     * Draw a geometric decorative panel with sophisticated Art Deco styling
     */
    drawGeometricDecorativePanel(x, y, width, height) {
        // Main panel background
        this.ctx.fillRect(x, y, width, height);
        
        // Create sophisticated stepped inner pattern
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1;
        
        // Multiple inner rectangles creating sophisticated depth
        const steps = [2, 4, 6, 8];
        steps.forEach((step, index) => {
            const alpha = 1 - (index * 0.2); // Varying opacity for depth
            this.ctx.globalAlpha = alpha;
            this.ctx.strokeRect(x + step, y + step/2, width - (step * 2), height - step);
        });
        this.ctx.globalAlpha = 1; // Reset opacity
        
        // Central sophisticated geometric elements
        const centerX = x + width/2;
        const centerY = y + height/2;
        
        // Main central diamond with stepped pattern
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY - 12);
        this.ctx.lineTo(centerX + 16, centerY);
        this.ctx.lineTo(centerX, centerY + 12);
        this.ctx.lineTo(centerX - 16, centerY);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Inner diamond
        this.ctx.strokeStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY - 8);
        this.ctx.lineTo(centerX + 12, centerY);
        this.ctx.lineTo(centerX, centerY + 8);
        this.ctx.lineTo(centerX - 12, centerY);
        this.ctx.closePath();
        this.ctx.stroke();
        
        // Side geometric elements with more sophistication
        const sideElements = [
            { x: x + 40, y: centerY },
            { x: x + 80, y: centerY },
            { x: x + width - 80, y: centerY },
            { x: x + width - 40, y: centerY }
        ];
        
        sideElements.forEach((element, index) => {
            // Alternating patterns for visual interest
            if (index % 2 === 0) {
                // Rectangular elements
                this.ctx.strokeRect(element.x - 10, element.y - 5, 20, 10);
                this.ctx.strokeRect(element.x - 8, element.y - 3, 16, 6);
            } else {
                // Diamond elements
                this.ctx.beginPath();
                this.ctx.moveTo(element.x, element.y - 6);
                this.ctx.lineTo(element.x + 8, element.y);
                this.ctx.lineTo(element.x, element.y + 6);
                this.ctx.lineTo(element.x - 8, element.y);
                this.ctx.closePath();
                this.ctx.stroke();
            }
        });
        
        // Add corner accent elements
        const corners = [
            { x: x + 15, y: y + height/2 },
            { x: x + width - 15, y: y + height/2 }
        ];
        
        corners.forEach(corner => {
            this.ctx.strokeRect(corner.x - 6, corner.y - 8, 12, 16);
            this.ctx.strokeRect(corner.x - 4, corner.y - 6, 8, 12);
        });
        
        // Reset styles
        this.ctx.strokeStyle = this.GOLD_PRIMARY;
        this.ctx.lineWidth = 2;
    }
    
    /**
     * Draw side decorative elements matching cardtemplate.jpg
     */
    drawSideDecorativeElements() {
        const centerY = this.TEMPLATE_HEIGHT / 2;
        const elementHeight = 200;
        const elementWidth = 25;
        
        // Left side decorative elements
        this.drawVerticalDecorativeElement(10, centerY - elementHeight/2, elementWidth, elementHeight);
        
        // Right side decorative elements  
        this.drawVerticalDecorativeElement(this.TEMPLATE_WIDTH - 35, centerY - elementHeight/2, elementWidth, elementHeight);
    }
    
    /**
     * Draw a single vertical decorative element
     */
    drawVerticalDecorativeElement(x, y, width, height) {
        // Main vertical panel
        this.ctx.fillRect(x, y, width, height);
        
        // Inner vertical lines for definition
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x + 2, y + 5, width - 4, height - 10);
        this.ctx.strokeRect(x + 4, y + 10, width - 8, height - 20);
        
        // Segmented pattern
        const segments = 8;
        const segmentHeight = (height - 20) / segments;
        
        for (let i = 1; i < segments; i++) {
            const segmentY = y + 10 + (i * segmentHeight);
            this.ctx.beginPath();
            this.ctx.moveTo(x + 4, segmentY);
            this.ctx.lineTo(x + width - 4, segmentY);
            this.ctx.stroke();
            
            // Alternating decorative elements
            if (i % 2 === 0) {
                this.ctx.fillRect(x + 6, segmentY - 2, width - 12, 4);
            }
        }
        
        // Reset styles
        this.ctx.strokeStyle = this.GOLD_PRIMARY;
        this.ctx.lineWidth = 2;
    }
    
    /**
     * Draw Nova Canvas image properly positioned (with detailed positioning info)
     */
    drawNovaImageWith3D(novaImg) {
        this.ctx.save();
        
        // Debug: Log detailed positioning calculations
        console.log('🖼️ Nova Image Positioning Details:');
        console.log(`   Template size: ${this.TEMPLATE_WIDTH}x${this.TEMPLATE_HEIGHT}`);
        console.log(`   Nova size: ${this.NOVA_WIDTH}x${this.NOVA_HEIGHT}`);
        console.log(`   Nova position: (${this.NOVA_X}, ${this.NOVA_Y})`);
        console.log(`   Nova bounds: ${this.NOVA_X} to ${this.NOVA_X + this.NOVA_WIDTH} (width), ${this.NOVA_Y} to ${this.NOVA_Y + this.NOVA_HEIGHT} (height)`);
        console.log(`   Margins: left=${this.NOVA_X}, right=${this.TEMPLATE_WIDTH - (this.NOVA_X + this.NOVA_WIDTH)}, top=${this.NOVA_Y}, bottom=${this.TEMPLATE_HEIGHT - (this.NOVA_Y + this.NOVA_HEIGHT)}`);
        
        // Draw Nova Canvas image
        console.log(`🎨 Drawing Nova image at (${this.NOVA_X}, ${this.NOVA_Y}) with size ${this.NOVA_WIDTH}x${this.NOVA_HEIGHT}`);
        this.ctx.drawImage(novaImg, this.NOVA_X, this.NOVA_Y, this.NOVA_WIDTH, this.NOVA_HEIGHT);
        
        this.ctx.restore();
        console.log('✅ Nova image drawn successfully');
    }
    
    /**
     * Placeholder for AWS logo drawing (implemented in branding file)
     */
    async drawCardTemplateLogo() {
        console.log('🏢 AWS logo drawing handled by branding system');
    }
    
    /**
     * Placeholder for footer drawing (implemented in branding file)
     */
    async drawCardTemplateFooter() {
        console.log('📄 Footer drawing handled by branding system');
    }
    
    /**
     * Update template configuration
     */
    updateTemplateConfig(config) {
        this.templateConfig = config;
        console.log('⚙️ Template configuration updated');
    }
}

// Make CardTemplate system available globally
window.SnapMagicCardTemplateSystem = SnapMagicCardTemplateSystem;

console.log('✅ SnapMagic CardTemplate System loaded successfully (clean Art Deco design)');
