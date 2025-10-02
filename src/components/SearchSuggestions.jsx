import React, { useEffect, useRef } from "react";

export default function SearchSuggestions({
  suggestions,
  searchHistory,
  favorites,
  items,
  onSelectItem,
  onSelectHistory,
  onSelectFavorite,
  loading,
  onClose,
  query, // Ajouter la query pour filtrer les favoris
}) {
  const wrapRef = useRef(null);

  // Fermer au clic extérieur
  useEffect(() => {
    function onDocDown(e) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) onClose?.();
    }
    document.addEventListener("pointerdown", onDocDown);
    return () => document.removeEventListener("pointerdown", onDocDown);
  }, [onClose]);
  // Filtrer les favoris selon la query
  const filteredFavorites = query && query.trim().length >= 2 
    ? items.filter(item => {
        const name = item.displayName || item.name?.fr || "";
        return name.toLowerCase().includes(query.trim().toLowerCase());
      })
    : [];

  if (loading) {
    return (
      <div className="absolute top-full left-0 right-0 z-50 bg-[#0f1319] border border-white/10 rounded-xl shadow-2xl mt-1 max-h-80 overflow-y-auto">
        <div className="p-4 text-center text-slate-400">
          <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          Recherche en cours...
        </div>
      </div>
    );
  }

  if (!suggestions.length && !searchHistory.length && !filteredFavorites.length) {
    return null;
  }

  return (
    <div ref={wrapRef} className="absolute top-full left-0 right-0 z-50 bg-[#0f1319] border border-white/10 rounded-xl shadow-2xl mt-1 max-h-96 overflow-y-auto">
      {/* Favoris filtrés - affichés en premier lors de la recherche */}
      {filteredFavorites.length > 0 && (
        <div className="p-2">
          <div className="text-xs text-yellow-400 mb-2 px-2 flex items-center gap-2">
            <span className="text-yellow-400">★</span>
            Favoris correspondants ({filteredFavorites.length})
          </div>
          {filteredFavorites.map((item) => (
            <button
              key={item.key}
              onClick={() => onSelectFavorite(item)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-yellow-500/10 text-left border border-yellow-500/20"
            >
              <img
                src={item.img}
                alt=""
                className="w-8 h-8 rounded border border-yellow-500/30"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-yellow-100 truncate font-medium">
                  {item.displayName || item.name?.fr || "Sans nom"}
                </div>
                <div className="text-xs text-yellow-300">
                  Niveau {item.level || "?"} • {item.type?.name?.fr || "Type inconnu"}
                </div>
              </div>
              <span className="text-yellow-400 text-lg">★</span>
            </button>
          ))}
        </div>
      )}

      {/* Séparateur entre favoris et suggestions */}
      {filteredFavorites.length > 0 && suggestions.length > 0 && (
        <div className="px-4 py-2">
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </div>
      )}

      {/* Suggestions de recherche */}
      {suggestions.length > 0 && (
        <div className="p-2">
          <div className="text-xs text-slate-400 mb-2 px-2">
            Résultats de recherche ({suggestions.length})
            {suggestions.length >= 20 && (
              <span className="ml-2 text-yellow-400">• Limité à 20 résultats</span>
            )}
          </div>
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onSelectItem(item)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-left"
            >
              <img
                src={item.img}
                alt=""
                className="w-8 h-8 rounded"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-200 truncate">
                  {item.displayName || item.name?.fr || "Sans nom"}
                </div>
                <div className="text-xs text-slate-400">
                  Niveau {item.level || "?"} • {item.type?.name?.fr || "Type inconnu"}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Historique de recherche - seulement si pas de recherche active */}
      {!query && searchHistory.length > 0 && (
        <div className="p-2 border-t border-white/10">
          <div className="text-xs text-slate-400 mb-2 px-2">Recherches récentes</div>
          {searchHistory.map((query, idx) => (
            <button
              key={idx}
              onClick={() => onSelectHistory(query)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-left"
            >
              <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center">
                <span className="text-xs text-slate-400">🕒</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-300 truncate">{query}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
