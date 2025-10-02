// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signOut as fbSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';
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

// Vérification de la configuration Firebase
const isFirebaseConfigured = Object.values(firebaseConfig).every(v => v !== undefined && v !== '');

if (!isFirebaseConfigured) {
  console.warn('[Firebase] Configuration incomplète. Les fonctionnalités Firebase seront désactivées.');
  console.warn('[Firebase] Créez un fichier .env.local avec vos identifiants Firebase.');
}

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

// Initialisation conditionnelle de Firebase
let app, auth, db, provider;

try {
  if (isFirebaseConfigured) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    // session conservée dans le navigateur (pas besoin de se reconnecter à chaque fois)
    setPersistence(auth, browserLocalPersistence);
    provider = new GoogleAuthProvider();
    db = getFirestore(app);
  } else {
    // Configuration Firebase minimale pour éviter les erreurs
    app = null;
    auth = null;
    provider = null;
    db = null;
    console.warn('[Firebase] Application non initialisée - configuration manquante');
  }
} catch (error) {
  console.error('[Firebase] Erreur lors de l\'initialisation:', error);
  app = null;
  auth = null;
  provider = null;
  db = null;
}

// Initialiser GoogleAuth pour les plateformes natives
// La configuration (serverClientId) vient de capacitor.config.ts
if (Capacitor.isNativePlatform()) {
  try {
    GoogleAuth.initialize();
    console.log('[Firebase] GoogleAuth initialisé pour plateforme native');
  } catch (error) {
    console.error('[Firebase] Erreur lors de l\'initialisation de GoogleAuth:', error);
  }
}

// helpers simples avec gestion des erreurs
const signInWithGoogle = async () => {
  if (!auth) {
    console.warn('[Firebase] Authentification non disponible - Firebase non configuré');
    return Promise.reject(new Error('Firebase non configuré'));
  }

  try {
    // Sur Android/iOS, utiliser l'authentification native
    if (Capacitor.isNativePlatform()) {
      console.log('[Firebase] Authentification Google native (Android/iOS)');
      console.log('[Firebase] Appel de GoogleAuth.signIn()...');
      
      const googleUser = await GoogleAuth.signIn();
      console.log('[Firebase] GoogleAuth.signIn() réussi:', {
        email: googleUser.email,
        name: googleUser.name,
        hasIdToken: !!googleUser.authentication?.idToken
      });
      
      if (!googleUser.authentication?.idToken) {
        throw new Error('Aucun ID token reçu de Google');
      }
      
      // Créer un credential Firebase à partir du token Google
      const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);
      console.log('[Firebase] Credential créé, connexion à Firebase...');
      
      // Se connecter à Firebase avec le credential
      const result = await signInWithCredential(auth, credential);
      console.log('[Firebase] Authentification Firebase réussie:', result.user.email);
      
      return result;
    } else {
      // Sur web, utiliser le popup (fallback)
      console.log('[Firebase] Authentification Google web');
      const { signInWithPopup } = await import('firebase/auth');
      return await signInWithPopup(auth, provider);
    }
  } catch (error) {
    console.error('[Firebase] Erreur lors de la connexion Google:', error);
    console.error('[Firebase] Détails de l\'erreur:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    alert(`Erreur d'authentification: ${error.message}`);
    throw error;
  }
};

const signOut = () => {
  if (!auth) {
    console.warn('[Firebase] Authentification non disponible - Firebase non configuré');
    return Promise.reject(new Error('Firebase non configuré'));
  }
  return fbSignOut(auth);
};

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
