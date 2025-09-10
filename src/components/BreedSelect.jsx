// src/components/BreedSelect.jsx
import React, { useEffect, useRef, useState } from "react";
import { colors, clsx } from "../theme/colors";

function BreedIcon({ url, name, className="h-4 w-4" }) {
  const [ok, setOk] = useState(Boolean(url));
  useEffect(() => setOk(Boolean(url)), [url]);
  if (ok) return <img src={url} alt="" className={className} onError={() => setOk(false)} />;
  // fallback SVG
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="8" r="3" className="fill-current" />
      <path d="M5 21c0-4 3-7 7-7s7 3 7 7" className="fill-current" />
    </svg>
  );
}

export default function BreedSelect({ breeds, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = breeds.find((b) => String(b.id) === String(value));

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onEsc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onEsc); };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={clsx("inline-flex items-center gap-2 rounded-lg px-2 py-1", "bg-black/20 border", colors.border, "hover:border-emerald-500 text-xs")}
        title="Associer une classe Dofus"
      >
        <span className="text-slate-300">Classe</span>
        {selected ? (<><BreedIcon url={selected.iconUrl} name={selected.name} /><span>{selected.name}</span></>)
                  : (<span className="text-slate-400">(aucune)</span>)}
        <span className="text-slate-400 text-[10px] ml-1">▾</span>
      </button>
      {open && (
        <div className={clsx("absolute z-10 mt-2 max-h-72 w-60 overflow-auto rounded-xl", colors.panel, "border", colors.border, "shadow-lg p-1")}>
          <button
            onClick={() => { onChange(""); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/20 text-left text-sm"
          >
            <BreedIcon name="Aucune" className="h-4 w-4 text-slate-300" />
            <span>(Aucune)</span>
          </button>
          {breeds.map((b) => (
            <button
              key={b.id}
              onClick={() => { onChange(b.id); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/20 text-left text-sm"
            >
              <BreedIcon url={b.iconUrl} name={b.name} />
              <span>{b.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
