import React, { useEffect, useRef } from "react";
import { colors } from "../theme/colors";
import { itemImage, itemLevel, itemName } from "../lib/utils";

export default function SearchBar({ query, setQuery, suggestions, loading, onChoose }) {
  const [open, setOpen] = React.useState(false);
  const wrapRef = useRef(null);

  // ouvrir quand on a des résultats
  useEffect(() => {
    setOpen(Boolean(suggestions?.length));
  }, [suggestions]);

  // fermer au clic extérieur
  useEffect(() => {
    function onDocDown(e) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", onDocDown);
    return () => document.removeEventListener("pointerdown", onDocDown);
  }, []);

  return (
    <div ref={wrapRef} className="relative mb-4">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => suggestions?.length && setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Rechercher un objet (min. 2 lettres)…"
        className={`w-full rounded-2xl ${colors.panel} border ${colors.border} px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500`}
      />
      {loading && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">Recherche…</div>}

      {open && suggestions?.length > 0 && (
        <div className={`absolute z-40 mt-2 w-full rounded-2xl ${colors.panel} border ${colors.border} max-h-96 overflow-auto`}>
          {suggestions.map((s) => {
            const name = itemName(s) || "Objet";
            const lvl = itemLevel(s);
            const img = itemImage(s);
            return (
              <button
                key={(s._id ?? s.id ?? s.ankamaId ?? s.ankama_id) + "-" + name}
                onClick={() => {
                  onChoose?.(s);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-white/5 flex items-center gap-3"
              >
                {img ? <img src={img} className="h-8 w-8 rounded" /> : <div className="h-8 w-8 rounded bg-black/30" />}
                <div className="flex-1">
                  <div className="text-sm font-medium">{name}</div>
                  <div className="text-xs text-slate-400">Niv. {lvl ?? "—"}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
