// src/lib/dropRates.js
// API pour récupérer les statistiques de drop des items

const API = 'https://api.dofusdb.fr';
const lang = 'fr';

/** Utilitaire pour construire des query strings lisibles */
const q = (obj) => new URLSearchParams(obj).toString();

/**
 * Récupère un item avec ses drops éventuels
 */
async function getItemWithPossibleDrops(ankamaId) {
  // Essayer différentes variantes de l'endpoint items
  const variants = [
    `${API}/items?${q({ id: ankamaId, lang, $limit: 1 })}`,
    `${API}/items?${q({ ankama_id: ankamaId, lang, $limit: 1 })}`,
    `${API}/items?${q({ ankamaId: ankamaId, lang, $limit: 1 })}`,
    `${API}/items?${q({ item_id: ankamaId, lang, $limit: 1 })}`,
    `${API}/items?${q({ itemId: ankamaId, lang, $limit: 1 })}`,
  ];
  
  for (const url of variants) {
    try {
      const r = await fetch(url);
      if (r.ok) {
        const response = await r.json();
        const item = response?.data?.[0];
        if (item) {
          return item;
        }
      }
    } catch (error) {
      // Ignore errors and try next variant
    }
  }
  return undefined;
}

/**
 * Récupère les drops via le service dédié
 */
async function getDropsByItem(ankamaId) {
  // L'API /drops n'existe pas, retourner directement un tableau vide
  return [];
}

/**
 * Essayer de récupérer les drops via les monstres filtrés
 */
async function getDropsViaMonsters(ankamaId) {
  const variants = [
    `${API}/monsters?${q({ 'drops.objectId': ankamaId, lang, $limit: 500 })}`,
    `${API}/monsters?${q({ 'drops.item_id': ankamaId, lang, $limit: 500 })}`,
    `${API}/monsters?${q({ 'drops.itemId': ankamaId, lang, $limit: 500 })}`,
    `${API}/monsters?${q({ 'drops.ankama_id': ankamaId, lang, $limit: 500 })}`,
    `${API}/monsters?${q({ 'drops.ankamaId': ankamaId, lang, $limit: 500 })}`,
  ];
  
  for (const url of variants) {
    try {
      const r = await fetch(url);
      if (r.ok) {
        const data = await r.json();
        return data;
      }
    } catch (error) {
      // Ignore errors and try next variant
    }
  }
  return [];
}

/**
 * Récupère les monstres par leurs IDs
 */
async function getMonstersByIds(ids) {
  if (!ids.length) return [];
  const base = q({ lang, $limit: 500 });
  const selects = '&$select[]=ankama_id&$select[]=name&$select[]=level&$select[]=image&$select[]=icon';
  const url = `${API}/monsters?ankama_id[$in]=${ids.join(',')}&${base}${selects}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Monsters ${r.status}`);
  return await r.json();
}

/**
 * Normalise les clés possibles (snakeCase vs camelCase)
 */
function normalizeDropData(drop, ankamaId) {
  return {
    monsterId: drop.monster_id ?? drop.monsterId ?? drop.monster ?? drop.mobId,
    itemId: drop.objectId ?? drop.item_id ?? drop.itemId ?? ankamaId,
    dropRate: drop.dropRate ?? drop.percentDropForGrade1 ?? drop.percentDropForGrade2 ?? drop.percentDropForGrade3 ?? drop.rate ?? drop.drop_rate ?? drop.percentage ?? drop.chance,
    count: drop.count ?? 1,
    monsterName: drop.monsterName ?? drop.monster_name,
    monsterLevel: drop.monsterLevel ?? drop.monster_level,
    monsterImage: drop.monsterImage ?? drop.monster_image
  };
}

/**
 * Fonction principale pour récupérer les statistiques de drop d'un item
 * Retourne [{ monsterId, monsterName, monsterLevel, monsterImage, dropRate }]
 */
