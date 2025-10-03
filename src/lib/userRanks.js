import { db } from './firebase';
import { collection, doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, getDocs } from 'firebase/firestore';
import { getUserRank, getCurrentMonthStart, isNewMonth, RANKS } from './ranks';

const USER_RANKS_COLLECTION = 'userRanks';

// Structure d'un document userRank :
// {
//   userId: string,
//   userName: string,
//   currentRank: string,
//   monthlyParticipations: number,
//   totalParticipations: number,
//   lastResetDate: timestamp,
//   lastUpdated: timestamp,
//   createdAt: timestamp
// }

// Obtenir les données de rang d'un utilisateur
export async function getUserRankData(userId) {
  try {
    const userRankRef = doc(db, USER_RANKS_COLLECTION, userId);
    const userRankSnap = await getDoc(userRankRef);
    
    if (userRankSnap.exists()) {
      const data = userRankSnap.data();
      
      // Vérifier si on est dans un nouveau mois et réinitialiser si nécessaire
      if (isNewMonth(data.lastResetDate?.toDate())) {
        await resetMonthlyParticipations(userId, data);
        // Recharger les données après réinitialisation
        const newSnap = await getDoc(userRankRef);
        return newSnap.data();
      }
      
      return data;
    }
    
    // Pas de document existant - retourner null pour créer un nouveau document
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération du rang utilisateur:', error);
    return null;
  }
}

// Créer ou mettre à jour les données de rang d'un utilisateur
export async function updateUserRank(userId, userName, participationsToAdd = 1) {
  try {
    const userRankRef = doc(db, USER_RANKS_COLLECTION, userId);
    const userRankSnap = await getDoc(userRankRef);
    
    if (userRankSnap.exists()) {
      const data = userRankSnap.data();
      
      // Vérifier si on est dans un nouveau mois et réinitialiser si nécessaire
      if (isNewMonth(data.lastResetDate?.toDate())) {
        await resetMonthlyParticipations(userId, data);
      }
      
      // Mettre à jour les participations seulement si on ajoute quelque chose
      if (participationsToAdd > 0) {
        await updateDoc(userRankRef, {
          monthlyParticipations: increment(participationsToAdd),
          totalParticipations: increment(participationsToAdd),
          lastUpdated: serverTimestamp()
        });
        
        // Obtenir le nouveau rang
        const updatedSnap = await getDoc(userRankRef);
        const updatedData = updatedSnap.data();
        const newRank = getUserRank(updatedData.monthlyParticipations);
        
        // Mettre à jour le rang si nécessaire
        if (updatedData.currentRank !== newRank.id) {
          await updateDoc(userRankRef, {
            currentRank: newRank.id
          });
        }
        
        return updatedData;
      } else {
        // Juste retourner les données existantes si on n'ajoute rien
        return data;
      }
    } else {
      // Créer un nouveau document utilisateur
      const newRank = getUserRank(participationsToAdd);
      const newUserData = {
        userId,
        userName,
        currentRank: newRank.id,
        monthlyParticipations: participationsToAdd,
        totalParticipations: participationsToAdd,
        lastResetDate: getCurrentMonthStart(),
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp()
      };
      
      await setDoc(userRankRef, newUserData);
      return newUserData;
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rang utilisateur:', error);
    return null;
  }
}

// Réinitialiser les participations mensuelles
async function resetMonthlyParticipations(userId, currentData) {
  try {
    const userRankRef = doc(db, USER_RANKS_COLLECTION, userId);
    await updateDoc(userRankRef, {
      monthlyParticipations: 0,
      currentRank: 'boufton', // Retour au rang le plus bas
      lastResetDate: getCurrentMonthStart(),
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation mensuelle:', error);
  }
}

// Fonction de test pour passer au rang suivant (DEV ONLY)
export async function promoteToNextRank(userId) {
  try {
    const userRankRef = doc(db, USER_RANKS_COLLECTION, userId);
    const userRankSnap = await getDoc(userRankRef);
    
    if (userRankSnap.exists()) {
      const data = userRankSnap.data();
      const currentRank = getUserRank(data.monthlyParticipations);
      const nextRank = RANKS.find(rank => rank.minParticipations > currentRank.minParticipations);
      
      if (nextRank) {
        const participationsNeeded = nextRank.minParticipations;
        await updateDoc(userRankRef, {
          monthlyParticipations: participationsNeeded,
          currentRank: nextRank.id,
          lastUpdated: serverTimestamp()
        });
        
        return participationsNeeded;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors de la promotion de rang:', error);
    return null;
  }
}

// Obtenir le classement des utilisateurs par participations mensuelles
export async function getMonthlyLeaderboard(limit = 50) {
  try {
    // Note: Firestore ne supporte pas les requêtes complexes de tri
    // On récupère tous les utilisateurs et on trie côté client
    const userRanksRef = collection(db, USER_RANKS_COLLECTION);
    const snapshot = await getDocs(userRanksRef);
    
    const users = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      users.push({
        userId: doc.id,
        userName: data.userName,
        monthlyParticipations: data.monthlyParticipations,
        currentRank: data.currentRank,
        totalParticipations: data.totalParticipations
      });
    });
    
    // Trier par participations mensuelles décroissantes
    users.sort((a, b) => b.monthlyParticipations - a.monthlyParticipations);
    
    return users.slice(0, limit);
  } catch (error) {
    console.error('Erreur lors de la récupération du classement:', error);
    return [];
  }
}

// Fonction DEV/TEST pour remettre le rang à zéro
export async function resetUserRank(userId, userName) {
  try {
    const userRankRef = doc(db, USER_RANKS_COLLECTION, userId);
    
    // Créer un nouveau document avec 0 participations (rang Boufton)
    const resetData = {
      userId,
      userName,
      currentRank: RANKS[0].id, // Boufton
      monthlyParticipations: 0,
      totalParticipations: 0,
      lastResetDate: getCurrentMonthStart(),
      lastUpdated: serverTimestamp(),
      createdAt: serverTimestamp()
    };
    
    await setDoc(userRankRef, resetData);
    return resetData;
  } catch (error) {
    console.error('Erreur lors du reset du rang:', error);
    return null;
  }
}
