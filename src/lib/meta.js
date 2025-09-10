// src/lib/meta.js
import { apiGET } from "./api";

// Cache simple en mémoire
let TYPES_PROMISE = null;
let BREEDS_PROMISE = null;

const pick = (obj, keys) => keys.reduce((o,k) => (obj?.[k] != null ? obj[k] : o), null);

// --- ITEM TYPES (catégories)
export async function loadItemTypes(setDebugUrl, setDebugErr) {
  if (!TYPES_PROMISE) {
    TYPES_PROMISE = (async () => {
      try {
        const data = await apiGET(`/item-types?$limit=500`, setDebugUrl, setDebugErr);
        const arr = Array.isArray(data) ? data : data?.data ?? [];
        const map = {};
        for (const t of arr) {
          const id =
            t?.id ?? t?._id ?? t?.ankamaId ?? t?.ankama_id ??
            t?.typeId ?? t?.type_id;
          if (id == null) continue;
          const name = t?.name?.fr || t?.name || `Type ${id}`;
          const iconUrl =
            t?.iconUrl || t?.imgUrl || t?.icon || t?.imageUrl ||
            (t?.icon?.url ? t.icon.url : undefined) ||
            (t?.iconId ? `https://api.dofusdb.fr/img/item-types/${t.iconId}.png` : undefined) ||
            `https://api.dofusdb.fr/img/item-types/${id}.png`;
          map[id] = { id, name, iconUrl };
        }
        return map;
      } catch {
        return {};
      }
    })();
  }
  return TYPES_PROMISE;
}

// --- BREEDS (classes)
export async function loadBreeds(setDebugUrl, setDebugErr) {
  if (!BREEDS_PROMISE) {
    BREEDS_PROMISE = (async () => {
      try {
        const data = await apiGET(`/breeds?$limit=100`, setDebugUrl, setDebugErr);
        const arr = Array.isArray(data) ? data : data?.data ?? [];
        return arr
          .map((b) => {
            const id = b?.id ?? b?._id ?? b?.ankamaId ?? b?.ankama_id;
            const name = b?.name?.fr || b?.name || `Classe ${id}`;
            const iconUrl =
              b?.iconUrl || b?.imgUrl || b?.icon || b?.imageUrl ||
              (b?.icon?.url ? b.icon.url : undefined) ||
              (b?.iconId ? `https://api.dofusdb.fr/img/breeds/${b.iconId}.png` : undefined) ||
              (id ? `https://api.dofusdb.fr/img/breeds/${id}.png` : undefined);
            return id != null ? { id, name, iconUrl } : null;
          })
          .filter(Boolean);
      } catch {
        return [];
      }
    })();
  }
  return BREEDS_PROMISE;
}

// --- Extraction robuste du type depuis un item de /items ou /objects
export function extractItemTypeMeta(raw) {
  const typeId =
    raw?.type?.id ?? raw?.itemTypeId ?? raw?.typeId ?? raw?.type_id ?? raw?.item_type_id ?? null;
  const typeName =
    raw?.type?.name?.fr || raw?.type?.name || raw?.itemType || raw?.item_type || raw?.type || null;
  return { typeId, typeName };
}
