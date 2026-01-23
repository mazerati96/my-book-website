// ============================================
// SIGNAL PAGE - INTERACTIONS & VISUALIZER + LEADERBOARD
// ============================================

let canvas, ctx, animationId;
let decodeProgress = 0;
let symbolsClicked = new Set();

// Initialize signal page
function initSignalPage() {
    console.log('📡 Initializing signal page...');

    setupAudioControls();
    setupVisualizer();
    setupDecoder();
    loadLeaderboard();

    console.log('✅ Signal page ready!');
}

// Setup audio controls
function setupAudioControls() {
    const toggleBtn = document.getElementById('toggle-audio');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeValue = document.getElementById('volume-value');

    if (!toggleBtn) return; // Guard for pages without audio controls

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
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            window.frequencyGenerator.setVolume(volume);
            volumeValue.textContent = `${e.target.value}%`;
        });
    }
}

// Setup signal visualizer
function setupVisualizer() {
    canvas = document.getElementById('signal-canvas');
    if (!canvas) return;

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
    const amplitudeEl = document.getElementById('amplitude');
    if (amplitudeEl) {
        const currentAmplitude = (Math.abs(Math.sin(time)) * 100).toFixed(1);
        amplitudeEl.textContent = `${currentAmplitude}%`;
    }
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

    const amplitudeEl = document.getElementById('amplitude');
    if (amplitudeEl) amplitudeEl.textContent = '--';
}

// Setup decoder
function setupDecoder() {
    const symbolGrid = document.getElementById('symbol-grid');
    if (!symbolGrid) return;

    // Generate mysterious symbols
    const symbols = ['◊', '◈', '◇', '◆', '⬡', '⬢', '⬣', '⬤', '⬥', '⬦', '▲', '▼', '◀', '▶', '⟡', '⟢'];

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
    const submitBtn = document.getElementById('submit-interpretation');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitInterpretation);
    }
}

function incrementDecode() {
    // Each symbol click adds ~8.33% (12 symbols = 100%)
    const increment = 100 / 12;
    decodeProgress = Math.min(100, decodeProgress + increment);

    const progressEl = document.getElementById('decode-progress');
    if (progressEl) {
        progressEl.textContent = `${Math.round(decodeProgress)}%`;
    }

    const cipherText = document.getElementById('cipher-text');
    if (!cipherText) return;

    // Progressive decryption stages
    if (decodeProgress >= 25 && decodeProgress < 50) {
        cipherText.innerHTML = "Th█ ca██ fr██ th█ de████s ca████s mo██ tha█ fr████nc█. It ca███ to yo█. To li███n. To he██, to he██. To un█████nd. To st███.";
        cipherText.style.color = '#ff6666';
    } else if (decodeProgress >= 50 && decodeProgress < 75) {
        cipherText.innerHTML = "The ca██ from the de██hs car██es more than fre██ency. It calls to you. To lis██n. To hear, to heed. To und█████and. To stand.";
        cipherText.style.color = '#ff9933';
    } else if (decodeProgress >= 75 && decodeProgress < 95) {
        cipherText.innerHTML = "The ca██ from the depths car██es more than frequency. It calls to you. To lis██n. To hear, to heed. To unde███tand. To stand.";
        cipherText.style.color = '#ffcc00';
    } else if (decodeProgress >= 95) {
        cipherText.innerHTML = "The call from the depths carries more than frequency. It calls to you. To listen. To hear, to heed. To understand. To stand.";
        cipherText.style.color = '#00ff88';
        cipherText.style.textShadow = '0 0 10px #00ff88';
        cipherText.style.wordWrap = 'break-word';
        cipherText.style.whiteSpace = 'normal';

        // Show full decryption notice
        showFullDecryptionNotice();
    }

    // Save progress to cloud
    if (window.authSystem && authSystem.isLoggedIn()) {
        authSystem.saveUserProgress('signalProgress', decodeProgress);
    }
}

