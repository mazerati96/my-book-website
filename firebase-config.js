// ============================================
// FIREBASE CONFIGURATION - SINGLE SOURCE
// ============================================

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

// Initialize Firebase (only once)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('🔥 Firebase initialized');
} else {
    console.log('🔥 Firebase already initialized');
}