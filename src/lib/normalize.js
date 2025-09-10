// Normalise les différentes formes de recettes retournées par l’API
export function normalizeRecipe(rec) {
  const out = [];
  if (!rec) return out;
  const rawIng = rec.ingredients ?? rec.recipe ?? rec.materials ?? rec.ingredientIds ?? rec.ingredient_ids ?? [];
  const qArr   = rec.quantities ?? rec.ingredientQuantities ?? rec.qty ?? rec.counts ?? [];
  const qMap   = rec.quantitiesById || rec.qtyById || rec.countById || rec.quantities_by_id || null;

  if (Array.isArray(rawIng) && rawIng.some(e => typeof e === "object")) {
    rawIng.forEach((e, i) => {
      const iid = Number(e.itemId ?? e.id ?? e.ankamaId ?? e.ankama_id);
      let qty   = Number(e.quantity ?? e.qty ?? e.count);
      if (!Number.isFinite(qty) && qMap && iid in qMap) qty = Number(qMap[iid]);
      if (!Number.isFinite(qty) && Array.isArray(qArr))  qty = Number(qArr[i]);
      if (!Number.isFinite(qty)) qty = 1;
      if (Number.isFinite(iid)) out.push({ itemId: iid, quantity: qty });
    });
    return out;
  }

  if (Array.isArray(rawIng)) {
    rawIng.forEach((e, i) => {
      const iid = Number(e);
      let qty = 1;
      if (qMap && iid in qMap) qty = Number(qMap[iid]);
      else if (Array.isArray(qArr)) qty = Number(qArr[i] ?? 1);
      out.push({ itemId: iid, quantity: Number.isFinite(qty) && qty > 0 ? qty : 1 });
    });
    return out;
  }

  if (rawIng && typeof rawIng === "object") {
    for (const [k,v] of Object.entries(rawIng)) {
      const iid = Number(k);
      const qty = Number(v);
      if (Number.isFinite(iid))
        out.push({ itemId: iid, quantity: Number.isFinite(qty) && qty > 0 ? qty : 1 });
    }
  }
  return out;
}
