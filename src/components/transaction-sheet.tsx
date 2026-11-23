"use client";

import { useState, useTransition } from "react";
import { addTransaction } from "@/app/actions";
import { AmountInput } from "./amount-input";
import { todayISO } from "@/lib/format";
import type { Category, Wallet } from "@/lib/queries";

type T = "expense" | "income" | "transfer";
const TABS: { k: T; label: string }[] = [
  { k: "expense", label: "Keluar" },
  { k: "income", label: "Masuk" },
  { k: "transfer", label: "Transfer" },
];

export function TransactionSheet({ wallets, categories, onClose }: { wallets: Wallet[]; categories: Category[]; onClose: () => void }) {
  const [type, setType] = useState<T>("expense");
  const [pending, start] = useTransition();
  const cats = categories.filter((c) => c.kind === (type === "income" ? "income" : "expense"));

  if (wallets.length === 0)
    return (
      <Backdrop onClose={onClose}>
        <p className="font-semibold">Buat dompet dulu</p>
        <p className="text-sm text-muted mt-1">Tambahkan minimal satu dompet (tunai/rekening) di menu Dompet sebelum mencatat transaksi.</p>
        <a href="/dompet" onClick={onClose} className="btn btn-primary mt-4 w-full">Ke halaman Dompet</a>
      </Backdrop>
    );

  return (
    <Backdrop onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">Catat transaksi</h2>
        <button onClick={onClose} className="text-muted text-sm" aria-label="Tutup">Tutup</button>
      </div>
      <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-bg border border-line mb-4">
        {TABS.map((t) => (
          <button key={t.k} type="button" onClick={() => setType(t.k)}
            className={`py-2 rounded-lg text-sm font-semibold ${type === t.k ? "bg-surface shadow-sm text-ink" : "text-muted"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <form
        action={(fd) => start(async () => { await addTransaction(fd); onClose(); })}
        className="space-y-3"
      >
        <input type="hidden" name="type" value={type} />
        <div><label className="label">Jumlah</label><AmountInput autoFocus /></div>
        <div className={type === "transfer" ? "grid grid-cols-2 gap-3" : ""}>
          <div>
            <label className="label">{type === "transfer" ? "Dari dompet" : type === "income" ? "Masuk ke" : "Dibayar dari"}</label>
            <select name="wallet_id" className="input">{wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
          </div>
          {type === "transfer" && (
            <div>
              <label className="label">Ke dompet</label>
              <select name="to_wallet_id" className="input" defaultValue={wallets[1]?.id}>
                {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          )}
        </div>
        {type !== "transfer" && (
          <div>
            <label className="label">Kategori</label>
            <select name="category_id" className="input" key={type}>
              <option value="">Tanpa kategori</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Tanggal</label><input type="date" name="date" defaultValue={todayISO()} className="input" /></div>
          <div><label className="label">Catatan</label><input name="note" placeholder="Opsional" className="input" /></div>
        </div>
        <button disabled={pending} className="btn btn-primary w-full !py-3">{pending ? "Menyimpan…" : "Simpan"}</button>
      </form>
    </Backdrop>
  );
}

function Backdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card w-full sm:max-w-md rounded-b-none sm:rounded-b-[14px] p-5 max-h-[92dvh] overflow-y-auto">{children}</div>
    </div>
  );
}
