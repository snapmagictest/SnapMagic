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
     * Initialize canvas with configurable dimensions - FLEXIBLE PARALLEL SYSTEM
     */
    initCanvas(width, height) {
        // Don't override cardWidth/cardHeight - they should be set separately
        this.canvas = document.createElement('canvas');
        
        // CRITICAL: Normalize pixel ratio for consistent file sizes across all devices
        const pixelRatio = 1; // Force 1x ratio for all devices to ensure consistent output
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
        
        console.log('🎨 FLEXIBLE canvas initialized for parallel system:', { 
            width, 
            height, 
            pixelRatio: 1,
            actualWidth: this.canvas.width,
            actualHeight: this.canvas.height,
            system: 'Configurable dimensions'
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
        
        // ENHANCED: Draw animated glow effects BEFORE card (like CSS box-shadow)
        this.drawAnimatedGlow(ctx, animationTime);
        
        // Apply 3D card rotation (autoFloat animation)
        this.apply3DTransform(ctx, animationTime);
        
        // Draw card background
        this.drawCardBackground(ctx);
        
        // Draw card content layers
        this.drawBulkHeadHeader(ctx, animationTime);
        this.drawAIImage(ctx, cardData);
        this.drawEventName(ctx);
        this.drawCardFooter(ctx, cardData);
        
        // ENHANCED: Draw dual holographic overlays (::before and ::after effects)
        this.drawHolographicGradient(ctx, animationTime);      // ::before effect
        this.drawSparkleOverlay(ctx, animationTime);           // ::after effect
        this.drawColorDodgeOverlay(ctx, animationTime);        // Additional color-dodge effect
        
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
     * Draw animated glow effects (matching CSS box-shadow animation)
     */
    drawAnimatedGlow(ctx, animationTime) {
        const progress = (animationTime % this.FLOAT_DURATION) / this.FLOAT_DURATION;
        const cycle = progress * 2 * Math.PI;
        
        // Calculate animation keyframes (matching autoFloat CSS)
        let shadowColor1, shadowColor2, glowIntensity;
        
        if (progress < 0.25) {
            // 0% → 25%: Default to intense glow
            const t = progress / 0.25;
            shadowColor1 = this.interpolateColor('#DAA520', '#E67E22', t);
            shadowColor2 = this.interpolateColor('#4B9CD3', '#FF9900', t);
            glowIntensity = 0.3 + t * 0.4;
        } else if (progress < 0.5) {
            // 25% → 50%: Intense to medium glow
            const t = (progress - 0.25) / 0.25;
            shadowColor1 = this.interpolateColor('#E67E22', '#FF7F50', t);
            shadowColor2 = this.interpolateColor('#FF9900', '#4B9CD3', t);
            glowIntensity = 0.7 - t * 0.3;
        } else if (progress < 0.75) {
            // 50% → 75%: Medium to strong glow
            const t = (progress - 0.5) / 0.25;
            shadowColor1 = this.interpolateColor('#FF7F50', '#FF9900', t);
            shadowColor2 = this.interpolateColor('#4B9CD3', '#4B9CD3', t);
            glowIntensity = 0.4 + t * 0.2;
        } else {
            // 75% → 100%: Strong back to default
            const t = (progress - 0.75) / 0.25;
            shadowColor1 = this.interpolateColor('#FF9900', '#DAA520', t);
            shadowColor2 = this.interpolateColor('#4B9CD3', '#4B9CD3', t);
            glowIntensity = 0.6 - t * 0.3;
        }
        
        // Draw multiple shadow layers (matching CSS box-shadow)
        ctx.save();
        
        // Shadow layer 1: Directional colored glow
        ctx.shadowColor = shadowColor1;
        ctx.shadowBlur = 15 + Math.sin(cycle) * 5;
        ctx.shadowOffsetX = -10 + Math.sin(cycle) * 5;
        ctx.shadowOffsetY = -10 + Math.cos(cycle) * 5;
        ctx.globalAlpha = glowIntensity * 0.6;
        
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        this.roundRect(ctx, 0, 0, this.cardWidth, this.cardHeight, 15);
        ctx.fill();
        
        // Shadow layer 2: Opposite directional glow
        ctx.shadowColor = shadowColor2;
        ctx.shadowBlur = 15 + Math.cos(cycle) * 5;
        ctx.shadowOffsetX = 10 - Math.sin(cycle) * 5;
        ctx.shadowOffsetY = 10 - Math.cos(cycle) * 5;
        ctx.globalAlpha = glowIntensity * 0.6;
        
        this.roundRect(ctx, 0, 0, this.cardWidth, this.cardHeight, 15);
        ctx.fill();
        
        // Shadow layer 3: Central glow
        ctx.shadowColor = `rgba(255, 100, 50, ${glowIntensity * 0.4})`;
        ctx.shadowBlur = 8 + Math.sin(cycle * 2) * 4;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.globalAlpha = glowIntensity;
        
        this.roundRect(ctx, 0, 0, this.cardWidth, this.cardHeight, 15);
        ctx.fill();
        
        ctx.restore();
    }

    /**
     * Interpolate between two hex colors
     */
    interpolateColor(color1, color2, t) {
        const hex1 = color1.replace('#', '');
        const hex2 = color2.replace('#', '');
        
        const r1 = parseInt(hex1.substr(0, 2), 16);
        const g1 = parseInt(hex1.substr(2, 2), 16);
        const b1 = parseInt(hex1.substr(4, 2), 16);
        
        const r2 = parseInt(hex2.substr(0, 2), 16);
        const g2 = parseInt(hex2.substr(2, 2), 16);
        const b2 = parseInt(hex2.substr(4, 2), 16);
        
        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);
        
        return `rgb(${r}, ${g}, ${b})`;
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
        
        // INTELLIGENT TEXT SPLITTING: Split at space for better layout
        const nameLines = this.intelligentNameSplit(creatorName);
        
        console.log('✅ Using creator name:', creatorName, 'Split into lines:', nameLines);
        
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
        
        // INTELLIGENT NAME DRAWING: Use smart line splitting
        if (nameLines.hasMultipleLines) {
            // Two lines: First name and surname
            const line1Y = Math.round(footerY + 22); // Slightly higher for two lines
            const line2Y = Math.round(footerY + 38); // Second line
            
            // Draw first name (line 1)
            ctx.strokeText(nameLines.line1, textX, line1Y);
            ctx.fillText(nameLines.line1, textX, line1Y);
            
            // Draw surname (line 2)
            ctx.strokeText(nameLines.line2, textX, line2Y);
            ctx.fillText(nameLines.line2, textX, line2Y);
            
            // Adjust title position for two-line name
            var titleY = Math.round(footerY + 52);
        } else {
            // Single line: Draw normally
            const nameY = Math.round(footerY + 26);
            ctx.strokeText(nameLines.line1, textX, nameY);
            ctx.fillText(nameLines.line1, textX, nameY);
            
            // Normal title position
            var titleY = Math.round(footerY + 46);
        }
        
        const creatorTitle = 'Creator';
        
        // Creator title
        const titleSize = Math.max(10, this.cardWidth * 0.027);
        ctx.font = `${titleSize}px "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 0.3;
        
        // Use the titleY calculated above (adjusted for single/double line)
        ctx.strokeText(creatorTitle, textX, titleY);
        ctx.fillText(creatorTitle, textX, titleY);
        
        ctx.restore();
    }

    /**
     * Intelligent name splitting for better layout
     * If name has space, split at space (first name / surname)
     * If no space, keep as single line
     */
    intelligentNameSplit(name) {
        // If name contains space, split at LAST space (handles middle names)
        if (name.includes(' ')) {
            const lastSpaceIndex = name.lastIndexOf(' ');
            const firstName = name.substring(0, lastSpaceIndex).trim();
            const lastName = name.substring(lastSpaceIndex + 1).trim();
            
            return {
                hasMultipleLines: true,
                line1: firstName,
                line2: lastName
            };
        }
        
        // Single word - no splitting
        return {
            hasMultipleLines: false,
            line1: name,
            line2: ''
        };
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
        
        // Animate gradient position - FIXED: Clamp offset and ensure all stops are valid
        const offset = Math.sin(progress * 2 * Math.PI) * 0.2; // Reduced from 0.3 to 0.2
        
        // FIXED: Ensure all color stops stay within 0.0-1.0 range
        gradient.addColorStop(Math.max(0, Math.min(1, 0 + offset)), 'transparent');
        gradient.addColorStop(Math.max(0, Math.min(1, 0.15 + offset)), this.colors.holoColor4);
        gradient.addColorStop(Math.max(0, Math.min(1, 0.25 + offset)), this.colors.holoColor1);
        gradient.addColorStop(Math.max(0, Math.min(1, 0.35 + offset)), this.colors.holoColor5);
        gradient.addColorStop(Math.max(0, Math.min(1, 0.47 + offset)), 'transparent');
        gradient.addColorStop(Math.max(0, Math.min(1, 0.53 + offset)), 'transparent');
        gradient.addColorStop(Math.max(0, Math.min(1, 0.65 + offset)), this.colors.holoColor2);
        gradient.addColorStop(Math.max(0, Math.min(1, 0.75 + offset)), this.colors.holoColor3);
        gradient.addColorStop(Math.max(0, Math.min(1, 0.85 + offset)), this.colors.holoColor4);
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
     * Draw color-dodge overlay (enhanced ::after effect with mix-blend-mode: color-dodge)
     */
    drawColorDodgeOverlay(ctx, animationTime) {
        const progress = (animationTime % this.SPARKLE_DURATION) / this.SPARKLE_DURATION;
        
        // Create multi-color gradient (matching CSS ::after)
        const gradient = ctx.createLinearGradient(0, 0, this.cardWidth, this.cardHeight);
        
        // Animate gradient position (matching autoSparkleMove) - FIXED: Clamp offset
        const offset = Math.sin(progress * 2 * Math.PI) * 0.2; // Reduced from 0.3 to 0.2
        
        // FIXED: Ensure all color stops stay within 0.0-1.0 range
        gradient.addColorStop(Math.max(0, Math.min(1, 0.1 + offset)), 'rgba(255, 215, 0, 0.125)');
        gradient.addColorStop(Math.max(0, Math.min(1, 0.2 + offset)), 'rgba(255, 165, 0, 0.15)');
        gradient.addColorStop(Math.max(0, Math.min(1, 0.3 + offset)), 'rgba(255, 140, 0, 0.09)');
        gradient.addColorStop(Math.max(0, Math.min(1, 0.4 + offset)), 'rgba(255, 255, 0, 0.15)');
        gradient.addColorStop(Math.max(0, Math.min(1, 0.5 + offset)), 'rgba(218, 165, 32, 0.06)');
        gradient.addColorStop(Math.max(0, Math.min(1, 0.6 + offset)), 'rgba(0, 255, 138, 0.08)');
        gradient.addColorStop(Math.max(0, Math.min(1, 0.7 + offset)), 'rgba(0, 207, 255, 0.18)');
        gradient.addColorStop(Math.max(0, Math.min(1, 0.8 + offset)), 'rgba(255, 184, 77, 0.15)');
        gradient.addColorStop(Math.max(0, Math.min(1, 0.9 + offset)), 'rgba(204, 76, 250, 0.21)');
        
        // Apply color-dodge-like effect (canvas doesn't have color-dodge, so simulate)
        ctx.save();
        ctx.globalCompositeOperation = 'screen'; // Closest to color-dodge
        ctx.globalAlpha = 0.3 + Math.sin(progress * 2 * Math.PI) * 0.1;
        
        ctx.fillStyle = gradient;
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
     * Generate animated GIF from canvas frames - FLEXIBLE PARALLEL SYSTEM
     */
    async generateAnimatedGIF(cardData, options = {}) {
        // Use natural card dimensions from constructor (366×477)
        const settings = {
            width: this.cardWidth,   // 366px (natural width)
            height: this.cardHeight, // 477px (natural height)
            frames: 15,              // SPEED: Reduced from 30 → 15 (50% faster)
            framerate: 10,           // SPEED: Reduced from 15 → 10 (smoother with fewer frames)
            quality: 5,              // SPEED: Reduced from 1 → 5 (faster encoding, still good quality)
            ...options
        };
        
        console.log('🚀 Starting OPTIMIZED 1080×1080 animated GIF generation...');
        console.log('⚡ SPEED: 15 frames @ 10fps (target: <30 seconds)');
        console.log(`🔍 NATURAL: Using original card dimensions ${settings.width}×${settings.height}`);
        console.log('⭐ Settings:', settings);
        
        // Load all required images
        await this.loadImages(cardData);
        
        // Initialize 1080×1080 canvas for background
        this.initCanvas(1080, 1080);
        
        // Use natural card dimensions (no override)
        this.cardWidth = settings.width;   // 366px (natural)
        this.cardHeight = settings.height; // 477px (natural)
        
        // Calculate centering offsets for natural card in 1080×1080 canvas
        const offsetX = (1080 - this.cardWidth) / 2;   // (1080 - 366) / 2 = 357px
        const offsetY = (1080 - this.cardHeight) / 2;  // (1080 - 477) / 2 = 301.5px
        
        console.log(`📐 Natural card: ${this.cardWidth}×${this.cardHeight} centered at (${offsetX}, ${offsetY})`);
        
        // QUALITY: Enhanced rendering settings
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        this.ctx.textRenderingOptimization = 'optimizeQuality';
        
        // Generate frames with progress tracking
        const frames = [];
        const startTime = Date.now();
        
        for (let frame = 0; frame < settings.frames; frame++) {
            const progress = Math.round((frame / settings.frames) * 100);
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`🎨 Frame ${frame + 1}/${settings.frames} (${progress}%) - ${elapsed}s elapsed`);
            
            // Fill black background for entire 1080×1080 canvas
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(0, 0, 1080, 1080);
            
            // Save context and translate to center the card
            this.ctx.save();
            this.ctx.translate(offsetX, offsetY);
            
            // Render card at natural dimensions (366×477)
            this.renderCard(frame, settings.frames, cardData);
            
            // Restore context
            this.ctx.restore();
            
            // Capture frame at maximum quality (1080×1080 with centered natural card)
            const frameDataURL = this.canvas.toDataURL('image/png', 1.0);
            frames.push(frameDataURL);
        }
        
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`🎬 All ${settings.frames} frames rendered in ${totalTime}s - creating GIF...`);
        
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
