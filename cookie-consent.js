// ============================================
// COOKIE CONSENT SYSTEM
// ============================================

class CookieConsentManager {
    constructor() {
        this.consentGiven = this.checkConsent();
        this.preferences = this.loadPreferences();
    }

    checkConsent() {
        // Check if user has already made a choice
        const consent = localStorage.getItem('cookieConsent');
        return consent === 'accepted' || consent === 'customized';
    }

    loadPreferences() {
        const saved = localStorage.getItem('cookiePreferences');
        return saved ? JSON.parse(saved) : {
            essential: true,  // Always true, required for site to work
            preferences: true, // Music, theme settings
            progress: true,    // Memory fragments, game progress
            analytics: false   // Future: visitor stats (not implemented yet)
        };
    }

    savePreferences(prefs) {
        this.preferences = { ...this.preferences, ...prefs };
        localStorage.setItem('cookiePreferences', JSON.stringify(this.preferences));
    }

    acceptAll() {
        localStorage.setItem('cookieConsent', 'accepted');
        this.savePreferences({
            essential: true,
            preferences: true,
            progress: true,
            analytics: true
        });
        this.consentGiven = true;
        this.hideBanner();
    }

    rejectAll() {
        localStorage.setItem('cookieConsent', 'rejected');
        this.savePreferences({
            essential: true,
            preferences: false,
            progress: false,
            analytics: false
        });
        this.consentGiven = true;
        this.hideBanner();
        this.showRejectionNotice();
    }

    customizeAndSave(prefs) {
        localStorage.setItem('cookieConsent', 'customized');
        this.savePreferences(prefs);
        this.consentGiven = true;
        this.hideCustomizeModal();
        this.hideBanner();
    }

    showRejectionNotice() {
        const notice = document.createElement('div');
        notice.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(255, 0, 51, 0.95);
            border: 2px solid var(--accent-red);
            padding: 1rem;
            color: white;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            z-index: 10001;
            max-width: 300px;
            box-shadow: 0 0 20px var(--accent-red);
        `;
        notice.textContent = 'Storage disabled. Your progress will reset when you close the browser.';
        document.body.appendChild(notice);

        setTimeout(() => {
            notice.style.opacity = '0';
            notice.style.transition = 'opacity 0.5s';
            setTimeout(() => notice.remove(), 500);
        }, 5000);
    }

    init() {
        if (!this.consentGiven) {
            this.showBanner();
        }

        // Apply consent preferences
        this.applyPreferences();
    }

    applyPreferences() {
        // Expose preferences globally so other scripts can check
        window.cookiePreferences = this.preferences;
    }

    showBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <button class="cookie-close-btn" id="cookie-close">✕</button>
                <div class="cookie-icon">🍪</div>
                <div class="cookie-text">
                    <h3>DATA STORAGE NOTICE</h3>
                    <p>This site uses local storage to save your progress, preferences, and enhance your experience. 
                    By continuing, you accept our use of local storage.</p>
                </div>
                <div class="cookie-actions">
                    <button class="cookie-btn cookie-accept" id="accept-all">ACCEPT ALL</button>
                    <button class="cookie-btn cookie-customize" id="customize">CUSTOMIZE</button>
                    <button class="cookie-btn cookie-reject" id="reject-all">REJECT</button>
                    <a href="privacy-policy.html" class="cookie-learn-more">Privacy Policy</a>
                </div>
            </div>
        `;

        this.addBannerStyles();
        document.body.appendChild(banner);

        // Event listeners
        document.getElementById('accept-all').addEventListener('click', () => this.acceptAll());
        document.getElementById('reject-all').addEventListener('click', () => this.rejectAll());
        document.getElementById('customize').addEventListener('click', () => this.showCustomizeModal());
        document.getElementById('cookie-close').addEventListener('click', () => this.hideBanner());
    }

    hideBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.style.transform = 'translateY(-100%)';
            setTimeout(() => banner.remove(), 300);
        }
    }

    showCustomizeModal() {
        const modal = document.createElement('div');
        modal.id = 'cookie-customize-modal';
        modal.innerHTML = `
            <div class="cookie-modal-backdrop"></div>
            <div class="cookie-modal-content">
                <h2>CUSTOMIZE STORAGE PREFERENCES</h2>
                <p class="cookie-modal-intro">Choose which data you want to save between sessions.</p>

                <div class="cookie-option">
                    <label>
                        <input type="checkbox" id="pref-essential" checked disabled>
                        <div class="cookie-option-content">
                            <strong>Essential</strong>
                            <p>Required for the site to function properly. Cannot be disabled.</p>
                        </div>
                    </label>
                </div>

                <div class="cookie-option">
                    <label>
                        <input type="checkbox" id="pref-preferences" ${this.preferences.preferences ? 'checked' : ''}>
                        <div class="cookie-option-content">
                            <strong>Preferences</strong>
                            <p>Saves your music settings and theme preferences.</p>
                        </div>
                    </label>
                </div>

                <div class="cookie-option">
                    <label>
                        <input type="checkbox" id="pref-progress" ${this.preferences.progress ? 'checked' : ''}>
                        <div class="cookie-option-content">
                            <strong>Progress & Collections</strong>
                            <p>Saves your memory fragment collection and game progress.</p>
                        </div>
                    </label>
                </div>

                <div class="cookie-option">
                    <label>
                        <input type="checkbox" id="pref-analytics" ${this.preferences.analytics ? 'checked' : ''}>
                        <div class="cookie-option-content">
                            <strong>Analytics (Future)</strong>
                            <p>Help us improve the site by collecting anonymous usage data.</p>
                        </div>
                    </label>
                </div>

                <div class="cookie-modal-actions">
                    <button class="cookie-btn cookie-accept" id="save-preferences">SAVE PREFERENCES</button>
                    <button class="cookie-btn cookie-customize" id="cancel-customize">CANCEL</button>
                </div>
            </div>
        `;

        this.addModalStyles();
        document.body.appendChild(modal);

        // Event listeners
        document.getElementById('save-preferences').addEventListener('click', () => {
            const prefs = {
                essential: true,
                preferences: document.getElementById('pref-preferences').checked,
                progress: document.getElementById('pref-progress').checked,
                analytics: document.getElementById('pref-analytics').checked
            };
            this.customizeAndSave(prefs);
        });

        document.getElementById('cancel-customize').addEventListener('click', () => {
            this.hideCustomizeModal();
        });

        document.querySelector('.cookie-modal-backdrop').addEventListener('click', () => {
            this.hideCustomizeModal();
        });
    }

    hideCustomizeModal() {
        const modal = document.getElementById('cookie-customize-modal');
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => modal.remove(), 300);
        }
    }

    addBannerStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #cookie-consent-banner {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                background: rgba(10, 10, 10, 0.98);
                border-bottom: 2px solid var(--accent-cyan);
                z-index: 10000;
                transform: translateY(0);
                transition: transform 0.3s ease;
                box-shadow: 0 4px 30px rgba(0, 255, 170, 0.3);
            }

            .cookie-banner-content {
                max-width: 1200px;
                margin: 0 auto;
                padding: 1.5rem 2rem;
                display: grid;
                grid-template-columns: auto 1fr auto;
                gap: 1.5rem;
                align-items: center;
                position: relative;
            }

            .cookie-close-btn {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: none;
                border: none;
                color: var(--primary-white);
                font-size: 1.5rem;
                cursor: pointer;
                opacity: 0.6;
                transition: all 0.3s;
                font-family: 'Courier New', monospace;
            }

            .cookie-close-btn:hover {
                opacity: 1;
                color: var(--accent-red);
                transform: scale(1.2);
            }

            .cookie-icon {
                font-size: 3rem;
            }

            .cookie-text h3 {
                color: var(--accent-cyan);
                font-family: 'Courier New', monospace;
                font-size: 1.2rem;
                margin-bottom: 0.5rem;
                letter-spacing: 0.2em;
                text-shadow: 0 0 10px var(--accent-cyan);
            }

            .cookie-text p {
                color: var(--dark-white);
                font-family: 'Courier New', monospace;
                font-size: 0.9rem;
                line-height: 1.5;
            }

            .cookie-actions {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                min-width: 200px;
            }

            .cookie-btn {
                padding: 0.8rem 1.5rem;
                font-family: 'Courier New', monospace;
                font-weight: bold;
                font-size: 0.85rem;
                letter-spacing: 0.1em;
                cursor: pointer;
                transition: all 0.3s;
                border: none;
                text-align: center;
            }

            .cookie-accept {
                background: var(--accent-cyan);
                color: var(--bg-black);
            }

            .cookie-accept:hover {
                box-shadow: 0 0 20px var(--accent-cyan);
                transform: translateY(-2px);
            }

            .cookie-customize {
                background: transparent;
                border: 1px solid var(--primary-white);
                color: var(--primary-white);
            }

            .cookie-customize:hover {
                border-color: var(--accent-cyan);
                color: var(--accent-cyan);
            }

            .cookie-reject {
                background: transparent;
                border: 1px solid var(--accent-red);
                color: var(--accent-red);
            }

            .cookie-reject:hover {
                background: var(--accent-red);
                color: white;
                box-shadow: 0 0 15px var(--accent-red);
            }

            .cookie-learn-more {
                color: var(--dark-white);
                font-family: 'Courier New', monospace;
                font-size: 0.75rem;
                text-decoration: none;
                text-align: center;
                padding: 0.3rem;
                transition: all 0.3s;
            }

            .cookie-learn-more:hover {
                color: var(--accent-cyan);
            }

            @media (max-width: 768px) {
                .cookie-banner-content {
                    grid-template-columns: 1fr;
                    text-align: center;
                    padding: 1rem;
                }

                .cookie-icon {
                    display: none;
                }

                .cookie-actions {
                    width: 100%;
                }
            }
        `;
        document.head.appendChild(style);
    }

    addModalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #cookie-customize-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 1;
                transition: opacity 0.3s;
            }

            .cookie-modal-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
            }

            .cookie-modal-content {
                position: relative;
                background: rgba(10, 10, 10, 0.98);
                border: 2px solid var(--accent-cyan);
                padding: 2rem;
                max-width: 600px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 0 50px var(--accent-cyan);
            }

            .cookie-modal-content h2 {
                color: var(--accent-cyan);
                font-family: 'Courier New', monospace;
                font-size: 1.5rem;
                margin-bottom: 1rem;
                letter-spacing: 0.2em;
                text-shadow: 0 0 10px var(--accent-cyan);
            }

            .cookie-modal-intro {
                color: var(--dark-white);
                font-family: 'Courier New', monospace;
                font-size: 0.9rem;
                margin-bottom: 2rem;
            }

            .cookie-option {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid var(--border-white);
                padding: 1rem;
                margin-bottom: 1rem;
                transition: all 0.3s;
            }

            .cookie-option:hover {
                border-color: var(--accent-cyan);
                box-shadow: 0 0 10px var(--accent-cyan);
            }

            .cookie-option label {
                display: flex;
                gap: 1rem;
                cursor: pointer;
                align-items: flex-start;
            }

            .cookie-option input[type="checkbox"] {
                margin-top: 0.2rem;
                width: 20px;
                height: 20px;
                cursor: pointer;
            }

            .cookie-option input[type="checkbox"]:disabled {
                cursor: not-allowed;
                opacity: 0.5;
            }

            .cookie-option-content strong {
                color: var(--primary-white);
                font-family: 'Courier New', monospace;
                display: block;
                margin-bottom: 0.3rem;
            }

            .cookie-option-content p {
                color: var(--dark-white);
                font-family: 'Courier New', monospace;
                font-size: 0.85rem;
                line-height: 1.4;
            }

            .cookie-modal-actions {
                display: flex;
                gap: 1rem;
                margin-top: 2rem;
            }

            .cookie-modal-actions .cookie-btn {
                flex: 1;
            }

            @media (max-width: 500px) {
                .cookie-modal-content {
                    padding: 1.5rem;
                }

                .cookie-modal-actions {
                    flex-direction: column;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize consent manager
const cookieConsent = new CookieConsentManager();

// Start when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        cookieConsent.init();
    });
} else {
    cookieConsent.init();
}

// Export for manual control
if (typeof window !== 'undefined') {
    window.cookieConsent = cookieConsent;
}