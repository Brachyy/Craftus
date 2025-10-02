import { isEquipment, itemAnkamaId } from "./utils";
import { normalizeRecipe } from "./normalize";

export const API_BASE_DEFAULT = "https://api.dofusdb.fr";

export async function apiGET(path, setDebugUrl, setDebugErr) {
  const url = `${API_BASE_DEFAULT}${path}`;
  setDebugUrl?.(url);
  setDebugErr?.("");
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    const msg = `${res.status} ${res.statusText} :: ${url} :: ${t.slice(0, 200)}`;
    setDebugErr?.(msg);
    throw new Error(msg);
  }
  return res.json();
}


// Fonction pour récupérer les détails d'un effet spécifique
async function fetchEffectDetails(effectId) {
  try {
    const response = await apiGET(`/effects/${effectId}?lang=fr`, null, null);
    return response;
  } catch (error) {
    console.warn(`[fetchEffectDetails] Failed to fetch effect ${effectId}:`, error);
    return null;
  }
}

// Fonction pour récupérer les caractéristiques depuis l'API
async function fetchCharacteristics() {
  try {
    // Récupérer toutes les caractéristiques en utilisant la pagination
    let allCharacteristics = [];
    let skip = 0;
    const limit = 50; // Limite par page
    
    while (true) {
      const response = await apiGET(`/characteristics?$limit=${limit}&$skip=${skip}`, null, null);
      const characteristics = response.data || [];
      
      if (characteristics.length === 0) {
        break; // Plus de données
      }
      
      allCharacteristics = allCharacteristics.concat(characteristics);
      skip += limit;
      
      // Sécurité pour éviter une boucle infinie
      if (skip > 50000) {
        console.warn('[fetchCharacteristics] Stopped at 50000 characteristics to avoid infinite loop');
        break;
      }
    }
    
    console.log(`[fetchCharacteristics] Total characteristics fetched: ${allCharacteristics.length}`);
    
    // Créer un mapping complet de 0 à 200 pour couvrir tous les IDs possibles
    const characteristicMap = {};
    allCharacteristics.forEach(c => {
      characteristicMap[c.id] = c;
    });
    
    // Ajouter des caractéristiques manquantes avec des noms par défaut
    for (let id = 0; id <= 200; id++) {
      if (!characteristicMap[id]) {
        characteristicMap[id] = {
          id: id,
          keyword: `unknown_${id}`,
          name: { fr: `Effet ${id}`, en: `Effect ${id}` }
        };
      }
    }
    
    console.log(`[fetchCharacteristics] Created complete mapping for IDs 0-200`);
    
    return Object.values(characteristicMap);
  } catch (error) {
    console.warn('[fetchCharacteristics] Failed to fetch characteristics:', error);
    return [];
  }
}

