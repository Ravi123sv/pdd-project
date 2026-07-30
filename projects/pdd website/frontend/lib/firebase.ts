import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
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
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
