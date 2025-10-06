import React, { useEffect, useState } from 'react';
import { colors } from '../theme/colors';
import { currency } from '../lib/utils';
import { getUserSales, markItemAsSold, removeItemFromSales, updateSalePrice } from '../lib/sales';
import ConfirmationAlert from './ConfirmationAlert';

export default function SalesModal({ isOpen, onClose, userId, serverId, forgemagieItems = new Set() }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingPrice, setEditingPrice] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmationAlert, setConfirmationAlert] = useState({
    isOpen: false,
    saleId: null,
    itemName: ''
  });

  // Charger les items en vente
  useEffect(() => {
    if (!isOpen || !userId || !serverId) return;
    
    const loadSales = async () => {
      setLoading(true);
      setError(null);
      try {
        const salesData = await getUserSales(userId, serverId);
        setSales(salesData);
      } catch (err) {
        setError('Erreur lors du chargement des ventes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSales();
  }, [isOpen, userId, serverId]);

  // Marquer un item comme vendu
  const handleMarkAsSold = async (saleId) => {
    try {
      await markItemAsSold(saleId, userId);
      setSales(prev => prev.filter(sale => sale.id !== saleId));
    } catch (err) {
      setError('Erreur lors de la vente');
      console.error(err);
    }
  };

  // Retirer un item de la vente
  const handleRemoveFromSales = async (saleId, itemName) => {
    setConfirmationAlert({
      isOpen: true,
      saleId: saleId,
      itemName: itemName
    });
  };

  // Confirmer la suppression
  const confirmRemoveFromSales = async () => {
    const { saleId } = confirmationAlert;
    
    try {
      await removeItemFromSales(saleId, userId);
      setSales(prev => prev.filter(sale => sale.id !== saleId));
    } catch (err) {
      setError('Erreur lors de la suppression');
      console.error(err);
    }
  };

  // Commencer l'édition du prix
  const handleStartEditPrice = (sale) => {
    setEditingPrice(sale.id);
    setNewPrice(sale.sellPrice.toString());
  };

  // Annuler l'édition du prix
  const handleCancelEditPrice = () => {
    setEditingPrice(null);
    setNewPrice('');
  };

  // Sauvegarder le nouveau prix
  const handleSavePrice = async (saleId) => {
    const price = parseFloat(newPrice);
    if (isNaN(price) || price < 0) {
      setError('Prix invalide');
      return;
    }

    try {
      await updateSalePrice(saleId, price, userId);
      
      // Mettre à jour l'état local
      setSales(prev => prev.map(sale => {
        if (sale.id === saleId) {
          const tax = price * 0.02;
          const newGain = (price - tax) - sale.investment;
          return {
            ...sale,
            sellPrice: price,
            gain: newGain
          };
        }
        return sale;
      }));
      
      setEditingPrice(null);
      setNewPrice('');
    } catch (err) {
      setError('Erreur lors de la mise à jour du prix');
      console.error(err);
    }
  };

  // Filtrer les ventes selon le terme de recherche
  const filteredSales = sales.filter(sale => 
    sale.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative rounded-2xl bg-[#0f1319] border border-white/10 shadow-2xl w-[90vw] max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold">Items mis en vente</h2>
          <button
            onClick={onClose}
            className="rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-2 text-sm"
          >
            ✕ Fermer
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <span className="ml-3 text-slate-400">Chargement...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-4">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Barre de recherche */}
          {!loading && sales.length > 0 && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Rechercher un item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-[#1b1f26] border border-white/10 rounded-lg text-white placeholder-slate-400 focus:border-emerald-500/50 focus:outline-none"
              />
            </div>
          )}

          {!loading && sales.length === 0 && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-lg font-semibold mb-2">Aucun item en vente</h3>
              <p className="text-slate-400">Ajoutez des items à votre comparatif et mettez-les en vente.</p>
            </div>
          )}

          {!loading && sales.length > 0 && filteredSales.length === 0 && searchTerm && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">Aucun résultat</h3>
              <p className="text-slate-400">Aucun item ne correspond à votre recherche.</p>
            </div>
          )}

          {!loading && filteredSales.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSales.map((sale) => {
                // Considérer comme forgemagie si marqué manuellement OU si a un prix de rune
                const hasRuneInvestment = Number(sale.runeInvestment || 0) > 0;
                const isForgemagie = forgemagieItems.has(sale.itemKey) || hasRuneInvestment;
                return (
                  <div
                    key={sale.id}
                    className={`rounded-xl border p-4 transition-colors ${
                      isForgemagie 
                        ? 'bg-blue-950/20 border-blue-500/30 hover:border-blue-400/50' 
                        : 'bg-[#151A22] border-white/10 hover:border-emerald-500/50'
                    }`}
                  >
                  {/* Image et nom */}
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={sale.itemImage}
                      alt={sale.itemName}
                      className="w-12 h-12 rounded-lg bg-black/20 object-contain"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{sale.itemName}</h3>
                      <p className="text-xs text-slate-400">Quantité: {sale.craftCount}</p>
                    </div>
                  </div>

                  {/* Prix et investissement */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Prix de revente:</span>
                      {editingPrice === sale.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                            className="w-20 px-2 py-1 text-xs bg-[#1b1f26] border border-white/20 rounded text-emerald-400"
                            placeholder="0"
                            min="0"
                            step="1"
                          />
                          <button
                            onClick={() => handleSavePrice(sale.id)}
                            className="text-xs bg-emerald-600 hover:bg-emerald-700 px-2 py-1 rounded"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleCancelEditPrice}
                            className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-emerald-400">
                            {currency(sale.sellPrice)}
                          </span>
                          <button
                            onClick={() => handleStartEditPrice(sale)}
                            className="text-xs text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-600/70 px-2 py-1 rounded transition-colors"
                            title="Modifier le prix"
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                    </div>
                    {isForgemagie ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400">Matériaux:</span>
                          <span className="font-semibold text-orange-400">
                            {currency(sale.materialsInvestment || sale.investment)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400">Runes:</span>
                          <span className="font-semibold text-blue-400">
                            {currency(sale.runeInvestment || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-t border-white/10 pt-2">
                          <span className="text-xs text-slate-400">Total:</span>
                          <span className="font-semibold text-orange-400">
                            {currency(sale.investment)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Investissement:</span>
                        <span className="font-semibold text-orange-400">
                          {currency(sale.investment)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center border-t border-white/10 pt-2">
                      <span className="text-xs text-slate-400">Gain estimé:</span>
                      <span className={`font-semibold ${sale.gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {currency(sale.gain)}
                      </span>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMarkAsSold(sale.id)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors text-sm"
                    >
                      ✓ Vendu
                    </button>
                    <button
                      onClick={() => handleRemoveFromSales(sale.id, sale.itemName)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors text-sm"
                    >
                      🗑️ Retirer
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer avec statistiques */}
        {!loading && sales.length > 0 && (
          <div className="border-t border-white/10 p-6 bg-[#0a0d12]">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-slate-400">Total en vente</div>
                <div className="text-lg font-semibold">{sales.length}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Valeur totale</div>
                <div className="text-lg font-semibold text-emerald-400">
                  {currency(sales.reduce((sum, sale) => sum + sale.sellPrice, 0))}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Gain estimé</div>
                <div className={`text-lg font-semibold ${
                  sales.reduce((sum, sale) => sum + sale.gain, 0) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {currency(sales.reduce((sum, sale) => sum + sale.gain, 0))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Alerte de confirmation */}
      <ConfirmationAlert
        isOpen={confirmationAlert.isOpen}
        onClose={() => setConfirmationAlert({ isOpen: false, saleId: null, itemName: '' })}
        onConfirm={confirmRemoveFromSales}
        title="Retirer de la vente"
        message={`Êtes-vous sûr de vouloir retirer "${confirmationAlert.itemName}" de la vente ?`}
        confirmText="Retirer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
}
