import React, { useEffect, useState } from 'react';
import { colors } from '../theme/colors';
import { currency } from '../lib/utils';
import { getDashboardStats, getDailyGainsHistory, removeItemFromTop10 } from '../lib/sales';
import { getDoc, doc, deleteDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Line } from 'react-chartjs-2';

const STATS_COLLECTION = 'dashboard_stats';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function DashboardModal({ isOpen, onClose, userId, serverId, forgemagieItems = new Set() }) {
  const [selectedPeriod, setSelectedPeriod] = useState('day');
  const [stats, setStats] = useState(null);
  const [dailyHistory, setDailyHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fonction pour retirer un item du top 10 de toutes les périodes
  const handleRemoveFromTop10 = async (saleId) => {
    if (!userId) return;
    
    try {
      const removedFrom = await removeItemFromTop10(userId, serverId, selectedPeriod, saleId);
      
      if (removedFrom.length > 0) {
        // Recharger les stats pour la période actuelle après suppression
        const [statsData, historyData] = await Promise.all([
          getDashboardStats(userId, serverId, selectedPeriod),
          getDailyGainsHistory(userId, serverId, selectedPeriod, 30)
        ]);
        setStats(statsData);
        setDailyHistory(historyData);
        
        console.log(`Item supprimé des périodes: ${removedFrom.join(', ')}`);
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  };

  // Fonction pour reset complètement le dashboard
  const handleResetDashboard = async () => {
    if (!userId) return;
    
    if (confirm('Êtes-vous sûr de vouloir réinitialiser complètement le dashboard ? Cette action supprimera toutes les statistiques ET toutes les ventes.')) {
      try {
        setLoading(true);
        
        // Supprimer toutes les stats pour toutes les périodes
        const periods = ['hour', 'day', 'week', 'month'];
        const today = new Date();
        
        const periodStarts = {
          hour: new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours()),
          day: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          week: (() => {
            const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            start.setDate(start.getDate() - start.getDay());
            return start;
          })(),
          month: new Date(today.getFullYear(), today.getMonth(), 1)
        };
        
        const deletePromises = periods.map(async (period) => {
          const start = periodStarts[period];
          const statsId = `${userId}_${serverId}_${period}_${start.getTime()}`;
          
          try {
            const statsDoc = await getDoc(doc(db, STATS_COLLECTION, statsId));
            if (statsDoc.exists()) {
              await deleteDoc(doc(db, STATS_COLLECTION, statsId));
              console.log(`Stats ${period} supprimées`);
            }
          } catch (error) {
            console.error(`Erreur suppression stats ${period}:`, error);
          }
        });
        
        await Promise.all(deletePromises);
        
        // Supprimer aussi toutes les ventes pour ce serveur
        const salesQuery = query(
          collection(db, 'sales'),
          where('userId', '==', userId),
          where('serverId', '==', serverId)
        );
        
        const salesSnapshot = await getDocs(salesQuery);
        const salesDeletePromises = salesSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(salesDeletePromises);
        
        console.log(`${salesSnapshot.docs.length} ventes supprimées`);
        
        // Recharger les stats après reset (maintenant vides)
        const [statsData, historyData] = await Promise.all([
          getDashboardStats(userId, serverId, selectedPeriod),
          getDailyGainsHistory(userId, serverId, selectedPeriod, 30)
        ]);
        setStats(statsData);
        setDailyHistory(historyData);
        
        console.log('Dashboard réinitialisé avec succès');
      } catch (err) {
        console.error('Erreur lors du reset du dashboard:', err);
        setError('Erreur lors de la réinitialisation du dashboard');
      } finally {
        setLoading(false);
      }
    }
  };

  // Charger les statistiques
  useEffect(() => {
    if (!isOpen || !userId) return;
    
    const loadStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsData, historyData] = await Promise.all([
          getDashboardStats(userId, serverId, selectedPeriod),
          getDailyGainsHistory(userId, serverId, selectedPeriod, 30)
        ]);
        setStats(statsData);
        setDailyHistory(historyData);
      } catch (err) {
        setError('Erreur lors du chargement des statistiques');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [isOpen, userId, serverId, selectedPeriod]);

  // Configuration du graphique avec labels adaptatifs (un point par vente)
  const getLabelForPeriod = (item, index) => {
    const date = item.date;
    const itemName = item.itemName || 'Item';
    
    // Format court pour le nom de l'item (max 10 caractères)
    const shortName = itemName.length > 10 ? itemName.substring(0, 10) + '...' : itemName;
    
    switch (selectedPeriod) {
      case 'hour':
        // Format: HH:MM + nom court
        const timeStr = date.toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
        return `${timeStr}\n${shortName}`;
      case 'day':
        // Format: HH:MM + nom court
        const dayTimeStr = date.toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
        return `${dayTimeStr}\n${shortName}`;
      case 'week':
        // Format: Jour DD + nom court
        const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
        const dayNumber = date.getDate();
        return `${dayName} ${dayNumber}\n${shortName}`;
      case 'month':
        // Format: DD/MM + nom court
        const day = date.getDate();
        const month = date.getMonth() + 1;
        return `${day}/${month}\n${shortName}`;
      default:
        return `${date.toLocaleDateString('fr-FR')}\n${shortName}`;
    }
  };

  const chartData = {
    labels: dailyHistory.map((item, index) => getLabelForPeriod(item, index)),
    datasets: [
      {
        label: 'Gains (k)',
        data: dailyHistory.map(item => item.gains),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(16, 185, 129)',
        pointBorderColor: 'rgb(255, 255, 255)',
        pointBorderWidth: 2,
        pointRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(15, 19, 25, 0.9)',
        titleColor: 'rgb(255, 255, 255)',
        bodyColor: 'rgb(255, 255, 255)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `Gains: ${currency(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgb(148, 163, 184)',
          maxTicksLimit: dailyHistory.length > 50 ? 50 : dailyHistory.length,
          maxRotation: 90,
          minRotation: 0,
          font: {
            size: dailyHistory.length > 30 ? 10 : 12
          }
        },
        type: 'category'
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgb(148, 163, 184)',
          callback: function(value) {
            return currency(value);
          }
        }
      }
    },
    elements: {
      point: {
        radius: dailyHistory.length > 100 ? 1 : dailyHistory.length > 50 ? 2 : dailyHistory.length > 20 ? 3 : 4,
        hoverRadius: dailyHistory.length > 100 ? 3 : dailyHistory.length > 50 ? 4 : dailyHistory.length > 20 ? 5 : 6,
        backgroundColor: '#3b82f6',
        borderColor: '#1d4ed8',
        borderWidth: dailyHistory.length > 50 ? 1 : 2
      },
      line: {
        tension: 0.1,
        borderWidth: dailyHistory.length > 50 ? 1 : 2
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative rounded-2xl bg-[#0f1319] border border-white/10 shadow-2xl w-[95vw] max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold">Dashboard des gains</h2>
          <div className="flex items-center gap-4">
            {/* Sélecteur de période */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Période:</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-[#1b1f26] border border-white/10 rounded-lg px-3 py-1 text-sm"
              >
                <option value="hour">Cette heure</option>
                <option value="day">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>
            </div>
            {/* Bouton Reset masqué pour les utilisateurs
            <button
              onClick={handleResetDashboard}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
              title="Réinitialiser le dashboard"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </button>
            */}
            <button
              onClick={onClose}
              className="rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-2 text-sm"
            >
              ✕ Fermer
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <span className="ml-3 text-slate-400">Chargement...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {!loading && stats && (
            <>
              {/* Métriques principales */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="rounded-xl bg-[#151A22] border border-white/10 p-4">
                  <div className="text-xs text-slate-400 mb-1">Gains totaux</div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {currency(stats.totalGains || 0)}
                  </div>
                </div>
                <div className="rounded-xl bg-[#151A22] border border-white/10 p-4">
                  <div className="text-xs text-slate-400 mb-1">Investissement</div>
                  <div className="text-2xl font-bold text-orange-400">
                    {currency(stats.totalInvestment || 0)}
                  </div>
                </div>
                <div className="rounded-xl bg-[#151A22] border border-white/10 p-4">
                  <div className="text-xs text-slate-400 mb-1">Volume vendu</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {stats.totalVolume || 0}
                  </div>
                </div>
                <div className="rounded-xl bg-[#151A22] border border-white/10 p-4">
                  <div className="text-xs text-slate-400 mb-1">ROI</div>
                  <div className={`text-2xl font-bold ${
                    stats.totalInvestment > 0 && (stats.totalGains / stats.totalInvestment) >= 0 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    {stats.totalInvestment > 0 
                      ? `${((stats.totalGains / stats.totalInvestment) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </div>
                </div>
              </div>

              {/* Métriques avancées */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-xl bg-[#151A22] border border-white/10 p-4">
                  <div className="text-xs text-slate-400 mb-1">Taux de réussite</div>
                  <div className="text-xl font-bold text-purple-400">
                    {stats.successRate || 0}%
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {stats.soldCount || 0}/{stats.totalListed || 0} vendus
                  </div>
                </div>
                <div className="rounded-xl bg-[#151A22] border border-white/10 p-4">
                  <div className="text-xs text-slate-400 mb-1">Temps moyen de vente</div>
                  <div className="text-xl font-bold text-cyan-400">
                    {stats.averageSaleTime >= 0 ? `${stats.averageSaleTime}h` : '-1h'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Temps moyen avant vente
                  </div>
                </div>
                <div className="rounded-xl bg-[#151A22] border border-white/10 p-4">
                  <div className="text-xs text-slate-400 mb-1">Items en vente</div>
                  <div className="text-xl font-bold text-yellow-400">
                    {stats.unsoldCount || 0}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    En attente de vente
                  </div>
                </div>
              </div>

              {/* Top 10 des items les plus rentables */}
              <div className="rounded-xl bg-[#151A22] border border-white/10 p-4 mb-6">
                <h3 className="text-lg font-semibold mb-4">Top 10 des items les plus rentables</h3>
                {stats.topItems && stats.topItems.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {stats.topItems.map((item, index) => {
                      // Utiliser itemKey si disponible, sinon créer une clé basée sur le nom de l'item
                      const itemKey = item.itemKey || `item_${item.itemName?.toLowerCase().replace(/\s+/g, '_')}`;
                      // Considérer comme forgemagie si marqué manuellement OU si a un prix de rune
                      const hasRuneInvestment = Number(item.runeInvestment || 0) > 0;
                      const isForgemagie = forgemagieItems.has(itemKey) || hasRuneInvestment;
                      return (
                        <div
                          key={item.saleId || `${item.itemId}_${index}`}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                            isForgemagie 
                              ? 'bg-blue-950/20 border border-blue-500/30 hover:bg-blue-900/30' 
                              : 'bg-[#0a0d12] hover:bg-[#0f1319]'
                          }`}
                        >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <img
                          src={item.itemImage}
                          alt={item.itemName}
                          className="w-10 h-10 rounded-lg bg-black/20 object-contain"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{item.itemName}</h4>
                          <p className="text-xs text-slate-400">
                            {item.totalQuantitySold || 1} unité{(item.totalQuantitySold || 1) > 1 ? 's' : ''} • Prix: {currency(item.sellPrice || 0)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-emerald-400">
                            {currency(item.totalGain)}
                          </div>
                          {isForgemagie ? (
                            <div className="text-xs space-y-1">
                              <div className="text-slate-400">
                                Matériaux: <span className="text-orange-400">{currency(item.materialsInvestment || item.totalInvestment)}</span>
                              </div>
                              <div className="text-slate-400">
                                Runes: <span className="text-blue-400">{currency(item.runeInvestment || 0)}</span>
                              </div>
                              <div className="text-slate-400">
                                ROI: {item.totalInvestment > 0 
                                  ? `${((item.totalGain / item.totalInvestment) * 100).toFixed(1)}%`
                                  : '0%'
                                }
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-400">
                              ROI: {item.totalInvestment > 0 
                                ? `${((item.totalGain / item.totalInvestment) * 100).toFixed(1)}%`
                                : '0%'
                              }
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveFromTop10(item.saleId)}
                          className="ml-2 p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                          title="Retirer du top 10"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📊</div>
                    <p className="text-slate-400">Aucune donnée disponible</p>
                  </div>
                )}
              </div>

              {/* Graphique des gains */}
              <div className="rounded-xl bg-[#151A22] border border-white/10 p-4">
                <h3 className="text-lg font-semibold mb-4">
                  Évolution des gains ({selectedPeriod === 'hour' ? 'cette heure' : 
                    selectedPeriod === 'day' ? 'aujourd\'hui' : 
                    selectedPeriod === 'week' ? 'cette semaine' : 
                    'ce mois'})
                </h3>
                <div className="h-64">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
