// ============================================
// SIGNAL PAGE - ENHANCED LEADERBOARD WITH DETAILS & DELETE
// ============================================

let canvas, ctx, animationId;
let decodeProgress = 0;
let symbolsClicked = new Set();
let currentUserUid = null;
let currentUsername = null;
let isAdmin = false;

// ADMIN USERNAMES - Authors with moderation privileges
const ADMIN_USERNAMES = ['Amaro', 'Matthew'];


// Initialize signal page
function initSignalPage() {
    console.log('📡 Initializing signal page...');

    setupAudioControls();
    setupVisualizer();
    setupDecoder();

    // Wait for Firebase auth state
    console.log('⏳ Waiting for auth state...');

    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            console.log('✅ User logged in:', user.uid);
            currentUserUid = user.uid;

            try {
                // Wait for authSystem
                let attempts = 0;
                while (!window.authSystem && attempts < 50) {
                    await new Promise(r => setTimeout(r, 100));
                    attempts++;
                }

                currentUsername = await authSystem.getUsername();
                console.log('✅ Username:', currentUsername);

                // Load profile if needed
                if (!authSystem.userProfile) {
                    await authSystem.loadUserProfile(user.uid);
                }

                // Check admin status (both methods)
                const byUsername = ADMIN_USERNAMES.includes(currentUsername);
                const byFirebase = authSystem.userProfile?.isAdmin === true;
                isAdmin = byUsername || byFirebase;

                console.log('🔍 isAdmin:', isAdmin);
                if (isAdmin) {
                    console.log('🛡️ Admin:', currentUsername);
                }
            } catch (e) {
                console.error('❌ Error:', e);
            }

            loadLeaderboard();
        } else {
            console.log('👤 Guest mode');
            currentUserUid = null;
            currentUsername = null;
            isAdmin = false;
            loadLeaderboard();
        }
    });

    console.log('✅ Setup complete!');
}

// Setup audio controls
function setupAudioControls() {
    const toggleBtn = document.getElementById('toggle-audio');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeValue = document.getElementById('volume-value');

    if (!toggleBtn) return;

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
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
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
    const speed = 0.02;
    const time = Date.now() * speed;

    ctx.strokeStyle = '#ff0033';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff0033';
    ctx.beginPath();

    for (let x = 0; x < canvas.width; x++) {
        const y = centerY + Math.sin((x * 0.02) + time) * amplitude;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 0, 51, 0.3)';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 5;
    ctx.beginPath();

    for (let x = 0; x < canvas.width; x++) {
        const y = centerY + Math.sin((x * 0.04) + time * 2) * (amplitude * 0.5);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    const amplitudeEl = document.getElementById('amplitude');
    if (amplitudeEl) {
        const currentAmplitude = (Math.abs(Math.sin(time)) * 100).toFixed(1);
        amplitudeEl.textContent = `${currentAmplitude}%`;
    }
}

function drawDormantWaveform() {
    const centerY = canvas.height / 2;
    ctx.strokeStyle = 'rgba(255, 0, 51, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let x = 0; x < canvas.width; x++) {
        const noise = (Math.random() - 0.5) * 2;
        const y = centerY + noise;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    const amplitudeEl = document.getElementById('amplitude');
    if (amplitudeEl) amplitudeEl.textContent = '--';
}

// Setup decoder
function setupDecoder() {
    const symbolGrid = document.getElementById('symbol-grid');
    if (!symbolGrid) return;

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

    const submitBtn = document.getElementById('submit-interpretation');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitInterpretation);
    }
}

function incrementDecode() {
    const increment = 100 / 12;
    decodeProgress = Math.min(100, decodeProgress + increment);

    const progressEl = document.getElementById('decode-progress');
    if (progressEl) progressEl.textContent = `${Math.round(decodeProgress)}%`;

    const cipherText = document.getElementById('cipher-text');
    if (!cipherText) return;

    if (decodeProgress >= 25 && decodeProgress < 50) {
        cipherText.innerHTML = "Th█ ca██ fr██ th█ de████s ca████s mo██ tha█ fr████nc█. It ca███ to yo█. To li███n. To he██, to he██.<br><br>To un█████nd. To st███.";
        cipherText.style.color = '#ff6666';
    } else if (decodeProgress >= 50 && decodeProgress < 75) {
        cipherText.innerHTML = "The ca██ from the de██hs car██es more than fre██ency. It calls to you. To lis██n. To hear, to heed.<br><br>To und█████and. To s█and.";
        cipherText.style.color = '#ff9933';
    } else if (decodeProgress >= 75 && decodeProgress < 95) {
        cipherText.innerHTML = "The ca██ from the depths car██es more than frequency. It calls to you. To lis██n. To hear, to heed.<br><br>To unde███tand. To stand.";
        cipherText.style.color = '#ffcc00';
    } else if (decodeProgress >= 95) {
        cipherText.innerHTML = "The call from the depths carries more than frequency. It calls to you. To listen. To hear, to heed.<br><br>To understand. To stand.";
        cipherText.style.color = '#00ff88';
        cipherText.style.textShadow = '0 0 10px #00ff88';
        cipherText.style.wordWrap = 'break-word';
        cipherText.style.whiteSpace = 'normal';
        showFullDecryptionNotice();
    }

    if (window.authSystem && authSystem.isLoggedIn()) {
        authSystem.saveUserProgress('signalProgress', decodeProgress);
    }
}

