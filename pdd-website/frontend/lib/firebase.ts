import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC_tYXdUG3PvF3VwfVQmy-O_lhkWhxzsAE",
  authDomain: "neuroai-9d460.firebaseapp.com",
  projectId: "neuroai-9d460",
  storageBucket: "neuroai-9d460.firebasestorage.app",
  messagingSenderId: "95395112948",
  appId: "1:95395112948:web:3eb2d9c7919468ddeafba1",
  measurementId: "G-Z26LLY61JK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
// Force popup mode for browser consistency
auth.config.update({ popupRedirectResolver: undefined });

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
export const db = getFirestore(app);
export const storage = getStorage(app);

// Helper for Email Link Auth
export const actionCodeSettings = {
  url: typeof window !== 'undefined' ? `${window.location.origin}/auth/verify` : 'https://ravi123sv.github.io/pdd-project/auth/verify',
  handleCodeInApp: true,
};

export { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink };
export default app;
