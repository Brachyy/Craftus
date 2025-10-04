import React, { useState } from 'react';
import { motion } from 'framer-motion';

function HelpModal({ isOpen, onClose }) {
  const [activeSection, setActiveSection] = useState('intro');
  
  if (!isOpen) return null;

  const sections = [
    { id: 'intro', title: '🎯 Introduction', icon: '🚀' },
    { id: 'setup', title: '⚙️ Configuration', icon: '🔧' },
    { id: 'search', title: '🔍 Recherche', icon: '📝' },
    { id: 'prices', title: '💰 Prix', icon: '💎' },
    { id: 'analysis', title: '📊 Analyse', icon: '📈' },
    { id: 'colors', title: '🎨 Couleurs', icon: '🌈' },
    { id: 'leaderboard', title: '🏆 Leaderboard', icon: '👑' },
    { id: 'advanced', title: '🚀 Avancé', icon: '⚡' },
    { id: 'tips', title: '💡 Conseils', icon: '🎯' }
  ];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-slate-700">
        
        {/* Header avec gradient */}
        <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                📚
              </div>
              <div>
                <h2 className="text-2xl font-bold">Guide Craftus</h2>
                <p className="text-emerald-100 text-sm">Maîtrisez l'art du craft rentable</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex h-[calc(95vh-120px)]">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-slate-800/50 border-r border-slate-700 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Navigation</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                      activeSection === section.id
                        ? 'bg-emerald-600 text-white shadow-lg transform scale-105'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <span className="text-lg">{section.icon}</span>
                    <span className="text-sm font-medium">{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">

              {/* Section Content */}
              {activeSection === 'intro' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                      🎯
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Bienvenue sur Craftus !</h3>
                    <p className="text-slate-400">Votre assistant personnel pour le craft rentable dans Dofus</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 p-6 rounded-xl border border-emerald-500/30">
                      <div className="text-3xl mb-3">💰</div>
                      <h4 className="text-lg font-semibold text-white mb-2">Calculs Automatiques</h4>
                      <p className="text-slate-300 text-sm">Coûts, profits et rentabilité calculés instantanément</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-6 rounded-xl border border-blue-500/30">
                      <div className="text-3xl mb-3">📊</div>
                      <h4 className="text-lg font-semibold text-white mb-2">Comparaison Intelligente</h4>
                      <p className="text-slate-300 text-sm">Comparez jusqu'à 20 items simultanément</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-6 rounded-xl border border-purple-500/30">
                      <div className="text-3xl mb-3">🌐</div>
                      <h4 className="text-lg font-semibold text-white mb-2">Prix Communautaires</h4>
                      <p className="text-slate-300 text-sm">Données partagées par la communauté Dofus</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-6 rounded-xl border border-yellow-500/30">
                    <div className="flex items-start gap-4">
                      <div className="text-2xl">💡</div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2">Comment ça marche ?</h4>
                        <p className="text-slate-300 text-sm">
                          Craftus utilise les prix renseignés par la communauté pour vous donner des estimations précises. 
                          Plus il y a d'utilisateurs, plus les prix sont fiables !
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section "Pourquoi Craftus" */}
                  <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 p-6 rounded-xl border border-emerald-500/30">
                    <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      🚀 Pourquoi choisir Craftus ?
                    </h4>
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-3xl mb-2">⚡</div>
                        <h5 className="font-semibold text-emerald-400 mb-2">Rapide & Simple</h5>
                        <p className="text-slate-300 text-sm">Calculez la rentabilité en 30 secondes. Plus besoin de calculer à la main !</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl mb-2">👥</div>
                        <h5 className="font-semibold text-blue-400 mb-2">Communauté Active</h5>
                        <p className="text-slate-300 text-sm">Plus de 1000 utilisateurs contribuent aux prix. Plus il y a d'utilisateurs, plus c'est fiable !</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl mb-2">🏆</div>
                        <h5 className="font-semibold text-purple-400 mb-2">Système de Rangs</h5>
                        <p className="text-slate-300 text-sm">Contribuez aux prix et montez en rang : de Boufton à Gardien du Krosmoz !</p>
                      </div>
                    </div>
                    
                    {/* Témoignages */}
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <h5 className="text-lg font-semibold text-white mb-3">💬 Ce que disent nos utilisateurs</h5>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-slate-700/50 rounded-lg p-3">
                          <p className="text-slate-300 italic text-sm mb-2">"Grâce à Craftus, j'ai doublé mes profits en crafts ! Les prix communautaires sont super fiables."</p>
                          <div className="text-emerald-400 font-semibold text-xs">- Jean, Chasseur de Dofus</div>
                        </div>
                        <div className="bg-slate-700/50 rounded-lg p-3">
                          <p className="text-slate-300 italic text-sm mb-2">"Enfin un outil simple et efficace. Le système de rangs est motivant !"</p>
                          <div className="text-blue-400 font-semibold text-xs">- Marie, Protecteur des Mois</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'setup' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                      ⚙️
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Configuration</h3>
                    <p className="text-slate-400">Configurez Craftus selon vos besoins</p>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 p-6 rounded-xl border border-blue-500/30">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">🌐</div>
                        <div>
                          <h4 className="text-xl font-semibold text-white mb-3">Choisir votre serveur</h4>
                          <p className="text-slate-300 mb-4">
                            Sélectionnez votre serveur dans le menu déroulant pour avoir les prix adaptés à votre marché local.
                          </p>
                          <div className="bg-slate-800/50 p-4 rounded-lg">
                            <p className="text-sm text-slate-400 mb-2">💡 Conseil :</p>
                            <p className="text-sm text-slate-300">
                              Les prix varient énormément entre serveurs. Assurez-vous de sélectionner le bon !
                </p>
              </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 p-6 rounded-xl border border-purple-500/30">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">🏷️</div>
                        <div>
                          <h4 className="text-xl font-semibold text-white mb-3">Filtres avancés</h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center text-white text-sm">✓</div>
                              <span className="text-slate-300"><strong>Équipements seulement :</strong> Affiche uniquement les équipements</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center text-white text-sm">✓</div>
                              <span className="text-slate-300"><strong>Filtrer par métier :</strong> Sélectionnez un métier spécifique</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center text-white text-sm">✓</div>
                              <span className="text-slate-300"><strong>Niveau minimum :</strong> Filtrez par niveau d'item</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
              </div>
              )}

              {activeSection === 'search' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                      🔍
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Recherche d'items</h3>
                    <p className="text-slate-400">Trouvez et ajoutez vos items facilement</p>
              </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 p-6 rounded-xl border border-emerald-500/30">
                      <div className="text-3xl mb-3">📝</div>
                      <h4 className="text-lg font-semibold text-white mb-3">1. Tapez le nom</h4>
                      <p className="text-slate-300 text-sm mb-3">
                        Commencez à taper le nom d'un item (minimum 2 caractères)
                      </p>
                      <div className="bg-slate-800/50 p-3 rounded-lg">
                        <div className="text-xs text-slate-400 mb-1">Exemple :</div>
                        <div className="text-emerald-300 font-mono">"Gelano" → Suggestions apparaissent</div>
                      </div>
              </div>

                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-6 rounded-xl border border-blue-500/30">
                      <div className="text-3xl mb-3">👆</div>
                      <h4 className="text-lg font-semibold text-white mb-3">2. Cliquez pour ajouter</h4>
                      <p className="text-slate-300 text-sm mb-3">
                        Cliquez sur l'item dans les suggestions pour l'ajouter à votre session
                      </p>
                      <div className="bg-slate-800/50 p-3 rounded-lg">
                        <div className="text-xs text-slate-400 mb-1">Résultat :</div>
                        <div className="text-blue-300 font-mono">Item ajouté avec prix pré-remplis</div>
                      </div>
                    </div>
              </div>

                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 rounded-xl border border-purple-500/30">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">⚡</div>
                      <div>
                        <h4 className="text-xl font-semibold text-white mb-3">Astuces de recherche</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                              <span className="text-emerald-400">✓</span>
                              <span className="text-slate-300 text-sm">Recherche partielle acceptée</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-400">✓</span>
                              <span className="text-slate-300 text-sm">Suggestions en temps réel</span>
                </div>
                <div className="flex items-center gap-2">
                              <span className="text-emerald-400">✓</span>
                              <span className="text-slate-300 text-sm">Jusqu'à 20 items par session</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-400">✓</span>
                              <span className="text-slate-300 text-sm">Prix automatiquement pré-remplis</span>
                </div>
                <div className="flex items-center gap-2">
                              <span className="text-emerald-400">✓</span>
                              <span className="text-slate-300 text-sm">Filtres appliqués automatiquement</span>
                </div>
                <div className="flex items-center gap-2">
                              <span className="text-emerald-400">✓</span>
                              <span className="text-slate-300 text-sm">Historique de recherche</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {activeSection === 'colors' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                      🎨
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Légende des couleurs</h3>
                    <p className="text-slate-400">Comprenez la fiabilité des prix</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 p-6 rounded-xl border border-emerald-500/30">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-8 h-8 bg-emerald-500 rounded border border-emerald-500/50"></div>
                        <div>
                          <h4 className="text-lg font-semibold text-white">Vert</h4>
                          <p className="text-emerald-300 text-sm">Prix très fiable</p>
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm">
                        Fluctuation ≤ 20% par rapport à l'historique récent. 
                        Ces prix sont très stables et fiables.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 p-6 rounded-xl border border-amber-500/30">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-8 h-8 bg-amber-500 rounded border border-amber-500/50"></div>
                        <div>
                          <h4 className="text-lg font-semibold text-white">Jaune</h4>
                          <p className="text-amber-300 text-sm">Prix moyennement fiable</p>
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm">
                        Fluctuation 20-50%. Prix généralement corrects mais à vérifier.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 p-6 rounded-xl border border-orange-500/30">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-8 h-8 bg-orange-500 rounded border border-orange-500/50"></div>
                        <div>
                          <h4 className="text-lg font-semibold text-white">Orange</h4>
                          <p className="text-orange-300 text-sm">Prix peu fiable</p>
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm">
                        Fluctuation 50-100%. Prix instables, vérification recommandée.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 p-6 rounded-xl border border-red-500/30">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-8 h-8 bg-red-500 rounded border border-red-500/50"></div>
                        <div>
                          <h4 className="text-lg font-semibold text-white">Rouge</h4>
                          <p className="text-red-300 text-sm">Prix très peu fiable</p>
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm">
                        Fluctuation > 100%. Prix très instables, vérification obligatoire.
                </p>
              </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-6 rounded-xl border border-blue-500/30">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">🕒</div>
                      <div>
                        <h4 className="text-xl font-semibold text-white mb-3">Indicateurs temporels</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-3">
                    <span className="text-slate-400">🕒</span>
                            <div>
                              <div className="text-white font-medium">Gris</div>
                              <div className="text-slate-400 text-sm">Prix récent (&lt; 1h)</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-yellow-400">🕒</span>
                            <div>
                              <div className="text-white font-medium">Jaune</div>
                              <div className="text-slate-400 text-sm">Prix ancien (&gt; 1h)</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-red-400">🕒</span>
                            <div>
                              <div className="text-white font-medium">Rouge</div>
                              <div className="text-slate-400 text-sm">Prix très ancien (&gt; 1j)</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'prices' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                      💰
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Gestion des prix</h3>
                    <p className="text-slate-400">Ajustez et comprenez les prix</p>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 p-6 rounded-xl border border-emerald-500/30">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">📈</div>
                        <div>
                          <h4 className="text-xl font-semibold text-white mb-3">Prix de vente</h4>
                          <p className="text-slate-300 mb-4">
                            Modifiez le prix de vente selon votre marché local. Les prix communautaires sont automatiquement pré-remplis.
                          </p>
                          <div className="bg-slate-800/50 p-4 rounded-lg">
                            <p className="text-sm text-slate-400 mb-2">💡 Conseil :</p>
                            <p className="text-sm text-slate-300">
                              Vérifiez toujours les prix actuels sur votre serveur avant de crafter !
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 p-6 rounded-xl border border-blue-500/30">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">📦</div>
                        <div>
                          <h4 className="text-xl font-semibold text-white mb-3">Prix des ingrédients</h4>
                          <p className="text-slate-300 mb-4">
                            Ajustez les coûts des ingrédients si nécessaire. Les prix communautaires sont généralement fiables.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-emerald-400">✓</span>
                                <span className="text-slate-300 text-sm">Prix automatiquement pré-remplis</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-emerald-400">✓</span>
                                <span className="text-slate-300 text-sm">Modification en temps réel</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-emerald-400">✓</span>
                                <span className="text-slate-300 text-sm">Calculs automatiques</span>
                </div>
                <div className="flex items-center gap-2">
                                <span className="text-emerald-400">✓</span>
                                <span className="text-slate-300 text-sm">Historique des prix</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'analysis' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                      📊
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Analyse de rentabilité</h3>
                    <p className="text-slate-400">Comprenez vos calculs</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 p-6 rounded-xl border border-emerald-500/30">
                      <div className="text-3xl mb-3">💰</div>
                      <h4 className="text-lg font-semibold text-white mb-3">Investissement</h4>
                      <p className="text-slate-300 text-sm mb-3">
                        Somme des coûts de tous les ingrédients nécessaires pour crafter l'item.
                      </p>
                      <div className="bg-slate-800/50 p-3 rounded-lg">
                        <div className="text-xs text-slate-400 mb-1">Formule :</div>
                        <div className="text-emerald-300 font-mono text-sm">Σ (prix ingrédient × quantité)</div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-6 rounded-xl border border-blue-500/30">
                      <div className="text-3xl mb-3">📈</div>
                      <h4 className="text-lg font-semibold text-white mb-3">Revenu net</h4>
                      <p className="text-slate-300 text-sm mb-3">
                        Prix de vente moins la taxe de 2% automatiquement déduite.
                      </p>
                      <div className="bg-slate-800/50 p-3 rounded-lg">
                        <div className="text-xs text-slate-400 mb-1">Formule :</div>
                        <div className="text-blue-300 font-mono text-sm">Prix vente × 0.98</div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-6 rounded-xl border border-purple-500/30">
                      <div className="text-3xl mb-3">🎯</div>
                      <h4 className="text-lg font-semibold text-white mb-3">Gain</h4>
                      <p className="text-slate-300 text-sm mb-3">
                        Profit réel après déduction de l'investissement.
                      </p>
                      <div className="bg-slate-800/50 p-3 rounded-lg">
                        <div className="text-xs text-slate-400 mb-1">Formule :</div>
                        <div className="text-purple-300 font-mono text-sm">Revenu net - Investissement</div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 p-6 rounded-xl border border-orange-500/30">
                      <div className="text-3xl mb-3">📊</div>
                      <h4 className="text-lg font-semibold text-white mb-3">Coefficient</h4>
                      <p className="text-slate-300 text-sm mb-3">
                        Multiplicateur de rentabilité. Plus il est élevé, plus c'est rentable.
                      </p>
                      <div className="bg-slate-800/50 p-3 rounded-lg">
                        <div className="text-xs text-slate-400 mb-1">Formule :</div>
                        <div className="text-orange-300 font-mono text-sm">Revenu net ÷ Investissement</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'leaderboard' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                      🏆
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Leaderboard & Ranks</h3>
                    <p className="text-slate-400">Compétition communautaire et système de progression</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 p-6 rounded-xl border border-yellow-500/30">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-3xl">🏆</div>
                        <div>
                          <h4 className="text-lg font-semibold text-white">Leaderboard</h4>
                          <p className="text-yellow-300 text-sm">Classement des contributeurs</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400">🥇</span>
                          <span className="text-slate-300 text-sm">1er : Or brillant</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">🥈</span>
                          <span className="text-slate-300 text-sm">2ème : Argent élégant</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-orange-400">🥉</span>
                          <span className="text-slate-300 text-sm">3ème : Bronze noble</span>
                        </div>
                        <p className="text-slate-300 text-sm mt-3">
                          Classement par jour, semaine et mois. Les logos de rank remplacent les avatars.
                        </p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-6 rounded-xl border border-purple-500/30">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-3xl">👑</div>
                        <div>
                          <h4 className="text-lg font-semibold text-white">Système de Ranks</h4>
                          <p className="text-purple-300 text-sm">Progression par contributions</p>
                        </div>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3">
                          <img 
                            src="/src/assets/ranks/boufton.png" 
                            alt="Boufton"
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="w-6 h-6 flex items-center justify-center text-lg" style={{ display: 'none' }}>
                            🐑
                          </div>
                          <div>
                            <span className="text-slate-300 font-medium">Boufton</span>
                            <span className="text-slate-500 text-xs ml-2">(0-49 participations)</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <img 
                            src="/src/assets/ranks/aventurier_amakna.png" 
                            alt="Aventurier d'Astrub"
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="w-6 h-6 flex items-center justify-center text-lg" style={{ display: 'none' }}>
                            🌟
                          </div>
                          <div>
                            <span className="text-yellow-400 font-medium">Aventurier d'Astrub</span>
                            <span className="text-slate-500 text-xs ml-2">(50-149 participations)</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <img 
                            src="/src/assets/ranks/apprenti_otomai.png" 
                            alt="Disciple d'Otomaï"
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="w-6 h-6 flex items-center justify-center text-lg" style={{ display: 'none' }}>
                            🧪
                          </div>
                          <div>
                            <span className="text-green-400 font-medium">Disciple d'Otomaï</span>
                            <span className="text-slate-500 text-xs ml-2">(150-349 participations)</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <img 
                            src="/src/assets/ranks/chasseur_dofus.png" 
                            alt="Chasseur de Dofus"
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="w-6 h-6 flex items-center justify-center text-lg" style={{ display: 'none' }}>
                            🥚
                          </div>
                          <div>
                            <span className="text-cyan-400 font-medium">Chasseur de Dofus</span>
                            <span className="text-slate-500 text-xs ml-2">(350-799 participations)</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <img 
                            src="/src/assets/ranks/protecteur_almanax.png" 
                            alt="Protecteur des Mois"
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="w-6 h-6 flex items-center justify-center text-lg" style={{ display: 'none' }}>
                            ⏳
                          </div>
                          <div>
                            <span className="text-yellow-500 font-medium">Protecteur des Mois</span>
                            <span className="text-slate-500 text-xs ml-2">(800-1599 participations)</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <img 
                            src="/src/assets/ranks/champion_kolizeum.png" 
                            alt="Champion du Kolizéum"
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="w-6 h-6 flex items-center justify-center text-lg" style={{ display: 'none' }}>
                            🏛️
                          </div>
                          <div>
                            <span className="text-red-400 font-medium">Champion du Kolizéum</span>
                            <span className="text-slate-500 text-xs ml-2">(1600-3199 participations)</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <img 
                            src="/src/assets/ranks/hero_bonta⁄brakmar.png" 
                            alt="Héros de Bonta/Brâkmar"
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="w-6 h-6 flex items-center justify-center text-lg" style={{ display: 'none' }}>
                            ⚔️
                          </div>
                          <div>
                            <span className="text-purple-400 font-medium">Héros de Bonta/Brâkmar</span>
                            <span className="text-slate-500 text-xs ml-2">(3200-6399 participations)</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <img 
                            src="/src/assets/ranks/gardien_krosmoz.png" 
                            alt="Gardien du Krosmoz"
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="w-6 h-6 flex items-center justify-center text-lg" style={{ display: 'none' }}>
                            🌌
                          </div>
                          <div>
                            <span className="text-indigo-400 font-medium">Gardien du Krosmoz</span>
                            <span className="text-slate-500 text-xs ml-2">(6400+ participations)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-6 rounded-xl border border-yellow-500/30">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">💬</div>
                      <div>
                        <h4 className="text-xl font-semibold text-white mb-3">Message de remerciement</h4>
                        <p className="text-slate-300 text-sm mb-4">
                          Voici le message que vous recevrez quand vous contribuez aux prix communautaires :
                        </p>
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-yellow-500/30">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                            <span className="text-yellow-400 text-sm font-semibold">Contribution communautaire</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-white">Bonjour</span>
                            <span className="text-yellow-400 font-medium">[Votre nom]</span>
                            <span className="text-white">le</span>
                            <img 
                              src="/src/assets/ranks/champion_kolizeum.png" 
                              alt="Champion du Kolizéum"
                              className="w-5 h-5 object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="w-5 h-5 flex items-center justify-center text-sm" style={{ display: 'none' }}>
                              🏛️
                            </div>
                            <span className="text-red-400 font-bold">Champion du Kolizéum</span>
                          </div>
                          <p className="text-slate-400 text-sm mt-2">
                            Merci d'avoir contribué aux prix communautaires ! Vous avez renseigné 1 prix aujourd'hui.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 rounded-xl border border-purple-500/30">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">🎭</div>
                      <div>
                        <h4 className="text-xl font-semibold text-white mb-3">Effets Visuels par Rank</h4>
                        <p className="text-slate-300 text-sm mb-4">
                          Survolez chaque rank pour voir ses effets visuels en action :
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            {/* Boufton */}
                            <motion.div
                              className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/30 hover:bg-slate-700/50 transition-colors cursor-pointer"
                              whileHover="hover"
                              initial="initial"
                              animate="animate"
                              variants={{
                                initial: { filter: "drop-shadow(0 0 4px rgba(255,247,194,0.35))" },
                                animate: {
                                  filter: ["drop-shadow(0 0 4px rgba(255,247,194,0.35))", "drop-shadow(0 0 14px rgba(255,247,194,0.9))"],
                                  transition: { duration: 2.4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
                                },
                                hover: {
                                  filter: "drop-shadow(0 0 26px rgba(255,247,194,0.65))",
                                  transition: { type: "spring", stiffness: 180, damping: 16 }
                                }
                              }}
                            >
                              <img 
                                src="/src/assets/ranks/boufton.png" 
                                alt="Boufton"
                                className="w-6 h-6 object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="w-6 h-6 flex items-center justify-center text-sm" style={{ display: 'none' }}>
                                🐑
                              </div>
                              <motion.span 
                                className="text-slate-300 font-medium"
                                style={{
                                  fontWeight: 900,
                                  letterSpacing: 0.5,
                                  textTransform: "uppercase",
                                  fontSize: 14,
                                  lineHeight: 1.1,
                                  color: "#f5f5dc"
                                }}
                              >
                                Boufton
                              </motion.span>
                              {/* Effet sweep */}
                              <motion.div
                                variants={{
                                  initial: { x: "-120%", opacity: 0 },
                                  hover: { x: ["-120%", "140%"], opacity: [0, 1, 0] }
                                }}
                                transition={{ duration: 1.1, ease: "easeInOut" }}
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  background: "linear-gradient(75deg, rgba(255,255,255,0), rgba(255,255,255,0.35), rgba(255,255,255,0))",
                                  width: "36%",
                                  filter: "blur(2px)",
                                  pointerEvents: "none",
                                }}
                              />
                            </motion.div>

                            {/* Aventurier */}
                            <motion.div
                              className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/30 hover:bg-slate-700/50 transition-colors cursor-pointer"
                              whileHover="hover"
                              initial="initial"
                              animate="animate"
                              variants={{
                                initial: { filter: "drop-shadow(0 0 4px rgba(212,175,55,0.25))" },
                                animate: {
                                  filter: ["drop-shadow(0 0 4px rgba(212,175,55,0.25))", "drop-shadow(0 0 16px rgba(247,229,150,0.95))"],
                                  transition: { duration: 2.4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
                                },
                                hover: {
                                  filter: "drop-shadow(0 0 28px rgba(247,229,150,0.7))",
                                  transition: { type: "spring", stiffness: 180, damping: 16 }
                                }
                              }}
                            >
                              <img 
                                src="/src/assets/ranks/aventurier_amakna.png" 
                                alt="Aventurier d'Astrub"
                                className="w-6 h-6 object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="w-6 h-6 flex items-center justify-center text-sm" style={{ display: 'none' }}>
                                🌟
                              </div>
                              <motion.span 
                                className="text-yellow-400 font-medium"
                                style={{
                                  fontWeight: 900,
                                  letterSpacing: 0.5,
                                  textTransform: "uppercase",
                                  fontSize: 14,
                                  lineHeight: 1.1,
                                  color: "transparent",
                                  backgroundImage: "linear-gradient(90deg,#b78c2a,#d4af37,#f7e596,#d4af37,#b78c2a)",
                                  backgroundSize: "300% 100%",
                                  backgroundClip: "text",
                                  WebkitBackgroundClip: "text",
                                  WebkitTextFillColor: "transparent"
                                }}
                                animate={{ 
                                  backgroundPositionX: ["0%", "100%", "0%"] 
                                }}
                                transition={{ 
                                  duration: 14, 
                                  repeat: Infinity, 
                                  ease: "linear" 
                                }}
                              >
                                Aventurier d'Astrub
                              </motion.span>
                              {/* Effet metal-shine */}
                              <motion.div
                                variants={{
                                  initial: { x: "-130%", opacity: 0 },
                                  hover: { x: ["-130%", "150%"], opacity: [0, 1, 0] }
                                }}
                                transition={{ duration: 0.9, ease: "easeInOut" }}
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  background: "linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,0.25), rgba(255,255,255,0))",
                                  width: "30%",
                                  filter: "blur(1.5px)",
                                  pointerEvents: "none",
                                }}
                              />
                            </motion.div>

                            {/* Disciple */}
                            <motion.div
                              className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/30 hover:bg-slate-700/50 transition-colors cursor-pointer"
                              whileHover="hover"
                              initial="initial"
                              animate="animate"
                              variants={{
                                initial: { filter: "drop-shadow(0 0 6px rgba(50,205,50,0.35))" },
                                animate: {
                                  filter: ["drop-shadow(0 0 6px rgba(50,205,50,0.35))", "drop-shadow(0 0 20px rgba(50,205,50,1))"],
                                  transition: { duration: 2.4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
                                },
                                hover: {
                                  filter: "drop-shadow(0 0 30px rgba(50,205,50,0.7))",
                                  transition: { type: "spring", stiffness: 180, damping: 16 }
                                }
                              }}
                            >
                              <img 
                                src="/src/assets/ranks/apprenti_otomai.png" 
                                alt="Disciple d'Otomaï"
                                className="w-6 h-6 object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="w-6 h-6 flex items-center justify-center text-sm" style={{ display: 'none' }}>
                                🧪
                              </div>
                              <motion.span 
                                className="text-green-400 font-medium"
                                style={{
                                  fontWeight: 900,
                                  letterSpacing: 0.5,
                                  textTransform: "uppercase",
                                  fontSize: 14,
                                  lineHeight: 1.1,
                                  color: "#32cd32"
                                }}
                              >
                                Disciple d'Otomaï
                              </motion.span>
                              {/* Effet particles */}
                              {Array.from({ length: 6 }).map((_, i) => (
                                <motion.span
                                  key={i}
                                  variants={{
                                    initial: { x: 0, y: 0, opacity: 0, scale: 0 },
                                    hover: { 
                                      x: [0, (Math.random() - 0.5) * 100], 
                                      y: [0, (Math.random() - 0.5) * 100], 
                                      opacity: [0, 1, 0], 
                                      scale: [0, 1, 0] 
                                    }
                                  }}
                                  transition={{ duration: 0.9 + i * 0.1, ease: "easeOut" }}
                                  style={{
                                    position: "absolute",
                                    left: "50%",
                                    top: "50%",
                                    width: 4,
                                    height: 4,
                                    borderRadius: 999,
                                    background: "radial-gradient(circle, #32cd32, rgba(50,205,50,0))",
                                    boxShadow: "0 0 12px rgba(50,205,50,0.8)",
                                    pointerEvents: "none",
                                  }}
                                />
                              ))}
                            </motion.div>

                            {/* Chasseur */}
                            <motion.div
                              className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/30 hover:bg-slate-700/50 transition-colors cursor-pointer"
                              whileHover="hover"
                              initial="initial"
                              animate="animate"
                              variants={{
                                initial: { filter: "drop-shadow(0 0 6px rgba(0,206,209,0.35))" },
                                animate: {
                                  filter: ["drop-shadow(0 0 6px rgba(0,206,209,0.35))", "drop-shadow(0 0 22px rgba(0,206,209,1))"],
                                  transition: { duration: 2.4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
                                },
                                hover: {
                                  filter: "drop-shadow(0 0 34px rgba(0,225,220,0.75))",
                                  transition: { type: "spring", stiffness: 180, damping: 16 }
                                }
                              }}
                            >
                              <img 
                                src="/src/assets/ranks/chasseur_dofus.png" 
                                alt="Chasseur de Dofus"
                                className="w-6 h-6 object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="w-6 h-6 flex items-center justify-center text-sm" style={{ display: 'none' }}>
                                🥚
                              </div>
                              <motion.span 
                                className="text-cyan-400 font-medium"
                                style={{
                                  fontWeight: 900,
                                  letterSpacing: 0.5,
                                  textTransform: "uppercase",
                                  fontSize: 14,
                                  lineHeight: 1.1,
                                  color: "transparent",
                                  backgroundImage: "linear-gradient(90deg,#0099a8,#00ced1,#8bf3f6,#00ced1,#0099a8)",
                                  backgroundSize: "300% 100%",
                                  backgroundClip: "text",
                                  WebkitBackgroundClip: "text",
                                  WebkitTextFillColor: "transparent"
                                }}
                                animate={{ 
                                  backgroundPositionX: ["0%", "100%", "0%"] 
                                }}
                                transition={{ 
                                  duration: 18, 
                                  repeat: Infinity, 
                                  ease: "linear" 
                                }}
                              >
                                Chasseur de Dofus
                              </motion.span>
                              {/* Effet diagonal-wave */}
                              <motion.div
                                variants={{
                                  initial: { x: "-120%", rotate: -18, opacity: 0 },
                                  hover: { x: ["-120%", "140%"], opacity: [0, 0.9, 0] }
                                }}
                                transition={{ duration: 1.2, ease: "easeInOut" }}
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  background: "linear-gradient(45deg, rgba(0,206,209,0), rgba(0,206,209,0.4), rgba(0,206,209,0))",
                                  width: "40%",
                                  filter: "blur(2.5px)",
                                  pointerEvents: "none",
                                }}
                              />
                            </motion.div>
                          </div>
                          
                          <div className="space-y-3">
                            {/* Protecteur */}
                            <motion.div
                              className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/30 hover:bg-slate-700/50 transition-colors cursor-pointer"
                              whileHover="hover"
                              initial="initial"
                              animate="animate"
                              variants={{
                                initial: { filter: "drop-shadow(0 0 8px rgba(255,215,0,0.35))" },
                                animate: {
                                  filter: ["drop-shadow(0 0 8px rgba(255,215,0,0.35))", "drop-shadow(0 0 24px rgba(255,215,0,1))"],
                                  transition: { duration: 2.4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
                                },
                                hover: {
                                  filter: "drop-shadow(0 0 36px rgba(255,215,0,0.7))",
                                  transition: { type: "spring", stiffness: 180, damping: 16 }
                                }
                              }}
                            >
                              <img 
                                src="/src/assets/ranks/protecteur_almanax.png" 
                                alt="Protecteur des Mois"
                                className="w-6 h-6 object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="w-6 h-6 flex items-center justify-center text-sm" style={{ display: 'none' }}>
                                ⏳
                              </div>
                              <motion.span 
                                className="text-yellow-500 font-medium"
                                style={{
                                  fontWeight: 900,
                                  letterSpacing: 0.5,
                                  textTransform: "uppercase",
                                  fontSize: 14,
                                  lineHeight: 1.1,
                                  color: "#ffd700"
                                }}
                              >
                                Protecteur des Mois
                              </motion.span>
                              {/* Effet hourglass */}
                              <motion.div
                                variants={{
                                  initial: { y: "-110%", opacity: 0 },
                                  hover: { y: ["-110%", "110%"], opacity: [0, 1, 0] }
                                }}
                                transition={{ duration: 1.3, ease: "easeInOut" }}
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  background: "linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0.3), rgba(255,255,255,0))",
                                  width: "100%",
                                  height: "25%",
                                  filter: "blur(1px)",
                                  pointerEvents: "none",
                                }}
                              />
                            </motion.div>

                            {/* Champion */}
                            <motion.div
                              className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/30 hover:bg-slate-700/50 transition-colors cursor-pointer"
                              whileHover="hover"
                              initial="initial"
                              animate="animate"
                              variants={{
                                initial: { filter: "drop-shadow(0 0 10px rgba(202,168,74,0.35))" },
                                animate: {
                                  filter: ["drop-shadow(0 0 10px rgba(202,168,74,0.35))", "drop-shadow(0 0 26px rgba(202,168,74,1))"],
                                  transition: { duration: 2.4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
                                },
                                hover: {
                                  filter: "drop-shadow(0 0 38px rgba(202,168,74,0.7))",
                                  transition: { type: "spring", stiffness: 180, damping: 16 }
                                }
                              }}
                            >
                              <img 
                                src="/src/assets/ranks/champion_kolizeum.png" 
                                alt="Champion du Kolizéum"
                                className="w-6 h-6 object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="w-6 h-6 flex items-center justify-center text-sm" style={{ display: 'none' }}>
                                🏛️
                              </div>
                              <motion.span 
                                className="text-red-400 font-medium"
                                style={{
                                  fontWeight: 900,
                                  letterSpacing: 0.5,
                                  textTransform: "uppercase",
                                  fontSize: 14,
                                  lineHeight: 1.1,
                                  color: "transparent",
                                  backgroundImage: "linear-gradient(90deg,#b22222,#ff6b6b,#ffd56b,#b22222)",
                                  backgroundSize: "300% 100%",
                                  backgroundClip: "text",
                                  WebkitBackgroundClip: "text",
                                  WebkitTextFillColor: "transparent"
                                }}
                                animate={{ 
                                  backgroundPositionX: ["0%", "100%", "0%"] 
                                }}
                                transition={{ 
                                  duration: 20, 
                                  repeat: Infinity, 
                                  ease: "linear" 
                                }}
                              >
                                Champion du Kolizéum
                              </motion.span>
                              {/* Effet bicolor-flow */}
                              <motion.div
                                variants={{
                                  initial: { x: "-100%", opacity: 0 },
                                  hover: { x: ["-100%", "100%", "0%"], opacity: [0, 1, 0] }
                                }}
                                transition={{ duration: 1.4, ease: "easeInOut" }}
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  background: "linear-gradient(90deg, rgba(178,34,34,0), rgba(255,107,107,0.5), rgba(255,214,107,0.5), rgba(178,34,34,0))",
                                  width: "100%",
                                  filter: "blur(3px)",
                                  pointerEvents: "none",
                                }}
                              />
                            </motion.div>

                            {/* Héros */}
                            <motion.div
                              className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/30 hover:bg-slate-700/50 transition-colors cursor-pointer"
                              whileHover="hover"
                              initial="initial"
                              animate="animate"
                              variants={{
                                initial: { filter: "drop-shadow(0 0 12px rgba(138,43,226,0.35))" },
                                animate: {
                                  filter: ["drop-shadow(0 0 12px rgba(138,43,226,0.35))", "drop-shadow(0 0 28px rgba(138,43,226,1))"],
                                  transition: { duration: 2.4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
                                },
                                hover: {
                                  filter: "drop-shadow(0 0 40px rgba(138,43,226,0.7))",
                                  transition: { type: "spring", stiffness: 180, damping: 16 }
                                }
                              }}
                            >
                              <img 
                                src="/src/assets/ranks/hero_bonta⁄brakmar.png" 
                                alt="Héros de Bonta/Brâkmar"
                                className="w-6 h-6 object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="w-6 h-6 flex items-center justify-center text-sm" style={{ display: 'none' }}>
                                ⚔️
                              </div>
                              <motion.span 
                                className="text-purple-400 font-medium"
                                style={{
                                  fontWeight: 900,
                                  letterSpacing: 0.5,
                                  textTransform: "uppercase",
                                  fontSize: 14,
                                  lineHeight: 1.1,
                                  color: "#8a2be2"
                                }}
                              >
                                Héros de Bonta/Brâkmar
                              </motion.span>
                              {/* Effet sparks */}
                              {Array.from({ length: 8 }).map((_, i) => (
                                <motion.span
                                  key={i}
                                  variants={{
                                    initial: { x: 0, y: 0, opacity: 0, rotate: 0, scale: 0.6 },
                                    hover: { 
                                      x: [(Math.random() - 0.5) * 80], 
                                      y: [(Math.random() - 0.5) * 80], 
                                      opacity: [0, 1, 0], 
                                      rotate: 135, 
                                      scale: [0.6, 1.1, 0.8] 
                                    }
                                  }}
                                  transition={{ duration: 0.8 + (i % 5) * 0.12, ease: "easeOut" }}
                                  style={{
                                    position: "absolute",
                                    left: "50%",
                                    top: "50%",
                                    width: 14,
                                    height: 2,
                                    borderRadius: 2,
                                    background: i % 2
                                      ? "linear-gradient(90deg, rgba(202,168,74,0.1), rgba(255,204,108,0.95))"
                                      : "linear-gradient(90deg, rgba(120,0,0,0.1), rgba(255,120,80,0.95))",
                                    boxShadow: "0 0 10px rgba(255,140,90,0.75)",
                                    pointerEvents: "none",
                                  }}
                                />
                              ))}
                            </motion.div>

                            {/* Gardien */}
                            <motion.div
                              className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/30 hover:bg-slate-700/50 transition-colors cursor-pointer"
                              whileHover="hover"
                              initial="initial"
                              animate="animate"
                              variants={{
                                initial: { filter: "drop-shadow(0 0 14px rgba(138,43,226,0.35))" },
                                animate: {
                                  filter: ["drop-shadow(0 0 14px rgba(138,43,226,0.35))", "drop-shadow(0 0 32px rgba(138,43,226,1))"],
                                  transition: { duration: 2.4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
                                },
                                hover: {
                                  filter: "drop-shadow(0 0 56px rgba(138,43,226,0.8))",
                                  transition: { type: "spring", stiffness: 180, damping: 16 }
                                }
                              }}
                            >
                              <img 
                                src="/src/assets/ranks/gardien_krosmoz.png" 
                                alt="Gardien du Krosmoz"
                                className="w-6 h-6 object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="w-6 h-6 flex items-center justify-center text-sm" style={{ display: 'none' }}>
                                🌌
                              </div>
                              <motion.span 
                                className="text-indigo-400 font-medium"
                                style={{
                                  fontWeight: 900,
                                  letterSpacing: 0.5,
                                  textTransform: "uppercase",
                                  fontSize: 14,
                                  lineHeight: 1.1,
                                  color: "transparent",
                                  backgroundImage: "linear-gradient(90deg,#8a2be2,#00bfff,#ff69b4,#8a2be2)",
                                  backgroundSize: "300% 100%",
                                  backgroundClip: "text",
                                  WebkitBackgroundClip: "text",
                                  WebkitTextFillColor: "transparent"
                                }}
                                animate={{ 
                                  backgroundPositionX: ["0%", "100%", "0%"] 
                                }}
                                transition={{ 
                                  duration: 22, 
                                  repeat: Infinity, 
                                  ease: "linear" 
                                }}
                              >
                                Gardien du Krosmoz
                              </motion.span>
                              {/* Effet cosmic */}
                              <motion.div
                                variants={{
                                  initial: { x: "-130%", opacity: 0.0 },
                                  hover: { x: ["-130%", "150%"], opacity: [0.0, 1, 0.0] }
                                }}
                                transition={{ duration: 1.6, ease: "easeInOut" }}
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  background: "linear-gradient(90deg, rgba(138,43,226,0), rgba(0,191,255,0.4), rgba(255,105,180,0.4), rgba(138,43,226,0))",
                                  width: "45%",
                                  filter: "blur(3px)",
                                  pointerEvents: "none",
                                }}
                              />
                              {/* petites étoiles qui twinkle en permanence */}
                              {Array.from({ length: 6 }).map((_, i) => (
                                <motion.span
                                  key={i}
                                  initial={{ opacity: 0.2 }}
                                  animate={{ opacity: [0.2, 1, 0.2] }}
                                  transition={{ duration: 1.8 + (i % 5) * 0.3, repeat: Infinity }}
                                  style={{
                                    position: "absolute",
                                    left: `${8 + (i * 77) % 92}%`,
                                    top: `${10 + (i * 53) % 60}%`,
                                    width: 3,
                                    height: 3,
                                    borderRadius: 999,
                                    background: "radial-gradient(circle, #fff, rgba(255,255,255,0))",
                                    boxShadow: "0 0 8px rgba(180,160,255,0.8)",
                                    pointerEvents: "none",
                                  }}
                                />
                              ))}
                            </motion.div>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-slate-400 text-sm">
                            <span className="text-purple-400">💡 Astuce :</span> Survolez chaque rank ci-dessus pour voir ses effets visuels en action !
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 p-6 rounded-xl border border-emerald-500/30">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">✨</div>
                      <div>
                        <h4 className="text-xl font-semibold text-white mb-3">Animations & Effets</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-400">✓</span>
                              <span className="text-slate-300 text-sm">Halos colorés permanents</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-400">✓</span>
                              <span className="text-slate-300 text-sm">Effets hover spectaculaires</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-400">✓</span>
                              <span className="text-slate-300 text-sm">Particules et étincelles</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-400">✓</span>
                              <span className="text-slate-300 text-sm">Logos de rank animés</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-400">✓</span>
                              <span className="text-slate-300 text-sm">Gradients et brillances</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-400">✓</span>
                              <span className="text-slate-300 text-sm">Effets cosmiques</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 p-6 rounded-xl border border-orange-500/30">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">🔄</div>
                      <div>
                        <h4 className="text-xl font-semibold text-white mb-3">Reset Mensuel</h4>
                        <p className="text-slate-300 text-sm mb-3">
                          Les ranks se remettent à zéro chaque mois pour maintenir la compétition équitable.
                          Vos contributions totales restent visibles dans votre profil.
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-orange-400">📅</span>
                          <span className="text-slate-300 text-sm">Reset automatique le 1er de chaque mois</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'advanced' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                      🚀
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Fonctionnalités avancées</h3>
                    <p className="text-slate-400">Découvrez toutes les possibilités</p>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 p-6 rounded-xl border border-emerald-500/30">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">📈</div>
                        <div>
                          <h4 className="text-xl font-semibold text-white mb-3">Historique des prix</h4>
                          <p className="text-slate-300 mb-4">
                            Survolez les prix pour voir les graphiques d'évolution et les tendances.
                </p>
              </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 p-6 rounded-xl border border-blue-500/30">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">⭐</div>
                <div>
                          <h4 className="text-xl font-semibold text-white mb-3">Système de favoris</h4>
                          <p className="text-slate-300 mb-4">
                            Sauvegardez vos items préférés pour un accès rapide lors de vos prochaines sessions.
                          </p>
                        </div>
                      </div>
                </div>

                    <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 p-6 rounded-xl border border-purple-500/30">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">💾</div>
                <div>
                          <h4 className="text-xl font-semibold text-white mb-3">Sessions sauvegardées</h4>
                          <p className="text-slate-300 mb-4">
                            Sauvegardez et chargez vos configurations complètes pour reprendre vos calculs plus tard.
                          </p>
                        </div>
                      </div>
                </div>

                    <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 p-6 rounded-xl border border-orange-500/30">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">📤</div>
                <div>
                          <h4 className="text-xl font-semibold text-white mb-3">Export/Import</h4>
                          <p className="text-slate-300 mb-4">
                            Partagez vos configurations avec d'autres joueurs via des liens ou des fichiers JSON.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'tips' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                      💡
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Conseils d'utilisation</h3>
                    <p className="text-slate-400">Maximisez votre efficacité avec Craftus</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 p-6 rounded-xl border border-emerald-500/30">
                      <div className="text-3xl mb-3">✅</div>
                      <h4 className="text-lg font-semibold text-white mb-3">Bonnes pratiques</h4>
                      <ul className="space-y-2 text-slate-300 text-sm">
                        <li>• Vérifiez toujours les prix sur votre serveur</li>
                        <li>• Adaptez les prix communautaires à votre marché</li>
                        <li>• Utilisez les filtres pour votre métier</li>
                        <li>• Survolez les prix pour voir l'historique</li>
                      </ul>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-6 rounded-xl border border-blue-500/30">
                      <div className="text-3xl mb-3">⚠️</div>
                      <h4 className="text-lg font-semibold text-white mb-3">Points d'attention</h4>
                      <ul className="space-y-2 text-slate-300 text-sm">
                        <li>• Les couleurs indiquent la fiabilité, pas la rentabilité</li>
                        <li>• Limite de 20 items par session</li>
                        <li>• Les prix peuvent changer rapidement</li>
                        <li>• Vérifiez les taux de drop des ingrédients</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 rounded-xl border border-purple-500/30">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">🎯</div>
                <div>
                        <h4 className="text-xl font-semibold text-white mb-3">Stratégies avancées</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-400">📊</span>
                              <span className="text-slate-300 text-sm">Comparez plusieurs items simultanément</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-400">💾</span>
                              <span className="text-slate-300 text-sm">Sauvegardez vos sessions favorites</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-400">🔄</span>
                              <span className="text-slate-300 text-sm">Actualisez régulièrement les prix</span>
                </div>
              </div>
              <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-400">⭐</span>
                              <span className="text-slate-300 text-sm">Utilisez le système de favoris</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-400">📤</span>
                              <span className="text-slate-300 text-sm">Partagez vos configurations</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-400">📈</span>
                              <span className="text-slate-300 text-sm">Analysez les tendances de prix</span>
                            </div>
                          </div>
                        </div>
              </div>
              </div>
              </div>
          </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpModal;
