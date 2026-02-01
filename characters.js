// ============================================
// CHARACTER CONSTELLATION MAP
// ============================================

// Character data
const characterData = {
    elpida: {
        name: "ELPIDA",
        subtitle: "BRIGADE COMMANDER",
        id: "FILE: A-001",
        stamp: "CONFIDENTIAL",
        image: "images/ElpidaCS.png",
        status: "ACTIVE",
        stats: {
            "STATUS": "ACTIVE",
            "AGE": "3 DAYS",
            "MEMORIES": "10 YEARS",
            "THREAT LEVEL": "EXTREME"
        },
        bio: `
            <h4>TECHNICAL SPECIFICATIONS:</h4>
            <p>Titanium-reinforced endoskeleton. Neural network processor with transferred consciousness from deceased soldier. Single optical sensor. Combat protocols: ACTIVE. Designed for leadership, strategic planning, and impossible decision-making.</p>
            
            <h4>PSYCHOLOGICAL PROFILE:</h4>
            <p>Subject exhibits identity confusion and recurring gold-hued visions. Hears frequencies outside normal operational parameters. Questions nature of consciousness and sacrifice. Shows unexpected emotional responses despite synthetic origin.</p>
            
            <h4>MISSION RELEVANCE:</h4>
            <p>Built to lead the Brigade to the Array and beyond. Only one capable of calculating the impossible odds of stealing humanity's most valuable technology while three empire fleets converge. But her purpose may extend far beyond what her creators intended.</p>
        `
    },
    geo: {
        name: "COMMANDER GEO HART",
        subtitle: "BRIGADE TACTICAL OFFICER",
        id: "FILE: B-047",
        stamp: "CONFIDENTIAL",
        image: "images/GeoCS.png",
        status: "HUMAN",
        stats: {
            "STATUS": "ACTIVE",
            "AGE": "32",
            "SERVICE": "10 YEARS",
            "SPECIALIZATION": "TACTICS"
        },
        bio: `
            <h4>BACKGROUND:</h4>
            <p>Former empire officer who deserted during the Sector 2-B massacre. Led the initial formation of the Brigade. Haunted by the choice between duty and conscience.</p>
            
            <h4>SKILLS:</h4>
            <p>Master strategist. Expert in fleet coordination and guerrilla warfare. Trained the soldier whose memories now inhabit the android.</p>
            
            <h4>CURRENT MISSION:</h4>
            <p>Supports the android commander while wrestling with guilt over creating something that carries his friend's consciousness without their consent.</p>
        `
    },
    ciel: {
        name: "CIEL FLEUR",
        subtitle: "CHIEF ENGINEER",
        id: "FILE: B-089",
        stamp: "CONFIDENTIAL",
        icon: "🔧",
        status: "HUMAN",
        stats: {
            "STATUS": "ACTIVE",
            "AGE": "38",
            "SERVICE": "8 YEARS",
            "SPECIALIZATION": "ENGINEERING, ANDROID TECH"
        },
        bio: `
            <h4>BACKGROUND:</h4>
            <p>Brilliant engineer who designed the android's neural interface. Obsessed with consciousness transfer technology. Left empire after ethics violations over human experimentation.</p>
            
            <h4>RELATIONSHIP WITH ANDROID:</h4>
            <p>Views the android as both his greatest achievement and his deepest moral failure. Questions whether creating synthetic consciousness was an act of creation or violation.</p>
            
            <h4>HIDDEN AGENDA:</h4>
            <p>Secretly studies the 36 Hertz frequency. Believes it's not random noise but a form of communication. Has not shared this with the crew.</p>
        `
    },
    tahani: {
        name: "TAHANI MAZER",
        subtitle: "PILOT",
        id: "FILE: C-112",
        stamp: "CONFIDENTIAL",
        icon: "🚀",
        status: "HUMAN",
        stats: {
            "STATUS": "ACTIVE",
            "AGE": "29",
            "SERVICE": "5 YEARS",
            "SPECIALIZATION": "PILOTING AND COMBAT"
        },
        bio: `
            <h4>BACKGROUND:</h4>
            <p>Former stunt pilot turned military aviator. Known for daring maneuvers and unorthodox tactics. Joined the Brigade seeking purpose beyond thrill-seeking.</p>

            <h4>RELATIONSHIP WITH ANDROID:</h4>
            <p>Initially skeptical of the android commander but grew to respect her leadership. Finds solace in her unwavering focus amidst the chaos of their mission.</p>

            <h4>PERSONAL MOTIVATIONS:</h4>
            <p>Haunted by the loss of her younger brother in an empire raid. Determined to see the mission succeed to prevent others from suffering similar losses.</p>
            `
    },
    cinder: {
        name: "CINDER HART",
        subtitle: "COMBAT AND TACTICAL EXPERT",
        id: "FILE: D-205",
        stamp: "CONFIDENTIAL",
        icon: "🔥",
        status: "HUMAN",
        stats: {
            "STATUS": "ACTIVE",
            "AGE": "30",
            "SERVICE": "7 YEARS",
            "SPECIALIZATION": "TACTICAL STRATEGY, COMBAT, WEAPONS, ENGINEERING SUPPORT"
        },
        bio: `
            <h4>BACKGROUND:</h4>
            <p>Ex-empire special forces operative turned mercenary. Known for ruthless efficiency and tactical brilliance. Recruited by Geo Hart for the Brigade.</p>

            <h4>RELATIONSHIP WITH ANDROID:</h4>
            <p>Respects the android's capabilities but remains wary of its synthetic nature. Often challenges its decisions, leading to tense but productive exchanges.</p>

            <h4>PERSONAL MOTIVATIONS:</h4>
            <p>Driven by a desire for redemption after a failed mission that led to civilian casualties. Seeks to atone through the success of the Brigade's mission.</p>

            `
    },
    scout: {
        name: "SCOUT",
        subtitle: "WEAPONS AND COMBAT EXPERT",
        id: "FILE: E-309",
        stamp: "CONFIDENTIAL",
        icon: "🎯",
        status: "HUMAN",
        stats: {
            "STATUS": "ACTIVE",
            "AGE": "27",
            "SERVICE": "4 YEARS",
            "SPECIALIZATION": "WEAPONS, COMBAT, RECONNAISSANCE"
        },
        bio: `
            <h4>BACKGROUND:</h4>
            <p>Former bounty hunter with a reputation for precision and stealth. Joined the Brigade seeking a cause greater than personal gain.</p>

            <h4>RELATIONSHIP WITH ANDROID:</h4>
            <p>Initially distrustful of the android commander but gradually came to see its value in combat situations. Values its unemotional decision-making.</p>

            <h4>PERSONAL MOTIVATIONS:</h4>
            <p>Haunted by a past mission that went wrong, leading to the loss of a close friend. Committed to ensuring the Brigade's success to prevent further loss.</p>

            `
    }
};
// Canvas and context

