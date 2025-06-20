// SnapMagic Frontend JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    initializeApp();
    
    // Setup event listeners
    setupEventListeners();
    
    // Display device information
    displayDeviceInfo();
    
    // Add some interactive magic
    addMagicalEffects();
});

function initializeApp() {
    console.log('🎉 SnapMagic Hello World App Initialized!');
    
    // Add a welcome message to console
    console.log(`
    ╔══════════════════════════════════════╗
    ║            SNAPMAGIC                 ║
    ║         Hello World App              ║
    ║                                      ║
    ║  📱 Mobile Ready                     ║
    ║  💻 Desktop Optimized                ║
    ║  📺 TV Compatible                    ║
    ║  📱 Tablet Friendly                  ║
    ╚══════════════════════════════════════╝
    `);
}

function setupEventListeners() {
    // Mobile navigation toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Animate the hamburger icon
            const icon = navToggle.textContent;
            navToggle.textContent = icon === '☰' ? '✕' : '☰';
        });
    }
    
    // CTA Button interaction
    const ctaButton = document.getElementById('ctaButton');
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            showWelcomeMessage();
            createMagicalParticles();
        });
    }
    
    // Navigation smooth scrolling
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId.startsWith('#')) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
            
            // Close mobile menu if open
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.textContent = '☰';
            }
        });
    });
    
    // Window resize handler for responsive adjustments
    window.addEventListener('resize', function() {
        displayDeviceInfo();
        adjustForScreenSize();
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.classList.contains('cta-button')) {
            e.target.click();
        }
    });
}

function displayDeviceInfo() {
    const deviceInfo = document.getElementById('deviceInfo');
    if (!deviceInfo) return;
    
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    let deviceType = 'Desktop';
    let deviceIcon = '💻';
    
    if (screenWidth <= 480) {
        deviceType = 'Mobile Phone';
        deviceIcon = '📱';
    } else if (screenWidth <= 768) {
        deviceType = 'Tablet';
        deviceIcon = '📱';
    } else if (screenWidth <= 1024) {
        deviceType = 'Laptop';
        deviceIcon = '💻';
    } else if (screenWidth >= 1600) {
        deviceType = 'Large Display/TV';
        deviceIcon = '📺';
    }
    
    const orientation = screenWidth > screenHeight ? 'Landscape' : 'Portrait';
    
    deviceInfo.innerHTML = `
        ${deviceIcon} ${deviceType} | 
        ${screenWidth}×${screenHeight} | 
        ${orientation} | 
        DPR: ${devicePixelRatio}
    `;
}

function adjustForScreenSize() {
    const screenWidth = window.innerWidth;
    const body = document.body;
    
    // Remove existing size classes
    body.classList.remove('mobile', 'tablet', 'desktop', 'large-screen');
    
    // Add appropriate class based on screen size
    if (screenWidth <= 480) {
        body.classList.add('mobile');
    } else if (screenWidth <= 768) {
        body.classList.add('tablet');
    } else if (screenWidth >= 1600) {
        body.classList.add('large-screen');
    } else {
        body.classList.add('desktop');
    }
}

function showWelcomeMessage() {
    // Create a modal-like welcome message
    const existingModal = document.querySelector('.welcome-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'welcome-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>🎉 Welcome to SnapMagic!</h2>
            <p>Your magical journey begins now...</p>
            <p>This app works perfectly on:</p>
            <ul>
                <li>📱 Mobile phones</li>
                <li>📱 Tablets</li>
                <li>💻 Laptops & PCs</li>
                <li>📺 TVs & Large displays</li>
            </ul>
            <button class="close-modal">Close</button>
        </div>
    `;
    
    // Add modal styles
    const modalStyles = `
        .welcome-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease-out;
        }
        
        .modal-content {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            border-radius: 20px;
            text-align: center;
            max-width: 90%;
            max-height: 90%;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        
        .modal-content h2 {
            margin-bottom: 1rem;
            font-size: 1.5rem;
        }
        
        .modal-content ul {
            text-align: left;
            margin: 1rem 0;
            padding-left: 1rem;
        }
        
        .modal-content li {
            margin: 0.5rem 0;
        }
        
        .close-modal {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 2px solid rgba(255, 255, 255, 0.3);
            padding: 0.75rem 1.5rem;
            border-radius: 25px;
            cursor: pointer;
            margin-top: 1rem;
            transition: all 0.3s ease;
        }
        
        .close-modal:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    
    // Add styles to head if not already present
    if (!document.querySelector('#modal-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'modal-styles';
        styleSheet.textContent = modalStyles;
        document.head.appendChild(styleSheet);
    }
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeButton = modal.querySelector('.close-modal');
    const closeModal = () => {
        modal.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => modal.remove(), 300);
    };
    
    closeButton.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Close with Escape key
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

function createMagicalParticles() {
    const particleCount = 20;
    const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'];
    
    for (let i = 0; i < particleCount; i++) {
        setTimeout(() => {
            createParticle(colors[Math.floor(Math.random() * colors.length)]);
        }, i * 100);
    }
}

function createParticle(color) {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 999;
        left: ${Math.random() * window.innerWidth}px;
        top: ${window.innerHeight}px;
        animation: floatUp 3s ease-out forwards;
    `;
    
    // Add float animation if not already present
    if (!document.querySelector('#particle-styles')) {
        const particleStyles = document.createElement('style');
        particleStyles.id = 'particle-styles';
        particleStyles.textContent = `
            @keyframes floatUp {
                to {
                    transform: translateY(-${window.innerHeight + 100}px) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(particleStyles);
    }
    
    document.body.appendChild(particle);
    
    // Remove particle after animation
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 3000);
}

function addMagicalEffects() {
    // Add hover effects to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add click effect to magic circle
    const magicCircle = document.querySelector('.magic-circle');
    if (magicCircle) {
        magicCircle.addEventListener('click', function() {
            this.style.animation = 'none';
            setTimeout(() => {
                this.style.animation = 'float 3s ease-in-out infinite, rotate 10s linear infinite';
            }, 100);
            
            // Create a burst of particles
            createMagicalParticles();
        });
    }
    
    // Add parallax effect on scroll (for larger screens)
    if (window.innerWidth > 768) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.hero-image');
            
            parallaxElements.forEach(element => {
                const speed = 0.5;
                element.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }
}

// Performance monitoring
function logPerformanceMetrics() {
    if ('performance' in window) {
        window.addEventListener('load', function() {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('📊 Performance Metrics:');
                console.log(`DOM Content Loaded: ${perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart}ms`);
                console.log(`Page Load Complete: ${perfData.loadEventEnd - perfData.loadEventStart}ms`);
                console.log(`Total Load Time: ${perfData.loadEventEnd - perfData.fetchStart}ms`);
            }, 0);
        });
    }
}

// Initialize performance monitoring
logPerformanceMetrics();

// Service Worker registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Uncomment when you want to add PWA features
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(error => console.log('SW registration failed'));
    });
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeApp,
        displayDeviceInfo,
        createMagicalParticles
    };
}