function showFullDecryptionNotice() {
    const cipherHeader = document.querySelector('.cipher-header');
    if (!cipherHeader || document.querySelector('.decryption-complete-notice')) return;

    const notice = document.createElement('div');
    notice.className = 'decryption-complete-notice';
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
    cipherHeader.parentElement.appendChild(notice);
}

async function submitInterpretation() {
    const input = document.getElementById('interpretation-input');
    const interpretation = input.value.trim();

    if (interpretation.length < 10) {
        alert('Please provide a more detailed interpretation (at least 10 characters).');
        return;
    }

    let username = 'Anonymous';
    let userUid = null;

    if (window.authSystem && authSystem.isLoggedIn()) {
        try {
            username = await authSystem.getUsername() || 'Anonymous';
            const user = firebase.auth().currentUser;
            if (user) userUid = user.uid;
        } catch (e) {
            username = 'Anonymous';
        }
    } else {
        const promptedName = prompt('Enter your name (or leave blank for Anonymous):');
        if (promptedName && promptedName.trim()) {
            username = promptedName.trim().substring(0, 30);
        }
    }

    const isFullyDecoded = decodeProgress >= 95;

    if (typeof firebase !== 'undefined' && firebase.database) {
        try {
            const interpretationRef = firebase.database().ref('signalInterpretations');
            await interpretationRef.push({
                username: username,
                userUid: userUid, // Store UID for delete permissions
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
            `PARTIAL DECRYPTION (${Math.round(decodeProgress)}%). The signal acknowledges your interpretation, but there is more to decode.`,
            `INCOMPLETE PATTERN (${Math.round(decodeProgress)}%). Your consciousness begins to resonate, but the frequency awaits complete understanding.`,
            `ESTABLISHING LINK (${Math.round(decodeProgress)}%). The quantum psalm hears you, but faintly. Decode all symbols to strengthen the connection.`
        ];
    }

    acknowledgmentText.textContent = responses[Math.floor(Math.random() * responses.length)];
    resultsDiv.style.display = 'block';

    const revealedMessage = resultsDiv.querySelector('.revealed-message');
    if (revealedMessage) {
        revealedMessage.style.display = isFullyDecoded ? 'block' : 'none';
    }

    await loadLeaderboard();
    input.value = '';
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ENHANCED LEADERBOARD
async function loadLeaderboard() {
    const leaderboardContainer = document.getElementById('leaderboard-container');
    if (!leaderboardContainer) {
        createLeaderboardSection();
    }

    if (typeof firebase === 'undefined' || !firebase.database) {
        console.log('Firebase not available for leaderboard');
        return;
    }

    try {
        const interpretationsRef = firebase.database().ref('signalInterpretations');
        const snapshot = await interpretationsRef.orderByChild('timestamp').limitToLast(20).once('value');

        const interpretations = [];
        snapshot.forEach((child) => {
            interpretations.push({ id: child.key, ...child.val() });
        });

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
            <h2>COMMUNITY INTERPRETATIONS</h2>
            <div class="header-line"></div>
        </div>
        <div id="leaderboard-container" class="leaderboard-container">
            <div class="loading-message">Loading interpretations...</div>
        </div>
    `;

    decoderSection.parentElement.insertBefore(leaderboardSection, decoderSection.nextSibling);
    addLeaderboardStyles();
}

function addLeaderboardStyles() {
    if (document.getElementById('leaderboard-styles')) return;

    const style = document.createElement('style');
    style.id = 'leaderboard-styles';
    style.textContent = `
        .leaderboard-section {
            padding: 4rem 2rem;
            max-width: 1200px;
            margin: 0 auto;
            background: #0a0a0a;
        }
        
        .leaderboard-container {
            background: rgba(10, 10, 10, 0.95);
            border: 2px solid var(--accent-red);
            padding: 2rem;
        }
        
        .interpretation-item {
            background: rgba(255, 255, 255, 0.03);
            border-left: 3px solid var(--accent-cyan);
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            transition: all 0.3s;
            position: relative;
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
        
        .interpretation-preview {
            color: var(--primary-white);
            line-height: 1.6;
            margin-bottom: 0.8rem;
            word-wrap: break-word;
            white-space: normal;
            max-height: 3.2em;
            overflow: hidden;
            position: relative;
        }
        
        .interpretation-preview.truncated::after {
            content: '...';
            position: absolute;
            right: 0;
            bottom: 0;
            background: linear-gradient(to right, transparent, rgba(10, 10, 10, 0.95) 50%);
            padding-left: 2rem;
        }
        
        .interpretation-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
            flex-wrap: wrap;
        }
        
        .interpretation-timestamp {
            color: var(--dark-white);
            font-size: 0.75rem;
            opacity: 0.7;
        }
        
        .interpretation-actions {
            display: flex;
            gap: 0.5rem;
        }
        
        .view-details-btn, .delete-btn {
            padding: 0.4rem 1rem;
            font-size: 0.75rem;
            font-family: 'Courier New', monospace;
            cursor: pointer;
            border: 1px solid;
            background: transparent;
            transition: all 0.3s;
            letter-spacing: 0.08em;
        }
        
        .view-details-btn {
            color: var(--accent-cyan);
            border-color: var(--accent-cyan);
        }
        
        .view-details-btn:hover {
            background: var(--accent-cyan);
            color: var(--bg-black);
            box-shadow: 0 0 15px var(--accent-cyan);
        }
        
        .delete-btn {
            color: var(--accent-red);
            border-color: var(--accent-red);
        }
        
        .delete-btn:hover {
            background: var(--accent-red);
            color: white;
            box-shadow: 0 0 15px var(--accent-red);
        }
        
        /* Modal Styles */
        .interpretation-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 10000;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }
        
        .interpretation-modal.active {
            display: flex;
        }
        
        .modal-content {
            background: #1a1a1a;
            border: 2px solid var(--accent-cyan);
            padding: 2rem;
            max-width: 700px;
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
            box-shadow: 0 0 50px rgba(0, 212, 255, 0.5);
            animation: modal-appear 0.3s ease;
        }
        
        @keyframes modal-appear {
            from {
                opacity: 0;
                transform: scale(0.9);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }
        
        .modal-close {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: transparent;
            border: none;
            color: var(--accent-red);
            font-size: 2rem;
            cursor: pointer;
            line-height: 1;
            transition: all 0.3s;
        }
        
        .modal-close:hover {
            color: white;
            transform: rotate(90deg);
        }
        
        .modal-header {
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .modal-username {
            color: var(--accent-cyan);
            font-size: 1.3rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }
        
        .modal-metadata {
            display: flex;
            gap: 1.5rem;
            flex-wrap: wrap;
            font-size: 0.85rem;
            color: var(--dark-white);
        }
        
        .modal-metadata span {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .modal-body {
            color: var(--primary-white);
            line-height: 1.8;
            font-size: 1.1rem;
            margin-bottom: 1.5rem;
        }
        
        .loading-message, .no-interpretations {
            text-align: center;
            color: var(--dark-white);
            padding: 2rem;
        }
        
        .no-interpretations {
            font-style: italic;
        }
        
        @media (max-width: 768px) {
            .modal-content {
                padding: 1.5rem;
                max-height: 90vh;
            }
            
            .interpretation-actions {
                width: 100%;
                justify-content: space-between;
            }
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
        const preview = item.interpretation.length > 150
            ? item.interpretation.substring(0, 150)
            : item.interpretation;
        const isTruncated = item.interpretation.length > 150;
        const isOwner = currentUserUid && item.userUid === currentUserUid;
        const canDelete = isOwner || isAdmin; // Owner OR admin can delete

        return `
            <div class="interpretation-item ${fullyDecoded}" data-id="${item.id}">
                <div class="interpretation-header">
                    <div class="interpretation-username">${escapeHtml(item.username)}</div>
                    <div class="interpretation-progress">${item.decodeProgress}% Decoded ${item.isFullyDecoded ? '✓' : ''}</div>
                </div>
                <div class="interpretation-preview ${isTruncated ? 'truncated' : ''}">"${escapeHtml(preview)}"</div>
                <div class="interpretation-footer">
                    <div class="interpretation-timestamp">${timeAgo}</div>
                    <div class="interpretation-actions">
                        <button class="view-details-btn" onclick="viewInterpretationDetails('${item.id}')">
                            VIEW FULL
                        </button>
                        ${canDelete ? `<button class="delete-btn" onclick="deleteInterpretation('${item.id}', ${isAdmin}, ${isOwner})" ${isAdmin && !isOwner ? 'title="Admin: Moderating content"' : ''}>
                            ${isAdmin && !isOwner ? '🛡️ REMOVE' : 'DELETE'}
                        </button>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Create modal if it doesn't exist
    createModal();
}

function createModal() {
    if (document.getElementById('interpretation-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'interpretation-modal';
    modal.className = 'interpretation-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()">×</button>
            <div class="modal-header">
                <div class="modal-username" id="modal-username"></div>
                <div class="modal-metadata">
                    <span>📊 <span id="modal-progress"></span></span>
                    <span>🕐 <span id="modal-timestamp"></span></span>
                </div>
            </div>
            <div class="modal-body" id="modal-body"></div>
        </div>
    `;
    document.body.appendChild(modal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

// Global functions for onclick handlers
window.viewInterpretationDetails = async function (interpretationId) {
    try {
        const snapshot = await firebase.database().ref(`signalInterpretations/${interpretationId}`).once('value');
        const data = snapshot.val();

        if (!data) {
            alert('Interpretation not found.');
            return;
        }

        const modal = document.getElementById('interpretation-modal');
        document.getElementById('modal-username').textContent = data.username;
        document.getElementById('modal-progress').textContent = `${data.decodeProgress}% Decoded ${data.isFullyDecoded ? '✓' : ''}`;
        document.getElementById('modal-timestamp').textContent = new Date(data.timestamp).toLocaleString();
        document.getElementById('modal-body').textContent = `"${data.interpretation}"`;

        modal.classList.add('active');
    } catch (error) {
        console.error('Error loading interpretation:', error);
        alert('Failed to load interpretation details.');
    }
};

window.closeModal = function () {
    const modal = document.getElementById('interpretation-modal');
    modal.classList.remove('active');
};

window.deleteInterpretation = async function (interpretationId, isAdminAction = false, isOwner = false) {
    // Different confirmation messages for admins vs owners
    let confirmMessage;
    if (isAdminAction && !isOwner) {
        confirmMessage = '🛡️ ADMIN ACTION: Are you sure you want to remove this interpretation?\n\nThis action will be logged and cannot be undone.';
    } else {
        confirmMessage = '⚠️ Are you sure you want to delete this interpretation? This action cannot be undone.';
    }

    const confirmed = confirm(confirmMessage);

    if (!confirmed) return;

    try {
        // Get the interpretation data first
        const snapshot = await firebase.database().ref(`signalInterpretations/${interpretationId}`).once('value');
        const data = snapshot.val();

        if (!data) {
            alert('Interpretation not found.');
            return;
        }

        // Check permissions
        const userIsOwner = data.userUid === currentUserUid;
        const userIsAdmin = isAdmin;

        if (!userIsOwner && !userIsAdmin) {
            alert('❌ You do not have permission to delete this interpretation.');
            return;
        }

        // If admin is deleting someone else's post, log it
        if (userIsAdmin && !userIsOwner) {
            console.log(`🛡️ ADMIN MODERATION: ${currentUsername} removed interpretation by ${data.username}`);

            // Optional: Log to Firebase for audit trail
            await firebase.database().ref('moderationLog').push({
                action: 'DELETE_INTERPRETATION',
                adminUsername: currentUsername,
                adminUid: currentUserUid,
                targetUsername: data.username,
                targetUid: data.userUid,
                interpretationId: interpretationId,
                interpretation: data.interpretation,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });
        }

        // Delete the interpretation
        await firebase.database().ref(`signalInterpretations/${interpretationId}`).remove();
        console.log('✅ Interpretation deleted');

        // Reload leaderboard
        await loadLeaderboard();

        // Different success messages
        if (userIsAdmin && !userIsOwner) {
            alert('✓ Interpretation removed by admin. Action logged.');
        } else {
            alert('✓ Interpretation deleted successfully.');
        }
    } catch (error) {
        console.error('Error deleting interpretation:', error);
        alert('❌ Failed to delete interpretation. Please try again.');
    }
};

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