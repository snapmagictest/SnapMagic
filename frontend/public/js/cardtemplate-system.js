/**
 * SnapMagic CardTemplate System - Premium Art Deco with 3D Shader Effects
 * Combines Art Deco diamond frame + holographic rainbow + 3D depth effects
 */

class SnapMagicCardTemplateSystem {
    constructor() {
        this.templateConfig = null;
        this.canvas = null;
        this.ctx = null;
        this.gl = null; // WebGL context for 3D effects
        
        // Template dimensions (matching cardtemplate.jpg exactly)
        this.TEMPLATE_WIDTH = 500;
        this.TEMPLATE_HEIGHT = 750;
        
        // Art Deco frame specifications (from detailed cardtemplate.jpg analysis)
        this.FRAME_BORDER = 80;          // Space taken by complex frame decorations
        
        // Nova Canvas area (filling the central black area, avoiding all frame decorations)
        // Based on detailed analysis of the new complex frame design
        this.NOVA_WIDTH = 300;           // Image width (leaves room for complex frame decorations)
        this.NOVA_HEIGHT = 540;          // Image height (leaves room for complex frame decorations)
        this.NOVA_X = (this.TEMPLATE_WIDTH - this.NOVA_WIDTH) / 2;   // Centered: (500-300)/2 = 100
        this.NOVA_Y = (this.TEMPLATE_HEIGHT - this.NOVA_HEIGHT) / 2; // Centered: (750-540)/2 = 105
        
        // Art Deco colors with holographic enhancement
        this.GOLD_PRIMARY = '#D4AF37';
        this.GOLD_SECONDARY = '#B8860B';
        this.GOLD_ACCENT = '#FFD700';
        this.BLACK_PANEL = '#000000';
        this.WHITE_TEXT = '#FFFFFF';
        
        // Holographic rainbow colors (from your existing system)
        this.RAINBOW_COLORS = [
            '#ff0080', '#ff8c00', '#40e0d0', '#9400d3',
            '#00ff00', '#ff1493', '#00bfff', '#ff0080'
        ];
        
        // 3D effect parameters
        this.viewAngle = { x: 0, y: 0 };
        this.animationTime = 0;
        this.sparkleIntensity = 1.0;
        this.holographicShift = 0;
        
        // Footer dimensions (same as existing)
        this.FOOTER_HEIGHT = 110;
        this.LOGO_SIZE = 35;
        
        this.setTemplateConfiguration();
        this.initializeEventListeners();
    }
    
    /**
     * Set template configuration from injected config
     */
    setTemplateConfiguration() {
        try {
            if (window.SNAPMAGIC_CONFIG && window.SNAPMAGIC_CONFIG.TEMPLATE_CONFIG) {
                if (typeof window.SNAPMAGIC_CONFIG.TEMPLATE_CONFIG === 'string') {
                    this.templateConfig = JSON.parse(window.SNAPMAGIC_CONFIG.TEMPLATE_CONFIG);
                } else {
                    this.templateConfig = window.SNAPMAGIC_CONFIG.TEMPLATE_CONFIG;
                }
                console.log('✅ CardTemplate configuration loaded:', this.templateConfig);
            } else {
                this.setFallbackConfiguration();
            }
        } catch (error) {
            console.error('❌ Error parsing CardTemplate configuration:', error);
            this.setFallbackConfiguration();
        }
    }
    
    /**
     * Fallback configuration
     */
    setFallbackConfiguration() {
        this.templateConfig = {
            eventName: 'AWS Executive Event',
            logos: false,
            userName: ''
        };
        console.log('⚠️ Using fallback CardTemplate configuration:', this.templateConfig);
    }
    
    /**
     * Update template configuration from external system
     * @param {Object} config - Configuration object from existing template system
     */
    updateTemplateConfig(config) {
        try {
            console.log('🔄 Updating CardTemplate configuration:', config);
            
            if (config && typeof config === 'object') {
                // Merge with existing configuration
                this.templateConfig = {
                    ...this.templateConfig,
                    ...config
                };
                
                console.log('✅ CardTemplate configuration updated:', this.templateConfig);
            } else {
                console.log('⚠️ Invalid config provided, using existing configuration');
            }
        } catch (error) {
            console.error('❌ Error updating CardTemplate configuration:', error);
            // Continue with existing configuration
        }
    }
    
    /**
     * Initialize mouse tracking for 3D effects
     */
    initializeEventListeners() {
        // Will be set up when canvas is created
        this.mouseTrackingEnabled = false;
    }
    
