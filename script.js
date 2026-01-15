// ============================================
// PAGE TRANSITION EFFECT
// ============================================
let isTransitioning = false;

function initPageTransition() {
    const overlay = document.querySelector('.page-transition');

    // Handle all internal links
    document.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute('href');

        // Only handle internal HTML links
        if (href && href.endsWith('.html') && !link.hasAttribute('data-no-transition')) {
            link.addEventListener('click', function (e) {
                if (isTransitioning) return;

                e.preventDefault();
                isTransitioning = true;

                // Trigger transition
                overlay.classList.add('active');

                // Navigate after glitch effect
                setTimeout(() => {
                    window.location.href = href;
                }, 500);
            });
        }
    });

    // Fade out transition on page load
    setTimeout(() => {
        overlay.classList.remove('active');
        isTransitioning = false;
    }, 100);
}

// ============================================
// FALLING ASH EFFECT
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

    // Create 120 ash particles
    const particleCount = 120;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'ash-particle';

        // Random properties
        const size = Math.random() * 2.5 + 1.5;
        const startX = Math.random() * 100;            ;
        const endX = startX + (Math.random() * 40 - 20);
        const duration = Math.random() * 15 + 18;
        const delay = Math.random() * 8;
        const opacity = Math.random() * 0.4 + 0.5;

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

        // Create unique animation
        const animationName = `ash-fall-${i}`;

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

        // Inject keyframes
        const styleSheet = document.createElement('style');
        styleSheet.textContent = keyframeRule;
        document.head.appendChild(styleSheet);

        // Apply animation
        particle.style.animation = `${animationName} ${duration}s linear ${delay}s infinite`;

        container.appendChild(particle);
    }

    console.log(`✅ Created ${particleCount} ash particles!`);
}

// ============================================
// GLITCH EFFECT FOR HERO TEXT
// ============================================
function initGlitchEffect() {
    const glitchText = document.querySelector('.glitch');
    if (!glitchText) return;

    const originalText = glitchText.textContent;

    setInterval(() => {
        if (Math.random() > 0.95) {
            glitchText.textContent = originalText
                .split('')
                .map(char => Math.random() > 0.9 ?
                    String.fromCharCode(33 + Math.floor(Math.random() * 94)) : char)
                .join('');

            setTimeout(() => {
                glitchText.textContent = originalText;
            }, 50);
        }
    }, 100);
}

// ============================================
// CONTACT FORM HANDLING - WITH EMAIL API
// ============================================
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const button = this.querySelector('.submit-btn');
        const buttonText = button.querySelector('span');
        const originalText = buttonText.textContent;

        // Get form data
        const formData = {
            name: this.querySelector('input[name="name"]').value,
            email: this.querySelector('input[name="email"]').value,
            subject: this.querySelector('select[name="subject"]').value,
            message: this.querySelector('textarea[name="message"]').value
        };

        // Validate all fields are filled
        if (!formData.name || !formData.email || !formData.message) {
            buttonText.textContent = 'PLEASE FILL ALL FIELDS';
            button.style.backgroundColor = 'var(--accent-red)';
            setTimeout(() => {
                buttonText.textContent = originalText;
                button.style.backgroundColor = 'var(--primary-white)';
            }, 2000);
            return;
        }

        // Show transmitting state
        buttonText.textContent = 'TRANSMITTING...';
        button.style.opacity = '0.6';
        button.disabled = true;

        try {
            // Call your Vercel serverless function
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Success!
                buttonText.textContent = 'MESSAGE SENT!';
                button.style.backgroundColor = '';
                button.style.color = '';

                setTimeout(() => {
                    buttonText.textContent = originalText;
                    button.style.opacity = '1';
                    button.style.backgroundColor = '';
                    button.style.color = '';
                    button.disabled = false;
                    this.reset();
                }, 2000);
            } else {
                throw new Error(result.error || 'Failed to send');
            }

        } catch (error) {
            // Error handling
            console.error('Email send error:', error);
            buttonText.textContent = 'FAILED - TRY AGAIN';
            button.style.backgroundColor = 'var(--accent-red)';
            button.style.color = 'white';

            setTimeout(() => {
                buttonText.textContent = originalText;
                button.style.opacity = '1';
                button.style.backgroundColor = 'var(--primary-white)';
                button.style.color = 'var(--bg-black)';
                button.disabled = false;
            }, 3000);
        }
    });
}

// ============================================
// FADE-IN ANIMATION ON SCROLL
// ============================================
function initScrollAnimations() {
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

    // Apply to all major sections except hero
    document.querySelectorAll('section:not(.hero)').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        fadeObserver.observe(section);
    });
}

// ============================================
// PARALLAX EFFECT FOR HERO
// ============================================
function initParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero-content');
        if (hero && scrolled < window.innerHeight) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
            hero.style.opacity = 1 - (scrolled / window.innerHeight);
        }
    });
}

