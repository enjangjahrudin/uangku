"use client";

import { useState } from "react";

export function AmountInput({ name = "amount", defaultValue = 0, autoFocus = false }: { name?: string; defaultValue?: number; autoFocus?: boolean }) {
  const [v, setV] = useState(defaultValue ? String(defaultValue) : "");
  const shown = v ? Number(v).toLocaleString("id-ID") : "";
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-semibold">Rp</span>
      <input
        inputMode="numeric" autoFocus={autoFocus} required placeholder="0"
        className="input num pl-10 font-semibold"
        value={shown}
        onChange={(e) => setV(e.target.value.replace(/\D/g, "").slice(0, 13))}
      />
      <input type="hidden" name={name} value={v} />
    </div>
  );
}