    /**
     * Create premium CardTemplate trading card with 3D effects
     * @param {string} novaImageBase64 - Base64 encoded Nova Canvas image
     * @param {string} userPrompt - Original user prompt
     * @returns {Promise<string>} - Base64 encoded final trading card
     */
    async createCardTemplate(novaImageBase64, userPrompt = '') {
        return new Promise((resolve, reject) => {
            try {
                console.log('🎨 Creating premium CardTemplate with 3D effects...');
                console.log('📊 CardTemplate Debug Info:', {
                    novaImageSize: novaImageBase64 ? novaImageBase64.length : 0,
                    userPrompt: userPrompt,
                    templateConfig: this.templateConfig
                });
                
                // Create canvas with both 2D and WebGL contexts
                this.canvas = document.createElement('canvas');
                this.canvas.width = this.TEMPLATE_WIDTH;
                this.canvas.height = this.TEMPLATE_HEIGHT;
                this.ctx = this.canvas.getContext('2d');
                
                // Try to get WebGL context for 3D effects
                this.gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl');
                if (this.gl) {
                    console.log('✅ WebGL context available for 3D effects');
                } else {
                    console.log('⚠️ WebGL not available, using 2D fallback');
                }
                
                // High quality rendering
                this.ctx.imageSmoothingEnabled = true;
                this.ctx.imageSmoothingQuality = 'high';
                
                console.log('✅ CardTemplate canvas created:', this.TEMPLATE_WIDTH, 'x', this.TEMPLATE_HEIGHT);
                
                // Set up mouse tracking for 3D effects
                this.setupMouseTracking();
                
                // Start animation loop for holographic effects
                this.startAnimationLoop();
                
                // Draw Art Deco background and simple golden frame
                this.drawArtDecoBackground();
                this.drawSimpleGoldenFrame();
                console.log('✅ Simple golden frame drawn (matching cardtemplate.jpg)');
                
                // Load and draw Nova Canvas image
                const novaImg = new Image();
                novaImg.onload = async () => {
                    try {
                        console.log('✅ Nova Canvas image loaded for CardTemplate');
                        
                        // Draw Nova Canvas image (background is already black, no panel needed)
                        this.drawNovaImageWith3D(novaImg);
                        console.log('✅ Nova Canvas image drawn');
                        
                        // Draw AWS logo and branding (simple, no holographic effects)
                        await this.drawCardTemplateLogo();
                        await this.drawCardTemplateFooter();
                        console.log('✅ CardTemplate branding drawn');
                        
                        // Export final card
                        const finalCardDataUrl = this.canvas.toDataURL('image/png', 1.0);
                        const base64Data = finalCardDataUrl.split(',')[1];
                        console.log('✅ Premium CardTemplate created successfully');
                        console.log('📊 Final card size:', base64Data.length, 'characters');
                        resolve(base64Data);
                    } catch (error) {
                        console.error('❌ Error in CardTemplate drawing:', error);
                        reject(error);
                    }
                };
                
                novaImg.onerror = () => {
                    console.error('❌ Failed to load Nova Canvas image for CardTemplate');
                    reject(new Error('Failed to load Nova Canvas image'));
                };
                
                // Load the Nova Canvas image
                if (novaImageBase64) {
                    novaImg.src = `data:image/png;base64,${novaImageBase64}`;
                } else {
                    console.error('❌ No Nova Canvas image provided to CardTemplate');
                    reject(new Error('No Nova Canvas image provided'));
                }
                
            } catch (error) {
                console.error('❌ Error in createCardTemplate:', error);
                reject(error);
            }
        });
    }
    
    /**
     * Draw Art Deco background
     */
    drawArtDecoBackground() {
        // Fill entire canvas with solid black background (exactly matching cardtemplate.jpg)
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
        
        const t = (this.animationTime * 0.01) % 1;
        const currentColor = this.interpolateColor(
            this.RAINBOW_COLORS[colorIndex], 
            this.RAINBOW_COLORS[nextColorIndex], 
            t
        );
        
        gradient.addColorStop(0, currentColor);
        gradient.addColorStop(0.3, this.GOLD_PRIMARY);
        gradient.addColorStop(0.7, this.GOLD_ACCENT);
        gradient.addColorStop(1, currentColor);
        
        return gradient;
    }
    
    /**
     * Draw holographic diamond pattern
     */
    drawHolographicDiamondPattern() {
        this.ctx.save();
        
        // Apply holographic shimmer effect
        this.ctx.globalAlpha = 0.8 + 0.2 * Math.sin(this.animationTime * 0.02);
        
        // Draw diamond patterns around the frame
        const diamondSize = 20;
        const spacing = 40;
        
        // Top and bottom diamond rows
        for (let x = spacing; x < this.TEMPLATE_WIDTH - spacing; x += spacing) {
            this.drawHolographicDiamond(x, this.FRAME_BORDER / 2, diamondSize);
            this.drawHolographicDiamond(x, this.TEMPLATE_HEIGHT - this.FRAME_BORDER / 2, diamondSize);
        }
        
        // Left and right diamond columns
        for (let y = spacing * 2; y < this.TEMPLATE_HEIGHT - spacing * 2; y += spacing) {
            this.drawHolographicDiamond(this.FRAME_BORDER / 2, y, diamondSize);
            this.drawHolographicDiamond(this.TEMPLATE_WIDTH - this.FRAME_BORDER / 2, y, diamondSize);
        }
        
        this.ctx.restore();
    }
    
