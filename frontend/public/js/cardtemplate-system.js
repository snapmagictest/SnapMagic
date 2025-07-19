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
        
        // Template dimensions (same as existing system)
        this.TEMPLATE_WIDTH = 500;
        this.TEMPLATE_HEIGHT = 750;
        
        // Art Deco frame specifications (matching cardtemplate.jpg)
        this.FRAME_BORDER = 45;          // Golden frame border width
        this.INNER_SPACING = 15;         // Space between frame and black panel
        
        // Floating black panel (centered, matching cardtemplate.jpg proportions)
        this.PANEL_WIDTH = 380;          // Black panel width
        this.PANEL_HEIGHT = 570;         // Black panel height  
        this.PANEL_X = (this.TEMPLATE_WIDTH - this.PANEL_WIDTH) / 2;  // Centered horizontally
        this.PANEL_Y = 70;               // Top margin for AWS logo space
        
        // Nova Canvas area (PROPERLY CENTERED in black panel, matching cardtemplate.jpg)
        this.NOVA_WIDTH = 320;           // AI image width (reduced to fit better)
        this.NOVA_HEIGHT = 480;          // AI image height (reduced to fit better)
        this.NOVA_X = (this.TEMPLATE_WIDTH - this.NOVA_WIDTH) / 2;  // Perfectly centered horizontally
        this.NOVA_Y = this.PANEL_Y + 45; // Centered vertically in panel with proper spacing
        
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
     * Get current template configuration
     * @returns {Object} Current template configuration
     */
    getTemplateConfig() {
        return this.templateConfig;
    }
    
    /**
     * Validate CardTemplate system readiness
     * @returns {Object} Validation result with status and issues
     */
    validateSystem() {
        const issues = [];
        const warnings = [];
        
        // Check canvas support
        try {
            const testCanvas = document.createElement('canvas');
            const testCtx = testCanvas.getContext('2d');
            if (!testCtx) {
                issues.push('Canvas 2D context not available');
            }
        } catch (error) {
            issues.push('Canvas creation failed: ' + error.message);
        }
        
        // Check required methods
        const requiredMethods = ['drawArtDecoBackground', 'drawHolographicArtDecoFrame', 'drawFloatingBlackPanel'];
        requiredMethods.forEach(method => {
            if (typeof this[method] !== 'function') {
                issues.push(`Required method missing: ${method}`);
            }
        });
        
        // Check configuration
        if (!this.templateConfig) {
            warnings.push('Template configuration not set');
        }
        
        // Check dimensions
        if (!this.TEMPLATE_WIDTH || !this.TEMPLATE_HEIGHT) {
            issues.push('Template dimensions not set');
        }
        
        return {
            isValid: issues.length === 0,
            issues: issues,
            warnings: warnings,
            systemInfo: {
                templateWidth: this.TEMPLATE_WIDTH,
                templateHeight: this.TEMPLATE_HEIGHT,
                hasConfig: !!this.templateConfig,
                configKeys: this.templateConfig ? Object.keys(this.templateConfig) : []
            }
        };
    }
    
    /**
     * Set template configuration from injected config
     */
    setTemplateConfiguration() {
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
                
                // Validate input
                if (!novaImageBase64) {
                    const error = new Error('No Nova Canvas image provided to CardTemplate');
                    console.error('❌ CardTemplate Error:', error.message);
                    reject(error);
                    return;
                }
                
                // Create canvas with both 2D and WebGL contexts
                this.canvas = document.createElement('canvas');
                this.canvas.width = this.TEMPLATE_WIDTH;
                this.canvas.height = this.TEMPLATE_HEIGHT;
                this.ctx = this.canvas.getContext('2d');
                
                if (!this.ctx) {
                    const error = new Error('Failed to get 2D canvas context');
                    console.error('❌ CardTemplate Error:', error.message);
                    reject(error);
                    return;
                }
                
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
                        console.log('📊 Nova image dimensions:', novaImg.width, 'x', novaImg.height);
                        
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
                        console.error('❌ Error in CardTemplate drawing process:', error);
                        console.error('❌ Error stack:', error.stack);
                        reject(error);
                    }
                };
                
                novaImg.onerror = (error) => {
                    const errorMsg = 'Failed to load Nova Canvas image for CardTemplate';
                    console.error('❌ Nova image load error:', errorMsg, error);
                    reject(new Error(errorMsg));
                };
                
                // Load the Nova Canvas image
                try {
                    novaImg.src = `data:image/png;base64,${novaImageBase64}`;
                    console.log('🖼️ Nova image src set, waiting for load...');
                } catch (error) {
                    console.error('❌ Error setting Nova image src:', error);
                    reject(error);
                }
                
            } catch (error) {
                console.error('❌ Error in createCardTemplate initialization:', error);
                console.error('❌ Error stack:', error.stack);
                reject(error);
            }
        });
    }
    
    /**
     * Draw Art Deco background - SOLID BLACK as per cardtemplate.jpg
     */
    drawArtDecoBackground() {
        // Fill entire canvas with solid black background (matching cardtemplate.jpg)
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.TEMPLATE_WIDTH, this.TEMPLATE_HEIGHT);
        
        console.log('✅ Art Deco solid black background drawn');
    }
    
    /**
     * Draw Art Deco frame - GOLDEN with holographic accents (not full rainbow)
     */
    drawHolographicArtDecoFrame() {
        this.ctx.save();
        
        // Draw golden Art Deco frame border (matching cardtemplate.jpg)
        this.drawGoldenFrameBorder();
        
        // Add subtle holographic accents to frame elements
        this.drawHolographicFrameAccents();
        
        // Draw diamond pattern decorations with golden base + holographic shimmer
        this.drawGoldenDiamondPattern();
        
        // Draw corner ornaments in gold
        this.drawGoldenCornerOrnaments();
        
        // Draw side decorative elements in gold
        this.drawGoldenSideElements();
        
        this.ctx.restore();
    }
    
    /**
     * Draw golden frame border (matching cardtemplate.jpg)
     */
    drawGoldenFrameBorder() {
        // Draw the main golden frame border
        this.ctx.strokeStyle = this.GOLD_PRIMARY;
        this.ctx.lineWidth = this.FRAME_BORDER;
        this.ctx.strokeRect(
            this.FRAME_BORDER / 2, 
            this.FRAME_BORDER / 2, 
            this.TEMPLATE_WIDTH - this.FRAME_BORDER, 
            this.TEMPLATE_HEIGHT - this.FRAME_BORDER
        );
        
        // Add inner golden accent line
        this.ctx.strokeStyle = this.GOLD_ACCENT;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(
            this.FRAME_BORDER - 5, 
            this.FRAME_BORDER - 5, 
            this.TEMPLATE_WIDTH - (this.FRAME_BORDER - 5) * 2, 
            this.TEMPLATE_HEIGHT - (this.FRAME_BORDER - 5) * 2
        );
    }
    
    /**
     * Add subtle holographic accents to frame (not full rainbow background)
     */
    drawHolographicFrameAccents() {
        // Only add holographic shimmer to frame elements, not background
        const shimmerIntensity = Math.sin(this.animationTime * 0.02) * 0.3 + 0.7;
        
        // Create subtle holographic shimmer on frame edges
        this.ctx.save();
        this.ctx.globalAlpha = 0.3;
        this.ctx.strokeStyle = this.createFrameShimmerGradient();
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(
            this.FRAME_BORDER / 2 + 2, 
            this.FRAME_BORDER / 2 + 2, 
            this.TEMPLATE_WIDTH - this.FRAME_BORDER - 4, 
            this.TEMPLATE_HEIGHT - this.FRAME_BORDER - 4
        );
        this.ctx.restore();
    }
    
    /**
     * Create shimmer gradient for frame accents only
     */
    createFrameShimmerGradient() {
        const gradient = this.ctx.createLinearGradient(0, 0, this.TEMPLATE_WIDTH, 0);
        
        // Cycle through rainbow colors for shimmer effect
        const colorIndex = Math.floor(this.animationTime * 0.01) % this.RAINBOW_COLORS.length;
        const nextColorIndex = (colorIndex + 1) % this.RAINBOW_COLORS.length;
        const t = (this.animationTime * 0.01) % 1;
        
        const currentColor = this.interpolateColor(
            this.RAINBOW_COLORS[colorIndex], 
            this.RAINBOW_COLORS[nextColorIndex], 
            t
        );
        
        gradient.addColorStop(0, this.GOLD_PRIMARY);
        gradient.addColorStop(0.5, currentColor);
        gradient.addColorStop(1, this.GOLD_PRIMARY);
        
        return gradient;
    }
    
    /**
     * Draw golden diamond pattern (base gold + holographic shimmer)
     */
    drawGoldenDiamondPattern() {
        this.ctx.save();
        
        // Base golden diamonds
        this.ctx.strokeStyle = this.GOLD_PRIMARY;
        this.ctx.lineWidth = 2;
        
        const diamondSize = 15;
        const spacing = 35;
        
        // Top and bottom diamond rows
        for (let x = spacing; x < this.TEMPLATE_WIDTH - spacing; x += spacing) {
            this.drawGoldenDiamond(x, this.FRAME_BORDER / 2, diamondSize);
            this.drawGoldenDiamond(x, this.TEMPLATE_HEIGHT - this.FRAME_BORDER / 2, diamondSize);
        }
        
        // Left and right diamond columns  
        for (let y = spacing * 2; y < this.TEMPLATE_HEIGHT - spacing * 2; y += spacing) {
            this.drawGoldenDiamond(this.FRAME_BORDER / 2, y, diamondSize);
            this.drawGoldenDiamond(this.TEMPLATE_WIDTH - this.FRAME_BORDER / 2, y, diamondSize);
        }
        
        this.ctx.restore();
    }
    
    /**
     * Draw individual golden diamond with subtle holographic shimmer
     */
    drawGoldenDiamond(x, y, size) {
        this.ctx.save();
        
        // Base golden diamond
        this.ctx.strokeStyle = this.GOLD_PRIMARY;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - size);
        this.ctx.lineTo(x + size, y);
        this.ctx.lineTo(x, y + size);
        this.ctx.lineTo(x - size, y);
        this.ctx.closePath();
        this.ctx.stroke();
        
        // Add subtle holographic shimmer (not full rainbow)
        const shimmer = Math.sin(this.animationTime * 0.03 + x * 0.01 + y * 0.01);
        if (shimmer > 0.5) {
            this.ctx.globalAlpha = 0.4;
            const colorIndex = Math.floor((shimmer + 1) * 2) % this.RAINBOW_COLORS.length;
            this.ctx.strokeStyle = this.RAINBOW_COLORS[colorIndex];
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    /**
     * Draw golden corner ornaments
     */
    drawGoldenCornerOrnaments() {
        const corners = [
            { x: this.FRAME_BORDER, y: this.FRAME_BORDER },
            { x: this.TEMPLATE_WIDTH - this.FRAME_BORDER, y: this.FRAME_BORDER },
            { x: this.FRAME_BORDER, y: this.TEMPLATE_HEIGHT - this.FRAME_BORDER },
            { x: this.TEMPLATE_WIDTH - this.FRAME_BORDER, y: this.TEMPLATE_HEIGHT - this.FRAME_BORDER }
        ];
        
        corners.forEach((corner, index) => {
            this.drawGoldenCornerOrnament(corner.x, corner.y, index);
        });
    }
    
    /**
     * Draw individual golden corner ornament
     */
    drawGoldenCornerOrnament(x, y, index) {
        this.ctx.save();
        
        // Base golden color
        this.ctx.strokeStyle = this.GOLD_ACCENT;
        this.ctx.lineWidth = 3;
        
        // Draw stepped corner design
        const size = 20;
        this.ctx.beginPath();
        
        // Create Art Deco stepped pattern
        for (let i = 0; i < 3; i++) {
            const stepSize = size - (i * 5);
            this.ctx.rect(x - stepSize/2, y - stepSize/2, stepSize, stepSize);
        }
        
        this.ctx.stroke();
        
        // Add subtle holographic accent
        const shimmer = Math.sin(this.animationTime * 0.02 + index);
        if (shimmer > 0.3) {
            this.ctx.globalAlpha = 0.5;
            const colorIndex = (Math.floor(this.animationTime * 0.02) + index) % this.RAINBOW_COLORS.length;
            this.ctx.strokeStyle = this.RAINBOW_COLORS[colorIndex];
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    /**
     * Draw golden side elements
     */
    drawGoldenSideElements() {
        const centerY = this.TEMPLATE_HEIGHT / 2;
        const centerX = this.TEMPLATE_WIDTH / 2;
        
        // Left and right side elements
        [this.FRAME_BORDER / 2, this.TEMPLATE_WIDTH - this.FRAME_BORDER / 2].forEach((x, index) => {
            this.drawGoldenSideElement(x, centerY, index);
        });
        
        // Top and bottom center elements
        [this.FRAME_BORDER / 2, this.TEMPLATE_HEIGHT - this.FRAME_BORDER / 2].forEach((y, index) => {
            this.drawGoldenTopBottomElement(centerX, y, index + 2);
        });
    }
    
    /**
     * Draw golden side decorative element
     */
    drawGoldenSideElement(x, y, index) {
        this.ctx.save();
        
        // Base golden color
        this.ctx.strokeStyle = this.GOLD_PRIMARY;
        this.ctx.lineWidth = 2;
        
        // Draw vertical Art Deco element
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - 30);
        this.ctx.lineTo(x, y + 30);
        
        // Add decorative cross elements
        this.ctx.moveTo(x - 10, y - 15);
        this.ctx.lineTo(x + 10, y - 15);
        this.ctx.moveTo(x - 8, y);
        this.ctx.lineTo(x + 8, y);
        this.ctx.moveTo(x - 10, y + 15);
        this.ctx.lineTo(x + 10, y + 15);
        
        this.ctx.stroke();
        
        // Add subtle holographic accent
        const shimmer = Math.sin(this.animationTime * 0.015 + index);
        if (shimmer > 0.4) {
            this.ctx.globalAlpha = 0.4;
            const colorIndex = (Math.floor(this.animationTime * 0.015) + index) % this.RAINBOW_COLORS.length;
            this.ctx.strokeStyle = this.RAINBOW_COLORS[colorIndex];
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    /**
     * Draw golden top/bottom decorative element
     */
    drawGoldenTopBottomElement(x, y, index) {
        this.ctx.save();
        
        // Base golden color
        this.ctx.strokeStyle = this.GOLD_PRIMARY;
        this.ctx.lineWidth = 2;
        
        // Draw horizontal Art Deco element
        this.ctx.beginPath();
        this.ctx.moveTo(x - 30, y);
        this.ctx.lineTo(x + 30, y);
        
        // Add decorative vertical elements
        this.ctx.moveTo(x - 15, y - 8);
        this.ctx.lineTo(x - 15, y + 8);
        this.ctx.moveTo(x, y - 10);
        this.ctx.lineTo(x, y + 10);
        this.ctx.moveTo(x + 15, y - 8);
        this.ctx.lineTo(x + 15, y + 8);
        
        this.ctx.stroke();
        
        // Add subtle holographic accent
        const shimmer = Math.sin(this.animationTime * 0.015 + index);
        if (shimmer > 0.4) {
            this.ctx.globalAlpha = 0.4;
            const colorIndex = (Math.floor(this.animationTime * 0.015) + index) % this.RAINBOW_COLORS.length;
            this.ctx.strokeStyle = this.RAINBOW_COLORS[colorIndex];
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
        
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
     * Draw holographic border around black panel (subtle, not rainbow)
     */
    drawPanelHolographicBorder() {
        this.ctx.save();
        
        // Very subtle golden border with minimal holographic accent
        this.ctx.strokeStyle = this.GOLD_SECONDARY;
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.6;
        
        this.ctx.strokeRect(this.PANEL_X - 1, this.PANEL_Y - 1, this.PANEL_WIDTH + 2, this.PANEL_HEIGHT + 2);
        
        // Add very subtle holographic shimmer only occasionally
        const shimmer = Math.sin(this.animationTime * 0.01);
        if (shimmer > 0.8) {
            this.ctx.globalAlpha = 0.2;
            const colorIndex = Math.floor(this.animationTime * 0.005) % this.RAINBOW_COLORS.length;
            this.ctx.strokeStyle = this.RAINBOW_COLORS[colorIndex];
            this.ctx.strokeRect(this.PANEL_X - 1, this.PANEL_Y - 1, this.PANEL_WIDTH + 2, this.PANEL_HEIGHT + 2);
        }
        
        this.ctx.restore();
    }
    
    /**
     * Draw Nova Canvas image with 3D depth effects
     */
    drawNovaImageWith3D(novaImg) {
        this.ctx.save();
        
        // Apply subtle 3D transformation based on view angle
        const transform = this.calculate3DTransform();
        this.ctx.setTransform(
            transform.scaleX, transform.skewX,
            transform.skewY, transform.scaleY,
            transform.translateX, transform.translateY
        );
        
        // Draw Nova Canvas image
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
