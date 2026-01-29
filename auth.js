// ============================================
// FIREBASE AUTHENTICATION SYSTEM WITH ADMIN SUPPORT
// ============================================

(function () {
    // Prevent double-initialization
    if (typeof window !== 'undefined' && window.authSystem) {
        console.log('🔐 authSystem already initialized — skipping auth.js re-execution');
        return;
    }

    // Ensure firebase is available
    if (typeof firebase === 'undefined' || !firebase.apps || !firebase.apps.length) {
        throw new Error('❌ Firebase not initialized! Include firebase-config.js before auth.js');
    }

    const auth = firebase.auth();
    const db = firebase.database();

    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => {
            console.log('✅ Firebase auth persistence enabled');
        })
        .catch((error) => {
            console.error('❌ Failed to set auth persistence:', error);
        });

    // ADMIN CONFIGURATION
    const ADMIN_USERNAMES = ['Amaro', 'Matthew'];
    const RESERVED_USERNAMES = [...ADMIN_USERNAMES]; // Usernames that cannot be taken by regular users

    // ============================================
    // AUTH STATE MANAGEMENT
    // ============================================

    class AuthSystem {
        constructor() {
            this.currentUser = null;
            this.userProfile = null;
            this.authStateListeners = [];
            this.isAdmin = false;
        }

        // Initialize auth system
        init() {
            auth.onAuthStateChanged(async (user) => {
                if (user) {
                    this.currentUser = user;
                    await this.loadUserProfile(user.uid);

                    // Check admin status
                    this.isAdmin = this.userProfile && ADMIN_USERNAMES.includes(this.userProfile.username);

                    if (this.isAdmin) {
                        console.log('🛡️ Admin access granted:', this.userProfile.username);
                    }
                } else {
                    this.currentUser = null;
                    this.userProfile = null;
                    this.isAdmin = false;
                }
                this.authStateListeners.forEach(callback => callback(user));
            });
            console.log('🔐 Auth system initialized');
        }

        onAuthStateChange(callback) {
            this.authStateListeners.push(callback);
        }

        async loadUserProfile(uid) {
            try {
                const snapshot = await db.ref('users/' + uid).once('value');
                this.userProfile = snapshot.val();

                if (window.location.pathname.includes('profile.html')) {
                    this.updateProfileUI();
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            }
        }

        // ============================================
        // ADMIN METHODS
        // ============================================

        isAdminUser() {
            return this.isAdmin;
        }

        getAdminStatus() {
            return {
                isAdmin: this.isAdmin,
                username: this.userProfile?.username || null,
                canModerate: this.isAdmin,
                canManageBlog: this.isAdmin
            };
        }

        // Generate Firebase custom token for blog API authentication
        async getFirebaseToken() {
            if (!this.currentUser) return null;
            try {
                return await this.currentUser.getIdToken();
            } catch (error) {
                console.error('Error getting Firebase token:', error);
                return null;
            }
        }

        // ============================================
        // EMAIL/PASSWORD AUTHENTICATION
        // ============================================

        async signUpWithEmail(email, password, username) {
            try {
                const usernameValid = await this.validateUsername(username);
                if (!usernameValid.isValid) {
                    throw new Error(usernameValid.error);
                }

                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;

                // Check if this is an admin account
                const isAdminAccount = ADMIN_USERNAMES.includes(username);

                await db.ref('users/' + user.uid).set({
                    username: username,
                    email: email,
                    createdAt: firebase.database.ServerValue.TIMESTAMP,
                    accountType: 'email',
                    isAdmin: isAdminAccount,
                    memoryFragments: [],
                    signalProgress: 0,
                    riddlesSolved: []
                });

                await db.ref('usernames/' + username.toLowerCase()).set(user.uid);

                if (isAdminAccount) {
                    console.log('🛡️ Admin account created:', username);
                } else {
                    console.log('✅ Account created:', username);
                }

                return { success: true, user };

            } catch (error) {
                console.error('Signup error:', error);
                return { success: false, error: this.getErrorMessage(error) };
            }
        }

        async signInWithEmail(email, password) {
            try {
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                console.log('✅ Signed in:', userCredential.user.email);
                return { success: true, user: userCredential.user };
            } catch (error) {
                console.error('Login error:', error);
                return { success: false, error: this.getErrorMessage(error) };
            }
        }

        // ============================================
        // USERNAME/PASSWORD LOGIN
        // ============================================

        async signInWithUsername(username, password) {
            try {
                console.log('🔍 Looking up username:', username);

                // Look up UID by username
                const uidSnapshot = await db.ref('usernames/' + username.toLowerCase()).once('value');

                if (!uidSnapshot.exists()) {
                    throw new Error('Username not found');
                }

                const uid = uidSnapshot.val();
                console.log('✅ Found UID for username:', uid);

                // Now we can read just the email field (allowed by updated rules)
                const emailSnapshot = await db.ref('users/' + uid + '/email').once('value');
                const email = emailSnapshot.val();

                if (!email) {
                    throw new Error('This account does not have an email associated. Please contact support.');
                }

                console.log('✅ Found email for username, signing in...');

                // Sign in with email
                return await this.signInWithEmail(email, password);

            } catch (error) {
                console.error('Username login error:', error);
                return { success: false, error: error.message || this.getErrorMessage(error) };
            }
        }
        // ============================================
        // ANONYMOUS AUTHENTICATION
        // ============================================

        async signInAnonymously(username, password) {
            try {
                const usernameValid = await this.validateUsername(username);
                if (!usernameValid.isValid) {
                    throw new Error(usernameValid.error);
                }

                const userCredential = await auth.signInAnonymously();
                const user = userCredential.user;

                // Simple password hash (in production, use proper hashing)
                const passwordHash = btoa(password);

                await db.ref('users/' + user.uid).set({
                    username: username,
                    email: null,
                    createdAt: firebase.database.ServerValue.TIMESTAMP,
                    accountType: 'anonymous',
                    passwordHash: passwordHash,
                    isAdmin: false, // Anonymous accounts cannot be admin
                    memoryFragments: [],
                    signalProgress: 0,
                    riddlesSolved: []
                });

                await db.ref('usernames/' + username.toLowerCase()).set(user.uid);

                console.log('✅ Anonymous account created:', username);
                return { success: true, user };

            } catch (error) {
                console.error('Anonymous signup error:', error);
                return { success: false, error: this.getErrorMessage(error) };
            }
        }

        // ============================================
        // USERNAME VALIDATION (UPDATED WITH RESERVED NAMES)
        // ============================================

        async validateUsername(username) {
            if (username.length < 3 || username.length > 15) {
                return { isValid: false, error: 'Username must be 3-15 characters' };
            }

            if (username.includes(' ')) {
                return { isValid: false, error: 'Username cannot contain spaces' };
            }

            const validPattern = /^[a-zA-Z0-9_-]+$/;
            if (!validPattern.test(username)) {
                return { isValid: false, error: 'Username can only contain letters, numbers, _ and -' };
            }

            // Check reserved usernames (case-insensitive)
            if (RESERVED_USERNAMES.some(reserved => reserved.toLowerCase() === username.toLowerCase())) {
                return { isValid: false, error: 'This username is reserved for site administrators' };
            }

            const snapshot = await db.ref('usernames/' + username.toLowerCase()).once('value');
            if (snapshot.exists()) {
                return { isValid: false, error: 'Username already taken' };
            }

            return { isValid: true };
        }

        // ============================================
        // PASSWORD RESET
        // ============================================

        async sendPasswordReset(email) {
            try {
                await auth.sendPasswordResetEmail(email);
                return { success: true };
            } catch (error) {
                console.error('Password reset error:', error);
                return { success: false, error: this.getErrorMessage(error) };
            }
        }

        // ============================================
        // USER DATA MANAGEMENT
        // ============================================

        async saveUserProgress(dataType, data) {
            if (!this.currentUser) return;

            try {
                await db.ref(`users/${this.currentUser.uid}/${dataType}`).set(data);
                console.log(`✅ Saved ${dataType}:`, data);
            } catch (error) {
                console.error(`Error saving ${dataType}:`, error);
            }
        }

        async getUserProgress(dataType) {
            if (!this.currentUser) return null;

            try {
                const snapshot = await db.ref(`users/${this.currentUser.uid}/${dataType}`).once('value');
                return snapshot.val();
            } catch (error) {
                console.error(`Error loading ${dataType}:`, error);
                return null;
            }
        }

        // ============================================
        // SIGN OUT
        // ============================================

        async signOut() {
            try {
                await auth.signOut();
                console.log('✅ Signed out');
                return { success: true };
            } catch (error) {
                console.error('Sign out error:', error);
                return { success: false, error: this.getErrorMessage(error) };
            }
        }

        // ============================================
        // UTILITY METHODS
        // ============================================

        getErrorMessage(error) {
            const errorMessages = {
                'auth/email-already-in-use': 'Email already in use',
                'auth/invalid-email': 'Invalid email address',
                'auth/weak-password': 'Password must be at least 6 characters',
                'auth/user-not-found': 'No account found with this email',
                'auth/wrong-password': 'Incorrect password',
                'auth/too-many-requests': 'Too many attempts. Try again later',
                'auth/network-request-failed': 'Network error. Check your connection'
            };

            return errorMessages[error.code] || error.message;
        }

        updateProfileUI() {
            if (!this.userProfile) return;

            const usernameEl = document.getElementById('profileUsername');
            const emailEl = document.getElementById('profileEmail');
            const accountTypeEl = document.getElementById('profileAccountType');
            const createdAtEl = document.getElementById('profileCreatedAt');

            if (usernameEl) usernameEl.textContent = this.userProfile.username;
            if (emailEl) {
                emailEl.textContent = this.userProfile.email || 'Anonymous Account';
            }
            if (accountTypeEl) {
                let accountType = this.userProfile.accountType === 'email' ? 'Email Account' : 'Anonymous Account';
                if (this.userProfile.isAdmin) {
                    accountType += ' 🛡️ ADMIN';
                }
                accountTypeEl.textContent = accountType;
            }
            if (createdAtEl && this.userProfile.createdAt) {
                const date = new Date(this.userProfile.createdAt);
                createdAtEl.textContent = date.toLocaleDateString();
            }
        }

        async getUsername() {
            if (!this.currentUser) return null;

            if (this.userProfile) {
                return this.userProfile.username;
            }

            const snapshot = await db.ref(`users/${this.currentUser.uid}/username`).once('value');
            return snapshot.val();
        }

        isLoggedIn() {
            return !!this.currentUser;
        }

        getUserId() {
            return this.currentUser ? this.currentUser.uid : null;
        }
        getCurrentUser() {
            return new Promise((resolve) => {
                if (this.currentUser) {
                    resolve(this.currentUser);
                } else {
                    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
                        unsubscribe();
                        resolve(user);
                    });
                }
            });
        }

    }

    // Create global auth system instance
    const authSystem = new AuthSystem();
    authSystem.init();

    // Export for global access
    if (typeof window !== 'undefined') {
        window.authSystem = authSystem;
    }

    console.log('%c🔐 AUTHENTICATION SYSTEM LOADED', 'color: #00ff88; font-size: 16px; font-weight: bold;');
})();