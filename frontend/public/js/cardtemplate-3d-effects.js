/**
 * SnapMagic CardTemplate 3D Effects Extension - DISABLED
 * All effects disabled to match cardtemplate.jpg exactly (no rainbow/sparkles)
 */

// Extend the CardTemplate system with DISABLED 3D effects (clean design)
Object.assign(SnapMagicCardTemplateSystem.prototype, {
    
    /**
     * Draw 3D sparkle effects - DISABLED for clean design
     */
    async draw3DSparkleEffects() {
        // DISABLED - no sparkles, no rainbow effects, clean design matching cardtemplate.jpg
        console.log('✅ 3D effects disabled for clean design (matching cardtemplate.jpg)');
        return;
    },
    
    /**
     * Apply holographic enhancement - DISABLED for clean design
     */
    applyHolographicEnhancement() {
        // DISABLED - no holographic effects, clean design matching cardtemplate.jpg
        console.log('✅ Holographic effects disabled for clean design (matching cardtemplate.jpg)');
        return;
    }
});

console.log('✅ CardTemplate 3D Effects DISABLED for clean design matching cardtemplate.jpg');
            
            // Draw glare effects
            this.drawGlareEffects();
            
            // Draw holographic bands
            this.drawHolographicBands();
            
            console.log('✅ 3D sparkle effects completed');
        } catch (error) {
            console.error('❌ Error in 3D sparkle effects:', error);
            // Continue without 3D effects
        }
    },
    
    /**
     * Draw sparkles that move based on viewing angle
     */
    drawViewDependentSparkles() {
        this.ctx.save();
        
        // Create sparkle pattern based on view angle
        const sparkleOffset = this.viewAngle.x * 50 + this.viewAngle.y * 30;
        const sparkleIntensity = Math.abs(Math.sin(this.animationTime * 0.02 + sparkleOffset * 0.1));
        
        // Only draw sparkles when intensity is high enough
        if (sparkleIntensity > 0.3) {
            this.drawSparkleField(sparkleOffset, sparkleIntensity);
        }
        
        this.ctx.restore();
    },
    
    /**
     * Draw field of sparkles
     */
    drawSparkleField(offset, intensity) {
        const sparkleCount = Math.floor(intensity * 50);
        
        for (let i = 0; i < sparkleCount; i++) {
            const x = (Math.sin(i * 0.5 + offset * 0.01) * 0.5 + 0.5) * this.TEMPLATE_WIDTH;
            const y = (Math.cos(i * 0.7 + offset * 0.01) * 0.5 + 0.5) * this.TEMPLATE_HEIGHT;
            
            // Skip sparkles in the Nova image area
            if (this.isInNovaArea(x, y)) continue;
            
            this.drawIndividualSparkle(x, y, intensity, i);
        }
    },
    
    /**
     * Draw individual sparkle
     */
    drawIndividualSparkle(x, y, intensity, index) {
        this.ctx.save();
        
        // Sparkle size based on intensity and individual variation
        const size = (2 + Math.sin(index * 0.3) * 2) * intensity;
        
        // Color cycling through rainbow
        const colorIndex = (Math.floor(this.animationTime * 0.03 + index * 0.1)) % this.RAINBOW_COLORS.length;
        const sparkleColor = this.RAINBOW_COLORS[colorIndex];
        
        // Sparkle opacity flickers
        this.ctx.globalAlpha = intensity * (0.5 + 0.5 * Math.sin(this.animationTime * 0.05 + index));
        
        // Draw sparkle as a diamond
        this.ctx.fillStyle = sparkleColor;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - size);
        this.ctx.lineTo(x + size, y);
        this.ctx.lineTo(x, y + size);
        this.ctx.lineTo(x - size, y);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Add glow effect
        this.ctx.shadowColor = sparkleColor;
        this.ctx.shadowBlur = size * 2;
        this.ctx.fill();
        
        this.ctx.restore();
    },
    
    /**
     * Draw surface pattern effects that change with view angle
     */
    drawSurfacePatternEffects() {
        this.ctx.save();
        
        // Create surface distortion based on view angle
        const distortionX = this.viewAngle.x * 20;
        const distortionY = this.viewAngle.y * 20;
        
        // Draw distorted pattern
        this.drawDistortedSurfacePattern(distortionX, distortionY);
        
        this.ctx.restore();
    },
    
    /**
     * Draw distorted surface pattern
     */
    drawDistortedSurfacePattern(distortionX, distortionY) {
        const patternSize = 30;
        const rows = Math.ceil(this.TEMPLATE_HEIGHT / patternSize) + 2;
        const cols = Math.ceil(this.TEMPLATE_WIDTH / patternSize) + 2;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const baseX = col * patternSize - patternSize;
                const baseY = row * patternSize - patternSize;
                
                // Apply distortion
                const x = baseX + distortionX * Math.sin(row * 0.1 + this.animationTime * 0.01);
                const y = baseY + distortionY * Math.cos(col * 0.1 + this.animationTime * 0.01);
                
                // Skip pattern in Nova image area
                if (this.isInNovaArea(x, y)) continue;
                
                this.drawSurfacePatternElement(x, y, row, col);
            }
        }
    },
    
    /**
     * Draw individual surface pattern element
     */
    drawSurfacePatternElement(x, y, row, col) {
        this.ctx.save();
        
        // Pattern intensity based on view angle
        const intensity = Math.abs(this.viewAngle.x + this.viewAngle.y) * 0.5;
        if (intensity < 0.1) {
            this.ctx.restore();
            return;
        }
        
        // Color based on position and time
        const colorPhase = (row + col + this.animationTime * 0.02) * 0.5;
        const colorIndex = Math.floor(colorPhase) % this.RAINBOW_COLORS.length;
        const nextColorIndex = (colorIndex + 1) % this.RAINBOW_COLORS.length;
        const t = colorPhase % 1;
        
        const patternColor = this.interpolateColor(
            this.RAINBOW_COLORS[colorIndex],
            this.RAINBOW_COLORS[nextColorIndex],
            t
        );
        
        this.ctx.globalAlpha = intensity * 0.3;
        this.ctx.fillStyle = patternColor;
        
        // Draw small pattern element
        this.ctx.beginPath();
        this.ctx.arc(x, y, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    },
    
    /**
     * Draw glare effects that sweep across the card
     */
    drawGlareEffects() {
        this.ctx.save();
        
        // Glare moves periodically across the card
        const glarePosition = (Math.sin(this.animationTime * 0.008) * 0.5 + 0.5) * this.TEMPLATE_WIDTH;
        const glareWidth = 60;
        const glareIntensity = Math.abs(Math.sin(this.animationTime * 0.008));
        
        if (glareIntensity > 0.2) {
            this.drawGlareStripe(glarePosition, glareWidth, glareIntensity);
        }
        
        this.ctx.restore();
    },
    
    /**
     * Draw glare stripe
     */
    drawGlareStripe(position, width, intensity) {
        this.ctx.save();
        
        // Create diagonal glare gradient
        const gradient = this.ctx.createLinearGradient(
            position - width, 0,
            position + width, this.TEMPLATE_HEIGHT
        );
        
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(0.3, `rgba(255, 255, 255, ${intensity * 0.3})`);
        gradient.addColorStop(0.7, `rgba(255, 255, 255, ${intensity * 0.3})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        this.ctx.fillStyle = gradient;
        
        // Draw diagonal stripe
        this.ctx.beginPath();
        this.ctx.moveTo(position - width, 0);
        this.ctx.lineTo(position + width, 0);
        this.ctx.lineTo(position + width * 1.5, this.TEMPLATE_HEIGHT);
        this.ctx.lineTo(position - width * 0.5, this.TEMPLATE_HEIGHT);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
    },
    
    /**
     * Draw holographic bands that move with view angle
     */
    drawHolographicBands() {
        this.ctx.save();
        
        // Band position influenced by view angle
        const bandOffset = this.viewAngle.y * 100 + this.animationTime * 0.5;
        const bandSpacing = 80;
        const bandCount = Math.ceil(this.TEMPLATE_WIDTH / bandSpacing) + 2;
        
        for (let i = 0; i < bandCount; i++) {
            const bandX = (i * bandSpacing + bandOffset) % (this.TEMPLATE_WIDTH + bandSpacing) - bandSpacing;
            this.drawHolographicBand(bandX);
        }
        
        this.ctx.restore();
    },
    
    /**
     * Draw individual holographic band
     */
    drawHolographicBand(x) {
        this.ctx.save();
        
        // Band intensity based on view angle
        const intensity = Math.abs(this.viewAngle.y) * 0.5 + 0.2;
        
        // Create vertical gradient band
        const gradient = this.ctx.createLinearGradient(x - 20, 0, x + 20, 0);
        
        // Use rainbow colors for the band
        const colorIndex = Math.floor((x + this.animationTime) * 0.01) % this.RAINBOW_COLORS.length;
        const bandColor = this.RAINBOW_COLORS[colorIndex];
        
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.5, this.hexToRgba(bandColor, intensity * 0.4));
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x - 20, 0, 40, this.TEMPLATE_HEIGHT);
        
        this.ctx.restore();
    },
    
    /**
     * Apply final holographic enhancement to the entire card
     */
    applyHolographicEnhancement() {
        this.ctx.save();
        
        // Create overall holographic shimmer
        const shimmerIntensity = Math.sin(this.animationTime * 0.02) * 0.1 + 0.1;
        
        // Apply subtle color shift overlay
        const colorIndex = Math.floor(this.animationTime * 0.01) % this.RAINBOW_COLORS.length;
        const shimmerColor = this.RAINBOW_COLORS[colorIndex];
        
        this.ctx.globalAlpha = shimmerIntensity;
        this.ctx.globalCompositeOperation = 'overlay';
        this.ctx.fillStyle = shimmerColor;
        this.ctx.fillRect(0, 0, this.TEMPLATE_WIDTH, this.TEMPLATE_HEIGHT);
        
        this.ctx.restore();
    },
    
    /**
     * Check if coordinates are in Nova image area
     */
    isInNovaArea(x, y) {
        return x >= this.NOVA_X && x <= this.NOVA_X + this.NOVA_WIDTH &&
               y >= this.NOVA_Y && y <= this.NOVA_Y + this.NOVA_HEIGHT;
    },
    
    /**
     * Convert hex color to rgba
     */
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },
    
    /**
     * Create stencil buffer effect for 3D depth
     */
    createStencilEffect() {
        // This would be implemented with WebGL for true stencil buffer effects
        // For now, we simulate with canvas clipping
        this.ctx.save();
        
        // Create clipping path for the Nova image area
        this.ctx.beginPath();
        this.ctx.rect(this.NOVA_X, this.NOVA_Y, this.NOVA_WIDTH, this.NOVA_HEIGHT);
        this.ctx.clip();
        
        // Any drawing here will be clipped to the Nova area
        
        this.ctx.restore();
    },
    
    /**
     * Add depth shadows and highlights
     */
    addDepthEffects() {
        this.ctx.save();
        
        // Add shadow under the floating panel
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 4;
        
        // Draw invisible rectangle to create shadow
        this.ctx.globalAlpha = 0;
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(this.PANEL_X, this.PANEL_Y, this.PANEL_WIDTH, this.PANEL_HEIGHT);
        
        this.ctx.restore();
    }
});

console.log('✅ CardTemplate 3D Effects loaded successfully');
