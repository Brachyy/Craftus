import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "./firebase";
import { itemName, itemImage, itemLevel } from "./utils";
import { apiGET, tryFetchRecipesForItem } from "./api";

const FAVORITES_COLLECTION = "userFavorites";

/**
 * Ajouter un item aux favoris d'un utilisateur
 */
export async function addToFavorites(uid, itemId) {
  if (!uid) throw new Error("User ID required");
  
  try {
    // Vérifier si l'item n'est pas déjà en favori
    const existingQuery = query(
      collection(db, FAVORITES_COLLECTION),
      where("uid", "==", uid),
      where("itemId", "==", itemId)
    );
    const existingDocs = await getDocs(existingQuery);
    
    if (!existingDocs.empty) {
      console.log("Item already in favorites");
      return;
    }

    // Sauvegarder seulement l'ID de l'item
    await addDoc(collection(db, FAVORITES_COLLECTION), {
      uid,
      itemId: itemId,
      addedAt: serverTimestamp(),
    });
    
    console.log("Item added to favorites");
  } catch (error) {
    console.error("Error adding to favorites:", error);
    throw error;
  }
}

/**
 * Reconstruire les items des favoris depuis DofusDB
 */
export async function rebuildFavoriteItems(favoriteIds) {
  if (!favoriteIds || favoriteIds.length === 0) return [];
  
  try {
    const items = [];
    
    for (const itemId of favoriteIds) {
      try {
        // Récupérer l'item depuis DofusDB (comme dans searchItems)
        const itemData = await apiGET(`/items/${itemId}`);
        
        if (itemData) {
          // Récupérer les recettes pour avoir les infos métier (comme dans addItem)
          const recs = await tryFetchRecipesForItem(itemId);
          const jobName = recs[0]?.jobName || recs[0]?.job?.name?.fr || recs[0]?.job?.name || undefined;
          const jobId = recs[0]?.jobId ?? recs[0]?.job?.id;
          
          // Construire l'item exactement comme dans addItem
          const item = {
            key: `fav_${itemId}`,
            ankamaId: itemId,
            displayName: itemName(itemData) || `Item ${itemId}`,
            level: itemLevel(itemData),
            img: itemImage(itemData),
            name: itemData.name,
            type: itemData.type,
            breed: recs[0]?.job ? {
              name: { fr: recs[0].job.name?.fr || recs[0].job.name },
              img: recs[0].job.img || recs[0].job.iconUrl,
              iconUrl: recs[0].job.img || recs[0].job.iconUrl
            } : null,
            jobName: jobName,
            jobIconUrl: recs[0]?.job?.img || recs[0]?.job?.iconUrl,
            jobLevel: recs[0]?.jobLevel || recs[0]?.level,
          };
          
          items.push(item);
        }
      } catch (error) {
        console.error(`Error fetching item ${itemId}:`, error);
        // Continuer avec les autres items même si un échoue
      }
    }
    
    return items;
  } catch (error) {
    console.error("Error rebuilding favorite items:", error);
    throw error;
  }
}

/**
 * Retirer un item des favoris d'un utilisateur
 */
export async function removeFromFavorites(uid, itemId) {
  if (!uid) throw new Error("User ID required");
  
  try {
    const favoritesRef = collection(db, FAVORITES_COLLECTION);
    const favoritesSnapshot = await getDocs(favoritesRef);
    
    const docsToDelete = favoritesSnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.uid === uid && data.itemId === itemId;
    });
    
    const deletePromises = docsToDelete.map(docSnapshot => 
      deleteDoc(doc(db, FAVORITES_COLLECTION, docSnapshot.id))
    );
    
    await Promise.all(deletePromises);
    console.log("Item removed from favorites");
  } catch (error) {
    console.error("Error removing from favorites:", error);
    throw error;
  }
}

/**
 * Récupérer tous les favoris d'un utilisateur
 */
export async function getUserFavorites(uid) {
  if (!uid) throw new Error("User ID required");
  
  try {
    const favoritesRef = collection(db, FAVORITES_COLLECTION);
    const favoritesSnapshot = await getDocs(favoritesRef);
    
    const userFavorites = favoritesSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(fav => fav.uid === uid);
    
    return userFavorites;
  } catch (error) {
    console.error("Error fetching favorites:", error);
    throw error;
  }
}

/**
 * Vérifier si un item est dans les favoris d'un utilisateur
 */
export async function isItemFavorite(uid, itemId) {
  if (!uid) return false;
  
  try {
    const favoritesRef = collection(db, FAVORITES_COLLECTION);
    const favoritesSnapshot = await getDocs(favoritesRef);
    
    const userFavorites = favoritesSnapshot.docs
      .map(doc => doc.data())
      .filter(fav => fav.uid === uid && fav.itemId === itemId);
    
    return userFavorites.length > 0;
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return false;
  }
}