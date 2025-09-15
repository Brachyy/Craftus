// src/components/ShoppingList.jsx
import React, { useMemo, useState } from "react";
import { colors } from "../theme/colors";
import { currency } from "../lib/utils";
import PriceHistoryHover, { PRICE_KIND } from "./PriceHistoryHover";

export default function ShoppingList({
  items,
  onUpdateIngredientPrice,
  onCommitIngredientPrice,
}) {
  // Brouillons pour "Prix total" saisi par l'utilisateur (clé = ingId)
  const [totalDrafts, setTotalDrafts] = useState({});

  const rows = useMemo(() => {
    const map = new Map();
    for (const it of items) {
      const mult = it.craftCount || 1;
      for (const ing of it.ingredients || []) {
        const key = String(ing.ankamaId);
        const prev = map.get(key);
        const qty = (prev?.qty || 0) + (ing.qty || 0) * mult;

        // garde la première valeur unitaire connue si existante
        const unitPrice =
          prev?.unitPrice ??
          (Number.isFinite(Number(ing.unitPrice)) ? Number(ing.unitPrice) : undefined);

        map.set(key, {
          id: ing.ankamaId,
          name: ing.name,
          img: ing.img,
          qty,
          unitPrice,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name, "fr")
    );
  }, [items]);

  if (!rows.length) return null;

  const grandTotal = rows.reduce(
    (s, r) => s + (Math.max(0, Math.round(r.unitPrice ?? 0)) * (r.qty || 0)),
    0
  );

  // propage un prix unitaire arrondi à l'entier vers toutes les cartes où l'ingrédient est utilisé
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

  // ne commite qu'une fois (prend le premier item qui contient cet ingrédient)
  const commitOnce = (ingId) => {
    const it = items.find((it) => it.ingredients.some((x) => x.ankamaId === ingId));
    if (it) onCommitIngredientPrice?.(it.key, ingId);
  };

  // Gestion des brouillons "prix total"
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
    if (!q) return; // rien à faire si pas de quantité
    const n = Number(raw);
    if (!Number.isFinite(n)) return;

    // Convertit total -> unitaire (arrondi entier)
    const unit = Math.max(0, Math.round(n / q));
    propagateUnit(ingId, unit);
    commitOnce(ingId);
  };

  return (
    <div className={`rounded-2xl border ${colors.border} ${colors.panel} p-4`}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Shopping List</h2>
        <div className="text-xs text-slate-400">
          Modifie “unitaire” (live) ou “total” (validé au relâchement) : tout se propage automatiquement.
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
              const unitRounded = Math.max(0, Math.round(r.unitPrice ?? 0));
              const derivedTotal = unitRounded * (r.qty || 0);
              const totalValue =
                Object.prototype.hasOwnProperty.call(totalDrafts, r.id)
                  ? totalDrafts[r.id]
                  : (Number.isFinite(derivedTotal) ? derivedTotal : "");

              return (
                <tr key={r.id} className="border-b border-white/5 align-top">
                  {/* Ingrédient : pas de truncate, on laisse passer sur plusieurs lignes */}
                  <td className="py-2 pr-2">
                    <div className="flex items-start gap-2">
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
                    </div>
                  </td>

                  {/* Quantité totale */}
                  <td className="py-2 pr-2 text-slate-300">{r.qty}</td>

                  {/* Prix unitaire (entier, propagation live) */}
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      inputMode="numeric"
                      className="h-9 w-36 rounded-lg bg-[#1b1f26] border border-white/10 px-2 text-sm"
                      value={Number.isFinite(unitRounded) ? unitRounded : ""}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        const unit = Number.isFinite(n) ? Math.max(0, Math.round(n)) : "";
                        propagateUnit(r.id, unit);
                      }}
                      onBlur={() => commitOnce(r.id)}
                    />
                  </td>

                  {/* Prix total (brouillon UI, propagation au blur uniquement) */}
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      inputMode="numeric"
                      className="h-9 w-40 rounded-lg bg-[#1b1f26] border border-white/10 px-2 text-sm"
                      value={totalValue}
                      onFocus={() => {
                        if (!Object.prototype.hasOwnProperty.call(totalDrafts, r.id)) {
                          startTotalEdit(r.id, derivedTotal);
                        }
                      }}
                      onChange={(e) => changeTotalDraft(r.id, e.target.value)}
                      onBlur={() => commitTotalDraft(r.id, r.qty)}
                    />
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
    </div>
  );
}
