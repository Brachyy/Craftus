import React, { useEffect, useState } from "react";
import NumberInput from "./NumberInput";
import { colors } from "../theme/colors";
import { currency, computeInvestment, computeRevenue } from "../lib/utils";
import BreedSelect from "./BreedSelect";

// petit composant qui cache l'image si elle ne charge pas
function SafeIcon({ url, title, className = "h-4 w-4 opacity-90" }) {
  const [ok, setOk] = useState(Boolean(url));
  useEffect(() => setOk(Boolean(url)), [url]);
  if (!ok) return null;
  return <img src={url} alt="" title={title} className={className} onError={() => setOk(false)} />;
}

export default function ItemCard({
  it,
  onRemove,
  onUpdateSellPrice,
  onUpdateCraftCount,
  onUpdateIngredientPrice,
  itemTypesMap,
  breeds,
  onSetItemClass,
}) {
  const investment = computeInvestment(it);
  const revenue = computeRevenue(it);
  const gain = revenue - investment;

  const typeIcon = it.typeId && itemTypesMap?.[it.typeId]?.iconUrl;
  const typeName = it.typeName || itemTypesMap?.[it.typeId]?.name;

  const classId = it.tags?.classId || "";
  const breed = breeds?.find((b) => String(b.id) === String(classId));
  const breedIcon = breed?.iconUrl;

  return (
    <div className={`rounded-2xl ${colors.panel} border ${colors.border} shadow-sm p-4`}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {it.img ? <img src={it.img} className="h-10 w-10 rounded" /> : <div className="h-10 w-10 rounded bg-black/30" />}
          <div>
            <div className="flex items-center gap-2">
              {/* Icône de type (seulement si chargée) */}
              <SafeIcon url={typeIcon} title={typeName} />
              <div className="font-semibold">{it.displayName}</div>
              {/* Icône de classe (seulement si chargée) */}
              <SafeIcon url={breedIcon} title={breed?.name} />
            </div>
            <div className="text-slate-400 text-xs flex items-center gap-2">
              {it.level !== undefined && <span>Niv. {it.level}</span>}
              {typeName && <span className="opacity-70">• {typeName}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Sélecteur de classe */}
          {Array.isArray(breeds) && breeds.length > 0 && (
            <BreedSelect breeds={breeds} value={classId} onChange={(val) => onSetItemClass?.(it.key, val)} />
          )}
          <button onClick={() => onRemove(it.key)} className="px-3 py-2 rounded-xl bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-sm">
            Retirer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="text-slate-400 text-xs mb-1">Prix de revente unitaire (k)</div>
          <NumberInput value={it.sellPrice ?? ""} onChange={(v) => onUpdateSellPrice(it.key, v)} min={0} />
        </div>
        <div>
          <div className="text-slate-400 text-xs mb-1">Quantité à fabriquer</div>
          <NumberInput value={it.craftCount} onChange={(v) => onUpdateCraftCount(it.key, v)} min={1} />
        </div>
      </div>

      <div className="mb-2 text-sm font-medium">Recette</div>
      <div className="grid grid-cols-1 gap-2">
        {it.ingredients.map((ing) => (
          <div key={ing.ankamaId} className={`flex items-center gap-3 rounded-xl ${colors.chip} border ${colors.border} p-2`}>
            <div className="relative">
              {ing.img ? <img src={ing.img} className="h-10 w-10 rounded" /> : <div className="h-10 w-10 rounded bg-black/30" />}
              <span className="absolute -bottom-1 -right-1 bg-black/70 text-white text-[10px] px-1 rounded">x{ing.qty}</span>
            </div>
            <div className="flex-1">
              <div className="text-sm">{ing.name}</div>
              <div className="text-slate-400 text-xs">Prix unitaire (k)</div>
            </div>
            <NumberInput value={ing.unitPrice ?? ""} onChange={(v) => onUpdateIngredientPrice(it.key, ing.ankamaId, v)} min={0} className="w-28" />
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className={`rounded-xl bg-black/20 border ${colors.border} p-3`}>
          <div className="text-slate-400 text-xs">Investissement total (k)</div>
          <div className="text-lg font-semibold">{currency(investment)}</div>
        </div>
        <div className={`rounded-xl bg-black/20 border ${colors.border} p-3`}>
          <div className="text-slate-400 text-xs">Gain total (k)</div>
          <div className={`text-lg font-semibold ${gain >= 0 ? "text-emerald-400" : "text-rose-300"}`}>{currency(gain)}</div>
        </div>
      </div>
    </div>
  );
}
