// src/lib/communityPrices.js
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,      // ✅ pour t: Timestamp.now() dans les arrays
} from "firebase/firestore";
import { db } from "./firebase";

export const PRICE_KIND = {
  ING: "ing",
  SELL: "sell",
};

function priceDocRef(serverId, kind, itemId) {
  const sid = serverId && String(serverId).trim();
  if (!sid) throw new Error("serverId requis pour publicPrices");
  return doc(db, "publicPrices", `${sid}_${kind}_${itemId}`);
}

export async function getCommunityPrice(kind, itemId, serverId) {
  try {
    const snap = await getDoc(priceDocRef(serverId, kind, itemId));
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
    console.error("[communityPrices:getCommunityPrice] error", { serverId, kind, itemId, e });
    return { lastPrice: null, lastAt: null, history: [] };
  }
}

export async function pushCommunityPrice(kind, itemId, price, uid, serverId) {
  const ref = priceDocRef(serverId, kind, itemId);
  const safePrice = Number(price);
  if (!Number.isFinite(safePrice) || safePrice < 0) return;

  // Throttle simple par doc pour éviter les rafales (500ms)
  const key = `${serverId}_${kind}_${itemId}`;
  if (!pushCommunityPrice._last) pushCommunityPrice._last = new Map();
  const now = Date.now();
  const lastAt = pushCommunityPrice._last.get(key) || 0;
  if (now - lastAt < 500) return; // ignore rafales
  pushCommunityPrice._last.set(key, now);

  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        kind,
        itemId: Number(itemId),
        lastPrice: safePrice,
        lastAt: serverTimestamp(),
        lastUserId: uid || null,
        history: [{ t: Timestamp.now(), p: safePrice }],
      });
      return;
    }
    const d = snap.data();
    const last = typeof d.lastPrice === "number" ? d.lastPrice : null;
    if (last === safePrice) {
      await updateDoc(ref, { lastAt: serverTimestamp(), lastUserId: uid || null });
      return;
    }
    const hist = Array.isArray(d.history) ? d.history.slice() : [];
    hist.push({ t: Timestamp.now(), p: safePrice });
    const trimmed = hist.slice(-50);
    await updateDoc(ref, {
      lastPrice: safePrice,
      lastAt: serverTimestamp(),
      lastUserId: uid || null,
      history: trimmed,
    });
  } catch (e) {
    console.error("[communityPrices:pushCommunityPrice] error", { kind, itemId, price, e });
  }
}
