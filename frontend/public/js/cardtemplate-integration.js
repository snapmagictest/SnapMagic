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
                return await this.createTradingCard(novaImageBase64, userPrompt);
            }
        }
    });
    
    console.log('✅ SnapMagicTemplateSystem extended with CardTemplate support');
}

// Template Selection UI Enhancement
class SnapMagicTemplateSelector {
    constructor() {
        this.currentTemplate = 'sleek';
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
        // Check if we should add template selector to existing UI
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            this.addTemplateSelectorToUI();
        }
    }
    
    /**
     * Add template selector to existing UI
     */
    addTemplateSelectorToUI() {
        // Find the input section
        const inputSection = document.querySelector('.input-section');
        if (!inputSection) return;
        
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
                                 border: 2px solid ${key === this.currentTemplate ? 'var(--accent-gradient)' : 'var(--glass-border)'};
                                 border-radius: var(--border-radius-sm);
                                 background: var(--dark-surface);
                                 cursor: pointer;
                                 transition: all 0.3s ease;
                                 text-align: center;
                             ">
                            <div class="template-preview" style="margin-bottom: 0.5rem;">
                                <img src="${template.preview}" alt="${template.name}" style="width: 60px; height: 90px; border-radius: 4px;">
                            </div>
                            <div class="template-name" style="color: var(--text-primary); font-weight: 600; margin-bottom: 0.25rem;">${template.name}</div>
                            <div class="template-description" style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.3;">${template.description}</div>
                            ${template.category === 'premium' ? '<div style="color: var(--warning-gradient); font-size: 0.75rem; margin-top: 0.25rem;">✨ PREMIUM</div>' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Insert before the generate button
        const generateBtn = document.getElementById('generateBtn');
        generateBtn.insertAdjacentHTML('beforebegin', selectorHTML);
        
        // Add event listeners
        this.attachEventListeners();
    }
    
    /**
     * Attach event listeners to template options
     */
    attachEventListeners() {
        const templateOptions = document.querySelectorAll('.template-option');
        
        templateOptions.forEach(option => {
            option.addEventListener('click', () => {
                const templateKey = option.dataset.template;
                this.selectTemplate(templateKey);
            });
            
            // Add hover effects
            option.addEventListener('mouseenter', () => {
                if (!option.classList.contains('selected')) {
                    option.style.borderColor = 'var(--glass-hover)';
                    option.style.transform = 'translateY(-2px)';
                }
            });
            
            option.addEventListener('mouseleave', () => {
                if (!option.classList.contains('selected')) {
                    option.style.borderColor = 'var(--glass-border)';
                    option.style.transform = 'translateY(0)';
                }
            });
        });
    }
    
    /**
     * Select a template
     */
    selectTemplate(templateKey) {
        if (this.templates[templateKey]) {
            this.currentTemplate = templateKey;
            
            // Update UI
            document.querySelectorAll('.template-option').forEach(option => {
                const isSelected = option.dataset.template === templateKey;
                option.classList.toggle('selected', isSelected);
                option.style.borderColor = isSelected ? 'var(--accent-gradient)' : 'var(--glass-border)';
                option.style.transform = isSelected ? 'scale(1.02)' : 'scale(1)';
            });
            
            console.log(`✅ Template selected: ${templateKey}`);
            
            // Show premium notification for CardTemplate
            if (templateKey === 'cardtemplate') {
                this.showPremiumNotification();
            }
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
        const selectedTemplate = templateSelector ? templateSelector.getCurrentTemplate() : 'sleek';
        
        console.log(`🎴 Generating card with template: ${selectedTemplate}`);
        
        // Call original function with template parameter
        return await originalGenerateCard.call(this, ...args, selectedTemplate);
    };
}

// Initialize template selector when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for existing SnapMagic to initialize
    setTimeout(() => {
        window.snapMagicTemplateSelector = new SnapMagicTemplateSelector();
        console.log('✅ SnapMagic Template Selector initialized');
    }, 1000);
});

// Export for global access
window.SnapMagicTemplateSelector = SnapMagicTemplateSelector;

console.log('✅ CardTemplate Integration System loaded successfully');
