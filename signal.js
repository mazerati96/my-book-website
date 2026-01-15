// ============================================
// SIGNAL PAGE - INTERACTIONS & VISUALIZER
// ============================================

let canvas, ctx, animationId;
let decodeProgress = 0;

// Initialize signal page
function initSignalPage() {
    console.log('📡 Initializing signal page...');

    setupAudioControls();
    setupVisualizer();
    setupDecoder();

    console.log('✅ Signal page ready!');
}

// Setup audio controls
function setupAudioControls() {
    const toggleBtn = document.getElementById('toggle-audio');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeValue = document.getElementById('volume-value');

    // Toggle audio
    toggleBtn.addEventListener('click', () => {
        const isPlaying = window.frequencyGenerator.toggle();

        if (isPlaying) {
            toggleBtn.classList.add('playing');
            document.getElementById('audio-icon').textContent = '🔊';
            document.getElementById('audio-text').textContent = 'STOP FREQUENCY';
            document.getElementById('signal-status').textContent = 'BROADCASTING';
            document.getElementById('signal-status').style.color = '#00ff88';
        } else {
            toggleBtn.classList.remove('playing');
            document.getElementById('audio-icon').textContent = '🔇';
            document.getElementById('audio-text').textContent = 'PLAY FREQUENCY';
            document.getElementById('signal-status').textContent = 'DORMANT';
            document.getElementById('signal-status').style.color = 'var(--dark-white)';
        }
    });

    // Volume control
    volumeSlider.addEventListener('input', (e) => {
        const volume = e.target.value / 100;
        window.frequencyGenerator.setVolume(volume);
        volumeValue.textContent = `${e.target.value}%`;
    });
}

// Setup signal visualizer
function setupVisualizer() {
    canvas = document.getElementById('signal-canvas');
    ctx = canvas.getContext('2d');

    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Start animation
    animateWaveform();
}

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}

function animateWaveform() {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const state = window.frequencyGenerator.getState();

    if (state.isPlaying) {
        drawActiveWaveform();
    } else {
        drawDormantWaveform();
    }

    animationId = requestAnimationFrame(animateWaveform);
}

function drawActiveWaveform() {
    const centerY = canvas.height / 2;
    const amplitude = 80 * window.frequencyGenerator.volume;
    const frequency = 36;
    const speed = 0.02;
    const time = Date.now() * speed;

    // Draw waveform
    ctx.strokeStyle = '#ff0033';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff0033';
    ctx.beginPath();

    for (let x = 0; x < canvas.width; x++) {
        const y = centerY + Math.sin((x * 0.02) + time) * amplitude;
        if (x === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.stroke();

    // Draw secondary harmonic
    ctx.strokeStyle = 'rgba(255, 0, 51, 0.3)';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 5;
    ctx.beginPath();

    for (let x = 0; x < canvas.width; x++) {
        const y = centerY + Math.sin((x * 0.04) + time * 2) * (amplitude * 0.5);
        if (x === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.stroke();

    // Update amplitude display
    const currentAmplitude = (Math.abs(Math.sin(time)) * 100).toFixed(1);
    document.getElementById('amplitude').textContent = `${currentAmplitude}%`;
}

function drawDormantWaveform() {
    const centerY = canvas.height / 2;

    // Draw flat line with slight noise
    ctx.strokeStyle = 'rgba(255, 0, 51, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let x = 0; x < canvas.width; x++) {
        const noise = (Math.random() - 0.5) * 2;
        const y = centerY + noise;
        if (x === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.stroke();

    document.getElementById('amplitude').textContent = '--';
}

// Setup decoder
function setupDecoder() {
    // Generate mysterious symbols
    const symbolGrid = document.getElementById('symbol-grid');
    const symbols = ['◊', '◈', '◇', '◆', '⬡', '⬢', '⬣', '⬤', '⬥', '⬦', '▲', '▼', '◀', '▶', '⟐', '⟡'];

    for (let i = 0; i < 12; i++) {
        const symbol = document.createElement('div');
        symbol.className = 'symbol-item';
        symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        symbol.addEventListener('click', () => {
            symbol.style.color = '#00ff88';
            incrementDecode();
        });
        symbolGrid.appendChild(symbol);
    }

    // Submit interpretation
    document.getElementById('submit-interpretation').addEventListener('click', submitInterpretation);
}

function incrementDecode() {
    decodeProgress = Math.min(100, decodeProgress + 8);
    document.getElementById('decode-progress').textContent = `${decodeProgress}%`;

    // Partially reveal cipher text
    if (decodeProgress >= 50) {
        const cipherText = document.getElementById('cipher-text');
        const revealed = "SOME PATTERNS EMERGE FROM THE NOISE... THE FREQUENCY CARRIES MEANING... CONSCIOUSNESS RECOGNIZES CONSCIOUSNESS...";
        cipherText.textContent = revealed;
        cipherText.style.color = '#00ff88';
    }
}

function submitInterpretation() {
    const input = document.getElementById('interpretation-input');
    const interpretation = input.value.trim();

    if (interpretation.length < 10) {
        alert('Please provide a more detailed interpretation (at least 10 characters).');
        return;
    }

    // Show acknowledgment
    const resultsDiv = document.getElementById('interpretation-results');
    const acknowledgmentText = document.getElementById('acknowledgment-text');

    const responses = [
        "The signal acknowledges your interpretation. You have begun to understand.",
        "Your consciousness resonates with the frequency. The pattern recognizes you.",
        "The quantum psalm hears your response. You are not alone in listening.",
        "Something ancient stirs. Your interpretation has been received.",
        "The 36 Hz frequency pulses in recognition. You have added your voice to the chorus."
    ];

    acknowledgmentText.textContent = responses[Math.floor(Math.random() * responses.length)];
    resultsDiv.style.display = 'block';

    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth' });

    // Log interpretation (could be sent to server in real implementation)
    console.log('Interpretation submitted:', interpretation);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSignalPage);
} else {
    initSignalPage();
}