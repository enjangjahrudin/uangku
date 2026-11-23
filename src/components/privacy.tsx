"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { rupiah } from "@/lib/format";

const Ctx = createContext<{ hidden: boolean; toggle: () => void }>({ hidden: false, toggle: () => {} });

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => setHidden(localStorage.getItem("uangku-hide") === "1"), []);
  const toggle = () => setHidden((h) => { localStorage.setItem("uangku-hide", h ? "0" : "1"); return !h; });
  return <Ctx.Provider value={{ hidden, toggle }}>{children}</Ctx.Provider>;
}

export const usePrivacy = () => useContext(Ctx);

export function Money({ value, sign, className = "" }: { value: number; sign?: boolean; className?: string }) {
  const { hidden } = usePrivacy();
  const text = hidden ? "Rp•••••" : (sign && value > 0 ? "+" : "") + rupiah(value);
  return <span className={`num ${className}`}>{text}</span>;
}
