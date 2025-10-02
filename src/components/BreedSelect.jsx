import { useState, useRef, useEffect } from "react";

export default function BreedSelect({ breeds, value, onChange, placeholder = "Tous" }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    const onClick = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, [open]);

  const selectedBreed = breeds.find(b => b.id === value);
  const choose = (id) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="px-3 py-1 rounded-lg bg-[#1b1f26] text-slate-300 border border-white/10 text-sm flex items-center gap-2 min-w-[120px]"
      >
        {selectedBreed?.iconUrl ? (
          <img src={selectedBreed.iconUrl} alt="" className="h-4 w-4 rounded" />
        ) : (
          <span className="h-4 w-4 rounded bg-black/30 inline-block" />
        )}
        <span className="flex-1 text-left">
          {selectedBreed?.name?.fr || selectedBreed?.name || placeholder}
        </span>
        <span className="text-slate-400">▼</span>
      </button>

      {open && (
        <div className="absolute z-40 mt-2 w-64 max-h-72 overflow-auto rounded-xl bg-[#0f1319] border border-white/10 shadow-2xl">
          <button
            className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 flex items-center gap-2"
            onClick={() => choose("")}
          >
            <span className="h-4 w-4 rounded bg-black/30 inline-block" />
            Tous les métiers
          </button>
          <div className="border-t border-white/5 my-1" />
          {breeds.map((breed) => (
            <button
              key={breed.id}
              className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 flex items-center gap-2"
              onClick={() => choose(breed.id)}
            >
              {breed.iconUrl ? (
                <img src={breed.iconUrl} alt="" className="h-4 w-4 rounded" />
              ) : (
                <span className="h-4 w-4 rounded bg-black/30 inline-block" />
              )}
              {breed.name?.fr || breed.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}