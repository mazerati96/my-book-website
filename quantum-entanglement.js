// ============================================
// QUANTUM ENTANGLEMENT - AUTHENTICATION REQUIRED VERSION (with Guest Support)
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
        this.userId = null;
        this.partnerId = this.getStoredPartnerId();
        this.isGuestMode = localStorage.getItem('guestMode') === 'true';

        this.db = null;
        this.userRef = null;
        this.partnerRef = null;

        this.isConnected = false;
        this.currentMessageId = null;

        // store callback references for proper off() cleanup
        this.messageListener = null;
        this.chatListener = null;
        this.partnerDisconnectListener = null;

        this.isMinimized = this.getMinimizedState();
        this.unreadCount = 0;
        this.isClosed = this.getClosedState();

        // Keep refs for off() if we created them
        this.messageRef = null;
        this.chatRef = null;

        // Auth state listener
        this.authUnsubscribe = null;
    }

    // ======================
    // ID helpers
    // ======================
    async getOrCreateUserId() {
        // Check if guest mode
        if (this.isGuestMode) {
            // Create or get guest ID
            let guestId = localStorage.getItem('guestQuantumId');
            if (!guestId) {
                guestId = 'GUEST_' + this.generateRandomId(8);
                localStorage.setItem('guestQuantumId', guestId);
            }
            return guestId;
        }

        // Use Firebase Auth UID if logged in
        const currentUser = firebase.auth().currentUser;
        if (currentUser) {
            return currentUser.uid;
        }

        // If not logged in and not guest, return null
        return null;
    }

    generateRandomId(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    getStoredPartnerId() {
        return localStorage.getItem('quantumPartnerId') || null;
    }

    storePartnerId(partnerId) {
        if (partnerId) {
            localStorage.setItem('quantumPartnerId', partnerId);
        } else {
            localStorage.removeItem('quantumPartnerId');
        }
    }

    // ======================
    // Persisted UI state helpers
    // ======================
    getMinimizedState() {
        return localStorage.getItem('quantumMinimized') === 'true';
    }

    storeMinimizedState(isMinimized) {
        localStorage.setItem('quantumMinimized', isMinimized.toString());
    }

    getClosedState() {
        return localStorage.getItem('quantumClosed') === 'true';
    }

    storeClosedState(isClosed) {
        if (isClosed) {
            localStorage.setItem('quantumClosed', 'true');
        } else {
            localStorage.removeItem('quantumClosed');
        }
    }

    // Get display name (username from auth system or guest ID)
    async getDisplayName(uid) {
        if (!uid) return 'Unknown';

        // Check if it's a guest ID
        if (uid.startsWith('GUEST_')) {
            return uid;
        }

        // Try to get username from auth system
        try {
            if (window.authSystem) {
                const usernameSnapshot = await this.db.ref('usernames').orderByValue().equalTo(uid).once('value');
                const usernames = usernameSnapshot.val();
                if (usernames) {
                    const username = Object.keys(usernames)[0];
                    if (username) return username;
                }
            }
        } catch (e) {
            console.error('Error getting display name:', e);
        }

        // Fallback to shortened UID
        return uid.substring(0, 8).toUpperCase();
    }

    // ======================
    // Initialization
    // ======================
    async initialize() {
        // Ensure Firebase is initialized by firebase-config.js
        if (typeof firebase === 'undefined' || !firebase.apps || !firebase.apps.length) {
            console.error('⚠️ Firebase not initialized. Include firebase-config.js before quantum-entanglement.js');
            return;
        }

        this.db = firebase.database();

        // Always create launch button
        this.createLaunchButton();

        // Check guest mode
        this.isGuestMode = localStorage.getItem('guestMode') === 'true';

        if (this.isGuestMode) {
            // Guest mode - auto setup with guest ID
            console.log('⚛️ Quantum Entanglement: Guest Mode Active');

            // If widget was closed, don't auto-open
            if (this.isClosed) {
                console.log('⚛️ Quantum Entanglement available - Click footer button to launch');
                return;
            }

            // Auto-launch for guest if not closed
            // Give a small delay to let page load
            setTimeout(() => {
                if (!this.isClosed) {
                    this.launchWidget();
                }
            }, 1000);
        } else {
            // Listen for auth state changes (non-guest)
            this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
                if (user) {
                    // User is logged in
                    this.userId = user.uid;

                    // If widget was closed, don't auto-open
                    if (this.isClosed) {
                        console.log('⚛️ Quantum Entanglement available - Click footer button to launch');
                        return;
                    }

                    // Auto-launch if not closed
                    await this.launchWidget();
                } else {
                    // User logged out - cleanup
                    this.userId = null;
                    this.handleLogout();
                }
            });
        }
    }

    handleLogout() {
        // Hide widget if visible
        const widgetEl = document.getElementById('quantumWidget');
        if (widgetEl) {
            widgetEl.style.display = 'none';
        }

        // Cleanup all listeners
        this.cleanupListeners();

        console.log('⚛️ Quantum Entanglement deactivated - Login required');
    }

    createLaunchButton() {
        const footer = document.querySelector('footer');

        const existingBtn = document.getElementById('qeLaunchBtn');
        if (existingBtn) existingBtn.remove();

        const launchBtn = document.createElement('button');
        launchBtn.id = 'qeLaunchBtn';
        launchBtn.className = 'qe-launch-btn';
        launchBtn.innerHTML = '⚛️ QUANTUM ENTANGLEMENT';
        launchBtn.title = 'Launch Quantum Entanglement';

        launchBtn.addEventListener('click', () => this.launchWidget());

        if (footer) {
            footer.appendChild(launchBtn);
            return;
        }

        // fallback floating button
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
        // Check if user is authenticated OR in guest mode
        const currentUser = firebase.auth().currentUser;
        this.isGuestMode = localStorage.getItem('guestMode') === 'true';

        if (!currentUser && !this.isGuestMode) {
            alert('⚛️ Quantum Entanglement requires login or guest mode.\n\nPlease log in, create an account, or continue as guest to connect with other souls across the quantum field.');
            // Redirect to login page if it exists
            if (document.querySelector('a[href*="login"]')) {
                window.location.href = 'login.html';
            }
            return;
        }

        // Get or create user ID (handles both auth and guest)
        this.userId = await this.getOrCreateUserId();

        if (!this.userId) {
            console.error('Failed to get user ID');
            return;
        }

        this.isClosed = false;
        this.storeClosedState(false);

        if (!document.getElementById('quantumWidget')) {
            this.createWidget();

            // Display username
            const displayName = await this.getDisplayName(this.userId);
            const yourIdEl = document.getElementById('yourId');
            if (yourIdEl) yourIdEl.textContent = displayName;

            await this.registerUser();

            if (this.partnerId) {
                await this.reconnectToPartner();
            } else {
                await this.searchForPartner();
            }

            this.listenForPartnerUpdates();
            await this.searchForPartner();


            // Apply minimized state after setup
            if (this.isMinimized) {
                setTimeout(() => this.applyMinimizedState(), 100);
            }
        } else {
            const widgetEl = document.getElementById('quantumWidget');
            if (widgetEl) widgetEl.style.display = 'flex';
        }
    }

    // ======================
    // Widget DOM
    // ======================
    createWidget() {
        if (document.getElementById('quantumWidget')) return;

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
                    <div class="partner-id" id="yourId">Loading...</div>
                </div>
                <div id="partnerSection">
                    <div class="entanglement-status">
                        <div class="status-label">SEARCHING FOR PARTNER:</div>
                        <div class="searching">Scanning quantum field...</div>
                    </div>
                </div>
            </div>
            <div class="minimized-state" id="minimizedState" style="display: none;">
                <div class="quantum-icon-mini">⚛️</div>
                <span id="partnerIdMini">QUANTUM</span>
                <span class="unread-badge" id="unreadBadge" style="display: none;">0</span>
                <button class="maximize-btn" id="maximizeBtn" title="Maximize">▢</button>
            </div>
        `;
        document.body.appendChild(widget);
        this.setupButtonHandlers();

        // Cleanup listeners on beforeunload
        window.addEventListener('beforeunload', () => this.cleanupListeners());
    }

    setupButtonHandlers() {
        const closeBtn = document.getElementById('closeWidget');
        const minimizeBtn = document.getElementById('minimizeBtn');
        const maximizeBtn = document.getElementById('maximizeBtn');
        const minimizedState = document.getElementById('minimizedState');

        if (closeBtn) {
            closeBtn.addEventListener('click', async () => {
                let confirmed = false;

                if (this.isConnected && this.partnerId) {
                    const partnerName = await this.getDisplayName(this.partnerId);
                    confirmed = confirm(`⚠️ WARNING: Closing will sever your quantum entanglement with ${partnerName}.\n\nThe connection will be permanently lost. You can reopen the widget anytime from the footer button.\n\nContinue?`);
                } else {
                    confirmed = confirm(`⚠️ Close Quantum Entanglement?\n\nYou can reopen it anytime from the footer button.`);
                }

                if (!confirmed) return;

                this.isClosed = true;
                this.storeClosedState(true);
                const widgetEl = document.getElementById('quantumWidget');
                if (widgetEl) widgetEl.style.display = 'none';
                this.cleanupListeners();
            });
        }

        if (minimizeBtn) minimizeBtn.addEventListener('click', () => this.toggleMinimize());
        if (maximizeBtn) maximizeBtn.addEventListener('click', (e) => { e.stopPropagation(); this.toggleMinimize(); });
        if (minimizedState) minimizedState.addEventListener('click', (e) => {
            if (!e.target.classList.contains('maximize-btn')) this.toggleMinimize();
        });
    }

    async applyMinimizedState() {
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

        if (this.partnerId) {
            const partnerName = await this.getDisplayName(this.partnerId);
            const partnerMini = document.getElementById('partnerIdMini');
            if (partnerMini) partnerMini.textContent = partnerName;
        }
    }

    async toggleMinimize() {
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
            if (this.partnerId) {
                const partnerName = await this.getDisplayName(this.partnerId);
                const partnerMini = document.getElementById('partnerIdMini');
                if (partnerMini) partnerMini.textContent = partnerName;
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
            this.unreadCount = 0;
            const unreadBadge = document.getElementById('unreadBadge');
            if (unreadBadge) unreadBadge.style.display = 'none';
        }
    }

    // ======================
    // Database registration & listeners
    // ======================
    async registerUser() {
        if (!this.userId) {
            console.error('Cannot register user: No userId');
            return;
        }

        this.userRef = this.db.ref('activeUsers/' + this.userId);

        try {
            await this.userRef.set({
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                looking: this.partnerId ? false : true,
                partnerId: this.partnerId || null,
                online: true,
                isGuest: this.isGuestMode
            });

            this.keepAliveInterval = setInterval(() => {
                if (this.userRef) {
                    this.userRef.update({
                        timestamp: firebase.database.ServerValue.TIMESTAMP,
                        online: true
                    });
                }
            }, 30000);

            // Auto-remove on real disconnect
            this.userRef.onDisconnect().remove();
        } catch (err) {
            console.error('Error registering user:', err);
        }
    }

    listenForPartnerUpdates() {
        if (!this.userRef) return;

        this.userRef.on('value', async (snapshot) => {
            const userData = snapshot.val();
            if (userData && userData.partnerId && !this.isConnected) {
                this.partnerId = userData.partnerId;
                this.storePartnerId(this.partnerId);
                this.isConnected = true;
                await this.showConnectedState();
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
            if (!partnerData) this.showPartnerDisconnected();
        });
    }

    async showPartnerDisconnected() {
        const partnerSection = document.getElementById('partnerSection');
        if (!partnerSection) return;

        const partnerName = await this.getDisplayName(this.partnerId);

        const disconnectNotice = document.createElement('div');
        disconnectNotice.className = 'disconnect-notice';
        disconnectNotice.innerHTML = `
            <div style="color: #ff0033; font-weight: bold; margin-bottom: 0.5rem;">⚠️ ENTANGLEMENT SEVERED</div>
            <div style="color: #cccccc; font-size: 0.85rem; margin-bottom: 0.5rem;">${partnerName} has left the quantum field.</div>
            <div style="color: #00d4ff; font-size: 0.75rem;" id="reconnectCountdown">Searching for new partner in 3...</div>
        `;

        partnerSection.innerHTML = '';
        partnerSection.appendChild(disconnectNotice);

        this.playDisconnectSound();

        this.storePartnerId(null);
        this.isConnected = false;
        this.partnerId = null;

        let countdown = 3;
        const countdownEl = document.getElementById('reconnectCountdown');

        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdownEl) {
                countdownEl.textContent = countdown > 0 ? `Searching for new partner in ${countdown}...` : 'Scanning quantum field...';
            }
        }, 1000);

        setTimeout(() => {
            clearInterval(countdownInterval);
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
        if (!this.userId) return;

        const usersRef = this.db.ref('activeUsers');

        usersRef.once('value', async (snapshot) => {
            const users = snapshot.val();
            if (!users) return;

            for (const otherUserId in users) {
                const otherUserData = users[otherUserId];
                if (otherUserId === this.userId || this.isConnected) continue;

                if (otherUserData.looking && !otherUserData.partnerId) {
                    this.partnerId = otherUserId;
                    this.storePartnerId(this.partnerId);
                    this.isConnected = true;

                    await this.userRef.update({ partnerId: this.partnerId, looking: false });
                    await this.db.ref('activeUsers/' + this.partnerId).update({
                        partnerId: this.userId,
                        looking: false
                    });

                    await this.showConnectedState();
                    this.startSharedMessages();
                    this.startChat();
                    this.monitorPartnerStatus();
                    return;
                }
            }
        });
    }

    async reconnectToPartner() {
        if (!this.partnerId || !this.userId) return;

        // Check if partner still exists in activeUsers
        const partnerSnapshot = await this.db.ref('activeUsers/' + this.partnerId).once('value');
        const partnerData = partnerSnapshot.val();

        if (partnerData && partnerData.partnerId === this.userId) {
            // Partner is still there and still paired with us
            this.isConnected = true;
            await this.showConnectedState();
            this.startSharedMessages();
            this.startChat();
            this.monitorPartnerStatus();
        } else {
            // Partner is gone, clear and search for new
            this.storePartnerId(null);
            this.partnerId = null;
            this.isConnected = false;
            await this.searchForPartner();
        }
    }

    async showConnectedState() {
        this.playConnectionSound();

        const partnerSection = document.getElementById('partnerSection');
        if (!partnerSection) return;

        const partnerName = await this.getDisplayName(this.partnerId);

        partnerSection.innerHTML = `
            <div class="entanglement-status">
                <div class="status-label">ENTANGLED WITH:</div>
                <div class="partner-id">${partnerName}</div>
            </div>
            
            <div class="connection-line">
                <div class="node"></div>
                <div class="connection-wave"></div>
                <div class="node"></div>
            </div>

            <div id="sharedMessage"></div>

            <div class="quantum-chat">
                <div class="chat-header"><span>// QUANTUM CHANNEL</span></div>
                <div class="chat-messages" id="chatMessages"></div>
                <div class="chat-input-wrapper">
                    <input type="text" id="chatInput" placeholder="Type message..." maxlength="100">
                    <button id="sendBtn">></button>
                </div>
            </div>
        `;

        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');

        if (sendBtn) sendBtn.addEventListener('click', () => this.sendChatMessage());
        if (chatInput) chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.sendChatMessage(); });
    }

    // ======================
    // Shared messages channel
    // ======================
    startSharedMessages() {
        if (!this.userId || !this.partnerId) return;

        const pairId = [this.userId, this.partnerId].sort().join('_');
        this.messageRef = this.db.ref('messages/' + pairId);

        const messageCallback = (snapshot) => {
            const data = snapshot.val();
            if (data && data.message) this.displayMessage(data.message, data.messageId);
        };

        this.messageRef.on('value', messageCallback);
        this.messageListener = messageCallback;

        if (this.userId < this.partnerId) {
            this.sendNewMessage(this.messageRef);
            this.messageInterval = setInterval(() => {
                if (this.isConnected) this.sendNewMessage(this.messageRef);
            }, 30000);
        }
    }

    sendNewMessage(messageRef) {
        const message = crypticMessages[Math.floor(Math.random() * crypticMessages.length)];
        const messageId = 'MSG_' + Date.now();

        try {
            messageRef.set({
                message: message,
                messageId: messageId,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });
        } catch (e) {
            console.error('sendNewMessage error:', e);
        }
    }

    displayMessage(message, messageId) {
        if (this.currentMessageId === messageId) return;
        this.currentMessageId = messageId;

        const messageContainer = document.getElementById('sharedMessage');
        if (!messageContainer) return;

        const parts = message.split(': ');
        const text = parts.slice(1).join(': ') || message;
        const id = parts[0] || '';

        messageContainer.innerHTML = `
            <div class="shared-message">
                "${text}"
                <div class="message-id">${id}</div>
            </div>
        `;
        this.playMessageSound();
    }

    // ======================
    // Chat functionality
    // ======================
    startChat() {
        if (!this.userId || !this.partnerId) return;

        const pairId = [this.userId, this.partnerId].sort().join('_');
        this.chatRef = this.db.ref('chat/' + pairId);

        const chatCallback = (snapshot) => {
            const msg = snapshot.val();
            if (!msg) return;
            this.displayChatMessage(msg.userId, msg.text, msg.timestamp);
            if (this.isMinimized && msg.userId !== this.userId) this.showNewMessageNotification();
        };

        this.chatRef.on('child_added', chatCallback);
        this.chatListener = chatCallback;
    }

    async sendChatMessage() {
        const input = document.getElementById('chatInput');
        if (!input) return;
        const text = input.value.trim();
        if (!text || !this.userId || !this.partnerId) return;

        const pairId = [this.userId, this.partnerId].sort().join('_');
        const chatRef = this.db.ref('chat/' + pairId);

        try {
            await chatRef.push({
                userId: this.userId,
                text: text,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });
            input.value = '';
            this.playTypingSound();
        } catch (e) {
            console.error('sendChatMessage error:', e);
        }
    }

    async displayChatMessage(senderId, text, timestamp) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const isMe = senderId === this.userId;
        const senderName = isMe ? 'YOU' : await this.getDisplayName(senderId);

        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${isMe ? 'me' : 'them'}`;

        msgDiv.innerHTML = `
            <div class="msg-sender">${senderName}:</div>
            <div class="msg-text">${this.escapeHtml(text)}</div>
        `;

        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        if (!isMe) {
            this.playMessageSound();
            this.showBrowserNotification(text, senderName);
        }
    }

    showNewMessageNotification() {
        this.unreadCount++;
        const badge = document.getElementById('unreadBadge');
        if (badge) {
            badge.textContent = this.unreadCount;
            badge.style.display = 'block';
        }

        const widget = document.getElementById('quantumWidget');
        if (widget) {
            widget.style.animation = 'none';
            setTimeout(() => { widget.style.animation = 'pulse-notify 0.5s ease 3'; }, 10);
        }
    }

    showBrowserNotification(text, senderName) {
        if (!("Notification" in window)) return;
        if (Notification.permission === "granted") {
            new Notification(`Message from ${senderName}`, { body: text, icon: '⚛️', tag: 'quantum-message' });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification(`Message from ${senderName}`, { body: text, icon: '⚛️' });
                }
            });
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ======================
    // Cleanup
    // ======================
    cleanupListeners() {
        try { if (this.userRef) this.userRef.off(); } catch (e) { /*ignore*/ }
        try { if (this.partnerRef && this.partnerDisconnectListener) this.partnerRef.off('value', this.partnerDisconnectListener); } catch (e) { /*ignore*/ }
        try { if (this.messageRef && this.messageListener) this.messageRef.off('value', this.messageListener); } catch (e) { /*ignore*/ }
        try { if (this.chatRef && this.chatListener) this.chatRef.off('child_added', this.chatListener); } catch (e) { /*ignore*/ }

        if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);
        if (this.messageInterval) clearInterval(this.messageInterval);
    }

    cleanup() {
        this.cleanupListeners();
        if (this.userRef) {
            try { this.userRef.remove(); } catch (e) { /*ignore*/ }
        }
        if (this.authUnsubscribe) {
            this.authUnsubscribe();
        }
    }

    // ======================
    // Sound helpers
    // ======================
    playConnectionSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode); gainNode.connect(audioContext.destination);
            oscillator.frequency.value = 800; oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime); oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) { /*ignore*/ }
    }

    playMessageSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode); gainNode.connect(audioContext.destination);
            oscillator.frequency.value = 600; oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.start(audioContext.currentTime); oscillator.stop(audioContext.currentTime + 0.2);
        } catch (e) { /*ignore*/ }
    }

    playTypingSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode); gainNode.connect(audioContext.destination);
            oscillator.frequency.value = 400; oscillator.type = 'square';
            gainNode.gain.setValueAtTime(0.03, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
            oscillator.start(audioContext.currentTime); oscillator.stop(audioContext.currentTime + 0.05);
        } catch (e) { /*ignore*/ }
    }

    playDisconnectSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode); gainNode.connect(audioContext.destination);
            oscillator.frequency.value = 200; oscillator.type = 'sawtooth';
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime); oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) { /*ignore*/ }
    }
}

// Auto-initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
    if (typeof firebase !== 'undefined') {
        const entanglement = new QuantumEntanglement();
        entanglement.initialize();
        // Expose for pages that want to call it directly
        window.quantumEntanglement = entanglement;
        console.log('%c⚛️ QUANTUM ENTANGLEMENT ACTIVE', 'color: #00d4ff; font-size: 16px; font-weight: bold;');
    } else {
        console.error('Firebase not loaded. Include firebase-config.js before quantum-entanglement.js');
    }
});