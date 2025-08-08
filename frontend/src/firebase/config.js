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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
export const db = getFirestore(app);
