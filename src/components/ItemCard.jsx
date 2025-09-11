import React from "react";
import { colors } from "../theme/colors";
import NumberInput from "./NumberInput";

export default function ItemCard({
  it,
  onRemove,
  onUpdateSellPrice,
  onUpdateCraftCount,
  onUpdateIngredientPrice,
  itemTypesMap,
  globalPrices,
}) {
  const invest = it.ingredients.reduce((sum, ing) => {
    const qty = Number(ing.qty) || 0;
    const price = Number(ing.unitPrice ?? 0);
    return sum + qty * price;
  }, 0) * Math.max(1, Number(it.craftCount) || 1);

  const gain = Number(it.sellPrice ?? 0) * Math.max(1, Number(it.craftCount) || 1) - invest;

  const job = it.job || null;
  const jobChip = job ? (
    <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
      {job.iconUrl ? (
        <img src={job.iconUrl} alt="" className="h-4 w-4 rounded" />
      ) : (
        <span className="h-4 w-4 rounded bg-black/30 inline-block" />
      )}
      <span>{job.name}</span>
      {job.levelRequired != null && <span className="opacity-70">· Niv. {job.levelRequired}</span>}
    </div>
  ) : null;

  return (
    <div className={`rounded-2xl ${colors.panel} border ${colors.border} overflow-hidden`}>
      {/* Header */}
      <div className="flex items-start justify-between px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          {it.img ? <img src={it.img} className="h-8 w-8 rounded" /> : <div className="h-8 w-8 rounded bg-black/30" />}
          <div className="min-w-0">
            <div className="font-semibold truncate">{it.displayName}</div>
            <div className="text-xs text-slate-400">
              Niv. {it.level ?? "—"}{it.typeName ? ` · ${it.typeName}` : ""}
            </div>
            {jobChip}
          </div>
        </div>
        <button
          onClick={() => onRemove(it.key)}
          className="px-3 py-2 rounded-xl bg-rose-900/40 hover:bg-rose-800 text-rose-100 text-sm"
        >
          Retirer
        </button>
      </div>

      <div className="px-4 pb-4">
        {/* Revente / Quantité */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <div className="text-xs text-slate-400 mb-1">Prix de revente unitaire (k)</div>
            <NumberInput
              value={it.sellPrice ?? ""}
              onChange={(v) => onUpdateSellPrice(it.key, v)}
              min={0}
              step={1}
              className="w-full sm:w-40 md:w-44"
              showButtons={false}
            />
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Quantité à fabriquer</div>
            <NumberInput
              value={it.craftCount ?? 1}
              onChange={(v) => onUpdateCraftCount(it.key, v)}
              min={1}
              step={1}
              className="w-full sm:w-40 md:w-44"
              showButtons={true}   // <- Seule entrée avec +/−
            />
          </div>
        </div>

        {/* Recette */}
        <div className="text-sm font-semibold mb-2">Recette</div>
        <div className="space-y-2">
          {it.ingredients.map((ing) => (
            <div
              key={ing.ankamaId}
              className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-3 p-2 rounded-xl bg-black/20 border border-white/5"
            >
              <div className="flex items-center gap-2 min-w-0">
                {ing.img ? (
                  <img src={ing.img} className="h-7 w-7 rounded shrink-0" />
                ) : (
                  <div className="h-7 w-7 rounded bg-black/30 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-sm truncate">{ing.name}</div>
                  <div className="text-xs text-slate-400">x{ing.qty}</div>
                </div>
              </div>

              <div className="min-w-[10rem] sm:min-w-[11rem]">
                <div className="text-xs text-slate-400 mb-1">Prix unitaire (k)</div>
                <NumberInput
                  value={ing.unitPrice ?? ""}
                  onChange={(v) => onUpdateIngredientPrice(it.key, ing.ankamaId, v)}
                  min={0}
                  step={1}
                  className="w-full sm:w-40 md:w-44"
                  showButtons={false}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Totaux */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="text-xs text-slate-400">Investissement total (k)</div>
            <div className="text-lg">{invest.toLocaleString("fr-FR")}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="text-xs text-slate-400">Gain total (k)</div>
            <div className={`text-lg ${gain >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {gain.toLocaleString("fr-FR")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
