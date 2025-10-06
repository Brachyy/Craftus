// src/lib/userProfiles.js
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

const USER_PROFILES_COLLECTION = 'userProfiles';

// Sauvegarder les items forgemagie dans Firebase
export async function saveForgemagieItems(uid, forgemagieItems) {
  try {
    const profileDoc = doc(db, USER_PROFILES_COLLECTION, uid);
    await setDoc(profileDoc, {
      forgemagieItems: Array.from(forgemagieItems),
      lastUpdated: serverTimestamp()
    }, { merge: true });
    console.log(`[saveForgemagieItems] Items forgemagie sauvegardés pour ${uid}:`, Array.from(forgemagieItems));
  } catch (error) {
    console.error('[saveForgemagieItems] Erreur:', error);
    throw error;
  }
}

// Récupérer les items forgemagie depuis Firebase
export async function getForgemagieItems(uid) {
  try {
    const profileDoc = doc(db, USER_PROFILES_COLLECTION, uid);
    const docSnap = await getDoc(profileDoc);
    
    if (docSnap.exists()) {
      const profile = docSnap.data();
      const forgemagieItems = profile.forgemagieItems || [];
      console.log(`[getForgemagieItems] Items forgemagie récupérés pour ${uid}:`, forgemagieItems);
      return new Set(forgemagieItems);
    }
    
    console.log(`[getForgemagieItems] Aucun profil trouvé pour ${uid}, retour d'un Set vide`);
    return new Set();
  } catch (error) {
    console.error('[getForgemagieItems] Erreur:', error);
    return new Set();
  }
}

// Obtenir le profil d'un utilisateur (avec fallback localStorage)
export async function getUserProfile(uid) {
  try {
    const profileDoc = doc(db, USER_PROFILES_COLLECTION, uid);
    const docSnap = await getDoc(profileDoc);
    
    if (docSnap.exists()) {
      const profile = docSnap.data();
      console.log(`[getUserProfile] Profil trouvé pour ${uid}:`, profile);
      return profile;
    }
    
    console.log(`[getUserProfile] Aucun profil trouvé pour ${uid}`);
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération du profil utilisateur:', error);
    return null;
  }
}

// Obtenir plusieurs profils utilisateurs par leurs UIDs
export async function getUserProfiles(uids) {
  try {
    const profiles = {};
    
    for (const uid of uids) {
      const profile = await getUserProfile(uid);
      if (profile) {
        profiles[uid] = profile;
      }
    }
    
    return profiles;
  } catch (error) {
    console.error('Erreur lors de la récupération des profils utilisateur:', error);
    return {};
  }
}

// Sauvegarder le profil d'un utilisateur (appelé lors de la connexion)
export async function saveUserProfile(user) {
  try {
    const profileDoc = doc(db, USER_PROFILES_COLLECTION, user.uid);
    
    const profileData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastSeen: serverTimestamp(),
      createdAt: serverTimestamp()
    };
    
    console.log(`[saveUserProfile] Sauvegarde du profil pour ${user.uid}:`, profileData);
    await setDoc(profileDoc, profileData, { merge: true });
    console.log(`[saveUserProfile] Profil sauvegardé avec succès pour ${user.uid}`);
    return profileData;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du profil utilisateur:', error);
    throw error;
  }
}
