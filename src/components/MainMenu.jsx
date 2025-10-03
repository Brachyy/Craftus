import React, { useState } from "react";
import { colors } from "../theme/colors";

export default function MainMenu({
  // Configuration
  serverId,
  setServerId,
  showDebug,
  
  // Actions principales
  onClearAll,
  onSave,
  onLoad,
  user,
  onShowAuthRequired,
  
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
          {/* Serveur - Section dédiée */}
          <div className="menu-group flex items-center justify-center bg-gradient-to-r from-emerald-900/50 to-blue-900/50 rounded-xl px-4 py-4 border-2 border-emerald-500/50 h-20">
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 text-lg">🌐</span>
              <span className="text-emerald-300 text-sm font-medium">Serveur :</span>
              <select
                value={serverId}
                onChange={(e) => setServerId(e.target.value)}
                className={`px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-800/50 to-blue-800/50 text-white border-2 border-emerald-500/50 text-sm font-medium focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 hover:border-emerald-400`}
                title="⚠️ IMPORTANT : Choisissez votre serveur ! Les prix varient énormément entre serveurs"
              >
                {servers.map(server => (
                  <option key={server} value={server} className="bg-slate-800 text-white">{server}</option>
                ))}
              </select>
              <div className="text-xs text-emerald-300/70 max-w-32">
                Les prix varient énormément !
              </div>
            </div>
          </div>

          {/* Données */}
          <div className="menu-group flex items-center justify-center bg-slate-800/50 rounded-xl px-4 py-4 border border-slate-700 h-20">
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
                onClick={() => {
                  if (!user) {
                    onShowAuthRequired();
                    return;
                  }
                  onOpenFavorites();
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  user 
                    ? "bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg hover:shadow-yellow-500/25" 
                    : "bg-yellow-900/40 text-yellow-300/50 hover:bg-yellow-800/60"
                }`}
                title={user ? "Gérer mes favoris" : "Connexion requise pour les favoris"}
                disabled={favoritesLoading}
              >
                {favoritesLoading ? "⏳..." : `⭐ Favoris (${favoritesCount})`}
              </button>
            </div>
          </div>

          {/* Actions principales */}
          <div className="menu-group flex items-center justify-center bg-slate-800/50 rounded-xl px-4 py-4 border border-slate-700 h-20">
            <div className="flex items-center gap-3">
              <button
                onClick={onClearAll}
                className="px-3 py-1.5 rounded-lg bg-red-600/20 text-red-300 border border-red-500/30 hover:bg-red-600/30 hover:border-red-500/50 text-sm transition-all duration-200"
                title="Vider tous les objets de l'accueil"
              >
                🗑️ Vider
              </button>
              
              <button
                onClick={() => {
                  if (!user) {
                    onShowAuthRequired();
                    return;
                  }
                  onSave();
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  user 
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg hover:shadow-emerald-500/25" 
                    : "bg-emerald-900/40 text-emerald-300/50 hover:bg-emerald-800/60"
                }`}
                title={user ? "Enregistrer la session actuelle" : "Connexion requise pour enregistrer"}
              >
                💾 Enregistrer
              </button>
              
              <button
                onClick={() => {
                  if (!user) {
                    onShowAuthRequired();
                    return;
                  }
                  onLoad();
                }}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                  user 
                    ? "bg-blue-600 hover:bg-blue-500 text-white border border-blue-500" 
                    : "bg-blue-900/40 text-blue-300/50 hover:bg-blue-800/60"
                }`}
                title={user ? "Charger une session sauvegardée" : "Connexion requise pour charger"}
              >
                📂 Charger
              </button>
            </div>
          </div>

          {/* Export/Partage */}
          <div className="menu-group flex items-center justify-center bg-slate-800/50 rounded-xl px-4 py-4 border border-slate-700 h-20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (!user) {
                    onShowAuthRequired();
                    return;
                  }
                  onShareByLink();
                }}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                  user 
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 hover:border-purple-500/50" 
                    : "bg-purple-900/40 text-purple-300/50 hover:bg-purple-800/60"
                }`}
                title={user ? "Partager la session via un lien" : "Connexion requise pour partager"}
              >
                🔗 Partager
              </button>
              
              <button
                onClick={() => {
                  if (!user) {
                    onShowAuthRequired();
                    return;
                  }
                  onExportJSON();
                }}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                  user 
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 hover:border-indigo-500/50" 
                    : "bg-indigo-900/40 text-indigo-300/50 hover:bg-indigo-800/60"
                }`}
                title={user ? "Exporter la session en JSON" : "Connexion requise pour exporter"}
              >
                📄 Export
              </button>
              
              <button
                onClick={() => {
                  if (!user) {
                    onShowAuthRequired();
                    return;
                  }
                  onImportJSON();
                }}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                  user 
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 hover:border-indigo-500/50" 
                    : "bg-indigo-900/40 text-indigo-300/50 hover:bg-indigo-800/60"
                }`}
                title={user ? "Importer une session depuis JSON" : "Connexion requise pour importer"}
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
          {/* Serveur - Version mobile améliorée */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-900/30 to-blue-900/30 p-2 rounded-lg border border-emerald-500/30">
            <span className="text-emerald-400 text-sm">🌐</span>
            <span className="text-emerald-300 text-xs font-medium">Serveur:</span>
            <select
              value={serverId}
              onChange={(e) => setServerId(e.target.value)}
              className={`px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-800/50 to-blue-800/50 text-white border border-emerald-500/50 text-xs font-medium`}
              title="⚠️ IMPORTANT : Choisissez votre serveur !"
            >
              {servers.map(server => (
                <option key={server} value={server} className="bg-slate-800 text-white">{server}</option>
              ))}
            </select>
          </div>
          
          {/* Actions principales */}
          <button
            onClick={() => {
              if (!user) {
                onShowAuthRequired();
                return;
              }
              onSave();
            }}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              user 
                ? "bg-emerald-600 hover:bg-emerald-500 text-white" 
                : "bg-emerald-900/40 text-emerald-300/50 hover:bg-emerald-800/60"
            }`}
            title={user ? "Enregistrer" : "Connexion requise"}
          >
            💾
          </button>
          
          <button
            onClick={() => {
              if (!user) {
                onShowAuthRequired();
                return;
              }
              onLoad();
            }}
            className={`px-3 py-2 rounded-lg text-sm ${
              user 
                ? "bg-blue-600 hover:bg-blue-500 text-white" 
                : "bg-blue-900/40 text-blue-300/50 hover:bg-blue-800/60"
            }`}
            title={user ? "Charger" : "Connexion requise"}
          >
            📂
          </button>
          
          <button
            onClick={() => {
              if (!user) {
                onShowAuthRequired();
                return;
              }
              onOpenFavorites();
            }}
            className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
              user 
                ? "bg-yellow-600 hover:bg-yellow-500 text-white" 
                : "bg-yellow-900/40 text-yellow-300/50 hover:bg-yellow-800/60"
            }`}
            disabled={favoritesLoading}
            title={user ? "Favoris" : "Connexion requise"}
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
                    onClick={() => {
                      if (!user) {
                        onShowAuthRequired();
                        return;
                      }
                      onShareByLink();
                    }}
                    className={`mobile-menu-item px-3 py-2 rounded-lg text-sm menu-button ${
                      user 
                        ? "bg-purple-600/20 text-purple-300 border border-purple-500/30" 
                        : "bg-purple-900/40 text-purple-300/50"
                    }`}
                    title={user ? "Partager" : "Connexion requise"}
                  >
                    🔗 Partager
                  </button>
                  <button
                    onClick={() => {
                      if (!user) {
                        onShowAuthRequired();
                        return;
                      }
                      onExportJSON();
                    }}
                    className={`mobile-menu-item px-3 py-2 rounded-lg text-sm menu-button ${
                      user 
                        ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30" 
                        : "bg-indigo-900/40 text-indigo-300/50"
                    }`}
                    title={user ? "Export" : "Connexion requise"}
                  >
                    📄 Export
                  </button>
                  <button
                    onClick={() => {
                      if (!user) {
                        onShowAuthRequired();
                        return;
                      }
                      onImportJSON();
                    }}
                    className={`mobile-menu-item px-3 py-2 rounded-lg text-sm menu-button ${
                      user 
                        ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30" 
                        : "bg-indigo-900/40 text-indigo-300/50"
                    }`}
                    title={user ? "Import" : "Connexion requise"}
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
