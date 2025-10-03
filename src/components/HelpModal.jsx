import React from 'react';

function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-100">📚 Guide d'utilisation Craftus</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Contenu */}
          <div className="space-y-6 text-sm text-slate-300">
            
            {/* Qu'est-ce que Craftus */}
            <section>
              <h3 className="text-lg font-semibold text-slate-100 mb-3">🎯 Qu'est-ce que Craftus ?</h3>
              <div className="space-y-2">
                <p>Craftus est un calculateur de rentabilité pour le craft dans Dofus. Il vous aide à :</p>
                <p>• <strong>Calculer automatiquement</strong> les coûts et profits de vos crafts</p>
                <p>• <strong>Comparer plusieurs items</strong> pour choisir les plus rentables</p>
                <p>• <strong>Optimiser vos sessions de craft</strong> avec des données précises</p>
                <p className="text-xs text-slate-400 mt-2">
                  <strong>Technologie :</strong> Utilise les prix communautaires renseignés par les utilisateurs. Plus il y a d'utilisateurs, plus les prix sont fiables.
                </p>
              </div>
            </section>

            {/* Étape 1 : Configuration */}
            <section>
              <h3 className="text-lg font-semibold text-slate-100 mb-3">⚙️ Étape 1 : Configuration</h3>
              <div className="space-y-2">
                <p><strong>🌐 Choisir votre serveur :</strong> Sélectionnez votre serveur dans le menu pour avoir les prix adaptés</p>
                <p><strong>🏷️ Activer les filtres :</strong> Utilisez "Équipements seulement" si vous ne voulez que des équipements</p>
                <p><strong>⚒️ Filtrer par métier :</strong> Sélectionnez un métier spécifique pour affiner votre recherche</p>
              </div>
            </section>

            {/* Étape 2 : Recherche et ajout d'items */}
            <section>
              <h3 className="text-lg font-semibold text-slate-100 mb-3">🔍 Étape 2 : Recherche et ajout d'items</h3>
              <div className="space-y-2">
                <p><strong>1. Rechercher :</strong> Tapez le nom d'un item (minimum 2 caractères)</p>
                <p><strong>2. Choisir :</strong> Cliquez sur l'item dans les suggestions pour l'ajouter</p>
                <p><strong>3. Répéter :</strong> Ajoutez jusqu'à 20 items à votre session</p>
                <p><strong>4. Vérifier :</strong> Les prix communautaires sont automatiquement pré-remplis</p>
              </div>
            </section>

            {/* Étape 3 : Ajustement des prix */}
            <section>
              <h3 className="text-lg font-semibold text-slate-100 mb-3">💰 Étape 3 : Ajustement des prix</h3>
              <div className="space-y-2">
                <p><strong>📈 Prix de vente :</strong> Modifiez le prix de vente selon votre marché local</p>
                <p><strong>📦 Prix des ingrédients :</strong> Ajustez les coûts des ingrédients si nécessaire</p>
                <p><strong>🎨 Comprendre les couleurs :</strong> Les couleurs indiquent la fiabilité des prix communautaires</p>
                <p><strong>🕒 Vérifier l'ancienneté :</strong> L'horloge indique si les prix sont récents</p>
              </div>
            </section>

            {/* Étape 4 : Analyse de rentabilité */}
            <section>
              <h3 className="text-lg font-semibold text-slate-100 mb-3">📊 Étape 4 : Analyse de rentabilité</h3>
              <div className="space-y-2">
                <p><strong>📈 Calculs automatiques :</strong> Investissement, revenus nets, gains et coefficients</p>
                <p><strong>📋 Comparaison :</strong> Sélectionnez des items pour les comparer côte à côte</p>
                <p><strong>🛒 Liste d'achats :</strong> Consultez le récapitulatif de tous vos ingrédients</p>
                <p><strong>📊 Tri :</strong> Triez par gain, coefficient ou investissement</p>
              </div>
            </section>

            {/* Légende des couleurs */}
            <section>
              <h3 className="text-lg font-semibold text-slate-100 mb-3">🎨 Légende des couleurs des prix</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-emerald-500 rounded border border-emerald-500/50"></div>
                  <span><strong>Vert :</strong> Prix fiable (fluctuation ≤ 20%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-amber-500 rounded border border-amber-500/50"></div>
                  <span><strong>Jaune :</strong> Prix moyennement fiable (fluctuation 20-50%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded border border-orange-500/50"></div>
                  <span><strong>Orange :</strong> Prix peu fiable (fluctuation 50-100%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded border border-red-500/50"></div>
                  <span><strong>Rouge :</strong> Prix très peu fiable (fluctuation &gt; 100%)</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Les couleurs indiquent la fiabilité du prix basée sur la fluctuation par rapport à l'historique récent.
                </p>
              </div>
            </section>

            {/* Légende des avertissements temporels */}
            <section>
              <h3 className="text-lg font-semibold text-slate-100 mb-3">🕒 Avertissements temporels</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">🕒</span>
                    <span className="text-slate-400 text-xs">moins d'1h</span>
                  </div>
                  <span><strong>Gris :</strong> Prix récent (moins d'1 heure)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">🕒</span>
                    <span className="text-yellow-400 text-xs">plus d'1h</span>
                  </div>
                  <span><strong>Jaune :</strong> Prix ancien (plus d'1 heure)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-red-400">🕒</span>
                    <span className="text-red-400 text-xs">plus d'1j</span>
                  </div>
                  <span><strong>Rouge :</strong> Prix très ancien (plus d'1 jour)</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  L'horloge indique l'ancienneté des données de prix. Survolez pour voir la date exacte.
                </p>
              </div>
            </section>

            {/* Exemple visuel des inputs */}
            <section>
              <h3 className="text-lg font-semibold text-slate-100 mb-3">📝 Exemple visuel des inputs</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-300 mb-2">Input avec prix fiable (vert) :</p>
                  <input 
                    type="text" 
                    value="1 250" 
                    disabled 
                    className="h-9 w-24 rounded-lg border border-emerald-500/50 bg-black/50 px-2 text-sm text-right text-emerald-300"
                  />
                </div>
                <div>
                  <p className="text-sm text-slate-300 mb-2">Input avec prix moyennement fiable (jaune) :</p>
                  <input 
                    type="text" 
                    value="2 500" 
                    disabled 
                    className="h-9 w-24 rounded-lg border border-amber-500/50 bg-black/50 px-2 text-sm text-right text-amber-300"
                  />
                </div>
                <div>
                  <p className="text-sm text-slate-300 mb-2">Input avec prix peu fiable (orange) :</p>
                  <input 
                    type="text" 
                    value="5 000" 
                    disabled 
                    className="h-9 w-24 rounded-lg border border-orange-500/50 bg-black/50 px-2 text-sm text-right text-orange-300"
                  />
                </div>
                <div>
                  <p className="text-sm text-slate-300 mb-2">Input avec prix très peu fiable (rouge) :</p>
                  <input 
                    type="text" 
                    value="10 000" 
                    disabled 
                    className="h-9 w-24 rounded-lg border border-red-500/50 bg-black/50 px-2 text-sm text-right text-red-300"
                  />
                </div>
              </div>
            </section>

            {/* Fonctionnalités avancées */}
            <section>
              <h3 className="text-lg font-semibold text-slate-100 mb-3">🚀 Fonctionnalités avancées</h3>
              <div className="space-y-2">
                <p><strong>📈 Historique des prix :</strong> Survolez les prix pour voir les graphiques d'évolution</p>
                <p><strong>📦 Taux de drop :</strong> Informations sur les monstres qui droppent les ingrédients</p>
                <p><strong>⚔️ Statistiques d'items :</strong> Effets, dégâts et informations d'armes</p>
                <p><strong>⭐ Système de favoris :</strong> Sauvegardez vos items préférés</p>
                <p><strong>💾 Sessions :</strong> Sauvegardez et chargez vos configurations</p>
                <p><strong>📤 Export/Import :</strong> Partagez vos configurations avec d'autres joueurs</p>
                <p><strong>🔄 Actualisation :</strong> Mettez à jour les prix communautaires</p>
              </div>
            </section>

            {/* Calculs et formules */}
            <section>
              <h3 className="text-lg font-semibold text-slate-100 mb-3">🧮 Calculs et formules</h3>
              <div className="space-y-2">
                <p><strong>Investissement :</strong> Somme des coûts des ingrédients</p>
                <p><strong>Revenu net :</strong> Prix de vente - taxe de 2%</p>
                <p><strong>Gain :</strong> Revenu net - Investissement</p>
                <p><strong>Coefficient :</strong> Revenu net ÷ Investissement</p>
                <p className="text-xs text-slate-400 mt-2">
                  La taxe de 2% est automatiquement déduite du prix de vente.
                </p>
              </div>
            </section>

            {/* Conseils d'utilisation */}
            <section>
              <h3 className="text-lg font-semibold text-slate-100 mb-3">💡 Conseils d'utilisation</h3>
              <div className="space-y-2">
                <p>• Vérifiez toujours les prix sur votre serveur avant de crafter</p>
                <p>• Les prix communautaires sont indicatifs, adaptez-les à votre marché</p>
                <p>• Utilisez les filtres pour trouver des items spécifiques à votre métier</p>
                <p>• Les couleurs des prix indiquent leur fiabilité, pas leur rentabilité</p>
                <p>• Survolez les prix pour voir l'historique et les détails</p>
                <p>• Limite de 20 items par session pour des performances optimales</p>
              </div>
            </section>

          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-slate-700">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpModal;
