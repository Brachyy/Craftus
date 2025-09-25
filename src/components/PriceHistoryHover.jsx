import React, { useEffect, useMemo, useRef, useState } from "react";
import { currency } from "../lib/utils";
import { getCommunityPrice, PRICE_KIND } from "../lib/communityPrices";

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

function toSeries(history) {
  if (!Array.isArray(history)) return { labels: [], data: [], last: null };
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
      try {
        const snap = await getCommunityPrice(kind, id, serverId);
        if (!cancelled) setSeries(toSeries(snap?.history));
      } catch (e) {
        console.warn("[PriceHistoryHover] fetch fail", e);
      } finally {
        !cancelled && setLoading(false);
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
          style={{ top: tooltipPos.top, left: tooltipPos.left, width, height }}
        >
          <div className="rounded-xl border border-white/10 bg-[#0f1318]/95 backdrop-blur p-3 shadow-xl w-full h-full">
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <div className="text-[11px] text-slate-300 truncate">
                {title || "Historique des prix"}
              </div>
              <div className="text-[11px] text-slate-200">
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
            <div className="w-full h-[calc(100%-28px)]">
              {Line ? (
                <Line data={data} options={options} />
              ) : (
                <div className="text-center text-xs text-slate-400 mt-6">
                  Graph indisponible (installe <code>chart.js</code> + <code>react-chartjs-2</code>)
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {staticOpen && (
        <div className="w-full h-full">
          <div className="rounded-xl border border-white/10 bg-[#0f1318] p-3 w-full h-full">
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <div className="text-sm text-slate-300 truncate">
                {title || "Historique des prix"}
              </div>
              <div className="text-xs text-slate-200">
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
            <div className="w-full h-[calc(100%-28px)]">
              {Line ? (
                <Line data={data} options={options} />
              ) : (
                <div className="text-center text-xs text-slate-400 mt-6">
                  Graph indisponible (installe <code>chart.js</code> + <code>react-chartjs-2</code>)
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export { PRICE_KIND };
