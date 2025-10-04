import { db } from './firebase';
import { collection, addDoc, getDocs, getDoc, doc, setDoc, query, where, orderBy, limit, deleteDoc, updateDoc, increment } from 'firebase/firestore';

// Collection pour les ventes individuelles
const SALES_COLLECTION = 'sales';
// Collection pour les statistiques agrégées
const STATS_COLLECTION = 'dashboard_stats';

/**
 * Enregistrer un item en vente
 */
export async function addItemToSales(userId, item, serverId) {
  if (!userId) throw new Error('Utilisateur non connecté');
  
  const saleData = {
    userId,
    serverId,
    itemId: item.ankamaId,
    itemName: item.displayName,
    itemImage: item.img,
    sellPrice: item.sellPrice || 0,
    investment: calculateInvestment(item),
    gain: calculateGain(item),
    craftCount: item.craftCount || 1,
    timestamp: new Date(),
    sold: false, // false = en vente, true = vendu
  };

  try {
    const docRef = await addDoc(collection(db, SALES_COLLECTION), saleData);
    console.log('Item ajouté en vente:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de l\'ajout en vente:', error);
    throw error;
  }
}

/**
 * Enregistrer plusieurs items en vente
 */
export async function addItemsToSales(userId, items, serverId) {
  if (!userId) throw new Error('Utilisateur non connecté');
  
  const salesData = items.map(item => ({
    userId,
    serverId,
    itemId: item.ankamaId,
    itemName: item.displayName,
    itemImage: item.img,
    sellPrice: item.sellPrice || 0,
    investment: calculateInvestment(item),
    gain: calculateGain(item),
    craftCount: item.craftCount || 1,
    timestamp: new Date(),
    sold: false,
  }));

  try {
    const promises = salesData.map(saleData => 
      addDoc(collection(db, SALES_COLLECTION), saleData)
    );
    const docRefs = await Promise.all(promises);
    console.log(`${docRefs.length} items ajoutés en vente`);
    return docRefs.map(ref => ref.id);
  } catch (error) {
    console.error('Erreur lors de l\'ajout en vente:', error);
    throw error;
  }
}

/**
 * Récupérer les items en vente d'un utilisateur (filtrés par serveur)
 */