    /**
     * Draw individual holographic diamond
     */
    drawHolographicDiamond(x, y, size) {
        this.ctx.save();
        
        // Create shimmering stroke
        const shimmer = Math.sin(this.animationTime * 0.03 + x * 0.01 + y * 0.01);
        const colorIndex = Math.floor((shimmer + 1) * 4) % this.RAINBOW_COLORS.length;
        
        this.ctx.strokeStyle = this.RAINBOW_COLORS[colorIndex];
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 0.6 + 0.4 * Math.abs(shimmer);
        
        // Draw diamond shape
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - size);
        this.ctx.lineTo(x + size, y);
        this.ctx.lineTo(x, y + size);
        this.ctx.lineTo(x - size, y);
        this.ctx.closePath();
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    /**
     * Draw Art Deco corner ornaments
     */
    drawArtDecoCornerOrnaments() {
        const corners = [
            { x: this.FRAME_BORDER, y: this.FRAME_BORDER },
            { x: this.TEMPLATE_WIDTH - this.FRAME_BORDER, y: this.FRAME_BORDER },
            { x: this.FRAME_BORDER, y: this.TEMPLATE_HEIGHT - this.FRAME_BORDER },
            { x: this.TEMPLATE_WIDTH - this.FRAME_BORDER, y: this.TEMPLATE_HEIGHT - this.FRAME_BORDER }
        ];
        
        corners.forEach((corner, index) => {
            this.drawCornerOrnament(corner.x, corner.y, index);
        });
    }
    
    /**
     * Draw individual corner ornament
     */
    drawCornerOrnament(x, y, index) {
        this.ctx.save();
        
        // Holographic color cycling
        const colorIndex = (Math.floor(this.animationTime * 0.02) + index) % this.RAINBOW_COLORS.length;
        this.ctx.strokeStyle = this.RAINBOW_COLORS[colorIndex];
        this.ctx.lineWidth = 3;
        this.ctx.globalAlpha = 0.8;
        
        // Draw stepped corner design
        const size = 25;
        this.ctx.beginPath();
        
        // Create Art Deco stepped pattern
        for (let i = 0; i < 3; i++) {
            const stepSize = size - (i * 6);
            this.ctx.rect(x - stepSize/2, y - stepSize/2, stepSize, stepSize);
        }
        
        this.ctx.stroke();
        this.ctx.restore();
    }
    
    /**
     * Draw Art Deco side elements
     */
    drawArtDecoSideElements() {
        const centerY = this.TEMPLATE_HEIGHT / 2;
        const centerX = this.TEMPLATE_WIDTH / 2;
        
        // Left and right side elements
        [this.FRAME_BORDER / 2, this.TEMPLATE_WIDTH - this.FRAME_BORDER / 2].forEach((x, index) => {
            this.drawSideElement(x, centerY, index);
        });
        
        // Top and bottom center elements
        [this.FRAME_BORDER / 2, this.TEMPLATE_HEIGHT - this.FRAME_BORDER / 2].forEach((y, index) => {
            this.drawTopBottomElement(centerX, y, index + 2);
        });
    }
    
    /**
     * Draw side decorative element
     */
    drawSideElement(x, y, index) {
        this.ctx.save();
        
        const colorIndex = (Math.floor(this.animationTime * 0.015) + index) % this.RAINBOW_COLORS.length;
        this.ctx.strokeStyle = this.RAINBOW_COLORS[colorIndex];
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 0.7;
        
        // Draw vertical Art Deco element
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - 40);
        this.ctx.lineTo(x, y + 40);
        
        // Add decorative cross elements
        this.ctx.moveTo(x - 15, y - 20);
        this.ctx.lineTo(x + 15, y - 20);
        this.ctx.moveTo(x - 10, y);
        this.ctx.lineTo(x + 10, y);
        this.ctx.moveTo(x - 15, y + 20);
        this.ctx.lineTo(x + 15, y + 20);
        
