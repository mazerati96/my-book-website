// ============================================
// ENHANCED PAGE TRANSITION EFFECT
// ============================================
if (localStorage.getItem('ambientMusicEnabled') === null) {
    localStorage.setItem('ambientMusicEnabled', 'true');
}



let isTransitioning = false;
let audioUnlocked = false;

// ============================================
// SPLASH SCREEN WITH AUDIO UNLOCK
// ============================================
function initSplashScreen() {
    const splash = document.getElementById('splashScreen');
    const enterBtn = document.getElementById('enterBtn');

    if (!splash || !enterBtn) return;

    // Only show splash on index.html
    if (!location.pathname.endsWith('index.html') && location.pathname !== '/') {
        splash.style.display = 'none';
        return;
    }

    // Check if user has already entered
    if (sessionStorage.getItem('hasEntered')) {
        splash.style.display = 'none';
        return;
    }

    enterBtn.addEventListener('click', () => {
        // Unlock audio immediately
        const enabled = localStorage.getItem('ambientMusicEnabled') === 'true';
        if (enabled) {
            sendAudioCommand('PLAY');
            audioUnlocked = true;
        }

        // Mark as entered
        sessionStorage.setItem('hasEntered', 'true');

        // Fade out splash screen
        splash.classList.add('hidden');

        // Remove from DOM after transition
        setTimeout(() => {
            splash.style.display = 'none';
        }, 1000);

        console.log('🎵 Audio unlocked via splash screen');
    });
}

function unlockAudioOnce() {
    if (audioUnlocked) return;

    const enabled = localStorage.getItem('ambientMusicEnabled') === 'true';
    if (!enabled) return;

    sendAudioCommand('PLAY');
    audioUnlocked = true;

    removeAudioUnlockListeners();
}

function removeAudioUnlockListeners() {
    document.removeEventListener('click', unlockAudioOnce);
    document.removeEventListener('keydown', unlockAudioOnce);
    document.removeEventListener('wheel', unlockAudioOnce);
    document.removeEventListener('touchstart', unlockAudioOnce);
}

document.addEventListener('click', unlockAudioOnce, { passive: true });
document.addEventListener('keydown', unlockAudioOnce, { passive: true });
document.addEventListener('wheel', unlockAudioOnce, { passive: true });
document.addEventListener('touchstart', unlockAudioOnce, { passive: true });


function attemptAudioResume() {
    const enabled = localStorage.getItem('ambientMusicEnabled') === 'true';
    if (enabled && !audioUnlocked) {
        // Try to resume immediately (will work if user interacted on previous page)
        sendAudioCommand('PLAY');
    }
}
function showMusicNoticeIfIndex() {
    if (!location.pathname.endsWith('index.html') && location.pathname !== '/') return;
    if (sessionStorage.getItem('musicNoticeShown')) return;

    const notice = document.createElement('div');
    notice.style.cssText = `
        position: fixed;
        bottom: 120px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.85);
        border: 1px solid white;
        padding: 12px 18px;
        font-size: 0.7rem;
        letter-spacing: 0.08em;
        opacity: 0;
        transition: opacity 1s ease;
        z-index: 9999;
    `;

    notice.textContent = '🎧 Music option — toggle on/off at the bottom of the page';
    document.body.appendChild(notice);

    requestAnimationFrame(() => notice.style.opacity = '1');

    setTimeout(() => notice.style.opacity = '0', 4000);
    setTimeout(() => notice.remove(), 5500);

    sessionStorage.setItem('musicNoticeShown', 'true');
}

function createTransitionElements() {
    const overlay = document.querySelector('.page-transition');
    if (!overlay) return;

    overlay.innerHTML = `
        <div class="transition-text">INITIALIZING SYSTEM...</div>
        <div class="transition-loading">
            <div class="loading-bar"></div>
            <div class="loading-bar"></div>
            <div class="loading-bar"></div>
        </div>
    `;
}

