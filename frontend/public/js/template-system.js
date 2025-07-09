/**
 * SnapMagic Template System - Simplified Version
 * Automatically discovers and uses logos from the logos/ directory
 */

class SnapMagicTemplateSystem {
    constructor() {
        this.templateConfig = null;
        this.canvas = null;
        this.ctx = null;
        
        // Template dimensions (final card size) - Professional trading card proportions
        this.TEMPLATE_WIDTH = 500;   // ~4.2cm at 300 DPI
        this.TEMPLATE_HEIGHT = 750;  // ~6.2cm at 300 DPI
        
        // Nova Canvas positioned to fit between panels without overlap
        this.NOVA_WIDTH = 340;       // Reduced width to prevent panel overlap (was 360)
        this.NOVA_HEIGHT = 560;      // Image height - keep as is
        this.NOVA_X = 80;            // Positioned between panels (70px panels + 10px margin)
        this.NOVA_Y = 110;           // Image position - keep as is
        
        // Professional template areas with better panel sizing
        this.HEADER_HEIGHT = 100;    // Header for event name + logos
        this.FOOTER_HEIGHT = 80;     // Footer for new AWS logo
        this.SIDE_PANEL_WIDTH = 70;  // Wider panels for better logo visibility (was 50)
        this.LOGO_AREA_HEIGHT = 45;  // Dedicated space for logos
        this.EVENT_TEXT_HEIGHT = 35; // Space for event name
        this.LOGO_SIZE = 50;         // Larger logos for better visibility (was 40)
        this.BORDER_RADIUS = 8;      // Smaller radius for cleaner adjacent look
        
        // Set template configuration
        this.setTemplateConfiguration();
    }
    
    /**
     * Set template configuration from injected config (secrets.json via CDK)
     */
    setTemplateConfiguration() {
        try {
            // Try to get template config from injected configuration
            if (window.SNAPMAGIC_CONFIG && window.SNAPMAGIC_CONFIG.TEMPLATE_CONFIG) {
                // Parse the injected template configuration
                if (typeof window.SNAPMAGIC_CONFIG.TEMPLATE_CONFIG === 'string') {
                    this.templateConfig = JSON.parse(window.SNAPMAGIC_CONFIG.TEMPLATE_CONFIG);
                } else {
                    this.templateConfig = window.SNAPMAGIC_CONFIG.TEMPLATE_CONFIG;
                }
                console.log('✅ Template configuration loaded from secrets.json:', this.templateConfig);
            } else {
                // Fallback to hardcoded configuration
                this.setFallbackConfiguration();
            }
        } catch (error) {
            console.error('❌ Error parsing template configuration:', error);
            this.setFallbackConfiguration();
        }
    }
    
    /**
     * Fallback template configuration if secrets.json config fails
     */
    setFallbackConfiguration() {
        this.templateConfig = {
            eventName: 'AWS Event'
        };
        console.log('⚠️ Using fallback template configuration:', this.templateConfig);
    }
    
    /**
     * Create a complete trading card with template and Nova Canvas image
     * @param {string} novaImageBase64 - Base64 encoded Nova Canvas image
     * @param {string} userPrompt - Original user prompt for context
     * @returns {Promise<string>} - Base64 encoded final trading card
     */
    async createTradingCard(novaImageBase64, userPrompt = '') {
        return new Promise((resolve, reject) => {
            try {
                console.log('🎴 Starting trading card creation...');
                console.log('Template config:', this.templateConfig);
                
                // Create canvas
                this.canvas = document.createElement('canvas');
                this.canvas.width = this.TEMPLATE_WIDTH;
                this.canvas.height = this.TEMPLATE_HEIGHT;
                this.ctx = this.canvas.getContext('2d');
                
                // Set high quality rendering
                this.ctx.imageSmoothingEnabled = true;
                this.ctx.imageSmoothingQuality = 'high';
                
                console.log('✅ Canvas created:', this.TEMPLATE_WIDTH, 'x', this.TEMPLATE_HEIGHT);
                
                // Draw template background
                this.drawBackground();
                console.log('✅ Background drawn');
                
                // Load and draw Nova Canvas image
                const novaImg = new Image();
                novaImg.onload = async () => {
                    try {
                        console.log('✅ Nova Canvas image loaded');
                        
                        // Draw Nova Canvas image in center
                        this.ctx.drawImage(novaImg, this.NOVA_X, this.NOVA_Y, this.NOVA_WIDTH, this.NOVA_HEIGHT);
                        console.log('✅ Nova Canvas image drawn at', this.NOVA_X, this.NOVA_Y);
                        
                        // Add template elements
                        await this.drawHeader();
                        console.log('✅ Header drawn with integrated customer logos');
                        
                        await this.drawSidePanels();
                        console.log('✅ Side panels drawn');
                        
                        await this.drawFooter();
                        console.log('✅ Footer drawn');
                        
                        // Export final card
                        const finalCardDataUrl = this.canvas.toDataURL('image/png', 1.0);
                        const base64Data = finalCardDataUrl.split(',')[1];
                        console.log('✅ Trading card created successfully');
                        resolve(base64Data);
                    } catch (error) {
                        console.error('❌ Error during template composition:', error);
                        reject(error);
                    }
                };
                
                novaImg.onerror = (error) => {
                    console.error('❌ Failed to load Nova Canvas image:', error);
                    reject(new Error('Failed to load Nova Canvas image'));
                };
                
                console.log('📥 Loading Nova Canvas image...');
                novaImg.src = `data:image/png;base64,${novaImageBase64}`;
                
            } catch (error) {
                console.error('❌ Error in createTradingCard:', error);
                reject(error);
            }
        });
    }
    
