// ============================================
// QUANTUM ENTANGLEMENT - FINAL PERSISTENT VERSION
// ============================================

// Note: firebase-config.js is the single source of truth for Firebase setup.
// This file assumes firebase is already initialized by firebase-config.js.


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
        // PERSISTENT USER ID - set later during async initialize()
        this.userId = null;
        this.partnerId = this.getStoredPartnerId();
        this.db = null;
        this.userRef = null;
        this.partnerRef = null;
        this.isConnected = false;
        this.currentMessageId = null;
        this.messageListener = null;
        this.chatListener = null;
        this.partnerDisconnectListener = null;
        this.isMinimized = this.getMinimizedState();
        this.unreadCount = 0;
        this.isClosed = this.getClosedState();
    }

    // Get or create persistent User ID
    async getOrCreateUserId() {
        let userId = localStorage.getItem('quantumUserId');
        if (!userId) {
            userId = await this.generateUserId();
            localStorage.setItem('quantumUserId', userId);
        }
        return userId;
    }

    // Get stored partner ID if exists
    getStoredPartnerId() {
        return localStorage.getItem('quantumPartnerId') || null;
    }

    // Store partner ID
    storePartnerId(partnerId) {
        if (partnerId) {
            localStorage.setItem('quantumPartnerId', partnerId);
        } else {
            localStorage.removeItem('quantumPartnerId');
        }
    }

    // Get minimized state
    getMinimizedState() {
        return localStorage.getItem('quantumMinimized') === 'true';
    }

    // Store minimized state
    storeMinimizedState(isMinimized) {
        localStorage.setItem('quantumMinimized', isMinimized.toString());
    }

    // Get closed state
    getClosedState() {
        return localStorage.getItem('quantumClosed') === 'true';
    }

    // Store closed state
    storeClosedState(isClosed) {
        if (isClosed) {
            localStorage.setItem('quantumClosed', 'true');
        } else {
            localStorage.removeItem('quantumClosed');
        }
    }

    async generateUserId() {
        // Check if user is logged in
        if (window.authSystem && authSystem.isLoggedIn()) {
            const username = await authSystem.getUsername();
            if (username) {
                return username; // Use their account username!
            }
        }

        // Fallback to random ID
        const chars = '0123456789ABCDEF';
        let id = 'USER_';
        for (let i = 0; i < 4; i++) {
            id += chars[Math.floor(Math.random() * chars.length)];
        }
        return id;
    }

    async initialize() {
        // If user previously closed the widget, don't show it
        if (this.isClosed) {
            console.log('⚛️ Quantum Entanglement available - Click footer button to launch');
            this.createLaunchButton();
            return;
        }

        // Ensure Firebase was initialized by firebase-config.js
        if (typeof firebase === 'undefined' || !firebase.apps || !firebase.apps.length) {
            console.error('❌ Firebase not initialized. Include firebase-config.js before quantum-entanglement.js');
            // Create launch button anyway so user can attempt to open widget later
            this.createLaunchButton();
            return;
        }

        // Ensure we have a concrete userId (avoid Promise leaking into DB paths)
        this.userId = await this.getOrCreateUserId();

        this.db = firebase.database();

        // Create widget HTML
        this.createWidget();
        this.createLaunchButton();

        // Display user's ID if element exists
        const yourIdEl = document.getElementById('yourId');
        if (yourIdEl) yourIdEl.textContent = this.userId;

        // Register user in database
        await this.registerUser();

        // If we have a stored partner, try to reconnect
        if (this.partnerId) {
            this.reconnectToPartner();
        } else {
            // Search for new partner
            this.searchForPartner();
        }

        // Listen for partner updates
        this.listenForPartnerUpdates();

        // Apply minimized state if needed (AFTER everything is set up)
        if (this.isMinimized) {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                this.applyMinimizedState();
            }, 100);
        }

        // Cleanup on page unload (but don't remove from DB, just disconnect listeners)
        window.addEventListener('beforeunload', () => {
            this.cleanupListeners();
        });
    }

    createLaunchButton() {
        // Add launch button to footer (fallback to fixed body button if no footer)
        const footer = document.querySelector('footer');

        // Remove existing button if present
        const existingBtn = document.getElementById('qeLaunchBtn');
        if (existingBtn) existingBtn.remove();

        const launchBtn = document.createElement('button');
        launchBtn.id = 'qeLaunchBtn';
        launchBtn.className = 'qe-launch-btn';
        launchBtn.innerHTML = '⚛️ QUANTUM ENTANGLEMENT';
        launchBtn.title = 'Launch Quantum Entanglement';

        launchBtn.addEventListener('click', () => {
            this.launchWidget();
        });

        if (footer) {
            footer.appendChild(launchBtn);
            return;
        }

        // Fallback: fixed floating-launch button (visible on pages without footer)
        launchBtn.style.position = 'fixed';
        launchBtn.style.right = '18px';
        launchBtn.style.bottom = '18px';
        launchBtn.style.zIndex = '99999';
        launchBtn.style.padding = '10px 14px';
        launchBtn.style.borderRadius = '8px';
        launchBtn.style.border = 'none';
        launchBtn.style.cursor = 'pointer';
        launchBtn.style.background = 'linear-gradient(90deg,#00d4ff,#0066ff)';
        launchBtn.style.color = '#000';
        launchBtn.style.boxShadow = '0 6px 20px rgba(0,0,0,0.35)';
        document.body.appendChild(launchBtn);
    }

    async launchWidget() {
        // Clear closed state
        this.isClosed = false;
        this.storeClosedState(false);

        // If widget doesn't exist yet, initialize it
        if (!document.getElementById('quantumWidget')) {
            // Firebase should already be initialized by firebase-config.js
            if (typeof firebase === 'undefined' || !firebase.apps || !firebase.apps.length) {
                console.error('❌ Firebase not initialized. Include firebase-config.js before quantum-entanglement.js');
                this.createLaunchButton();
                return;
            }
            this.db = firebase.database();

            // Ensure we have a concrete userId
            if (!this.userId) {
                this.userId = await this.getOrCreateUserId();
            }

            this.createWidget();
            const yourIdEl = document.getElementById('yourId');
            if (yourIdEl) yourIdEl.textContent = this.userId;

            await this.registerUser();

            if (this.partnerId) {
                this.reconnectToPartner();
            } else {
                this.searchForPartner();
            }

            this.listenForPartnerUpdates();
        } else {
            // Just show existing widget
            document.getElementById('quantumWidget').style.display = 'flex';
        }
    }

    async reconnectToPartner() {
        console.log('🔄 Reconnecting to partner:', this.partnerId);

        // Check if partner still exists
        const partnerSnapshot = await this.db.ref('activeUsers/' + this.partnerId).once('value');
        const partnerData = partnerSnapshot.val();

        if (partnerData && partnerData.partnerId === this.userId) {
            // Partner still exists and is still paired with us!
            this.isConnected = true;
            this.showConnectedState();
            this.startSharedMessages();
            this.startChat();
            this.monitorPartnerStatus();
        } else {
            // Partner is gone, clear stored partner and search for new one
            console.log('⚠️ Stored partner no longer available');
            this.storePartnerId(null);
            this.partnerId = null;
            this.searchForPartner();
        }
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
                <button class="maximize-btn" id="maximizeBtn" title="Maximize">□</button>
            </div>
        `;

        document.body.appendChild(widget);

        // Setup button handlers
        this.setupButtonHandlers();
    }

    setupButtonHandlers() {
        const closeBtn = document.getElementById('closeWidget');
        const minimizeBtn = document.getElementById('minimizeBtn');
        const maximizeBtn = document.getElementById('maximizeBtn');
        const minimizedState = document.getElementById('minimizedState');

        if (closeBtn) {
            // Close with warning
            closeBtn.addEventListener('click', () => {
                if (this.isConnected) {
                    const confirmed = confirm('⚠️ WARNING: Closing will end your quantum entanglement with ' + this.partnerId + '. You can reopen it anytime from the footer. Continue?');
                    if (!confirmed) return;
                }

                // Mark as closed
                this.isClosed = true;
                this.storeClosedState(true);

                // Hide widget
                const widgetEl = document.getElementById('quantumWidget');
                if (widgetEl) widgetEl.style.display = 'none';

                // Cleanup listeners but keep user data
                this.cleanupListeners();
            });
        }

        if (minimizeBtn) {
            // Minimize toggle
            minimizeBtn.addEventListener('click', () => {
                this.toggleMinimize();
            });
        }

        if (maximizeBtn) {
            // Maximize from minimized state
            maximizeBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering minimizedState click
                this.toggleMinimize();
            });
        }

        if (minimizedState) {
            // Click minimized widget to maximize
            minimizedState.addEventListener('click', (e) => {
                // Only maximize if not clicking the maximize button
                if (!e.target.classList.contains('maximize-btn')) {
                    this.toggleMinimize();
                }
            });
        }
    }

    applyMinimizedState() {
        const widget = document.getElementById('quantumWidget');
        const content = document.getElementById('widgetContent');
        const minimized = document.getElementById('minimizedState');
        const minimizeBtn = document.getElementById('minimizeBtn');

        if (!widget || !content || !minimized || !minimizeBtn) return;

        content.style.display = 'none';
        minimized.style.display = 'flex';
        widget.style.minWidth = 'auto';
        widget.style.width = '200px';
        widget.style.height = '60px';
        minimizeBtn.style.display = 'none';

        // Update minimized text if we have a partner
        if (this.partnerId) {
            const partnerIdMini = document.getElementById('partnerIdMini');
            if (partnerIdMini) {
                partnerIdMini.textContent = this.partnerId;
            }
        }
    }

    toggleMinimize() {
        const widget = document.getElementById('quantumWidget');
        const content = document.getElementById('widgetContent');
        const minimized = document.getElementById('minimizedState');
        const minimizeBtn = document.getElementById('minimizeBtn');

        this.isMinimized = !this.isMinimized;
        this.storeMinimizedState(this.isMinimized);

        if (this.isMinimized) {
            if (content) content.style.display = 'none';
            if (minimized) minimized.style.display = 'flex';
            if (widget) {
                widget.style.minWidth = 'auto';
                widget.style.width = '200px';
                widget.style.height = '60px';
            }
            if (minimizeBtn) minimizeBtn.style.display = 'none';

            // Update minimized text
            if (this.partnerId) {
                const partnerMini = document.getElementById('partnerIdMini');
                if (partnerMini) partnerMini.textContent = this.partnerId;
            }
        } else {
            if (content) content.style.display = 'block';
            if (minimized) minimized.style.display = 'none';
            if (widget) {
                widget.style.minWidth = '320px';
                widget.style.width = 'auto';
                widget.style.height = 'auto';
            }
            if (minimizeBtn) minimizeBtn.style.display = 'flex';

            // Clear unread count
            this.unreadCount = 0;
            const unreadBadge = document.getElementById('unreadBadge');
            if (unreadBadge) {
                unreadBadge.style.display = 'none';
            }
        }
    }

    async registerUser() {
        // Ensure userId is a string
        if (!this.userId) {
            this.userId = await this.getOrCreateUserId();
        }

        this.userRef = this.db.ref('activeUsers/' + this.userId);

        await this.userRef.set({
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            looking: this.partnerId ? false : true,
            partnerId: this.partnerId,
            online: true
        });

        // Keep connection alive - update timestamp periodically
        this.keepAliveInterval = setInterval(() => {
            if (this.userRef) {
                this.userRef.update({
                    timestamp: firebase.database.ServerValue.TIMESTAMP,
                    online: true
                });
            }
        }, 30000); // Update every 30 seconds

        // Auto-remove only on actual disconnect (not page navigation)
        this.userRef.onDisconnect().remove();
    }

    listenForPartnerUpdates() {
        // Listen for when OUR user data changes (when someone pairs with us)
        if (!this.userRef) return;

        this.userRef.on('value', async (snapshot) => {
            const userData = snapshot.val();
            if (userData && userData.partnerId && !this.isConnected) {
                // We got paired!
                this.partnerId = userData.partnerId;
                this.storePartnerId(this.partnerId);
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

        // Show disconnection notice with countdown
        const disconnectNotice = document.createElement('div');
        disconnectNotice.className = 'disconnect-notice';
        disconnectNotice.innerHTML = `
            <div style="color: #ff0033; font-weight: bold; margin-bottom: 0.5rem;">⚠️ ENTANGLEMENT SEVERED</div>
            <div style="color: #cccccc; font-size: 0.85rem; margin-bottom: 0.5rem;">${this.partnerId} has left the quantum field.</div>
            <div style="color: #00d4ff; font-size: 0.75rem;" id="reconnectCountdown">Searching for new partner in 3...</div>
        `;

        partnerSection.innerHTML = '';
        partnerSection.appendChild(disconnectNotice);

        // Alert user
        this.playDisconnectSound();

        // Clear stored partner
        this.storePartnerId(null);

        // Reset connection state
        this.isConnected = false;
        const oldPartnerId = this.partnerId;
        this.partnerId = null;

        // Countdown timer
        let countdown = 3;
        const countdownEl = document.getElementById('reconnectCountdown');

        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdownEl) {
                if (countdown > 0) {
                    countdownEl.textContent = `Searching for new partner in ${countdown}...`;
                } else {
                    countdownEl.textContent = 'Scanning quantum field...';
                }
            }
        }, 1000);

        // Start searching again after 3 seconds
        setTimeout(() => {
            clearInterval(countdownInterval);

            // Reset to searching state
            if (partnerSection) {
                partnerSection.innerHTML = `
                    <div class="entanglement-status">
                        <div class="status-label">SEARCHING FOR PARTNER:</div>
                        <div class="searching">Scanning quantum field...</div>
                    </div>
                `;
            }

            this.searchForPartner();
        }, 3000);
    }

    async searchForPartner() {
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
                    this.storePartnerId(this.partnerId);
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
        if (!partnerSection) return;

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

        if (sendBtn) sendBtn.addEventListener('click', () => this.sendChatMessage());
        if (chatInput) chatInput.addEventListener('keypress', (e) => {
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
            this.messageInterval = setInterval(() => {
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
        if (!input) return;
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
            this.showBrowserNotification(text);
        }
    }

    showNewMessageNotification() {
        this.unreadCount++;
        const badge = document.getElementById('unreadBadge');
        if (badge) {
            badge.textContent = this.unreadCount;
            badge.style.display = 'block';
        }

        // Pulse the widget
        const widget = document.getElementById('quantumWidget');
        if (widget) {
            widget.style.animation = 'none';
            setTimeout(() => {
                widget.style.animation = 'pulse-notify 0.5s ease 3';
            }, 10);
        }
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
    cleanupListeners() {
        // Only cleanup listeners, don't remove from database
        if (this.userRef) {
            this.userRef.off();
        }
        if (this.partnerRef && this.partnerDisconnectListener) {
            this.partnerRef.off('value', this.partnerDisconnectListener);
        }
        if (this.messageListener && this.userId && this.partnerId) {
            const pairId = [this.userId, this.partnerId].sort().join('_');
            this.db.ref('messages/' + pairId).off('value', this.messageListener);
        }
        if (this.chatListener && this.userId && this.partnerId) {
            const pairId = [this.userId, this.partnerId].sort().join('_');
            this.db.ref('chat/' + pairId).off('child_added', this.chatListener);
        }
        if (this.keepAliveInterval) {
            clearInterval(this.keepAliveInterval);
        }
        if (this.messageInterval) {
            clearInterval(this.messageInterval);
        }
    }

    cleanup() {
        // Full cleanup - remove from database
        this.cleanupListeners();

        if (this.userRef) {
            this.userRef.remove();
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