function showFullDecryptionNotice() {
    const cipherHeader = document.querySelector('.cipher-header');
    if (!cipherHeader) return;

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

async function submitInterpretation() {
    const input = document.getElementById('interpretation-input');
    const interpretation = input.value.trim();

    if (interpretation.length < 10) {
        alert('Please provide a more detailed interpretation (at least 10 characters).');
        return;
    }

    // Get username
    let username = 'Anonymous';
    if (window.authSystem && authSystem.isLoggedIn()) {
        try {
            username = await authSystem.getUsername() || 'Anonymous';
        } catch (e) {
            username = 'Anonymous';
        }
    } else {
        // Prompt for name
        const promptedName = prompt('Enter your name (or leave blank for Anonymous):');
        if (promptedName && promptedName.trim()) {
            username = promptedName.trim().substring(0, 30);
        }
    }

    // Check if fully decoded
    const isFullyDecoded = decodeProgress >= 95;

    // Save to Firebase
    if (typeof firebase !== 'undefined' && firebase.database) {
        try {
            const interpretationRef = firebase.database().ref('signalInterpretations');
            await interpretationRef.push({
                username: username,
                interpretation: interpretation,
                decodeProgress: Math.round(decodeProgress),
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                isFullyDecoded: isFullyDecoded
            });
            console.log('✅ Interpretation saved to database');
        } catch (error) {
            console.error('❌ Error saving interpretation:', error);
        }
    }

    // Show acknowledgment
    const resultsDiv = document.getElementById('interpretation-results');
    const acknowledgmentText = document.getElementById('acknowledgment-text');

    if (!resultsDiv || !acknowledgmentText) return;

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

    // Show full revealed message if 100% decoded
    const revealedMessage = resultsDiv.querySelector('.revealed-message');
    if (revealedMessage) {
        if (isFullyDecoded) {
            revealedMessage.style.display = 'block';
            const decodedText = revealedMessage.querySelector('.decoded-text');
            if (decodedText) {
                decodedText.style.wordWrap = 'break-word';
                decodedText.style.whiteSpace = 'normal';
            }
        } else {
            revealedMessage.style.display = 'none';
        }
    }

    // Reload leaderboard
    await loadLeaderboard();

    // Clear input
    input.value = '';

    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    console.log('Interpretation submitted:', interpretation);
    console.log('Decode progress:', decodeProgress);
}

// LEADERBOARD FUNCTIONALITY
async function loadLeaderboard() {
    const leaderboardContainer = document.getElementById('leaderboard-container');
    if (!leaderboardContainer) {
        // Create leaderboard if it doesn't exist
        createLeaderboardSection();
    }

    if (typeof firebase === 'undefined' || !firebase.database) {
        console.log('Firebase not available for leaderboard');
        return;
    }

    try {
        const interpretationsRef = firebase.database().ref('signalInterpretations');
        const snapshot = await interpretationsRef.orderByChild('timestamp').limitToLast(10).once('value');

        const interpretations = [];
        snapshot.forEach((child) => {
            interpretations.push({ id: child.key, ...child.val() });
        });

        // Reverse to show newest first
        interpretations.reverse();

        displayLeaderboard(interpretations);
    } catch (error) {
        console.error('Error loading leaderboard:', error);
    }
}

function createLeaderboardSection() {
    const decoderSection = document.querySelector('.decoder-section');
    if (!decoderSection) return;

    const leaderboardSection = document.createElement('div');
    leaderboardSection.className = 'leaderboard-section';
    leaderboardSection.innerHTML = `
        <div class="section-header">
            <div class="header-line"></div>
            <h2>RECENT INTERPRETATIONS</h2>
            <div class="header-line"></div>
        </div>
        <div id="leaderboard-container" class="leaderboard-container">
            <div class="loading-message">Loading interpretations...</div>
        </div>
    `;

    decoderSection.parentElement.insertBefore(leaderboardSection, decoderSection.nextSibling);

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .leaderboard-section {
            padding: 4rem 2rem;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .leaderboard-container {
            background: rgba(10, 10, 10, 0.95);
            border: 1px solid var(--border-white);
            padding: 2rem;
        }
        
        .interpretation-item {
            background: rgba(255, 255, 255, 0.03);
            border-left: 3px solid var(--accent-cyan);
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            transition: all 0.3s;
        }
        
        .interpretation-item:hover {
            background: rgba(255, 255, 255, 0.05);
            border-left-color: var(--accent-red);
            transform: translateX(5px);
        }
        
        .interpretation-item.fully-decoded {
            border-left-color: var(--accent-gold);
        }
        
        .interpretation-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .interpretation-username {
            color: var(--accent-cyan);
            font-weight: bold;
            font-size: 1.1rem;
        }
        
        .interpretation-progress {
            color: var(--accent-gold);
            font-size: 0.85rem;
            font-family: var(--font-system);
        }
        
        .interpretation-text {
            color: var(--primary-white);
            line-height: 1.6;
            margin-bottom: 0.5rem;
            word-wrap: break-word;
            white-space: normal;
        }
        
        .interpretation-timestamp {
            color: var(--dark-white);
            font-size: 0.75rem;
            opacity: 0.7;
        }
        
        .loading-message {
            text-align: center;
            color: var(--dark-white);
            padding: 2rem;
        }
        
        .no-interpretations {
            text-align: center;
            color: var(--dark-white);
            padding: 2rem;
            font-style: italic;
        }
    `;
    document.head.appendChild(style);
}

function displayLeaderboard(interpretations) {
    const container = document.getElementById('leaderboard-container');
    if (!container) return;

    if (interpretations.length === 0) {
        container.innerHTML = '<div class="no-interpretations">No interpretations yet. Be the first to submit yours!</div>';
        return;
    }

    container.innerHTML = interpretations.map(item => {
        const date = new Date(item.timestamp);
        const timeAgo = getTimeAgo(date);
        const fullyDecoded = item.isFullyDecoded ? 'fully-decoded' : '';

        return `
            <div class="interpretation-item ${fullyDecoded}">
                <div class="interpretation-header">
                    <div class="interpretation-username">${escapeHtml(item.username)}</div>
                    <div class="interpretation-progress">${item.decodeProgress}% Decoded ${item.isFullyDecoded ? '✓' : ''}</div>
                </div>
                <div class="interpretation-text">"${escapeHtml(item.interpretation)}"</div>
                <div class="interpretation-timestamp">${timeAgo}</div>
            </div>
        `;
    }).join('');
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;

    return date.toLocaleDateString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSignalPage);
} else {
    initSignalPage();
}