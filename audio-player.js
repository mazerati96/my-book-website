// ============================================
// 36 HZ FREQUENCY GENERATOR
// ============================================

class FrequencyGenerator {
    constructor() {
        this.audioContext = null;
        this.oscillator = null;
        this.gainNode = null;
        this.isPlaying = false;
        this.frequency = 36; // The quantum psalm frequency
        this.volume = 0.3; // 30% default
    }

    // Initialize Audio Context
    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.gainNode.gain.value = this.volume;
            console.log('✅ Audio context initialized');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize audio:', error);
            return false;
        }
    }

    // Start playing the 36 Hertz frequency
    start() {
        if (this.isPlaying) return;

        if (!this.audioContext) {
            if (!this.init()) return;
        }

        // Resume audio context if suspended (browser autoplay policy)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        // Create oscillator
        this.oscillator = this.audioContext.createOscillator();
        this.oscillator.type = 'sine'; // Smooth sine wave for subsonic
        this.oscillator.frequency.setValueAtTime(this.frequency, this.audioContext.currentTime);

        // Connect oscillator to gain node
        this.oscillator.connect(this.gainNode);

        // Start oscillator
        this.oscillator.start();
        this.isPlaying = true;

        console.log(`🎵 Playing 36 Hertz frequency at ${this.volume * 100}% volume`);
    }

    // Stop playing
    stop() {
        if (!this.isPlaying || !this.oscillator) return;

        this.oscillator.stop();
        this.oscillator.disconnect();
        this.oscillator = null;
        this.isPlaying = false;

        console.log('🔇 36 Hertz frequency stopped');
    }

    // Set volume (0.0 to 1.0)
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.gainNode) {
            this.gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
        }
    }

    // Toggle play/pause
    toggle() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.start();
        }
        return this.isPlaying;
    }

    // Get current state
    getState() {
        return {
            isPlaying: this.isPlaying,
            frequency: this.frequency,
            volume: this.volume
        };
    }
}

// Create global frequency generator instance
const frequencyGenerator = new FrequencyGenerator();

// Export for use in signal.js
if (typeof window !== 'undefined') {
    window.frequencyGenerator = frequencyGenerator;
}