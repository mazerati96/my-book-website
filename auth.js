// ============================================
// FIREBASE AUTHENTICATION SYSTEM
// ============================================

(function () {
    // Prevent double-initialization
    if (typeof window !== 'undefined' && window.authSystem) {
        console.log('🔐 authSystem already initialized – skipping auth.js re-execution');
        return;
    }

    // Ensure firebase is available
    if (typeof firebase === 'undefined' || !firebase.apps || !firebase.apps.length) {
        throw new Error('❌ Firebase not initialized! Include firebase-config.js before auth.js');
    }

    const auth = firebase.auth();
    const db = firebase.database();

    // ============================================
    // AUTH STATE MANAGEMENT
    // ============================================

    class AuthSystem {
        constructor() {
            this.currentUser = null;
            this.userProfile = null;
            this.authStateListeners = [];
        }

        // Initialize auth system
        init() {
            auth.onAuthStateChanged((user) => {
                if (user) {
                    this.currentUser = user;
                    this.loadUserProfile(user.uid);
                } else {
                    this.currentUser = null;
                    this.userProfile = null;
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

                await db.ref('users/' + user.uid).set({
                    username: username,
                    email: email,
                    createdAt: firebase.database.ServerValue.TIMESTAMP,
                    accountType: 'email',
                    memoryFragments: [],
                    signalProgress: 0,
                    riddlesSolved: []
                });

                await db.ref('usernames/' + username.toLowerCase()).set(user.uid);

                console.log('✅ Account created:', username);
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
        // NEW: USERNAME/PASSWORD LOGIN
        // ============================================

        async signInWithUsername(username, password) {
            try {
                // Look up UID by username
                const uidSnapshot = await db.ref('usernames/' + username.toLowerCase()).once('value');

                if (!uidSnapshot.exists()) {
                    throw new Error('Username not found');
                }

                const uid = uidSnapshot.val();

                // Get user's email (or check if anonymous)
                const userSnapshot = await db.ref('users/' + uid).once('value');
                const userData = userSnapshot.val();

                if (!userData) {
                    throw new Error('User data not found');
                }

                // For anonymous accounts, we need to use a different approach
                // Store password hash in database when creating anonymous account
                if (userData.accountType === 'anonymous') {
                    // Check stored password hash
                    if (!userData.passwordHash) {
                        throw new Error('Anonymous account has no password');
                    }

                    // For now, return error - we need to implement custom token authentication
                    throw new Error('Anonymous account login not yet supported. Please use email login for email accounts.');
                }

                // For email accounts, use email to login
                if (userData.email) {
                    return await this.signInWithEmail(userData.email, password);
                }

                throw new Error('Unable to login with this account');

            } catch (error) {
                console.error('Username login error:', error);
                return { success: false, error: error.message || this.getErrorMessage(error) };
            }
        }

        // ============================================
        // ANONYMOUS AUTHENTICATION (UPDATED)
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
                const passwordHash = btoa(password); // Basic encoding - NOT SECURE for production

                await db.ref('users/' + user.uid).set({
                    username: username,
                    email: null,
                    createdAt: firebase.database.ServerValue.TIMESTAMP,
                    accountType: 'anonymous',
                    passwordHash: passwordHash, // Store for later verification
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
        // USERNAME VALIDATION
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
                accountTypeEl.textContent = this.userProfile.accountType === 'email' ? 'Email Account' : 'Anonymous Account';
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