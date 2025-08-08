// src/firebase/config.js

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDoik91rkRyeIha0sNxpnIkiQni_frwEYU",
  authDomain: "boilerplate-f0505.firebaseapp.com",
  projectId: "boilerplate-f0505",
  storageBucket: "boilerplate-f0505.appspot.com",
  messagingSenderId: "241223180295",
  appId: "1:241223180295:web:c6438614c6c35f6f23caa2",
  measurementId: "G-ZTYZQZTHE2"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Auth & Firestore exports
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app); // ✅ Moved inside export for consistency