        this.ctx.stroke();
        this.ctx.restore();
    }
    
    /**
     * Draw top/bottom decorative element
     */
    drawTopBottomElement(x, y, index) {
        this.ctx.save();
        
        const colorIndex = (Math.floor(this.animationTime * 0.015) + index) % this.RAINBOW_COLORS.length;
        this.ctx.strokeStyle = this.RAINBOW_COLORS[colorIndex];
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 0.7;
        
        // Draw horizontal Art Deco element
        this.ctx.beginPath();
        this.ctx.moveTo(x - 40, y);
        this.ctx.lineTo(x + 40, y);
        
        // Add decorative vertical elements
        this.ctx.moveTo(x - 20, y - 10);
        this.ctx.lineTo(x - 20, y + 10);
        this.ctx.moveTo(x, y - 15);
        this.ctx.lineTo(x, y + 15);
        this.ctx.moveTo(x + 20, y - 10);
        this.ctx.lineTo(x + 20, y + 10);
        
        this.ctx.stroke();
        this.ctx.restore();
    }
    
    /**
     * Draw floating black panel (overlaps frame as requested)
     */
    drawFloatingBlackPanel() {
        this.ctx.save();
        
        // Create shadow effect for floating appearance
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 5;
        
        // Draw main black panel
        this.ctx.fillStyle = this.BLACK_PANEL;
        this.ctx.fillRect(this.PANEL_X, this.PANEL_Y, this.PANEL_WIDTH, this.PANEL_HEIGHT);
        
        // Reset shadow
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        // Add subtle holographic border to panel
        this.drawPanelHolographicBorder();
        
        this.ctx.restore();
    }
    
    /**
     * Draw holographic border around black panel
     */
    drawPanelHolographicBorder() {
        this.ctx.save();
        
        const colorIndex = Math.floor(this.animationTime * 0.02) % this.RAINBOW_COLORS.length;
        this.ctx.strokeStyle = this.RAINBOW_COLORS[colorIndex];
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.3;
        
        this.ctx.strokeRect(this.PANEL_X - 1, this.PANEL_Y - 1, this.PANEL_WIDTH + 2, this.PANEL_HEIGHT + 2);
        
        this.ctx.restore();
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
     * Calculate 3D transformation matrix
     */
    calculate3DTransform() {
        const perspective = 0.002;
        const rotationX = this.viewAngle.x * perspective;
        const rotationY = this.viewAngle.y * perspective;
        
        return {
            scaleX: 1 + Math.abs(rotationY) * 0.1,
            scaleY: 1 + Math.abs(rotationX) * 0.1,
            skewX: rotationY,
            skewY: rotationX,
            translateX: this.NOVA_X + rotationY * 10,
            translateY: this.NOVA_Y + rotationX * 10
        };
    }
    
    /**
     * Add depth lighting to Nova image
     */
    addDepthLighting() {
        // Create subtle gradient overlay for depth
        const gradient = this.ctx.createRadialGradient(
            this.NOVA_X + this.NOVA_WIDTH / 2, this.NOVA_Y + this.NOVA_HEIGHT / 2, 0,
            this.NOVA_X + this.NOVA_WIDTH / 2, this.NOVA_Y + this.NOVA_HEIGHT / 2, this.NOVA_WIDTH / 2
        );
        
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(this.NOVA_X, this.NOVA_Y, this.NOVA_WIDTH, this.NOVA_HEIGHT);
    }
    
    /**
     * Setup mouse tracking for 3D effects
     */
    setupMouseTracking() {
        if (!this.mouseTrackingEnabled) {
            this.canvas.addEventListener('mousemove', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Convert to normalized coordinates (-1 to 1)
                this.viewAngle.x = (y / this.TEMPLATE_HEIGHT - 0.5) * 2;
                this.viewAngle.y = (x / this.TEMPLATE_WIDTH - 0.5) * 2;
            });
            
            this.canvas.addEventListener('mouseleave', () => {
                // Smoothly return to center
                this.viewAngle.x *= 0.9;
                this.viewAngle.y *= 0.9;
            });
            
            this.mouseTrackingEnabled = true;
        }
    }
    
    /**
     * Start animation loop for holographic effects
     */
    startAnimationLoop() {
        const animate = () => {
            this.animationTime += 1;
            
            // Update holographic shift
            this.holographicShift = Math.sin(this.animationTime * 0.01) * 0.5 + 0.5;
            
            // Continue animation
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    /**
     * Interpolate between two colors
     */
    interpolateColor(color1, color2, t) {
        const r1 = parseInt(color1.slice(1, 3), 16);
        const g1 = parseInt(color1.slice(3, 5), 16);
        const b1 = parseInt(color1.slice(5, 7), 16);
        
        const r2 = parseInt(color2.slice(1, 3), 16);
        const g2 = parseInt(color2.slice(3, 5), 16);
        const b2 = parseInt(color2.slice(5, 7), 16);
        
        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
}

// Export for use in main application
window.SnapMagicCardTemplateSystem = SnapMagicCardTemplateSystem;
