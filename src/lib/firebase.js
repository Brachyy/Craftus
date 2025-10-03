// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

// valeurs lues depuis .env.local
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

if (import.meta.env.DEV) {
  const cfg = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  };
  for (const [k, v] of Object.entries(cfg)) {
    if (!v) console.error(`[Firebase] Variable manquante: ${k}`);
  }
}

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
// session conservée dans le navigateur (pas besoin de se reconnecter à chaque fois)
setPersistence(auth, browserLocalPersistence);
const provider = new GoogleAuthProvider();

const db = getFirestore(app);

// helpers simples
import { getUserName } from './userNames';

const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result;
  } catch (error) {
    console.error("Erreur de connexion Google:", error);
    throw error;
  }
};
const signOut = () => fbSignOut(auth);

export {
  app,
  auth,
  db,
  onAuthStateChanged,
  signInWithGoogle,
  signOut,
  // Firestore helpers utiles
  collection, doc, setDoc, addDoc, getDoc, getDocs, updateDoc, deleteDoc,
  serverTimestamp, query, orderBy, limit,
};
