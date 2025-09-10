// src/sessions/LoadDialog.jsx
import React, { useEffect, useState } from "react";
import { colors } from "../theme/colors";
import { listSessions, getSession, deleteSession, renameSession } from "./sessions.firebase";

export default function LoadDialog({ open, onClose, user, onLoaded }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (!open || !user) return;
    (async () => {
      setLoading(true);
      const arr = await listSessions(user.uid);
      setRows(arr);
      setLoading(false);
    })();
  }, [open, user]);

  if (!open) return null;

  async function handleLoad(id) {
    const doc = await getSession(user.uid, id);
    if (doc?.data) {
      onLoaded?.({ id: doc.id, name: doc.name, data: doc.data });
      onClose?.();
    }
  }
  async function handleDelete(id) {
    if (!confirm("Supprimer cette session ?")) return;
    await deleteSession(user.uid, id);
    setRows((prev) => prev.filter((r) => r.id !== id));
  }
  async function handleRename(row) {
    if (!newName.trim()) return;
    await renameSession(user.uid, row.id, newName.trim());
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, name: newName.trim() } : r)));
    setRenamingId(null);
    setNewName("");
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className={`w-full max-w-2xl rounded-2xl ${colors.panel} border ${colors.border} p-4`} onClick={(e) => e.stopPropagation()}>
        <div className="text-lg font-semibold mb-2">Charger une session</div>
        {!user && <div className="text-sm text-rose-300 mb-2">Connecte-toi pour accéder à tes sessions.</div>}

        <div className="max-h-[60vh] overflow-auto rounded-xl border border-white/5">
          {loading ? (
            <div className="p-4 text-slate-400 text-sm">Chargement…</div>
          ) : rows.length === 0 ? (
            <div className="p-4 text-slate-400 text-sm">Aucune session enregistrée.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-black/20">
                <tr>
                  <th className="text-left p-3">Logo</th>
                  <th className="text-left p-3">Nom</th>
                  <th className="text-left p-3">Dernière maj</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-white/5">
                    <td className="p-3">
                      {row.icon?.url ? (
                        <img src={row.icon.url} alt="" className="h-6 w-6 rounded" />
                      ) : (
                        <div className="h-6 w-6 rounded bg-white/10" />
                      )}
                    </td>
                    <td className="p-3">
                      {renamingId === row.id ? (
                        <input
                          className={`rounded-lg bg-black/20 border ${colors.border} px-2 py-1`}
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                        />
                      ) : (
                        <span className="font-medium">{row.name}</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-400">
                      {row.updatedAt?.toDate ? row.updatedAt.toDate().toLocaleString() : "—"}
                    </td>
                    <td className="p-3 flex gap-2">
                      <button onClick={() => handleLoad(row.id)} className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white">Charger</button>
                      {renamingId === row.id ? (
                        <>
                          <button onClick={() => handleRename(row)} className="px-2 py-1 rounded-lg bg-white/10">OK</button>
                          <button onClick={() => { setRenamingId(null); setNewName(""); }} className="px-2 py-1 rounded-lg bg-white/10">Annuler</button>
                        </>
                      ) : (
                        <button onClick={() => { setRenamingId(row.id); setNewName(row.name); }} className="px-2 py-1 rounded-lg bg-white/10">Renommer</button>
                      )}
                      <button onClick={() => handleDelete(row.id)} className="px-2 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-200">Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-3 py-2 rounded-xl bg-white/5">Fermer</button>
        </div>
      </div>
    </div>
  );
}
