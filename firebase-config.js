// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// Your NEW web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCHzthKTAg2K9JiKN6FhGMUMO5amDlJDqM",
  authDomain: "fujilearn.firebaseapp.com",
  projectId: "fujilearn",
  storageBucket: "fujilearn.firebasestorage.app",
  messagingSenderId: "957943468894",
  appId: "1:957943468894:web:f39d5c5f2461e0361175cf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services your app needs
export const auth = getAuth(app);
export const db = getFirestore(app);

// Helper function to ensure the user is signed in (uses Anonymous Auth for seamless experience)
export function ensureSignedIn() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is already signed in
                resolve(user);
            } else {
                // User is not signed in, sign them in anonymously
                signInAnonymously(auth).then((result) => {
                    resolve(result.user);
                }).catch((error) => {
                    console.error("Anonymous sign-in failed:", error);
                    reject(error);
                });
            }
        });
    });
}