import React from "react";
import { clsx } from "../theme/colors";
import { colors } from "../theme/colors";

export default function NumberInput({ value, onChange, min = 0, step = 1, className = "", placeholder }) {
  const v = value ?? "";
  const inc = () => onChange?.(String((Number(v) || 0) + step));
  const dec = () => onChange?.(String(Math.max(min, (Number(v) || 0) - step)));
  return (
    <div className={clsx("relative", className)}>
      <input
        value={v}
        inputMode="numeric"
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={clsx(
          "w-full rounded-xl bg-black/20 border",
          colors.border,
          "px-3 py-2 pr-12 text-right focus:outline-none",
          "[appearance:textfield]",
          "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        )}
      />
      <div className="absolute right-1 top-1 bottom-1 grid grid-rows-2 gap-0.5">
        <button type="button" onClick={inc} className="h-4 w-7 rounded-md bg-white/10 hover:bg-white/15 text-[10px] leading-none">▲</button>
        <button type="button" onClick={dec} className="h-4 w-7 rounded-md bg-white/10 hover:bg-white/15 text-[10px] leading-none">▼</button>
      </div>
    </div>
  );
}
