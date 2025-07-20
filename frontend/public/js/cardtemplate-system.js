/**
 * SnapMagic CardTemplate System - Exact ASCII Design Implementation
 * Matches the cardtemplate.jpg exactly based on ASCII analysis
 */

class SnapMagicCardTemplateSystem {
    constructor() {
        this.templateConfig = null;
        this.canvas = null;
        this.ctx = null;
        
        // Template dimensions (matching cardtemplate.jpg exactly)
        this.TEMPLATE_WIDTH = 500;
        this.TEMPLATE_HEIGHT = 750;
        
        // Frame measurements based on ASCII analysis
        this.OUTER_BORDER = 15;          // Outermost frame border
        this.INNER_BORDER = 25;          // Inner frame border
        this.CORNER_SIZE = 60;           // Corner decoration size
        this.PANEL_HEIGHT = 40;          // Top/bottom panel height
        this.SIDE_WIDTH = 20;            // Side panel width
        
        // Nova Canvas area (central black rectangle)
        this.NOVA_WIDTH = 350;           // Central area width
        this.NOVA_HEIGHT = 580;          // Central area height
        this.NOVA_X = (this.TEMPLATE_WIDTH - this.NOVA_WIDTH) / 2;   // Centered
        this.NOVA_Y = (this.TEMPLATE_HEIGHT - this.NOVA_HEIGHT) / 2; // Centered
        
        // Champagne gold colors (corrected)
        this.GOLD_PRIMARY = '#C9A961';    // Warm, muted champagne gold
        this.GOLD_SECONDARY = '#B8A082';  // Deeper champagne tone
        this.GOLD_ACCENT = '#D4B76A';     // Brighter highlights
        this.GOLD_SHINE = '#E6D4A3';      // Metallic shine
        this.BLACK_PANEL = '#000000';
        this.WHITE_TEXT = '#FFFFFF';
        
        console.log('✅ CardTemplate System initialized with exact ASCII design');
    }
    