function initPageTransition() {
    createTransitionElements();
    const overlay = document.querySelector('.page-transition');

    // Use event delegation on the document to catch all link clicks
    document.addEventListener('click', function (e) {
        // Find the closest <a> tag
        const link = e.target.closest('a[href]');

        if (!link) return;

        const href = link.getAttribute('href');

        // Check if it's an HTML page link and doesn't have no-transition attribute
        if (href && href.endsWith('.html') && !link.hasAttribute('data-no-transition')) {
            if (isTransitioning) return;

            e.preventDefault();
            isTransitioning = true;

            overlay.classList.add('active');
            fadeMusicDown();

            setTimeout(() => {
                window.location.href = href;
            }, 800);
        }
    });

    setTimeout(() => {
        overlay.classList.remove('active');
        isTransitioning = false;
    }, 100);
}

// ============================================
// ENHANCED PARALLAX SYSTEM
// ============================================
function initEnhancedParallax() {
    // Create parallax layers
    const layer1 = document.createElement('div');
    layer1.className = 'parallax-layer parallax-layer-1';

    const layer2 = document.createElement('div');
    layer2.className = 'parallax-layer parallax-layer-2';

    document.body.appendChild(layer1);
    document.body.appendChild(layer2);

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;

        // Hero parallax
        const hero = document.querySelector('.hero-content');
        if (hero && scrolled < window.innerHeight) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
            hero.style.opacity = 1 - (scrolled / window.innerHeight);
        }

        // Background layers parallax
        layer1.style.transform = `translateY(${scrolled * 0.2}px)`;
        layer2.style.transform = `translateY(${scrolled * 0.3}px)`;

        // Section parallax
        document.querySelectorAll('section').forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const offset = (window.innerHeight - rect.top) * 0.1;
                section.style.transform = `translateY(${offset}px)`;
            }
        });
    });
}

// ============================================
// HAMBURGER MENU WITH PARTICLE EFFECTS
// ============================================
function initHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('.sidebar');
    if (!hamburger || !sidebar) return;

    // Create particle container
    const particleContainer = document.createElement('div');
    particleContainer.className = 'hamburger-particles';
    hamburger.appendChild(particleContainer);

    function createParticles(isExploding) {
        particleContainer.innerHTML = '';

        const particleCount = 12;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'hamburger-particle';

            const angle = (Math.PI * 2 * i) / particleCount;
            const distance = 30;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;

            particle.style.cssText = `
                --tx: ${tx}px;
                --ty: ${ty}px;
                left: 50%;
                top: 50%;
                animation: ${isExploding ? 'particle-explode' : 'particle-implode'} 0.4s ease-out forwards;
                animation-delay: ${i * 0.02}s;
            `;

            particleContainer.appendChild(particle);
        }
    }

    hamburger.addEventListener('click', () => {
        const isActive = hamburger.classList.contains('active');

        if (isActive) {
            hamburger.classList.remove('active');
            sidebar.classList.remove('active');
            createParticles(false);
        } else {
            hamburger.classList.add('active');
            sidebar.classList.add('active');
            createParticles(true);
        }
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !hamburger.contains(e.target) && sidebar.classList.contains('active')) {
            hamburger.classList.remove('active');
            sidebar.classList.remove('active');
            createParticles(false);
        }
    });
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

    const existingParticles = container.querySelectorAll('.ash-particle');
    existingParticles.forEach(p => p.remove());

    const particleCount = 120;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'ash-particle';

        const size = Math.random() * 2.5 + 1.5;
        const startX = Math.random() * 100;
        const endX = startX + (Math.random() * 40 - 20);
        const duration = Math.random() * 15 + 18;
        const delay = Math.random() * 8;
        const opacity = Math.random() * 0.4 + 0.5;

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

        const styleSheet = document.createElement('style');
        styleSheet.textContent = keyframeRule;
        document.head.appendChild(styleSheet);

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
// CONTACT FORM HANDLING
// ============================================
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const button = this.querySelector('.submit-btn');
        const buttonText = button.querySelector('span');
        const originalText = buttonText.textContent;

        const formData = {
            name: this.querySelector('input[name="name"]').value,
            email: this.querySelector('input[name="email"]').value,
            subject: this.querySelector('select[name="subject"]').value,
            message: this.querySelector('textarea[name="message"]').value
        };

        if (!formData.name || !formData.email || !formData.message) {
            buttonText.textContent = 'PLEASE FILL ALL FIELDS';
            button.style.backgroundColor = 'var(--accent-red)';
            setTimeout(() => {
                buttonText.textContent = originalText;
                button.style.backgroundColor = 'var(--primary-white)';
            }, 2000);
            return;
        }

        buttonText.textContent = 'TRANSMITTING...';
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

            if (response.ok && result.success) {
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

    document.querySelectorAll('section:not(.hero)').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        fadeObserver.observe(section);
    });
}