    /**
     * Draw professional template background with gradient and rounded corners
     */
    drawBackground() {
        // Create rounded rectangle path
        this.drawRoundedRect(0, 0, this.TEMPLATE_WIDTH, this.TEMPLATE_HEIGHT, this.BORDER_RADIUS);
        
        // Create gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.TEMPLATE_HEIGHT);
        gradient.addColorStop(0, '#1a1a2e');    // Dark blue at top
        gradient.addColorStop(0.3, '#16213e');  // Medium blue
        gradient.addColorStop(0.7, '#0f3460');  // Deeper blue
        gradient.addColorStop(1, '#533483');    // Purple at bottom
        
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Add subtle inner glow
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.1)';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowInset = true;
        
        // Draw elegant border
        this.drawRoundedRect(5, 5, this.TEMPLATE_WIDTH - 10, this.TEMPLATE_HEIGHT - 10, this.BORDER_RADIUS - 2);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Reset shadow
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
    }
    
    /**
     * Helper function to draw rounded rectangles
     */
    drawRoundedRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }
    
    /**
     * Draw professional header with event name and integrated customer logos (no separate panel)
     */
     async drawHeader() {
        if (!this.templateConfig?.eventName) return;
        
        // Header background with subtle gradient
        const headerGradient = this.ctx.createLinearGradient(0, 10, 0, 10 + this.HEADER_HEIGHT);
        headerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        headerGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
        
        this.drawRoundedRect(10, 10, this.TEMPLATE_WIDTH - 20, this.HEADER_HEIGHT, 10);
        this.ctx.fillStyle = headerGradient;
        this.ctx.fill();
        
        // Header border
        this.drawRoundedRect(10, 10, this.TEMPLATE_WIDTH - 20, this.HEADER_HEIGHT, 10);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // Event name with classy AWS-style typography
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 22px "Amazon Ember", "Helvetica Neue", Arial, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Add elegant text shadow for better readability
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        this.ctx.shadowBlur = 4;
        
        const eventName = this.templateConfig.eventName;
        const headerCenterX = this.TEMPLATE_WIDTH / 2;
        const eventTextY = 10 + (this.EVENT_TEXT_HEIGHT / 2) + 8;
        
        this.ctx.fillText(eventName, headerCenterX, eventTextY);
        
        // Reset shadow
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        this.ctx.shadowBlur = 0;
        
        // Draw customer logos directly in header (no separate panel)
        await this.drawCustomerLogosInHeader();
    }
    
    /**
     * Draw customer logos directly in header background (integrated, no separate panel)
     */
    async drawCustomerLogosInHeader() {
        console.log('🎨 Looking for customer logos to integrate in header...');
        
        // Check for numbered logos 1-6
        const foundLogos = [];
        
        for (let i = 1; i <= 6; i++) {
            const logoUrl = `logos/${i}.png`;
            try {
                const logoExists = await this.checkIfLogoExists(logoUrl);
                if (logoExists) {
                    foundLogos.push({
                        number: i,
                        url: logoUrl,
                        filename: `${i}.png`
                    });
                    console.log(`✅ Found customer logo: ${i}.png`);
                }
            } catch (error) {
                continue;
            }
        }
        
        if (foundLogos.length === 0) {
            console.log('ℹ️ No customer logos found - using clean event-only design with decorative elements');
            await this.drawNoLogosDesign();
            return;
        }
        
        console.log(`✅ Integrating ${foundLogos.length} customer logo(s) directly in header`);
        
        // Position logos in header below event name - ensure they stay within bounds
        const logoY = 10 + this.EVENT_TEXT_HEIGHT + 12; // Below event name
        const logoSize = 30; // Slightly smaller to ensure fit
        
        // Calculate available width within header bounds (with proper margins)
        const headerLeft = 20; // Left margin within header
        const headerRight = this.TEMPLATE_WIDTH - 20; // Right margin within header
        const availableWidth = headerRight - headerLeft; // Actual usable width
        
        // Calculate total width needed for all logos
        const totalLogosWidth = foundLogos.length * logoSize;
        
        // Calculate spacing between logos
        let logoSpacing = 0;
        if (foundLogos.length > 1) {
            const remainingWidth = availableWidth - totalLogosWidth;
            logoSpacing = remainingWidth / (foundLogos.length - 1);
            
            // Ensure minimum spacing and maximum spacing
            logoSpacing = Math.max(10, Math.min(logoSpacing, 40));
        }
        
        // Recalculate total width with actual spacing
        const actualTotalWidth = totalLogosWidth + ((foundLogos.length - 1) * logoSpacing);
        
        // Center the entire logo group within header
        const startX = headerLeft + (availableWidth - actualTotalWidth) / 2;
        
        console.log(`📐 Header logo layout: ${foundLogos.length} logos, size=${logoSize}px, spacing=${logoSpacing.toFixed(1)}px`);
        console.log(`📐 Available width: ${availableWidth}px, Total width: ${actualTotalWidth.toFixed(1)}px, Start X: ${startX.toFixed(1)}px`);
        
        // Ensure logos don't go outside header bounds
        if (startX < headerLeft || (startX + actualTotalWidth) > headerRight) {
            console.log('⚠️ Logos would exceed header bounds, adjusting...');
            
            // Reduce logo size if needed
            const maxLogoSize = Math.floor((availableWidth - ((foundLogos.length - 1) * 10)) / foundLogos.length);
            const adjustedLogoSize = Math.min(logoSize, maxLogoSize);
            const adjustedSpacing = foundLogos.length > 1 ? 10 : 0;
            const adjustedTotalWidth = (foundLogos.length * adjustedLogoSize) + ((foundLogos.length - 1) * adjustedSpacing);
            const adjustedStartX = headerLeft + (availableWidth - adjustedTotalWidth) / 2;
            
            console.log(`📐 Adjusted: size=${adjustedLogoSize}px, spacing=${adjustedSpacing}px, startX=${adjustedStartX.toFixed(1)}px`);
            
            // Draw with adjusted values
            for (let i = 0; i < foundLogos.length; i++) {
                const logo = foundLogos[i];
                const logoX = adjustedStartX + (i * (adjustedLogoSize + adjustedSpacing));
                
                console.log(`🎯 Drawing adjusted logo ${logo.number} at (${logoX.toFixed(1)}, ${logoY})`);
                await this.drawLogo(logo.url, logoX, logoY, adjustedLogoSize, logo.filename);
            }
        } else {
            // Draw with original calculated values
            for (let i = 0; i < foundLogos.length; i++) {
                const logo = foundLogos[i];
                const logoX = startX + (i * (logoSize + logoSpacing));
                
                console.log(`🎯 Drawing logo ${logo.number} at (${logoX.toFixed(1)}, ${logoY})`);
                await this.drawLogo(logo.url, logoX, logoY, logoSize, logo.filename);
            }
        }
    }
    
    /**
     * Draw logos using numbered system (1.png, 2.png, etc.) with flexible centering
     */
    async drawLogos() {
        console.log('🎨 Looking for numbered logos (1.png, 2.png, etc.)...');
        
        // Check for numbered logos 1-6
        const foundLogos = [];
        
        for (let i = 1; i <= 6; i++) {
            const logoUrl = `logos/${i}.png`;
            try {
                const logoExists = await this.checkIfLogoExists(logoUrl);
                if (logoExists) {
                    foundLogos.push({
                        number: i,
                        url: logoUrl,
                        filename: `${i}.png`
                    });
                    console.log(`📁 Found logo: ${i}.png`);
                }
            } catch (error) {
                // Logo doesn't exist, continue
                continue;
            }
        }
        
        if (foundLogos.length === 0) {
            console.log('ℹ️ No numbered logos found - using clean event-only design with decorative elements');
            await this.drawNoLogosDesign();
            return;
        }
        
        console.log(`✅ Found ${foundLogos.length} logo(s), displaying centered from left to right`);
        
        // Calculate flexible centering based on number of logos
        await this.drawLogosFlexiblyCentered(foundLogos);
    }
    
    /**
     * Draw side panels with seamless connection to header and footer
     */
    async drawSidePanels() {
        // Side panels connect directly to footer with NO gap
        const panelStartY = 10 + this.HEADER_HEIGHT; // Start after header ends
        const panelEndY = this.TEMPLATE_HEIGHT - 10; // End at same level as footer (no gap)
        const panelHeight = panelEndY - panelStartY; // Full height touching footer
        
        // Left panel background - directly adjacent to footer
        const leftPanelGradient = this.ctx.createLinearGradient(0, panelStartY, 0, panelStartY + panelHeight);
        leftPanelGradient.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
        leftPanelGradient.addColorStop(1, 'rgba(255, 255, 255, 0.08)');
        
        this.drawRoundedRect(10, panelStartY, this.SIDE_PANEL_WIDTH, panelHeight, this.BORDER_RADIUS);
        this.ctx.fillStyle = leftPanelGradient;
        this.ctx.fill();
        
        // Left panel border
        this.drawRoundedRect(10, panelStartY, this.SIDE_PANEL_WIDTH, panelHeight, this.BORDER_RADIUS);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // Right panel background - directly adjacent to footer
        const rightPanelGradient = this.ctx.createLinearGradient(0, panelStartY, 0, panelStartY + panelHeight);
        rightPanelGradient.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
        rightPanelGradient.addColorStop(1, 'rgba(255, 255, 255, 0.08)');
        
        const rightPanelX = this.TEMPLATE_WIDTH - 10 - this.SIDE_PANEL_WIDTH;
        this.drawRoundedRect(rightPanelX, panelStartY, this.SIDE_PANEL_WIDTH, panelHeight, this.BORDER_RADIUS);
        this.ctx.fillStyle = rightPanelGradient;
        this.ctx.fill();
        
        // Right panel border
        this.drawRoundedRect(rightPanelX, panelStartY, this.SIDE_PANEL_WIDTH, panelHeight, this.BORDER_RADIUS);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // Left panel text - "PLACEHOLDER" in white
        await this.drawLeftPanelText(panelStartY, panelHeight);
        
        // Right panel - AWS logo as big as possible
        await this.drawRightPanelLogo(panelStartY, panelHeight);
    }
    
    /**
     * Draw "PLACEHOLDER" text vertically on left panel
     */
    async drawLeftPanelText(panelStartY, panelHeight) {
        this.ctx.save();
        
        // Position for vertical text in the center of the side panel
        const textX = 10 + (this.SIDE_PANEL_WIDTH / 2);
        const textY = panelStartY + (panelHeight / 2);
        
        // Rotate context for vertical text
        this.ctx.translate(textX, textY);
        this.ctx.rotate(-Math.PI / 2);
        
        // White text as requested
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 16px "Amazon Ember", "Helvetica Neue", Arial, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Add subtle text shadow
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        this.ctx.shadowOffsetX = 1;
        this.ctx.shadowOffsetY = 1;
        this.ctx.shadowBlur = 2;
        
        this.ctx.fillText('PLACEHOLDER', 0, 0);
        
        // Reset shadow
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        this.ctx.shadowBlur = 0;
        
        this.ctx.restore();
    }
    
    /**
     * Draw AWS logo vertically on right panel using universal resizing
     */
    async drawRightPanelLogo(panelStartY, panelHeight) {
        return new Promise((resolve) => {
            const awsLogo = new Image();
            
            awsLogo.onload = () => {
                this.ctx.save();
                
                // Available space in right panel
                const maxLogoWidth = this.SIDE_PANEL_WIDTH - 8; // Leave margins
                const maxLogoHeight = panelHeight * 0.8; // Use 80% of panel height
                
                // Use universal logo sizing function
                const logoSize = this.calculateLogoSize(awsLogo, maxLogoWidth, maxLogoHeight, 25);
                
                // Position in right panel center
                const rightPanelX = this.TEMPLATE_WIDTH - 10 - this.SIDE_PANEL_WIDTH;
                const centerX = rightPanelX + (this.SIDE_PANEL_WIDTH / 2);
                const centerY = panelStartY + (panelHeight / 2);
                
                // Rotate for vertical placement (reading left to right)
                this.ctx.translate(centerX, centerY);
                this.ctx.rotate(-Math.PI / 2); // Rotate 90 degrees counter-clockwise
                
                // Draw logo centered at origin (after rotation)
                const logoX = -logoSize.width / 2;
                const logoY = -logoSize.height / 2;
                
                // Draw the properly sized AWS logo (no glow for print quality)
                this.ctx.imageSmoothingEnabled = true;
                this.ctx.imageSmoothingQuality = 'high';
                this.ctx.drawImage(awsLogo, logoX, logoY, logoSize.width, logoSize.height);
                
                this.ctx.restore();
                console.log(`✅ Right panel AWS logo drawn with universal sizing`);
                resolve();
            };
            
            awsLogo.onerror = () => {
                console.error('❌ Failed to load AWS logo for right panel');
                resolve();
            };
            
            // Load the horizontal AWS logo
            awsLogo.src = 'powered-by-aws-white-horizontal.png';
        });
    }
    
    /**
     * Universal logo resizing function - works for ANY aspect ratio
     * @param {Image} logoImg - The loaded image object
     * @param {number} maxWidth - Maximum width available
     * @param {number} maxHeight - Maximum height available
     * @param {number} minSize - Minimum size to maintain readability (default: 20px)
     * @returns {Object} - {width, height, scale} for drawing
     */
    calculateLogoSize(logoImg, maxWidth, maxHeight, minSize = 20) {
        const originalWidth = logoImg.width;
        const originalHeight = logoImg.height;
        const aspectRatio = originalWidth / originalHeight;
        
        console.log(`🔍 LOGO CALC: Original=${originalWidth}x${originalHeight}, Ratio=${aspectRatio.toFixed(2)}, Available=${maxWidth}x${maxHeight}`);
        
        // Calculate size fitting both width and height constraints
        let finalWidth = maxWidth;
        let finalHeight = finalWidth / aspectRatio;
        
        // If height exceeds limit, scale by height instead
        if (finalHeight > maxHeight) {
            finalHeight = maxHeight;
            finalWidth = finalHeight * aspectRatio;
        }
        
        // Ensure minimum readable size
        const scale = Math.min(finalWidth / originalWidth, finalHeight / originalHeight);
        if (Math.min(finalWidth, finalHeight) < minSize) {
            const minScale = minSize / Math.min(originalWidth, originalHeight);
            if (minScale > scale) {
                finalWidth = originalWidth * minScale;
                finalHeight = originalHeight * minScale;
                console.log(`⚠️ LOGO CALC: Applied minimum size constraint`);
            }
        }
        
        console.log(`✅ LOGO CALC: Final=${finalWidth.toFixed(1)}x${finalHeight.toFixed(1)}, Scale=${scale.toFixed(3)}`);
        
        return {
            width: finalWidth,
            height: finalHeight,
            scale: scale
        };
    }
    
    /**
     * Draw enhanced design when no logos are present
     */
    async drawNoLogosDesign() {
        // Add decorative elements to make the header more interesting without logos
        const centerX = this.TEMPLATE_WIDTH / 2;
        const decorativeY = 10 + this.EVENT_TEXT_HEIGHT + 20;
        
        // Draw subtle decorative line
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 60, decorativeY);
        this.ctx.lineTo(centerX + 60, decorativeY);
        this.ctx.stroke();
        
        // Add small decorative dots
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.beginPath();
        this.ctx.arc(centerX - 70, decorativeY, 3, 0, 2 * Math.PI);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(centerX + 70, decorativeY, 3, 0, 2 * Math.PI);
        this.ctx.fill();
        
        console.log('✨ Clean event-only design applied with decorative watermark!');
    }
            
    /**
     * Draw logos directly in header panel with flexible spacing
     * @param {Array} logos - Array of logo objects to draw
     */
    async drawLogosFlexiblyCentered(logos) {
        // MAXIMUM 3 LOGOS ONLY - ignore any beyond that
        const maxLogos = Math.min(logos.length, 3);
        const displayLogos = logos.slice(0, maxLogos);
        
        if (maxLogos < logos.length) {
            console.log(`⚠️ Only displaying first ${maxLogos} logos (found ${logos.length} total)`);
        }
        
        // Position logos in the header panel below event name
        const headerLogoY = 10 + this.EVENT_TEXT_HEIGHT + 10; // Below event name with spacing
        const logoSize = 45; // Increased logo size (was 35px) - 2 sizes bigger
        
        console.log(`🎯 Drawing ${maxLogos} logo(s) with scenario-based positioning`);
        
        if (maxLogos === 1) {
            // SCENARIO 1: Single logo - perfectly centered
            const logoX = (this.TEMPLATE_WIDTH - logoSize) / 2;
            console.log(`📐 Single logo centered at X=${logoX.toFixed(1)}`);
            await this.drawLogo(displayLogos[0].url, logoX, headerLogoY, logoSize, displayLogos[0].filename);
            
        } else if (maxLogos === 2) {
            // SCENARIO 2: Two logos - centered with reasonable spacing (adjusted for larger logos)
            const spacing = 50; // Reduced spacing for larger logos (was 60px)
            const totalWidth = (2 * logoSize) + spacing;
            const startX = (this.TEMPLATE_WIDTH - totalWidth) / 2;
            
            console.log(`📐 Two logos: spacing=${spacing}px, total width=${totalWidth}px, start X=${startX.toFixed(1)}`);
            
            // Draw first logo
            await this.drawLogo(displayLogos[0].url, startX, headerLogoY, logoSize, displayLogos[0].filename);
            // Draw second logo
            await this.drawLogo(displayLogos[1].url, startX + logoSize + spacing, headerLogoY, logoSize, displayLogos[1].filename);
            
        } else if (maxLogos === 3) {
            // SCENARIO 3: Three logos - centered with balanced spacing (adjusted for larger logos)
            const spacing = 40; // Reduced spacing for larger logos (was 45px)
            const totalWidth = (3 * logoSize) + (2 * spacing);
            const startX = (this.TEMPLATE_WIDTH - totalWidth) / 2;
            
            console.log(`📐 Three logos: spacing=${spacing}px, total width=${totalWidth}px, start X=${startX.toFixed(1)}`);
            
            // Draw all three logos
            for (let i = 0; i < 3; i++) {
                const logoX = startX + (i * (logoSize + spacing));
                console.log(`🎯 Logo ${i + 1} at X=${logoX.toFixed(1)}`);
                await this.drawLogo(displayLogos[i].url, logoX, headerLogoY, logoSize, displayLogos[i].filename);
            }
        }
    }
    
    /**
     * Check if a logo file exists by trying to load it
     * @param {string} logoUrl - URL to check
     * @returns {Promise<boolean>} - True if logo exists and loads
     */
    async checkIfLogoExists(logoUrl) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = logoUrl;
        });
    }
    
    /**
     * Draw a single logo with universal sizing and enhanced quality
     * @param {string} logoUrl - URL of the logo image (local path)
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} maxSize - Maximum size available
     * @param {string} alt - Alt text for accessibility
     */
    async drawLogo(logoUrl, x, y, maxSize, alt) {
        return new Promise((resolve) => {
            const logoImg = new Image();
            
            console.log(`📁 Loading logo: ${logoUrl}`);
            
            logoImg.onload = () => {
                // Use universal logo sizing function
                const logoSize = this.calculateLogoSize(logoImg, maxSize, maxSize, 20);
                
                // Center the logo in the allocated space
                const drawX = x + (maxSize - logoSize.width) / 2;
                const drawY = y + (maxSize - logoSize.height) / 2;
                
                // Draw the logo with high quality (no glow effects for print quality)
                this.ctx.imageSmoothingEnabled = true;
                this.ctx.imageSmoothingQuality = 'high';
                this.ctx.drawImage(logoImg, drawX, drawY, logoSize.width, logoSize.height);
                
                console.log(`✅ Logo ${alt} drawn with universal sizing at (${drawX.toFixed(1)}, ${drawY.toFixed(1)})`);
                resolve();
            };
            
            logoImg.onerror = () => {
                console.error(`❌ Failed to load logo: ${logoUrl}`);
                resolve();
            };
            
            logoImg.src = logoUrl;
        });
    }
    
    /**
     * Draw professional footer with AWS branding logo
     */
    async drawFooter() {
        const footerY = this.TEMPLATE_HEIGHT - this.FOOTER_HEIGHT;
        
        // Footer background with gradient
        const footerGradient = this.ctx.createLinearGradient(0, footerY, 0, footerY + this.FOOTER_HEIGHT);
        footerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
        footerGradient.addColorStop(1, 'rgba(255, 255, 255, 0.15)');
        
        this.drawRoundedRect(10, footerY, this.TEMPLATE_WIDTH - 20, this.FOOTER_HEIGHT - 10, 10);
        this.ctx.fillStyle = footerGradient;
        this.ctx.fill();
        
        // Footer border
        this.drawRoundedRect(10, footerY, this.TEMPLATE_WIDTH - 20, this.FOOTER_HEIGHT - 10, 10);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // Draw the mandatory AWS "Powered by AWS" logo
        await this.drawAwsPoweredByLogo(footerY);
    }
    
    /**
     * Draw the mandatory AWS "Powered by AWS" logo in footer (slightly bigger with glow)
     * @param {number} footerY - Y position of footer
     */
    async drawAwsPoweredByLogo(footerY) {
        return new Promise((resolve) => {
            const awsLogo = new Image();
            
            awsLogo.onload = () => {
                // Make footer logo slightly bigger - use more of the available space
                const maxLogoHeight = this.FOOTER_HEIGHT - 20; // Less margin for bigger logo
                const logoAspectRatio = awsLogo.width / awsLogo.height; // Stacked logo ratio
                
                let logoHeight = maxLogoHeight;
                let logoWidth = logoHeight * logoAspectRatio;
                
                // Use more width if available (make it bigger)
                const maxLogoWidth = this.TEMPLATE_WIDTH - 60; // Less margins for bigger logo
                if (logoWidth < maxLogoWidth * 0.8) {
                    logoWidth = maxLogoWidth * 0.8; // Use 80% of available width
                    logoHeight = logoWidth / logoAspectRatio;
                    
                    // If height becomes too big, scale back down
                    if (logoHeight > maxLogoHeight) {
                        logoHeight = maxLogoHeight;
                        logoWidth = logoHeight * logoAspectRatio;
                    }
                }
                
                // Center the logo in the footer (fix vertical centering)
                const logoX = (this.TEMPLATE_WIDTH - logoWidth) / 2;
                const logoY = footerY + (this.FOOTER_HEIGHT - logoHeight) / 2 - 5; // Adjust up by 5px from bottom
                
                // Draw the new stacked AWS logo with high quality (no glow for print quality)
                this.ctx.imageSmoothingEnabled = true;
                this.ctx.imageSmoothingQuality = 'high';
                this.ctx.drawImage(awsLogo, logoX, logoY, logoWidth, logoHeight);
                
                console.log(`✅ Footer AWS logo drawn bigger with glow (${logoWidth}x${logoHeight})`);
                resolve();
            };
            
            awsLogo.onerror = () => {
                console.error('❌ Failed to load new AWS Powered by logo, drawing fallback text');
                // Enhanced fallback text
                this.ctx.fillStyle = '#FF9900'; // AWS Orange
                this.ctx.font = 'bold 18px "Amazon Ember", "Helvetica Neue", Arial, sans-serif'; // Bigger font
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                
                // Add text shadow
                this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                this.ctx.shadowOffsetX = 1;
                this.ctx.shadowOffsetY = 1;
                this.ctx.shadowBlur = 2;
                
                const footerCenterX = this.TEMPLATE_WIDTH / 2;
                const footerCenterY = footerY + (this.FOOTER_HEIGHT / 2);
                
                this.ctx.fillText('Powered by AWS', footerCenterX, footerCenterY);
                
                // Reset shadow
                this.ctx.shadowColor = 'transparent';
                this.ctx.shadowOffsetX = 0;
                this.ctx.shadowOffsetY = 0;
                this.ctx.shadowBlur = 0;
                
                resolve();
            };
            
            // Load the new stacked AWS logo
            awsLogo.src = 'powered-by-aws-white-stacked.png';
        });
    }
    
    /**
     * Get template configuration for external use
     */
    getTemplateConfig() {
        return this.templateConfig;
    }
    
    /**
     * Update template configuration
     */
    updateTemplateConfig(newConfig) {
        this.templateConfig = { ...this.templateConfig, ...newConfig };
    }
}

// Export for use in other scripts
window.SnapMagicTemplateSystem = SnapMagicTemplateSystem;
