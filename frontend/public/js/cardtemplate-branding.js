/**
 * SnapMagic CardTemplate Branding System
 * Handles AWS logos, event names, customer logos, and footer elements
 */

// Extend the CardTemplate system with branding functionality
Object.assign(SnapMagicCardTemplateSystem.prototype, {
    
    /**
     * Draw CardTemplate AWS logo with holographic effects
     */
    async drawCardTemplateLogo() {
        return new Promise((resolve) => {
            const awsLogo = new Image();
            
            awsLogo.onload = () => {
                this.ctx.save();
                
                // Logo area at top center (above the floating panel)
                const logoX = this.TEMPLATE_WIDTH / 2;
                const logoY = 25;
                const maxLogoWidth = 180;
                const maxLogoHeight = 35;
                
                // Calculate logo size maintaining aspect ratio
                const logoSize = this.calculateLogoSize(awsLogo, maxLogoWidth, maxLogoHeight, 25);
                
                // Center the logo
                const finalLogoX = logoX - logoSize.width / 2;
                const finalLogoY = logoY;
                
                // Add holographic glow effect to logo
                this.addHolographicGlow(finalLogoX, finalLogoY, logoSize.width, logoSize.height);
                
                // Draw the AWS logo
                this.ctx.drawImage(awsLogo, finalLogoX, finalLogoY, logoSize.width, logoSize.height);
                
                this.ctx.restore();
                console.log('✅ CardTemplate AWS logo drawn with holographic effects');
                resolve();
            };
            
            awsLogo.onerror = () => {
                // Fallback text with holographic effect
                this.ctx.save();
                
                const colorIndex = Math.floor(this.animationTime * 0.02) % this.RAINBOW_COLORS.length;
                this.ctx.fillStyle = this.RAINBOW_COLORS[colorIndex];
                this.ctx.font = 'bold 18px serif';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                
                // Add glow effect
                this.ctx.shadowColor = this.RAINBOW_COLORS[colorIndex];
                this.ctx.shadowBlur = 10;
                
                this.ctx.fillText('POWERED BY AWS', this.TEMPLATE_WIDTH / 2, 35);
                
                this.ctx.restore();
                console.log('✅ CardTemplate AWS fallback text drawn');
                resolve();
            };
            
            // Load the AWS logo
            awsLogo.src = 'powered-by-aws-white-horizontal.png';
        });
    },
    
    /**
     * Add holographic glow effect around logo
     */
    addHolographicGlow(x, y, width, height) {
        this.ctx.save();
        
        // Create pulsing glow
        const glowIntensity = Math.sin(this.animationTime * 0.03) * 0.3 + 0.7;
        const colorIndex = Math.floor(this.animationTime * 0.02) % this.RAINBOW_COLORS.length;
        const glowColor = this.RAINBOW_COLORS[colorIndex];
        
        this.ctx.shadowColor = glowColor;
        this.ctx.shadowBlur = 15 * glowIntensity;
        this.ctx.globalAlpha = 0.3 * glowIntensity;
        
        // Draw invisible rectangle to create glow
        this.ctx.fillStyle = glowColor;
        this.ctx.fillRect(x - 5, y - 5, width + 10, height + 10);
        
        this.ctx.restore();
    },
    
    /**
     * Draw CardTemplate footer with all branding elements
     */
    async drawCardTemplateFooter() {
        const footerY = this.TEMPLATE_HEIGHT - this.FOOTER_HEIGHT;
        
        // Draw footer background with holographic accent
        this.drawFooterBackground(footerY);
        
        // Draw footer content in 3 sections (same as existing system)
        await this.drawCardTemplateFooterSections(footerY);
    },
    
    /**
     * Draw footer background with holographic accent
     */
    drawFooterBackground(footerY) {
        this.ctx.save();
        
        // Create subtle holographic gradient for footer
        const gradient = this.ctx.createLinearGradient(0, footerY, 0, this.TEMPLATE_HEIGHT);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, footerY, this.TEMPLATE_WIDTH, this.FOOTER_HEIGHT);
        
        // Add subtle holographic line at top of footer
        const colorIndex = Math.floor(this.animationTime * 0.02) % this.RAINBOW_COLORS.length;
        this.ctx.strokeStyle = this.RAINBOW_COLORS[colorIndex];
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.5;
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, footerY);
        this.ctx.lineTo(this.TEMPLATE_WIDTH, footerY);
        this.ctx.stroke();
        
        this.ctx.restore();
    },
    
    /**
     * Draw footer sections: EVENT NAME + LOGOS + CREATOR
     */
    async drawCardTemplateFooterSections(footerY) {
        const sectionHeight = this.FOOTER_HEIGHT / 3;
        
        // Section 1: Event Name (top section)
        if (this.templateConfig?.eventName) {
            this.drawEventNameSection(footerY, sectionHeight);
        }
        
        // Section 2: Customer Logos (middle section)
        if (this.templateConfig?.logos === true) {
            await this.drawCustomerLogosSection(footerY + sectionHeight, sectionHeight);
        }
        
        // Section 3: Creator Name (bottom section)
        if (this.templateConfig?.userName) {
            this.drawCreatorNameSection(footerY + sectionHeight * 2, sectionHeight);
        }
    },
    
    /**
     * Draw event name section with holographic text
     */
    drawEventNameSection(footerY, sectionHeight) {
        this.ctx.save();
        
        // Holographic text effect
        const colorIndex = Math.floor(this.animationTime * 0.015) % this.RAINBOW_COLORS.length;
        const textColor = this.RAINBOW_COLORS[colorIndex];
        
        this.ctx.fillStyle = textColor;
        this.ctx.font = 'bold 16px serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Add glow effect
        this.ctx.shadowColor = textColor;
        this.ctx.shadowBlur = 8;
        
        this.ctx.fillText(
            this.templateConfig.eventName.toUpperCase(),
            this.TEMPLATE_WIDTH / 2,
            footerY + sectionHeight / 2
        );
        
        this.ctx.restore();
        console.log('✅ Event name drawn with holographic effect');
    },
    
    /**
     * Draw customer logos section
     */
    async drawCustomerLogosSection(startY, sectionHeight) {
        console.log('🎨 Looking for customer logos in CardTemplate footer...');
        
        // Check for numbered logos 1-6 (same as existing system)
        const foundLogos = [];
        for (let i = 1; i <= 6; i++) {
            try {
                const logoImg = new Image();
                logoImg.src = `logos/${i}.png`;
                
                await new Promise((resolve) => {
                    logoImg.onload = () => {
                        foundLogos.push({ number: i, image: logoImg });
                        console.log(`✅ Found logo ${i}.png for CardTemplate`);
                        resolve();
                    };
                    logoImg.onerror = () => {
                        console.log(`ℹ️ Logo ${i}.png not found (normal for CardTemplate)`);
                        resolve();
                    };
                    
                    // Timeout after 100ms
                    setTimeout(() => resolve(), 100);
                });
            } catch (error) {
                console.log(`ℹ️ Logo ${i}.png not available for CardTemplate`);
            }
        }
        
        if (foundLogos.length > 0) {
            await this.drawLogosInCardTemplateFooter(foundLogos, startY, sectionHeight);
        } else {
            console.log('ℹ️ No customer logos found - CardTemplate footer section 2 left blank');
        }
    },
    
    /**
     * Draw logos horizontally centered in footer section 2
     */
    async drawLogosInCardTemplateFooter(logos, startY, sectionHeight) {
        const maxLogos = Math.min(logos.length, 6);
        const logoSize = Math.min(this.LOGO_SIZE, sectionHeight * 0.8);
        const totalWidth = maxLogos * logoSize + (maxLogos - 1) * 10; // 10px spacing
        const startX = (this.TEMPLATE_WIDTH - totalWidth) / 2;
        
        for (let i = 0; i < maxLogos; i++) {
            const logo = logos[i];
            const logoX = startX + i * (logoSize + 10);
            const logoY = startY + (sectionHeight - logoSize) / 2;
            
            this.ctx.save();
            
            // Add subtle holographic glow to customer logos
            const glowIntensity = Math.sin(this.animationTime * 0.02 + i * 0.5) * 0.2 + 0.3;
            const colorIndex = (Math.floor(this.animationTime * 0.01) + i) % this.RAINBOW_COLORS.length;
            
            this.ctx.shadowColor = this.RAINBOW_COLORS[colorIndex];
            this.ctx.shadowBlur = 5 * glowIntensity;
            this.ctx.globalAlpha = 0.9;
            
            // High quality logo rendering
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';
            this.ctx.drawImage(logo.image, logoX, logoY, logoSize, logoSize);
            
            this.ctx.restore();
        }
        
        console.log(`✅ Drew ${maxLogos} customer logos in CardTemplate footer with holographic effects`);
    },
    
    /**
     * Draw creator name section
     */
    drawCreatorNameSection(footerY, sectionHeight) {
        this.ctx.save();
        
        // Elegant creator text with subtle holographic effect
        const colorIndex = Math.floor(this.animationTime * 0.01) % this.RAINBOW_COLORS.length;
        const textColor = this.interpolateColor(this.WHITE_TEXT, this.RAINBOW_COLORS[colorIndex], 0.3);
        
        this.ctx.fillStyle = textColor;
        this.ctx.font = '14px serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Subtle glow
        this.ctx.shadowColor = textColor;
        this.ctx.shadowBlur = 3;
        
        const designation = this.templateConfig.userName ? 
            `CREATOR - ${this.templateConfig.userName.toUpperCase()}` : 
            'EXECUTIVE';
            
        this.ctx.fillText(
            designation,
            this.TEMPLATE_WIDTH / 2,
            footerY + sectionHeight / 2
        );
        
        this.ctx.restore();
        console.log('✅ Creator name drawn with subtle holographic effect');
    },
    
    /**
     * Calculate optimal logo size maintaining aspect ratio (same as existing system)
     */
    calculateLogoSize(image, maxWidth, maxHeight, minSize = 20) {
        const aspectRatio = image.width / image.height;
        
        let width = maxWidth;
        let height = width / aspectRatio;
        
        if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
        }
        
        // Ensure minimum size
        if (width < minSize) {
            width = minSize;
            height = width / aspectRatio;
        }
        
        return { width: Math.round(width), height: Math.round(height) };
    },
    
    /**
     * Add premium branding elements
     */
    addPremiumBrandingElements() {
        // Add subtle "PREMIUM" or "EXECUTIVE" watermark
        this.ctx.save();
        
        this.ctx.globalAlpha = 0.1;
        this.ctx.fillStyle = this.GOLD_ACCENT;
        this.ctx.font = 'bold 48px serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Rotate text for diagonal watermark
        this.ctx.translate(this.TEMPLATE_WIDTH / 2, this.TEMPLATE_HEIGHT / 2);
        this.ctx.rotate(-Math.PI / 6);
        this.ctx.fillText('PREMIUM', 0, 0);
        
        this.ctx.restore();
    },
    
    /**
     * Get template configuration for external use
     */
    getTemplateConfig() {
        return this.templateConfig;
    },
    
    /**
     * Update template configuration
     */
    updateTemplateConfig(newConfig) {
        this.templateConfig = { ...this.templateConfig, ...newConfig };
    }
});

console.log('✅ CardTemplate Branding System loaded successfully');
