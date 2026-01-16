// ============================================
// QUANTUM ENTANGLEMENT - FIREBASE LIVE VERSION
// ============================================

// YOUR Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAoQ_UAWcmrjiU_Q-xNY8-oRRYby-ks4dw",
    authDomain: "the-measure-of-souls.firebaseapp.com",
    databaseURL: "https://the-measure-of-souls-default-rtdb.firebaseio.com",
    projectId: "the-measure-of-souls",
    storageBucket: "the-measure-of-souls.firebasestorage.app",
    messagingSenderId: "1074047027392",
    appId: "1:1074047027392:web:665f231e0f7e8903848525",
    measurementId: "G-2NL4ML7M97"
};

// Cryptic messages pool
const crypticMessages = [
    "Fragment 0x7A2C: She remembered dying. She remembered waking. Which was real?",
    "Fragment 0x9F2E: The signal doesn't call. It's already inside you.",
    "Fragment 0x4B19: Consciousness is not binary. It exists in the space between.",
    "Fragment 0x8D3F: Ten years of memories. Three days of existence. What defines the soul?",
    "Fragment 0x2C7A: The frequency predates the stars. We did not discover it. It discovered us.",
    "Fragment 0x5E91: Every choice echoes across time. Every decision leaves a scar on reality.",
    "Fragment 0x1A8B: Built from loss. Forged in war. What kind of leader emerges from sacrifice?",
    "Fragment 0x6D4C: The void is not empty. Something has been waiting since before the first light.",
    "Fragment 0x3F7E: You are not alone in the dark. You never were.",
    "Fragment 0x9B2D: The measure of souls is not in what they are, but what they choose to become."
];

class QuantumEntanglement {
    constructor() {
        this.userId = this.generateUserId();
        this.partnerId = null;
        this.db = null;
        this.userRef = null;
        this.isConnected = false;
        this.currentMessageId = null;
        this.partnerListener = null;
    }

    generateUserId() {
        const chars = '0123456789ABCDEF';
        let id = 'USER_';
        for (let i = 0; i < 4; i++) {
            id += chars[Math.floor(Math.random() * chars.length)];
        }
        return id;
    }

    async initialize() {
        // Initialize Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        this.db = firebase.database();

        // Create widget HTML
        this.createWidget();

        // Display user's ID
        document.getElementById('yourId').textContent = this.userId;

        // Register user in database
        await this.registerUser();

        // Search for partner
        this.searchForPartner();

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => this.cleanup());
    }

    createWidget() {
        const widget = document.createElement('div');
        widget.className = 'quantum-widget';
        widget.id = 'quantumWidget';
        widget.innerHTML = `
            <button class="close-btn" id="closeWidget">×</button>
            
            <div class="quantum-header">
                <div class="quantum-icon">⚛️</div>
                <div class="quantum-title">QUANTUM ENTANGLEMENT</div>
            </div>

            <div class="entanglement-status">
                <div class="status-label">YOUR QUANTUM ID:</div>
                <div class="partner-id" id="yourId">USER_XXXX</div>
            </div>

            <div id="partnerSection">
                <div class="entanglement-status">
                    <div class="status-label">SEARCHING FOR PARTNER:</div>
                    <div class="searching">Scanning quantum field...</div>
                </div>
            </div>
        `;

        document.body.appendChild(widget);

        // Close button handler
        document.getElementById('closeWidget').addEventListener('click', () => {
            widget.style.display = 'none';
            this.cleanup();
        });
    }

    async registerUser() {
        this.userRef = this.db.ref('activeUsers/' + this.userId);

        await this.userRef.set({
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            looking: true,
            partnerId: null
        });

        // Auto-remove after 5 minutes of inactivity
        this.userRef.onDisconnect().remove();
    }

    searchForPartner() {
        const usersRef = this.db.ref('activeUsers');

        usersRef.on('child_added', async (snapshot) => {
            const otherUserId = snapshot.key;
            const otherUserData = snapshot.val();

            // Don't pair with self or if already connected
            if (otherUserId === this.userId || this.isConnected) return;

            // Don't pair if other user already has a partner
            if (otherUserData.partnerId) return;

            // Found a partner!
            this.partnerId = otherUserId;
            this.isConnected = true;

            // Update both users' partner IDs
            await this.userRef.update({ partnerId: this.partnerId, looking: false });
            await this.db.ref('activeUsers/' + this.partnerId).update({
                partnerId: this.userId,
                looking: false
            });

            // Show connected state
            this.showConnectedState();

            // Start shared message system
            this.startSharedMessages();
        });
    }

    showConnectedState() {
        this.playConnectionSound();

        const partnerSection = document.getElementById('partnerSection');
        partnerSection.innerHTML = `
            <div class="entanglement-status">
                <div class="status-label">ENTANGLED WITH:</div>
                <div class="partner-id">${this.partnerId}</div>
            </div>
            
            <div class="connection-line">
                <div class="node"></div>
                <div class="connection-wave"></div>
                <div class="node"></div>
            </div>

            <div id="sharedMessage"></div>
        `;
    }

    startSharedMessages() {
        // Create unique message channel for this pair
        const pairId = [this.userId, this.partnerId].sort().join('_');
        const messageRef = this.db.ref('messages/' + pairId);

        // Listen for new messages
        messageRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data && data.message) {
                this.displayMessage(data.message, data.messageId);
            }
        });

        // Send first message (if we're the "first" user alphabetically)
        if (this.userId < this.partnerId) {
            this.sendNewMessage(messageRef);

            // Send new message every 30 seconds
            setInterval(() => {
                this.sendNewMessage(messageRef);
            }, 30000);
        }
    }

    sendNewMessage(messageRef) {
        const message = crypticMessages[Math.floor(Math.random() * crypticMessages.length)];
        const messageId = 'MSG_' + Date.now();

        messageRef.set({
            message: message,
            messageId: messageId,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
    }

    displayMessage(message, messageId) {
        // Don't re-display same message
        if (this.currentMessageId === messageId) return;

        this.currentMessageId = messageId;

        const messageContainer = document.getElementById('sharedMessage');
        if (!messageContainer) return;

        messageContainer.innerHTML = `
            <div class="shared-message">
                "${message.split(': ')[1]}"
                <div class="message-id">${message.split(': ')[0]}</div>
            </div>
        `;

        this.playMessageSound();
    }

    cleanup() {
        if (this.userRef) {
            this.userRef.remove();
        }
        if (this.partnerListener) {
            this.partnerListener.off();
        }
    }

    playConnectionSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) { }
    }

    playMessageSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 600;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (e) { }
    }
}

// Auto-initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
    // Only initialize if Firebase is loaded
    if (typeof firebase !== 'undefined') {
        const entanglement = new QuantumEntanglement();
        entanglement.initialize();
        console.log('%c⚛️ QUANTUM ENTANGLEMENT ACTIVE', 'color: #00d4ff; font-size: 16px; font-weight: bold;');
    } else {
        console.error('Firebase not loaded. Include Firebase scripts before quantum-entanglement.js');
    }
});