export async function getItemDropTable(ankamaId) {
  try {
    // Étape 1: Essayer de récupérer l'item avec ses drops
    const item = await getItemWithPossibleDrops(ankamaId);
    
    let drops = [];
    
    // Étape 2: Vérifier si l'item contient déjà les drops
    if (Array.isArray(item?.drops) && item.drops.length) {
      drops = item.drops;
    } else {
      // Étape 3: Essayer le service drops dédié
      drops = await getDropsByItem(ankamaId);
      
      // Étape 4: Si toujours rien, essayer via les monstres
      if (!drops.length) {
        const monstersData = await getDropsViaMonsters(ankamaId);
        if (monstersData && monstersData.data && monstersData.data.length) {
          // Extraire les drops des monstres
          drops = monstersData.data.flatMap(monster => 
            monster.drops?.filter(drop => 
              drop.objectId === ankamaId
            ).map(drop => ({
              ...drop,
              monster_id: monster.ankama_id,
              monsterId: monster.ankama_id,
              monsterName: monster.name?.fr || monster.name,
              monsterLevel: monster.level,
              monsterImage: monster.img,
              dropRate: drop.percentDropForGrade1 || drop.percentDropForGrade2 || drop.percentDropForGrade3 || 0
            })) || []
          );
          
          // Si on a trouvé des drops via les monstres, retourner directement
          if (drops.length > 0) {
            return drops.map(drop => ({
              monsterId: drop.monsterId,
              monsterName: drop.monsterName,
              monsterLevel: drop.monsterLevel,
              monsterImage: drop.monsterImage,
              dropRate: drop.dropRate
            }));
          }
        }
      }
    }
    
    
    if (!drops.length) {
      return []; // Aucun drop trouvé
    }
    
    // Étape 4: Normaliser les données de drop
    const normalized = drops
      .map(d => normalizeDropData(d, ankamaId))
      .filter(d => d.monsterId != null && d.rate != null);
    
    if (!normalized.length) {
      return [];
    }
    
    // Étape 5: Récupérer les détails des monstres
    const monsterIds = [...new Set(normalized.map(d => d.monsterId))];
    const monsters = await getMonstersByIds(monsterIds);
    const monstersById = Object.fromEntries(monsters.map(m => [m.ankama_id, m]));
    
    // Étape 6: Assembler les données finales
    const result = normalized.map(drop => {
      const monster = monstersById[drop.monsterId] || {};
      
      // Chercher un champ image plausible
      const monsterImage = monster.image || monster.icon || monster.img || null;
      
      return {
        monsterId: drop.monsterId,
        monsterName: monster.name || `Monstre ${drop.monsterId}`,
        monsterLevel: monster.level || 0,
        monsterImage: monsterImage,
        itemId: drop.itemId,
        dropRate: drop.rate // Souvent en fraction (0.01 = 1%)
      };
    });
    
    // Étape 7: Trier par taux de drop décroissant
    return result.sort((a, b) => (b.dropRate ?? 0) - (a.dropRate ?? 0));
    
  } catch (error) {
    console.error('Erreur lors de la récupération des drops:', error);
    return [];
  }
}

/**
 * Formate le taux de drop en pourcentage lisible
 */
export function formatDropRate(rate) {
  if (typeof rate !== 'number') return '0%';
  
  // Si le taux est déjà en pourcentage (ex: 1.5)
  if (rate > 1) {
    return `${rate.toFixed(1)}%`;
  }
  
  // Si le taux est en fraction (ex: 0.015)
  return `${(rate * 100).toFixed(2)}%`;
}

/**
 * Obtient l'URL de l'image du monstre
 */
export function getMonsterImageUrl(imagePath) {
  if (!imagePath) return null;
  
  // Si c'est déjà une URL complète
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Sinon, construire l'URL avec le renderer DofusDB
  return `https://renderer.dofusdb.fr/renderer/item/${imagePath}`;
}
