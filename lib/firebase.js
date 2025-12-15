import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC-eMboR9NFoaHW9wdpz18_EDBmzoXp_WQ",
  authDomain: "ism-fee.firebaseapp.com",
  projectId: "ism-fee",
  storageBucket: "ism-fee.firebasestorage.app",
  messagingSenderId: "967103824658",
  appId: "1:967103824658:web:aeaf1e4b8c9860691e29cb",
  measurementId: "G-JVP2M5XT6M"
};

const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);