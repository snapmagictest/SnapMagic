/**
 * SnapMagic Animated GIF Capture System
 * Captures the live holographic card with all CSS animations intact
 */

class SnapMagicAnimatedGIFCapture {
    constructor() {
        this.isCapturing = false;
        this.onProgress = null;
        this.onComplete = null;
    }

    /**
     * Capture the animated holographic card as GIF
     * @param {HTMLElement} cardElement - The .snapmagic-card element
     * @param {Object} options - Capture options
     */
    async captureAnimatedCard(cardElement, options = {}) {
        if (this.isCapturing) {
            throw new Error('Capture already in progress');
        }

        const settings = {
            frames: 30,           // Number of frames to capture
            framerate: 15,        // FPS for final GIF
            quality: 1,           // GIF quality (1 = highest)
            duration: 2000,       // Total animation duration to capture (ms)
            ...options
        };

        console.log('🎬 Starting animated GIF capture with settings:', settings);

        try {
            this.isCapturing = true;

            // Ensure html2canvas is loaded
            await this.loadHTML2Canvas();

            // Prepare the card element for capture
            const originalState = this.prepareCardForCapture(cardElement);

            // Capture all animation frames
            const frames = await this.captureAnimationFrames(cardElement, settings);

            // Restore original card state
            this.restoreCardState(cardElement, originalState);

            // Generate GIF from frames
            const gifBlob = await this.createGIFFromFrames(frames, settings);

            console.log('✅ Animated GIF capture completed:', {
                frames: frames.length,
                size: Math.round(gifBlob.size / 1024) + 'KB'
            });

            if (this.onComplete) {
                this.onComplete(gifBlob);
            }

            return gifBlob;

        } catch (error) {
            console.error('❌ Animated GIF capture failed:', error);
            throw error;
        } finally {
            this.isCapturing = false;
        }
    }

    /**
     * Prepare card element for frame capture
     */
    prepareCardForCapture(cardElement) {
        // Store original animation state
        const originalState = {
            animationPlayState: cardElement.style.animationPlayState,
            animationDelay: cardElement.style.animationDelay,
            transform: cardElement.style.transform
        };

        // Also store state for pseudo-elements (before/after)
        const beforeElement = window.getComputedStyle(cardElement, '::before');
        const afterElement = window.getComputedStyle(cardElement, '::after');

        originalState.beforeAnimation = {
            animationPlayState: beforeElement.animationPlayState,
            animationDelay: beforeElement.animationDelay
        };

        originalState.afterAnimation = {
            animationPlayState: afterElement.animationPlayState,
            animationDelay: afterElement.animationDelay
        };

        return originalState;
    }

    /**
     * Capture frames at different animation states
     */
    async captureAnimationFrames(cardElement, settings) {
        const frames = [];
        const frameDelay = settings.duration / settings.frames;

        console.log(`📸 Capturing ${settings.frames} frames...`);

        for (let frameIndex = 0; frameIndex < settings.frames; frameIndex++) {
            // Calculate animation progress (0 to 1)
            const progress = frameIndex / (settings.frames - 1);
            
            // Set animation to specific time point
            await this.setAnimationToFrame(cardElement, progress, settings.duration);

            // Wait for animation state to settle
            await this.wait(50);

            // Capture the frame
            const canvas = await html2canvas(cardElement, {
                scale: 1,
                useCORS: false,
                allowTaint: true,
                backgroundColor: null,
                logging: false,
                width: cardElement.offsetWidth,
                height: cardElement.offsetHeight
            });

            // Convert to data URL and store
            const frameDataURL = canvas.toDataURL('image/png');
            frames.push(frameDataURL);

            // Progress callback
            if (this.onProgress) {
                this.onProgress(frameIndex + 1, settings.frames);
            }

            console.log(`✅ Frame ${frameIndex + 1}/${settings.frames} captured`);
        }

        return frames;
    }

