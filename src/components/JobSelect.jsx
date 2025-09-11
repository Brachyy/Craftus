import React, { useEffect, useRef, useState } from "react";
import { colors } from "../theme/colors";

export default function JobSelect({ jobs = [], value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Fermer au clic extérieur
  useEffect(() => {
    function onDocDown(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", onDocDown);
    return () => document.removeEventListener("pointerdown", onDocDown);
  }, []);

  function choose(id) {
    onChange?.(String(id || ""));
    setOpen(false);
  }

  const selected = jobs.find((j) => String(j.id) === String(value));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl ${colors.chip} border ${colors.border} hover:border-emerald-500`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      >
        {selected?.iconUrl ? (
          <img src={selected.iconUrl} alt="" className="h-4 w-4 rounded" />
        ) : (
          <span className="h-4 w-4 rounded bg-black/30 inline-block" />
        )}
        <span className="text-sm">{selected ? selected.name : "Métier (optionnel)"}</span>
        <svg width="14" height="14" viewBox="0 0 20 20" className="opacity-70">
          <path d="M5 7l5 6 5-6H5z" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div
          className={`absolute z-40 mt-2 w-64 max-h-72 overflow-auto rounded-xl ${colors.panel} border ${colors.border} shadow`}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        >
          <button
            className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 flex items-center gap-2"
            onClick={() => choose("")}
          >
            <span className="h-4 w-4 rounded bg-black/30 inline-block" />
            Tous les métiers
          </button>
          <div className="border-t border-white/5 my-1" />
          {jobs.map((j) => (
            <button
              key={j.id}
              className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 flex items-center gap-2"
              onClick={() => choose(j.id)}
            >
              {j.iconUrl ? (
                <img src={j.iconUrl} alt="" className="h-4 w-4 rounded" />
              ) : (
                <span className="h-4 w-4 rounded bg-black/30 inline-block" />
              )}
              {j.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
