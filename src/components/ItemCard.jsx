import React, { useEffect, useMemo, useState } from "react";
import { colors } from "../theme/colors";
import { currency, itemLevel, toInt } from "../lib/utils";
import PriceHistoryHover, { PRICE_KIND } from "./PriceHistoryHover";

export default function ItemCard({
  it,
  onRemove,
  onUpdateSellPrice,
  onUpdateCraftCount,
  onUpdateIngredientPrice,
  onCommitIngredientPrice,
  onCommitSellPrice,
}) {
  const [sticky, setSticky] = useState(null);

  const openSticky = (kind, id, title) => setSticky({ kind, id, title });
  const closeSticky = () => setSticky(null);

  // Échap pour fermer le graphe fixe
  useEffect(() => {
    if (!sticky) return;
    const onKey = (e) => { if (e.key === "Escape") closeSticky(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sticky]);

  const craftCount = Math.max(1, Number(it.craftCount || 1));

  const investment = useMemo(() => {
    return (it.ingredients || []).reduce((sum, ing) => {
      const q = Number(ing.qty || 0);
      const p = Math.round(Number(ing.unitPrice || 0));
      return sum + q * p;
    }, 0) * craftCount;
  }, [it.ingredients, craftCount]);

  const unitSell = Math.round(Number(it.sellPrice || 0));
  const unitTax = Math.floor(unitSell * 0.02);
  const totalTax = unitTax * craftCount;
  const revenueNet = unitSell * craftCount - totalTax;
  const gain = revenueNet - investment;
  const coeff = investment > 0 ? revenueNet / investment : null;

  const selectAll = (e) => requestAnimationFrame(() => e.target.select());

  return (
    <div className={`rounded-2xl border ${colors.border} ${colors.panel} p-4`}>
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
                >
                  <span className="group-hover:font-semibold transition">
                    {it.displayName}
                  </span>
                </PriceHistoryHover>
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-300">
              <span>Niveau {itemLevel(it) ?? it.level ?? "?"}</span>
              {it.jobName && (
                <>
                  <span className="opacity-60">•</span>
                  <span className="inline-flex items-center gap-1">
                    {it.jobIconUrl && (
                      <img
                        src={it.jobIconUrl}
                        alt=""
                        className="w-4 h-4 rounded object-contain"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                        draggable="false"
                      />
                    )}
                    {it.jobName}
                    {it.jobLevel != null && <span className="opacity-70">({it.jobLevel})</span>}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => onRemove?.(it.key)}
          className="shrink-0 rounded-xl bg-rose-900/30 text-rose-300 hover:bg-rose-900/50 px-3 py-2 text-sm"
        >
          Retirer
        </button>
      </div>

      {/* PRIX & QUANTITÉ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
          <div className="text-xs text-slate-400 mb-1">Prix de revente unitaire (k)</div>
          <input
            type="number"
            inputMode="numeric"
            step="1"
            min="0"
            value={it.sellPrice ?? ""}
            onFocus={selectAll}
            onChange={(e) => onUpdateSellPrice?.(it.key, toInt(e.target.value))}
            onBlur={() => {
              if (onCommitSellPrice && it.sellPrice != null && Number.isFinite(Number(it.sellPrice))) {
                onCommitSellPrice(it.key);
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
              className="h-10 w-full rounded-xl bg-[#1b1f26] border border-white/10 px-3"
              value={craftCount}
              onFocus={selectAll}
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

      {/* INGREDIENTS */}
      <div className="mt-2">
        <div className="text-sm font-semibold mb-2">Recette</div>
        <div className="space-y-2">
          {(it.ingredients || []).map((ing) => (
            <div key={ing.ankamaId} className="flex items-center gap-3">
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

              <div className="w-40">
                <div className="text-xs text-slate-400 mb-1">Prix unitaire (k)</div>
                <input
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min="0"
                  className="h-9 w-full rounded-lg bg-[#1b1f26] border border-white/10 px-2 text-sm"
                  value={ing.unitPrice ?? ""}
                  onFocus={selectAll}
                  onChange={(e) => onUpdateIngredientPrice?.(it.key, ing.ankamaId, toInt(e.target.value))}
                  onBlur={() => {
                    if (onCommitIngredientPrice && ing.unitPrice != null && Number.isFinite(Number(ing.unitPrice))) {
                      onCommitIngredientPrice(it.key, ing.ankamaId);
                    }
                  }}
                />
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
                width={900}
                height={420}
                position="cursor"
              >
                <div className="h-[420px] w-full rounded-lg bg-[#0b0f14] border border-white/10 cursor-crosshair" />
              </PriceHistoryHover>
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
