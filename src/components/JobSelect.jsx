import React, { useEffect, useRef, useState } from "react";
import { colors, clsx } from "../theme/colors";

/* Fallback SVG si pas d’icône officielle */
function JobIcon({ name, className = "h-4 w-4" }) {
  const n = (name || "").toLowerCase();
  const P = (d) => <path d={d} className="fill-current" />;
  if (n.includes("bijout")) return <svg viewBox="0 0 24 24" className={className}>{P("M12 2l2.5 3.5L12 9 9.5 5.5 12 2zm0 8l6 3-6 9-6-9 6-3z")}</svg>;
  if (n.includes("tailleur")) return <svg viewBox="0 0 24 24" className={className}>{P("M6 4l4 4-4 4-2-2 2-2-2-2 2-2zm12 0l-4 4 4 4 2-2-2-2 2-2-2-2zM10 16h4v4h-4z")}</svg>;
  if (n.includes("forger") || n.includes("forgem")) return <svg viewBox="0 0 24 24" className={className}>{P("M3 14h10l3 3h5v3h-8l-3-3H3v-3zm9-10l5 5-2 2-5-5 2-2z")}</svg>;
  if (n.includes("alchim")) return <svg viewBox="0 0 24 24" className={className}>{P("M8 3h8v2l-2 3v6l4 6H6l4-6V8L8 5V3z")}</svg>;
  return <svg viewBox="0 0 24 24" className={className}><circle cx="12" cy="12" r="3" className="fill-current"/><path d="M12 2v6M12 16v6M2 12h6M16 12h6" className="fill-current"/></svg>;
}
function JobIconImg({ url, name, className = "h-4 w-4" }) {
  const [ok, setOk] = useState(Boolean(url));
  useEffect(() => setOk(Boolean(url)), [url]);
  if (ok) return <img src={url} className={className} alt="" onError={() => setOk(false)} />;
  return <JobIcon name={name} className={className} />;
}

export default function JobSelect({ jobs, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = jobs.find((j) => String(j.id) === String(value));

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
        className={clsx("inline-flex items-center gap-2 rounded-xl px-3 py-2", "bg-black/20 border", colors.border, "hover:border-emerald-500")}
      >
        <span className={colors.subtext}>Métier</span>
        {selected ? (<><JobIconImg url={selected.iconUrl} name={selected.name} className="h-4 w-4 text-emerald-400"/><span>{selected.name}</span></>)
                  : (<span>(Tous)</span>)}
        <span className={`${colors.subtext} text-xs ml-1`}>▾</span>
      </button>
      {open && (
        <div className={clsx("absolute z-10 mt-2 max-h-72 w-64 overflow-auto rounded-xl", colors.panel, "border", colors.border, "shadow-lg p-1")}>
          <button onClick={() => { onChange(""); setOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/20 text-left">
            <JobIconImg name="Tous" className="h-4 w-4 text-slate-300" /><span>(Tous)</span>
          </button>
          {jobs.map(j => (
            <button key={j.id} onClick={() => { onChange(j.id); setOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/20 text-left">
              <JobIconImg url={j.iconUrl} name={j.name} className="h-4 w-4 text-emerald-400" /><span>{j.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
