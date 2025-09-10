import React, { useEffect, useRef, useState } from "react";
import { colors } from "./theme/colors";
import SearchBar from "./components/SearchBar";
import JobSelect from "./components/JobSelect";
import ItemCard from "./components/ItemCard";
import ComparisonTable from "./components/ComparisonTable";
import { itemAnkamaId, itemImage, itemLevel, itemName } from "./lib/utils";
import { apiGET, searchItems, fetchRecipeEntriesForItem, fetchItemsByIds } from "./lib/api";

// Firebase (auth + sessions)
import { auth, onAuthStateChanged } from "./lib/firebase";
import AuthBar from "./auth/AuthBar";
import SaveDialog from "./sessions/SaveDialog";
import LoadDialog from "./sessions/LoadDialog";

// Métadonnées (types & classes)
import { loadItemTypes, loadBreeds, extractItemTypeMeta } from "./lib/meta";

// Ton logo
import craftusLogo from "./assets/craftus.png";

export default function App() {
  // Recherche
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggest, setLoadingSuggest] = useState(false);

  // Fil d’objets
  const [items, setItems] = useState([]);

  // Filtres
  const [equipmentOnly, setEquipmentOnly] = useState(false);
  const [craftableOnly, setCraftableOnly] = useState(false);
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
      } catch {/* ignore */}
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
    const filters = { equipmentOnly, craftableOnly, jobId: jobId || null, jobName: null };
    debounceRef.current = setTimeout(async () => {
      const arr = await searchItems({ query: query.trim(), filters, setDebugUrl, setDebugErr });
      setSuggestions(arr);
      setLoadingSuggest(false);
    }, 350);
  }, [query, equipmentOnly, craftableOnly, jobId]);

  // Ajouter un item depuis une suggestion
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

    setItems((prev) => [
      ...prev,
      {
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
      },
    ]);
    setQuery("");
    setSuggestions([]);
  }

  // Mises à jour
  const updateIngredientPrice = (itemKey, ingId, price) => {
    const val = price === "" || price == null ? undefined : Number(price);
    setItems((prev) =>
      prev.map((it) =>
        it.key !== itemKey
          ? it
          : { ...it, ingredients: it.ingredients.map((ing) => (ing.ankamaId === ingId ? { ...ing, unitPrice: val } : ing)) }
      )
    );
  };
  const updateSellPrice = (itemKey, price) =>
    setItems((prev) =>
      prev.map((it) => (it.key !== itemKey ? it : { ...it, sellPrice: price === "" || price == null ? undefined : Number(price) }))
    );
  const updateCraftCount = (itemKey, count) =>
    setItems((prev) =>
      prev.map((it) => (it.key !== itemKey ? it : { ...it, craftCount: Math.max(1, Math.floor(Number(count) || 1)) }))
    );
  const removeItem = (itemKey) => setItems((prev) => prev.filter((it) => it.key !== itemKey));
  const clearAll = () => {
    setItems([]);
    setCurrentSessionId(null);
    setSessionIconUrl(null);
    setSessionName(null);
  };

  // Associer une classe (tag visuel enregistré en session)
  const setItemClass = (itemKey, classId) => {
    setItems((prev) =>
      prev.map((it) => (it.key === itemKey ? { ...it, tags: { ...(it.tags || {}), classId: String(classId || "") } } : it))
    );
  };

  // Snapshot / restore
  function buildSnapshot() {
    return {
      version: 2,
      when: new Date().toISOString(),
      filters: { equipmentOnly, craftableOnly, jobId },
      sort,
      items,
    };
  }
  function restoreFromSnapshot(snap) {
    const its = Array.isArray(snap.items) ? snap.items : [];
    its.forEach((i) => {
      i.tags = i.tags || {};
      if (i.tags.classId == null) i.tags.classId = "";
    });
    setItems(its);
    setSort(snap.sort || { key: "gain", dir: "desc" });
    setJobId(snap.filters?.jobId || "");
    setEquipmentOnly(!!snap.filters?.equipmentOnly);
    setCraftableOnly(!!snap.filters?.craftableOnly);
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
        {/* Header avec logo seul */}
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
        </div>

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
              onRemove={removeItem}
              onUpdateSellPrice={updateSellPrice}
              onUpdateCraftCount={updateCraftCount}
              onUpdateIngredientPrice={updateIngredientPrice}
              itemTypesMap={itemTypesMap}
              breeds={breeds}
              onSetItemClass={setItemClass}
            />
          ))}
        </div>

        {/* Comparatif */}
        {items.length > 1 && (
          <ComparisonTable
            items={items}
            sort={sort}
            setSort={setSort}
            onRemove={(k) => removeItem(k)}
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
