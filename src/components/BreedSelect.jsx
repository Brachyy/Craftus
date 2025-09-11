import React, { useEffect, useRef, useState } from "react";
import { colors } from "../theme/colors";

export default function BreedSelect({ breeds = [], value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDocDown(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", onDocDown);
    return () => document.removeEventListener("pointerdown", onDocDown);
  }, []);

  const selected = breeds.find((b) => String(b.id) === String(value));

  function choose(id) {
    onChange?.(String(id || ""));
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg ${colors.chip} border ${colors.border} hover:border-emerald-500 text-xs`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        title="Associer une classe (tag visuel)"
      >
        {selected?.iconUrl ? (
          <img src={selected.iconUrl} alt="" className="h-4 w-4 rounded" />
        ) : (
          <span className="h-4 w-4 rounded bg-black/30 inline-block" />
        )}
        <span>{selected ? selected.name : "Classe"}</span>
        <svg width="12" height="12" viewBox="0 0 20 20" className="opacity-70">
          <path d="M5 7l5 6 5-6H5z" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div
          className={`absolute right-0 z-40 mt-2 w-56 max-h-64 overflow-auto rounded-xl ${colors.panel} border ${colors.border} shadow`}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        >
          <button
            className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 flex items-center gap-2"
            onClick={() => choose("")}
          >
            <span className="h-4 w-4 rounded bg-black/30 inline-block" />
            Aucune
          </button>
          <div className="border-t border-white/5 my-1" />
          {breeds.map((b) => (
            <button
              key={b.id}
              className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 flex items-center gap-2"
              onClick={() => choose(b.id)}
            >
              {b.iconUrl ? (
                <img src={b.iconUrl} alt="" className="h-4 w-4 rounded" />
              ) : (
                <span className="h-4 w-4 rounded bg-black/30 inline-block" />
              )}
              {b.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
