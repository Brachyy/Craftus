import React from "react";
import { colors } from "../theme/colors";
import NumberInput from "./NumberInput";

export default function ShoppingList({ rows = [], onSetPrice }) {
  if (!rows?.length) return null;

  return (
    <div className={`rounded-2xl ${colors.panel} border ${colors.border} mt-4`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="text-lg font-semibold">Shopping List</div>
        <div className="text-xs text-slate-400">
          Renseigne les prix ici : ils s’appliqueront à tous les items.
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-300">
              <th className="px-4 py-2 font-medium">Ingrédient</th>
              <th className="px-4 py-2 font-medium">Qté totale</th>
              <th className="px-4 py-2 font-medium">Prix unitaire (k)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.ankamaId} className="border-t border-white/5">
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    {r.img ? (
                      <img src={r.img} alt="" className="h-6 w-6 rounded" />
                    ) : (
                      <span className="h-6 w-6 rounded bg-black/30 inline-block" />
                    )}
                    <span>{r.name}</span>
                  </div>
                </td>
                <td className="px-4 py-2">{r.totalQty}</td>
                <td className="px-4 py-2">
                  <NumberInput
                    className="w-44"
                    value={r.unitPrice ?? ""}
                    onChange={(val) => onSetPrice(r.ankamaId, val)}
                    min={0}
                    step={1}
                    placeholder="0"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
