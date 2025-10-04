import React, { useEffect, useState } from 'react';
import { colors } from '../theme/colors';
import { currency } from '../lib/utils';
import { getDashboardStats, getDailyGainsHistory } from '../lib/sales';
import { Line } from 'react-chartjs-2';
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

export default function DashboardModal({ isOpen, onClose, userId, serverId }) {
  const [selectedPeriod, setSelectedPeriod] = useState('day');
  const [stats, setStats] = useState(null);
  const [dailyHistory, setDailyHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger les statistiques
  useEffect(() => {
    if (!isOpen || !userId) return;
    
    const loadStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsData, historyData] = await Promise.all([
          getDashboardStats(userId, serverId, selectedPeriod),
          getDailyGainsHistory(userId, serverId, 30)
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

  // Configuration du graphique
  const chartData = {
    labels: dailyHistory.map(item => 
      item.date.toLocaleDateString('fr-FR', { 
        month: 'short', 
        day: 'numeric' 
      })
    ),
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
          color: 'rgb(148, 163, 184)'
        }
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
                <option value="day">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>
            </div>
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
                    {stats.topItems.map((item, index) => (
                      <div
                        key={item.saleId || `${item.itemId}_${index}`}
                        className="flex items-center gap-3 p-3 rounded-lg bg-[#0a0d12] hover:bg-[#0f1319] transition-colors"
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
                          <div className="text-xs text-slate-400">
                            ROI: {item.totalInvestment > 0 
                              ? `${((item.totalGain / item.totalInvestment) * 100).toFixed(1)}%`
                              : '0%'
                            }
                          </div>
                        </div>
                      </div>
                    ))}
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
                <h3 className="text-lg font-semibold mb-4">Évolution des gains (30 derniers jours)</h3>
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
