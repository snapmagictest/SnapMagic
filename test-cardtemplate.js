/**
 * Test script to verify CardTemplate system is working
 * This simulates the browser environment to test our CardTemplate integration
 */

// Simulate browser environment
global.window = {
    SNAPMAGIC_CONFIG: {
        API_URL: 'https://test.execute-api.us-east-1.amazonaws.com/',
        TEMPLATE_CONFIG: JSON.stringify({
            eventName: 'Test Event',
            logos: true,
            userName: 'Test User'
        }),
        VERSION: '3.0',
        FEATURES: ['trading_cards', 'video_animation', 'cardtemplate_premium']
    },
    HTMLCanvasElement: true,
    CanvasRenderingContext2D: true,
    requestAnimationFrame: (callback) => setTimeout(callback, 16),
    addEventListener: () => {},
    location: { hostname: 'localhost', search: '' }
};

global.document = {
    createElement: (tag) => {
        if (tag === 'canvas') {
            return {
                width: 500,
                height: 750,
                getContext: (type) => {
                    if (type === '2d') {
                        return {
                            imageSmoothingEnabled: true,
                            imageSmoothingQuality: 'high',
                            fillStyle: '#000000',
                            strokeStyle: '#ffffff',
                            lineWidth: 1,
                            globalAlpha: 1,
                            shadowColor: 'transparent',
                            shadowBlur: 0,
                            shadowOffsetX: 0,
                            shadowOffsetY: 0,
                            fillRect: () => {},
                            strokeRect: () => {},
                            beginPath: () => {},
                            moveTo: () => {},
                            lineTo: () => {},
                            arc: () => {},
                            closePath: () => {},
                            fill: () => {},
                            stroke: () => {},
                            drawImage: () => {},
                            createLinearGradient: () => ({
                                addColorStop: () => {}
                            }),
                            createRadialGradient: () => ({
                                addColorStop: () => {}
                            }),
                            save: () => {},
                            restore: () => {},
                            setTransform: () => {},
                            toDataURL: () => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
                        };
                    }
                    return null;
                }
            };
        }
        return {
            addEventListener: () => {},
            insertAdjacentHTML: () => {},
            style: {},
            classList: {
                add: () => {},
                remove: () => {},
                toggle: () => {},
                contains: () => false
            }
        };
    },
    getElementById: (id) => {
        if (id === 'generateBtn') {
            return {
                insertAdjacentHTML: () => {},
                addEventListener: () => {}
            };
        }
        return null;
    },
    querySelector: (selector) => {
        if (selector === '.input-section') {
            return { insertAdjacentHTML: () => {} };
        }
        return null;
    },
    querySelectorAll: () => [],
    addEventListener: () => {},
    readyState: 'complete',
    head: {
        appendChild: () => {}
    },
    body: {
        appendChild: () => {},
        removeChild: () => {},
        contains: () => true
    },
    dispatchEvent: () => {}
};

global.Image = function() {
    return {
        onload: null,
        onerror: null,
        src: '',
        width: 100,
        height: 100
    };
};

// Load our CardTemplate system files
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing CardTemplate System...\n');

try {
    // Load CardTemplate system
    const cardTemplateSystemCode = fs.readFileSync(
        path.join(__dirname, 'frontend/public/js/cardtemplate-system.js'), 
        'utf8'
    );
    
    const cardTemplate3DCode = fs.readFileSync(
        path.join(__dirname, 'frontend/public/js/cardtemplate-3d-effects.js'), 
        'utf8'
    );
    
    const cardTemplateBrandingCode = fs.readFileSync(
        path.join(__dirname, 'frontend/public/js/cardtemplate-branding.js'), 
        'utf8'
    );
    
    const cardTemplateIntegrationCode = fs.readFileSync(
        path.join(__dirname, 'frontend/public/js/cardtemplate-integration.js'), 
        'utf8'
    );
    
    console.log('✅ All CardTemplate files loaded successfully');
    
    // Execute the code
    eval(cardTemplateSystemCode);
    eval(cardTemplate3DCode);
    eval(cardTemplateBrandingCode);
    eval(cardTemplateIntegrationCode);
    
    console.log('✅ CardTemplate system code executed successfully');
    
    // Test CardTemplate system creation
    if (global.window.SnapMagicCardTemplateSystem) {
        console.log('✅ SnapMagicCardTemplateSystem class available');
        
        const cardTemplate = new global.window.SnapMagicCardTemplateSystem();
        console.log('✅ CardTemplate instance created successfully');
        
        // Test template configuration
        console.log('📊 Template Config:', cardTemplate.templateConfig);
        
        // Test basic properties
        console.log('📏 Template Dimensions:', {
            width: cardTemplate.TEMPLATE_WIDTH,
            height: cardTemplate.TEMPLATE_HEIGHT,
            panelWidth: cardTemplate.PANEL_WIDTH,
            panelHeight: cardTemplate.PANEL_HEIGHT
        });
        
        console.log('🎨 Rainbow Colors:', cardTemplate.RAINBOW_COLORS.length, 'colors');
        
    } else {
        console.error('❌ SnapMagicCardTemplateSystem class not found');
    }
    
    // Test template selector
    if (global.window.SnapMagicTemplateSelector) {
        console.log('✅ SnapMagicTemplateSelector class available');
        
        const selector = new global.window.SnapMagicTemplateSelector();
        console.log('✅ Template selector instance created successfully');
        
        console.log('📊 Available Templates:', Object.keys(selector.templates));
        console.log('🎯 Current Template:', selector.getCurrentTemplate());
        
    } else {
        console.error('❌ SnapMagicTemplateSelector class not found');
    }
    
    // Test a simple card generation (mock)
    console.log('\n🎴 Testing Card Generation...');
    
    if (global.window.SnapMagicCardTemplateSystem) {
        const cardTemplate = new global.window.SnapMagicCardTemplateSystem();
        
        // Mock Nova Canvas image (1x1 transparent PNG)
        const mockNovaImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
        
        // Test card creation (this will use our mock canvas)
        cardTemplate.createCardTemplate(mockNovaImage, 'Test prompt')
            .then((result) => {
                console.log('✅ Card generation completed successfully');
                console.log('📊 Result length:', result.length, 'characters');
                console.log('🎉 CardTemplate system is working correctly!');
            })
            .catch((error) => {
                console.error('❌ Card generation failed:', error.message);
            });
    }
    
} catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
}

console.log('\n🧪 CardTemplate Test Complete');
