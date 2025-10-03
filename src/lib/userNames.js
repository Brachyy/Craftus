// src/lib/userNames.js
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

const USERNAMES_COLLECTION = 'userNames';
const USERNAMES_INDEX_COLLECTION = 'usernameIndex';

// Générer un nom d'utilisateur par défaut basé sur l'UID
export function generateDefaultUsername(uid) {
  const adjectives = ['Brave', 'Rapide', 'Malin', 'Fort', 'Sage', 'Rusé', 'Habile', 'Courageux'];
  const nouns = ['Dragon', 'Loup', 'Aigle', 'Tigre', 'Lion', 'Phoenix', 'Faucon', 'Ours'];
  
  const adjective = adjectives[uid.charCodeAt(0) % adjectives.length];
  const noun = nouns[uid.charCodeAt(1) % nouns.length];
  const number = uid.slice(-3);
  
  return `${adjective}${noun}${number}`;
}

// Vérifier si un nom d'utilisateur est disponible
export async function isUsernameAvailable(username) {
  try {
    const usernameDoc = doc(db, USERNAMES_INDEX_COLLECTION, username.toLowerCase());
    const docSnap = await getDoc(usernameDoc);
    return !docSnap.exists();
  } catch (error) {
    console.error('Erreur lors de la vérification du nom d\'utilisateur:', error);
    // En cas d'erreur, considérer comme disponible pour éviter de bloquer
    return true;
  }
}

// Obtenir le nom d'utilisateur d'un utilisateur (avec fallback localStorage)
export async function getUserName(uid) {
  try {
    const userDoc = doc(db, USERNAMES_COLLECTION, uid);
    const docSnap = await getDoc(userDoc);
    
    if (docSnap.exists()) {
      const username = docSnap.data().username;
      // Sauvegarder en localStorage comme backup
      localStorage.setItem(`username_${uid}`, username);
      return username;
    }
    
    // Fallback: vérifier le localStorage
    const localUsername = localStorage.getItem(`username_${uid}`);
    if (localUsername) {
      return localUsername;
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération du nom d\'utilisateur:', error);
    // Fallback: vérifier le localStorage
    const localUsername = localStorage.getItem(`username_${uid}`);
    if (localUsername) {
      return localUsername;
    }
    return null;
  }
}

// Définir le nom d'utilisateur d'un utilisateur (avec fallback localStorage)
export async function setUserName(uid, username) {
  try {
    const usernameLower = username.toLowerCase();
    
    // Vérifier le format du nom d'utilisateur
    if (!isValidUsername(username)) {
      throw new Error('Format de nom d\'utilisateur invalide');
    }
    
    // Sauvegarder en localStorage immédiatement
    localStorage.setItem(`username_${uid}`, username);
    
    try {
      // Vérifier la disponibilité
      const isAvailable = await isUsernameAvailable(usernameLower);
      if (!isAvailable) {
        throw new Error('Ce nom d\'utilisateur est déjà pris');
      }
      
      // Supprimer l'ancien index si il existe
      const oldUserDoc = doc(db, USERNAMES_COLLECTION, uid);
      const oldDocSnap = await getDoc(oldUserDoc);
      if (oldDocSnap.exists()) {
        const oldUsername = oldDocSnap.data().username;
        const oldIndexDoc = doc(db, USERNAMES_INDEX_COLLECTION, oldUsername.toLowerCase());
        await setDoc(oldIndexDoc, { uid: null }, { merge: true });
      }
      
      // Créer le nouveau document utilisateur
      await setDoc(doc(db, USERNAMES_COLLECTION, uid), {
        username: username,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Créer l'index pour la recherche rapide
      await setDoc(doc(db, USERNAMES_INDEX_COLLECTION, usernameLower), {
        uid: uid,
        createdAt: serverTimestamp()
      });
    } catch (firestoreError) {
      console.warn('Erreur Firestore, utilisation du localStorage:', firestoreError);
      // Continuer avec localStorage seulement
    }
    
    return username;
  } catch (error) {
    console.error('Erreur lors de la définition du nom d\'utilisateur:', error);
    throw error;
  }
}

// Valider le format d'un nom d'utilisateur
export function isValidUsername(username) {
  if (!username || typeof username !== 'string') return false;
  
  // Entre 3 et 20 caractères
  if (username.length < 3 || username.length > 20) return false;
  
  // Seulement lettres, chiffres et underscores
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return false;
  
  // Ne peut pas commencer par un chiffre
  if (/^[0-9]/.test(username)) return false;
  
  // Ne peut pas être seulement des underscores
  if (/^_+$/.test(username)) return false;
  
  return true;
}

// Obtenir plusieurs noms d'utilisateur par leurs UIDs
export async function getUserNames(uids) {
  try {
    const usernames = {};
    
    for (const uid of uids) {
      const username = await getUserName(uid);
      if (username) {
        usernames[uid] = username;
      }
    }
    
    return usernames;
  } catch (error) {
    console.error('Erreur lors de la récupération des noms d\'utilisateur:', error);
    return {};
  }
}
