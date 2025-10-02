import React, { useState, useEffect } from "react";
import { colors } from "../theme/colors";

export default function SearchBar({ query, setQuery, loading, onFocus }) {
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderText, setPlaceholderText] = useState("Rechercher un objet (min. 2 lettres)…");
  
  // Animation du placeholder quand pas de texte et pas de focus
  useEffect(() => {
    if (!query && !isFocused) {
      const variants = [
        "Rechercher un objet (min. 2 lettres)…",
        "Tapez le nom d'un objet…",
        "Recherchez des recettes…",
        "Trouvez vos objets favoris…"
      ];
      
      let currentIndex = 0;
      const interval = setInterval(() => {
        setPlaceholderText(variants[currentIndex]);
        currentIndex = (currentIndex + 1) % variants.length;
      }, 3000);
      
      return () => clearInterval(interval);
    } else {
      setPlaceholderText("Rechercher un objet (min. 2 lettres)…");
    }
  }, [query, isFocused]);

  return (
    <div className="relative mb-4">
      <div className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholderText}
          className={`
            w-full rounded-2xl ${colors.panel} border ${colors.border} 
            px-4 py-3 pr-12 outline-none transition-all duration-300 ease-in-out
            focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
            hover:border-emerald-400/50 hover:shadow-lg hover:shadow-emerald-500/10
            ${loading ? 'animate-pulse' : ''}
            ${isFocused ? 'scale-[1.02] shadow-xl shadow-emerald-500/20' : ''}
          `}
        />
        
        {/* Icône de recherche avec animation */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <div className="flex items-center gap-2">
              {/* Spinner animé */}
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-500 border-t-transparent"></div>
              <span className="text-xs text-emerald-400 animate-pulse">Recherche…</span>
            </div>
          ) : (
            <div className={`
              transition-all duration-300 ease-in-out
              ${isFocused ? 'text-emerald-400 scale-110' : 'text-slate-400'}
            `}>
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </div>
          )}
        </div>
        
        {/* Barre de progression animée pendant la recherche */}
        {loading && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-b-2xl">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-blue-400 animate-pulse rounded-b-2xl"></div>
          </div>
        )}
        
        {/* Effet de glow pendant la recherche */}
        {loading && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 animate-pulse pointer-events-none"></div>
        )}
      </div>
      
      {/* Indicateur de fraîcheur des résultats */}
      {query && !loading && (
        <div className="absolute -bottom-6 left-0 text-xs text-slate-500 animate-fade-in">
          <span className="inline-flex items-center gap-1">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            Résultats en temps réel
          </span>
        </div>
      )}
    </div>
  );
}