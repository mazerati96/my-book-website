// ============================================
// FALLING ASH EFFECT - PRIORITY CODE
// ============================================
function initializeFallingAsh() {
    console.log('🔥 Initializing falling ash effect...');

    const container = document.querySelector('.matrix-style-bg');

    if (!container) {
        console.error('❌ Container .matrix-style-bg not found!');
        return;
    }

    console.log('✅ Container found, creating particles...');

    // Clear any existing particles
    const existingParticles = container.querySelectorAll('.ash-particle');
    existingParticles.forEach(p => p.remove());

    // Create 120 ash particles for a nice effect
    const particleCount = 120;

    for (let i = 0; i < particleCount; i++) {
        // Create particle element
        const particle = document.createElement('div');
        particle.className = 'ash-particle';

        // Random properties
        const size = Math.random() * 2.5 + 1.5; // 1.5-4px
        const startX = Math.random() * 100; // 0-100%
        const endX = startX + (Math.random() * 40 - 20); // drift left/right
        const duration = Math.random() * 12 + 10; // 10-22 seconds
        const delay = Math.random() * 8; // 0-8 second stagger
        const opacity = Math.random() * 0.4 + 0.5; // 0.5-0.9

        // Set inline styles
        particle.style.cssText = `
            position: fixed;
            left: ${startX}%;
            top: -20px;
            width: ${size}px;
            height: ${size}px;
            background: white;
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            will-change: transform, opacity;
        `;

        // Create unique animation name
        const animationName = `ash-fall-${i}`;

        // Create keyframe animation
        const keyframeRule = `
            @keyframes ${animationName} {
                0% {
                    transform: translate(0, -20px);
                    opacity: 0;
                }
                5% {
                    opacity: ${opacity};
                }
                95% {
                    opacity: ${opacity * 0.6};
                }
                100% {
                    transform: translate(${endX - startX}vw, calc(100vh + 20px));
                    opacity: 0;
                }
            }
        `;

        // Inject keyframes into stylesheet
        const styleSheet = document.createElement('style');
        styleSheet.textContent = keyframeRule;
        document.head.appendChild(styleSheet);

        // Apply animation
        particle.style.animation = `${animationName} ${duration}s linear ${delay}s infinite`;

        // Add to container
        container.appendChild(particle);
    }

    console.log(`✅ Created ${particleCount} ash particles!`);
    console.log(`📊 Total particles in DOM: ${document.querySelectorAll('.ash-particle').length}`);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFallingAsh);
} else {
    // DOM already loaded
    initializeFallingAsh();
}

// ============================================
// REST OF THE WEBSITE FUNCTIONALITY
// ============================================

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Glitch effect for hero text
const glitchText = document.querySelector('.glitch');
if (glitchText) {
    const originalText = glitchText.textContent;

    setInterval(() => {
        if (Math.random() > 0.95) {
            glitchText.textContent = originalText
                .split('')
                .map(char => Math.random() > 0.9 ? String.fromCharCode(33 + Math.floor(Math.random() * 94)) : char)
                .join('');

            setTimeout(() => {
                glitchText.textContent = originalText;
            }, 50);
        }
    }, 100);
}

// Contact form handling
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const button = this.querySelector('.submit-btn');
        const originalText = button.querySelector('span').textContent;

        // Get form data
        const formData = {
            name: this.querySelector('input[name="name"]').value,
            email: this.querySelector('input[name="email"]').value,
            message: this.querySelector('textarea[name="message"]').value
        };

        // Show transmitting state
        button.querySelector('span').textContent = 'TRANSMITTING...';
        button.style.opacity = '0.6';
        button.disabled = true;

        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                button.querySelector('span').textContent = 'MESSAGE SENT!';
                button.style.backgroundColor = 'var(--neon-white)';
                button.style.color = 'var(--bg-black)';

                setTimeout(() => {
                    button.querySelector('span').textContent = originalText;
                    button.style.opacity = '1';
                    button.style.backgroundColor = 'var(--primary-white)';
                    button.disabled = false;
                    this.reset();
                }, 2000);
            } else {
                throw new Error(result.error || 'Failed to send');
            }
        } catch (error) {
            console.error('Error:', error);
            button.querySelector('span').textContent = 'FAILED - TRY AGAIN';
            button.style.backgroundColor = 'var(--accent-red)';
            button.style.color = 'white';

            setTimeout(() => {
                button.querySelector('span').textContent = originalText;
                button.style.opacity = '1';
                button.style.backgroundColor = 'var(--primary-white)';
                button.disabled = false;
            }, 3000);
        }
    });
}

// Fade-in animation for sections on scroll
const fadeObserverOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, fadeObserverOptions);

// Apply fade animation to all major sections
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    fadeObserver.observe(section);
});

// Read button interaction
document.querySelectorAll('.read-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const chapterCard = this.closest('.chapter-card');
        const chapterTitle = chapterCard.querySelector('h3').textContent;

        this.textContent = 'LOADING...';
        this.style.backgroundColor = 'var(--neon-white)';
        this.style.color = 'var(--bg-black)';

        setTimeout(() => {
            alert(`Opening ${chapterTitle}...\n\nThis feature will link to your chapter pages once they're created!`);
            this.textContent = 'READ';
            this.style.backgroundColor = 'transparent';
            this.style.color = 'var(--primary-white)';
        }, 1000);
    });
});

// Konami code easter egg
let konamiCode = [];
const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);

    if (konamiCode.join('') === konamiPattern.join('')) {
        document.body.style.animation = 'rainbow 2s linear infinite';
        const style = document.createElement('style');
        style.textContent = `
            @keyframes rainbow {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        setTimeout(() => {
            document.body.style.animation = '';
        }, 5000);
    }
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-content');
    if (hero && scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        hero.style.opacity = 1 - (scrolled / window.innerHeight);
    }
});

// Console messages for developers
console.log('%c⚠ SYSTEM ACCESS DETECTED ⚠', 'color: #00d4ff; font-size: 20px; font-weight: bold; text-shadow: 0 0 10px #00d4ff;');
console.log('%cWelcome to the Book Website. If you\'re seeing this, you might be one of us.', 'color: #0099cc; font-size: 14px;');
console.log('%cBuilt with: HTML, CSS, JavaScript', 'color: #00d4ff; font-size: 12px;');