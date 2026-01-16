// ============================================
// QUANTUM ENTANGLEMENT - ULTIMATE VERSION
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
        this.partnerRef = null;
        this.isConnected = false;
        this.currentMessageId = null;
        this.messageListener = null;
        this.chatListener = null;
        this.partnerDisconnectListener = null;
        this.isMinimized = false;
        this.unreadCount = 0;
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

        // Listen for partner updates
        this.listenForPartnerUpdates();

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => this.cleanup());
    }

    createWidget() {
        const widget = document.createElement('div');
        widget.className = 'quantum-widget rainbow-pulse';
        widget.id = 'quantumWidget';
        widget.innerHTML = `
            <button class="minimize-btn" id="minimizeBtn" title="Minimize">−</button>
            <button class="close-btn" id="closeWidget" title="Close">×</button>
            
            <div class="widget-content" id="widgetContent">
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
            </div>

            <!-- Minimized State -->
            <div class="minimized-state" id="minimizedState" style="display: none;">
                <div class="quantum-icon-mini">⚛️</div>
                <span id="partnerIdMini">QUANTUM</span>
                <span class="unread-badge" id="unreadBadge" style="display: none;">0</span>
            </div>
        `;

        document.body.appendChild(widget);

        // Setup button handlers
        this.setupButtonHandlers();
    }

    setupButtonHandlers() {
        const closeBtn = document.getElementById('closeWidget');
        const minimizeBtn = document.getElementById('minimizeBtn');
        const minimizedState = document.getElementById('minimizedState');

        // Close with warning
        closeBtn.addEventListener('click', () => {
            if (this.isConnected) {
                const confirmed = confirm('⚠️ WARNING: Closing will end your quantum entanglement with ' + this.partnerId + '. Continue?');
                if (!confirmed) return;
            }
            document.getElementById('quantumWidget').style.display = 'none';
            this.cleanup();
        });

        // Minimize toggle
        minimizeBtn.addEventListener('click', () => {
            this.toggleMinimize();
        });

        minimizedState.addEventListener('click', () => {
            this.toggleMinimize();
        });
    }

    toggleMinimize() {
        const widget = document.getElementById('quantumWidget');
        const content = document.getElementById('widgetContent');
        const minimized = document.getElementById('minimizedState');
        const minimizeBtn = document.getElementById('minimizeBtn');

        this.isMinimized = !this.isMinimized;

        if (this.isMinimized) {
            content.style.display = 'none';
            minimized.style.display = 'flex';
            widget.style.minWidth = 'auto';
            widget.style.width = '200px';
            widget.style.height = '60px';
            minimizeBtn.style.display = 'none';

            // Update minimized text
            if (this.partnerId) {
                document.getElementById('partnerIdMini').textContent = this.partnerId;
            }
        } else {
            content.style.display = 'block';
            minimized.style.display = 'none';
            widget.style.minWidth = '320px';
            widget.style.width = 'auto';
            widget.style.height = 'auto';
            minimizeBtn.style.display = 'flex';

            // Clear unread count
            this.unreadCount = 0;
            document.getElementById('unreadBadge').style.display = 'none';
        }
    }

    async registerUser() {
        this.userRef = this.db.ref('activeUsers/' + this.userId);

        await this.userRef.set({
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            looking: true,
            partnerId: null,
            online: true
        });

        // Auto-remove after disconnect
        this.userRef.onDisconnect().remove();
    }

    listenForPartnerUpdates() {
        // Listen for when OUR user data changes (when someone pairs with us)
        this.userRef.on('value', async (snapshot) => {
            const userData = snapshot.val();
            if (userData && userData.partnerId && !this.isConnected) {
                // We got paired!
                this.partnerId = userData.partnerId;
                this.isConnected = true;
                this.showConnectedState();
                this.startSharedMessages();
                this.startChat();
                this.monitorPartnerStatus();
            }
        });
    }

    monitorPartnerStatus() {
        if (!this.partnerId) return;

        this.partnerRef = this.db.ref('activeUsers/' + this.partnerId);

        this.partnerDisconnectListener = this.partnerRef.on('value', (snapshot) => {
            const partnerData = snapshot.val();

            // Partner disconnected
            if (!partnerData) {
                this.showPartnerDisconnected();
            }
        });
    }

    showPartnerDisconnected() {
        const partnerSection = document.getElementById('partnerSection');
        if (!partnerSection) return;

        // Show disconnection notice
        const disconnectNotice = document.createElement('div');
        disconnectNotice.className = 'disconnect-notice';
        disconnectNotice.innerHTML = `
            <div style="color: #ff0033; font-weight: bold; margin-bottom: 0.5rem;">⚠️ ENTANGLEMENT SEVERED</div>
            <div style="color: #cccccc; font-size: 0.85rem;">${this.partnerId} has left the quantum field.</div>
        `;

        partnerSection.appendChild(disconnectNotice);

        // Alert user
        this.playDisconnectSound();

        // Reset connection state
        this.isConnected = false;
        this.partnerId = null;
    }

    searchForPartner() {
        const usersRef = this.db.ref('activeUsers');

        usersRef.once('value', async (snapshot) => {
            const users = snapshot.val();
            if (!users) return;

            // Find someone who's looking
            for (const otherUserId in users) {
                const otherUserData = users[otherUserId];

                // Don't pair with self or if already connected
                if (otherUserId === this.userId || this.isConnected) continue;

                // Found someone looking!
                if (otherUserData.looking && !otherUserData.partnerId) {
                    this.partnerId = otherUserId;
                    this.isConnected = true;

                    // Update BOTH users atomically
                    await this.userRef.update({ partnerId: this.partnerId, looking: false });
                    await this.db.ref('activeUsers/' + this.partnerId).update({
                        partnerId: this.userId,
                        looking: false
                    });

                    this.showConnectedState();
                    this.startSharedMessages();
                    this.startChat();
                    this.monitorPartnerStatus();
                    return;
                }
            }
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

            <!-- Chat Interface -->
            <div class="quantum-chat">
                <div class="chat-header">
                    <span>// QUANTUM CHANNEL</span>
                </div>
                <div class="chat-messages" id="chatMessages"></div>
                <div class="chat-input-wrapper">
                    <input type="text" id="chatInput" placeholder="Type message..." maxlength="100">
                    <button id="sendBtn">></button>
                </div>
            </div>
        `;

        // Setup chat handlers
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');

        sendBtn.addEventListener('click', () => this.sendChatMessage());
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendChatMessage();
        });
    }

    startSharedMessages() {
        // Create unique message channel for this pair
        const pairId = [this.userId, this.partnerId].sort().join('_');
        const messageRef = this.db.ref('messages/' + pairId);

        // Listen for new messages
        this.messageListener = messageRef.on('value', (snapshot) => {
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
                if (this.isConnected) {
                    this.sendNewMessage(messageRef);
                }
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

    // ============================================
    // CHAT FUNCTIONALITY
    // ============================================
    startChat() {
        const pairId = [this.userId, this.partnerId].sort().join('_');
        const chatRef = this.db.ref('chat/' + pairId);

        // Listen for new chat messages
        this.chatListener = chatRef.on('child_added', (snapshot) => {
            const msg = snapshot.val();
            this.displayChatMessage(msg.userId, msg.text, msg.timestamp);

            // Show notification if minimized
            if (this.isMinimized && msg.userId !== this.userId) {
                this.showNewMessageNotification();
            }
        });
    }

    sendChatMessage() {
        const input = document.getElementById('chatInput');
        const text = input.value.trim();

        if (!text) return;

        const pairId = [this.userId, this.partnerId].sort().join('_');
        const chatRef = this.db.ref('chat/' + pairId);

        chatRef.push({
            userId: this.userId,
            text: text,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });

        input.value = '';
        this.playTypingSound();
    }

    displayChatMessage(senderId, text, timestamp) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const isMe = senderId === this.userId;
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${isMe ? 'me' : 'them'}`;

        msgDiv.innerHTML = `
            <div class="msg-sender">${isMe ? 'YOU' : this.partnerId}:</div>
            <div class="msg-text">${this.escapeHtml(text)}</div>
        `;

        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        if (!isMe) {
            this.playMessageSound();

            // Browser notification if supported
            this.showBrowserNotification(text);
        }
    }

    showNewMessageNotification() {
        this.unreadCount++;
        const badge = document.getElementById('unreadBadge');
        badge.textContent = this.unreadCount;
        badge.style.display = 'block';

        // Pulse the widget
        const widget = document.getElementById('quantumWidget');
        widget.style.animation = 'none';
        setTimeout(() => {
            widget.style.animation = 'pulse-notify 0.5s ease 3';
        }, 10);
    }

    showBrowserNotification(text) {
        if (!("Notification" in window)) return;

        if (Notification.permission === "granted") {
            new Notification(`Message from ${this.partnerId}`, {
                body: text,
                icon: '⚛️',
                tag: 'quantum-message'
            });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification(`Message from ${this.partnerId}`, {
                        body: text,
                        icon: '⚛️'
                    });
                }
            });
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============================================
    // CLEANUP
    // ============================================
    cleanup() {
        if (this.userRef) {
            this.userRef.off();
            this.userRef.remove();
        }
        if (this.partnerRef && this.partnerDisconnectListener) {
            this.partnerRef.off('value', this.partnerDisconnectListener);
        }
        if (this.messageListener) {
            const pairId = [this.userId, this.partnerId].sort().join('_');
            this.db.ref('messages/' + pairId).off('value', this.messageListener);
        }
        if (this.chatListener) {
            const pairId = [this.userId, this.partnerId].sort().join('_');
            this.db.ref('chat/' + pairId).off('child_added', this.chatListener);
        }
    }

    // ============================================
    // SOUND EFFECTS
    // ============================================
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

    playTypingSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 400;
            oscillator.type = 'square';

            gainNode.gain.setValueAtTime(0.03, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.05);
        } catch (e) { }
    }

    playDisconnectSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 200;
            oscillator.type = 'sawtooth';

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
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