// src/lib/utils.js

/** Retire les accents et met en minuscule pour des comparaisons robustes */
export function stripAccents(input) {
  if (input == null) return "";
  const s = String(input);
  try {
    return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  } catch {
    return s.toLowerCase();
  }
}

/** Forcer un entier (kamas) ou undefined si vide / invalide */
export function toInt(value) {
  if (value === "" || value == null) return undefined;
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  return Math.round(n);
}

/** Nom d’item (priorité FR, sinon EN/DE/ES ou titre) */
export function itemName(it) {
  if (!it) return "?";
  if (typeof it.name === "string") return it.name;
  if (it.name?.fr) return it.name.fr;
  if (it.title?.fr) return it.title.fr;
  return it.name?.en || it.name?.de || it.name?.es || "?";
}

/** Image d’item (garde tes priorités, ajoute des fallbacks inoffensifs) */
export function itemImage(it) {
  const direct = it?.img || it?.imgUrl || it?.icon || it?.imageUrl || it?.iconUrl || it?.image?.url;
  if (direct) return direct;

  if (it?.images && typeof it.images === "object") {
    const vals = Object.values(it.images).filter(Boolean);
    if (vals.length) return String(vals[0]);
  }
  const id =
    it?.iconId ??
    it?.gfxId ??
    it?.gfx ??
    itemAnkamaId(it);
  if (id != null) {
    return `https://api.dofusdb.fr/img/items/${id}.png`;
  }
  return undefined;
}

/** Niveau (tes champs d’origine + quelques alias si présents) */
export function itemLevel(it) {
  return (
    it?.level ??
    it?.lvl ??
    it?.minLevel ??
    (typeof it?.levelRequired === "number" ? it.levelRequired : undefined)
  );
}

/** ID Ankama → nombre si possible (comportement identique au tien) */
export function itemAnkamaId(it) {
  const v = it?.ankamaId ?? it?.ankama_id ?? it?.id ?? it?._id;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/** Heuristique “équipement” (inchangée) */
export function isEquipment(it) {
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

/** Format monnaie (inchangé) */
export function currency(n) {
  if (n === undefined || Number.isNaN(n)) return "–";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
}

/* ================== Calculs (inchangés) ================== */
export function computeInvestment(it) {
  // Calculer le coût des ingrédients
  const perUnit = (it.ingredients || []).reduce((sum, ing) => {
    if (ing.farmed) return sum;
    return sum + (ing.unitPrice ?? 0) * ing.qty;
  }, 0);
  
  // Ajouter le coût des runes (seulement pour les équipements)
  const runeInvestment = isEquipment(it) ? Number(it.runeInvestment || 0) : 0;
  
  return (perUnit + runeInvestment) * (it.craftCount || 1);
}
export function computeRevenue(it) {
  return (it.sellPrice ?? 0) * (it.craftCount || 1);
}
export function computeGain(it) {
  return computeRevenue(it) - computeInvestment(it);
}
export function computeCoeff(it) {
  const inv = computeInvestment(it);
  const rev = computeRevenue(it);
  if (!inv) return null;
  return rev / inv;
}
