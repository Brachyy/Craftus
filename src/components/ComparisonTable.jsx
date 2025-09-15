import React from "react";
import { currency } from "../lib/utils";
import { colors } from "../theme/colors";

export default function ComparisonTable({
  items,
  sort,
  setSort,
  onRemove,
  taxRate = 0.02,
  // helpers (facultatifs) fournis par App
  computeInvestment,
  computeGrossRevenue,
  computeTax,
  computeNetRevenue,
}) {
  // Fallbacks sûrs si les helpers ne sont pas passés
  const _investment = (it) =>
    computeInvestment
      ? computeInvestment(it)
      : (it.ingredients || []).reduce((s, ing) => s + (ing.unitPrice ?? 0) * ing.qty, 0) *
        (it.craftCount || 1);

  const _gross = (it) =>
    computeGrossRevenue
      ? computeGrossRevenue(it)
      : (it.sellPrice ?? 0) * (it.craftCount || 1);

  const _tax = (it) =>
    computeTax ? computeTax(it) : _gross(it) * taxRate;

  const _net = (it) =>
    computeNetRevenue ? computeNetRevenue(it) : _gross(it) - _tax(it);

  const rows = items.map((it) => {
    const investment = _investment(it);
    const net = _net(it);                // revenu après taxe 2%
    const gain = net - investment;       // => GAIN NET
    const coeff = investment ? net / investment : null;
    return { it, investment, gain, coeff };
  });

  const sorted = [...rows].sort((a, b) => {
    const dir = sort.dir === "asc" ? 1 : -1;
    const key = sort.key;
    const av = a[key] ?? 0, bv = b[key] ?? 0;
    if (av === bv) return 0;
    return av > bv ? dir : -dir;
  });

  function clickSort(key) {
    setSort((prev) => {
      if (prev.key === key) return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
      // par défaut, on veut le meilleur en haut pour Gain
      return { key, dir: key === "gain" ? "desc" : "asc" };
    });
  }

  const Th = ({ label, keyName }) => (
    <th
      onClick={() => clickSort(keyName)}
      className="px-3 py-2 text-left text-xs cursor-pointer select-none text-slate-300 hover:text-white"
      title="Trier"
    >
      {label}{sort.key === keyName ? (sort.dir === "asc" ? " ▲" : " ▼") : ""}
    </th>
  );

  return (
    <div className={`mt-6 rounded-2xl border ${colors.border} ${colors.panel} overflow-hidden`}>
      <table className="w-full text-sm">
        <thead className="bg-black/20">
          <tr>
            <th className="px-3 py-2 text-left text-xs text-slate-300">Objet</th>
            <Th label="Investissement" keyName="investment" />
            <Th label="Gain (net −2%)" keyName="gain" />
            <Th label="Coeff" keyName="coeff" />
            <th className="px-3 py-2 text-right text-xs text-slate-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(({ it, investment, gain, coeff }) => (
            <tr key={it.key} className="border-t border-white/10">
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <img src={it.img} alt="" className="w-6 h-6 rounded bg-black/20 object-contain" />
                  <div>
                    <div className="font-medium">{it.displayName}</div>
                    <div className="text-xs text-slate-400">x{it.craftCount || 1}</div>
                  </div>
                </div>
              </td>
              <td className="px-3 py-2">{currency(investment)}</td>
              <td className={`px-3 py-2 ${gain >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {currency(gain)}
              </td>
              <td className="px-3 py-2">{coeff ? coeff.toFixed(2) : "–"}</td>
              <td className="px-3 py-2 text-right">
                <button
                  className="px-2 py-1 text-xs rounded-lg bg-[#1b1f26] border border-white/10 hover:border-rose-500 text-slate-300"
                  onClick={() => onRemove(it.key)}
                >
                  Retirer
                </button>
              </td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-4 text-center text-slate-400 text-sm">
                Ajoutez au moins deux objets pour comparer.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