// ============================================
// SMOOTH SCROLLING FOR ANCHOR LINKS
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ============================================
// TRILOGY CARD INTERACTIONS
// ============================================
function initTrilogyCards() {
    const cards = document.querySelectorAll('.trilogy-card, .preview-card');

    cards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-15px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// ============================================
// EASTER EGG: KONAMI CODE
// ============================================
function initKonamiCode() {
    let konamiCode = [];
    const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

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

            console.log('🌈 KONAMI CODE ACTIVATED! 🌈');

            setTimeout(() => {
                document.body.style.animation = '';
            }, 5000);
        }
    });
}

// ============================================
// CONSOLE MESSAGES
// ============================================
function initConsoleMessages() {
    console.log('%c⚠️ SYSTEM ACCESS DETECTED ⚠️',
        'color: #ff0033; font-size: 20px; font-weight: bold; text-shadow: 0 0 10px #ff0033;');
    console.log('%cWelcome to The Measure of Souls Trilogy.',
        'color: #ffffff; font-size: 14px;');
    console.log('%cIf you\'re seeing this, you might be one of us.',
        'color: #cccccc; font-size: 12px;');
    console.log('%cBuilt with: HTML, CSS, JavaScript',
        'color: #ff0033; font-size: 12px;');
}

// ============================================
// AMBIENT MUSIC SYSTEM (GLOBAL, PERSISTENT)
// ============================================

let ambientAudio = null;
const MUSIC_STORAGE_KEY = 'ambientMusicEnabled';

function initAmbientMusic() {
    // Create audio element once
    ambientAudio = new Audio('/audio/sci-fi-moodtimeflow.mp3');
    ambientAudio.loop = true;
    ambientAudio.volume = 0.22; // ambient-friendly level
    ambientAudio.preload = 'auto';

    // Restore saved preference
    const musicEnabled = localStorage.getItem(MUSIC_STORAGE_KEY) === 'true';

    if (musicEnabled) {
        // Must wait for user interaction to start
        const resumeOnInteraction = () => {
            ambientAudio.play().catch(() => { });
            document.removeEventListener('click', resumeOnInteraction);
            document.removeEventListener('keydown', resumeOnInteraction);
        };

        document.addEventListener('click', resumeOnInteraction);
        document.addEventListener('keydown', resumeOnInteraction);
    }

    createMusicToggle(musicEnabled);

    // Pause when tab is hidden, resume when visible
    document.addEventListener('visibilitychange', () => {
        if (!ambientAudio) return;

        if (document.hidden) {
            ambientAudio.pause();
        } else if (localStorage.getItem(MUSIC_STORAGE_KEY) === 'true') {
            ambientAudio.play().catch(() => { });
        }
    });
}

function createMusicToggle(isEnabled) {
    const footerToggle = document.createElement('div');
    footerToggle.className = 'music-toggle';
    footerToggle.innerHTML = `
        <button class="music-toggle-btn">
            🎧 Ambient Music: <strong>${isEnabled ? 'ON' : 'OFF'}</strong>
        </button>
        <div class="music-credit">
            “Sci-Fi Moodtimeflow” — Ribhav Agrawal
        </div>
    `;

    document.body.appendChild(footerToggle);

    const button = footerToggle.querySelector('.music-toggle-btn');

    button.addEventListener('click', () => {
        const currentlyEnabled = localStorage.getItem(MUSIC_STORAGE_KEY) === 'true';

        if (currentlyEnabled) {
            ambientAudio.pause();
            localStorage.setItem(MUSIC_STORAGE_KEY, 'false');
            button.innerHTML = '🎧 Ambient Music: <strong>OFF</strong>';
        } else {
            ambientAudio.play().catch(() => { });
            localStorage.setItem(MUSIC_STORAGE_KEY, 'true');
            button.innerHTML = '🎧 Ambient Music: <strong>ON</strong>';
        }
    });
}


// ============================================
// INITIALIZE ASH IMMEDIATELY (NO WAIT)
// ============================================
// Fire ash ASAP - don't wait for anything
initializeFallingAsh();

// ============================================
// INITIALIZE EVERYTHING ELSE ON DOM READY
// ============================================
function initializeAll() {
    console.log('🚀 Initializing The Measure of Souls website...');

    initPageTransition();
    //initHamburgerMenu(); commented out for now
    //initializeFallingAsh(); used earlier
    initGlitchEffect();
    initContactForm();
    initScrollAnimations();
    initParallax();
    initSmoothScroll();
    initTrilogyCards();
    initKonamiCode();
    initConsoleMessages();
    initAmbientMusic();


    console.log('✅ All systems online!');
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAll);
} else {
    initializeAll();
}

// Handle page visibility for animations
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Reinitialize ash if page becomes visible again
        const ashCount = document.querySelectorAll('.ash-particle').length;
        if (ashCount < 50) {
            console.log('Reinitializing ash particles...');
            initializeFallingAsh();
        }
    }
});