"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PrivacyProvider, usePrivacy } from "./privacy";
import { TransactionSheet } from "./transaction-sheet";
import { MemberSwitcher } from "./member-switcher";
import { logout } from "@/app/actions-auth";
import type { Category, Member, Wallet } from "@/lib/queries";

const NAV = [
  { href: "/", label: "Ringkasan" },
  { href: "/transaksi", label: "Transaksi" },
  { href: "/hutang", label: "Hutang" },
  { href: "/tabungan", label: "Tabungan" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/rutin", label: "Rutin" },
  { href: "/dompet", label: "Dompet" },
  { href: "/pengaturan", label: "Pengaturan" },
];
const MOBILE_NAV = [
  { href: "/", label: "Ringkasan" },
  { href: "/transaksi", label: "Transaksi" },
  { href: "/hutang", label: "Hutang" },
  { href: "/tabungan", label: "Tabungan" },
  { href: "/lainnya", label: "Lainnya" },
];
const OTHER = ["/wishlist", "/rutin", "/dompet", "/pengaturan", "/lainnya"];

function Inner({ wallets, categories, pendingCount, members, memberId, children }: { wallets: Wallet[]; categories: Category[]; pendingCount: number; members: Member[]; memberId: number | null; children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const { hidden, toggle } = usePrivacy();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) return;
      if (e.key === "n" || e.key === "N") { e.preventDefault(); setOpen(true); }
      if (e.key === "/") { const s = document.getElementById("search"); if (s) { e.preventDefault(); s.focus(); } }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (path.startsWith("/login")) return <>{children}</>;

  const active = (h: string) => (h === "/" ? path === "/" : h === "/lainnya" ? OTHER.some((o) => path.startsWith(o)) : path.startsWith(h));

  return (
    <div className="min-h-dvh md:flex">
      <aside className="hidden md:flex md:w-60 shrink-0 flex-col border-r border-line p-5 sticky top-0 h-dvh">
        <div className="font-bold text-xl tracking-tight mb-8">Uang<span className="text-brand">Ku</span></div>
        <nav className="space-y-1 flex-1">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${active(n.href) ? "bg-brand-soft text-brand" : "text-muted hover:text-ink"}`}>
              {n.label}
              {n.href === "/rutin" && pendingCount > 0 && <span className="text-xs bg-warn-soft text-warn rounded-full px-2 py-0.5 font-semibold">{pendingCount}</span>}
            </Link>
          ))}
        </nav>
        <div className="mb-3"><MemberSwitcher members={members} memberId={memberId} /></div>
        <button onClick={() => setOpen(true)} className="btn btn-primary w-full">+ Catat <kbd className="text-xs opacity-70">N</kbd></button>
        <button onClick={toggle} className="btn w-full mt-2">{hidden ? "Tampilkan saldo" : "Sembunyikan saldo"}</button>
        <form action={logout}><button className="w-full text-xs text-muted hover:text-ink mt-3">Keluar</button></form>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-line sticky top-0 bg-bg/90 backdrop-blur z-30">
          <div className="font-bold text-lg">Uang<span className="text-brand">Ku</span></div>
          <div className="flex items-center gap-3">
            {members.length > 0 && <div className="w-28"><MemberSwitcher members={members} memberId={memberId} /></div>}
            <button onClick={toggle} className="text-sm text-muted font-medium">{hidden ? "Tampilkan" : "Sembunyikan"}</button>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 md:px-8 py-5 md:py-8 pb-28 md:pb-10">{children}</main>
      </div>

      <button onClick={() => setOpen(true)} aria-label="Catat transaksi"
        className="md:hidden fixed right-4 bottom-20 z-40 h-14 w-14 rounded-full bg-brand text-white text-3xl shadow-lg leading-none pb-1">+</button>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 grid grid-cols-5 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]">
        {MOBILE_NAV.map((n) => (
          <Link key={n.href} href={n.href}
            className={`relative py-3 text-center text-[11px] font-semibold ${active(n.href) ? "text-brand" : "text-muted"}`}>
            {n.label}
            {n.href === "/lainnya" && pendingCount > 0 && <span className="absolute top-1.5 right-4 h-2 w-2 rounded-full bg-warn" />}
          </Link>
        ))}
      </nav>

      {open && <TransactionSheet wallets={wallets} categories={categories} onClose={() => setOpen(false)} />}
    </div>
  );
}

export function Shell(props: { wallets: Wallet[]; categories: Category[]; pendingCount: number; members: Member[]; memberId: number | null; children: React.ReactNode }) {
  return <PrivacyProvider><Inner {...props} /></PrivacyProvider>;
}



