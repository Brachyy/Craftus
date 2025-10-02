import React, { useEffect, useMemo, useRef, useState } from "react";
import { currency } from "../lib/utils";
import { getCommunityPrice, PRICE_KIND } from "../lib/communityPrices";
import { getItemDropTable, formatDropRate, getMonsterImageUrl } from "../lib/dropRates";
import { fetchItemStats } from "../lib/api";

// Lazy-load Chart.js + react-chartjs-2 pour éviter un crash si non installés
let LineComp = null;
async function ensureChartsLoaded() {
  if (LineComp) return LineComp;
  try {
    const m = await import("react-chartjs-2");
    await import("chart.js/auto");
    LineComp = m.Line;
    return LineComp;
  } catch (e) {
    console.warn("[PriceHistoryHover] Chart.js non installé.", e);
    return null;
  }
}

// Composant pour afficher les statistiques de drop
function DropStats({ dropData, loading }) {
  if (loading) {
    return (
      <div className="mt-2 sm:mt-3 p-1.5 sm:p-2 bg-slate-800/50 rounded-lg">
        <div className="text-[10px] sm:text-xs text-slate-400">Chargement des drops...</div>
      </div>
    );
  }

  if (!dropData || dropData.length === 0) {
    return (
      <div className="mt-2 sm:mt-3 p-1.5 sm:p-2 bg-slate-800/50 rounded-lg">
        <div className="text-[10px] sm:text-xs text-slate-400">Aucune donnée de drop disponible</div>
      </div>
    );
  }

  return (
    <div className="mt-2 sm:mt-3 p-1.5 sm:p-2 bg-slate-800/50 rounded-lg">
      <div className="text-[10px] sm:text-xs font-semibold text-slate-300 mb-1 sm:mb-2">📦 Taux de drop</div>
      <div className="space-y-1">
        {dropData.slice(0, 5).map((drop, index) => (
          <div key={index} className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-slate-700 flex items-center justify-center shrink-0">
              {drop.monsterImage ? (
                <img 
                  src={getMonsterImageUrl(drop.monsterImage)} 
                  alt={drop.monsterName}
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              ) : null}
              <div className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 text-[8px] sm:text-[10px] flex items-center justify-center" style={{ display: drop.monsterImage ? 'none' : 'block' }}>
                🐲
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-slate-200 truncate" title={drop.monsterName}>
                {drop.monsterName || 'Monstre inconnu'}
              </div>
              <div className="text-slate-400 text-[8px] sm:text-[10px]">
                {drop.monsterLevel ? `Niv. ${drop.monsterLevel}` : 'Niveau inconnu'}
              </div>
            </div>
            <div className="text-emerald-400 font-semibold shrink-0 text-[10px] sm:text-xs">
              {formatDropRate(drop.dropRate)}
            </div>
          </div>
        ))}
        {dropData.length > 5 && (
          <div className="text-[10px] sm:text-xs text-slate-500 text-center pt-1">
            +{dropData.length - 5} autres monstres
          </div>
        )}
      </div>
    </div>
  );
}

