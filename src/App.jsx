import React, { useEffect, useMemo, useRef, useState } from "react";
import { colors } from "./theme/colors";
import SearchBar from "./components/SearchBar";
import JobSelect from "./components/JobSelect";
import ItemCard from "./components/ItemCard";
import ComparisonTable from "./components/ComparisonTable";
import ShoppingList from "./components/ShoppingList";

import {
  itemAnkamaId,
  itemImage,
  itemLevel,
  itemName,
  isEquipment,
} from "./lib/utils";

import {
  apiGET,
  searchItems, // <-- on revient à ça pour la recherche
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

// Ton logo
import craftusLogo from "./assets/craftus.png";

/* =========================
   Helpers
========================= */

// Nettoyage basique avant sauvegarde Firestore
function sanitizeForFirestore(value) {
  if (Array.isArray(value)) return value.map(sanitizeForFirestore);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (v === undefined) continue;
      const sv = sanitizeForFirestore(v);
      if (sv === undefined) continue;
      out[k] = sv;
    }
    return out;
  }
  if (typeof value === "number" && Number.isNaN(value)) return null;
  return value;
}

// Métier requis & niveau à partir d'une recette
async function fetchRecipeJobMeta(resultItemId, setDebugUrl, setDebugErr) {
  try {
    const data = await apiGET(`/recipes?resultId=${encodeURIComponent(resultItemId)}&$limit=1`, setDebugUrl, setDebugErr);
    const arr = Array.isArray(data) ? data : data?.data ?? [];
    const r = arr[0];
    if (!r) return null;

    let jobId = r?.jobId ?? r?.job?.id ?? null;
    if (!jobId) {
      const skillId = r?.skillId ?? r?.skill?.id ?? r?.skill ?? null;
      // Petit fallback: /skills/:id pour retrouver jobId si besoin
      if (skillId) {
        try {
          const sk = await apiGET(`/skills/${encodeURIComponent(skillId)}`, setDebugUrl, setDebugErr);
          jobId = sk?.jobId ?? sk?.job?.id ?? null;
        } catch {/* ignore */}
      }
    }
    const levelRequired = r?.levelRequired ?? r?.level ?? r?.minLevel ?? null;
    if (!jobId && !levelRequired) return null;
    return { jobId: jobId ? String(jobId) : null, levelRequired: levelRequired ?? null };
  } catch (e) {
    setDebugErr(String(e?.message || e));
    return null;
  }
}

/* =========================
   Composant principal
========================= */