let canvas, ctx;
let nodes = [];
let activeNode = null;

// ============================================
// INITIALIZATION
// ============================================
function initConstellationMap() {
    console.log('🌌 Initializing constellation map...');

    canvas = document.getElementById('constellationCanvas');
    if (!canvas) {
        console.error('Canvas not found!');
        return;
    }

    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Get all character nodes
    nodes = Array.from(document.querySelectorAll('.character-node'));

    // Setup click handlers
    nodes.forEach(node => {
        node.addEventListener('click', () => handleNodeClick(node));
    });

    // Setup modal close
    document.getElementById('modalClose')?.addEventListener('click', closeModal);
    document.getElementById('modalOverlay')?.addEventListener('click', closeModal);

    // Draw connections
    drawConnections();

    // Animate connections
    animateConnections();

    console.log('✅ Constellation map initialized!');
}

// ============================================
// CANVAS MANAGEMENT
// ============================================
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    drawConnections();
}

function drawConnections() {
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw lines between all unlocked nodes
    const unlockedNodes = nodes.filter(n => n.dataset.locked === 'false');

    for (let i = 0; i < unlockedNodes.length; i++) {
        for (let j = i + 1; j < unlockedNodes.length; j++) {
            drawLine(unlockedNodes[i], unlockedNodes[j]);
        }
    }
}

