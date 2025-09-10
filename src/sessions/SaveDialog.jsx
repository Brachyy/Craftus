// src/sessions/SaveDialog.jsx
import React, { useEffect, useState } from "react";
import { colors } from "../theme/colors";
import { saveSession } from "./sessions.firebase";
import LogoPicker from "../components/LogoPicker";

export default function SaveDialog({
  open,
  onClose,
  user,
  currentSessionId,
  buildSnapshot,
  onSaved,
  // NEW: pour alimenter le sélecteur
  jobs = [],
  itemTypesMap = {},
  breeds = [],
  suggestedLogo = null,   // {kind,id,name,url} proposé par défaut
}) {
  const [name, setName] = useState("");
  const [logo, setLogo] = useState(suggestedLogo || null);

  useEffect(() => {
    if (open) {
      setName(new Date().toLocaleString());
      setLogo(suggestedLogo || null);
    }
  }, [open, suggestedLogo]);

  if (!open) return null;
  const canSave = !!user;

  async function handleSave() {
    const data = buildSnapshot();
    const { id } = await saveSession({
      uid: user.uid,
      id: currentSessionId || null,
      name,
      data,
      icon: logo || null,
    });
    onSaved?.(id, name);
    onClose?.();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className={`w-full max-w-xl rounded-2xl ${colors.panel} border ${colors.border} p-4`} onClick={(e) => e.stopPropagation()}>
        <div className="text-lg font-semibold mb-2">Enregistrer la session</div>
        {!user && <div className="text-sm text-rose-300 mb-2">Connecte-toi pour enregistrer.</div>}

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm block mb-1">Nom de la session</label>
            <input
              className={`w-full rounded-xl bg-black/20 border ${colors.border} px-3 py-2`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Panoplie Glours – test"
            />
            <div className="text-xs text-slate-400 mt-2">
              Astuce : tu peux rouvrir “Enregistrer” plus tard pour écraser la session et changer le logo.
            </div>
          </div>

          <div>
            <label className="text-sm block mb-2">Logo de la session</label>
            <LogoPicker
              jobs={jobs}
              itemTypesMap={itemTypesMap}
              breeds={breeds}
              value={logo}
              onChange={setLogo}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded-xl bg-white/5">Annuler</button>
          <button
            disabled={!canSave}
            onClick={handleSave}
            className={`px-3 py-2 rounded-xl ${canSave ? "bg-emerald-600 hover:bg-emerald-500" : "bg-emerald-900/40"} text-white`}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
