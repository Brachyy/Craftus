import React, { useEffect, useMemo, useState } from "react";
import { colors } from "../theme/colors";
import { currency, itemLevel, toInt, isEquipment } from "../lib/utils";
import PriceHistoryHover, { PRICE_KIND } from "./PriceHistoryHover";
import PriceWarning, { getInputColor } from "./PriceWarning";
import { getCommunityPrice } from "../lib/communityPrices";
import { detectAnomaly } from "../lib/anomalyDetection";

export default function ItemCard({
  it,
  onRemove,
  onUpdateSellPrice,
  onUpdateCraftCount,
  onUpdateIngredientPrice,
  onCommitIngredientPrice,
  onUpdateRuneInvestment,
  onCommitRuneInvestment,
  onCommitSellPrice,
  onToggleComparison,
  isSelectedForComparison,
  onToggleFavorite,
  isFavorite = false,
  onPutOnSale,
  onToggleForgemagie,
  isForgemagie = false,
  user,
  serverId, // Ajouter serverId pour les warnings
  refreshTrigger = 0, // Nouveau prop pour déclencher le rechargement
}) {
  const [sticky, setSticky] = useState(null);
  const [ingredientPrices, setIngredientPrices] = useState({});
  const [forceRender, setForceRender] = useState(0); // Pour forcer le re-rendu
  const [previousValues, setPreviousValues] = useState({}); // Tracker les valeurs précédentes

  const openSticky = (kind, id, title) => setSticky({ kind, id, title });
  const closeSticky = () => setSticky(null);

  // Calculer les fluctuations pour chaque ingrédient avec useMemo
  const ingredientFluctuations = useMemo(() => {
    const fluctuations = {};
    if (!serverId || !it.ingredients) return fluctuations;
    
    for (const ing of it.ingredients) {
      if (ing.unitPrice && ingredientPrices[ing.ankamaId]?.history?.length > 0) {
        // Extraire les prix des objets history
        const prices = ingredientPrices[ing.ankamaId].history.map(h => {
          if (typeof h === 'object') {
            return h.p || h.price || h.value || h.amount || h;
          }
          return h;
        });
        
        const anomaly = detectAnomaly(ing.unitPrice, prices);
        fluctuations[ing.ankamaId] = anomaly.fluctuation;
      } else {
        fluctuations[ing.ankamaId] = 0;
      }
    }
    return fluctuations;
  }, [serverId, it.ingredients, ingredientPrices, forceRender]);

  // Charger les données de prix communautaires pour les ingrédients
  useEffect(() => {
    if (!serverId || !it.ingredients) return;
    
    const loadIngredientPrices = async () => {
      const prices = {};
      for (const ing of it.ingredients) {
        try {
          const priceData = await getCommunityPrice(PRICE_KIND.ING, ing.ankamaId, serverId);
          prices[ing.ankamaId] = priceData;
        } catch (error) {
          console.warn(`Erreur chargement prix ingrédient ${ing.ankamaId}:`, error);
        }
      }
      setIngredientPrices(prices);
      setForceRender(prev => prev + 1); // Forcer le re-rendu
    };
    
    loadIngredientPrices();
  }, [serverId, it.ingredients, refreshTrigger]); // Utiliser refreshTrigger au lieu de forceRender

  // Échap pour fermer le graphe fixe
  useEffect(() => {
    if (!sticky) return;
    const onKey = (e) => { if (e.key === "Escape") closeSticky(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sticky]);


  const craftCount = Math.max(1, Number(it.craftCount || 1));

  // Calculer l'investissement en incluant les runes
  const investment = useMemo(() => {
    // Calculer le coût des ingrédients
    const ingredientsCost = (it.ingredients || []).reduce((sum, ing) => {
      if (ing.farmed) return sum;
      const q = Number(ing.qty || 0);
      const p = Math.round(Number(ing.unitPrice || 0));
      return sum + q * p;
    }, 0);
    
    // Ajouter le coût des runes (seulement pour les équipements)
    const runeCost = isEquipment(it) ? Number(it.runeInvestment || 0) : 0;
    
    return (ingredientsCost + runeCost) * craftCount;
  }, [it.ingredients, it.runeInvestment, it, craftCount]);

  const unitSell = Math.round(Number(it.sellPrice || 0));
  const unitTax = Math.floor(unitSell * 0.02);
  const totalTax = unitTax * craftCount;
  const revenueNet = unitSell * craftCount - totalTax;
  const gain = revenueNet - investment;
  const coeff = investment > 0 ? revenueNet / investment : null;

  // Sélectionne tout au focus clavier; au clic souris, laisse le caret où il est
  const handleFocus = (e) => {
    // Utiliser une approche plus simple : ne sélectionner que si c'est un focus programmatique
    // ou si l'utilisateur utilise Tab pour naviguer
    const isKeyboardNavigation = e.detail === 0 && (
      e.nativeEvent?.isTrusted === false || // Focus programmatique
      e.target.matches(':focus-visible') // Focus visible (clavier)
    );
    
    if (isKeyboardNavigation) {
      requestAnimationFrame(() => e.target.select());
    }
  };

  // Vérifier si l'item a un investissement en runes ou est marqué pour la forgemagie
  const hasRuneInvestment = isEquipment(it) && Number(it.runeInvestment || 0) > 0;
  const shouldHighlightBlue = hasRuneInvestment || isForgemagie;
  
  return (
    <div className={`rounded-2xl border ${colors.border} ${colors.panel} p-4 ${
      shouldHighlightBlue ? 'bg-blue-950/20 border-blue-500/30' : ''
    }`}>
      {/* HEADER */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Image cliquable (non focusable au Tab) */}
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => openSticky(PRICE_KIND.SELL, it.ankamaId, `Évolution · ${it.displayName}`)}
            className="shrink-0"
            title="Voir l'historique de prix"
          >
            <PriceHistoryHover
              kind={PRICE_KIND.SELL}
              id={it.ankamaId}
              title={`Évolution · ${it.displayName}`}
              width={460}
              height={240}
              serverId={serverId}
            >
              <img
                src={it.img}
                alt=""
                className="w-14 h-14 rounded bg-black/20 object-contain"
                draggable="false"
              />
            </PriceHistoryHover>
          </button>

          <div className="min-w-0">
            <div className="text-lg font-semibold truncate">
              {/* Titre cliquable (non focusable au Tab) */}
              <button
                type="button"
                tabIndex={-1}
                aria-hidden="true"
                onClick={() => openSticky(PRICE_KIND.SELL, it.ankamaId, `Évolution · ${it.displayName}`)}
                className="cursor-default group"
                title="Voir l'historique de prix"
              >
                <PriceHistoryHover
                  kind={PRICE_KIND.SELL}
                  id={it.ankamaId}
                  title={`Évolution · ${it.displayName}`}
                  width={460}
                  height={240}
                  serverId={serverId}
                >
                  <span className="group-hover:font-semibold transition">
                    {it.displayName}
                  </span>
                </PriceHistoryHover>
              </button>
              {(it.type?.name?.fr || it.typeName) && (
                <span className="text-sm text-slate-400 ml-2">
                  • {it.type?.name?.fr || it.typeName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-300">
              <span>Niveau {itemLevel(it) ?? it.level ?? "?"}</span>
              {(it.jobName || it.breed?.name?.fr) && (
                <>
                  <span className="opacity-60">•</span>
                  <span className="inline-flex items-center gap-1">
                    <img
                      src={it.jobIconUrl || it.breed?.img || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjNjY2NjY2IiBzdHJva2U9IiM5OTk5OTkiIHN0cm9rZS13aWR0aD0iMSIvPgo8dGV4dCB4PSI4IiB5PSIxMiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjZmZmZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5GAPC90ZXh0Pgo8L3N2Zz4K"}
                      alt=""
                      className="w-4 h-4 rounded object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjNjY2NjY2IiBzdHJva2U9IiM5OTk5OTkiIHN0cm9rZS13aWR0aD0iMSIvPgo8dGV4dCB4PSI4IiB5PSIxMiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjZmZmZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5GAPC90ZXh0Pgo8L3N2Zz4K";
                        e.currentTarget.style.border = "1px solid #666";
                      }}
                      draggable="false"
                    />
                    {it.jobName || it.breed?.name?.fr}
                    {(it.jobLevel != null || it.job?.level != null) && (
                      <span className="opacity-70">({it.jobLevel || it.job?.level})</span>
                    )}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          {/* Colonne 1 : Favoris */}
          <button
            onClick={() => onToggleFavorite?.(it.key)}
            className={`p-1 rounded-lg transition-colors ${
              isFavorite 
                ? 'text-yellow-400 hover:text-yellow-300' 
                : 'text-slate-400 hover:text-yellow-400'
            }`}
            title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            {isFavorite ? '★' : '☆'}
          </button>
          
          {/* Grille 2x2 : Retirer, Vendre, Comparer, FM */}
          <div className="grid grid-cols-2 gap-2">
            {/* Retirer */}
            <button
              onClick={() => onRemove?.(it.key)}
              className="rounded-lg bg-rose-900/30 text-rose-300 hover:bg-rose-900/50 px-2 py-1 text-sm"
            >
              Retirer
            </button>
            
            {/* Vendre */}
            {user && (
              <button
                onClick={() => onPutOnSale?.(it)}
                className="rounded-lg bg-emerald-900/30 text-emerald-300 hover:bg-emerald-900/50 px-2 py-1 text-sm"
                title="Mettre en vente"
              >
                Vendre
              </button>
            )}
            
            {/* Comparer */}
            <label className="relative inline-flex items-center cursor-pointer select-none h-8">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isSelectedForComparison}
                onChange={() => onToggleComparison?.(it.key)}
              />
              <span className="relative w-8 h-5 rounded-full bg-[#1b1f26] border border-white/10 peer-checked:bg-emerald-600 transition-colors"></span>
              <span className="absolute left-0.5 h-4 w-4 rounded-full bg-[#0b0f14] border border-white/10 transition-transform peer-checked:translate-x-3"></span>
              <span className="ml-2 text-xs text-slate-300">Comparer</span>
            </label>
            
            {/* FM */}
            <button
              onClick={() => onToggleForgemagie?.(it.key)}
              className={`px-2 py-1 text-sm rounded-lg transition-colors ${
                isForgemagie 
                  ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50' 
                  : 'bg-slate-800/30 text-slate-400 hover:bg-blue-900/30 hover:text-blue-300'
              }`}
              title={isForgemagie ? "Retirer de la forgemagie" : "Marquer pour la forgemagie"}
            >
              FM
            </button>
          </div>
        </div>
      </div>

      {/* PRIX & QUANTITÉ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
          <div className="text-xs text-slate-400 mb-1">Prix de revente unitaire (k)</div>
          <input
            type="text"
            inputMode="numeric"
            tabIndex={1}
            value={it.sellPrice ?? ""}
            onFocus={(e) => {
              handleFocus(e);
              // Sauvegarder la valeur actuelle au focus
              setPreviousValues(prev => ({
                ...prev,
                [`${it.key}_sellPrice`]: it.sellPrice
              }));
            }}
            onChange={(e) => onUpdateSellPrice?.(it.key, toInt(e.target.value))}
            onBlur={() => {
              if (onCommitSellPrice && it.sellPrice != null && Number.isFinite(Number(it.sellPrice))) {
                const key = `${it.key}_sellPrice`;
                const previousValue = previousValues[key];
                onCommitSellPrice(it.key, previousValue);
              }
            }}
            className="h-10 w-full rounded-xl bg-[#1b1f26] border border-white/10 px-3"
          />
          <div className="text-xs text-slate-400 mt-1">
            Taxe (2 %) unitaire : <span className="text-slate-200">{currency(unitTax)}</span>
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-400 mb-1">Quantité à fabriquer</div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              step="1"
              min="1"
              tabIndex={2}
              className="h-10 w-full rounded-xl bg-[#1b1f26] border border-white/10 px-3"
              value={craftCount}
              onFocus={handleFocus}
              onChange={(e) => onUpdateCraftCount?.(it.key, toInt(e.target.value) ?? 1)}
            />
            <div className="flex items-center gap-1">
              <button
                tabIndex={-1}
                className="w-9 h-10 rounded-xl bg-[#222831] border border-white/10 hover:bg-white/5"
                onClick={() => onUpdateCraftCount?.(it.key, Math.max(1, (toInt(craftCount) ?? 1) - 1))}
              >
                –
              </button>
              <button
                tabIndex={-1}
                className="w-9 h-10 rounded-xl bg-[#222831] border border-white/10 hover:bg-white/5"
                onClick={() => onUpdateCraftCount?.(it.key, (toInt(craftCount) ?? 1) + 1)}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Investissement Runes - seulement pour les équipements */}
      {isEquipment(it) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <div className={`text-xs mb-1 ${
              Number(it.runeInvestment || 0) > 0 
                ? 'text-blue-300 font-medium' 
                : 'text-slate-400'
            }`}>
              Investissement Runes (k)
              {Number(it.runeInvestment || 0) > 0 && (
                <span className="ml-1 text-blue-400">●</span>
              )}
            </div>
            <input
              type="text"
              inputMode="numeric"
              tabIndex={3}
              value={it.runeInvestment ?? ""}
              onFocus={(e) => {
                handleFocus(e);
                // Sauvegarder la valeur actuelle au focus
                setPreviousValues(prev => ({
                  ...prev,
                  [`${it.key}_runeInvestment`]: it.runeInvestment
                }));
              }}
              onChange={(e) => onUpdateRuneInvestment?.(it.key, toInt(e.target.value))}
              onBlur={() => {
                if (onCommitRuneInvestment && it.runeInvestment != null && Number.isFinite(Number(it.runeInvestment))) {
                  const key = `${it.key}_runeInvestment`;
                  const previousValue = previousValues[key];
                  onCommitRuneInvestment(it.key, previousValue);
                }
              }}
              className={`h-10 w-full rounded-xl px-3 ${
                Number(it.runeInvestment || 0) > 0 
                  ? 'bg-blue-950/30 border-blue-500/50 text-blue-100' 
                  : 'bg-[#1b1f26] border-white/10'
              }`}
              placeholder="0"
            />
            <div className="text-xs text-slate-400 mt-1">
              Coût des runes de forgemagie
            </div>
          </div>
          <div></div>
        </div>
      )}

      {/* INGREDIENTS */}
      <div className="mt-2">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold">Recette</div>
          <div className="text-xs font-semibold text-slate-300 w-63 text-left pr-2">Prix unitaire (k)</div>
        </div>
        <div className="space-y-2">
          {(it.ingredients || []).map((ing) => (
            <div
              key={ing.ankamaId}
              className="grid grid-cols-[auto_1fr_10rem_auto] items-center gap-3"
            >
              {/* Image cliquable (non focusable au Tab) */}
              <button
                type="button"
                tabIndex={-1}
                aria-hidden="true"
                onClick={() => openSticky(PRICE_KIND.ING, ing.ankamaId, `Évolution · ${ing.name}`)}
                className="shrink-0"
                title="Voir l'historique de prix"
              >
                <PriceHistoryHover
                  kind={PRICE_KIND.ING}
                  id={ing.ankamaId}
                  title={`Évolution · ${ing.name}`}
                  width={420}
                  height={220}
                  serverId={serverId}
                >
                  <img
                    src={ing.img}
                    alt=""
                    className="w-7 h-7 rounded bg-black/20 object-contain"
                    draggable="false"
                  />
                </PriceHistoryHover>
              </button>

              <div className="min-w-0 flex-1">
                {/* Nom cliquable (non focusable au Tab) */}
                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden="true"
                  onClick={() => openSticky(PRICE_KIND.ING, ing.ankamaId, `Évolution · ${ing.name}`)}
                  className="w-full text-left"
                  title="Voir l'historique de prix"
                >
                  <PriceHistoryHover
                    kind={PRICE_KIND.ING}
                    id={ing.ankamaId}
                    title={`Évolution · ${ing.name}`}
                    width={420}
                    height={220}
                    serverId={serverId}
                  >
                    <div className="leading-tight cursor-default group">
                      <div
                        className="text-sm truncate group-hover:font-semibold transition max-w-[10px] md:max-w-[7.5vw]"
                        title={ing.name}
                      >
                        {ing.name}
                      </div>
                      <div className="text-[11px] text-slate-400">x{ing.qty}</div>
                    </div>
                  </PriceHistoryHover>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Input de prix avec couleur selon fluctuation */}
                <div className="w-28">
                  {(() => {
                    // Utiliser la fluctuation mémorisée
                    const fluctuation = ingredientFluctuations[ing.ankamaId] || 0;
                    
                    // Appliquer les couleurs selon la fluctuation avec Tailwind CSS
                    let inputClass = "h-9 w-full rounded-lg border px-2 text-sm text-right";
                    
                    if (fluctuation <= 20) {
                        inputClass += " border-emerald-500/50 bg-black/50"; // Vert avec transparence
                      } else if (fluctuation <= 50) {
                        inputClass += " border-amber-500/50 bg-black/50"; // Jaune avec transparence
                      } else if (fluctuation <= 100) {
                        inputClass += " border-orange-500/50 bg-black/50"; // Orange avec transparence
                      } else {
                        inputClass += " border-red-500/50 bg-black/50"; // Rouge avec transparence
                      }
                    
                    return (
                      <input
                        type="text"
                        inputMode="numeric"
                        tabIndex={3}
                        className={inputClass}
                        value={ing.unitPrice ?? ""}
                        onFocus={(e) => {
                          handleFocus(e);
                          // Sauvegarder la valeur actuelle au focus
                          setPreviousValues(prev => ({
                            ...prev,
                            [`${it.key}_${ing.ankamaId}`]: ing.unitPrice
                          }));
                        }}
                        onChange={(e) => onUpdateIngredientPrice?.(it.key, ing.ankamaId, toInt(e.target.value))}
                        onBlur={() => {
                          if (onCommitIngredientPrice && ing.unitPrice != null && Number.isFinite(Number(ing.unitPrice))) {
                            const key = `${it.key}_${ing.ankamaId}`;
                            const previousValue = previousValues[key];
                            onCommitIngredientPrice(it.key, ing.ankamaId, previousValue);
                          }
                        }}
                      />
                    );
                  })()}
                </div>
                
                {/* Warnings à côté de l'input */}
                {ing.unitPrice && serverId && (
                  <PriceWarning
                    currentPrice={ing.unitPrice}
                    priceHistory={ingredientPrices[ing.ankamaId]?.history || []}
                    lastPriceDate={ingredientPrices[ing.ankamaId]?.lastAt}
                    serverId={serverId}
                  />
                )}
              </div>

                <div className="justify-self-start">
    <label className="inline-flex items-center cursor-pointer select-none">
      {/* Wrapper pour que le knob soit positionné par rapport au track */}
      <span className="relative inline-flex w-10 h-6">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={!!ing.farmed}
          onChange={(e) => {
            const val = !!e.target.checked;
            const updated = (it.ingredients || []).map((g) =>
              g.ankamaId === ing.ankamaId ? { ...g, farmed: val } : g
            );
            it.ingredients = updated;
            onUpdateIngredientPrice?.(it.key, ing.ankamaId, ing.unitPrice ?? "");
          }}
        />
        {/* Track (sibling de l'input) */}
        <span
          className="
            block w-10 h-6 rounded-full
            bg-[#1b1f26] border border-white/10
            transition-colors duration-300
            peer-checked:bg-emerald-600
          "
        />
        {/* Knob (sibling de l'input) */}
        <span
          className="
            absolute top-0.5 left-0.5
            h-5 w-5 rounded-full
            bg-[#0b0f14] border border-white/10
            transition-transform duration-200
            peer-checked:translate-x-4
          "
        />
      </span>

      <span className="ml-2 text-[12px] text-slate-300">Farmé ?</span>
    </label>
  </div>

            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        <div className="rounded-xl bg-[#151A22] border border-white/10 p-3">
          <div className="text-xs text-slate-400">Investissement</div>
          <div className="text-lg font-semibold">{currency(investment)}</div>
        </div>

        <div className="rounded-xl bg-emerald-900/10 border border-emerald-500/20 p-3">
          <div className="text-xs text-slate-400">Gain</div>
          <div className={`text-lg font-semibold ${gain >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {currency(gain)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Taxe totale (2 %) : {currency(totalTax)}
          </div>
        </div>

        <div className="rounded-xl bg-[#151A22] border border-white/10 p-3">
          <div className="text-xs text-slate-400">Coeff</div>
          <div className="text-lg font-semibold">{Number.isFinite(coeff) ? coeff.toFixed(2) : "–"}</div>
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
                serverId={serverId}
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
