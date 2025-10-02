import React, { useState } from "react";
import { colors } from "../theme/colors";

export default function MainMenu({
  // Configuration
  serverId,
  setServerId,
  showDebug,
  setShowDebug,
  
  // Actions principales
  onClearAll,
  onSave,
  onLoad,
  user,
  
  // Données
  onRefreshPrices,
  itemsCount,
  onOpenComparison,
  selectedForComparison,
  onOpenFavorites,
  favoritesCount,
  favoritesLoading,
  
  // Export/Partage
  onShareByLink,
  onExportJSON,
  onImportJSON,
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const servers = [
    "Brial", "Dakal", "Draconiros", "Hell Mina", "Imagiro", 
    "Kourial", "Mikhal", "Orukam", "Rafal", "Salar", 
    "Shadow", "Tal Kasha", "Tylezia"
  ];

  return (
    <div className="mb-4">
      {/* Menu Desktop */}
      <div className="hidden md:block">
        <div className="grid grid-cols-2 gap-4 mb-3">
          {/* Configuration */}
          <div className="menu-group flex items-center justify-between bg-slate-800/50 rounded-xl px-4 py-2 border border-slate-700">
            <span className="text-sm text-slate-300 font-bold">Configuration</span>
            
            <div className="flex items-center gap-3">
              {/* Serveur */}
              <div className="flex items-center gap-2">
                <label className="text-slate-300 text-sm">🌐</label>
                <select
                  value={serverId}
                  onChange={(e) => setServerId(e.target.value)}
                  className={`px-3 py-1.5 rounded-lg bg-[#20242a] text-slate-200 border ${colors.border} text-sm focus:ring-2 focus:ring-emerald-500`}
                  title="Choisissez votre serveur (les prix sont segmentés)"
                >
                  {servers.map(server => (
                    <option key={server} value={server}>{server}</option>
                  ))}
                </select>
              </div>
              
              {/* Debug */}
              <button
                onClick={() => setShowDebug((v) => !v)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                  showDebug 
                    ? "bg-emerald-600 text-white" 
                    : "bg-[#20242a] text-slate-300 border border-slate-600 hover:border-emerald-500"
                }`}
                title="Afficher/masquer les informations de debug"
              >
                🔧 Debug
              </button>
            </div>
          </div>

          {/* Données */}
          <div className="menu-group flex items-center justify-between bg-slate-800/50 rounded-xl px-4 py-2 border border-slate-700">
            <span className="text-sm text-slate-300 font-bold">Données</span>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onRefreshPrices}
                disabled={!itemsCount}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                  itemsCount 
                    ? "bg-slate-600 hover:bg-slate-500 text-white border border-slate-500" 
                    : "bg-slate-800/50 text-slate-500 cursor-not-allowed"
                }`}
                title="Écrase vos prix locaux avec les derniers prix communautaires"
              >
                🔄 Rafraîchir
              </button>
              
              <button
                onClick={onOpenComparison}
                disabled={selectedForComparison.size < 2}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                  selectedForComparison.size >= 2 
                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/25" 
                    : "bg-blue-900/40 text-blue-300/50 cursor-not-allowed"
                }`}
                title="Comparer les prix de vente des objets sélectionnés"
              >
                📊 Comparer ({selectedForComparison.size})
              </button>
              
              <button
                onClick={onOpenFavorites}
                className="px-3 py-1.5 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-yellow-500/25"
                title="Gérer mes favoris"
                disabled={favoritesLoading}
              >
                {favoritesLoading ? "⏳..." : `⭐ Favoris (${favoritesCount})`}
              </button>
            </div>
          </div>

          {/* Actions principales */}
          <div className="menu-group flex items-center justify-between bg-slate-800/50 rounded-xl px-4 py-2 border border-slate-700">
            <span className="text-sm text-slate-300 font-bold">Actions</span>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onClearAll}
                className="px-3 py-1.5 rounded-lg bg-red-600/20 text-red-300 border border-red-500/30 hover:bg-red-600/30 hover:border-red-500/50 text-sm transition-all duration-200"
                title="Vider tous les objets de l'accueil"
              >
                🗑️ Vider
              </button>
              
              <button
                onClick={onSave}
                disabled={!user}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  user 
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg hover:shadow-emerald-500/25" 
                    : "bg-emerald-900/40 text-emerald-300/50 cursor-not-allowed"
                }`}
                title="Enregistrer la session actuelle"
              >
                💾 Enregistrer
              </button>
              
              <button
                onClick={onLoad}
                disabled={!user}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                  user 
                    ? "bg-blue-600 hover:bg-blue-500 text-white border border-blue-500" 
                    : "bg-blue-900/40 text-blue-300/50 cursor-not-allowed"
                }`}
                title="Charger une session sauvegardée"
              >
                📂 Charger
              </button>
            </div>
          </div>

          {/* Export/Partage */}
          <div className="menu-group flex items-center justify-between bg-slate-800/50 rounded-xl px-4 py-2 border border-slate-700">
            <span className="text-sm text-slate-300 font-bold">Export</span>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onShareByLink}
                className="px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 hover:border-purple-500/50 text-sm transition-all duration-200"
                title="Partager la session via un lien"
              >
                🔗 Partager
              </button>
              
              <button
                onClick={onExportJSON}
                className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 hover:border-indigo-500/50 text-sm transition-all duration-200"
                title="Exporter la session en JSON"
              >
                📄 Export
              </button>
              
              <button
                onClick={onImportJSON}
                className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 hover:border-indigo-500/50 text-sm transition-all duration-200"
                title="Importer une session depuis JSON"
              >
                📥 Import
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      <div className="md:hidden">
        {/* Boutons principaux toujours visibles */}
        <div className="flex items-center gap-2 mb-3">
          {/* Serveur */}
          <div className="flex items-center gap-2">
            <label className="text-slate-300 text-sm">🌐</label>
            <select
              value={serverId}
              onChange={(e) => setServerId(e.target.value)}
              className={`px-3 py-2 rounded-lg bg-[#20242a] text-slate-200 border ${colors.border} text-sm`}
            >
              {servers.map(server => (
                <option key={server} value={server}>{server}</option>
              ))}
            </select>
          </div>
          
          {/* Actions principales */}
          <button
            onClick={onSave}
            disabled={!user}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              user 
                ? "bg-emerald-600 hover:bg-emerald-500 text-white" 
                : "bg-emerald-900/40 text-emerald-300/50"
            }`}
          >
            💾
          </button>
          
          <button
            onClick={onLoad}
            disabled={!user}
            className={`px-3 py-2 rounded-lg text-sm ${
              user 
                ? "bg-blue-600 hover:bg-blue-500 text-white" 
                : "bg-blue-900/40 text-blue-300/50"
            }`}
          >
            📂
          </button>
          
          <button
            onClick={onOpenFavorites}
            className="px-3 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white text-sm"
            disabled={favoritesLoading}
          >
            {favoritesLoading ? "⏳" : `⭐ (${favoritesCount})`}
          </button>
          
          {/* Menu hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="px-3 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white text-sm"
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Menu déroulant mobile */}
        {isMobileMenuOpen && (
          <div className="mobile-menu bg-slate-800/90 rounded-xl border border-slate-700 p-4 mb-3 backdrop-blur-sm">
            <div className="grid grid-cols-2 gap-3">
              
              {/* Actions */}
              <div className="space-y-2">
                <div className="text-xs text-slate-400 font-medium mb-2">Actions</div>
                <button
                  onClick={onClearAll}
                  className="mobile-menu-item w-full px-3 py-2 rounded-lg bg-red-600/20 text-red-300 border border-red-500/30 text-sm menu-button"
                >
                  🗑️ Vider
                </button>
                <button
                  onClick={() => setShowDebug(!showDebug)}
                  className={`mobile-menu-item w-full px-3 py-2 rounded-lg text-sm menu-button ${
                    showDebug 
                      ? "bg-emerald-600 text-white" 
                      : "bg-slate-600 text-slate-300"
                  }`}
                >
                  🔧 Debug
                </button>
              </div>

              {/* Données */}
              <div className="space-y-2">
                <div className="text-xs text-slate-400 font-medium mb-2">Données</div>
                <button
                  onClick={onRefreshPrices}
                  disabled={!itemsCount}
                  className={`mobile-menu-item w-full px-3 py-2 rounded-lg text-sm menu-button ${
                    itemsCount 
                      ? "bg-slate-600 text-white" 
                      : "bg-slate-800/50 text-slate-500"
                  }`}
                >
                  🔄 Rafraîchir
                </button>
                <button
                  onClick={onOpenComparison}
                  disabled={selectedForComparison.size < 2}
                  className={`mobile-menu-item w-full px-3 py-2 rounded-lg text-sm menu-button ${
                    selectedForComparison.size >= 2 
                      ? "bg-blue-600 text-white" 
                      : "bg-blue-900/40 text-blue-300/50"
                  }`}
                >
                  📊 Comparer ({selectedForComparison.size})
                </button>
              </div>

              {/* Export */}
              <div className="space-y-2 col-span-2">
                <div className="text-xs text-slate-400 font-medium mb-2">Export/Partage</div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={onShareByLink}
                    className="mobile-menu-item px-3 py-2 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30 text-sm menu-button"
                  >
                    🔗 Partager
                  </button>
                  <button
                    onClick={onExportJSON}
                    className="mobile-menu-item px-3 py-2 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-sm menu-button"
                  >
                    📄 Export
                  </button>
                  <button
                    onClick={onImportJSON}
                    className="mobile-menu-item px-3 py-2 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-sm menu-button"
                  >
                    📥 Import
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