// ============================================
// SMOOTH SCROLLING
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
// KONAMI CODE EASTER EGG
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
// PERSISTENT AUDIO
// ============================================
let audioIframe = null;

function initPersistentAudio() {
    if (document.getElementById('audio-host')) return;

    audioIframe = document.createElement('iframe');
    audioIframe.id = 'audio-host';
    audioIframe.src = '/audio-player.html';
    audioIframe.style.display = 'none';

    document.body.appendChild(audioIframe);
    createMusicToggle();
}

function fadeMusicDown() {
    sendAudioCommand('FADE_DOWN');
}

function fadeMusicUp() {
    sendAudioCommand('FADE_UP');
}

function sendAudioCommand(type) {
    const iframe = document.getElementById('audio-host');
    if (!iframe || !iframe.contentWindow) return;

    iframe.contentWindow.postMessage({ type }, '*');
}

function createMusicToggle() {
    const enabled = localStorage.getItem('ambientMusicEnabled') === 'true';

    const toggle = document.createElement('div');
    toggle.className = 'music-toggle signal';

    toggle.innerHTML = `
        <button class="music-toggle-btn">
            🎧 Ambient Music: <strong>${enabled ? 'ON' : 'OFF'}</strong>
        </button>
        <div class="music-credit">
            "Sci-Fi Moodtimeflow" — Ribhav Agrawal
        </div>
    `;

    document.querySelector('footer')?.appendChild(toggle);

    const btn = toggle.querySelector('button');

    btn.addEventListener('click', () => {
        const isOn = localStorage.getItem('ambientMusicEnabled') === 'true';

        if (isOn) {
            sendAudioCommand('PAUSE');
            btn.innerHTML = '🎧 Ambient Music: <strong>OFF</strong>';
        } else {
            sendAudioCommand('PLAY');
            btn.innerHTML = '🎧 Ambient Music: <strong>ON</strong>';
        }
    });
}

function createFrequencyToggle() {
    if (!window.frequencyGenerator) return;

    const toggle = document.createElement('div');
    toggle.className = 'music-toggle';
    toggle.innerHTML = `
        <button class="music-toggle-btn">
            🧬 36 Hz Signal: <strong>OFF</strong>
        </button>
        <div class="music-credit">
            Subsonic frequency generator
        </div>
    `;

    document.body.appendChild(toggle);

    const btn = toggle.querySelector('button');

    btn.addEventListener('click', () => {
        const isPlaying = window.frequencyGenerator.toggle();
        btn.innerHTML = `🧬 36 Hz Signal: <strong>${isPlaying ? 'ON' : 'OFF'}</strong>`;
    });
}

// ============================================
// INITIALIZE ASH IMMEDIATELY
// ============================================
initializeFallingAsh();

// ============================================
// INITIALIZE ALL ON DOM READY
// ============================================
function initializeAll() {
    console.log('🚀 Initializing The Measure of Souls website...');
    initSplashScreen(); 
    initPageTransition();
    initHamburgerMenu();
    initGlitchEffect();
    initContactForm();
    initScrollAnimations();
    initEnhancedParallax();
    initSmoothScroll();
    initTrilogyCards();
    initKonamiCode();
    initConsoleMessages();
    initPersistentAudio();
    createFrequencyToggle();
    showMusicNoticeIfIndex();
    attemptAudioResume();
    console.log('✅ All systems online!');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAll);
} else {
    initializeAll();
}

document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        const ashCount = document.querySelectorAll('.ash-particle').length;
        if (ashCount < 50) {
            console.log('Reinitializing ash particles...');
            initializeFallingAsh();
        }
    }
});