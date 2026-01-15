// ============================================
// CHARACTERS PAGE - DECRYPT INTERACTIONS
// ============================================

function initCharactersPage() {
    console.log('🔓 Initializing character dossiers...');

    // Setup decrypt buttons
    setupDecryptButtons();

    // Setup hover decrypt for redacted text
    setupRedactedHover();

    // Add glitch effect to android card
    addAndroidGlitchEffect();

    console.log('✅ Character dossiers ready!');
}

// Setup decrypt buttons
function setupDecryptButtons() {
    const decryptButtons = document.querySelectorAll('.decrypt-btn:not(.disabled)');

    decryptButtons.forEach(button => {
        button.addEventListener('click', function () {
            const card = this.closest('.dossier-card');
            decryptCard(card, button);
        });
    });
}

// Decrypt card animation
function decryptCard(card, button) {
    const redactedElements = card.querySelectorAll('.redacted');
    const bio = card.querySelector('.character-bio');

    // Change button state
    button.textContent = 'DECRYPTING...';
    button.style.opacity = '0.6';
    button.disabled = true;

    // Glitch effect on card
    card.style.animation = 'glitch-card 0.5s ease';

    // Decrypt redacted text one by one
    redactedElements.forEach((element, index) => {
        setTimeout(() => {
            element.style.backgroundColor = 'transparent';
            element.style.color = card.classList.contains('android-card') ? '#00ff88' : 'var(--accent-red)';

            // Remove the ::before pseudo-element effect
            element.classList.add('decrypted');

            // Glitch effect on reveal
            const originalText = element.textContent;
            let glitchCount = 0;
            const glitchInterval = setInterval(() => {
                if (glitchCount < 3) {
                    element.textContent = generateGlitchText(originalText);
                    glitchCount++;
                } else {
                    element.textContent = originalText;
                    clearInterval(glitchInterval);
                }
            }, 50);
        }, index * 200);
    });

    // Final button state
    setTimeout(() => {
        button.textContent = '✓ DECRYPTED';
        button.style.opacity = '1';
        button.style.backgroundColor = card.classList.contains('android-card') ? '#00ff88' : 'var(--accent-red)';
        button.style.color = card.classList.contains('android-card') ? 'var(--bg-black)' : 'white';

        // Add "fully decrypted" class
        card.classList.add('fully-decrypted');
    }, redactedElements.length * 200 + 500);
}

// Setup hover decrypt for redacted text
function setupRedactedHover() {
    const redactedElements = document.querySelectorAll('.redacted.decrypt');

    redactedElements.forEach(element => {
        element.addEventListener('mouseenter', function () {
            if (!this.classList.contains('decrypted')) {
                // Sound effect (optional - using Web Audio API)
                playDecryptSound();
            }
        });
    });
}

// Add glitch effect to android card
function addAndroidGlitchEffect() {
    const androidCard = document.querySelector('.android-card');
    if (!androidCard) return;

    setInterval(() => {
        if (Math.random() > 0.95) {
            androidCard.style.animation = 'none';
            setTimeout(() => {
                androidCard.style.animation = 'glitch-card 0.2s ease';
            }, 10);
        }
    }, 3000);
}

// Generate glitch text
function generateGlitchText(text) {
    return text.split('').map(char => {
        if (Math.random() > 0.7) {
            return String.fromCharCode(33 + Math.floor(Math.random() * 94));
        }
        return char;
    }).join('');
}

// Play decrypt sound (simple beep using Web Audio API)
function playDecryptSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// CSS animation for card glitch (add to characters.css if not present)
const glitchStyle = document.createElement('style');
glitchStyle.textContent = `
    @keyframes glitch-card {
        0%, 100% {
            transform: translateY(-5px);
        }
        25% {
            transform: translateY(-5px) translateX(-2px);
        }
        50% {
            transform: translateY(-5px) translateX(2px);
        }
        75% {
            transform: translateY(-5px) translateX(-2px);
        }
    }
    
    .redacted.decrypted::before {
        content: '';
        opacity: 0;
    }
`;
document.head.appendChild(glitchStyle);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCharactersPage);
} else {
    initCharactersPage();
}