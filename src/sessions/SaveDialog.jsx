import React, { useEffect, useMemo, useState } from "react";
import { colors } from "../theme/colors";
import { db } from "../lib/firebase";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

/** Nettoyage récursif: Firestore refuse `undefined` */
function sanitizeForFirestore(value) {
  if (Array.isArray(value)) return value.map((v) => sanitizeForFirestore(v));
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (v === undefined) continue; // ou out[k] = null
      const sv = sanitizeForFirestore(v);
      if (sv === undefined) continue;
      out[k] = sv;
    }
    return out;
  }
  if (typeof value === "number" && Number.isNaN(value)) return null;
  return value;
}

export default function SaveDialog({
  open,
  onClose,
  user, // { uid }
  currentSessionId,
  buildSnapshot, // () => snapshot prêt à enregistrer
  onSaved, // (id, name, iconObj)
  jobs = [],
  itemTypesMap = {},
  breeds = [],
  suggestedLogo = null,
}) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(suggestedLogo || null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open) return;
    setErr("");
    setSaving(false);
    // Nom par défaut
    const defaultName = name?.trim()
      ? name
      : `Session ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    setName(defaultName);
    // icône suggérée si rien choisi
    setIcon((prev) => prev || suggestedLogo || null);
  }, [open]);

  // Quelques icônes rapides (jobs + types + classes) pour choisir un petit logo
  const quickIcons = useMemo(() => {
    const arr = [];
    // jobs
    for (const j of jobs) {
      if (j?.iconUrl) arr.push({ kind: "job", id: j.id, name: j.name, url: j.iconUrl });
    }
    // types d'items
    for (const [id, t] of Object.entries(itemTypesMap || {})) {
      if (t?.iconUrl) arr.push({ kind: "type", id, name: t.name, url: t.iconUrl });
    }
    // classes
    for (const b of breeds) {
      if (b?.iconUrl) arr.push({ kind: "class", id: b.id, name: b.name, url: b.iconUrl });
    }
    return arr.slice(0, 60);
  }, [jobs, itemTypesMap, breeds]);

  if (!open) return null;

  async function handleSave() {
    try {
      setSaving(true);
      setErr("");
      if (!user?.uid) throw new Error("Tu dois être connecté pour enregistrer.");

      // Récupère le snapshot depuis l'app
      const raw = buildSnapshot ? buildSnapshot() : {};
      const data = sanitizeForFirestore(raw);

      const payload = sanitizeForFirestore({
        name: name?.trim() || "Session",
        icon: icon ? { kind: icon.kind, id: String(icon.id), name: icon.name || "", url: icon.url || "" } : null,
        data,
        updatedAt: serverTimestamp(),
        // createdAt: seulement à la création (on le mettra plus bas si addDoc)
      });

      const colRef = collection(db, "users", user.uid, "sessions");

      let finalId = currentSessionId || null;

      if (currentSessionId) {
        // On tente de mettre à jour; si ça n'existe pas, on crée
        const docRef = doc(db, "users", user.uid, "sessions", currentSessionId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          await setDoc(docRef, payload, { merge: true });
          finalId = currentSessionId;
        } else {
          // le doc n'existe pas -> création
          const newPayload = { ...payload, createdAt: serverTimestamp() };
          const newRef = await addDoc(colRef, newPayload);
          finalId = newRef.id;
        }
      } else {
        // création directe
        const newPayload = { ...payload, createdAt: serverTimestamp() };
        const newRef = await addDoc(colRef, newPayload);
        finalId = newRef.id;
      }

      onSaved?.(finalId, name?.trim() || "Session", icon || null);
      onClose?.();
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Erreur inconnue pendant l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => (!saving ? onClose?.() : null)}
      />
      {/* modal */}
      <div className={`relative w-full max-w-lg rounded-2xl ${colors.panel} border ${colors.border} p-4`}>
        <div className="text-lg font-semibold mb-3">Enregistrer la session</div>

        <div className="mb-3">
          <label className="block text-sm text-slate-300 mb-1">Nom</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Ma session de craft"
          />
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm text-slate-300">Petit logo (optionnel)</label>
            {icon?.url && (
              <img src={icon.url} alt="" className="h-6 w-6 rounded" />
            )}
          </div>
          <div className="mt-2 grid grid-cols-6 gap-2 max-h-48 overflow-auto pr-1">
            {quickIcons.map((ic) => (
              <button
                key={`${ic.kind}-${ic.id}`}
                onClick={() => setIcon(ic)}
                className={`relative border ${colors.border} rounded-lg bg-black/30 hover:border-emerald-500 p-1`}
                title={ic.name}
              >
                <img src={ic.url} alt="" className="h-8 w-8 rounded object-contain" />
                {icon && icon.kind === ic.kind && String(icon.id) === String(ic.id) && (
                  <span className="absolute -top-1 -right-1 text-[10px] bg-emerald-600 text-white rounded px-1">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {err && (
          <div className="mb-3 text-sm text-rose-300">{err}</div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-3 py-2 rounded-xl bg-white/10 text-slate-200 border border-white/10 hover:bg-white/15"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-2 rounded-xl ${saving ? "bg-emerald-900/40" : "bg-emerald-600 hover:bg-emerald-500"} text-white`}
          >
            {saving ? "Enregistrement..." : (currentSessionId ? "Mettre à jour" : "Enregistrer")}
          </button>
        </div>
      </div>
    </div>
  );
}
