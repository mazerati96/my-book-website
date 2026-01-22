// ============================================
// STORAGE WRAPPER - Respects Cookie Consent
// ============================================
// This wraps localStorage/sessionStorage to respect user's cookie preferences
// If they rejected cookies, uses sessionStorage instead (resets when browser closes)

class ConsentAwareStorage {
    constructor() {
        this.preferences = this.getPreferences();
    }

    getPreferences() {
        // Try to get preferences from localStorage
        // If user rejected, this will be in localStorage ONLY for the rejection choice itself
        try {
            const prefs = JSON.parse(localStorage.getItem('cookiePreferences') || '{}');
            return prefs;
        } catch {
            return { preferences: true, progress: true }; // Default to true until they choose
        }
    }

    // Set item with consent awareness
    setItem(key, value, category = 'preferences') {
        const prefs = window.cookiePreferences || this.preferences;

        // Always allow cookieConsent and cookiePreferences to be saved
        if (key === 'cookieConsent' || key === 'cookiePreferences') {
            localStorage.setItem(key, value);
            return;
        }

        // Check if this category is allowed
        const allowed = category === 'preferences' ? prefs.preferences : prefs.progress;

        if (allowed) {
            // User accepted - save to localStorage (persists)
            localStorage.setItem(key, value);
        } else {
            // User rejected - save to sessionStorage (clears on close)
            sessionStorage.setItem(key, value);
        }
    }

    // Get item with consent awareness
    getItem(key, category = 'preferences') {
        // Always allow cookieConsent and cookiePreferences to be read
        if (key === 'cookieConsent' || key === 'cookiePreferences') {
            return localStorage.getItem(key);
        }

        const prefs = window.cookiePreferences || this.preferences;
        const allowed = category === 'preferences' ? prefs.preferences : prefs.progress;

        if (allowed) {
            // Check localStorage
            return localStorage.getItem(key);
        } else {
            // Check sessionStorage (temporary)
            return sessionStorage.getItem(key);
        }
    }

    // Remove item
    removeItem(key, category = 'preferences') {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    }
}

// Create global storage instance
window.consentStorage = new ConsentAwareStorage();

// Helper functions for easy usage
window.savePreference = function (key, value) {
    window.consentStorage.setItem(key, value, 'preferences');
};

window.saveProgress = function (key, value) {
    window.consentStorage.setItem(key, value, 'progress');
};

window.getPreference = function (key) {
    return window.consentStorage.getItem(key, 'preferences');
};

window.getProgress = function (key) {
    return window.consentStorage.getItem(key, 'progress');
};