    /**
     * Create trading card with exact ASCII design
     */
    async createCardTemplate(novaImageBase64, userPrompt = '') {
        try {
            console.log('🎨 Creating CardTemplate with exact ASCII design...');
            
            // Create canvas
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.TEMPLATE_WIDTH;
            this.canvas.height = this.TEMPLATE_HEIGHT;
            this.ctx = this.canvas.getContext('2d');
            
            // Draw solid black background
            this.drawBlackBackground();
            
            // Draw the exact frame design from ASCII
            this.drawExactFrameDesign();
            console.log('✅ Exact frame design drawn');
            
            // Load and draw Nova Canvas image
            const novaImg = new Image();
            
            return new Promise((resolve, reject) => {
                novaImg.onload = async () => {
                    try {
                        console.log('✅ Nova Canvas image loaded');
                        
                        // Draw Nova Canvas image in central black area
                        this.drawNovaImage(novaImg);
                        console.log('✅ Nova Canvas image drawn');
                        
                        // Draw branding (handled by branding system)
                        await this.drawCardTemplateLogo();
                        await this.drawCardTemplateFooter();
                        console.log('✅ CardTemplate branding drawn');
                        
                        // Return final card as base64
                        const finalCard = this.canvas.toDataURL('image/png').split(',')[1];
                        console.log('✅ CardTemplate created successfully with exact design');
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
     * Draw solid black background
     */
    drawBlackBackground() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.TEMPLATE_WIDTH, this.TEMPLATE_HEIGHT);
        console.log('✅ Solid black background drawn');
    }
    
    /**
     * Draw the exact frame design matching ASCII layout
     */
    drawExactFrameDesign() {
        this.ctx.save();
        this.ctx.strokeStyle = this.GOLD_PRIMARY;
        this.ctx.fillStyle = this.GOLD_PRIMARY;
        this.ctx.lineWidth = 2;
        
        // Draw outer border frame
        this.drawOuterBorderFrame();
        
        // Draw inner border frame
        this.drawInnerBorderFrame();
        
        // Draw corner decorations (4 corners)
        this.drawCornerDecorations();
        
        // Draw top decorative panel
        this.drawTopDecorativePanel();
        
        // Draw bottom decorative panel
        this.drawBottomDecorativePanel();
        
        // Draw side panels (left and right)
        this.drawSidePanels();
        
        this.ctx.restore();
    }
    
    /**
     * Draw outer border frame (outermost rectangle)
     */
    drawOuterBorderFrame() {
        // Main outer border
        this.ctx.strokeRect(
            this.OUTER_BORDER, 
            this.OUTER_BORDER, 
            this.TEMPLATE_WIDTH - (this.OUTER_BORDER * 2), 
            this.TEMPLATE_HEIGHT - (this.OUTER_BORDER * 2)
        );
    }
    
    /**
     * Draw inner border frame
     */
    drawInnerBorderFrame() {
        // Inner border frame
        this.ctx.strokeRect(
            this.INNER_BORDER, 
            this.INNER_BORDER, 
            this.TEMPLATE_WIDTH - (this.INNER_BORDER * 2), 
            this.TEMPLATE_HEIGHT - (this.INNER_BORDER * 2)
        );
    }
    
    /**
     * Draw corner decorations (stepped geometric patterns)
     */
    drawCornerDecorations() {
        const corners = [
            { x: this.OUTER_BORDER, y: this.OUTER_BORDER },                    // Top-left
            { x: this.TEMPLATE_WIDTH - this.OUTER_BORDER - this.CORNER_SIZE, y: this.OUTER_BORDER }, // Top-right
            { x: this.OUTER_BORDER, y: this.TEMPLATE_HEIGHT - this.OUTER_BORDER - this.CORNER_SIZE }, // Bottom-left
            { x: this.TEMPLATE_WIDTH - this.OUTER_BORDER - this.CORNER_SIZE, y: this.TEMPLATE_HEIGHT - this.OUTER_BORDER - this.CORNER_SIZE } // Bottom-right
        ];
        
        corners.forEach(corner => {
            this.drawSingleCornerDecoration(corner.x, corner.y);
        });
    }
    
    /**
     * Draw single corner decoration (stepped pattern)
     */
    drawSingleCornerDecoration(x, y) {
        // Create stepped corner pattern
        this.ctx.fillRect(x, y, this.CORNER_SIZE, 15);                    // Top horizontal
        this.ctx.fillRect(x, y, 15, this.CORNER_SIZE);                    // Left vertical
        this.ctx.fillRect(x + 15, y + 15, this.CORNER_SIZE - 15, 10);     // Second step
        this.ctx.fillRect(x + 15, y + 15, 10, this.CORNER_SIZE - 15);     // Second step vertical
        this.ctx.fillRect(x + 25, y + 25, this.CORNER_SIZE - 25, 8);      // Third step
        this.ctx.fillRect(x + 25, y + 25, 8, this.CORNER_SIZE - 25);      // Third step vertical
        
        // Add inner decorative lines
        this.ctx.strokeRect(x + 10, y + 10, this.CORNER_SIZE - 20, this.CORNER_SIZE - 20);
        this.ctx.strokeRect(x + 20, y + 20, this.CORNER_SIZE - 40, this.CORNER_SIZE - 40);
    }
    
    /**
     * Draw top decorative panel
     */
    drawTopDecorativePanel() {
        const panelX = this.TEMPLATE_WIDTH / 2 - 150; // Centered, 300px wide
        const panelY = this.OUTER_BORDER + 10;
        const panelWidth = 300;
        
        // Main panel rectangle
        this.ctx.strokeRect(panelX, panelY, panelWidth, this.PANEL_HEIGHT);
        
        // Inner panel rectangle
        this.ctx.strokeRect(panelX + 5, panelY + 5, panelWidth - 10, this.PANEL_HEIGHT - 10);
        
        // Central decorative element
        const centerX = panelX + panelWidth / 2;
        const centerY = panelY + this.PANEL_HEIGHT / 2;
        
        // Diamond pattern in center
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY - 8);
        this.ctx.lineTo(centerX + 12, centerY);
        this.ctx.lineTo(centerX, centerY + 8);
        this.ctx.lineTo(centerX - 12, centerY);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Side decorative elements
        this.ctx.strokeRect(panelX + 30, centerY - 5, 20, 10);
        this.ctx.strokeRect(panelX + panelWidth - 50, centerY - 5, 20, 10);
    }
    
    /**
     * Draw bottom decorative panel (mirror of top)
     */
    drawBottomDecorativePanel() {
        const panelX = this.TEMPLATE_WIDTH / 2 - 150; // Centered, 300px wide
        const panelY = this.TEMPLATE_HEIGHT - this.OUTER_BORDER - this.PANEL_HEIGHT - 10;
        const panelWidth = 300;
        
        // Main panel rectangle
        this.ctx.strokeRect(panelX, panelY, panelWidth, this.PANEL_HEIGHT);
        
        // Inner panel rectangle
        this.ctx.strokeRect(panelX + 5, panelY + 5, panelWidth - 10, this.PANEL_HEIGHT - 10);
        
        // Central decorative element
        const centerX = panelX + panelWidth / 2;
        const centerY = panelY + this.PANEL_HEIGHT / 2;
        
        // Diamond pattern in center
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY - 8);
        this.ctx.lineTo(centerX + 12, centerY);
        this.ctx.lineTo(centerX, centerY + 8);
        this.ctx.lineTo(centerX - 12, centerY);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Side decorative elements
        this.ctx.strokeRect(panelX + 30, centerY - 5, 20, 10);
        this.ctx.strokeRect(panelX + panelWidth - 50, centerY - 5, 20, 10);
    }
    
    /**
     * Draw side panels (left and right vertical elements)
     */
    drawSidePanels() {
        const panelHeight = 200;
        const centerY = this.TEMPLATE_HEIGHT / 2 - panelHeight / 2;
        
        // Left side panel
        const leftX = this.OUTER_BORDER + 5;
        this.ctx.strokeRect(leftX, centerY, this.SIDE_WIDTH, panelHeight);
        this.ctx.strokeRect(leftX + 2, centerY + 5, this.SIDE_WIDTH - 4, panelHeight - 10);
        
        // Add segmented pattern to left panel
        for (let i = 1; i < 8; i++) {
            const segmentY = centerY + (i * panelHeight / 8);
            this.ctx.beginPath();
            this.ctx.moveTo(leftX + 2, segmentY);
            this.ctx.lineTo(leftX + this.SIDE_WIDTH - 2, segmentY);
            this.ctx.stroke();
        }
        
        // Right side panel
        const rightX = this.TEMPLATE_WIDTH - this.OUTER_BORDER - this.SIDE_WIDTH - 5;
        this.ctx.strokeRect(rightX, centerY, this.SIDE_WIDTH, panelHeight);
        this.ctx.strokeRect(rightX + 2, centerY + 5, this.SIDE_WIDTH - 4, panelHeight - 10);
        
        // Add segmented pattern to right panel
        for (let i = 1; i < 8; i++) {
            const segmentY = centerY + (i * panelHeight / 8);
            this.ctx.beginPath();
            this.ctx.moveTo(rightX + 2, segmentY);
            this.ctx.lineTo(rightX + this.SIDE_WIDTH - 2, segmentY);
            this.ctx.stroke();
        }
    }
    
    /**
     * Draw Nova Canvas image in central black area
     */
    drawNovaImage(novaImg) {
        this.ctx.save();
        
        console.log('🖼️ Drawing Nova image in central black area:');
        console.log(`   Nova size: ${this.NOVA_WIDTH}x${this.NOVA_HEIGHT}`);
        console.log(`   Nova position: (${this.NOVA_X}, ${this.NOVA_Y})`);
        
        // Draw Nova Canvas image in the central black rectangle
        this.ctx.drawImage(novaImg, this.NOVA_X, this.NOVA_Y, this.NOVA_WIDTH, this.NOVA_HEIGHT);
        
        this.ctx.restore();
        console.log('✅ Nova image drawn in central area');
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

console.log('✅ SnapMagic CardTemplate System loaded with exact ASCII design implementation');
