import Link from "next/link";
import { Money } from "@/components/privacy";
import { TxList } from "@/components/tx-list";
import { currentPeriod, periodLabel, shiftPeriod } from "@/lib/format";
import { getCategories, getMembers, getMonthSummary, getTransactions, getWallets } from "@/lib/queries";

export const dynamic = "force-dynamic";

type SP = { m?: string; q?: string; w?: string; c?: string; u?: string };

export default async function Transaksi({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const period = /^\d{4}-\d{2}$/.test(sp.m ?? "") ? sp.m! : currentPeriod();
  const wallets = getWallets();
  const categories = getCategories();
  const members = getMembers();
  const filter = { q: sp.q?.trim() || undefined, wallet: Number(sp.w) || undefined, category: Number(sp.c) || undefined, member: Number(sp.u) || undefined };
  const filtered = !!(filter.q || filter.wallet || filter.category || filter.member);
  const rows = getTransactions(period, 500, filter);
  const sum = getMonthSummary(period);

  const qs = (m: string) => {
    const p = new URLSearchParams({ m });
    for (const k of ["q", "w", "c", "u"] as const) if (sp[k]) p.set(k, sp[k]!);
    return `/transaksi?${p}`;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Transaksi</h1>
        <div className="flex items-center gap-1">
          <Link className="btn !px-3" href={qs(shiftPeriod(period, -1))} aria-label="Bulan sebelumnya">‹</Link>
          <span className="text-sm font-semibold w-32 text-center">{periodLabel(period)}</span>
          <Link className="btn !px-3" href={qs(shiftPeriod(period, 1))} aria-label="Bulan berikutnya">›</Link>
        </div>
      </div>

      <form className="grid grid-cols-2 md:grid-cols-5 gap-2" action="/transaksi">
        <input type="hidden" name="m" value={period} />
        <input id="search" name="q" defaultValue={sp.q} placeholder="Cari catatan/kategori  ( / )" className="input col-span-2 md:col-span-2" />
        <select name="w" defaultValue={sp.w ?? ""} className="input"><option value="">Semua dompet</option>{wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
        <select name="c" defaultValue={sp.c ?? ""} className="input"><option value="">Semua kategori</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        {members.length > 0
          ? <select name="u" defaultValue={sp.u ?? ""} className="input"><option value="">Semua pencatat</option>{members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
          : <span />}
        <div className="col-span-2 md:col-span-5 flex gap-2">
          <button className="btn btn-primary">Terapkan</button>
          {filtered && <Link href={`/transaksi?m=${period}`} className="btn">Reset</Link>}
        </div>
      </form>

      {!filtered && (
        <div className="grid grid-cols-3 gap-3">
          <div className="card p-3"><div className="text-xs text-muted">Masuk</div><Money value={sum.income} className="block font-bold text-in" /></div>
          <div className="card p-3"><div className="text-xs text-muted">Keluar</div><Money value={sum.expense} className="block font-bold text-out" /></div>
          <div className="card p-3"><div className="text-xs text-muted">Selisih</div><Money value={sum.net} sign className="block font-bold" /></div>
        </div>
      )}
      {filtered && <p className="text-sm text-muted">{rows.length} transaksi cocok dengan filter.</p>}
      <div className="card overflow-hidden"><TxList rows={rows} /></div>
    </div>
  );
}
