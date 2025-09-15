// src/lib/communityPrices.js
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  Timestamp,      // ✅ pour t: Timestamp.now() dans les arrays
} from "firebase/firestore";
import { db } from "./firebase";

export const PRICE_KIND = {
  ING: "ing",
  SELL: "sell",
};

function priceDocRef(kind, itemId) {
  return doc(db, "publicPrices", `${kind}_${itemId}`);
}

export async function getCommunityPrice(kind, itemId) {
  try {
    const snap = await getDoc(priceDocRef(kind, itemId));
    if (!snap.exists()) {
      return { lastPrice: null, lastAt: null, history: [] };
    }
    const d = snap.data();
    const history = Array.isArray(d.history) ? d.history : [];
    return {
      lastPrice: typeof d.lastPrice === "number" ? d.lastPrice : null,
      lastAt: d.lastAt ?? null,
      history,
    };
  } catch (e) {
    console.error("[communityPrices:getCommunityPrice] error", { kind, itemId, e });
    return { lastPrice: null, lastAt: null, history: [] };
  }
}

export async function pushCommunityPrice(kind, itemId, price, uid) {
  const ref = priceDocRef(kind, itemId);
  const safePrice = Number(price);
  if (!Number.isFinite(safePrice) || safePrice < 0) return;

  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);

      if (!snap.exists()) {
        // Création : OK de mettre serverTimestamp() sur un champ scalaire
        tx.set(ref, {
          kind,
          itemId: Number(itemId),
          lastPrice: safePrice,
          lastAt: serverTimestamp(),
          lastUserId: uid || null,
          // ⚠️ dans un array, on utilise Timestamp.now()
          history: [{ t: Timestamp.now(), p: safePrice }],
        });
        return;
      }

      const d = snap.data();
      const last = typeof d.lastPrice === "number" ? d.lastPrice : null;

      if (last === safePrice) {
        // Même prix → on met juste à jour l’horodatage et l’auteur
        tx.update(ref, {
          lastAt: serverTimestamp(),
          lastUserId: uid || null,
        });
        return;
      }

      const hist = Array.isArray(d.history) ? d.history.slice() : [];
      hist.push({ t: Timestamp.now(), p: safePrice }); // ✅
      const trimmed = hist.slice(-50);

      tx.update(ref, {
        lastPrice: safePrice,
        lastAt: serverTimestamp(),
        lastUserId: uid || null,
        history: trimmed,
      });
    });
  } catch (e) {
    console.error("[communityPrices:pushCommunityPrice] error", { kind, itemId, price, e });
  }
}
