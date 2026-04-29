// Extend the Window interface to include project-specific globals
declare global {
    interface Window {
        // the quantum entanglement widget instance (optional)
        quantumEntanglement?: any;
    }
}

export {};
