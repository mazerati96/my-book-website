// Smooth scrolling for navigation links
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

// Contact form handling with enhanced feedback
// Contact form handling with Vercel serverless function
document.getElementById('contact-form').addEventListener('submit', async function (e) {
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
        // Call your Vercel serverless function
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            // Success!
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
        // Error handling
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

// Matrix rain effect in background (optional - lightweight version)
function createMatrixRain() {
    const matrixBg = document.querySelector('.matrix-bg');
    const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

    for (let i = 0; i < 15; i++) {
        const span = document.createElement('span');
        span.textContent = characters[Math.floor(Math.random() * characters.length)];
        span.style.position = 'absolute';
        span.style.left = Math.random() * 100 + '%';
        span.style.top = -20 + 'px';
        span.style.color = 'var(--primary-white)';
        span.style.fontSize = '14px';
        span.style.opacity = Math.random() * 0.5 + 0.2;
        span.style.animation = `fall ${Math.random() * 10 + 10}s linear infinite`;
        span.style.animationDelay = Math.random() * 5 + 's';
        matrixBg.appendChild(span);
    }
}

// CSS animation for falling characters
const style = document.createElement('style');
style.textContent = `
    @keyframes fall {
        to {
            transform: translateY(100vh);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
createMatrixRain();

// Read button interaction
document.querySelectorAll('.read-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const chapterCard = this.closest('.chapter-card');
        const chapterTitle = chapterCard.querySelector('h3').textContent;

        // Visual feedback
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

// Easter egg: Konami code (up, up, down, down, left, right, left, right, B, A)
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

// Add hover sound effect simulation (visual feedback)
document.querySelectorAll('.primary-btn, .secondary-btn, .submit-btn, .read-btn, .nav-link').forEach(element => {
    element.addEventListener('mouseenter', function () {
        this.style.transition = 'all 0.1s';
    });
});

// Console message for developers
console.log('%c⚠ SYSTEM ACCESS DETECTED ⚠', 'color: #00d4ff; font-size: 20px; font-weight: bold; text-shadow: 0 0 10px #00d4ff;');
console.log('%cWelcome to the Book Website. If you\'re seeing this, you might be one of us.', 'color: #0099cc; font-size: 14px;');
console.log('%cBuilt with: HTML, CSS, JavaScript', 'color: #00d4ff; font-size: 12px;');