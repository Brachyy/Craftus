import React, { useEffect, useMemo, useState } from "react";
import { colors } from "../theme/colors";
import { currency } from "../lib/utils";
import { getCommunityPrice, PRICE_KIND } from "../lib/communityPrices";

// Lazy-load Chart.js + react-chartjs-2
let LineComp = null;
async function ensureChartsLoaded() {
  if (LineComp) return LineComp;
  try {
    const m = await import("react-chartjs-2");
    await import("chart.js/auto");
    LineComp = m.Line;
    return LineComp;
  } catch (e) {
    console.warn("[PriceComparisonModal] Chart.js non installé.", e);
    return null;
  }
}

function toSeries(history, maxDays = null) {
  if (!Array.isArray(history)) return { labels: [], data: [], last: null };
  
  let pts = history
    .map((e) => {
      const p = Number(e?.p);
      const t = e?.t?.toMillis?.()
        ? new Date(e.t.toMillis())
        : e?.t?.seconds
        ? new Date(e.t.seconds * 1000)
        : null;
      return Number.isFinite(p) && t ? { t, p } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.t - b.t);

  // Filtrer par période si spécifiée
  if (maxDays) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - maxDays);
    pts = pts.filter(pt => pt.t >= cutoff);
  }

  return {
    labels: pts.map((x) => x.t),
    data: pts.map((x) => x.p),
    last: pts.at(-1) || null,
  };
}

const ITEM_COLORS = [
  "rgba(16,185,129,1)",   // emerald
  "rgba(59,130,246,1)",   // blue
  "rgba(245,158,11,1)",   // amber
  "rgba(239,68,68,1)",     // red
  "rgba(139,92,246,1)",   // violet
  "rgba(236,72,153,1)",   // pink
  "rgba(34,197,94,1)",    // green
  "rgba(251,146,60,1)",   // orange
];

const PERIOD_OPTIONS = [
  { label: "7 derniers jours", value: 7 },
  { label: "30 derniers jours", value: 30 },
  { label: "90 derniers jours", value: 90 },
  { label: "Tout l'historique", value: null },
];

