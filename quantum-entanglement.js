// ============================================
// QUANTUM ENTANGLEMENT - AUTHENTICATION REQUIRED VERSION (with Guest Support)
// ============================================

// Note: firebase-config.js is the single source of truth for Firebase setup.
// This file assumes firebase is already initialized by firebase-config.js.

const ENTANGLEMENT_TTL = 5 * 60 * 1000; // 5 minutes
const HEARTBEAT_INTERVAL = 30000; // ⭐ CHANGE from 15000 to 30000 (30 seconds)
const DECAY_CHECK_INTERVAL = 5000; // Check decay every 5 seconds

const WARNING_THRESHOLDS = {
    STABLE: 0.7,      // Above 70% strength
    UNSTABLE: 0.4,    // 40-70%
    CRITICAL: 0.15,   // 15-40%
    SEVERED: 0        // Below 15%
};
const INTERFERENCE_CHANCE = 0.03; // 3% chance per check when unstable

const RARE_EVENT_CHANCE = 0.001; // 0.1% chance of cosmic events
const SILENCE_THRESHOLD = 60000; // 1 minute of no messages = silence mechanic




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

        // Decay & warning system
        this.decayCheckInterval = null;
        this.currentWarningStage = null;
        this.connectionStrength = 1.0;

        // Quantum echoes
        this.pendingEchoes = [];

        // Entanglement memory & behavioral tracking
        this.entanglementHistory = this.loadEntanglementHistory();
        this.lastMessageTime = Date.now();
        this.messagesExchanged = 0;
        this.connectionStartTime = null;
        this.behaviorPatterns = {
            quickDisconnects: 0,
            longSessions: 0,
            silentConnections: 0
        };
        this.displayedMessageIds = new Set(); // Track displayed messages

    }
    //TIMER FOR HEARTBEAT ENTANGLEMENT
    startEntanglementHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.isConnected && this.userRef) {
                this.userRef.update({
                    onlineTimestamp: firebase.database.ServerValue.TIMESTAMP // ⭐ CHANGED from lastActive
                });
            }
        }, HEARTBEAT_INTERVAL);
    }

    monitorEntanglementDecay() {
        // Start continuous decay monitoring
        this.decayCheckInterval = setInterval(() => {
            this.checkConnectionDecay();
        }, DECAY_CHECK_INTERVAL);
    }

    async checkConnectionDecay() {
        if (!this.isConnected || !this.userRef) return;

        const snap = await this.userRef.once('value');
        const data = snap.val();
        if (!data || !data.lastActive) return;

        const age = Date.now() - data.lastActive;

        // Calculate connection strength (1.0 = fresh, 0.0 = expired)
        this.connectionStrength = Math.max(0, 1 - (age / ENTANGLEMENT_TTL));

        // Update visuals based on strength
        this.updateConnectionVisuals(this.connectionStrength);

        // Check for stage transitions
        this.updateWarningStage(this.connectionStrength);

        // Random interference when unstable
        if (this.connectionStrength < WARNING_THRESHOLDS.UNSTABLE) {
            this.maybeTrigerInterference();
        }

        // Check silence mechanic
        this.checkSilenceMechanic();

        // Rare cosmic events
        this.checkForRareEvents();

        // Sever if expired
        if (age > ENTANGLEMENT_TTL) {
            await this.severEntanglement();
        }
    }


    updateConnectionVisuals(strength) {
        const line = document.querySelector('.connection-line');
        if (!line) {
            console.warn('⚠️ .connection-line not found!');
            return;
        }

        // ⭐ FIXED: Remove all decay classes first
        line.classList.remove('decay-critical', 'decay-unstable', 'decay-weakening');

        // ⭐ FIXED: Determine state and use data attributes instead of inline styles
        let state = 'stable';
        let stage = 'STABLE';

        if (strength < WARNING_THRESHOLDS.CRITICAL) {
            state = 'critical';
            stage = 'CRITICAL';
            line.classList.add('decay-critical');
        } else if (strength < WARNING_THRESHOLDS.UNSTABLE) {
            state = 'unstable';
            stage = 'UNSTABLE';
            line.classList.add('decay-unstable');
        } else if (strength < WARNING_THRESHOLDS.STABLE) {
            state = 'weakening';
            stage = 'WEAKENING';
            line.classList.add('decay-weakening');
        }

        // ⭐ FIXED: Update nodes using data attributes (CSS handles the rest)
        const nodes = document.querySelectorAll('.node');
        console.log(`📍 Found ${nodes.length} nodes - Setting state: ${state}`);
        nodes.forEach(node => {
            node.setAttribute('data-state', state);
        });

        // ⭐ FIXED: Update wave using data attributes
        const wave = line.querySelector('.connection-wave');
        if (wave) {
            wave.setAttribute('data-state', state);
            console.log(`🌊 Wave state set to: ${state}`);
        }

        // Opacity fade based on strength
        line.style.opacity = Math.max(0.3, strength);

        // Jitter when critical
        if (strength < WARNING_THRESHOLDS.CRITICAL) {
            line.style.transform = `translateY(${Math.random() * 2 - 1}px)`;
        } else {
            line.style.transform = 'translateY(0)';
        }

        console.log(`🔗 Connection strength: ${(strength * 100).toFixed(1)}% - ${stage} - State: ${state}`);
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

    async severEntanglement() {
        if (!this.userId) return;

        try {
            // Clear partner on both sides
            if (this.partnerId) {
                const partnerRef = this.db.ref('activeUsers/' + this.partnerId);
                await partnerRef.update({
                    partnerId: null,
                    looking: true
                });
            }

            // Remove self from activeUsers
            if (this.userRef) {
                await this.userRef.remove();
            }

            // Local cleanup
            this.storePartnerId(null);
            this.partnerId = null;
            this.isConnected = false;

            this.cleanupListeners();

            // Record this entanglement
            this.recordEntanglement();

            // Release quantum echoes
            this.releaseEchoes();

            console.log('⚛️ Entanglement severed');

        } catch (err) {
            console.error('Error severing entanglement:', err);
        }
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
        // CRITICAL FIX: Initialize userRef BEFORE calling registerUser
        this.userRef = this.db.ref('activeUsers/' + this.userId);


        if (!document.getElementById('quantumWidget')) {
            this.createWidget();

            // Display username
            const displayName = await this.getDisplayName(this.userId);
            const yourIdEl = document.getElementById('yourId');
            if (yourIdEl) yourIdEl.textContent = displayName;



            await this.registerUser();

            // ALWAYS listen first
            this.listenForPartnerUpdates();

            // THEN decide what to do
            if (this.partnerId) {
                await this.reconnectToPartner();
            } else {
                await this.searchForPartner();
            }




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
                        <div class="status-label">LISTENING FOR PRESENCE:</div>
                        <div class="searching">Listening for another presence...</div>
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
                    confirmed = confirm(`⚠️ WARNING: Closing will sever your quantum entanglement with ${partnerName}.\n\nContinue?`);
                } else {
                    confirmed = confirm(`⚠️ Close Quantum Entanglement?`);
                }

                if (!confirmed) return;

                this.isClosed = true;
                this.storeClosedState(true);

                await this.severEntanglement();

                const widgetEl = document.getElementById('quantumWidget');
                if (widgetEl) widgetEl.style.display = 'none';
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
        await this.userRef.set({
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            //lastActive: firebase.database.ServerValue.TIMESTAMP, // ⭐ Keep this, but rmv'd temporarily to test QE widget
            onlineTimestamp: firebase.database.ServerValue.TIMESTAMP, // ⭐ ADD this
            looking: this.partnerId ? false : true,
            partnerId: this.partnerId || null,
            entangled: !!this.partnerId,
            online: true,
            isGuest: this.isGuestMode
        });

        this.keepAliveInterval = setInterval(() => {
            if (this.userRef) {
                this.userRef.update({
                    timestamp: firebase.database.ServerValue.TIMESTAMP,

                    onlineTimestamp: firebase.database.ServerValue.TIMESTAMP, // ⭐ ADD this
                    online: true
                });
            }
        }, 30000);

        // Auto-remove on real disconnect
        this.userRef.onDisconnect().remove();
    }

    listenForPartnerUpdates() {
        if (!this.userRef) return;

        this.userRef.on('value', async (snapshot) => {
            const userData = snapshot.val();

            // Only trigger if we have a partner AND we're not already connected
            if (userData && userData.partnerId && !this.isConnected) {
                console.log('📡 Partner detected via listener:', userData.partnerId);

                this.partnerId = userData.partnerId;
                this.storePartnerId(this.partnerId);
                this.isConnected = true;

                // Clean up search if it's still running
                if (this.searchRef && this.searchCallback) {
                    this.searchRef.off('value', this.searchCallback);
                }

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
                countdownEl.textContent = countdown > 0 ? `Searching for new partner in ${countdown}...` : 'Listening for another presence...';
            }
        }, 1000);

        setTimeout(() => {
            clearInterval(countdownInterval);
            if (partnerSection) {
                partnerSection.innerHTML = `
                    <div class="entanglement-status">
                        <div class="status-label">LISTENING FOR PRESENCE:</div>
                        <div class="searching">Listening for another presence...</div>
                    </div>
                `;
            }
            this.searchForPartner();
        }, 3000);
    }

    async searchForPartner() {
        if (this.isConnected || this.partnerId) return;
        if (!this.userId) return;

        const usersRef = this.db.ref('activeUsers');

        // Use .on() instead of .once() to continuously monitor for new users
        const searchCallback = async (snapshot) => {
            // Don't search if we're already connected
            if (this.isConnected || this.partnerId) {
                // Clean up the listener once connected
                usersRef.off('value', searchCallback);
                return;
            }

            const users = snapshot.val();
            if (!users) return;

            for (const otherUserId in users) {
                const otherUserData = users[otherUserId];

                // Skip self and stop if we already connected
                if (otherUserId === this.userId || this.isConnected) continue;

                // Check if this user is available
                if (otherUserData.looking && !otherUserData.partnerId) {
                    console.log('🔍 Found potential partner:', otherUserId);

                    // Use transaction to prevent race conditions
                    const success = await this.attemptEntanglement(otherUserId);

                    if (success) {
                        // Clean up the search listener
                        usersRef.off('value', searchCallback);

                        // Let listenForPartnerUpdates handle the connection setup
                        // Don't call showConnectedState here to avoid duplicates
                        console.log('✅ Entanglement claimed successfully');
                        return;
                    }
                }
            }
        };

        // Start listening
        usersRef.on('value', searchCallback);

        // Store reference for cleanup
        this.searchCallback = searchCallback;
        this.searchRef = usersRef;
    }

    async attemptEntanglement(otherUserId) {
        if (this.isConnected || this.partnerId) return false;

        const otherRef = this.db.ref('activeUsers/' + otherUserId);

        const result = await otherRef.transaction(current => {
            if (!current) return; // User doesn't exist
            if (!current.looking || current.partnerId) return; // Already taken

            // CLAIM this partner
            current.partnerId = this.userId;
            current.looking = false;
            current.entangledAt = firebase.database.ServerValue.TIMESTAMP;
            return current;
        });

        if (!result.committed) {
            console.log('❌ Failed to claim partner (already taken)');
            return false;
        }

        // Successfully claimed! Now update self
        await this.userRef.update({
            partnerId: otherUserId,
            looking: false,
            entangledAt: firebase.database.ServerValue.TIMESTAMP
        });

        this.partnerId = otherUserId;
        this.storePartnerId(otherUserId);
        this.isConnected = true;

        console.log('✅ Entanglement successful with:', otherUserId);
        return true;
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
        this.connectionStartTime = Date.now();
        this.messagesExchanged = 0;
        this.lastMessageTime = Date.now();

        this.startEntanglementHeartbeat();

        this.monitorEntanglementDecay();
        this.prepareEchoes();
        // Check if reconnection
        if (this.hasEntangledBefore(this.partnerId)) {
            setTimeout(() => {
                this.displayEcho(this.getReconnectionMessage());
            }, 2000);
        }

        // Show behavioral acknowledgment
        setTimeout(() => {
            this.showBehavioralAcknowledgment();
        }, 5000);

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
        this.syncLineToActivity();
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        // ⭐ CREATE UNIQUE ID FOR THIS MESSAGE
        const messageId = `${senderId}_${timestamp}_${text.substring(0, 20)}`;

        // ⭐ CHECK IF ALREADY DISPLAYED
        if (this.displayedMessageIds.has(messageId)) {
            console.log('🚫 Duplicate message blocked:', messageId);
            return;
        }

        // ⭐ MARK AS DISPLAYED
        this.displayedMessageIds.add(messageId);

        const isMe = senderId === this.userId;
        const senderName = isMe ? 'YOU' : await this.getDisplayName(senderId);

        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${isMe ? 'me' : 'them'}`;
        msgDiv.dataset.messageId = messageId;

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
    // Entanglement Memory
    // ======================
    loadEntanglementHistory() {
        const stored = localStorage.getItem('quantumEntanglementHistory');
        if (!stored) return [];
        try {
            return JSON.parse(stored);
        } catch (e) {
            return [];
        }
    }

    saveEntanglementHistory() {
        try {
            localStorage.setItem('quantumEntanglementHistory', JSON.stringify(this.entanglementHistory));
        } catch (e) {
            // Storage full, trim old entries
            this.entanglementHistory = this.entanglementHistory.slice(-10);
            localStorage.setItem('quantumEntanglementHistory', JSON.stringify(this.entanglementHistory));
        }
    }

    recordEntanglement() {
        if (!this.partnerId) return;

        const duration = Date.now() - (this.connectionStartTime || Date.now());
        const wasSilent = this.messagesExchanged < 3;

        // Check if we've been entangled before
        const previousConnection = this.entanglementHistory.find(e => e.partnerId === this.partnerId);

        this.entanglementHistory.push({
            partnerId: this.partnerId,
            timestamp: Date.now(),
            duration: duration,
            messagesExchanged: this.messagesExchanged,
            wasSilent: wasSilent,
            reconnection: !!previousConnection
        });

        // Track behavior patterns
        if (duration < 30000) {
            this.behaviorPatterns.quickDisconnects++;
        } else if (duration > 180000) {
            this.behaviorPatterns.longSessions++;
        }

        if (wasSilent) {
            this.behaviorPatterns.silentConnections++;
        }

        this.saveEntanglementHistory();
    }

    hasEntangledBefore(partnerId) {
        return this.entanglementHistory.some(e => e.partnerId === partnerId);
    }

    getReconnectionMessage() {
        const messages = [
            "You have been entangled before.",
            "This presence is familiar.",
            "The pattern recognizes you.",
            "An echo of a previous connection.",
            "The quantum field remembers."
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    // ======================
    // Silence Mechanic
    // ======================
    checkSilenceMechanic() {
        const silenceDuration = Date.now() - this.lastMessageTime;

        if (silenceDuration > SILENCE_THRESHOLD) {
            const silenceStrength = Math.min(1, silenceDuration / (SILENCE_THRESHOLD * 3));
            this.applySilenceEffects(silenceStrength);
        }
    }

    applySilenceEffects(strength) {
        // Distort shared messages during silence
        const messageEl = document.getElementById('sharedMessage');
        if (messageEl && messageEl.textContent && strength > 0.3) {
            messageEl.style.opacity = Math.max(0.5, 1 - strength * 0.5);
            messageEl.style.filter = `blur(${strength * 2}px)`;
        }

        // Add silence indicator
        if (strength > 0.6) {
            this.showSilenceWarning(strength);
        }
    }

    showSilenceWarning(strength) {
        const partnerSection = document.getElementById('partnerSection');
        if (!partnerSection) return;

        const existing = partnerSection.querySelector('.silence-warning');
        if (existing) return; // Already showing

        const warning = document.createElement('div');
        warning.className = 'silence-warning';
        warning.innerHTML = `
            <div style="color: #666; font-size: 0.8rem; font-style: italic; padding: 8px; text-align: center;">
                The silence grows heavier...
            </div>
        `;

        const statusDiv = partnerSection.querySelector('.entanglement-status');
        if (statusDiv) {
            statusDiv.after(warning);

            // Remove after activity resumes
            setTimeout(() => warning.remove(), 5000);
        }
    }

    // ======================
    // Rare Cosmic Events
    // ======================
    checkForRareEvents() {
        if (Math.random() > RARE_EVENT_CHANCE) return;

        this.triggerCosmicEvent();
    }

    triggerCosmicEvent() {
        const events = [
            {
                name: 'Solar Interference',
                message: 'Solar interference detected. Signal unstable.',
                effect: 'flicker'
            },
            {
                name: 'Background Radiation Spike',
                message: 'Background radiation spike. Transmission quality degraded.',
                effect: 'static'
            },
            {
                name: 'Unknown Observer',
                message: 'Unknown observer presence detected in quantum field.',
                effect: 'distort'
            },
            {
                name: 'Gravitational Anomaly',
                message: 'Gravitational anomaly. Time dilation effects possible.',
                effect: 'slow'
            }
        ];

        const event = events[Math.floor(Math.random() * events.length)];

        console.log(`🌌 COSMIC EVENT: ${event.name}`);
        this.displayCosmicEvent(event);
        this.applyCosmicEffect(event.effect);
    }

    displayCosmicEvent(event) {
        const widget = document.getElementById('quantumWidget');
        if (!widget) return;

        const alert = document.createElement('div');
        alert.className = 'cosmic-event-alert';
        alert.innerHTML = `
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.9);
                border: 1px solid #00d4ff;
                padding: 20px;
                border-radius: 8px;
                color: #00d4ff;
                font-size: 0.9rem;
                text-align: center;
                z-index: 10000;
                animation: cosmic-fade-in 1s;
            ">
                <div style="font-weight: bold; margin-bottom: 8px;">⚠️ ${event.name.toUpperCase()}</div>
                <div style="opacity: 0.8;">${event.message}</div>
            </div>
        `;

        widget.appendChild(alert);

        setTimeout(() => {
            alert.style.animation = 'cosmic-fade-out 1s';
            setTimeout(() => alert.remove(), 1000);
        }, 4000);
    }

    applyCosmicEffect(effect) {
        const line = document.querySelector('.connection-line');
        if (!line) return;

        switch (effect) {
            case 'flicker':
                line.style.animation = 'flicker-effect 0.5s 5';
                break;
            case 'static':
                this.triggerInterference();
                break;
            case 'distort':
                line.style.filter = 'hue-rotate(90deg)';
                setTimeout(() => line.style.filter = '', 3000);
                break;
            case 'slow':
                line.style.animationDuration = '8s';
                setTimeout(() => line.style.animationDuration = '', 3000);
                break;
        }
    }

    // ======================
    // Behavioral Awareness
    // ======================
    getBehavioralMessage() {
        const { quickDisconnects, longSessions, silentConnections } = this.behaviorPatterns;

        // System notices patterns
        if (quickDisconnects > 5) {
            return "You hesitate to maintain connections.";
        }

        if (longSessions > 3) {
            return "You find comfort in sustained entanglement.";
        }

        if (silentConnections > 5) {
            return "Presence without words. An unusual pattern.";
        }

        if (this.entanglementHistory.length > 10) {
            return "The quantum field knows you well.";
        }

        return null;
    }

    showBehavioralAcknowledgment() {
        const message = this.getBehavioralMessage();
        if (!message) return;

        // 10% chance to show
        if (Math.random() > 0.1) return;

        const messageEl = document.getElementById('sharedMessage');
        if (!messageEl) return;

        const ack = document.createElement('div');
        ack.className = 'behavioral-acknowledgment';
        ack.innerHTML = `
            <div style="
                padding: 12px;
                margin: 8px 0;
                background: rgba(100, 100, 100, 0.1);
                border-left: 3px solid #666;
                color: #888;
                font-size: 0.85rem;
                font-style: italic;
            ">
                ${message}
            </div>
        `;

        messageEl.appendChild(ack);

        setTimeout(() => {
            ack.style.animation = 'fade-out 2s';
            setTimeout(() => ack.remove(), 2000);
        }, 8000);
    }

    // ======================
    // Quantum Echoes
    // ======================
    prepareEchoes() {
        // Create echoes when connection is established
        if (!this.partnerId) return;

        const echoMessages = [
            'The entanglement persists in memory...',
            'Quantum residue detected in the field...',
            'They felt it too.',
            'Distance is an illusion. Connection is eternal.',
            'The signal fades, but the pattern remains.',
            'You were never truly alone.',
            'Something lingers in the space between.'
        ];

        const echo = echoMessages[Math.floor(Math.random() * echoMessages.length)];

        this.pendingEchoes.push({
            message: echo,
            delay: 3000 + Math.random() * 7000
        });
    }

    releaseEchoes() {
        if (this.pendingEchoes.length === 0) return;

        this.pendingEchoes.forEach(echo => {
            setTimeout(() => {
                this.displayEcho(echo.message);
            }, echo.delay);
        });

        this.pendingEchoes = [];
    }

    displayEcho(message) {
        const messageEl = document.getElementById('sharedMessage');
        if (!messageEl) return;

        const echo = document.createElement('div');
        echo.className = 'quantum-echo';
        echo.innerHTML = `
            <div class="echo-indicator">◇ RESIDUAL SIGNAL DETECTED ◇</div>
            <div class="echo-message">${message}</div>
        `;

        echo.style.cssText = `
            padding: 12px;
            margin: 8px 0;
            background: rgba(0, 212, 255, 0.05);
            border: 1px solid rgba(0, 212, 255, 0.2);
            border-radius: 4px;
            color: #00d4ff;
            font-style: italic;
            opacity: 0;
            animation: echo-fade-in 2s forwards;
        `;

        messageEl.appendChild(echo);

        this.playEchoSound();

        setTimeout(() => {
            echo.style.animation = 'echo-fade-out 2s forwards';
            setTimeout(() => echo.remove(), 2000);
        }, 10000);
    }

    playEchoSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.03, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 2);
        } catch (e) { /* ignore */ }
    }

    // ======================
    // Signal Interference
    // ======================
    maybeTrigerInterference() {
        if (Math.random() > INTERFERENCE_CHANCE) return;
        this.triggerInterference();
    }

    triggerInterference() {
        const duration = 1000 + Math.random() * 2000;

        this.showInterferenceVisual(duration);
        this.playInterferenceSound();
        this.distortSharedMessage(duration);
        this.addChatLag(duration);
    }

    showInterferenceVisual(duration) {
        const line = document.querySelector('.connection-line');
        if (!line) return;

        line.classList.add('interference-active');

        const staticEl = document.createElement('div');
        staticEl.className = 'quantum-static';
        staticEl.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(255,255,255,0.03) 2px,
                rgba(255,255,255,0.03) 4px
            );
            animation: static-noise 0.1s infinite;
            pointer-events: none;
            z-index: 1000;
        `;

        const partnerSection = document.getElementById('partnerSection');
        if (partnerSection) {
            partnerSection.style.position = 'relative';
            partnerSection.appendChild(staticEl);
        }

        setTimeout(() => {
            line.classList.remove('interference-active');
            if (staticEl.parentNode) staticEl.remove();
        }, duration);
    }

    playInterferenceSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const bufferSize = 4096;
            const whiteNoise = audioContext.createScriptProcessor(bufferSize, 1, 1);
            const gainNode = audioContext.createGain();

            whiteNoise.onaudioprocess = (e) => {
                const output = e.outputBuffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    output[i] = Math.random() * 2 - 1;
                }
            };

            gainNode.gain.value = 0.02;
            whiteNoise.connect(gainNode);
            gainNode.connect(audioContext.destination);

            setTimeout(() => {
                whiteNoise.disconnect();
                gainNode.disconnect();
            }, 200);
        } catch (e) { /* ignore */ }
    }

    distortSharedMessage(duration) {
        const messageEl = document.getElementById('sharedMessage');
        if (!messageEl || !messageEl.textContent) return;

        const original = messageEl.innerHTML;
        const distorted = this.corruptText(messageEl.textContent);

        messageEl.innerHTML = `<div class="corrupted-message">${distorted}</div>`;

        setTimeout(() => {
            messageEl.innerHTML = original;
        }, duration);
    }

    corruptText(text) {
        const glitchChars = ['█', '▓', '▒', '░', '◆', '◇', '○', '●', '□', '■'];
        let result = '';

        for (let i = 0; i < text.length; i++) {
            if (Math.random() < 0.15) {
                result += glitchChars[Math.floor(Math.random() * glitchChars.length)];
            } else {
                result += text[i];
            }
        }

        return result;
    }

    addChatLag(duration) {
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');

        if (chatInput) {
            chatInput.disabled = true;
            chatInput.placeholder = 'Signal degraded...';
        }
        if (sendBtn) sendBtn.disabled = true;

        setTimeout(() => {
            if (chatInput) {
                chatInput.disabled = false;
                chatInput.placeholder = 'Type message...';
            }
            if (sendBtn) sendBtn.disabled = false;
        }, duration);
    }

    // ======================
    // Multi-Stage Warning System
    // ======================
    updateWarningStage(strength) {
        let newStage = null;

        if (strength >= WARNING_THRESHOLDS.STABLE) {
            newStage = 'STABLE';
        } else if (strength >= WARNING_THRESHOLDS.UNSTABLE) {
            newStage = 'UNSTABLE';
        } else if (strength >= WARNING_THRESHOLDS.CRITICAL) {
            newStage = 'CRITICAL';
        } else {
            newStage = 'SEVERED';
        }

        if (newStage !== this.currentWarningStage && newStage !== 'STABLE') {
            this.currentWarningStage = newStage;
            this.showWarning(newStage, strength);
        }
    }

    showWarning(stage, strength) {
        const partnerSection = document.getElementById('partnerSection');
        if (!partnerSection) return;

        const existing = partnerSection.querySelector('.quantum-warning');
        if (existing) existing.remove();

        const warning = document.createElement('div');
        warning.className = `quantum-warning warning-${stage.toLowerCase()}`;

        let message = '';
        let icon = '';

        switch (stage) {
            case 'UNSTABLE':
                icon = '⚠️';
                message = 'Signal fluctuating...';
                this.playWarningSound(600);
                break;
            case 'CRITICAL':
                icon = '🔴';
                message = 'Quantum coherence weakening';
                this.playWarningSound(400);
                break;
            case 'SEVERED':
                icon = '💀';
                message = 'Entanglement collapse imminent';
                this.playWarningSound(200);
                break;
        }

        warning.innerHTML = `
            <div class="warning-content">
                <span class="warning-icon">${icon}</span>
                <span class="warning-text">${message}</span>
                <span class="warning-strength">${Math.round(strength * 100)}%</span>
            </div>
        `;

        warning.style.cssText = `
            padding: 8px 12px;
            margin: 8px 0;
            border-radius: 4px;
            background: rgba(255, 0, 0, 0.1);
            border: 1px solid rgba(255, 0, 0, 0.3);
            color: #ff6666;
            font-size: 0.85rem;
            text-align: center;
            animation: pulse-warning 1s infinite;
        `;

        const statusDiv = partnerSection.querySelector('.entanglement-status');
        if (statusDiv) {
            statusDiv.after(warning);
        }
    }

    playWarningSound(frequency) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.frequency.value = frequency;
            oscillator.type = 'triangle';
            gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.15);
        } catch (e) { /* ignore */ }
    }

    syncLineToActivity() {
        const line = document.querySelector('.connection-line');
        if (!line) return;

        // Pulse on message
        line.style.animation = 'none';
        setTimeout(() => {
            line.style.animation = '';
        }, 10);

        // Track message time
        this.lastMessageTime = Date.now();
        this.messagesExchanged++;

        // ⭐ UPDATE LASTACTIVE ON REAL USER INTERACTION
        if (this.userRef && this.isConnected) {
            this.userRef.update({
                lastActive: firebase.database.ServerValue.TIMESTAMP
            }).catch(e => console.error('Failed to update lastActive:', e));
        }

        // ⭐ IMMEDIATELY RESET CONNECTION STRENGTH VISUALLY
        this.connectionStrength = 1.0;
        this.currentWarningStage = null;

        // ⭐ FORCE CLEAR ALL DECAY EFFECTS
        if (line) {
            line.style.opacity = '1';
            line.style.transform = 'translateY(0)';
            line.classList.remove('decay-critical', 'decay-unstable', 'decay-weakening');
        }

        // ⭐ RESTORE COLORS TO BLUE - Use setProperty
        const nodes = document.querySelectorAll('.node');
        nodes.forEach(node => {
            node.style.setProperty('background', '#00d4ff', 'important');
            node.style.setProperty('box-shadow', '0 0 10px #00d4ff', 'important');
            node.style.setProperty('animation', 'nodePulse 2s infinite', 'important'); // Restore animation
        });

        const wave = line.querySelector('.connection-wave');
        if (wave) {
            wave.style.setProperty('background', '#00d4ff', 'important');
            wave.style.setProperty('box-shadow', '0 0 10px #00d4ff', 'important');
        }

        // Now update with full strength
        this.updateConnectionVisuals(1.0);

        // Remove any decay warnings
        const decayWarning = document.querySelector('.decay-warning');
        if (decayWarning) decayWarning.remove();

        console.log('✅ Activity detected - connection refreshed to 100%');
    }


    // ======================
    // Cleanup
    // ======================
    cleanupListeners() {
        try { if (this.userRef) this.userRef.off(); } catch (e) { /*ignore*/ }
        try { if (this.partnerRef && this.partnerDisconnectListener) this.partnerRef.off('value', this.partnerDisconnectListener); } catch (e) { /*ignore*/ }
        try { if (this.messageRef && this.messageListener) this.messageRef.off('value', this.messageListener); } catch (e) { /*ignore*/ }
        try { if (this.chatRef && this.chatListener) this.chatRef.off('child_added', this.chatListener); } catch (e) { /*ignore*/ }

        // ADD THIS: Clean up search listener
        try { if (this.searchRef && this.searchCallback) this.searchRef.off('value', this.searchCallback); } catch (e) { /*ignore*/ }

        if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);
        if (this.messageInterval) clearInterval(this.messageInterval);
        if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
        if (this.decayCheckInterval) clearInterval(this.decayCheckInterval);

        this.currentWarningStage = null;
        this.connectionStrength = 1.0;
        // ⭐ CLEAR MESSAGE TRACKING
        //this.displayedMessageIds.clear(); commented out for now to preserve message history across connections

        if (this.displayedMessageIds) {
            this.displayedMessageIds.clear();
        }


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


