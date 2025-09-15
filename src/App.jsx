import React, { useEffect, useRef, useState } from "react";
import { colors } from "./theme/colors";
import SearchBar from "./components/SearchBar";
import JobSelect from "./components/JobSelect";
import ItemCard from "./components/ItemCard";
import ComparisonTable from "./components/ComparisonTable";
import ShoppingList from "./components/ShoppingList"; // ⬅️ shopping list

import { itemAnkamaId, itemImage, itemLevel, itemName } from "./lib/utils";
import {
  apiGET,
  searchItems,
  fetchRecipeEntriesForItem,
  fetchItemsByIds,
} from "./lib/api";

// Firebase (auth + sessions)
import { auth, onAuthStateChanged } from "./lib/firebase";
import AuthBar from "./auth/AuthBar";
import SaveDialog from "./sessions/SaveDialog";
import LoadDialog from "./sessions/LoadDialog";

// Métadonnées (types & classes)
import { loadItemTypes, loadBreeds, extractItemTypeMeta } from "./lib/meta";

// Prix communautaires
import {
  getCommunityPrice,
  pushCommunityPrice,
  PRICE_KIND,
} from "./lib/communityPrices";

// Logo
import craftusLogo from "./assets/craftus.png";

const TAX_RATE = 0.02;

// ---- calculs (net = revenu brut - taxe 2%) ----
function computeInvestment(it) {
  const perUnit = (it.ingredients || []).reduce(
    (sum, ing) => sum + (ing.unitPrice ?? 0) * ing.qty,
    0
  );
  return perUnit * (it.craftCount || 1);
}
function computeGrossRevenue(it) {
  return (it.sellPrice ?? 0) * (it.craftCount || 1);
}
function computeTax(it) {
  return computeGrossRevenue(it) * TAX_RATE;
}
function computeNetRevenue(it) {
  return computeGrossRevenue(it) - computeTax(it);
}
function computeGain(it) {
  return computeNetRevenue(it) - computeInvestment(it);
}
function computeCoeff(it) {
  const inv = computeInvestment(it);
  const net = computeNetRevenue(it);
  if (!inv) return null;
  return net / inv;
}

// --------- outils partage (Base64URL) ----------
function toBase64Url(json) {
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}
function fromBase64Url(b64url) {
  const b64 = b64url.replaceAll("-", "+").replaceAll("_", "/") + "===".slice(0, (4 - (b64url.length % 4)) % 4);
  const s = atob(b64);
  return decodeURIComponent(escape(s));
}

// --------- helper entier kamas ----------
function toInt(v) {
  if (v === "" || v == null) return undefined;
  const n = Number(v);
  if (!Number.isFinite(n)) return undefined;
  return Math.round(n);
}