// Composant pour afficher les statistiques d'items craftables
function ItemStats({ itemStats, loading }) {
  if (loading) {
    return (
      <div className="mt-2 sm:mt-3 p-1.5 sm:p-2 bg-slate-800/50 rounded-lg">
        <div className="text-[10px] sm:text-xs text-slate-400">Chargement des stats...</div>
      </div>
    );
  }

  if (!itemStats || ((!itemStats.effects || itemStats.effects.length === 0) && 
                     (!itemStats.damages || itemStats.damages.length === 0) && 
                     (!itemStats.weaponInfo || itemStats.weaponInfo.length === 0))) {
    return (
      <div className="mt-2 sm:mt-3 p-1.5 sm:p-2 bg-slate-800/50 rounded-lg">
        <div className="text-[10px] sm:text-xs text-slate-400">Aucune statistique disponible</div>
      </div>
    );
  }

  return (
    <div className="mt-2 sm:mt-3 p-1.5 sm:p-2 bg-slate-800/50 rounded-lg">
      {/* Dégâts/Vol */}
      {itemStats.damages && itemStats.damages.length > 0 && (
        <>
          <div className="text-[10px] sm:text-xs font-semibold text-red-300 mb-1 sm:mb-2">⚔️ Dégâts</div>
          <div className="space-y-1 mb-2">
            {itemStats.damages.map((damage, index) => (
              <div key={index} className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-red-500/20 flex items-center justify-center shrink-0">
                  <span className="text-red-400 text-[8px] sm:text-[10px]">⚔️</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-slate-200 font-medium">
                    <span className="font-bold text-white">{damage.value}</span> {damage.type}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Informations d'arme */}
      {itemStats.weaponInfo && itemStats.weaponInfo.length > 0 && (
        <>
          <div className="text-[10px] sm:text-xs font-semibold text-blue-300 mb-1 sm:mb-2">ℹ️ Informations</div>
          <div className="space-y-1 mb-2">
            {itemStats.weaponInfo.map((info, index) => (
              <div key={index} className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-blue-500/20 flex items-center justify-center shrink-0">
                  <span className="text-blue-400 text-[8px] sm:text-[10px]">ℹ️</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-slate-200 font-medium">
                    <span className="font-bold text-white">{info.value}</span> {info.type}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Effets */}
      {itemStats.effects && itemStats.effects.length > 0 && (
        <>
          <div className="text-[10px] sm:text-xs font-semibold text-slate-300 mb-1 sm:mb-2">⚡ Effets</div>
          <div className="space-y-1">
            {itemStats.effects.map((effect, index) => (
              <div key={index} className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-blue-500/20 flex items-center justify-center shrink-0">
                  <span className="text-blue-400 text-[8px] sm:text-[10px]">⭐</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-slate-200 font-medium">
                    <span className="font-bold text-white">{effect.value}</span> {effect.type}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Informations supplémentaires */}
      {(itemStats.level || itemStats.category || itemStats.weight || itemStats.set) && (
        <div className="mt-2 pt-2 border-t border-slate-700/50">
          <div className="space-y-1 text-[8px] sm:text-[10px] text-slate-400">
            {itemStats.level && (
              <div>Niveau: <span className="text-slate-300 font-medium">{itemStats.level}</span></div>
            )}
            {itemStats.set && (
              <div className="text-amber-400 font-medium">Panoplie {itemStats.set}</div>
            )}
            {itemStats.category && (
              <div>Catégorie: <span className="text-slate-300 font-medium">{itemStats.category}</span></div>
            )}
            {itemStats.weight && (
              <div>Poids: <span className="text-slate-300 font-medium">{itemStats.weight} pods</span></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function toSeries(history) {
  if (!Array.isArray(history)) {
    return { labels: [], data: [], last: null };
  }
  const pts = history
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

  return {
    labels: pts.map((x) => x.t),
    data: pts.map((x) => x.p),
    last: pts.at(-1) || null,
  };
}

/**
 * position: "cursor" | "anchor-right"
 *  - "cursor"        => près de la souris (par défaut)
 *  - "anchor-right"  => à droite de l’élément ancre
 */
export default function PriceHistoryHover({
  kind,
  id,
  title,
  children,
  width = 420,
  height = 240,
  position = "cursor",
  staticOpen = false,
  serverId = "global",
}) {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [Line, setLine] = useState(null);
  const [series, setSeries] = useState({ labels: [], data: [], last: null });
  const [dropData, setDropData] = useState([]);
  const [dropLoading, setDropLoading] = useState(false);
  const [itemStats, setItemStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Coordonnées de la souris (viewport) — adaptées à position:fixed
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // Chargement du graphe + des données uniquement quand ouvert
  useEffect(() => {
    const isOpen = staticOpen || open;
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      if (!Line) setLine(await ensureChartsLoaded());
      setLoading(true);
      setDropLoading(true);
      setStatsLoading(true);
      
      try {
        // Charger les données de prix
        const snap = await getCommunityPrice(kind, id, serverId);
        if (!cancelled) setSeries(toSeries(snap?.history));
        
        // Charger les données de drop (seulement pour les ingrédients)
        if (kind === PRICE_KIND.ING) {
          try {
            const drops = await getItemDropTable(id);
            if (!cancelled) setDropData(drops);
          } catch (dropError) {
            console.warn("[PriceHistoryHover] drop data fetch fail", dropError);
            if (!cancelled) setDropData([]);
          }
        }
        
        // Charger les stats d'items (seulement pour les items craftables)
        if (kind === PRICE_KIND.SELL) {
          try {
            const stats = await fetchItemStats(id);
            if (!cancelled) setItemStats(stats);
          } catch (statsError) {
            console.warn("[PriceHistoryHover] item stats fetch fail", statsError);
            if (!cancelled) setItemStats(null);
          }
        }
      } catch (e) {
        console.warn("[PriceHistoryHover] fetch fail", e);
      } finally {
        !cancelled && setLoading(false);
        !cancelled && setDropLoading(false);
        !cancelled && setStatsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, staticOpen, kind, id, Line]);

  // Calcul de la position de la popup (viewport coords pour fixed)
  const tooltipPos = useMemo(() => {
    const margin = 16;
    let top = 0, left = 0;

    if (position === "cursor") {
      top = mouse.y + 16;
      left = mouse.x + 16;
    } else {
      const el = anchorRef.current;
      if (el) {
        const r = el.getBoundingClientRect(); // viewport coords
        top = r.top + (r.height - height) / 2;
        left = r.right + 12;
      }
    }

    // Clamp dans le viewport
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (left + width + margin > vw) left = vw - width - margin;
    if (top + height + margin > vh) top = vh - height - margin;
    if (left < margin) left = margin;
    if (top < margin) top = margin;

    return { top, left };
  }, [mouse, position, width, height, open]);

  const data = useMemo(() => ({
    labels: series.labels.map((d) =>
      new Intl.DateTimeFormat(undefined, {
        day: "2-digit", month: "2-digit",
        hour: "2-digit", minute: "2-digit",
      }).format(d)
    ),
    datasets: [{
      label: "Prix",
      data: series.data,
      borderWidth: 2,
      fill: true,
      tension: 0.25,
    }],
  }), [series]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: (items) => items && items.length ? items[0].label : '',
          label: (c) => `${currency(c.parsed.y)} k`,
        }
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true } },
      y: { grid: { color: "rgba(148,163,184,.15)" }, ticks: { callback: v => currency(v) } },
    },
    elements: {
      line: { borderColor: "rgba(16,185,129,1)", backgroundColor: "rgba(16,185,129,.15)" },
      point: { radius: 0, hoverRadius: 3 },
    },
    interaction: { mode: 'index', intersect: false },
  }), []);

  return (
    <>
      {!staticOpen && (
        <span
          ref={anchorRef}
          className="inline-flex group"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onMouseMove={(e) => setMouse({ x: e.clientX, y: e.clientY })}
        >
          {children}
        </span>
      )}

      {(!staticOpen && open) && (
        <div
          className="pointer-events-none fixed z-50"
          style={{ top: tooltipPos.top, left: tooltipPos.left, width }}
        >
          <div className="rounded-xl border border-white/10 bg-[#0f1318]/95 backdrop-blur p-2 sm:p-3 shadow-xl w-full flex flex-col max-w-xs sm:max-w-sm md:max-w-md">
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <div className="text-[10px] sm:text-[11px] text-slate-300 truncate">
                {title || "Historique des prix"}
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-200">
                {series.last ? (
                  <>
                    <span className="font-semibold">{currency(series.last.p)}</span>{" · "}
                    <span className="opacity-80">
                      {new Intl.DateTimeFormat(undefined, {
                        year: "2-digit", month: "2-digit", day: "2-digit",
                        hour: "2-digit", minute: "2-digit",
                      }).format(series.last.t)}
                    </span>
                  </>
                ) : loading ? "Chargement…" : "—"}
              </div>
            </div>
            <div className="w-full h-32 sm:h-40 md:h-48 lg:h-52">
              {Line ? (
                <Line data={data} options={options} />
              ) : (
                <div className="text-center text-xs text-slate-400 mt-6">
                  Graph indisponible (installe <code>chart.js</code> + <code>react-chartjs-2</code>)
                </div>
              )}
            </div>
            
            {/* Statistiques de drop pour les ingrédients */}
            {kind === PRICE_KIND.ING && (
              <DropStats dropData={dropData} loading={dropLoading} />
            )}
            
            {/* Statistiques d'items pour les items craftables */}
            {kind === PRICE_KIND.SELL && (
              <ItemStats itemStats={itemStats} loading={statsLoading} />
            )}
          </div>
        </div>
      )}

      {staticOpen && (
        <div className="w-full h-full">
          <div className="rounded-xl border border-white/10 bg-[#0f1318] p-2 sm:p-3 md:p-4 w-full h-full flex flex-col">
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <div className="text-xs sm:text-sm text-slate-300 truncate">
                {title || "Historique des prix"}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-200">
                {series.last ? (
                  <>
                    <span className="font-semibold">{currency(series.last.p)}</span>{" · "}
                    <span className="opacity-80">
                      {new Intl.DateTimeFormat(undefined, {
                        year: "2-digit", month: "2-digit", day: "2-digit",
                        hour: "2-digit", minute: "2-digit",
                      }).format(series.last.t)}
                    </span>
                  </>
                ) : loading ? "Chargement…" : "—"}
              </div>
            </div>
            <div className="w-full h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80">
              {Line ? (
                <Line data={data} options={options} />
              ) : (
                <div className="text-center text-xs text-slate-400 mt-6">
                  Graph indisponible (installe <code>chart.js</code> + <code>react-chartjs-2</code>)
                </div>
              )}
            </div>
            
            {/* Statistiques de drop pour les ingrédients */}
            {kind === PRICE_KIND.ING && (
              <DropStats dropData={dropData} loading={dropLoading} />
            )}
            
            {/* Statistiques d'items pour les items craftables */}
            {kind === PRICE_KIND.SELL && (
              <ItemStats itemStats={itemStats} loading={statsLoading} />
            )}
          </div>
        </div>
      )}
    </>
  );
}

export { PRICE_KIND };