function drawLine(node1, node2) {
    const rect1 = node1.getBoundingClientRect();
    const rect2 = node2.getBoundingClientRect();
    const containerRect = canvas.getBoundingClientRect();

    const x1 = rect1.left - containerRect.left + rect1.width / 2;
    const y1 = rect1.top - containerRect.top + rect1.height / 2;
    const x2 = rect2.left - containerRect.left + rect2.width / 2;
    const y2 = rect2.top - containerRect.top + rect2.height / 2;

    // Create gradient
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, 'rgba(0, 255, 136, 0.3)');
    gradient.addColorStop(0.5, 'rgba(0, 255, 136, 0.6)');
    gradient.addColorStop(1, 'rgba(0, 255, 136, 0.3)');

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0, 255, 136, 0.5)';

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Reset shadow
    ctx.shadowBlur = 0;
}

// ============================================
// ANIMATION
// ============================================
let animationOffset = 0;

function animateConnections() {
    animationOffset += 0.5;

    // Redraw with animated dashes
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const unlockedNodes = nodes.filter(n => n.dataset.locked === 'false');

    ctx.setLineDash([10, 10]);
    ctx.lineDashOffset = -animationOffset;

    for (let i = 0; i < unlockedNodes.length; i++) {
        for (let j = i + 1; j < unlockedNodes.length; j++) {
            drawLine(unlockedNodes[i], unlockedNodes[j]);
        }
    }

    ctx.setLineDash([]);

    requestAnimationFrame(animateConnections);
}

// ============================================
// NODE INTERACTION
// ============================================
function handleNodeClick(node) {
    const characterId = node.dataset.character;
    const isLocked = node.dataset.locked === 'true';

    // Remove active class from all nodes
    nodes.forEach(n => n.classList.remove('active'));

    // Add active class to clicked node
    node.classList.add('active');
    activeNode = node;

    // Zoom effect on constellation
    zoomToNode(node);

    // Show modal
    setTimeout(() => {
        if (isLocked) {
            showLockedModal();
        } else {
            showCharacterModal(characterId);
        }
    }, 300);
}

function zoomToNode(node) {
    const container = document.getElementById('constellationMap');

    // Subtle zoom effect on container
    container.style.transform = 'scale(1.05)';
    container.style.transition = 'transform 0.4s ease';

    setTimeout(() => {
        container.style.transform = 'scale(1)';
    }, 400);
}

// ============================================
// MODAL MANAGEMENT
// ============================================
function showCharacterModal(characterId) {
    const data = characterData[characterId];
    if (!data) {
        console.error('Character data not found:', characterId);
        return;
    }

    const modal = document.getElementById('characterModal');
    const modalBody = document.getElementById('modalBody');

    const html = `
        <div class="modal-header">
            <div class="modal-stamp">${data.stamp}</div>
            <div class="modal-id">${data.id}</div>
        </div>
        
        <div class="modal-portrait">
            <div class="portrait-frame">
                <span class="portrait-icon">${data.icon}</span>
            </div>
            <div class="status-badge">${data.status}</div>
        </div>
        
        <h3 class="character-name">${data.name}</h3>
        <div class="character-subtitle">${data.subtitle}</div>
        
        <div class="stats-grid">
            ${Object.entries(data.stats).map(([label, value]) => `
                <div class="stat-box">
                    <span class="stat-label">${label}</span>
                    <span class="stat-value">${value}</span>
                </div>
            `).join('')}
        </div>
        
        <div class="character-bio">
            ${data.bio}
        </div>
    `;

    modalBody.innerHTML = html;
    modal.classList.add('active');

    // Play sound effect
    playModalSound();
}

function showLockedModal() {
    const modal = document.getElementById('characterModal');
    const modalBody = document.getElementById('modalBody');

    const html = `
        <div class="locked-message">
            <div class="portrait-icon">🔒</div>
            <h3>CLASSIFIED FILE</h3>
            <p>This personnel file is currently classified. Access will be granted as the mission progresses and additional crew members are revealed.</p>
            <p style="margin-top: 2rem; color: #ff0033; font-style: italic;">Check back for updates...</p>
        </div>
    `;

    modalBody.innerHTML = html;
    modal.classList.add('active');

    // Play denied sound
    playDeniedSound();
}

function closeModal() {
    const modal = document.getElementById('characterModal');
    modal.classList.remove('active');

    // Remove active state from nodes
    if (activeNode) {
        activeNode.classList.remove('active');
        activeNode = null;
    }
}

// ============================================
// SOUND EFFECTS
// ============================================
function playModalSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

function playDeniedSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 200;
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConstellationMap);
} else {
    initConstellationMap();
}