export default function PriceComparisonModal({
  open,
  onClose,
  items,
  selectedKeys,
  serverId,
}) {
  const [Line, setLine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [seriesData, setSeriesData] = useState({});
  const [visibleItems, setVisibleItems] = useState(new Set(selectedKeys));
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [showGrid, setShowGrid] = useState(true);
  const [smoothCurves, setSmoothCurves] = useState(true);

  // Charger Chart.js et les données
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      if (!Line) setLine(await ensureChartsLoaded());
      setLoading(true);
      try {
        const selectedItems = items.filter(it => selectedKeys.has(it.key));
        const promises = selectedItems.map(async (it) => {
          const snap = await getCommunityPrice(PRICE_KIND.SELL, it.ankamaId, serverId);
          return { key: it.key, series: toSeries(snap?.history, selectedPeriod) };
        });
        const results = await Promise.all(promises);
        if (!cancelled) {
          const data = {};
          results.forEach(({ key, series }) => {
            data[key] = series;
          });
          setSeriesData(data);
        }
      } catch (e) {
        console.warn("[PriceComparisonModal] fetch fail", e);
      } finally {
        !cancelled && setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, items, selectedKeys, serverId, Line, selectedPeriod]);

  // Reset visible items quand la sélection change
  useEffect(() => {
    setVisibleItems(new Set(selectedKeys));
  }, [selectedKeys]);

  const chartData = useMemo(() => {
    const selectedItems = items.filter(it => selectedKeys.has(it.key));
    const datasets = selectedItems.map((it, idx) => {
      const series = seriesData[it.key];
      const color = ITEM_COLORS[idx % ITEM_COLORS.length];
      return {
        label: it.displayName,
        data: series?.data || [],
        borderColor: color,
        backgroundColor: color.replace("1)", "0.15)"),
        borderWidth: 2,
        fill: false,
        tension: smoothCurves ? 0.25 : 0,
        hidden: !visibleItems.has(it.key),
        pointRadius: 3,
        pointHoverRadius: 6,
      };
    });

    // Labels communs (toutes les dates uniques)
    const allLabels = new Set();
    selectedItems.forEach(it => {
      const series = seriesData[it.key];
      if (series?.labels) {
        series.labels.forEach(label => allLabels.add(label));
      }
    });
    const sortedLabels = Array.from(allLabels).sort();

    return {
      labels: sortedLabels.map(d => 
        new Intl.DateTimeFormat(undefined, {
          day: "2-digit", month: "2-digit",
          hour: "2-digit", minute: "2-digit",
        }).format(d)
      ),
      datasets,
    };
  }, [items, selectedKeys, seriesData, visibleItems, smoothCurves]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#e2e8f0',
          usePointStyle: true,
          padding: 20,
          font: { size: 12 },
        },
        onClick: (e, legendItem) => {
          const itemKey = legendItem.text;
          setVisibleItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemKey)) {
              newSet.delete(itemKey);
            } else {
              newSet.add(itemKey);
            }
            return newSet;
          });
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(15, 19, 25, 0.95)',
        titleColor: '#e2e8f0',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          title: (items) => {
            if (items && items.length > 0) {
              const date = new Date(items[0].label);
              return new Intl.DateTimeFormat(undefined, {
                year: "numeric", month: "2-digit", day: "2-digit",
                hour: "2-digit", minute: "2-digit", second: "2-digit",
              }).format(date);
            }
            return '';
          },
          label: (c) => `${c.dataset.label}: ${currency(c.parsed.y)} k`,
        },
      },
    },
    scales: {
      x: { 
        grid: { display: showGrid, color: "rgba(148,163,184,.15)" }, 
        ticks: { maxRotation: 0, autoSkip: true, color: '#94a3b8', font: { size: 11 } } 
      },
      y: { 
        grid: { display: showGrid, color: "rgba(148,163,184,.15)" }, 
        ticks: { callback: v => currency(v), color: '#94a3b8', font: { size: 11 } } 
      },
    },
    interaction: { mode: 'index', intersect: false },
  }), [visibleItems, showGrid]);

  if (!open) return null;

  const selectedItems = items.filter(it => selectedKeys.has(it.key));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative rounded-2xl bg-[#0f1319] border border-white/10 shadow-2xl w-[95vw] h-[90vh] max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-semibold text-slate-200">
            Comparaison des prix de vente
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
            {/* Période */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-300">Période:</label>
              <select
                value={selectedPeriod || ""}
                onChange={(e) => setSelectedPeriod(e.target.value ? Number(e.target.value) : null)}
                className="px-3 py-1 rounded-lg bg-[#1b1f26] text-slate-300 border border-white/10 text-sm"
              >
                {PERIOD_OPTIONS.map(opt => (
                  <option key={opt.value || "all"} value={opt.value || ""}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Grille */}
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
              />
              <span className="relative w-10 h-6 rounded-full bg-[#1b1f26] border border-white/10 peer-checked:bg-emerald-600 transition-colors"></span>
              <span className="absolute top-1/2 left-[4px] -translate-y-1/2 h-5 w-5 rounded-full bg-[#0b0f14] border border-white/10 transition-transform peer-checked:translate-x-4"></span>
              <span className="ml-2 text-sm text-slate-300">Grille</span>
            </label>

            {/* Courbes lissées */}
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={smoothCurves}
                onChange={(e) => setSmoothCurves(e.target.checked)}
              />
              <span className="relative w-10 h-6 rounded-full bg-[#1b1f26] border border-white/10 peer-checked:bg-emerald-600 transition-colors"></span>
              <span className="absolute top-1/2 left-[4px] -translate-y-1/2 h-5 w-5 rounded-full bg-[#0b0f14] border border-white/10 transition-transform peer-checked:translate-x-4"></span>
              <span className="ml-2 text-sm text-slate-300">Lissage</span>
            </label>

            {/* Sélection des courbes */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-300">Courbes:</span>
              <div className="flex flex-wrap gap-2">
                {selectedItems.map((it, idx) => {
                  const color = ITEM_COLORS[idx % ITEM_COLORS.length];
                  const isVisible = visibleItems.has(it.key);
                  return (
                    <button
                      key={it.key}
                      onClick={() => {
                        setVisibleItems(prev => {
                          const newSet = new Set(prev);
                          if (isVisible) {
                            newSet.delete(it.key);
                          } else {
                            newSet.add(it.key);
                          }
                          return newSet;
                        });
                      }}
                      className={`px-2 py-1 rounded text-xs border transition-colors ${
                        isVisible 
                          ? 'bg-emerald-600/20 text-emerald-300 border-emerald-600/30' 
                          : 'bg-slate-700/50 text-slate-400 border-slate-600/30'
                      }`}
                      style={{ borderLeftColor: color, borderLeftWidth: '3px' }}
                    >
                      {it.displayName}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 h-[calc(100%-160px)]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-slate-400">Chargement des données...</div>
            </div>
          ) : (
            <div className="h-full">
              {Line ? (
                <Line data={chartData} options={options} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-slate-400">
                    <div className="text-lg mb-2">Graphique indisponible</div>
                    <div className="text-sm">
                      Installe <code>chart.js</code> + <code>react-chartjs-2</code>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer avec infos */}
        <div className="p-4 border-t border-white/10 bg-[#0b0f14] rounded-b-2xl">
          <div className="text-xs text-slate-400">
            💡 Cliquez sur la légende ou les boutons pour masquer/afficher une courbe • 
            Survolez le graphe pour voir les valeurs détaillées • 
            Utilisez les contrôles pour personnaliser l'affichage
          </div>
        </div>
      </div>
    </div>
  );
}
