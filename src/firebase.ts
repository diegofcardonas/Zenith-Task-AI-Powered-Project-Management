import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Helper to check if a string is a valid JSON
const isValidJson = (str: string) => {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
};

const getFirebaseConfig = () => {
    const storedConfig = localStorage.getItem('zenith_firebase_config');
    if (storedConfig && isValidJson(storedConfig)) {
        return JSON.parse(storedConfig);
    }
    
    // Default/Fallback Config (Replace this with your REAL project config for dev)
    // Note: If these are invalid, auth/firestore calls will fail in the console.
    return {
        apiKey: "AIzaSyBVGyiarqJ1tbeiKd8wY0gQfar6hB4ertk", // Placeholder
        authDomain: "zenith-task-demo.firebaseapp.com",
        projectId: "zenith-task-demo",
        storageBucket: "zenith-task-demo.firebasestorage.app",
        messagingSenderId: "000000000000",
        appId: "1:000000000000:web:0000000000000000000000"
    };
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
    const config = getFirebaseConfig();
    if (!getApps().length) {
        app = initializeApp(config);
    } else {
        app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
} catch (error) {
    console.warn("Firebase initialization failed. Please check your configuration in Settings.", error);
    // Create dummy objects to prevent immediate crashes before config is fixed
    // The app will likely need a reload after setting valid config
}

export { auth, db, app };

export const saveFirebaseConfig = (configStr: string) => {
    if (isValidJson(configStr)) {
        localStorage.setItem('zenith_firebase_config', configStr);
        window.location.reload(); // Reload to apply new config
        return true;
    }
    return false;
};

export const resetFirebaseConfig = () => {
    localStorage.removeItem('zenith_firebase_config');
    window.location.reload();
};
