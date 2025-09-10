// src/components/LogoPicker.jsx
import React, { useEffect, useMemo, useState } from "react";
import { colors } from "../theme/colors";

function FallbackIcon({ className = "h-6 w-6 text-slate-300" }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="4" className="fill-current" />
    </svg>
  );
}

function IconCell({ url, label, selected, onClick }) {
  const [ok, setOk] = useState(Boolean(url));
  useEffect(() => setOk(Boolean(url)), [url]);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 w-full text-left px-2 py-1 rounded-lg hover:bg-black/20 ${selected ? "outline outline-2 outline-emerald-500/60" : ""}`}
      title={label}
    >
      {ok ? (
        <img src={url} alt="" className="h-6 w-6 rounded" onError={() => setOk(false)} />
      ) : (
        <FallbackIcon />
      )}
      <span className="text-sm">{label}</span>
    </button>
  );
}

export default function LogoPicker({
  jobs = [],
  itemTypesMap = {},
  breeds = [],
  value,              // { kind: 'job'|'type'|'breed', id, name, url } | null
  onChange,
}) {
  const [tab, setTab] = useState(value?.kind || "job");

  useEffect(() => {
    if (value?.kind) setTab(value.kind);
  }, [value?.kind]);

  const typesArr = useMemo(() => Object.values(itemTypesMap || {}), [itemTypesMap]);

  function pick(val) {
    onChange?.(val || null);
  }

  return (
    <div className={`rounded-xl ${colors.panel} border ${colors.border} p-3`}>
      <div className="flex items-center gap-2 mb-3">
        <button onClick={() => setTab("job")}   className={`px-2 py-1 rounded-lg text-sm ${tab==="job"   ? "bg-emerald-600 text-white" : "bg-white/10"}`}>Métier</button>
        <button onClick={() => setTab("type")}  className={`px-2 py-1 rounded-lg text-sm ${tab==="type"  ? "bg-emerald-600 text-white" : "bg-white/10"}`}>Type d’objet</button>
        <button onClick={() => setTab("breed")} className={`px-2 py-1 rounded-lg text-sm ${tab==="breed" ? "bg-emerald-600 text-white" : "bg-white/10"}`}>Classe</button>
        <div className="flex-1" />
        <button onClick={() => pick(null)} className="px-2 py-1 rounded-lg text-sm bg-white/10">Aucun logo</button>
      </div>

      <div className="max-h-60 overflow-auto rounded-lg border border-white/5 p-1">
        {tab === "job" && (
          <div className="grid grid-cols-1 gap-1">
            {jobs.map((j) => (
              <IconCell
                key={j.id}
                url={j.iconUrl}
                label={j.name}
                selected={value?.kind==="job" && String(value?.id)===String(j.id)}
                onClick={() => pick({ kind: "job", id: j.id, name: j.name, url: j.iconUrl })}
              />
            ))}
          </div>
        )}
        {tab === "type" && (
          <div className="grid grid-cols-1 gap-1">
            {typesArr.map((t) => (
              <IconCell
                key={t.id}
                url={t.iconUrl}
                label={t.name}
                selected={value?.kind==="type" && String(value?.id)===String(t.id)}
                onClick={() => pick({ kind: "type", id: t.id, name: t.name, url: t.iconUrl })}
              />
            ))}
          </div>
        )}
        {tab === "breed" && (
          <div className="grid grid-cols-1 gap-1">
            {breeds.map((b) => (
              <IconCell
                key={b.id}
                url={b.iconUrl}
                label={b.name}
                selected={value?.kind==="breed" && String(value?.id)===String(b.id)}
                onClick={() => pick({ kind: "breed", id: b.id, name: b.name, url: b.iconUrl })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
