import React from "react";
import { colors } from "../theme/colors";
import { itemName, itemLevel, itemImage, itemAnkamaId } from "../lib/utils";

export default function SearchBar({ query, setQuery, suggestions, loading, onChoose }) {
  return (
    <div className={`relative mb-6 rounded-2xl border ${colors.border} ${colors.panel} shadow`}>
      <input
        className="w-full bg-transparent px-4 py-3 rounded-2xl focus:outline-none"
        placeholder="Rechercher un objet… (min. 2 lettres)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {loading && <div className="absolute right-4 top-3 text-sm">…</div>}
      {suggestions.length > 0 && (
        <div className={`absolute z-10 mt-2 max-h-96 w-full overflow-auto rounded-xl border ${colors.border} ${colors.panel} shadow-lg`}>
          {suggestions.map((s, idx) => (
            <button
              key={`${idx}-${itemAnkamaId(s) ?? itemName(s)}`}
              onClick={() => onChoose(s)}
              className="w-full flex items-center gap-3 p-3 hover:bg-black/20 text-left"
            >
              {itemImage(s) ? <img src={itemImage(s)} alt="" className="h-8 w-8 rounded"/> : <div className="h-8 w-8 rounded bg-black/30" />}
              <div className="flex-1">
                <div className="font-medium">{itemName(s)}</div>
                {itemLevel(s) !== undefined && <div className="text-slate-400 text-xs">Niv. {itemLevel(s)}</div>}
              </div>
              <span className="text-emerald-400 text-xs">Ajouter au fil</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
