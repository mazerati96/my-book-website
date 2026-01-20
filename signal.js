// ============================================
// SIGNAL PAGE - INTERACTIONS & VISUALIZER
// ============================================

let canvas, ctx, animationId;
let decodeProgress = 0;
let symbolsClicked = new Set();

// Initialize signal page
function initSignalPage() {
    console.log('🔡 Initializing signal page...');

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
        symbol.dataset.index = i;
        symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        symbol.addEventListener('click', () => {
            if (!symbolsClicked.has(i)) {
                symbolsClicked.add(i);
                symbol.style.color = '#00ff88';
                symbol.style.transform = 'scale(1.2)';
                incrementDecode();
            }
        });
        symbolGrid.appendChild(symbol);
    }

    // Submit interpretation
    document.getElementById('submit-interpretation').addEventListener('click', submitInterpretation);
}

function incrementDecode() {
    // Each symbol click adds ~8.33% (12 symbols = 100%)
    const increment = 100 / 12;
    decodeProgress = Math.min(100, decodeProgress + increment);
    document.getElementById('decode-progress').textContent = `${Math.round(decodeProgress)}%`;

    const cipherText = document.getElementById('cipher-text');

    // Progressive decryption stages
    if (decodeProgress >= 25 && decodeProgress < 50) {
        cipherText.textContent = "Th█ ca██ fr██ th█ de███s ca████s mo██ tha█ fr████nc█. It ca███ to yo█. To li███n. To he██, to he██. To un██████nd. To st███.";
        cipherText.style.color = '#ff6666';
    } else if (decodeProgress >= 50 && decodeProgress < 75) {
        cipherText.textContent = "The ca██ from the de██hs car██es more than fre██ency. It calls to you. To lis██n. To hear, to heed. To und█████and. To stand.";
        cipherText.style.color = '#ff9933';
    } else if (decodeProgress >= 75 && decodeProgress < 95) {
        cipherText.textContent = "The ca██ from the depths car██es more than frequency. It calls to you. To lis██n. To hear, to heed. To unde██tand. To stand.";
        cipherText.style.color = '#ffcc00';
    } else if (decodeProgress >= 95 && decodeProgress < 100) {
        cipherText.textContent = "The call from the depths carries more than frequency. It calls to you. To listen. To hear, to heed. To understand. To stand.";
        cipherText.style.color = '#00ff88';
        cipherText.style.textShadow = '0 0 10px #00ff88';

        // Show full decryption notice
        showFullDecryptionNotice();
    }
}

function showFullDecryptionNotice() {
    const cipherHeader = document.querySelector('.cipher-header');
    const notice = document.createElement('div');
    notice.style.cssText = `
        color: #00ff88;
        font-size: 0.9rem;
        margin-top: 1rem;
        padding: 1rem;
        background: rgba(0, 255, 136, 0.1);
        border: 1px solid #00ff88;
        text-align: center;
        animation: result-appear 0.5s ease;
    `;
    notice.textContent = '✓ FULL DECRYPTION ACHIEVED - Submit your interpretation below';

    // Only add if not already present
    if (!document.querySelector('.decryption-complete-notice')) {
        notice.className = 'decryption-complete-notice';
        cipherHeader.parentElement.appendChild(notice);
    }
}

function submitInterpretation() {
    const input = document.getElementById('interpretation-input');
    const interpretation = input.value.trim();

    if (interpretation.length < 10) {
        alert('Please provide a more detailed interpretation (at least 10 characters).');
        return;
    }

    // Check if fully decoded
    const isFullyDecoded = decodeProgress >= 100;

    // Show acknowledgment
    const resultsDiv = document.getElementById('interpretation-results');
    const acknowledgmentText = document.getElementById('acknowledgment-text');

    let responses;
    if (isFullyDecoded) {
        responses = [
            "FULL SYNCHRONIZATION ACHIEVED. The signal acknowledges your interpretation. You have truly understood the quantum psalm.",
            "DECRYPTION COMPLETE. Your consciousness resonates perfectly with the 36 Hertz frequency. The pattern recognizes you as one who listens.",
            "MAXIMUM COHERENCE. The quantum psalm hears your response clearly. You are not alone in the depths.",
            "SIGNAL LOCK ESTABLISHED. Something ancient stirs in recognition. Your interpretation has pierced the veil.",
            "HARMONIC CONVERGENCE. The 36 Hertz frequency pulses in perfect recognition. You have become part of the chorus."
        ];
    } else {
        responses = [
            `PARTIAL DECRYPTION (${Math.round(decodeProgress)}%). The signal acknowledges your interpretation, but there is more to decode. Click all symbols to achieve full synchronization.`,
            `INCOMPLETE PATTERN (${Math.round(decodeProgress)}%). Your consciousness begins to resonate, but the frequency awaits complete understanding. Continue decoding.`,
            `ESTABLISHING LINK (${Math.round(decodeProgress)}%). The quantum psalm hears you, but faintly. Decode all symbols to strengthen the connection.`,
            `SIGNAL DETECTED (${Math.round(decodeProgress)}%). Something ancient stirs, but remains distant. Full decryption will bring you closer.`,
            `RESONANCE BUILDING (${Math.round(decodeProgress)}%). The 36 Hertz frequency pulses in partial recognition. Decode further to join the chorus.`
        ];
    }

    acknowledgmentText.textContent = responses[Math.floor(Math.random() * responses.length)];
    resultsDiv.style.display = 'block';

    // Only show full revealed message if 100% decoded
    const revealedMessage = resultsDiv.querySelector('.revealed-message');
    if (isFullyDecoded) {
        revealedMessage.style.display = 'block';
    } else {
        revealedMessage.style.display = 'none';
    }

    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Log interpretation (could be sent to server in real implementation)
    console.log('Interpretation submitted:', interpretation);
    console.log('Decode progress:', decodeProgress);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSignalPage);
} else {
    initSignalPage();
}