/**
 * SnapMagic Frontend - Card Generation Component
 * Handles trading card generation and display
 */

import { BaseComponent } from './BaseComponent.js';
import { ApiUtils, StringUtils, ValidationUtils, ImageUtils } from '../../../shared/utils/index.ts';
import { API_ENDPOINTS, ACTIONS, DEFAULT_LIMITS, ERROR_MESSAGES } from '../../../shared/constants/index.ts';

export class CardComponent extends BaseComponent {
    constructor(authComponent) {
        super('CardComponent');
        this.authComponent = authComponent;
        this.apiUrl = window.APP_CONFIG?.apiUrl || '';
        this.currentCard = null;
        this.cardHistory = [];
    }
    
    getElements() {
        this.elements = {
            // Main container
            cardContainer: this.getElementById('cardContainer'),
            
            // Input elements
            promptInput: this.getElementById('promptInput'),
            promptCharCount: this.getElementById('promptCharCount'),
            promptClearBtn: this.getElementById('promptClearBtn'),
            generateBtn: this.getElementById('generateBtn'),
            
            // Result elements
            resultContainer: this.getElementById('resultContainer'),
            resultActions: this.getElementById('resultActions'),
            downloadBtn: this.getElementById('downloadBtn'),
            createAnotherBtn: this.getElementById('createAnotherBtn'),
            
            // Gallery elements
            cardGallery: this.getElementById('cardGallery'),
            galleryNavigation: this.getElementById('galleryNavigation'),
            galleryPrevBtn: this.getElementById('galleryPrevBtn'),
            galleryNextBtn: this.getElementById('galleryNextBtn'),
            galleryDots: this.getElementById('galleryDots'),
            
            // Error/loading elements
            errorContainer: this.getElementById('cardError'),
            loadingOverlay: this.getElementById('cardLoading')
        };
    }
    
    getRequiredElements() {
        return ['promptInput', 'generateBtn', 'resultContainer'];
    }
    
