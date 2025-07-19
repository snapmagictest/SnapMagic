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
        
        // Art Deco frame specifications (from cardtemplate.jpg analysis)
        this.FRAME_BORDER = 45;          // Golden frame border width
        this.INNER_SPACING = 15;         // Space between frame and black panel
        
        // Black panel area (the central black rectangle in cardtemplate.jpg)
        this.PANEL_WIDTH = 380;          // Black panel width
        this.PANEL_HEIGHT = 570;         // Black panel height
        this.PANEL_X = (this.TEMPLATE_WIDTH - this.PANEL_WIDTH) / 2;  // Centered: (500-380)/2 = 60
        this.PANEL_Y = 70;               // Top margin for AWS logo space
        
        // Nova Canvas area (PROPERLY positioned in the black panel center)
        // Based on cardtemplate.jpg, the image should fill most of the black area with some padding
        this.NOVA_WIDTH = 320;           // Image width (leaves 30px margin on each side)
        this.NOVA_HEIGHT = 480;          // Image height (leaves 45px margin top/bottom)
        this.NOVA_X = this.PANEL_X + (this.PANEL_WIDTH - this.NOVA_WIDTH) / 2;   // Centered in panel: 60 + (380-320)/2 = 90
        this.NOVA_Y = this.PANEL_Y + (this.PANEL_HEIGHT - this.NOVA_HEIGHT) / 2; // Centered in panel: 70 + (570-480)/2 = 115
        
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
                
                // Draw Art Deco background and frame
                this.drawArtDecoBackground();
                this.drawHolographicArtDecoFrame();
                console.log('✅ Art Deco frame with holographic effects drawn');
                
                // Load and draw Nova Canvas image
                const novaImg = new Image();
                novaImg.onload = async () => {
                    try {
                        console.log('✅ Nova Canvas image loaded for CardTemplate');
                        
                        // Draw floating black panel with stencil effect
                        this.drawFloatingBlackPanel();
                        console.log('✅ Floating black panel drawn');
                        
                        // Draw Nova Canvas image with 3D depth effects
                        this.drawNovaImageWith3D(novaImg);
                        console.log('✅ Nova Canvas image with 3D effects drawn');
                        
                        // Draw 3D sparkles and surface effects
                        await this.draw3DSparkleEffects();
                        console.log('✅ 3D sparkle effects drawn');
                        
                        // Draw AWS logo and branding
                        await this.drawCardTemplateLogo();
                        await this.drawCardTemplateFooter();
                        console.log('✅ CardTemplate branding drawn');
                        
                        // Apply final holographic enhancement
                        this.applyHolographicEnhancement();
                        console.log('✅ Holographic enhancement applied');
                        
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
        // Fill entire canvas with deep black base
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.TEMPLATE_WIDTH, this.TEMPLATE_HEIGHT);
        
        console.log('✅ Art Deco background drawn');
    }
    
    /**
     * Draw holographic Art Deco frame with rainbow effects
     */
    drawHolographicArtDecoFrame() {
        this.ctx.save();
        
        // Create holographic gradient for frame
        const gradient = this.createHolographicGradient();
        
        // Draw outer Art Deco frame
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.TEMPLATE_WIDTH, this.TEMPLATE_HEIGHT);
        
        // Draw diamond pattern decorations with holographic effect
        this.drawHolographicDiamondPattern();
        
        // Draw corner ornaments
        this.drawArtDecoCornerOrnaments();
        
        // Draw side decorative elements
        this.drawArtDecoSideElements();
        
        this.ctx.restore();
    }
    
    /**
     * Create holographic gradient with rainbow cycling
     */
    createHolographicGradient() {
        const gradient = this.ctx.createLinearGradient(0, 0, this.TEMPLATE_WIDTH, this.TEMPLATE_HEIGHT);
        
        // Use your existing rainbow colors with animation
        const colorIndex = Math.floor(this.animationTime * 0.01) % this.RAINBOW_COLORS.length;
        const nextColorIndex = (colorIndex + 1) % this.RAINBOW_COLORS.length;
        
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
     * Draw Nova Canvas image with 3D depth effects (with positioning debug)
     */
    drawNovaImageWith3D(novaImg) {
        this.ctx.save();
        
        // Debug: Log positioning calculations
        console.log('🖼️ Nova Image Positioning Debug:');
        console.log(`   Template: ${this.TEMPLATE_WIDTH}x${this.TEMPLATE_HEIGHT}`);
        console.log(`   Panel: ${this.PANEL_WIDTH}x${this.PANEL_HEIGHT} at (${this.PANEL_X}, ${this.PANEL_Y})`);
        console.log(`   Nova: ${this.NOVA_WIDTH}x${this.NOVA_HEIGHT} at (${this.NOVA_X}, ${this.NOVA_Y})`);
        console.log(`   Nova bounds: left=${this.NOVA_X}, right=${this.NOVA_X + this.NOVA_WIDTH}, top=${this.NOVA_Y}, bottom=${this.NOVA_Y + this.NOVA_HEIGHT}`);
        console.log(`   Panel bounds: left=${this.PANEL_X}, right=${this.PANEL_X + this.PANEL_WIDTH}, top=${this.PANEL_Y}, bottom=${this.PANEL_Y + this.PANEL_HEIGHT}`);
        
        // Debug: Draw positioning guide rectangles (temporary - remove after testing)
        this.ctx.strokeStyle = '#ff0000'; // Red for Nova area
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.NOVA_X, this.NOVA_Y, this.NOVA_WIDTH, this.NOVA_HEIGHT);
        
        this.ctx.strokeStyle = '#00ff00'; // Green for Panel area
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(this.PANEL_X, this.PANEL_Y, this.PANEL_WIDTH, this.PANEL_HEIGHT);
        
        // Apply subtle 3D transformation based on view angle
        const transform = this.calculate3DTransform();
        this.ctx.setTransform(
            transform.scaleX, transform.skewX,
            transform.skewY, transform.scaleY,
            transform.translateX, transform.translateY
        );
        
        // Draw Nova Canvas image
        console.log(`🎨 Drawing Nova image at (${this.NOVA_X}, ${this.NOVA_Y}) with size ${this.NOVA_WIDTH}x${this.NOVA_HEIGHT}`);
        this.ctx.drawImage(novaImg, this.NOVA_X, this.NOVA_Y, this.NOVA_WIDTH, this.NOVA_HEIGHT);
        
        // Add depth lighting effect
        this.addDepthLighting();
        
        this.ctx.restore();
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