    /**
     * Set animation to specific frame/time
     */
    async setAnimationToFrame(cardElement, progress, totalDuration) {
        // Calculate the delay needed to show this frame
        // Negative delay moves animation to specific point
        const animationDelay = -(progress * totalDuration);

        // Pause all animations at the calculated time
        cardElement.style.animationPlayState = 'paused';
        cardElement.style.animationDelay = `${animationDelay}ms`;

        // Force reflow to apply the animation state
        cardElement.offsetHeight;

        // Handle pseudo-elements (::before and ::after) that have animations
        // We need to inject CSS to control their animation state
        this.setPseudoElementAnimations(cardElement, animationDelay);
    }

    /**
     * Control pseudo-element animations via injected CSS
     */
    setPseudoElementAnimations(cardElement, animationDelay) {
        // Remove any existing injected style
        const existingStyle = document.getElementById('snapmagic-animation-control');
        if (existingStyle) {
            existingStyle.remove();
        }

        // Create new style element to control pseudo-element animations
        const style = document.createElement('style');
        style.id = 'snapmagic-animation-control';
        style.textContent = `
            .snapmagic-card.animated::before,
            .snapmagic-card.animated::after {
                animation-play-state: paused !important;
                animation-delay: ${animationDelay}ms !important;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Restore card to original animation state
     */
    restoreCardState(cardElement, originalState) {
        // Restore main element
        cardElement.style.animationPlayState = originalState.animationPlayState;
        cardElement.style.animationDelay = originalState.animationDelay;
        cardElement.style.transform = originalState.transform;

        // Remove injected animation control styles
        const injectedStyle = document.getElementById('snapmagic-animation-control');
        if (injectedStyle) {
            injectedStyle.remove();
        }

        // Force reflow to restore animations
        cardElement.offsetHeight;

        console.log('🔄 Card animation state restored');
    }

    /**
     * Create GIF from captured frames using gif.js
     */
    async createGIFFromFrames(frames, settings) {
        console.log('🎬 Creating GIF from captured frames...');

        // Ensure gif.js is loaded
        await this.loadGifJS();

        return new Promise((resolve, reject) => {
            const gif = new GIF({
                workers: 2,
                quality: settings.quality,
                workerScript: '/gif.worker.js',
                repeat: 0, // Infinite loop
                transparent: null
            });

            // Add each frame to the GIF
            frames.forEach((frameDataURL, index) => {
                const img = new Image();
                img.onload = () => {
                    gif.addFrame(img, {
                        delay: Math.round(1000 / settings.framerate) // Convert FPS to delay
                    });

                    // If this is the last frame, render the GIF
                    if (index === frames.length - 1) {
                        gif.render();
                    }
                };
                img.src = frameDataURL;
            });

            // Handle GIF completion
            gif.on('finished', (blob) => {
                console.log('✅ GIF generation completed');
                resolve(blob);
            });

            gif.on('error', (error) => {
                console.error('❌ GIF generation failed:', error);
                reject(error);
            });
        });
    }

    /**
     * Load html2canvas library if not already loaded
     */
    async loadHTML2Canvas() {
        if (window.html2canvas) {
            return;
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = () => {
                console.log('✅ html2canvas loaded');
                resolve();
            };
            script.onerror = () => reject(new Error('Failed to load html2canvas'));
            document.head.appendChild(script);
        });
    }

    /**
     * Load gif.js library if not already loaded
     */
    async loadGifJS() {
        if (window.GIF) {
            return;
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = '/gif.min.js';
            script.onload = () => {
                console.log('✅ gif.js loaded');
                resolve();
            };
            script.onerror = () => reject(new Error('Failed to load gif.js'));
            document.head.appendChild(script);
        });
    }

    /**
     * Utility: Wait for specified milliseconds
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Make available globally
window.SnapMagicAnimatedGIFCapture = SnapMagicAnimatedGIFCapture;
