// Add this to the top of your SnapMagicApp class (around line 50-100)
class SnapMagicApp {
    constructor() {
        // ... your existing constructor code ...
        
        // ADD THIS: Concurrency control for card generation
        this.activeCardRequests = 0;
        this.maxConcurrentCards = 2; // Conservative safe limit
        this.cardRequestQueue = [];
        
        // ... rest of your existing constructor ...
    }
    
    // ... your existing methods ...
    
    // REPLACE your existing generateCardWithName method with this:
    async generateCardWithName(userPrompt, userName) {
        // NEW: Check if we're at the concurrent limit
        if (this.activeCardRequests >= this.maxConcurrentCards) {
            // Queue the request instead of processing immediately
            return this.queueCardRequest(userPrompt, userName);
        }
        
        // Process the request immediately
        return this.processCardRequest(userPrompt, userName);
    }
    
    // NEW METHOD: Queue card requests when at capacity
    async queueCardRequest(userPrompt, userName) {
        console.log(`🚦 Card request queued (${this.activeCardRequests}/${this.maxConcurrentCards} slots busy)`);
        
        // Show user they're in queue
        this.showProcessing(`Your card is being prepared... You're #${this.cardRequestQueue.length + 1} in line`);
        this.elements.generateBtn.disabled = true;
        
        // Add to queue
        return new Promise((resolve, reject) => {
            this.cardRequestQueue.push({
                userPrompt,
                userName,
                resolve,
                reject
            });
        });
    }
    
    // NEW METHOD: Process card requests with concurrency tracking
    async processCardRequest(userPrompt, userName) {
        this.activeCardRequests++; // Track this request
        console.log(`🎯 Processing card request (${this.activeCardRequests}/${this.maxConcurrentCards} slots busy)`);
        
        try {
            this.showProcessing('Creating your magical trading card...');
            this.elements.generateBtn.disabled = true;
            
            const apiBaseUrl = window.SNAPMAGIC_CONFIG.API_URL;
            
            // YOUR EXISTING API CALL (unchanged)
            const response = await fetch(`${apiBaseUrl}api/transform-card`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentUser.token}`,
                    'X-Device-ID': this.deviceId
                },
                body: JSON.stringify({
                    prompt: userPrompt,
                    user_name: userName
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Card generation successful:', data);
                
                this.generatedCardData = data;
                this.displayGeneratedCard(data, userName);
                this.hideProcessing();
                
                return data;
            } else {
                console.error('❌ Card generation failed:', response.status);
                this.hideProcessing();
                this.showError('Card generation failed. Please try again.');
                throw new Error(`Card generation failed: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Card generation error:', error);
            this.hideProcessing();
            this.showError('Card generation failed. Please try again.');
            throw error;
        } finally {
            this.activeCardRequests--; // Stop tracking this request
            this.elements.generateBtn.disabled = false;
            
            // Process next request in queue
            this.processNextCardInQueue();
        }
    }
    
    // NEW METHOD: Process next queued card request
    processNextCardInQueue() {
        if (this.cardRequestQueue.length > 0 && this.activeCardRequests < this.maxConcurrentCards) {
            const nextRequest = this.cardRequestQueue.shift();
            console.log(`🚀 Processing next queued card request (${this.cardRequestQueue.length} remaining in queue)`);
            
            // Process the queued request
            this.processCardRequest(nextRequest.userPrompt, nextRequest.userName)
                .then(nextRequest.resolve)
                .catch(nextRequest.reject);
        }
    }
    
    // ... rest of your existing methods unchanged ...
}

// USAGE INSTRUCTIONS:
// 1. Replace your existing generateCardWithName method with processCardRequest
// 2. Add the new methods: queueCardRequest and processNextCardInQueue  
// 3. Add the constructor properties: activeCardRequests, maxConcurrentCards, cardRequestQueue
// 4. Test with multiple users clicking generate at the same time
