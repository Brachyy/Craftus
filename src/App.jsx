import React, { useEffect, useRef, useState } from "react";
import { colors } from "./theme/colors";
import SearchBar from "./components/SearchBar";
import JobSelect from "./components/JobSelect";
import ItemCard from "./components/ItemCard";
import ComparisonTable from "./components/ComparisonTable";
import { itemAnkamaId, itemImage, itemLevel, itemName } from "./lib/utils";
import { apiGET, searchItems, fetchRecipeEntriesForItem, fetchItemsByIds } from "./lib/api";

export default function App() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [items, setItems] = useState([]);

  // filtres
  const [equipmentOnly, setEquipmentOnly] = useState(false);
  const [craftableOnly, setCraftableOnly] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState("");

  // debug
  const [debugUrl, setDebugUrl] = useState("");
  const [debugErr, setDebugErr] = useState("");
  const [showDebug, setShowDebug] = useState(false);

  // tri (gain décroissant par défaut)
  const [sort, setSort] = useState({ key: "gain", dir: "desc" });

  // liste des métiers (essaie de déduire un iconUrl)
  useEffect(() => {
    (async () => {
      try {
        const data = await apiGET(`/jobs?$limit=100`, setDebugUrl, setDebugErr);
        const arr = Array.isArray(data) ? data : data?.data ?? [];
        const norm = arr.map(j => {
          const id = j?.id ?? j?._id ?? j?.ankamaId ?? j?.ankama_id;
          const name = j?.name?.fr || j?.name || `Job ${id}`;
          const iconUrl =
            j?.iconUrl || j?.imgUrl || j?.icon || j?.imageUrl ||
            (j?.icon?.url ? j.icon.url : undefined) ||
            (j?.iconId ? `https://api.dofusdb.fr/img/jobs/${j.iconId}.png` : undefined) ||
            (id ? `https://dofusdb.fr/assets/jobs/${id}.png` : undefined);
          return { id, name, iconUrl };
        }).filter(j => j.id != null);
        setJobs(norm);
      } catch {}
    })();
  }, []);

  // live search (debounce)
  const debounceRef = useRef(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.trim().length < 2) { setSuggestions([]); return; }
    setLoadingSuggest(true);
    const filters = { equipmentOnly, craftableOnly, jobId: jobId || null, jobName: null };
    debounceRef.current = setTimeout(async () => {
      const arr = await searchItems({ query: query.trim(), filters, setDebugUrl, setDebugErr });
      setSuggestions(arr);
      setLoadingSuggest(false);
    }, 350);
  }, [query, equipmentOnly, craftableOnly, jobId]);

  // actions
  async function addItem(raw) {
    const id = itemAnkamaId(raw);
    if (!id) return alert("ID Ankama introuvable pour cet objet.");
    const entries = await fetchRecipeEntriesForItem(id, setDebugUrl, setDebugErr);
    if (!entries.length) return alert("Recette introuvable (objet non craftable ?).");

    const ids = [...new Set(entries.map(e => e.itemId))];
    const map = await fetchItemsByIds(ids, setDebugUrl, setDebugErr);

    const ingredients = entries.map(e => {
      const it = map[e.itemId];
      return { ankamaId: e.itemId, name: itemName(it) || `#${e.itemId}`, img: itemImage(it), qty: e.quantity, unitPrice: undefined };
    });

    setItems(prev => [...prev, {
      key: `${id}-${Date.now()}`,
      ankamaId: id,
      displayName: itemName(raw) || `Item ${id}`,
      level: itemLevel(raw),
      img: itemImage(raw),
      craftCount: 1,
      ingredients,
      sellPrice: undefined,
    }]);

    setQuery(""); setSuggestions([]);
  }
  const updateIngredientPrice = (itemKey, ingId, price) => {
    const val = (price === "" || price == null) ? undefined : Number(price);
    setItems(prev => prev.map(it => it.key !== itemKey ? it : ({ ...it, ingredients: it.ingredients.map(ing => ing.ankamaId === ingId ? { ...ing, unitPrice: val } : ing) })));
  };
  const updateSellPrice   = (itemKey, price) => setItems(prev => prev.map(it => it.key !== itemKey ? it : ({ ...it, sellPrice: (price === "" || price == null) ? undefined : Number(price) })));
  const updateCraftCount  = (itemKey, count)  => setItems(prev => prev.map(it => it.key !== itemKey ? it : ({ ...it, craftCount: Math.max(1, Math.floor(Number(count)||1)) })));
  const removeItem        = (itemKey) => setItems(prev => prev.filter(it => it.key !== itemKey));
  const clearAll          = () => setItems([]);

  return (
    <div className={`${colors.bg} ${colors.text} min-h-screen p-4 md:p-6`}>
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 h-9 w-9 rounded-lg grid place-items-center shadow">⚒️</div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Craft ROI</h1>
              <div className="text-slate-400 text-xs">Données : api.dofusdb.fr — pas de backend</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowDebug(v => !v)} className={`px-3 py-2 rounded-xl bg-[#20242a] text-slate-400 border ${colors.border} hover:border-emerald-500`}>Debug</button>
            <button onClick={clearAll} className={`px-3 py-2 rounded-xl bg-[#20242a] text-slate-400 border ${colors.border} hover:border-emerald-500`}>Vider l'accueil</button>
          </div>
        </header>

        {showDebug && (
          <div className={`mb-4 text-xs text-slate-400 rounded-xl ${colors.panel} border ${colors.border} p-3`}>
            <div className="font-semibold mb-1">Debug réseau</div>
            <div className="break-all">
              <div><span className="opacity-70">Dernière URL :</span> {debugUrl || "—"}</div>
              <div><span className="opacity-70">Dernière erreur :</span> {debugErr || "—"}</div>
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className={`mb-4 rounded-2xl border ${colors.border} ${colors.panel} p-3`}>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" className="accent-emerald-500" checked={equipmentOnly} onChange={(e) => setEquipmentOnly(e.target.checked)} />
              Uniquement les équipements
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" className="accent-emerald-500" checked={craftableOnly} onChange={(e) => setCraftableOnly(e.target.checked)} />
              Uniquement les objets craftables
            </label>
            <div className="flex items-center gap-2 text-sm">
              <JobSelect jobs={jobs} value={jobId} onChange={setJobId} />
              <span className="text-slate-400 text-xs">(s’applique si “craftables” est coché)</span>
            </div>
          </div>
        </div>

        <SearchBar
          query={query}
          setQuery={setQuery}
          suggestions={suggestions}
          loading={loadingSuggest}
          onChoose={addItem}
        />

        {/* FIL */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it) => (
            <ItemCard
              key={it.key}
              it={it}
              onRemove={removeItem}
              onUpdateSellPrice={updateSellPrice}
              onUpdateCraftCount={updateCraftCount}
              onUpdateIngredientPrice={updateIngredientPrice}
            />
          ))}
        </div>

        {/* Comparatif */}
        {items.length > 1 && (
          <ComparisonTable items={items} sort={sort} setSort={setSort} onRemove={removeItem} />
        )}

        <footer className="mt-10 text-center text-xs text-slate-400">
          UI inspirée de dofusdb.fr — filtres & tri par clic (Invest/Gain/Coeff).
        </footer>
      </div>
    </div>
  );
}