export async function getUserSales(userId, serverId) {
  if (!userId) throw new Error('Utilisateur non connecté');
  
  try {
    // Requête simplifiée sans orderBy pour éviter l'index composite
    const q = query(
      collection(db, SALES_COLLECTION),
      where('userId', '==', userId),
      where('serverId', '==', serverId),
      where('sold', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    const sales = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Trier côté client par timestamp (plus récent en premier)
    return sales.sort((a, b) => {
      const timestampA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
      const timestampB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
      return timestampB - timestampA;
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des ventes:', error);
    throw error;
  }
}

/**
 * Marquer un item comme vendu
 */
export async function markItemAsSold(saleId, userId) {
  if (!userId) throw new Error('Utilisateur non connecté');
  
  try {
    // Récupérer les données de la vente avant de la marquer comme vendue
    const saleDoc = await getDoc(doc(db, SALES_COLLECTION, saleId));
    
    if (!saleDoc.exists()) {
      throw new Error('Vente non trouvée');
    }
    
    const saleData = {
      ...saleDoc.data(),
      saleId: saleId // Ajouter l'ID de la vente
    };
    
    // Marquer comme vendu
    await updateDoc(doc(db, SALES_COLLECTION, saleId), {
      sold: true,
      soldAt: new Date()
    });
    
    // Mettre à jour les stats du dashboard
    await updateDashboardStats(userId, saleData.serverId, saleData);
    
    console.log('Item marqué comme vendu:', saleId);
  } catch (error) {
    console.error('Erreur lors de la vente:', error);
    throw error;
  }
}

/**
 * Retirer un item de la vente (supprimer complètement)
 */
export async function removeItemFromSales(saleId, userId) {
  if (!userId) throw new Error('Utilisateur non connecté');
  
  try {
    await deleteDoc(doc(db, SALES_COLLECTION, saleId));
    console.log('Item retiré de la vente:', saleId);
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    throw error;
  }
}

/**
 * Modifier le prix de vente d'un item
 */
export async function updateSalePrice(saleId, newPrice, userId) {
  if (!userId) throw new Error('Utilisateur non connecté');
  
  try {
    // Récupérer les données actuelles
    const saleDoc = await getDoc(doc(db, SALES_COLLECTION, saleId));
    
    if (!saleDoc.exists()) {
      throw new Error('Vente non trouvée');
    }
    
    const saleData = saleDoc.data();
    
    // Calculer le nouveau gain
    const tax = newPrice * 0.02; // 2% de taxe
    const newGain = (newPrice - tax) - saleData.investment;
    
    // Mettre à jour le prix et le gain
    await updateDoc(doc(db, SALES_COLLECTION, saleId), {
      sellPrice: newPrice,
      gain: newGain,
      lastUpdated: new Date()
    });
    
    console.log('Prix de vente mis à jour:', saleId, 'Nouveau prix:', newPrice);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du prix:', error);
    throw error;
  }
}

/**
 * Mettre à jour les statistiques du dashboard
 */
async function updateDashboardStats(userId, serverId, saleData) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const periods = [
    { period: 'day', start: startOfDay },
    { period: 'week', start: startOfWeek },
    { period: 'month', start: startOfMonth }
  ];
  
  for (const { period, start } of periods) {
    const statsId = `${userId}_${serverId}_${period}_${start.getTime()}`;
    
    try {
      // Vérifier si le document existe
      const statsDoc = await getDoc(doc(db, STATS_COLLECTION, statsId));
      
      if (statsDoc.exists()) {
        // Mettre à jour les totaux existants
        await updateDoc(doc(db, STATS_COLLECTION, statsId), {
          totalGains: increment(saleData.gain),
          totalInvestment: increment(saleData.investment),
          salesCount: increment(1),
          lastUpdated: new Date()
        });
      } else {
        // Créer le document avec les données initiales
        await setDoc(doc(db, STATS_COLLECTION, statsId), {
          userId,
          period,
          periodStart: start,
          totalGains: saleData.gain,
          totalInvestment: saleData.investment,
          salesCount: 1,
          lastUpdated: new Date(),
          topItems: []
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des stats:', error);
    }
    
    // Mettre à jour le top 10 des items
    await updateTopItems(userId, serverId, period, start, saleData);
  }
}

/**
 * Mettre à jour le top 10 des items les plus rentables
 */
async function updateTopItems(userId, serverId, period, periodStart, saleData) {
  const statsId = `${userId}_${serverId}_${period}_${periodStart.getTime()}`;
  
  try {
    const statsDoc = await getDoc(doc(db, STATS_COLLECTION, statsId));
    
    if (statsDoc.exists()) {
      const statsData = statsDoc.data();
      const topItems = statsData.topItems || [];
      
      // Ajouter chaque vente comme une entrée séparée dans le Top 10
      // Chaque vente reste individuelle, même si c'est le même item
      topItems.push({
        saleId: saleData.saleId || '', // ID unique de la vente
        itemId: saleData.itemId || 0,
        itemName: saleData.itemName || '',
        itemImage: saleData.itemImage || '',
        totalGain: saleData.gain || 0,
        totalInvestment: saleData.investment || 0,
        salesCount: 1,
        totalQuantitySold: (saleData.craftCount || 1),
        sellPrice: saleData.sellPrice || 0,
        timestamp: saleData.timestamp || new Date()
      });
      
      // Trier par gain total et garder seulement le top 10
      topItems.sort((a, b) => b.totalGain - a.totalGain);
      const top10 = topItems.slice(0, 10);
      
      // Nettoyer les valeurs undefined avant de sauvegarder
      const cleanedTop10 = top10.map(item => ({
        saleId: item.saleId || '',
        itemId: item.itemId || 0,
        itemName: item.itemName || '',
        itemImage: item.itemImage || '',
        totalGain: item.totalGain || 0,
        totalInvestment: item.totalInvestment || 0,
        salesCount: item.salesCount || 1,
        totalQuantitySold: item.totalQuantitySold || 1,
        sellPrice: item.sellPrice || 0,
        timestamp: item.timestamp || new Date()
      }));
      
      // Mettre à jour le document
      await updateDoc(doc(db, STATS_COLLECTION, statsId), {
        topItems: cleanedTop10
      });
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du top items:', error);
  }
}

/**
 * Récupérer les statistiques du dashboard (filtrées par serveur)
 */
export async function getDashboardStats(userId, serverId, period = 'day') {
  if (!userId) throw new Error('Utilisateur non connecté');
  
  const today = new Date();
  let start;
  
  switch (period) {
    case 'day':
      start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      break;
    case 'week':
      start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      start.setDate(start.getDate() - start.getDay());
      break;
    case 'month':
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    default:
      throw new Error('Période invalide');
  }
  
  try {
    // Calculer les métriques avancées (toujours disponibles)
    const advancedStats = await calculateAdvancedMetrics(userId, serverId, period, start);
    
    // Utiliser getDoc avec l'ID du document directement
    const statsId = `${userId}_${serverId}_${period}_${start.getTime()}`;
    const statsDoc = await getDoc(doc(db, STATS_COLLECTION, statsId));
    
    if (statsDoc.exists()) {
      const stats = statsDoc.data();
      
      return {
        ...stats,
        ...advancedStats
      };
    }
    
    // Retourner les métriques avancées même si dashboard_stats n'existe pas
    return {
      ...advancedStats,
      topItems: []
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    throw error;
  }
}

/**
 * Calculer les métriques avancées (taux de réussite, temps moyen, volume) filtrées par serveur
 */
async function calculateAdvancedMetrics(userId, serverId, period, periodStart) {
  try {
    // Récupérer toutes les ventes de l'utilisateur pour le serveur spécifique
    const q = query(
      collection(db, SALES_COLLECTION),
      where('userId', '==', userId),
      where('serverId', '==', serverId)
    );
    
    const querySnapshot = await getDocs(q);
    const allSales = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filtrer côté client par période
    const filteredSales = allSales.filter(sale => {
      const saleTime = sale.timestamp?.toDate ? sale.timestamp.toDate() : new Date(sale.timestamp);
      return saleTime >= periodStart;
    });
    
    // Séparer les ventes vendues et non vendues (en utilisant les ventes filtrées par période)
    const soldSales = filteredSales.filter(sale => sale.sold === true);
    const unsoldSales = filteredSales.filter(sale => sale.sold === false);
    
    // Calculer le taux de réussite basé sur les items vendus vs total des actions
    // Total des actions = vendus + retirés + prix modifiés
    const totalActions = soldSales.length + unsoldSales.length; // Tous les items qui ont eu une action
    const successRate = totalActions > 0 ? (soldSales.length / totalActions) * 100 : 0;
    
    // Calculer le temps moyen de vente (en heures)
    let averageSaleTime = -1; // -1 par défaut pour indiquer "pas de données"
    if (soldSales.length > 0) {
      const totalSaleTime = soldSales.reduce((sum, sale) => {
        const saleTime = sale.soldAt?.toDate ? sale.soldAt.toDate() : new Date(sale.soldAt);
        const listTime = sale.timestamp?.toDate ? sale.timestamp.toDate() : new Date(sale.timestamp);
        return sum + (saleTime - listTime);
      }, 0);
      const averageMs = totalSaleTime / soldSales.length;
      averageSaleTime = averageMs / (1000 * 60 * 60); // Convertir en heures
    }
    
    // Calculer le volume total (nombre d'items vendus)
    const totalVolume = soldSales.reduce((sum, sale) => sum + (sale.craftCount || 1), 0);
    
    // Calculer les gains et investissements totaux à partir des ventes vendues
    const totalGains = soldSales.reduce((sum, sale) => sum + (sale.gain || 0), 0);
    const totalInvestment = soldSales.reduce((sum, sale) => sum + (sale.investment || 0), 0);
    
    return {
      successRate: Math.round(successRate * 10) / 10, // Arrondir à 1 décimale
      averageSaleTime: Math.round(averageSaleTime * 10) / 10, // Arrondir à 1 décimale
      totalVolume,
      totalListed: totalActions,
      soldCount: soldSales.length,
      unsoldCount: unsoldSales.length,
      totalGains,
      totalInvestment,
      salesCount: soldSales.length
    };
  } catch (error) {
    console.error('Erreur lors du calcul des métriques avancées:', error);
    return {
      successRate: 0,
      averageSaleTime: -1, // Default to -1
      totalVolume: 0,
      totalListed: 0,
      soldCount: 0,
      unsoldCount: 0,
      totalGains: 0,
      totalInvestment: 0,
      salesCount: 0
    };
  }
}

/**
 * Récupérer l'historique des gains par jour pour le graphique
 */
export async function getDailyGainsHistory(userId, serverId, days = 30) {
  if (!userId) throw new Error('Utilisateur non connecté');
  
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  
  try {
    // Requête simplifiée avec userId, serverId et period pour éviter l'index composite
    const q = query(
      collection(db, STATS_COLLECTION),
      where('userId', '==', userId),
      where('serverId', '==', serverId),
      where('period', '==', 'day')
    );
    
    const querySnapshot = await getDocs(q);
    const history = querySnapshot.docs
      .map(doc => ({
        date: doc.data().periodStart.toDate(),
        gains: doc.data().totalGains || 0,
        investment: doc.data().totalInvestment || 0,
        salesCount: doc.data().salesCount || 0
      }))
      .filter(item => item.date >= startDate && item.date <= endDate);
    
    // Si pas de données dans dashboard_stats, calculer depuis sales
    if (history.length === 0) {
      return await calculateDailyHistoryFromSales(userId, serverId, startDate, endDate);
    }
    
    // Trier côté client par date (plus ancien en premier)
    return history.sort((a, b) => a.date - b.date);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    throw error;
  }
}

// Fonctions utilitaires pour les calculs
function calculateInvestment(item) {
  const ingredientsCost = (item.ingredients || []).reduce((sum, ing) => {
    if (ing.farmed) return sum;
    return sum + (ing.unitPrice ?? 0) * ing.qty;
  }, 0);
  
  // Utiliser la fonction isEquipment pour détecter les équipements
  const runeCost = isEquipment(item) ? Number(item.runeInvestment || 0) : 0;
  
  return (ingredientsCost + runeCost) * (item.craftCount || 1);
}

// Fonction pour détecter les équipements (copiée de utils.js)
function isEquipment(it) {
  const t = (it?.type?.name?.fr || it?.type?.name || it?.type || "")
    .toString().toLowerCase();
  const st = (it?.type?.superType?.name?.fr || it?.type?.superType?.name || it?.superType?.name || "")
    .toString().toLowerCase();
  return st.includes("équip") || st.includes("equip") || [
    "amulette","anneau","coiffe","cape","bottes","ceinture","bouclier","dofus",
    "trophée","trophee","familier","montilier","épée","epee","arc","marteau",
    "hache","pelle","baguette","bâton","baton","dague"
  ].some(k => t.includes(k));
}

function calculateGain(item) {
  const investment = calculateInvestment(item);
  const grossRevenue = (item.sellPrice ?? 0) * (item.craftCount || 1);
  const tax = grossRevenue * 0.02; // 2% de taxe
  const netRevenue = grossRevenue - tax;
  
  return netRevenue - investment;
}

/**
 * Calculer l'historique quotidien depuis les ventes (fallback)
 */
async function calculateDailyHistoryFromSales(userId, serverId, startDate, endDate) {
  try {
    // Récupérer toutes les ventes vendues pour le serveur
    const q = query(
      collection(db, SALES_COLLECTION),
      where('userId', '==', userId),
      where('serverId', '==', serverId),
      where('sold', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const sales = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Grouper par jour
    const dailyStats = {};
    
    sales.forEach(sale => {
      const saleDate = sale.soldAt?.toDate ? sale.soldAt.toDate() : new Date(sale.soldAt);
      if (saleDate >= startDate && saleDate <= endDate) {
        const dayKey = saleDate.toISOString().split('T')[0];
        if (!dailyStats[dayKey]) {
          dailyStats[dayKey] = {
            date: new Date(saleDate.getFullYear(), saleDate.getMonth(), saleDate.getDate()),
            gains: 0,
            investment: 0,
            salesCount: 0
          };
        }
        dailyStats[dayKey].gains += sale.gain || 0;
        dailyStats[dayKey].investment += sale.investment || 0;
        dailyStats[dayKey].salesCount += 1;
      }
    });
    
    // Convertir en array et trier
    return Object.values(dailyStats).sort((a, b) => a.date - b.date);
  } catch (error) {
    console.error('Erreur lors du calcul de l\'historique depuis les ventes:', error);
    return [];
  }
}
