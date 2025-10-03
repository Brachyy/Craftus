import React, { useEffect, useMemo, useRef, useState } from "react";
import { colors } from "../theme/colors";
import { currency } from "../lib/utils";
import PriceHistoryHover, { PRICE_KIND } from "./PriceHistoryHover";
import { detectAnomaly } from "../lib/anomalyDetection";
import { getCommunityPrice } from "../lib/communityPrices";
import PriceWarning from "./PriceWarning";

export default function ShoppingList({
  items,
  onUpdateIngredientPrice,
  onCommitIngredientPrice,
  serverId,
  refreshTrigger = 0, // Nouveau prop pour déclencher le rechargement
}) {
  // Overlay graphe "statique"
  const [sticky, setSticky] = useState(null);
  const openSticky = (kind, id, title) => setSticky({ kind, id, title });
  const closeSticky = () => setSticky(null);

  useEffect(() => {
    if (!sticky) return;
    const onKey = (e) => e.key === "Escape" && closeSticky();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sticky]);

  // Brouillons pour "Prix total"
  const [totalDrafts, setTotalDrafts] = useState({});
  const [previousValues, setPreviousValues] = useState({}); // Tracker les valeurs précédentes
  
  // Prix communautaires pour les ingrédients
  const [ingredientPrices, setIngredientPrices] = useState({});
  const [forceRender, setForceRender] = useState(0);


  const rows = useMemo(() => {
    const map = new Map();
    for (const it of items) {
      const mult = it.craftCount || 1;
      for (const ing of it.ingredients || []) {
        const key = String(ing.ankamaId);
        const prev = map.get(key);
        const qty = (prev?.qty || 0) + (ing.qty || 0) * mult;
        const unitPrice =
          prev?.unitPrice ??
          (Number.isFinite(Number(ing.unitPrice)) ? Number(ing.unitPrice) : undefined);
        map.set(key, {
          id: ing.ankamaId,
          name: ing.name,
          img: ing.img,
          qty,
          unitPrice,
          farmed: prev?.farmed ?? !!ing.farmed,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name, "fr")
    );
  }, [items]);

  // Charger les prix communautaires pour tous les ingrédients
  useEffect(() => {
    if (!serverId || !rows.length) return;

    const loadPrices = async () => {
      const prices = {};
      for (const row of rows) {
        try {
          const priceData = await getCommunityPrice(PRICE_KIND.ING, row.id, serverId);
          if (priceData) {
            prices[row.id] = priceData;
          }
        } catch (error) {
          console.error(`Erreur lors du chargement du prix pour ${row.name}:`, error);
        }
      }
      setIngredientPrices(prices);
      setForceRender(prev => prev + 1);
    };

    loadPrices();
  }, [serverId, rows.length, refreshTrigger]); // Ajouter refreshTrigger comme dépendance

  // Calculer les fluctuations pour chaque ingrédient
  const ingredientFluctuations = useMemo(() => {
    const fluctuations = {};
    
    for (const row of rows) {
      if (ingredientPrices[row.id]?.history?.length > 1) {
        // Extraire les prix des objets history
        const prices = ingredientPrices[row.id].history.map(h => {
          if (typeof h === 'object') {
            return h.p || h.price || h.value || h.amount || h;
          }
          return h;
        });
        
        const anomaly = detectAnomaly(row.unitPrice, prices);
        fluctuations[row.id] = anomaly.fluctuation || 0;
      } else {
        fluctuations[row.id] = 0;
      }
    }
    
    return fluctuations;
  }, [serverId, rows, ingredientPrices, forceRender]);

  if (!rows.length) return null;

  const grandTotal = rows.reduce(
    (s, r) => s + ((r.farmed ? 0 : Math.max(0, Math.round(r.unitPrice ?? 0))) * (r.qty || 0)),
    0
  );

  // refs pour navigation au Tab colonne par colonne
  const unitRefs = useRef([]);
  const totalRefs = useRef([]);
  unitRefs.current = [];
  totalRefs.current = [];
  const setUnitRef = (el) => el && unitRefs.current.push(el);
  const setTotalRef = (el) => el && totalRefs.current.push(el);

  const moveFocus = (list, current, dir) => {
    const idx = list.indexOf(current);
    if (idx === -1) return;
    const next = list[idx + dir];
    if (next) {
      next.focus();
      // sélectionne aussi le prochain champ pour accélérer la saisie en série
      requestAnimationFrame(() => next.select && next.select());
    }
  };

  // propagation prix unitaire (entier)
  const propagateUnit = (ingId, unitVal) => {
    let v;
    if (unitVal === "" || unitVal == null) {
      v = "";
    } else {
      const n = Number(unitVal);
      v = Number.isFinite(n) ? Math.max(0, Math.round(n)) : "";
    }
    for (const it of items) {
      const line = it.ingredients.find((x) => x.ankamaId === ingId);
      if (line) onUpdateIngredientPrice(it.key, ingId, v);
    }
  };
  const commitOnce = (ingId, previousValue) => {
    const it = items.find((it) => it.ingredients.some((x) => x.ankamaId === ingId));
    if (it) onCommitIngredientPrice?.(it.key, ingId, previousValue);
  };

  // gestion brouillons "total"
  const startTotalEdit = (ingId, currentTotal) => {
    setTotalDrafts((d) => ({ ...d, [ingId]: String(currentTotal ?? "") }));
  };
  const changeTotalDraft = (ingId, val) => {
    setTotalDrafts((d) => ({ ...d, [ingId]: val }));
  };
  const commitTotalDraft = (ingId, qty) => {
    const raw = totalDrafts[ingId];
    setTotalDrafts((d) => {
      const copy = { ...d };
      delete copy[ingId];
      return copy;
    });
    const q = Number(qty || 0);
    if (!q) return;
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    const unit = Math.max(0, Math.round(n / q)); // arrondi entier
    propagateUnit(ingId, unit);
    commitOnce(ingId);
  };

  // util pour sélectionner tout le contenu au focus
  const handleFocus = (e) => {
    if (e.detail === 0) {
      requestAnimationFrame(() => e.target.select());
    }
  };

  // Fonction pour obtenir les classes Tailwind CSS basées sur la fluctuation
  const getInputClasses = (fluctuation) => {
    const baseClasses = "h-9 rounded-lg border px-2 text-sm";
    
    if (fluctuation <= 20) {
      return `${baseClasses} border-emerald-500/50 bg-black/50`; // Vert avec transparence
    } else if (fluctuation <= 50) {
      return `${baseClasses} border-amber-500/50 bg-black/50`; // Jaune avec transparence
    } else if (fluctuation <= 100) {
      return `${baseClasses} border-orange-500/50 bg-black/50`; // Orange avec transparence
    } else {
      return `${baseClasses} border-red-500/50 bg-black/50`; // Rouge avec transparence
    }
  };

  return (
    <div className={`rounded-2xl border ${colors.border} ${colors.panel} p-4`}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Shopping List</h2>
        <div className="text-xs text-slate-400">
          Tab passe au prochain champ de la colonne. Échap pour fermer un graphe fixe.
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-400">
            <tr className="border-b border-white/10">
              <th className="py-2 pr-2">Ingrédient</th>
              <th className="py-2 pr-2 w-24">Qté totale</th>
              <th className="py-2 pr-2 w-40">Prix unitaire (k)</th>
              <th className="py-2 pr-2 w-44">Prix total (k)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const unitRounded = Number.isFinite(Number(r.unitPrice)) ? Math.round(Number(r.unitPrice)) : undefined;
              const derivedTotal = Number.isFinite(unitRounded) && unitRounded > 0 ? unitRounded * (r.qty || 0) : undefined;
              const totalValue =
                Object.prototype.hasOwnProperty.call(totalDrafts, r.id)
                  ? totalDrafts[r.id]
                  : (Number.isFinite(derivedTotal) ? derivedTotal : "");
              
              // Obtenir la fluctuation et les classes pour cet ingrédient
              const fluctuation = ingredientFluctuations[r.id] || 0;
              const inputClasses = getInputClasses(fluctuation);

              return (
                <tr key={r.id} className="border-b border-white/5 align-top">
                  {/* Ingrédient : clic souris pour graphe, ignoré par Tab */}
                  <td className="py-2 pr-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        tabIndex={-1}
                        aria-hidden="true"
                        onClick={() => openSticky(PRICE_KIND.ING, r.id, `Évolution · ${r.name}`)}
                        className="shrink-0"
                        title="Voir l'historique de prix"
                      >
                        <PriceHistoryHover
                          kind={PRICE_KIND.ING}
                          id={r.id}
                          title={`Évolution · ${r.name}`}
                          width={420}
                          height={220}
                          position="cursor"
                        >
                          <img
                            src={r.img}
                            alt=""
                            className="w-6 h-6 rounded bg-black/20 object-contain shrink-0 mt-0.5"
                          />
                        </PriceHistoryHover>
                      </button>

                      <div className="flex flex-col justify-center">
                        <button
                          type="button"
                          tabIndex={-1}
                          aria-hidden="true"
                          onClick={() => openSticky(PRICE_KIND.ING, r.id, `Évolution · ${r.name}`)}
                          className="text-left"
                          title="Voir l'historique de prix"
                        >
                          <PriceHistoryHover
                            kind={PRICE_KIND.ING}
                            id={r.id}
                            title={`Évolution · ${r.name}`}
                            width={420}
                            height={220}
                            position="cursor"
                          >
                            <span className="leading-tight cursor-default group break-words">
                              <span className="group-hover:font-semibold transition">
                                {r.name}
                              </span>
                            </span>
                          </PriceHistoryHover>
                        </button>
                        <label className="mt-1 relative inline-flex items-center cursor-pointer select-none h-6">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={!!r.farmed}
                            onChange={(e) => {
                              const val = !!e.target.checked;
                              for (const it of items) {
                                const line = it.ingredients.find((x) => x.ankamaId === r.id);
                                if (line) {
                                  line.farmed = val;
                                  onUpdateIngredientPrice(it.key, r.id, line.unitPrice ?? "");
                                }
                              }
                            }}
                          />
                          <span className="relative w-10 h-6 rounded-full bg-[#1b1f26] border border-white/10 peer-checked:bg-emerald-600 transition-colors"></span>
                          <span className="absolute top-1/2 left-[4px] -translate-y-1/2 h-5 w-5 rounded-full bg-[#0b0f14] border border-white/10 transition-transform peer-checked:translate-x-4"></span>
                          <span className="ml-2 text-[12px] text-slate-300">Farmé</span>
                        </label>
                      </div>
                    </div>
                  </td>

                  {/* Quantité totale */}
                  <td className="py-2 pr-2 text-slate-300">{r.qty}</td>

                  {/* Prix unitaire */}
                  <td className="py-2 pr-2 text-right">
                    <input
                      ref={setUnitRef}
                      type="text"
                      inputMode="numeric"
                      className={`${inputClasses} w-36 text-right`}
                      value={Number.isFinite(unitRounded) && unitRounded > 0 ? unitRounded : ""}
                      onFocus={(e) => {
                        handleFocus(e);
                        // Sauvegarder la valeur actuelle au focus
                        setPreviousValues(prev => ({
                          ...prev,
                          [`unit_${r.id}`]: r.unitPrice
                        }));
                      }}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        const unit = Number.isFinite(n) ? Math.max(0, Math.round(n)) : "";
                        propagateUnit(r.id, unit);
                      }}
                      onBlur={() => {
                        const key = `unit_${r.id}`;
                        const previousValue = previousValues[key];
                        commitOnce(r.id, previousValue);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Tab") {
                          e.preventDefault();
                          moveFocus(unitRefs.current, e.currentTarget, e.shiftKey ? -1 : 1);
                        }
                      }}
                    />
                  </td>

                  {/* Prix total (brouillon) */}
                  <td className="py-2 pr-2">
                    <div className="flex items-center gap-2">
                      <input
                        ref={setTotalRef}
                        type="text"
                        inputMode="numeric"
                        className={`${inputClasses} w-40`}
                        value={totalValue === 0 ? "" : totalValue}
                        onFocus={(e) => {
                          if (!Object.prototype.hasOwnProperty.call(totalDrafts, r.id)) {
                            startTotalEdit(r.id, derivedTotal);
                          }
                          handleFocus(e);
                        }}
                        onChange={(e) => changeTotalDraft(r.id, e.target.value)}
                        onBlur={() => commitTotalDraft(r.id, r.qty)}
                        onKeyDown={(e) => {
                          if (e.key === "Tab") {
                            e.preventDefault();
                            moveFocus(totalRefs.current, e.currentTarget, e.shiftKey ? -1 : 1);
                          }
                        }}
                      />
                      {/* Indicateur temporel */}
                      {ingredientPrices[r.id]?.lastAt && (
                        <PriceWarning
                          currentPrice={r.unitPrice}
                          priceHistory={ingredientPrices[r.id]?.history || []}
                          lastPriceDate={ingredientPrices[r.id].lastAt}
                          serverId={serverId}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cartouche Total achats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        <div className="rounded-xl bg-[#151A22] border border-white/10 p-3">
          <div className="text-xs text-slate-400">Total achats (k)</div>
          <div className="text-lg font-semibold">{currency(grandTotal)}</div>
        </div>
      </div>

      {/* OVERLAY graphe "statique" */}
      {sticky && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeSticky();
          }}
        >
          <div className="relative rounded-2xl bg-[#0f1319] border border-white/10 shadow-2xl w-[90vw] max-w-5xl">
            <button
              onClick={closeSticky}
              className="absolute top-3 right-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 px-2.5 py-1 text-sm"
              aria-label="Fermer"
              title="Fermer"
            >
              ✕
            </button>
            <div className="p-4">
              <div className="text-sm mb-2 text-slate-300">{sticky.title}</div>
              <PriceHistoryHover
                kind={sticky.kind}
                id={sticky.id}
                title={sticky.title}
                staticOpen={true}
              />
              <div className="text-xs text-slate-500 mt-2">
                Survolez la zone pour inspecter précisément le graphe. Échap pour fermer.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
