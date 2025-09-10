import React from "react";
import { colors, clsx } from "../theme/colors";
import { currency, computeInvestment, computeRevenue, computeGain, computeCoeff } from "../lib/utils";

export default function ComparisonTable({ items, sort, setSort, onRemove }) {
  const setSortKey = (key) => setSort((s) =>
    s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "gain" ? "desc" : "asc" }
  );
  const caret = (k) => (sort.key === k ? (sort.dir === "asc" ? "▲" : "▼") : " ");

  const arr = [...items];
  const dir = sort.dir === "asc" ? 1 : -1;
  if (sort.key === "gain") arr.sort((a,b) => (computeGain(a) - computeGain(b)) * dir);
  else if (sort.key === "invest") arr.sort((a,b) => (computeInvestment(a) - computeInvestment(b)) * dir);
  else if (sort.key === "coef") {
    arr.sort((a,b) => {
      const ca = computeCoeff(a), cb = computeCoeff(b);
      if (ca == null && cb == null) return 0;
      if (ca == null) return 1;
      if (cb == null) return -1;
      return (ca - cb) * dir;
    });
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">Comparatif</h2>
      </div>
      <div className={`overflow-auto rounded-xl ${colors.panel} border ${colors.border} shadow-sm`}>
        <table className="min-w-full text-sm">
          <thead className="bg-black/20">
            <tr>
              <th className="text-left p-3">Objet</th>
              <th className="text-right p-3 cursor-pointer select-none" onClick={() => setSortKey("invest")}>
                Invest. (k) <span className="ml-1 opacity-70">{caret("invest")}</span>
              </th>
              <th className="text-right p-3">Revente (k)</th>
              <th className="text-right p-3 cursor-pointer select-none" onClick={() => setSortKey("gain")}>
                Gain (k) <span className="ml-1 opacity-70">{caret("gain")}</span>
              </th>
              <th className="text-right p-3 cursor-pointer select-none" onClick={() => setSortKey("coef")}>
                Coeff <span className="ml-1 opacity-70">{caret("coef")}</span>
              </th>
              <th className="p-3"> </th>
            </tr>
          </thead>
          <tbody>
            {arr.map((it) => {
              const invest = computeInvestment(it);
              const revenue = computeRevenue(it);
              const gain = revenue - invest;
              const coef = invest ? revenue / invest : null;
              return (
                <tr key={it.key} className="border-top border-white/5">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {it.img ? <img src={it.img} className="h-8 w-8 rounded"/> : <div className="h-8 w-8 rounded bg-black/30" />}
                      <div>
                        <div className="font-medium">{it.displayName}</div>
                        <div className="text-slate-400 text-xs">x{it.craftCount}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-right">{currency(invest)}</td>
                  <td className="p-3 text-right">{currency(revenue)}</td>
                  <td className={clsx("p-3 text-right", gain >= 0 ? "text-emerald-300" : "text-rose-300")}>{currency(gain)}</td>
                  <td className="p-3 text-right">{coef == null ? "—" : coef.toFixed(coef >= 10 ? 1 : 2)}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => onRemove(it.key)} className="px-3 py-2 rounded-xl bg-rose-500/10 text-rose-300 hover:bg-rose-500/20">Retirer</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
