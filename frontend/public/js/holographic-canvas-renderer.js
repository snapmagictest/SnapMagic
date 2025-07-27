/**
 * SnapMagic Holographic Card Canvas Renderer
 * Recreates the exact holographic trading card design in pure canvas
 * Preserves all CSS effects: gradients, blend modes, animations, transparency
 */

class HolographicCanvasRenderer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.cardWidth = 366;  // Default card width
        this.cardHeight = 477; // Default card height (5/6.5 aspect ratio)
        this.images = {};
        this.fonts = {};
        
        // Animation timing constants (matching your CSS)
        this.FLOAT_DURATION = 8000;     // 8s autoFloat
        this.GRADIENT_DURATION = 6000;  // 6s autoGradientSweep  
        this.SPARKLE_DURATION = 10000;  // 10s autoSparkleMove
        this.SHINE_DURATION = 3000;     // 3s logoShine
        
        // AWS brand colors (matching your CSS variables)
        this.colors = {
            awsOrange: '#FF9900',
            awsBlue: '#4B9CD3',
            awsDark: '#232F3E',
            holoColor1: '#FF9900',
            holoColor2: '#4B9CD3', 
            holoColor3: '#DAA520',
            holoColor4: '#E67E22',
            holoColor5: '#FF7F50'
        };
    }

    /**
     * Initialize canvas with card dimensions - MAXIMUM CLARITY
     */
    initCanvas(width = 366, height = 477) {
        this.cardWidth = width;
        this.cardHeight = height;
        
        this.canvas = document.createElement('canvas');
        
        // CRITICAL: Use higher resolution for crisp text and logos
        const pixelRatio = window.devicePixelRatio || 2;
        this.canvas.width = width * pixelRatio;
        this.canvas.height = height * pixelRatio;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        
        this.ctx = this.canvas.getContext('2d');
        
        // Scale context to match pixel ratio for crisp rendering
        this.ctx.scale(pixelRatio, pixelRatio);
        
        // MAXIMUM quality rendering settings
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        
        // CRITICAL: Optimize text rendering for maximum clarity
        this.ctx.textRenderingOptimization = 'optimizeQuality';
        this.ctx.fontKerning = 'normal';
        this.ctx.fontStretch = 'normal';
        this.ctx.fontVariantCaps = 'normal';
        
        // Additional quality settings
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.miterLimit = 10;
        
        console.log('🎨 MAXIMUM CLARITY canvas initialized:', { 
            width, 
            height, 
            pixelRatio,
            actualWidth: this.canvas.width,
            actualHeight: this.canvas.height,
            textOptimization: 'Maximum Quality'
        });
        return this.canvas;
    }

    /**
     * Load all required images for the card
     */
    async loadImages(cardData) {
        console.log('🖼️ Loading card images...');
        
        const imagePromises = [];
        
        // Load AWS logo
        imagePromises.push(this.loadImage('/powered-by-aws-white-horizontal.png', 'awsLogo'));
        
        // Load AI generated image (Nova Canvas result)
        if (cardData.result) {
            const aiImageSrc = `data:image/png;base64,${cardData.result}`;
            imagePromises.push(this.loadImage(aiImageSrc, 'aiImage'));
        }
        
        // Load customer/partner logos
        imagePromises.push(this.loadImage('/logos/1.png', 'customerLogo'));
        imagePromises.push(this.loadImage('/logos/2.png', 'partnerLogo'));
        
        await Promise.all(imagePromises);
        console.log('✅ All images loaded');
    }

    /**
     * Load a single image
     */
    async loadImage(src, key) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                this.images[key] = img;
                console.log(`✅ Loaded ${key}`);
                resolve(img);
            };
            img.onerror = () => {
                console.warn(`⚠️ Failed to load ${key}, using fallback`);
                this.images[key] = null;
                resolve(null); // Don't reject, just continue without this image
            };
            img.src = src;
        });
    }

    /**
     * Render complete holographic card at specific animation frame
     */
    renderCard(frameIndex, totalFrames, cardData) {
        const ctx = this.ctx;
        const animationTime = (frameIndex / totalFrames) * Math.max(
            this.FLOAT_DURATION, 
            this.GRADIENT_DURATION, 
            this.SPARKLE_DURATION
        );
        
        // Clear canvas
        ctx.clearRect(0, 0, this.cardWidth, this.cardHeight);
        
        // Save context for transformations
        ctx.save();
        
        // Apply 3D card rotation (autoFloat animation)
        this.apply3DTransform(ctx, animationTime);
        
        // Draw card background
        this.drawCardBackground(ctx);
        
        // Draw card content layers
        this.drawBulkHeadHeader(ctx, animationTime);
        this.drawAIImage(ctx, cardData);
        this.drawEventName(ctx);
        this.drawCardFooter(ctx, cardData);
        
        // Draw holographic overlays (the magic!)
        this.drawHolographicGradient(ctx, animationTime);
        this.drawSparkleOverlay(ctx, animationTime);
        
        // Restore context
        ctx.restore();
    }

    /**
     * Apply 3D card rotation (matching autoFloat CSS animation)
     */
    apply3DTransform(ctx, animationTime) {
        const progress = (animationTime % this.FLOAT_DURATION) / this.FLOAT_DURATION;
        const cycle = progress * 2 * Math.PI;
        
        // Calculate rotation angles (matching your CSS keyframes)
        let rotateX = 0, rotateY = 0, rotateZ = 0;
        
        if (progress <= 0.25) {
            // 0% → 25%: rotateX(2deg) rotateY(-3deg) rotateZ(0.5deg)
            const t = progress / 0.25;
            rotateX = t * 2;
            rotateY = t * -3;
            rotateZ = t * 0.5;
        } else if (progress <= 0.5) {
            // 25% → 50%: rotateX(-1deg) rotateY(4deg) rotateZ(-0.3deg)
            const t = (progress - 0.25) / 0.25;
            rotateX = 2 + t * (-1 - 2);
            rotateY = -3 + t * (4 - (-3));
            rotateZ = 0.5 + t * (-0.3 - 0.5);
        } else if (progress <= 0.75) {
            // 50% → 75%: rotateX(3deg) rotateY(2deg) rotateZ(0.8deg)
            const t = (progress - 0.5) / 0.25;
            rotateX = -1 + t * (3 - (-1));
            rotateY = 4 + t * (2 - 4);
            rotateZ = -0.3 + t * (0.8 - (-0.3));
        } else {
            // 75% → 100%: back to rotateX(0deg) rotateY(0deg) rotateZ(0deg)
            const t = (progress - 0.75) / 0.25;
            rotateX = 3 + t * (0 - 3);
            rotateY = 2 + t * (0 - 2);
            rotateZ = 0.8 + t * (0 - 0.8);
        }
        
        // Apply 3D perspective transform
        const centerX = this.cardWidth / 2;
        const centerY = this.cardHeight / 2;
        
        ctx.translate(centerX, centerY);
        
        // Convert degrees to radians and apply rotation
        const radX = rotateX * Math.PI / 180;
        const radY = rotateY * Math.PI / 180;
        const radZ = rotateZ * Math.PI / 180;
        
        // Apply Z rotation
        ctx.rotate(radZ);
        
        // Apply perspective for X and Y rotations (simplified 3D projection)
        const perspective = 1000;
        const scaleX = Math.cos(radY);
        const scaleY = Math.cos(radX);
        const skewX = Math.sin(radY) * 0.5;
        const skewY = Math.sin(radX) * 0.5;
        
        ctx.transform(scaleX, skewY, skewX, scaleY, 0, 0);
        ctx.translate(-centerX, -centerY);
    }

    /**
     * Draw card background with gradient and border
     */
    drawCardBackground(ctx) {
        const gradient = ctx.createLinearGradient(0, 0, this.cardWidth, this.cardHeight);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        
        // Draw background
        ctx.fillStyle = gradient;
        this.roundRect(ctx, 0, 0, this.cardWidth, this.cardHeight, 15);
        ctx.fill();
        
        // Draw border
        ctx.strokeStyle = 'rgba(255, 153, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    /**
     * Draw 3D bulk head header with AWS logo
     */
    drawBulkHeadHeader(ctx, animationTime) {
        const headerHeight = Math.max(32, this.cardHeight * 0.1);
        const margin = Math.max(10, this.cardWidth * 0.027);
        
        // Create 3D bulk head gradient
        const headerGradient = ctx.createLinearGradient(0, -margin, 0, headerHeight + margin);
        headerGradient.addColorStop(0, '#4a5568');
        headerGradient.addColorStop(0.25, '#2d3748');
        headerGradient.addColorStop(0.5, '#1a202c');
        headerGradient.addColorStop(0.75, '#0f1419');
        headerGradient.addColorStop(1, '#000000');
        
        // Draw header background
        ctx.fillStyle = headerGradient;
        this.roundRect(ctx, margin, margin, this.cardWidth - 2 * margin, headerHeight, 12);
        ctx.fill();
        
        // Add 3D shadow effects
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;
        ctx.fill();
        ctx.shadowColor = 'transparent';
        
        // Draw AWS logo with shine animation
        if (this.images.awsLogo) {
            this.drawAWSLogoWithShine(ctx, animationTime, margin, headerHeight);
        }
    }

    /**
     * Draw AWS logo with animated shine effect - ENHANCED CLARITY
     */
    drawAWSLogoWithShine(ctx, animationTime, headerMargin, headerHeight) {
        const logo = this.images.awsLogo;
        const logoHeight = Math.max(20, headerHeight * 0.6);
        const logoWidth = (logo.width / logo.height) * logoHeight;
        
        const logoX = (this.cardWidth - logoWidth) / 2;
        const logoY = headerMargin + (headerHeight - logoHeight) / 2;
        
        // Calculate shine intensity (logoShine animation)
        const shineProgress = (animationTime % this.SHINE_DURATION) / this.SHINE_DURATION;
        const shineIntensity = Math.sin(shineProgress * 2 * Math.PI) * 0.15 + 1.1;
        
        // Apply shine filter effect
        ctx.save();
        
        // CRITICAL: Disable smoothing for crisp logo
        ctx.imageSmoothingEnabled = false;
        
        ctx.filter = `brightness(${shineIntensity}) contrast(1.15)`;
        
        // Add drop shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;
        
        // Pixel-perfect positioning
        const pixelPerfectX = Math.round(logoX);
        const pixelPerfectY = Math.round(logoY);
        const pixelPerfectWidth = Math.round(logoWidth);
        const pixelPerfectHeight = Math.round(logoHeight);
        
        ctx.drawImage(logo, pixelPerfectX, pixelPerfectY, pixelPerfectWidth, pixelPerfectHeight);
        
        ctx.restore();
    }

    /**
     * Draw AI generated image
     */
    drawAIImage(ctx, cardData) {
        if (!this.images.aiImage) return;
        
        const img = this.images.aiImage;
        const margin = Math.max(10, this.cardWidth * 0.027);
        const headerHeight = Math.max(32, this.cardHeight * 0.1);
        const footerHeight = Math.max(60, this.cardHeight * 0.15);
        const eventNameHeight = 30;
        
        const imageY = headerHeight + margin * 2;
        const imageHeight = this.cardHeight - imageY - footerHeight - eventNameHeight - margin * 2;
        const imageWidth = this.cardWidth - 2 * margin;
        
        // Draw image with rounded corners
        ctx.save();
        this.roundRect(ctx, margin, imageY, imageWidth, imageHeight, 8);
        ctx.clip();
        ctx.drawImage(img, margin, imageY, imageWidth, imageHeight);
        ctx.restore();
        
        // Add subtle border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        this.roundRect(ctx, margin, imageY, imageWidth, imageHeight, 8);
        ctx.stroke();
    }

    /**
     * Draw event name - ENHANCED TEXT CLARITY
     */
    drawEventName(ctx) {
        const eventName = 'AWS re:Invent 2024';
        const fontSize = Math.max(14, this.cardWidth * 0.04);
        
        ctx.save();
        
        // Enhanced font rendering
        ctx.font = `bold ${fontSize}px "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.fillStyle = this.colors.awsOrange;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add text shadow for better visibility
        ctx.shadowColor = 'rgba(255, 153, 0, 0.3)';
        ctx.shadowBlur = 5;
        
        // Pixel-perfect text positioning
        const textX = Math.round(this.cardWidth / 2);
        const textY = Math.round(this.cardHeight - 90);
        
        ctx.fillText(eventName, textX, textY);
        
        ctx.restore();
    }

    /**
     * Draw card footer with logos and creator info
     */
    drawCardFooter(ctx, cardData) {
        const margin = Math.max(10, this.cardWidth * 0.027);
        const footerHeight = 60;
        const footerY = this.cardHeight - footerHeight - margin;
        
        // Draw 3D etched footer background
        const footerGradient = ctx.createLinearGradient(0, footerY, 0, footerY + footerHeight);
        footerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
        footerGradient.addColorStop(1, 'rgba(255, 255, 255, 0.02)');
        
        ctx.fillStyle = footerGradient;
        this.roundRect(ctx, margin, footerY, this.cardWidth - 2 * margin, footerHeight, 8);
        ctx.fill();
        
        // Add 3D etched effect
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw inset shadow effect
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        this.roundRect(ctx, margin + 1, footerY + 1, this.cardWidth - 2 * margin - 2, footerHeight - 2, 7);
        ctx.stroke();
        ctx.restore();
        
        // Draw logos and creator info
        this.drawFooterContent(ctx, footerY, footerHeight, cardData);
    }

    /**
     * Draw footer content (logos and creator info) - FIXED POSITIONING & USER NAME
     */
    drawFooterContent(ctx, footerY, footerHeight, cardData) {
        const margin = Math.max(10, this.cardWidth * 0.027);
        const maxLogoHeight = Math.max(35, footerHeight * 0.7);
        
        // FIXED: Get actual user name from cardData with 25-character limit
        console.log('🔍 DEBUG: cardData for name extraction:', {
            userName: cardData.userName,
            user_name: cardData.user_name,
            name: cardData.name,
            prompt: cardData.prompt
        });
        
        // Try multiple possible name fields and enforce 25-character limit
        let rawCreatorName = cardData.userName || 
                            cardData.user_name || 
                            cardData.name || 
                            (cardData.prompt && this.extractNameFromPrompt(cardData.prompt)) ||
                            'NOVA';
        
        // CRITICAL: Enforce 25-character limit for generation and download
        let creatorName = rawCreatorName.length > 25 ? 
                         rawCreatorName.substring(0, 25) + '...' : 
                         rawCreatorName;
        
        // CRITICAL: ALWAYS FORCE UPPERCASE for consistent display
        creatorName = creatorName.toUpperCase();
        const creatorTitle = 'Creator';
        
        console.log('✅ Using creator name:', creatorName);
        
        // FIXED: Calculate proper logo layout with proportional sizing
        const footerContentWidth = this.cardWidth - 2 * margin - 20; // Available width
        const creatorTextWidth = 120; // Reserve space for creator text
        const availableLogoWidth = footerContentWidth - creatorTextWidth;
        
        let leftX = margin + 10;
        
        // Draw customer logo (1.png) - LEFT SIDE with proper proportions
        if (this.images.customerLogo) {
            ctx.save();
            ctx.imageSmoothingEnabled = false;
            
            const logo = this.images.customerLogo;
            const aspectRatio = logo.width / logo.height;
            
            // Calculate proportional size - limit width to prevent oversizing
            let logoWidth = maxLogoHeight * aspectRatio;
            let logoHeight = maxLogoHeight;
            
            // If logo is too wide, scale it down proportionally
            const maxLogoWidth = availableLogoWidth * 0.4; // Max 40% of available space
            if (logoWidth > maxLogoWidth) {
                logoWidth = maxLogoWidth;
                logoHeight = logoWidth / aspectRatio;
            }
            
            // Position on left side
            const logoX = Math.round(leftX);
            const logoY = Math.round(footerY + (footerHeight - logoHeight) / 2);
            
            ctx.drawImage(logo, logoX, logoY, Math.round(logoWidth), Math.round(logoHeight));
            ctx.restore();
            
            leftX += logoWidth + 8; // Add spacing after first logo
        }
        
        // Draw partner logo (2.png) - NEXT TO 1.png with proper proportions
        if (this.images.partnerLogo) {
            ctx.save();
            ctx.imageSmoothingEnabled = false;
            
            const logo = this.images.partnerLogo;
            const aspectRatio = logo.width / logo.height;
            
            // Calculate proportional size
            let logoWidth = maxLogoHeight * aspectRatio;
            let logoHeight = maxLogoHeight;
            
            // If logo is too wide, scale it down proportionally
            const maxLogoWidth = availableLogoWidth * 0.4; // Max 40% of available space
            if (logoWidth > maxLogoWidth) {
                logoWidth = maxLogoWidth;
                logoHeight = logoWidth / aspectRatio;
            }
            
            // Position next to customer logo
            const logoX = Math.round(leftX);
            const logoY = Math.round(footerY + (footerHeight - logoHeight) / 2);
            
            ctx.drawImage(logo, logoX, logoY, Math.round(logoWidth), Math.round(logoHeight));
            ctx.restore();
        }
        
        // Draw creator info with ACTUAL USER NAME - RIGHT SIDE
        ctx.save();
        
        ctx.textAlign = 'right';
        ctx.textBaseline = 'alphabetic';
        ctx.textRenderingOptimization = 'optimizeQuality';
        
        // Creator name with MAXIMUM clarity
        const nameSize = Math.max(12, this.cardWidth * 0.033);
        ctx.font = `bold ${nameSize}px "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif`;
        ctx.fillStyle = '#FFFFFF';
        
        // Add subtle text stroke for extra clarity
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 0.5;
        
        // Position on right side
        const textX = Math.round(this.cardWidth - margin - 10);
        const nameY = Math.round(footerY + 26);
        
        // Draw actual user name
        ctx.strokeText(creatorName, textX, nameY);
        ctx.fillText(creatorName, textX, nameY);
        
        // Creator title
        const titleSize = Math.max(10, this.cardWidth * 0.027);
        ctx.font = `${titleSize}px "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 0.3;
        
        const titleY = Math.round(footerY + 46);
        
        ctx.strokeText(creatorTitle, textX, titleY);
        ctx.fillText(creatorTitle, textX, titleY);
        
        ctx.restore();
    }

    /**
     * Extract name from prompt if no explicit name provided
     */
    extractNameFromPrompt(prompt) {
        // Simple extraction - look for common patterns
        const patterns = [
            /my name is ([a-zA-Z\s]+)/i,
            /i am ([a-zA-Z\s]+)/i,
            /call me ([a-zA-Z\s]+)/i
        ];
        
        for (const pattern of patterns) {
            const match = prompt.match(pattern);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
        
        return null;
    }

    /**
     * Draw holographic rainbow gradient overlay (::before effect)
     */
    drawHolographicGradient(ctx, animationTime) {
        const progress = (animationTime % this.GRADIENT_DURATION) / this.GRADIENT_DURATION;
        
        // Create animated gradient (matching autoGradientSweep)
        const gradient = ctx.createLinearGradient(0, 0, this.cardWidth, this.cardHeight);
        
        // Animate gradient position
        const offset = Math.sin(progress * 2 * Math.PI) * 0.3;
        
        gradient.addColorStop(Math.max(0, 0 + offset), 'transparent');
        gradient.addColorStop(Math.max(0, 0.15 + offset), this.colors.holoColor4);
        gradient.addColorStop(Math.max(0, 0.25 + offset), this.colors.holoColor1);
        gradient.addColorStop(Math.max(0, 0.35 + offset), this.colors.holoColor5);
        gradient.addColorStop(Math.min(1, 0.47 + offset), 'transparent');
        gradient.addColorStop(Math.min(1, 0.53 + offset), 'transparent');
        gradient.addColorStop(Math.min(1, 0.65 + offset), this.colors.holoColor2);
        gradient.addColorStop(Math.min(1, 0.75 + offset), this.colors.holoColor3);
        gradient.addColorStop(Math.min(1, 0.85 + offset), this.colors.holoColor4);
        gradient.addColorStop(1, 'transparent');
        
        // Apply overlay blend mode and opacity
        ctx.save();
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = 0.3 + Math.sin(progress * 2 * Math.PI) * 0.2; // Animated opacity
        
        ctx.fillStyle = gradient;
        this.roundRect(ctx, 0, 0, this.cardWidth, this.cardHeight, 15);
        ctx.fill();
        
        ctx.restore();
    }

    /**
     * Draw sparkle overlay (::after effect)
     */
    drawSparkleOverlay(ctx, animationTime) {
        const progress = (animationTime % this.SPARKLE_DURATION) / this.SPARKLE_DURATION;
        
        // Create animated sparkle gradient (matching autoSparkleMove)
        const sparkleGradient = ctx.createRadialGradient(
            this.cardWidth * (0.5 + Math.sin(progress * 2 * Math.PI) * 0.3),
            this.cardHeight * (0.5 + Math.cos(progress * 2 * Math.PI) * 0.3),
            0,
            this.cardWidth * 0.5,
            this.cardHeight * 0.5,
            Math.max(this.cardWidth, this.cardHeight) * 0.8
        );
        
        sparkleGradient.addColorStop(0.1, '#FFD70020');
        sparkleGradient.addColorStop(0.2, '#FFA50025');
        sparkleGradient.addColorStop(0.3, '#FF8C0018');
        sparkleGradient.addColorStop(0.4, '#ffff0025');
        sparkleGradient.addColorStop(0.5, '#DAA52010');
        sparkleGradient.addColorStop(0.6, '#00ff8a15');
        sparkleGradient.addColorStop(0.7, '#00cfff30');
        sparkleGradient.addColorStop(0.8, '#FFB84D25');
        sparkleGradient.addColorStop(0.9, '#cc4cfa35');
        
        // Apply color-dodge blend mode
        ctx.save();
        ctx.globalCompositeOperation = 'color-dodge';
        ctx.globalAlpha = 0.3 + Math.cos(progress * 4 * Math.PI) * 0.2; // Animated opacity
        
        ctx.fillStyle = sparkleGradient;
        this.roundRect(ctx, 0, 0, this.cardWidth, this.cardHeight, 15);
        ctx.fill();
        
        ctx.restore();
    }

    /**
     * Helper: Draw rounded rectangle
     */
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    /**
     * Generate animated GIF from canvas frames
     */
    async generateAnimatedGIF(cardData, options = {}) {
        const settings = {
            frames: 30,
            framerate: 15,
            quality: 1,
            ...options
        };
        
        console.log('🎬 Starting canvas-based animated GIF generation...');
        
        // Load all required images
        await this.loadImages(cardData);
        
        // Initialize canvas
        this.initCanvas();
        
        // Generate frames
        const frames = [];
        for (let frame = 0; frame < settings.frames; frame++) {
            console.log(`🎨 Rendering frame ${frame + 1}/${settings.frames}`);
            
            // Render card at this animation frame
            this.renderCard(frame, settings.frames, cardData);
            
            // Capture frame
            const frameDataURL = this.canvas.toDataURL('image/png');
            frames.push(frameDataURL);
        }
        
        console.log('🎬 All frames rendered, creating GIF...');
        
        // Create GIF using existing gif.js system
        return await this.createGIFFromFrames(frames, settings);
    }

    /**
     * Create GIF from frames (reuse existing gif.js logic)
     */
    async createGIFFromFrames(frames, settings) {
        // Load gif.js if not already loaded
        if (!window.GIF) {
            await this.loadGifJS();
        }
        
        return new Promise((resolve, reject) => {
            const gif = new GIF({
                workers: 2,
                quality: settings.quality,
                workerScript: '/gif.worker.js',
                comment: 'SnapMagic Holographic Card - Canvas Rendered'
            });
            
            let loadedFrames = 0;
            const frameDuration = Math.round(1000 / settings.framerate);
            
            frames.forEach((frameDataURL) => {
                const img = new Image();
                img.onload = () => {
                    gif.addFrame(img, { delay: frameDuration });
                    loadedFrames++;
                    
                    if (loadedFrames === frames.length) {
                        gif.render();
                    }
                };
                img.src = frameDataURL;
            });
            
            gif.on('finished', (blob) => {
                console.log('✅ Canvas-based animated GIF completed:', {
                    size: Math.round(blob.size / 1024) + 'KB',
                    frames: frames.length
                });
                resolve(blob);
            });
            
            gif.on('error', reject);
        });
    }

    /**
     * Load gif.js library
     */
    async loadGifJS() {
        if (window.GIF) return;
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = '/gif.min.js';
            script.onload = () => {
                console.log('✅ gif.js loaded for canvas rendering');
                resolve();
            };
            script.onerror = () => reject(new Error('Failed to load gif.js'));
            document.head.appendChild(script);
        });
    }
}

// Make available globally
window.HolographicCanvasRenderer = HolographicCanvasRenderer;
