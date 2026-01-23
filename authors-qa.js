// ============================================
// AUTHOR Q&A FORM HANDLER
// ============================================

function initAuthorQA() {
    const form = document.getElementById('qaForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');

    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const userName = document.getElementById('userName').value || 'Anonymous';
        const question = document.getElementById('userQuestion').value;

        if (!question.trim()) return;

        // Update button state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>[ TRANSMITTING... ]</span>';

      
        setTimeout(() => {
            // Show success message
            successMessage.classList.add('show');
            
            // Reset form
            form.reset();
            
            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>[ TRANSMIT QUESTION ]</span>';

            // Hide success message after 5 seconds
            setTimeout(() => {
                successMessage.classList.remove('show');
            }, 5000);

            // Log for now (you can hook up email/backend later)
            console.log('Question submitted:', { userName, question, timestamp: new Date().toISOString() });

            // TODO: Send to email or backend
            // Example with email service (you'd need to set this up):
            /*
            fetch('EMAIL_ENDPOINT', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userName, question })
            });
            */
        }, 1500);
    });

    // Optional: Add typing sound effect
    const textInputs = document.querySelectorAll('#qaForm input, #qaForm textarea');
    textInputs.forEach(input => {
        input.addEventListener('keypress', () => {
            playTypingSound();
        });
    });
}

function playTypingSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 600;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.02, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.05);
    } catch (e) {
        // Silently fail if audio context not supported
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthorQA);
} else {
    initAuthorQA();
}