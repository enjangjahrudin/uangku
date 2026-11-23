"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PrivacyProvider, usePrivacy } from "./privacy";
import { TransactionSheet } from "./transaction-sheet";
import { MemberSwitcher } from "./member-switcher";
import { logout } from "@/app/actions-auth";
import type { Category, Member, Wallet } from "@/lib/queries";

const DESKTOP_NAV = [
  { href: "/", label: "Ringkasan" },
  { href: "/transaksi", label: "Transaksi" },
  { href: "/hutang", label: "Hutang" },
  { href: "/tabungan", label: "Tabungan" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/rutin", label: "Rutin" },
  { href: "/dompet", label: "Dompet" },
  { href: "/pengaturan", label: "Pengaturan" },
];

const OTHER_PATHS = ["/wishlist", "/rutin", "/dompet", "/pengaturan", "/tabungan", "/lainnya"];

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.3 : 1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M3 10.5 12 3l9 7.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function ListIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.3 : 1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function DebtIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.3 : 1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
      <circle cx="7" cy="15" r="1" fill="currentColor" />
    </svg>
  );
}

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.3 : 1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect width="7" height="7" x="3" y="3" rx="1.5" />
      <rect width="7" height="7" x="14" y="3" rx="1.5" />
      <rect width="7" height="7" x="14" y="14" rx="1.5" />
      <rect width="7" height="7" x="3" y="14" rx="1.5" />
    </svg>
  );
}

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

  const active = (h: string) => {
    if (h === "/") return path === "/";
    if (h === "/lainnya") return OTHER_PATHS.some((o) => path.startsWith(o));
    return path.startsWith(h);
  };

  return (
    <div className="min-h-dvh md:flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:w-60 shrink-0 flex-col border-r border-line p-5 sticky top-0 h-dvh">
        <div className="font-bold text-xl tracking-tight mb-8">Uang<span className="text-brand">Ku</span></div>
        <nav className="space-y-1 flex-1">
          {DESKTOP_NAV.map((n) => (
            <Link key={n.href} href={n.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${active(n.href) ? "bg-brand-soft text-brand font-semibold" : "text-muted hover:text-ink"}`}>
              {n.label}
              {n.href === "/rutin" && pendingCount > 0 && <span className="text-xs bg-warn-soft text-warn rounded-full px-2 py-0.5 font-semibold">{pendingCount}</span>}
            </Link>
          ))}
        </nav>
        <div className="mb-3"><MemberSwitcher members={members} memberId={memberId} /></div>
        <button onClick={() => setOpen(true)} className="btn btn-primary w-full shadow-sm">+ Catat <kbd className="text-xs opacity-70">N</kbd></button>
        <button onClick={toggle} className="btn w-full mt-2">{hidden ? "Tampilkan saldo" : "Sembunyikan saldo"}</button>
        <form action={logout}><button className="w-full text-xs text-muted hover:text-ink mt-3">Keluar</button></form>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-line/70 sticky top-0 bg-surface/90 backdrop-blur-md z-30">
          <div className="font-bold text-lg tracking-tight">Uang<span className="text-brand">Ku</span></div>
          <div className="flex items-center gap-3">
            {members.length > 0 && <div className="w-28"><MemberSwitcher members={members} memberId={memberId} /></div>}
            <button onClick={toggle} className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-line bg-surface hover:bg-bg text-muted active:scale-95 transition-all">
              {hidden ? "Tampilkan" : "Sembunyikan"}
            </button>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 md:px-8 py-5 md:py-8 pb-32 md:pb-10">{children}</main>
      </div>

      {/* Modern Native-like Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-lg border-t border-line/80 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1">
        <div className="grid grid-cols-5 items-center max-w-md mx-auto px-2">
          {/* 1. Ringkasan */}
          <Link href="/" className={`flex flex-col items-center justify-center py-1.5 transition-colors group ${active("/") ? "text-brand" : "text-muted hover:text-ink"}`}>
            <HomeIcon active={active("/")} />
            <span className={`text-[10px] tracking-tight mt-1 ${active("/") ? "font-bold text-brand" : "font-medium text-muted"}`}>Ringkasan</span>
          </Link>

          {/* 2. Transaksi */}
          <Link href="/transaksi" className={`flex flex-col items-center justify-center py-1.5 transition-colors group ${active("/transaksi") ? "text-brand" : "text-muted hover:text-ink"}`}>
            <ListIcon active={active("/transaksi")} />
            <span className={`text-[10px] tracking-tight mt-1 ${active("/transaksi") ? "font-bold text-brand" : "font-medium text-muted"}`}>Transaksi</span>
          </Link>

          {/* 3. Center Action Button (+) */}
          <div className="flex flex-col items-center justify-center">
            <button
              onClick={() => setOpen(true)}
              aria-label="Catat transaksi baru"
              className="flex flex-col items-center justify-center -mt-6 group focus:outline-none"
            >
              <div className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/35 border-2 border-surface active:scale-90 transition-transform">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <span className="text-[10px] font-semibold text-muted mt-0.5 group-active:text-brand">Catat</span>
            </button>
          </div>

          {/* 4. Hutang */}
          <Link href="/hutang" className={`flex flex-col items-center justify-center py-1.5 transition-colors group ${active("/hutang") ? "text-brand" : "text-muted hover:text-ink"}`}>
            <DebtIcon active={active("/hutang")} />
            <span className={`text-[10px] tracking-tight mt-1 ${active("/hutang") ? "font-bold text-brand" : "font-medium text-muted"}`}>Hutang</span>
          </Link>

          {/* 5. Menu Lainnya */}
          <Link href="/lainnya" className={`relative flex flex-col items-center justify-center py-1.5 transition-colors group ${active("/lainnya") ? "text-brand" : "text-muted hover:text-ink"}`}>
            <div className="relative">
              <GridIcon active={active("/lainnya")} />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warn opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-warn border border-surface"></span>
                </span>
              )}
            </div>
            <span className={`text-[10px] tracking-tight mt-1 ${active("/lainnya") ? "font-bold text-brand" : "font-medium text-muted"}`}>Lainnya</span>
          </Link>
        </div>
      </nav>

      {open && <TransactionSheet wallets={wallets} categories={categories} onClose={() => setOpen(false)} />}
    </div>
  );
}

export function Shell(props: { wallets: Wallet[]; categories: Category[]; pendingCount: number; members: Member[]; memberId: number | null; children: React.ReactNode }) {
  return <PrivacyProvider><Inner {...props} /></PrivacyProvider>;
}
