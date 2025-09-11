import { isEquipment, itemAnkamaId } from "./utils";
import { normalizeRecipe } from "./normalize";

export const API_BASE_DEFAULT = "https://api.dofusdb.fr";

export async function apiGET(path, setDebugUrl, setDebugErr) {
  const url = `${API_BASE_DEFAULT}${path}`;
  setDebugUrl?.(url);
  setDebugErr?.("");
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    const msg = `${res.status} ${res.statusText} :: ${url} :: ${t.slice(0, 200)}`;
    setDebugErr?.(msg);
    throw new Error(msg);
  }
  return res.json();
}

export async function fetchRecipeMetaForItem(resultItemId, setDebugUrl, setDebugErr) {
  const q = `/recipes?$limit=1&resultItemId=${encodeURIComponent(resultItemId)}`;
  const data = await apiGET(q, setDebugUrl, setDebugErr);
  const arr = Array.isArray(data) ? data : data?.data ?? [];
  const r = arr[0];
  if (!r) return null;

  const jobId =
    r.professionId ?? r.jobId ?? r.skill?.jobId ?? r.skill?.professionId ?? r?.skillId ?? null;
  const levelRequired =
    r.jobLevel ?? r.level ?? r.requiredJobLevel ?? r.skillLevel ?? null;

  return {
    jobId: jobId != null ? String(jobId) : null,
    levelRequired: levelRequired != null ? Number(levelRequired) : null,
  };
}


export async function tryFetchRecipesForItem(ankamaId, setDebugUrl, setDebugErr) {
  const variants = [
    `?resultId=${ankamaId}`,
    `?result_id=${ankamaId}`,
    `?result[$eq]=${ankamaId}`,
    `?itemId=${ankamaId}`,
  ];
  for (const v of variants) {
    try {
      const data = await apiGET(`/recipes${v}`, setDebugUrl, setDebugErr);
      const arr = Array.isArray(data) ? data : data?.data ?? [];
      if (arr.length) return arr;
    } catch { /* next */ }
  }
  return [];
}

export async function fetchRecipeEntriesForItem(ankamaId, setDebugUrl, setDebugErr) {
  const recs = await tryFetchRecipesForItem(ankamaId, setDebugUrl, setDebugErr);
  if (!recs.length) return [];
  return normalizeRecipe(recs[0]);
}

export async function fetchItemsByIds(ids, setDebugUrl, setDebugErr) {
  if (!ids.length) return {};
  const queries = [
    `/items?id[$in][]=${ids.join("&id[$in][]=")}`,
    `/items?ankamaId[$in][]=${ids.join("&ankamaId[$in][]=")}`,
    `/items?ankama_id[$in][]=${ids.join("&ankama_id[$in][]=")}`,
    `/objects?id[$in][]=${ids.join("&id[$in][]=")}`,
    `/objects?ankamaId[$in][]=${ids.join("&ankamaId[$in][]=")}`,
  ];
  for (const path of queries) {
    try {
      const data = await apiGET(path, setDebugUrl, setDebugErr);
      const arr = Array.isArray(data) ? data : data?.data ?? [];
      if (arr.length) {
        const map = {};
        for (const it of arr) {
          const id = itemAnkamaId(it);
          if (id) map[id] = it;
        }
        return map;
      }
    } catch { /* try next */ }
  }
  return {};
}

export async function searchItems({ query, filters, setDebugUrl, setDebugErr }) {
  if (!query || query.trim().length < 2) return [];
  const q = encodeURIComponent(query.trim());
  const services = ["items", "objects"];
  const build = (svc) => [
    `/${svc}?$limit=20&$search=${q}`,
    `/${svc}?$limit=20&name[$regex]=${q}&name[$options]=i`,
    `/${svc}?$limit=20&name.fr[$regex]=${q}&name.fr[$options]=i`,
    `/${svc}?$limit=20&$search=${q}&language=fr`,
    `/${svc}?$limit=20&name[$regex]=${q}&name[$options]=i&language=fr`,
  ];

  let base = [];
  for (const svc of services) {
    for (const path of build(svc)) {
      try {
        const data = await apiGET(path, setDebugUrl, setDebugErr);
        const arr = Array.isArray(data) ? data : data?.data ?? [];
        if (arr.length) { base = arr; break; }
      } catch { /* try next */ }
    }
    if (base.length) break;
  }
  if (!base.length) return [];

  if (filters.equipmentOnly) base = base.filter(isEquipment);

  if (filters.craftableOnly || (filters.jobId || filters.jobName)) {
    const limited = base.slice(0, 20);
    const results = await Promise.allSettled(limited.map(async (it) => {
      const id = itemAnkamaId(it);
      const recs = await tryFetchRecipesForItem(id, setDebugUrl, setDebugErr);
      const jobName = recs[0]?.jobName || recs[0]?.job?.name?.fr || recs[0]?.job?.name || undefined;
      const jobId = recs[0]?.jobId ?? recs[0]?.job?.id;
      return { it, has: recs.length > 0, jobName, jobId };
    }));
    base = results
      .filter(r => r.status === "fulfilled")
      .map(r => r.value)
      .filter(meta => meta && (!filters.craftableOnly || meta.has))
      .filter(meta => {
        if (!filters.jobId && !filters.jobName) return true;
        const J = `${meta.jobName || ""}`.toLowerCase();
        return (filters.jobId && String(meta.jobId) === String(filters.jobId)) ||
               (filters.jobName && J.includes(filters.jobName.toLowerCase()));
      })
      .map(meta => meta.it);
  }

  return base.slice(0, 20);
}