export async function fetchItemStats(itemId, setDebugUrl, setDebugErr) {
  try {
    const response = await apiGET(`/items?id=${itemId}`, setDebugUrl, setDebugErr);
    
    if (!response.data || response.data.length === 0) {
      return null;
    }
    
    const item = response.data[0];
    
    // Récupérer les caractéristiques depuis l'API
    const characteristics = await fetchCharacteristics();
    
    // Créer un mapping des caractéristiques
    const characteristicMap = {};
    characteristics.forEach(c => {
      characteristicMap[c.id] = c;
    });
    
    // Utiliser SEULEMENT item.effects pour éviter tous les doublons
    const possibleEffects = item.effects ? [item.effects] : [];
    
    // Récupérer seulement les noms des effets uniques
    const uniqueEffectIds = [...new Set(possibleEffects.flat().map(e => e.effectId).filter(Boolean))];
    const effectNamesMap = {};
    
    // Récupérer les noms des effets en parallèle
    const effectPromises = uniqueEffectIds.map(async (effectId) => {
      const details = await fetchEffectDetails(effectId);
      if (details && details.description && details.description.fr) {
        effectNamesMap[effectId] = details.description.fr
          .replace(/#1/g, '')
          .replace(/#2/g, '')
          .replace(/\{\{~[^}]*\}\}/g, '')
          .trim();
      }
    });
    
    await Promise.all(effectPromises);
    
    // Extraire les effets de l'item
    const effects = [];
    const damages = [];
    const weaponInfo = [];
    
    // Logs de debug supprimés pour la production
    
    possibleEffects.forEach((effectsArray, index) => {
      if (Array.isArray(effectsArray)) {
        effectsArray.forEach(effect => {
          // Log de debug supprimé pour la production
          
          // Extraire la valeur depuis item.effects (structure simple)
          let value;
          if (effect.from !== undefined && effect.to !== undefined) {
            if (effect.from === effect.to) {
              value = effect.from;
            } else {
              value = `${effect.from} à ${effect.to}`;
            }
          } else {
            value = effect.value || effect.amount || effect.quantity || effect.bonus || effect.from;
          }
          
          // Récupérer le nom de l'effet depuis l'API
          let effectType = effectNamesMap[effect.effectId] || `Effet ${effect.effectId}`;
          
          
          // Déterminer la catégorie selon la logique DofusDB
          let category = 'effect'; // Par défaut : effet
          
          // PRIORITÉ 1: Dégâts/Vol : characteristic: -1 et category: 2
          if (effect.characteristic === -1 && effect.category === 2) {
            category = 'damage';
          }
          // PRIORITÉ 2: Informations d'arme : caractéristiques spécifiques (PA, PM, etc.)
          // MAIS SEULEMENT si ce n'est PAS déjà un dégât
          else if (effect.characteristic === 34 || effect.characteristic === 56) { // PA et PM
            category = 'weapon';
          }
          
          if (value !== undefined && value !== null && effectType) {
            if (category === 'damage') {
              // Ajouter aux dégâts
              damages.push({
                type: effectType,
                value: value,
                characteristic: effect.characteristic,
                elementId: effect.elementId
              });
            } else if (category === 'weapon') {
              // Ajouter aux informations d'arme
              weaponInfo.push({
                type: effectType,
                value: value,
                characteristic: effect.characteristic
              });
            } else {
              // Ajouter aux effets
              let iconUrl = null;
              if (effect.effectId) {
                iconUrl = `https://api.dofusdb.fr/img/effects/${effect.effectId}.png`;
              }
              
              effects.push({
                type: effectType,
                value: value,
                description: effect.description || `${value} ${effectType}`,
                iconId: effect.iconId,
                elementId: effect.elementId,
                category: effect.category,
                effectId: effect.effectId,
                characteristic: effect.characteristic,
                iconUrl: iconUrl
              });
            }
          }
        });
      } else if (typeof effectsArray === 'object') {
        // Si c'est un objet, essayer de l'analyser
        Object.entries(effectsArray).forEach(([key, value]) => {
          if (typeof value === 'number' && value > 0) {
            effects.push({
              type: key,
              value: value,
              description: `${value} ${key}`
            });
          }
        });
      }
    });
    
    
    // Vérifier si les informations d'arme sont déjà dans les effets
    const hasPAInEffects = item.effects?.some(e => e.characteristic === 34);
    const hasPMInEffects = item.effects?.some(e => e.characteristic === 56);
    
    // Ajouter seulement les informations d'arme qui ne sont PAS dans les effets
    if (item.apCost && !hasPAInEffects) {
      weaponInfo.push({
        type: 'PA',
        value: item.apCost,
        characteristic: 'AP'
      });
    }
    
    if (item.range) {
      weaponInfo.push({
        type: 'Portée',
        value: item.range,
        characteristic: 'Range'
      });
    }
    
    if (item.criticalHitProbability) {
      weaponInfo.push({
        type: 'Critique',
        value: `${item.criticalHitProbability}%`,
        characteristic: 'Critical'
      });
    }
    
    if (item.criticalHitBonus) {
      weaponInfo.push({
        type: 'Bonus Critique',
        value: item.criticalHitBonus,
        characteristic: 'CriticalBonus'
      });
    }
    
    // Extraire les dégâts pour les armes (déjà déclaré plus haut)
    
    if (item.weaponInfo) {
      
      // Structure possible pour les dégâts d'arme
      if (item.weaponInfo.minDamage && item.weaponInfo.maxDamage) {
        // Déterminer l'élément de l'arme
        const elementMap = {
          1: 'Terre',
          2: 'Eau', 
          3: 'Air',
          4: 'Feu',
          5: 'Neutre'
        };
        const element = elementMap[item.elementId] || elementMap[item.weaponInfo.elementId] || '';
        const damageType = element ? `Dégâts ${element}` : 'Dégâts';
        
        damages.push({
          type: damageType,
          value: `${item.weaponInfo.minDamage}-${item.weaponInfo.maxDamage}`,
          characteristic: 'Damage'
        });
        
        // Log supprimé pour la production
      }
      
      // Autres propriétés d'arme
      if (item.weaponInfo.apCost) {
        damages.push({
          type: 'PA',
          value: item.weaponInfo.apCost,
          characteristic: 'AP'
        });
      }
      
      if (item.weaponInfo.range) {
        damages.push({
          type: 'Portée',
          value: item.weaponInfo.range,
          characteristic: 'Range'
        });
      }
      
      if (item.weaponInfo.criticalHit) {
        damages.push({
          type: 'Critique',
          value: item.weaponInfo.criticalHit,
          characteristic: 'Critical'
        });
      }
    } else {
      // Essayer d'autres structures possibles pour les dégâts
      
      // Chercher des propriétés de dégâts dans l'item principal
      if (item.minDamage && item.maxDamage) {
        damages.push({
          type: 'Dégâts',
          value: `${item.minDamage}-${item.maxDamage}`,
          characteristic: 'Damage'
        });
      }
      
      if (item.apCost) {
        damages.push({
          type: 'PA',
          value: item.apCost,
          characteristic: 'AP'
        });
      }
      
      if (item.range) {
        damages.push({
          type: 'Portée',
          value: item.range,
          characteristic: 'Range'
        });
      }
    }
    
    return {
      id: item.id,
      name: item.name?.fr || item.name,
      level: item.level,
      category: item.type?.name?.fr || item.type?.name,
      weight: item.realWeight,
      description: item.description?.fr || item.description,
      effects: effects,
      damages: damages,
      weaponInfo: weaponInfo,
      set: item.itemSet?.name?.fr || item.itemSet?.name,
      iconUrl: item.img ? `https://api.dofusdb.fr/img/items/${item.img}` : null
    };
  } catch (error) {
    console.warn(`[fetchItemStats] Failed to fetch stats for item ${itemId}:`, error);
    return null;
  }
}

export async function fetchRecipeMetaForItem(resultItemId, setDebugUrl, setDebugErr) {
  const q = `/recipes?$limit=1&resultItemId=${encodeURIComponent(resultItemId)}`;
  const data = await apiGET(q, setDebugUrl, setDebugErr);
  const arr = Array.isArray(data) ? data : data?.data ?? [];
  const r = arr[0];
  if (!r) return null;

  const jobId =
    r.professionId ?? r.jobId ?? r.skill?.jobId ?? r.skill?.professionId ?? r?.skillId ?? null;
  const levelRequired =
    r.jobLevel ?? r.level ?? r.requiredJobLevel ?? r.skillLevel ?? null;

  return {
    jobId: jobId != null ? String(jobId) : null,
    levelRequired: levelRequired != null ? Number(levelRequired) : null,
  };
}


export async function tryFetchRecipesForItem(ankamaId, setDebugUrl, setDebugErr) {
  const variants = [
    `?resultId=${ankamaId}`,
    `?result_id=${ankamaId}`,
    `?itemId=${ankamaId}`,
    // Fallbacks additionnels connus sur certaines versions
    `?resultItemId=${ankamaId}`,
  ];
  for (const v of variants) {
    try {
      const data = await apiGET(`/recipes${v}`, setDebugUrl, setDebugErr);
      const arr = Array.isArray(data) ? data : data?.data ?? [];
      if (arr.length) return arr;
    } catch { /* next */ }
  }
  return [];
}

export async function fetchRecipeEntriesForItem(ankamaId, setDebugUrl, setDebugErr) {
  const recs = await tryFetchRecipesForItem(ankamaId, setDebugUrl, setDebugErr);
  if (!recs.length) return [];
  return normalizeRecipe(recs[0]);
}

export async function fetchItemsByIds(ids, setDebugUrl, setDebugErr) {
  if (!ids.length) return {};
  const queries = [
    `/items?id[$in][]=${ids.join("&id[$in][]=")}`,
    `/items?ankamaId[$in][]=${ids.join("&ankamaId[$in][]=")}`,
    `/items?ankama_id[$in][]=${ids.join("&ankama_id[$in][]=")}`,
    `/objects?id[$in][]=${ids.join("&id[$in][]=")}`,
    `/objects?ankamaId[$in][]=${ids.join("&ankamaId[$in][]=")}`,
  ];
  for (const path of queries) {
    try {
      const data = await apiGET(path, setDebugUrl, setDebugErr);
      const arr = Array.isArray(data) ? data : data?.data ?? [];
      if (arr.length) {
        const map = {};
        for (const it of arr) {
          const id = itemAnkamaId(it);
          if (id) map[id] = it;
        }
        return map;
      }
    } catch { /* try next */ }
  }
  return {};
}

export async function searchItems({ query, filters, setDebugUrl, setDebugErr }) {
  if (!query || query.trim().length < 2) return [];
  const q = encodeURIComponent(query.trim());
  const services = ["items"]; // éviter "objects" qui renvoie 404 sur cette API
  const build = (svc) => [
    // Prioriser les regex plutôt que $search (évite certains 500)
    `/${svc}?$limit=20&name[$regex]=${q}&name[$options]=i&language=fr`,
    `/${svc}?$limit=20&name.fr[$regex]=${q}&name.fr[$options]=i`,
    `/${svc}?$limit=20&name[$regex]=${q}&name[$options]=i`,
    `/${svc}?$limit=20&$search=${q}&language=fr`,
    `/${svc}?$limit=20&$search=${q}`,
  ];

  let base = [];
  for (const svc of services) {
    for (const path of build(svc)) {
      try {
        const data = await apiGET(path, setDebugUrl, setDebugErr);
        const arr = Array.isArray(data) ? data : data?.data ?? [];
        if (arr.length) { base = arr; break; }
      } catch { /* try next */ }
    }
    if (base.length) break;
  }
  if (!base.length) return [];

  if (filters.equipmentOnly) base = base.filter(isEquipment);

  if (filters.craftableOnly || (filters.jobId || filters.jobName)) {
    const limited = base.slice(0, 20);
    const results = await Promise.allSettled(limited.map(async (it) => {
      const id = itemAnkamaId(it);
      const recs = await tryFetchRecipesForItem(id, setDebugUrl, setDebugErr);
      const jobName = recs[0]?.jobName || recs[0]?.job?.name?.fr || recs[0]?.job?.name || undefined;
      const jobId = recs[0]?.jobId ?? recs[0]?.job?.id;
      return { it, has: recs.length > 0, jobName, jobId };
    }));
    base = results
      .filter(r => r.status === "fulfilled")
      .map(r => r.value)
      .filter(meta => meta && (!filters.craftableOnly || meta.has))
      .filter(meta => {
        if (!filters.jobId && !filters.jobName) return true;
        const J = `${meta.jobName || ""}`.toLowerCase();
        return (filters.jobId && String(meta.jobId) === String(filters.jobId)) ||
               (filters.jobName && J.includes(filters.jobName.toLowerCase()));
      })
      .map(meta => meta.it);
  }

  return base.slice(0, 20);
}