    setupEventListeners() {
        // Generate button
        if (this.elements.generateBtn) {
            this.addEventListener(this.elements.generateBtn, 'click', this.handleGenerateCard.bind(this));
        }
        
        // Prompt input handling
        if (this.elements.promptInput) {
            this.addEventListener(this.elements.promptInput, 'input', this.handlePromptInput.bind(this));
            this.addEventListener(this.elements.promptInput, 'keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleGenerateCard();
                }
            });
        }
        
        // Clear prompt button
        if (this.elements.promptClearBtn) {
            this.addEventListener(this.elements.promptClearBtn, 'click', this.clearPrompt.bind(this));
        }
        
        // Download button
        if (this.elements.downloadBtn) {
            this.addEventListener(this.elements.downloadBtn, 'click', this.handleDownload.bind(this));
        }
        
        // Create another button
        if (this.elements.createAnotherBtn) {
            this.addEventListener(this.elements.createAnotherBtn, 'click', this.handleCreateAnother.bind(this));
        }
        
        // Gallery navigation
        if (this.elements.galleryPrevBtn) {
            this.addEventListener(this.elements.galleryPrevBtn, 'click', () => this.navigateGallery(-1));
        }
        if (this.elements.galleryNextBtn) {
            this.addEventListener(this.elements.galleryNextBtn, 'click', () => this.navigateGallery(1));
        }
        
        // Listen for authentication events
        this.on('login-success', this.handleAuthSuccess.bind(this));
        this.on('logout', this.handleLogout.bind(this));
    }
    
    async render() {
        // Initialize prompt character counter
        this.updateCharacterCount();
        
        // Load card history from storage
        this.loadCardHistory();
        
        // Update gallery display
        this.updateGalleryDisplay();
    }
    
    /**
     * Handle card generation
     */
    async handleGenerateCard() {
        const prompt = this.elements.promptInput.value.trim();
        
        // Validate input
        if (!this.validatePrompt(prompt)) {
            return;
        }
        
        // Check authentication
        if (!this.authComponent.isAuthenticated()) {
            this.showError('Please log in to generate cards', this.elements.errorContainer);
            return;
        }
        
        // Set loading state
        this.setGenerationLoading(true);
        this.clearError(this.elements.errorContainer);
        
        try {
            console.log('🎨 Generating card with prompt:', prompt);
            
            const response = await this.generateCard(prompt);
            
            if (response.success) {
                await this.handleGenerationSuccess(response.cardData);
            } else {
                this.handleGenerationError(response.error || ERROR_MESSAGES.GENERATION_FAILED);
            }
            
        } catch (error) {
            console.error('Card generation error:', error);
            this.handleGenerationError(ERROR_MESSAGES.NETWORK_ERROR);
        } finally {
            this.setGenerationLoading(false);
        }
    }
    
    /**
     * Validate prompt input
     */
    validatePrompt(prompt) {
        if (!prompt) {
            this.showError('Please enter a prompt for your card', this.elements.errorContainer);
            this.elements.promptInput.focus();
            return false;
        }
        
        if (!ValidationUtils.isValidPrompt(prompt, DEFAULT_LIMITS.MAX_PROMPT_LENGTH)) {
            this.showError(`Prompt must be between 1 and ${DEFAULT_LIMITS.MAX_PROMPT_LENGTH} characters`, this.elements.errorContainer);
            this.elements.promptInput.focus();
            return false;
        }
        
        return true;
    }
    
    /**
     * Generate card via API
     */
    async generateCard(prompt) {
        const requestData = {
            action: ACTIONS.GENERATE_CARD,
            userPrompt: prompt,
            template: 'cardtemplate'
        };
        
        const response = await ApiUtils.fetchWithTimeout(
            `${this.apiUrl}${API_ENDPOINTS.TRANSFORM_CARD}`,
            {
                method: 'POST',
                headers: ApiUtils.getAuthHeaders(this.authComponent.getAuthToken()),
                body: JSON.stringify(requestData)
            }
        );
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    }
    
    /**
     * Handle successful card generation
     */
    async handleGenerationSuccess(cardData) {
        console.log('✅ Card generated successfully:', cardData);
        
        // Store current card
        this.currentCard = cardData;
        
        // Add to history
        this.addToHistory(cardData);
        
        // Display card
        this.displayCard(cardData);
        
        // Show result actions
        this.showResultActions();
        
        // Update gallery
        this.updateGalleryDisplay();
        
        // Emit success event
        this.emit('card-generated', { cardData });
        
        // Clear prompt for next generation
        this.clearPrompt();
    }
    
    /**
     * Handle card generation error
     */
    handleGenerationError(errorMessage) {
        console.error('❌ Card generation failed:', errorMessage);
        this.showError(errorMessage, this.elements.errorContainer);
        
        // Emit error event
        this.emit('card-generation-error', { error: errorMessage });
    }
    
    /**
     * Display generated card
     */
    displayCard(cardData) {
        if (!this.elements.resultContainer) return;
        
        const cardHtml = `
            <div class="generated-card" data-card-id="${cardData.id}">
                <div class="card-image-container">
                    <img src="${cardData.imageBase64}" alt="Generated Trading Card" class="card-image">
                    <div class="card-overlay">
                        <div class="card-info">
                            <span class="card-prompt">${StringUtils.truncate(cardData.prompt, 100)}</span>
                            <span class="card-timestamp">${new Date(cardData.timestamp).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.elements.resultContainer.innerHTML = cardHtml;
        this.show(this.elements.resultContainer);
        
        // Animate card appearance
        const cardElement = this.elements.resultContainer.querySelector('.generated-card');
        if (cardElement) {
            this.animate(cardElement, 'fade-in');
        }
    }
    
    /**
     * Show result actions
     */
    showResultActions() {
        if (this.elements.resultActions) {
            this.show(this.elements.resultActions);
        }
    }
    
    /**
     * Handle download
     */
    async handleDownload() {
        if (!this.currentCard) {
            this.showError('No card to download', this.elements.errorContainer);
            return;
        }
        
        try {
            // Create download link
            const link = document.createElement('a');
            link.href = this.currentCard.imageBase64;
            link.download = `snapmagic-card-${this.currentCard.id}.png`;
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log('✅ Card downloaded successfully');
            
        } catch (error) {
            console.error('Download error:', error);
            this.showError('Failed to download card', this.elements.errorContainer);
        }
    }
    
    /**
     * Handle create another card
     */
    handleCreateAnother() {
        // Clear current results
        this.currentCard = null;
        
        if (this.elements.resultContainer) {
            this.elements.resultContainer.innerHTML = '';
            this.hide(this.elements.resultContainer);
        }
        
        if (this.elements.resultActions) {
            this.hide(this.elements.resultActions);
        }
        
        // Focus on prompt input
        if (this.elements.promptInput) {
            this.elements.promptInput.focus();
        }
        
        this.clearError(this.elements.errorContainer);
    }
    
    /**
     * Handle prompt input changes
     */
    handlePromptInput() {
        this.updateCharacterCount();
        this.clearError(this.elements.errorContainer);
    }
    
    /**
     * Update character count display
     */
    updateCharacterCount() {
        if (!this.elements.promptInput || !this.elements.promptCharCount) return;
        
        const currentLength = this.elements.promptInput.value.length;
        const maxLength = DEFAULT_LIMITS.MAX_PROMPT_LENGTH;
        
        this.elements.promptCharCount.textContent = `${currentLength}/${maxLength}`;
        
        // Update styling based on length
        if (currentLength > maxLength * 0.9) {
            this.elements.promptCharCount.classList.add('warning');
        } else {
            this.elements.promptCharCount.classList.remove('warning');
        }
    }
    
    /**
     * Clear prompt input
     */
    clearPrompt() {
        if (this.elements.promptInput) {
            this.elements.promptInput.value = '';
            this.updateCharacterCount();
        }
    }
    
    /**
     * Set generation loading state
     */
    setGenerationLoading(loading) {
        this.setLoading(this.elements.generateBtn, loading);
        
        if (this.elements.loadingOverlay) {
            this.toggle(this.elements.loadingOverlay, loading);
        }
        
        // Disable prompt input during generation
        if (this.elements.promptInput) {
            this.elements.promptInput.disabled = loading;
        }
    }
    
    /**
     * Add card to history
     */
    addToHistory(cardData) {
        this.cardHistory.unshift(cardData);
        
        // Limit history size
        if (this.cardHistory.length > 10) {
            this.cardHistory = this.cardHistory.slice(0, 10);
        }
        
        // Save to storage
        this.saveCardHistory();
    }
    
    /**
     * Load card history from storage
     */
    loadCardHistory() {
        const saved = StorageUtils.getItem('cardHistory');
        if (saved && Array.isArray(saved)) {
            this.cardHistory = saved;
        }
    }
    
    /**
     * Save card history to storage
     */
    saveCardHistory() {
        StorageUtils.setItem('cardHistory', this.cardHistory);
    }
    
    /**
     * Update gallery display
     */
    updateGalleryDisplay() {
        if (!this.elements.cardGallery || this.cardHistory.length === 0) {
            if (this.elements.cardGallery) {
                this.hide(this.elements.cardGallery);
            }
            return;
        }
        
        // Show gallery
        this.show(this.elements.cardGallery);
        
        // Render gallery items
        const galleryHtml = this.cardHistory.map((card, index) => `
            <div class="gallery-item ${index === 0 ? 'active' : ''}" data-index="${index}">
                <img src="${card.imageBase64}" alt="Card ${index + 1}" class="gallery-image">
                <div class="gallery-info">
                    <span class="gallery-prompt">${StringUtils.truncate(card.prompt, 50)}</span>
                </div>
            </div>
        `).join('');
        
        this.elements.cardGallery.innerHTML = galleryHtml;
        
        // Update navigation
        this.updateGalleryNavigation();
    }
    
    /**
     * Navigate gallery
     */
    navigateGallery(direction) {
        const items = this.elements.cardGallery?.querySelectorAll('.gallery-item');
        if (!items || items.length === 0) return;
        
        const currentIndex = Array.from(items).findIndex(item => item.classList.contains('active'));
        let newIndex = currentIndex + direction;
        
        // Wrap around
        if (newIndex < 0) newIndex = items.length - 1;
        if (newIndex >= items.length) newIndex = 0;
        
        // Update active item
        items[currentIndex]?.classList.remove('active');
        items[newIndex]?.classList.add('active');
        
        // Update navigation
        this.updateGalleryNavigation();
    }
    
    /**
     * Update gallery navigation
     */
    updateGalleryNavigation() {
        if (!this.elements.galleryNavigation) return;
        
        const hasMultipleItems = this.cardHistory.length > 1;
        this.toggle(this.elements.galleryNavigation, hasMultipleItems);
    }
    
    /**
     * Handle authentication success
     */
    handleAuthSuccess(data) {
        console.log('🔐 Authentication successful, enabling card generation');
        
        // Enable generation if disabled
        if (this.elements.generateBtn) {
            this.elements.generateBtn.disabled = false;
        }
    }
    
    /**
     * Handle logout
     */
    handleLogout() {
        console.log('🚪 User logged out, disabling card generation');
        
        // Clear current card
        this.currentCard = null;
        
        // Clear results
        if (this.elements.resultContainer) {
            this.elements.resultContainer.innerHTML = '';
            this.hide(this.elements.resultContainer);
        }
        
        // Hide result actions
        if (this.elements.resultActions) {
            this.hide(this.elements.resultActions);
        }
        
        // Disable generation
        if (this.elements.generateBtn) {
            this.elements.generateBtn.disabled = true;
        }
    }
    
    /**
     * Get current card data
     */
    getCurrentCard() {
        return this.currentCard;
    }
    
    /**
     * Get card history
     */
    getCardHistory() {
        return [...this.cardHistory];
    }
}