// Add dynamic CSS for quantum effects
const quantumStyles = document.createElement('style');
quantumStyles.textContent = `
    @keyframes pulse-warning {
        0%, 100% { opacity: 0.8; }
        50% { opacity: 1; transform: scale(1.02); }
    }
    
    @keyframes static-noise {
        0% { transform: translateY(0); }
        100% { transform: translateY(-10px); }
    }
    
    @keyframes echo-fade-in {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 0.7; transform: translateY(0); }
    }
    
    @keyframes echo-fade-out {
        from { opacity: 0.7; }
        to { opacity: 0; transform: translateY(-10px); }
    }
    
    .connection-line.interference-active {
        animation: glitch 0.3s infinite !important;
    }
    
    @keyframes glitch {
        0% { transform: translateX(0); }
        25% { transform: translateX(-2px); }
        50% { transform: translateX(2px); }
        75% { transform: translateX(-1px); }
        100% { transform: translateX(0); }
    }
    
    .corrupted-message {
        font-family: monospace;
        letter-spacing: 2px;
        color: #ff3366;
        text-shadow: 2px 0 #00d4ff, -2px 0 #ff00ff;
        animation: glitch-text 0.3s infinite;
    }
    
    @keyframes glitch-text {
        0% { transform: skew(0deg); }
        25% { transform: skew(2deg); }
        50% { transform: skew(-2deg); }
        75% { transform: skew(1deg); }
        100% { transform: skew(0deg); }
    }
    
    .echo-indicator {
        font-size: 0.75rem;
        margin-bottom: 4px;
        opacity: 0.6;
        letter-spacing: 2px;
    }
    
    .echo-message {
        font-size: 0.9rem;
        line-height: 1.4;
    }

    
    @keyframes cosmic-fade-in {
        from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    
    @keyframes cosmic-fade-out {
        from { opacity: 1; }
        to { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    }
    
    @keyframes flicker-effect {
        0%, 100% { opacity: 1; }
        25% { opacity: 0.3; }
        50% { opacity: 0.8; }
        75% { opacity: 0.5; }
    }
    
    @keyframes fade-out {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(quantumStyles);

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