/**
 * SnapMagic CardTemplate Integration
 * Connects the new CardTemplate system with existing SnapMagic functionality
 */

// Extend the existing SnapMagicTemplateSystem to support CardTemplate
if (window.SnapMagicTemplateSystem) {
    
    // Add CardTemplate option to existing system
    Object.assign(SnapMagicTemplateSystem.prototype, {
        
        /**
         * Create trading card with template selection
         * @param {string} novaImageBase64 - Base64 encoded Nova Canvas image
         * @param {string} userPrompt - Original user prompt
         * @param {string} templateStyle - Template style ('sleek' or 'cardtemplate')
         * @returns {Promise<string>} - Base64 encoded final trading card
         */
        async createTradingCardWithTemplate(novaImageBase64, userPrompt = '', templateStyle = 'sleek') {
            console.log(`🎴 Creating trading card with template style: ${templateStyle}`);
            
            if (templateStyle === 'cardtemplate') {
                // Use new CardTemplate system
                if (window.SnapMagicCardTemplateSystem) {
                    console.log('✅ Using CardTemplate system for premium Art Deco card');
                    const cardTemplateSystem = new SnapMagicCardTemplateSystem();
                    
                    // Transfer configuration from existing system
                    cardTemplateSystem.updateTemplateConfig(this.getTemplateConfig());
                    
                    return await cardTemplateSystem.createCardTemplate(novaImageBase64, userPrompt);
                } else {
                    console.error('❌ CardTemplate system not loaded, falling back to sleek template');
                    return await this.createTradingCard(novaImageBase64, userPrompt);
                }
            } else {
                // Use existing sleek template
                console.log('✅ Using existing sleek template system');
                return await this.createTradingCard(novaImageBase64, userPrompt);
            }
        }
    });
    
    console.log('✅ SnapMagicTemplateSystem extended with CardTemplate support');
} else {
    console.error('❌ SnapMagicTemplateSystem not found - CardTemplate integration failed');
}

// Template Selection UI Enhancement
class SnapMagicTemplateSelector {
    constructor() {
        this.currentTemplate = 'cardtemplate'; // Changed from 'sleek' to use cardtemplateEdit.jpg
        this.templates = {
            'sleek': {
                name: 'Sleek Modern',
                description: 'Clean black design with holographic effects',
                preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzAwMCIgc3Ryb2tlPSIjZmYwMDgwIiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSI1MCIgeT0iNzUiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMTAiPk1vZGVybjwvdGV4dD48L3N2Zz4=',
                category: 'modern'
            },
            'cardtemplate': {
                name: 'Art Deco Premium',
                description: 'Luxury golden frame with 3D holographic effects',
                preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdvbGQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNGRkQ3MDAiLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iI0Q0QUYzNyIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0I4ODYwQiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTUwIiBmaWxsPSJ1cmwoI2dvbGQpIi8+PHJlY3QgeD0iMTAiIHk9IjE1IiB3aWR0aD0iODAiIGhlaWdodD0iMTIwIiBmaWxsPSIjMDAwIi8+PHBvbHlnb24gcG9pbnRzPSI1MCwxMCA2MCw1MCA0MCw1MCIgZmlsbD0iI0ZGRDcwMCIvPjx0ZXh0IHg9IjUwIiB5PSIxNDAiIGZpbGw9IiNGRkQ3MDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iOCIgZm9udC1mYW1pbHk9InNlcmlmIj5QUkVNSVVNPC90ZXh0Pjwvc3ZnPg==',
                category: 'premium'
            }
        };
        
        this.initializeSelector();
    }
    
