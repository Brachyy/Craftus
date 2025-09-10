export function itemName(it) {
  if (!it) return "?";
  if (typeof it.name === "string") return it.name;
  if (it.name?.fr) return it.name.fr;
  if (it.title?.fr) return it.title.fr;
  return it.name?.en || it.name?.de || it.name?.es || "?";
}
export function itemImage(it) {
  return it?.img || it?.imgUrl || it?.icon || it?.imageUrl || undefined;
}
export function itemLevel(it) {
  return it?.level ?? it?.lvl;
}
export function itemAnkamaId(it) {
  const v = it?.ankamaId ?? it?.ankama_id ?? it?.id ?? it?._id;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
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
export function currency(n) {
  if (n === undefined || Number.isNaN(n)) return "–";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
}
// calculs
export function computeInvestment(it) {
  const perUnit = it.ingredients.reduce((sum, ing) => sum + (ing.unitPrice ?? 0) * ing.qty, 0);
  return perUnit * (it.craftCount || 1);
}
export function computeRevenue(it) {
  return (it.sellPrice ?? 0) * (it.craftCount || 1);
}
export function computeGain(it) { return computeRevenue(it) - computeInvestment(it); }
export function computeCoeff(it) {
  const inv = computeInvestment(it);
  const rev = computeRevenue(it);
  if (!inv) return null;
  return rev / inv;
}
