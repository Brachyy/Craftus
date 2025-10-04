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
  
  // Sales system
  onPutAllItemsOnSale,
  onOpenSalesModal,
  onOpenDashboardModal,
  saleLoading,
}) {
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
                    ? "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600" 
                    : "bg-gray-800/50 text-gray-500 cursor-not-allowed"
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
                    ? "bg-gray-700 hover:bg-gray-600 text-white shadow-lg hover:shadow-gray-500/25" 
                    : "bg-gray-800/40 text-gray-400/50 cursor-not-allowed"
                }`}
                title={selectedForComparison.size >= 2 ? "Comparer les items sélectionnés" : "Sélectionnez au moins 2 items"}
              >
                📊 Comparer ({selectedForComparison.size})
              </button>
              
              <button
                onClick={onOpenFavorites}
                disabled={favoritesLoading}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                  user 
                    ? "bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg hover:shadow-yellow-500/25" 
                    : "bg-yellow-900/40 text-yellow-300/50 hover:bg-yellow-800/60"
                }`}
                title={user ? "Gérer mes favoris" : "Connexion requise pour les favoris"}
              >
                {favoritesLoading ? "⏳..." : `⭐ Favoris (${favoritesCount})`}
              </button>
            </div>
          </div>

          {/* Sessions */}
          <div className="menu-group flex items-center justify-center bg-slate-800/50 rounded-xl px-4 py-4 border border-slate-700 h-20">
            <div className="flex items-center gap-3">
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
                    ? "bg-gray-700 hover:bg-gray-600 text-white shadow-lg hover:shadow-gray-500/25" 
                    : "bg-gray-800/40 text-gray-400/50 hover:bg-gray-700/60"
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
                    ? "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600" 
                    : "bg-gray-800/40 text-gray-400/50 hover:bg-gray-700/60"
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
                    ? "bg-gray-700/20 text-gray-300 border border-gray-500/30 hover:bg-gray-600/30 hover:border-gray-500/50" 
                    : "bg-gray-800/40 text-gray-400/50 hover:bg-gray-700/60"
                }`}
                title={user ? "Partager la session par lien" : "Connexion requise pour partager"}
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
                    ? "bg-gray-700/20 text-gray-300 border border-gray-500/30 hover:bg-gray-600/30 hover:border-gray-500/50" 
                    : "bg-gray-800/40 text-gray-400/50 hover:bg-gray-700/60"
                }`}
                title={user ? "Exporter la session en JSON" : "Connexion requise pour exporter"}
              >
                📤 Export
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
                    ? "bg-gray-700/20 text-gray-300 border border-gray-500/30 hover:bg-gray-600/30 hover:border-gray-500/50" 
                    : "bg-gray-800/40 text-gray-400/50 hover:bg-gray-700/60"
                }`}
                title={user ? "Importer une session depuis JSON" : "Connexion requise pour importer"}
              >
                📥 Import
              </button>
            </div>
          </div>

        </div>

        {/* Section système de vente - Pleine largeur */}
        <div className="menu-group flex items-center justify-center bg-gradient-to-r from-emerald-900/30 to-blue-900/30 rounded-xl px-4 py-4 border border-emerald-500/20 h-20">
          <div className="flex items-center gap-3">
            
            <button
              onClick={() => {
                if (!user) {
                  onShowAuthRequired();
                  return;
                }
                onPutAllItemsOnSale();
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                user && itemsCount > 0
                  ? "bg-gray-700 hover:bg-gray-600 text-white shadow-lg hover:shadow-gray-500/25" 
                  : "bg-gray-800/40 text-gray-400/50 hover:bg-gray-700/60"
              }`}
              title={user ? "Mettre tous les items en vente" : "Connexion requise"}
              disabled={!user || itemsCount === 0 || saleLoading}
            >
              {saleLoading ? "⏳..." : `Vendre tout (${itemsCount})`}
            </button>
            
            <button
              onClick={() => {
                if (!user) {
                  onShowAuthRequired();
                  return;
                }
                onOpenSalesModal();
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                user 
                  ? "bg-gray-700 hover:bg-gray-600 text-white shadow-lg hover:shadow-gray-500/25" 
                  : "bg-gray-800/40 text-gray-400/50 hover:bg-gray-700/60"
              }`}
              title={user ? "Voir mes items en vente" : "Connexion requise"}
            >
              📦 Mes ventes
            </button>
            
            <button
              onClick={() => {
                if (!user) {
                  onShowAuthRequired();
                  return;
                }
                onOpenDashboardModal();
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                user 
                  ? "bg-gray-700 hover:bg-gray-600 text-white shadow-lg hover:shadow-gray-500/25" 
                  : "bg-gray-800/40 text-gray-400/50 hover:bg-gray-700/60"
              }`}
              title={user ? "Voir mes statistiques de vente" : "Connexion requise"}
            >
              📊 Dashboard
            </button>
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

          {/* Bouton refresh mobile */}
          <button
            onClick={onRefreshPrices}
            disabled={!itemsCount}
            className={`px-2 py-1 rounded-lg text-xs transition-all duration-200 ${
              itemsCount 
                ? "bg-gray-700 hover:bg-gray-600 text-white" 
                : "bg-gray-800/50 text-gray-500 cursor-not-allowed"
            }`}
            title="Rafraîchir les prix"
          >
            🔄
          </button>
        </div>

        {/* Boutons d'actions mobiles */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={() => {
              if (!user) {
                onShowAuthRequired();
                return;
              }
              onSave();
            }}
            className={`mobile-menu-item px-3 py-2 rounded-lg text-sm menu-button ${
              user 
                ? "bg-gray-700/20 text-gray-300 border border-gray-500/30" 
                : "bg-gray-800/40 text-gray-400/50"
            }`}
            title={user ? "Enregistrer" : "Connexion requise"}
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
            className={`mobile-menu-item px-3 py-2 rounded-lg text-sm menu-button ${
              user 
                ? "bg-gray-700/20 text-gray-300 border border-gray-500/30" 
                : "bg-gray-800/40 text-gray-400/50"
            }`}
            title={user ? "Charger" : "Connexion requise"}
          >
            📂 Charger
          </button>

          <button
            onClick={onOpenComparison}
            disabled={selectedForComparison.size < 2}
            className={`mobile-menu-item px-3 py-2 rounded-lg text-sm menu-button ${
              selectedForComparison.size >= 2 
                ? "bg-gray-700/20 text-gray-300 border border-gray-500/30" 
                : "bg-gray-800/40 text-gray-400/50"
            }`}
            title="Comparer"
          >
            📊 Comparer ({selectedForComparison.size})
          </button>

          <button
            onClick={onOpenFavorites}
            disabled={favoritesLoading}
            className={`mobile-menu-item px-3 py-2 rounded-lg text-sm menu-button ${
              user 
                ? "bg-yellow-600/20 text-yellow-300 border border-yellow-500/30" 
                : "bg-yellow-900/40 text-yellow-300/50"
            }`}
            title={user ? "Favoris" : "Connexion requise"}
          >
            {favoritesLoading ? "⏳..." : `⭐ Favoris (${favoritesCount})`}
          </button>
        </div>

        {/* Section ventes mobile */}
        {user && (
          <div className="bg-gradient-to-r from-emerald-900/30 to-blue-900/30 rounded-lg p-3 border border-emerald-500/20 mb-3">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={onPutAllItemsOnSale}
                disabled={itemsCount === 0 || saleLoading}
                className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                  itemsCount > 0
                    ? "bg-gray-700 hover:bg-gray-600 text-white" 
                    : "bg-gray-800/40 text-gray-400/50"
                }`}
                title="Vendre tout"
              >
                {saleLoading ? "⏳" : `Vendre (${itemsCount})`}
              </button>
              
              <button
                onClick={onOpenSalesModal}
                className="px-2 py-1 rounded text-xs font-medium bg-gray-700 hover:bg-gray-600 text-white transition-all duration-200"
                title="Mes ventes"
              >
                📦 Ventes
              </button>
              
              <button
                onClick={onOpenDashboardModal}
                className="px-2 py-1 rounded text-xs font-medium bg-gray-700 hover:bg-gray-600 text-white transition-all duration-200"
                title="Dashboard"
              >
                📊 Stats
              </button>
            </div>
          </div>
        )}

        {/* Boutons export/import mobile */}
        {user && (
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={onShareByLink}
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
              onClick={onExportJSON}
              className={`mobile-menu-item px-3 py-2 rounded-lg text-sm menu-button ${
                user 
                  ? "bg-orange-600/20 text-orange-300 border border-orange-500/30" 
                  : "bg-orange-900/40 text-orange-300/50"
              }`}
              title={user ? "Export" : "Connexion requise"}
            >
              📤 Export
            </button>

            <button
              onClick={onImportJSON}
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
        )}
      </div>
    </div>
  );
}