// ============================================
// FIREBASE AUTHENTICATION SYSTEM
// ============================================

// Firebase configuration (already initialized in other files)
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

// Initialize Firebase if not already done
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
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
        // Listen for auth state changes
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                this.loadUserProfile(user.uid);
            } else {
                this.currentUser = null;
                this.userProfile = null;
            }

            // Notify all listeners
            this.authStateListeners.forEach(callback => callback(user));
        });

        console.log('🔐 Auth system initialized');
    }

    // Add listener for auth state changes
    onAuthStateChange(callback) {
        this.authStateListeners.push(callback);
    }

    // Load user profile from database
    async loadUserProfile(uid) {
        try {
            const snapshot = await db.ref('users/' + uid).once('value');
            this.userProfile = snapshot.val();

            // Update UI if on profile page
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
            // Validate username
            const usernameValid = await this.validateUsername(username);
            if (!usernameValid.isValid) {
                throw new Error(usernameValid.error);
            }

            // Create user account
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Create user profile in database
            await db.ref('users/' + user.uid).set({
                username: username,
                email: email,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                accountType: 'email',
                memoryFragments: [],
                signalProgress: 0,
                riddlesSolved: []
            });

            // Add username to taken list
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
    // ANONYMOUS AUTHENTICATION
    // ============================================

    async signInAnonymously(username) {
        try {
            // Validate username
            const usernameValid = await this.validateUsername(username);
            if (!usernameValid.isValid) {
                throw new Error(usernameValid.error);
            }

            // Create anonymous account
            const userCredential = await auth.signInAnonymously();
            const user = userCredential.user;

            // Create user profile
            await db.ref('users/' + user.uid).set({
                username: username,
                email: null,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                accountType: 'anonymous',
                memoryFragments: [],
                signalProgress: 0,
                riddlesSolved: []
            });

            // Add username to taken list
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
        // Check length (3-15 characters)
        if (username.length < 3 || username.length > 15) {
            return { isValid: false, error: 'Username must be 3-15 characters' };
        }

        // Check for spaces
        if (username.includes(' ')) {
            return { isValid: false, error: 'Username cannot contain spaces' };
        }

        // Check for valid characters (letters, numbers, underscore, dash)
        const validPattern = /^[a-zA-Z0-9_-]+$/;
        if (!validPattern.test(username)) {
            return { isValid: false, error: 'Username can only contain letters, numbers, _ and -' };
        }

        // Check if username is already taken (case-insensitive)
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

        // Update profile page elements
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

    // Get current user's username
    async getUsername() {
        if (!this.currentUser) return null;

        if (this.userProfile) {
            return this.userProfile.username;
        }

        const snapshot = await db.ref(`users/${this.currentUser.uid}/username`).once('value');
        return snapshot.val();
    }

    // Check if user is logged in
    isLoggedIn() {
        return !!this.currentUser;
    }

    // Get user ID
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