    /**
     * Initialize template selector UI
     */
    initializeSelector() {
        console.log('🎨 Initializing template selector UI...');
        
        // Check if we should add template selector to existing UI
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            console.log('✅ Generate button found, adding template selector');
            this.addTemplateSelectorToUI();
        } else {
            console.log('⚠️ Generate button not found, retrying in 1 second...');
            setTimeout(() => {
                const retryBtn = document.getElementById('generateBtn');
                if (retryBtn) {
                    console.log('✅ Generate button found on retry, adding template selector');
                    this.addTemplateSelectorToUI();
                } else {
                    console.error('❌ Generate button still not found after retry');
                }
            }, 1000);
        }
    }
    
    /**
     * Add template selector to existing UI
     */
    addTemplateSelectorToUI() {
        console.log('🎨 Adding template selector to UI...');
        
        // Find the input section
        const inputSection = document.querySelector('.input-section');
        if (!inputSection) {
            console.error('❌ Input section not found for template selector');
            return;
        }
        
        console.log('✅ Input section found, creating template selector HTML');
        
        // Create template selector HTML
        const selectorHTML = `
            <div class="template-selector" style="margin: 1rem 0; padding: 1rem; background: var(--glass-bg); border-radius: var(--border-radius-md); border: 1px solid var(--glass-border);">
                <h3 style="color: var(--text-primary); margin-bottom: 1rem; font-size: 1.1rem;">🎨 Card Template Style</h3>
                <div class="template-options" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    ${Object.entries(this.templates).map(([key, template]) => `
                        <div class="template-option ${key === this.currentTemplate ? 'selected' : ''}" 
                             data-template="${key}"
                             style="
                                 padding: 1rem;
                                 border: 2px solid ${key === this.currentTemplate ? '#4facfe' : 'rgba(255, 255, 255, 0.12)'};
                                 border-radius: 12px;
                                 background: rgba(20, 20, 30, 0.6);
                                 cursor: pointer;
                                 transition: all 0.3s ease;
                                 text-align: center;
                             ">
                            <div class="template-preview" style="margin-bottom: 0.5rem;">
                                <img src="${template.preview}" alt="${template.name}" style="width: 60px; height: 90px; border-radius: 4px;">
                            </div>
                            <div class="template-name" style="color: #ffffff; font-weight: 600; margin-bottom: 0.25rem;">${template.name}</div>
                            <div class="template-description" style="color: #b8c5d6; font-size: 0.85rem; line-height: 1.3;">${template.description}</div>
                            ${template.category === 'premium' ? '<div style="color: #fa709a; font-size: 0.75rem; margin-top: 0.25rem;">✨ PREMIUM</div>' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Insert before the generate button
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.insertAdjacentHTML('beforebegin', selectorHTML);
            console.log('✅ Template selector HTML inserted');
            
            // Add event listeners
            this.attachEventListeners();
        } else {
            console.error('❌ Generate button not found when inserting template selector');
        }
    }
    
    /**
     * Attach event listeners to template options
     */
    attachEventListeners() {
        console.log('🎯 Attaching event listeners to template options...');
        
        const templateOptions = document.querySelectorAll('.template-option');
        console.log(`📊 Found ${templateOptions.length} template options`);
        
        templateOptions.forEach((option, index) => {
            const templateKey = option.dataset.template;
            console.log(`🔗 Attaching listener to template option ${index}: ${templateKey}`);
            
            option.addEventListener('click', () => {
                console.log(`🎯 Template option clicked: ${templateKey}`);
                this.selectTemplate(templateKey);
            });
            
            // Add hover effects
            option.addEventListener('mouseenter', () => {
                if (!option.classList.contains('selected')) {
                    option.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                    option.style.transform = 'translateY(-2px)';
                }
            });
            
            option.addEventListener('mouseleave', () => {
                if (!option.classList.contains('selected')) {
                    option.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                    option.style.transform = 'translateY(0)';
                }
            });
        });
        
        console.log('✅ Event listeners attached successfully');
    }
    
    /**
     * Select a template
     */
    selectTemplate(templateKey) {
        console.log(`🎯 Selecting template: ${templateKey}`);
        
        if (this.templates[templateKey]) {
            const previousTemplate = this.currentTemplate;
            this.currentTemplate = templateKey;
            
            console.log(`✅ Template changed from ${previousTemplate} to ${templateKey}`);
            
            // Update UI
            document.querySelectorAll('.template-option').forEach(option => {
                const isSelected = option.dataset.template === templateKey;
                option.classList.toggle('selected', isSelected);
                option.style.borderColor = isSelected ? '#4facfe' : 'rgba(255, 255, 255, 0.12)';
                option.style.transform = isSelected ? 'scale(1.02)' : 'scale(1)';
            });
            
            console.log(`✅ UI updated for template: ${templateKey}`);
            
            // Show premium notification for CardTemplate
            if (templateKey === 'cardtemplate') {
                console.log('✨ Showing premium notification for CardTemplate');
                this.showPremiumNotification();
            }
        } else {
            console.error(`❌ Template not found: ${templateKey}`);
        }
    }
    
    /**
     * Show premium template notification
     */
    showPremiumNotification() {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #D4AF37, #FFD700);
            color: #000;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
        `;
        notification.innerHTML = '✨ Premium Art Deco Template Selected!';
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                document.body.removeChild(notification);
                document.head.removeChild(style);
            }, 300);
        }, 3000);
    }
    
    /**
     * Get currently selected template
     */
    getCurrentTemplate() {
        return this.currentTemplate;
    }
    
    /**
     * Get template information
     */
    getTemplateInfo(templateKey) {
        return this.templates[templateKey] || null;
    }
}

// Modify existing card generation to use template selection
if (window.generateCard) {
    const originalGenerateCard = window.generateCard;
    
    window.generateCard = async function(...args) {
        // Get selected template
        const templateSelector = window.snapMagicTemplateSelector;
        const selectedTemplate = templateSelector ? templateSelector.getCurrentTemplate() : 'cardtemplate';
        
        console.log(`🎴 Generating card with template: ${selectedTemplate}`);
        
        // Call original function with template parameter
        return await originalGenerateCard.call(this, ...args, selectedTemplate);
    };
}

// Initialize template selector when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM loaded, initializing CardTemplate selector...');
    
    // Wait a bit for existing SnapMagic to initialize
    setTimeout(() => {
        try {
            window.snapMagicTemplateSelector = new SnapMagicTemplateSelector();
            console.log('✅ SnapMagic Template Selector initialized successfully');
            
            // Debug: Check if selector was created
            if (window.snapMagicTemplateSelector) {
                console.log('📊 Template Selector Debug:', {
                    currentTemplate: window.snapMagicTemplateSelector.getCurrentTemplate(),
                    availableTemplates: Object.keys(window.snapMagicTemplateSelector.templates)
                });
            }
        } catch (error) {
            console.error('❌ Failed to initialize Template Selector:', error);
        }
    }, 1000);
});

// Also try to initialize when the page is fully loaded
window.addEventListener('load', () => {
    console.log('🌐 Page fully loaded, checking CardTemplate initialization...');
    
    setTimeout(() => {
        if (!window.snapMagicTemplateSelector) {
            console.log('⚠️ Template selector not initialized, trying again...');
            try {
                window.snapMagicTemplateSelector = new SnapMagicTemplateSelector();
                console.log('✅ Template Selector initialized on page load');
            } catch (error) {
                console.error('❌ Failed to initialize Template Selector on page load:', error);
            }
        } else {
            console.log('✅ Template Selector already initialized');
        }
    }, 2000);
});

// Export for global access
window.SnapMagicTemplateSelector = SnapMagicTemplateSelector;

console.log('✅ CardTemplate Integration System loaded successfully');
