import React from "react";

export default function NumberInput({
  value,
  onChange,
  min = 0,
  step = 1,
  className = "",
  disabled = false,
  title = "",
  placeholder = "",
  showButtons = false, // << NEW
}) {
  const v = value === null || value === undefined ? "" : value;

  function handleChange(e) {
    const raw = e.target.value;
    if (raw === "") return onChange?.("");
    const n = Number(raw);
    if (Number.isNaN(n)) return;
    if (min !== undefined && n < min) return onChange?.(min);
    onChange?.(n);
  }

  function bump(delta) {
    if (disabled) return;
    let n = Number(v || 0) + delta;
    if (!Number.isFinite(n)) n = 0;
    if (min !== undefined && n < min) n = min;
    onChange?.(n);
  }

  return (
    <div className={`flex items-center gap-1 ${className}`} title={title}>
      <input
        type="number"
        inputMode="numeric"
        className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
        value={v}
        min={min}
        step={step}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
      />
      {showButtons && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => bump(-step)}
            disabled={disabled}
            className="h-8 w-8 rounded-lg bg-black/40 border border-white/10 text-slate-300 hover:bg-black/30"
          >
            –
          </button>
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => bump(step)}
            disabled={disabled}
            className="h-8 w-8 rounded-lg bg-black/40 border border-white/10 text-slate-300 hover:bg-black/30"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