export default function App() {
  // Recherche
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggest, setLoadingSuggest] = useState(false);

  // Fil d’objets
  const [items, setItems] = useState([]);

  // Filtres (on garde le filtre “équipement”, la recherche est par défaut craftable-only)
  const [equipmentOnly, setEquipmentOnly] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState("");

  // Debug
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

  // Prix globaux (Shopping List — partagés entre items)
  const [globalPrices, setGlobalPrices] = useState({}); // { [ingId]: { unitPrice } }

  // Charger types + classes (comme avant)
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

  // Charger métiers (icônes + noms)
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
            return { id: String(id), name, iconUrl };
          })
          .filter(Boolean);
        setJobs(norm);
      } catch {/* ignore */}
    })();
  }, []);

  /* -------- Recherche live via l’API (comme avant) -------- */
  const debounceRef = useRef(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // on force craftableOnly = true par défaut (ton souhait)
    const craftableOnly = true;

    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggest(true);
    const filters = {
      equipmentOnly,
      craftableOnly,
      jobId: jobId || null,
      jobName: null,
    };

    debounceRef.current = setTimeout(async () => {
      try {
        const arr = await searchItems({
          query: query.trim(),
          filters,
          setDebugUrl,
          setDebugErr,
        });
        setSuggestions(arr || []);
      } catch (e) {
        setDebugErr(String(e?.message || e));
        setSuggestions([]);
      } finally {
        setLoadingSuggest(false);
      }
    }, 250); // fluide
  }, [query, equipmentOnly, jobId]);

  /* -------- Ajout d’un item (comme avant, + job meta) -------- */
  async function addItem(raw) {
    const id = itemAnkamaId(raw);
    if (!id) return alert("ID Ankama introuvable pour cet objet.");

    // Recette (ingrédients)
    const entries = await fetchRecipeEntriesForItem(id, setDebugUrl, setDebugErr);
    if (!entries.length) return alert("Recette introuvable (objet non craftable ?).");

    const ids = [...new Set(entries.map((e) => e.itemId))];
    const map = ids.length ? await fetchItemsByIds(ids, setDebugUrl, setDebugErr) : {};

    const ingredients = entries.map((e) => {
      const rit = map[e.itemId];
      const gp = globalPrices[e.itemId];
      return {
        ankamaId: e.itemId,
        name: itemName(rit) || `#${e.itemId}`,
        img: itemImage(rit),
        qty: e.quantity,
        unitPrice: gp?.unitPrice ?? undefined,
      };
    });

    // Métier requis (on le récupère via la recette du résultat)
    let job = null;
    const meta = await fetchRecipeJobMeta(id, setDebugUrl, setDebugErr);
    if (meta?.jobId) {
      const jj = jobs.find((j) => String(j.id) === String(meta.jobId));
      job = {
        id: String(meta.jobId),
        name: jj?.name || "Métier",
        iconUrl: jj?.iconUrl || null,
        levelRequired: meta.levelRequired ?? null,
      };
    } else if (meta?.levelRequired != null) {
      job = { id: null, name: "Métier", iconUrl: null, levelRequired: meta.levelRequired };
    }

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
        job, // affiché sous le nom de l’item
      },
    ]);
    setQuery("");
    setSuggestions([]);
  }

  /* -------- Mises à jour locales -------- */
  const updateIngredientPrice = (itemKey, ingId, price) => {
    const val = price === "" || price == null ? undefined : Number(price);

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

    // garder la Shopping List source de vérité
    setGlobalPrices((prev) => {
      const next = { ...prev };
      if (val === undefined) delete next[ingId];
      else next[ingId] = { unitPrice: val };
      return next;
    });
  };

  const updateSellPrice = (itemKey, price) =>
    setItems((prev) =>
      prev.map((it) =>
        it.key !== itemKey
          ? it
          : { ...it, sellPrice: price === "" || price == null ? undefined : Number(price) }
      )
    );

  const updateCraftCount = (itemKey, count) =>
    setItems((prev) =>
      prev.map((it) =>
        it.key !== itemKey ? it : { ...it, craftCount: Math.max(1, Math.floor(Number(count) || 1)) }
      )
    );

  const removeItem = (itemKey) => setItems((prev) => prev.filter((it) => it.key !== itemKey));

  const clearAll = () => {
    setItems([]);
    setCurrentSessionId(null);
    setSessionIconUrl(null);
    setSessionName(null);
    setGlobalPrices({});
  };

  // Propage prix globaux → items (sync Shopping List → cartes)
  useEffect(() => {
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        ingredients: it.ingredients.map((ing) => {
          const gp = globalPrices[ing.ankamaId];
          if (gp?.unitPrice != null) return { ...ing, unitPrice: gp.unitPrice };
          return ing;
        }),
      }))
    );
  }, [globalPrices]);

  // Shopping rows
  const shoppingRows = useMemo(() => {
    const mapAgg = new Map();
    for (const it of items) {
      const mult = Math.max(1, Number(it.craftCount) || 1);
      for (const ing of it.ingredients) {
        const key = String(ing.ankamaId);
        const prev = mapAgg.get(key) || {
          ankamaId: ing.ankamaId,
          name: ing.name,
          img: ing.img,
          totalQty: 0,
          unitPrice: undefined,
        };
        prev.totalQty += (Number(ing.qty) || 0) * mult;
        const gp = globalPrices[ing.ankamaId];
        prev.unitPrice = gp?.unitPrice != null ? gp.unitPrice : prev.unitPrice;
        if (!prev.name && ing.name) prev.name = ing.name;
        if (!prev.img && ing.img) prev.img = ing.img;
        mapAgg.set(key, prev);
      }
    }
    return Array.from(mapAgg.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [items, globalPrices]);

  // Snapshot / restore
  function buildSnapshot() {
    const raw = {
      version: 10,
      when: new Date().toISOString(),
      filters: { equipmentOnly, jobId },
      sort,
      items,
      globalPrices,
    };
    return sanitizeForFirestore(raw);
  }
  function restoreFromSnapshot(snap) {
    setItems(Array.isArray(snap.items) ? snap.items : []);
    setSort(snap.sort || { key: "gain", dir: "desc" });
    setJobId(snap.filters?.jobId || "");
    setEquipmentOnly(!!snap.filters?.equipmentOnly);
    setGlobalPrices(snap.globalPrices || {});
  }

  // Logo suggéré pour la session
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
        {/* Header */}
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

        {/* Actions */}
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
              <span className="text-slate-400 text-xs">(filtre métier appliqué à la recherche)</span>
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
          placeholder="Rechercher un objet craftable… (ex: gelano, enragé mineur, kwache)"
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
              globalPrices={globalPrices}
            />
          ))}
        </div>

        {/* Shopping List */}
        {items.length > 0 && (
          <div className="mt-4">
            <ShoppingList
              rows={shoppingRows}
              onSetPrice={(ingId, price) => {
                const val = price === "" || price == null ? undefined : Number(price);
                setGlobalPrices((prev) => {
                  const next = { ...prev };
                  if (val === undefined) delete next[ingId];
                  else next[ingId] = { unitPrice: val };
                  return next;
                });
              }}
            />
          </div>
        )}

        {/* Comparatif */}
        {items.length > 1 && (
          <ComparisonTable items={items} sort={sort} setSort={setSort} onRemove={(k) => removeItem(k)} />
        )}

        {/* Debug réseau */}
        {showDebug && (
          <div className={`mt-4 text-xs text-slate-400 rounded-xl ${colors.panel} border ${colors.border} p-3`}>
            <div className="font-semibold mb-1">Debug réseau</div>
            <div className="break-all">
              <div><span className="opacity-70">Dernière URL :</span> {debugUrl || "—"}</div>
              <div><span className="opacity-70">Dernière erreur :</span> {debugErr || "—"}</div>
            </div>
          </div>
        )}
      </div>

      {/* Modales sessions */}
      <SaveDialog
        open={openSave}
        onClose={() => setOpenSave(false)}
        user={user}
        currentSessionId={currentSessionId}
        buildSnapshot={() => {
          const raw = {
            version: 10,
            when: new Date().toISOString(),
            filters: { equipmentOnly, jobId },
            sort,
            items,
            globalPrices,
          };
          return sanitizeForFirestore(raw);
        }}
        onSaved={(id, name, icon) => {
          setCurrentSessionId(id);
          if (name) setSessionName(name);
          if (icon?.url) setSessionIconUrl(icon.url);
        }}
        jobs={jobs}
        itemTypesMap={itemTypesMap}
        breeds={breeds}
        suggestedLogo={(() => {
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
        })()}
      />
      <LoadDialog
        open={openLoad}
        onClose={() => setOpenLoad(false)}
        user={user}
        onLoaded={({ id, name, data, icon }) => {
          setCurrentSessionId(id);
          setSessionName(name || null);
          setSessionIconUrl(icon?.url || null);
          setItems(Array.isArray(data.items) ? data.items : []);
          setSort(data.sort || { key: "gain", dir: "desc" });
          setJobId(data.filters?.jobId || "");
          setEquipmentOnly(!!data.filters?.equipmentOnly);
          setGlobalPrices(data.globalPrices || {});
        }}
      />
    </div>
  );
}