export default function App() {
  // Recherche
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggest, setLoadingSuggest] = useState(false);

  // Fil d’objets
  const [items, setItems] = useState([]);

  // Filtres visibles
  const [equipmentOnly, setEquipmentOnly] = useState(false);
  // ⚠️ On ne montre PLUS la case “craftables” : on force à true
  const craftableOnly = true;

  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState("");

  // Debug (facultatif)
  const [debugUrl, setDebugUrl] = useState("");
  const [debugErr, setDebugErr] = useState("");
  const [showDebug, setShowDebug] = useState(false);

  // Tri comparatif
  const [sort, setSort] = useState({ key: "gain", dir: "desc" });

  // Auth
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Modales sessions
  const [openSave, setOpenSave] = useState(false);
  const [openLoad, setOpenLoad] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Icône de la session courante
  const [sessionIconUrl, setSessionIconUrl] = useState(null);
  const [sessionName, setSessionName] = useState(null);

  // Types d’objet & classes
  const [itemTypesMap, setItemTypesMap] = useState({});
  const [breeds, setBreeds] = useState([]);

  // Charger types + classes
  useEffect(() => {
    (async () => {
      const [typesMap, breedsArr] = await Promise.all([
        loadItemTypes(setDebugUrl, setDebugErr),
        loadBreeds(setDebugUrl, setDebugErr),
      ]);
      setItemTypesMap(typesMap || {});
      setBreeds(Array.isArray(breedsArr) ? breedsArr : []);
    })();
  }, []);

  // Charger métiers
  useEffect(() => {
    (async () => {
      try {
        const data = await apiGET(`/jobs?$limit=100`, setDebugUrl, setDebugErr);
        const arr = Array.isArray(data) ? data : data?.data ?? [];
        const norm = arr
          .map((j) => {
            const id = j?.id ?? j?._id ?? j?.ankamaId ?? j?.ankama_id;
            if (id == null) return null;
            const name = j?.name?.fr || j?.name || `Job ${id}`;
            const iconUrl =
              j?.iconUrl ||
              j?.imgUrl ||
              j?.icon ||
              j?.imageUrl ||
              (j?.icon?.url ? j.icon.url : undefined) ||
              (j?.iconId ? `https://api.dofusdb.fr/img/jobs/${j.iconId}.png` : undefined) ||
              (id ? `https://dofusdb.fr/assets/jobs/${id}.png` : undefined);
            return { id, name, iconUrl };
          })
          .filter(Boolean);
        setJobs(norm);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  // Recherche live (debounce)
  const debounceRef = useRef(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setLoadingSuggest(true);
    const filters = {
      equipmentOnly,
      craftableOnly: true, // ⬅️ FORCÉ
      jobId: jobId || null,
      jobName: null,
    };
    debounceRef.current = setTimeout(async () => {
      const arr = await searchItems({
        query: query.trim(),
        filters,
        setDebugUrl,
        setDebugErr,
      });
      setSuggestions(arr);
      setLoadingSuggest(false);
    }, 300);
  }, [query, equipmentOnly, jobId]);

  // Ajouter un item depuis une suggestion (avec pré-remplissage des prix communautaires)
  async function addItem(raw) {
    const id = itemAnkamaId(raw);
    if (!id) return alert("ID Ankama introuvable pour cet objet.");

    const entries = await fetchRecipeEntriesForItem(id, setDebugUrl, setDebugErr);
    if (!entries.length) return alert("Recette introuvable (objet non craftable ?).");

    const ids = [...new Set(entries.map((e) => e.itemId))];
    const map = await fetchItemsByIds(ids, setDebugUrl, setDebugErr);

    const ingredients = entries.map((e) => {
      const rit = map[e.itemId];
      return {
        ankamaId: e.itemId,
        name: itemName(rit) || `#${e.itemId}`,
        img: itemImage(rit),
        qty: e.quantity,
        unitPrice: undefined,
      };
    });

    const { typeId, typeName } = extractItemTypeMeta(raw);

    const base = {
      key: `${id}-${Date.now()}`,
      ankamaId: id,
      displayName: itemName(raw) || `Item ${id}`,
      level: itemLevel(raw),
      img: itemImage(raw),
      craftCount: 1,
      ingredients,
      sellPrice: undefined,
      typeId: typeId ?? null,
      typeName: typeName ?? null,
      tags: { classId: "" },
      job: raw.job || null,
    };

    // Pré-remplir avec les prix communautaires (si existants) — ENTIER
    try {
      const [sellDoc, ...ingDocs] = await Promise.all([
        getCommunityPrice(PRICE_KIND.SELL, id),
        ...ingredients.map((ing) => getCommunityPrice(PRICE_KIND.ING, ing.ankamaId)),
      ]);
      if (sellDoc?.lastPrice != null) base.sellPrice = Math.round(Number(sellDoc.lastPrice));
      base.ingredients = base.ingredients.map((ing, idx) => {
        const d = ingDocs[idx];
        return d?.lastPrice != null ? { ...ing, unitPrice: Math.round(Number(d.lastPrice)) } : ing;
      });
    } catch (e) {
      console.warn("[prefill] community price fetch failed", e);
    }

    setItems((prev) => [...prev, base]);
    setQuery("");
    setSuggestions([]);
  }

  // Rafraîchir tous les prix depuis la BDD communautaire (écrase les inputs) — ENTIER
  async function refreshCommunityPricesForAll() {
    if (!items.length) return;
    try {
      const refreshed = await Promise.all(
        items.map(async (it) => {
          const copy = { ...it, ingredients: it.ingredients.map((x) => ({ ...x })) };

          try {
            const d = await getCommunityPrice(PRICE_KIND.SELL, copy.ankamaId);
            if (d?.lastPrice != null) copy.sellPrice = Math.round(Number(d.lastPrice));
          } catch (e) {
            console.warn("[refresh] sell", { itemId: copy.ankamaId, e });
          }

          for (let i = 0; i < copy.ingredients.length; i++) {
            const ing = copy.ingredients[i];
            try {
              const d = await getCommunityPrice(PRICE_KIND.ING, ing.ankamaId);
              if (d?.lastPrice != null) ing.unitPrice = Math.round(Number(d.lastPrice));
            } catch (e) {
              console.warn("[refresh] ing", { ingId: ing.ankamaId, e });
            }
          }
          return copy;
        })
      );
      setItems(refreshed);
    } catch (e) {
      console.error("[refreshCommunityPricesForAll] failed", e);
    }
  }

  // Mises à jour inputs — ENTIER
  const updateIngredientPrice = (itemKey, ingId, price) => {
    const val = price === "" || price == null ? undefined : Math.max(0, Math.round(Number(price)));
    setItems((prev) =>
      prev.map((it) =>
        it.key !== itemKey
          ? it
          : {
              ...it,
              ingredients: it.ingredients.map((ing) =>
                ing.ankamaId === ingId ? { ...ing, unitPrice: val } : ing
              ),
            }
      )
    );
  };
  const updateSellPrice = (itemKey, price) =>
    setItems((prev) =>
      prev.map((it) =>
        it.key !== itemKey
          ? it
          : { ...it, sellPrice: price === "" || price == null ? undefined : Math.max(0, Math.round(Number(price))) }
      )
    );
  const updateCraftCount = (itemKey, count) =>
    setItems((prev) =>
      prev.map((it) =>
        it.key !== itemKey
          ? it
          : { ...it, craftCount: Math.max(1, Math.floor(Number(count) || 1)) }
      )
    );

  const removeItem = (itemKey) => setItems((prev) => prev.filter((it) => it.key !== itemKey));
  const clearAll = () => {
    setItems([]);
    setCurrentSessionId(null);
    setSessionIconUrl(null);
    setSessionName(null);
  };

  // Commit vers BDD communautaire au blur — ENTIER
  async function commitIngredientPrice(itemKey, ingId) {
    const it = items.find((x) => x.key === itemKey);
    if (!it) return;
    const ing = it.ingredients.find((g) => g.ankamaId === ingId);
    if (!ing) return;
    const v = Math.round(Number(ing.unitPrice));
    if (!Number.isFinite(v) || v < 0) return;
    if (!auth.currentUser) {
      console.warn("[commit] ignoré: utilisateur non connecté");
      return;
    }
    await pushCommunityPrice(PRICE_KIND.ING, ingId, v, auth.currentUser.uid);
  }
  async function commitSellPrice(itemKey) {
    const it = items.find((x) => x.key === itemKey);
    if (!it) return;
    const v = Math.round(Number(it.sellPrice));
    if (!Number.isFinite(v) || v < 0) return;
    if (!auth.currentUser) {
      console.warn("[commit] ignoré: utilisateur non connecté");
      return;
    }
    await pushCommunityPrice(PRICE_KIND.SELL, it.ankamaId, v, auth.currentUser.uid);
  }

  // Snapshot / restore sessions (on ne sauvegarde plus les prix : ils viennent de la BDD)
  function buildSnapshot() {
    const strippedItems = items.map((it) => ({
      ...it,
      sellPrice: undefined,
      ingredients: it.ingredients.map((ing) => ({ ...ing, unitPrice: undefined })),
    }));
    return {
      version: 4,
      when: new Date().toISOString(),
      filters: { equipmentOnly, craftableOnly: true, jobId },
      sort,
      items: strippedItems,
    };
  }
  function restoreFromSnapshot(snap) {
    const its = Array.isArray(snap.items) ? snap.items : [];
    its.forEach((i) => {
      i.tags = i.tags || {};
      if (i.tags.classId == null) i.tags.classId = "";
      i.sellPrice = undefined;
      i.ingredients = (i.ingredients || []).map((ing) => ({ ...ing, unitPrice: undefined }));
    });
    setItems(its);
    setSort(snap.sort || { key: "gain", dir: "desc" });
    setJobId(snap.filters?.jobId || "");
    setEquipmentOnly(!!snap.filters?.equipmentOnly);
    // Ecrase après chargement → recharge les PRIX depuis la BDD
    setTimeout(() => {
      refreshCommunityPricesForAll();
    }, 0);
  }

  // --------- Partage via lien & JSON ----------
  useEffect(() => {
    const url = new URL(window.location.href);
    const data = url.searchParams.get("data");
    if (!data) return;
    try {
      const json = fromBase64Url(data);
      const snap = JSON.parse(json);
      restoreFromSnapshot(snap); // déclenchera refreshCommunityPricesForAll()
    } catch (e) {
      console.warn("Lien de partage invalide.", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function shareByLink() {
    try {
      const snap = buildSnapshot();
      const json = JSON.stringify(snap);
      const b64url = toBase64Url(json);
      const url = `${location.origin}${location.pathname}?data=${b64url}`;
      await navigator.clipboard.writeText(url);
      alert("Lien copié dans le presse-papiers !");
    } catch (e) {
      alert("Impossible de copier le lien. Voir console.");
      console.error(e);
    }
  }
  function exportJSON() {
    const snap = buildSnapshot();
    const blob = new Blob([JSON.stringify(snap, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `craftus-session-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function importJSON() {
    const txt = prompt("Collez ici le JSON de session :");
    if (!txt) return;
    try {
      const snap = JSON.parse(txt);
      restoreFromSnapshot(snap); // déclenchera refreshCommunityPricesForAll()
      alert("Session chargée !");
    } catch {
      alert("JSON invalide.");
    }
  }

  function computeSuggestedLogo() {
    if (items.length > 0) {
      const it = items[0];
      const t = it.typeId && itemTypesMap[it.typeId];
      if (t?.iconUrl) return { kind: "type", id: t.id, name: t.name, url: t.iconUrl };
    }
    if (jobId) {
      const j = jobs.find((x) => String(x.id) === String(jobId));
      if (j?.iconUrl) return { kind: "job", id: j.id, name: j.name, url: j.iconUrl };
    }
    return null;
  }

  return (
    <div className={`${colors.bg} text-slate-100 min-h-screen p-4 md:p-6`}>
      <div className="max-w-6xl mx-auto">
        {/* Header avec logo */}
        <header className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <img
              src={craftusLogo}
              alt="Craftus"
              className="h-10 sm:h-12 md:h-16 lg:h-24 xl:h-60 w-auto select-none"
            />
            {sessionIconUrl && (
              <img
                src={sessionIconUrl}
                alt=""
                title={sessionName || "Session"}
                className="h-6 w-6 rounded ml-2"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}
          </div>
          <AuthBar user={user} />
        </header>

        {/* Debug */}
        {showDebug && (
          <div className={`mb-4 text-xs text-slate-400 rounded-xl ${colors.panel} border ${colors.border} p-3`}>
            <div className="font-semibold mb-1">Debug réseau</div>
            <div className="break-all">
              <div><span className="opacity-70">Dernière URL :</span> {debugUrl || "—"}</div>
              <div><span className="opacity-70">Dernière erreur :</span> {debugErr || "—"}</div>
            </div>
          </div>
        )}

        {/* Barre d’actions */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <button
            onClick={() => setShowDebug((v) => !v)}
            className={`px-3 py-2 rounded-xl bg-[#20242a] text-slate-300 border ${colors.border} hover:border-emerald-500 text-sm`}
          >
            Debug
          </button>
          <button
            onClick={clearAll}
            className={`px-3 py-2 rounded-xl bg-[#20242a] text-slate-300 border ${colors.border} hover:border-emerald-500 text-sm`}
          >
            Vider l'accueil
          </button>
          <button
            onClick={() => setOpenSave(true)}
            disabled={!user}
            className={`px-3 py-2 rounded-xl ${user ? "bg-emerald-600 hover:bg-emerald-500" : "bg-emerald-900/40"} text-white text-sm`}
          >
            Enregistrer
          </button>
          <button
            onClick={() => setOpenLoad(true)}
            disabled={!user}
            className={`px-3 py-2 rounded-xl ${user ? "bg-white/10 hover:bg-white/15" : "bg-white/5"} text-slate-200 text-sm border ${colors.border}`}
          >
            Charger
          </button>

          <button
            onClick={refreshCommunityPricesForAll}
            disabled={!items.length}
            className={`px-3 py-2 rounded-xl bg-[#20242a] text-slate-200 border ${colors.border} hover:border-emerald-500 text-sm`}
            title="Écrase tous les prix avec les derniers prix communautaires"
          >
            Rafraîchir les prix
          </button>

          {/* Partage */}
          <button
            onClick={shareByLink}
            className="ml-auto px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-sm border border-white/10"
          >
            Partager (lien)
          </button>
          <button
            onClick={exportJSON}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-sm border border-white/10"
          >
            Export JSON
          </button>
          <button
            onClick={importJSON}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-sm border border-white/10"
          >
            Import JSON
          </button>
        </div>

        {/* Filtres (on enlève le checkbox “craftables”) */}
        <div className={`mb-4 rounded-2xl border ${colors.border} ${colors.panel} p-3`}>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-emerald-500"
                checked={equipmentOnly}
                onChange={(e) => setEquipmentOnly(e.target.checked)}
              />
              Uniquement les équipements
            </label>
            <div className="flex items-center gap-2 text-sm">
              <JobSelect jobs={jobs} value={jobId} onChange={setJobId} />
              <span className="text-slate-400 text-xs">(filtre optionnel)</span>
            </div>
          </div>
        </div>

        {/* Barre de recherche */}
        <SearchBar
          query={query}
          setQuery={setQuery}
          suggestions={suggestions}
          loading={loadingSuggest}
          onChoose={addItem}
        />

        {/* FIL d’objets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it) => (
            <ItemCard
              key={it.key}
              it={it}
              onRemove={(k) => removeItem(k)}
              onUpdateSellPrice={updateSellPrice}
              onCommitSellPrice={commitSellPrice}
              onUpdateCraftCount={updateCraftCount}
              onUpdateIngredientPrice={updateIngredientPrice}
              onCommitIngredientPrice={commitIngredientPrice}
              taxRate={TAX_RATE}
              computeInvestment={computeInvestment}
              computeNetRevenue={computeNetRevenue}
              computeGain={computeGain}
              computeCoeff={computeCoeff}
            />
          ))}
        </div>

        {/* 🛒 Shopping list — entre le fil et le comparatif */}
        {items.length > 0 && (
          <div className="mt-6">
            <ShoppingList
              items={items}
              onUpdateIngredientPrice={updateIngredientPrice}
              onCommitIngredientPrice={commitIngredientPrice}
            />
          </div>
        )}

        {/* Comparatif — maintenant dès 1 item */}
        {items.length >= 1 && (
          <ComparisonTable
            items={items}
            sort={sort}
            setSort={setSort}
            onRemove={(k) => removeItem(k)}
            taxRate={TAX_RATE}
            computeInvestment={computeInvestment}
            computeGrossRevenue={computeGrossRevenue}
            computeTax={computeTax}
            computeNetRevenue={computeNetRevenue}
          />
        )}
      </div>

      {/* Modales */}
      <SaveDialog
        open={openSave}
        onClose={() => setOpenSave(false)}
        user={user}
        currentSessionId={currentSessionId}
        buildSnapshot={buildSnapshot}
        onSaved={(id, name, icon) => {
          setCurrentSessionId(id);
          if (name) setSessionName(name);
          if (icon?.url) setSessionIconUrl(icon.url);
        }}
        jobs={jobs}
        itemTypesMap={itemTypesMap}
        breeds={breeds}
        suggestedLogo={computeSuggestedLogo()}
      />
      <LoadDialog
        open={openLoad}
        onClose={() => setOpenLoad(false)}
        user={user}
        onLoaded={({ id, name, data, icon }) => {
          setCurrentSessionId(id);
          setSessionName(name || null);
          setSessionIconUrl(icon?.url || null);
          restoreFromSnapshot(data);
        }}
      />
    </div>
  );
}
