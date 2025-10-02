import React, { useMemo, useState, useEffect } from "react";
import { itemImage, itemLevel, itemName } from "../lib/utils";

export default function FavoritesModal({
  open,
  onClose,
  favorites,
  items,
  onAddItem,
  onRemoveFavorite,
  itemTypes,
  breeds,
  onLoadFavoriteItems,
}) {
  const [sortBy, setSortBy] = useState("name"); // name, level, type, breed
  const [filterType, setFilterType] = useState("");
  const [filterBreed, setFilterBreed] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Charger les items à l'ouverture du modal
  useEffect(() => {
    if (open && onLoadFavoriteItems) {
      onLoadFavoriteItems();
    }
  }, [open, onLoadFavoriteItems]);

  // Créer une liste des métiers avec les vrais noms et images
  const jobList = useMemo(() => {
    // Récupérer les métiers uniques directement depuis les favoris
    const uniqueBreeds = items
      .map(item => item.breed)
      .filter(Boolean)
      .filter((breed, index, self) => 
        index === self.findIndex(b => b.name?.fr === breed.name?.fr)
      );
    
    return uniqueBreeds;
  }, [items]);

  // Créer une liste des types uniques des favoris
  const availableTypes = useMemo(() => {
    const uniqueTypes = [...new Set(items.map(item => {
      return item.type?.id || item.typeId;
    }).filter(Boolean))];
    
    return itemTypes.filter(type => uniqueTypes.includes(type.id));
  }, [items, itemTypes]);

  const favoriteItems = useMemo(() => {
    return items; // items contient déjà les favoris complets
  }, [items]);

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items;

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        const name = item.displayName || item.name?.fr || "";
        return name.toLowerCase().includes(query);
      });
    }

    // Filtre par type
    if (filterType) {
      filtered = filtered.filter(item => item.type?.id === parseInt(filterType));
    }

    // Filtre par métier
    if (filterBreed) {
      filtered = filtered.filter(item => item.breed?.name?.fr === filterBreed);
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "level":
          return (itemLevel(a) || 0) - (itemLevel(b) || 0);
        case "type":
          const typeA = a.type?.name?.fr || "";
          const typeB = b.type?.name?.fr || "";
          return typeA.localeCompare(typeB, "fr");
        case "breed":
          const breedA = a.breed?.name?.fr || "";
          const breedB = b.breed?.name?.fr || "";
          return breedA.localeCompare(breedB, "fr");
        case "name":
        default:
          const nameA = itemName(a) || "";
          const nameB = itemName(b) || "";
          return nameA.localeCompare(nameB, "fr");
      }
    });

    return filtered;
  }, [favoriteItems, searchQuery, filterType, filterBreed, sortBy]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative rounded-2xl bg-[#0f1319] border border-white/10 shadow-2xl w-[95vw] h-[90vh] max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-semibold text-slate-200">
            Mes Favoris ({favoriteItems.length})
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-2 text-sm text-slate-300"
          >
            ✕ Fermer
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-white/10 bg-[#0b0f14]">
          <div className="flex flex-wrap items-center gap-4">
            {/* Recherche */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-300">Recherche:</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nom de l'objet..."
                className="px-3 py-1 rounded-lg bg-[#1b1f26] text-slate-300 border border-white/10 text-sm w-48"
              />
            </div>

            {/* Tri */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-300">Trier par:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 rounded-lg bg-[#1b1f26] text-slate-300 border border-white/10 text-sm"
              >
                <option value="name">Nom</option>
                <option value="level">Niveau</option>
                <option value="type">Type</option>
                <option value="breed">Métier</option>
              </select>
            </div>

            {/* Filtre type */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-300">Type:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-1 rounded-lg bg-[#1b1f26] text-slate-300 border border-white/10 text-sm"
              >
                <option value="">Tous</option>
                {availableTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name?.fr || type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre métier */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-300">Métier:</label>
              <select
                value={filterBreed}
                onChange={(e) => setFilterBreed(e.target.value)}
                className="px-3 py-1 rounded-lg bg-[#1b1f26] text-slate-300 border border-white/10 text-sm"
              >
                <option value="">Tous</option>
                {jobList.map((breed, index) => (
                  <option key={`${breed.name?.fr}-${index}`} value={breed.name?.fr}>
                    {breed.name?.fr}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 h-[calc(100%-160px)] overflow-y-auto">
          {filteredAndSortedItems.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-slate-400">
                <div className="text-lg mb-2">Aucun favori trouvé</div>
                <div className="text-sm">
                  {searchQuery || filterType || filterBreed 
                    ? "Essayez de modifier vos filtres" 
                    : "Ajoutez des objets à vos favoris en cliquant sur l'étoile"}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredAndSortedItems.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#1b1f26] border border-white/10 hover:bg-[#252a33] transition-colors"
                >
                  <img
                    src={itemImage(item)}
                    alt=""
                    className="w-12 h-12 rounded"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-200 truncate">
                      {itemName(item)}
                    </div>
                  <div className="text-xs text-slate-400">
                    Niveau {itemLevel(item) || "?"} • {item.type?.name?.fr || item.type?.name || item.typeName || "Type inconnu"}
                    {item.breed?.name?.fr && ` • ${item.breed.name.fr}`}
                  </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAddItem(item)}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                    >
                      Ajouter
                    </button>
                    <button
                      onClick={() => onRemoveFavorite(item.ankamaId)}
                      className="p-1 rounded-lg text-yellow-400 hover:text-yellow-300"
                      title="Retirer des favoris"
                    >
                      ★
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0b0f14] rounded-b-2xl">
          <div className="text-xs text-slate-400">
            💡 Cliquez sur "Ajouter" pour ajouter l'objet à votre liste • 
            Cliquez sur l'étoile pour retirer des favoris • 
            Utilisez les filtres pour naviguer rapidement
          </div>
        </div>
      </div>
    </div>
  );
}
