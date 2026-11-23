import { Money } from "@/components/privacy";
import { PendingItem } from "@/components/pending-item";
import { TxList } from "@/components/tx-list";
import { currentPeriod, periodLabel } from "@/lib/format";
import { getCategoryBreakdown, getMonthSummary, getMonthlyTrend, getPending, getTransactions, getWallets } from "@/lib/queries";

import { getDebtTotals, getGoals, getSafeToSpend } from "@/lib/queries-p2";

export const dynamic = "force-dynamic";

export default function Dashboard() {
  const period = currentPeriod();
  const wallets = getWallets();
  const total = wallets.reduce((s, w) => s + w.balance, 0);
  const sum = getMonthSummary(period);
  const pending = getPending();
  const trend = getMonthlyTrend(6);
  const cats = getCategoryBreakdown(period);
  const recent = getTransactions(undefined, 8);
  const debtTotals = getDebtTotals();
  const sts = getSafeToSpend();
  const goals = getGoals();
  const saved = goals.reduce((s, g) => s + g.saved, 0);
  const maxTrend = Math.max(1, ...trend.flatMap((t) => [t.income, t.expense]));
  const maxCat = Math.max(1, ...cats.map((c) => c.total));
  const pendingIn = pending.filter((p) => p.kind === "income").reduce((s, p) => s + p.amount, 0);
  const pendingOut = pending.filter((p) => p.kind === "expense").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <section>
        <div className="text-sm text-muted">Total saldo (uang yang sudah benar-benar ada)</div>
        <Money value={total} className="block text-4xl md:text-5xl font-bold tracking-tight mt-1" />
      </section>

      <section className="card p-4">
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-sm font-semibold">Aman dibelanjakan</div>
          <Money value={sts.safe} className={`text-2xl font-bold ${sts.safe < 0 ? "text-out" : "text-brand"}`} />
        </div>
        <dl className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-xs text-muted">
          <div><dt>Saldo kas</dt><dd className="text-ink font-medium"><Money value={sts.cash} /></dd></div>
          <div><dt>- Dialokasikan tabungan</dt><dd className="text-ink font-medium"><Money value={sts.earmarked} /></dd></div>
          <div><dt>- Cicilan hutang bulan ini</dt><dd className="text-ink font-medium"><Money value={sts.debtDue} /></dd></div>
          <div><dt>- Tagihan belum dibayar</dt><dd className="text-ink font-medium"><Money value={sts.billsDue} /></dd></div>
        </dl>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <div className="text-xs text-muted">Masuk · {periodLabel(period)}</div>
          <Money value={sum.income} className="block text-xl font-bold text-in mt-1" />
        </div>
        <div className="card p-4">
          <div className="text-xs text-muted">Keluar · {periodLabel(period)}</div>
          <Money value={sum.expense} className="block text-xl font-bold text-out mt-1" />
        </div>
      </section>

      {(debtTotals.payable > 0 || goals.length > 0) && (
        <section className="grid grid-cols-2 gap-3">
          <a href="/hutang" className="card p-4 hover:bg-bg">
            <div className="text-xs text-muted">Sisa hutang</div>
            <Money value={debtTotals.payable} className="block text-xl font-bold mt-1" />
          </a>
          <a href="/tabungan" className="card p-4 hover:bg-bg">
            <div className="text-xs text-muted">Tabungan (pos)</div>
            <Money value={saved} className="block text-xl font-bold mt-1" />
          </a>
        </section>
      )}

      {debtTotals.attention.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold">Pengingat hutang</h2>
          {debtTotals.attention.map((d) => (
            <a key={d.id} href="/hutang" className={`card p-4 flex items-center justify-between gap-3 ${d.status === "overdue" ? "!border-out" : ""}`}>
              <div className="min-w-0">
                <div className="font-semibold truncate">{d.party}</div>
                <div className={`text-xs ${d.status === "overdue" ? "text-out font-semibold" : "text-warn"}`}>
                  {d.status === "overdue" ? `Terlambat ${Math.abs(d.daysLeft!)} hari` : d.daysLeft === 0 ? "Jatuh tempo hari ini" : `Jatuh tempo ${d.daysLeft} hari lagi`}
                </div>
              </div>
              <div className="text-right"><Money value={d.installment || d.remaining} className="font-semibold" /><div className="text-[11px] text-muted">sisa <Money value={d.remaining} /></div></div>
            </a>
          ))}
        </section>
      )}

      {pending.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="font-semibold">Menunggu konfirmasi</h2>
            <span className="text-xs text-muted">
              {pendingIn > 0 && <>Akan masuk <Money value={pendingIn} /></>}
              {pendingIn > 0 && pendingOut > 0 && " · "}
              {pendingOut > 0 && <>Tagihan <Money value={pendingOut} /></>}
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {pending.map((p) => <PendingItem key={`${p.schedule_id}-${p.period}`} p={p} wallets={wallets} />)}
          </div>
        </section>
      )}

      {wallets.length === 0 && (
        <div className="card p-6 text-center">
          <p className="font-semibold">Mulai dengan membuat dompet</p>
          <p className="text-sm text-muted mt-1">Tambahkan dompet tunai atau rekening bank beserta saldo awalnya.</p>
          <a href="/dompet" className="btn btn-primary mt-4">Buat dompet</a>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card p-4">
          <h2 className="font-semibold mb-4">Tren 6 bulan</h2>
          <div className="flex items-end gap-2 h-36">
            {trend.map((t) => (
              <div key={t.period} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div className="flex items-end gap-1 w-full justify-center flex-1">
                  <div className="w-1/3 max-w-3 rounded-t bg-in" style={{ height: `${(t.income / maxTrend) * 100}%`, minHeight: t.income ? 2 : 0 }} title={`Masuk ${t.income}`} />
                  <div className="w-1/3 max-w-3 rounded-t bg-out" style={{ height: `${(t.expense / maxTrend) * 100}%`, minHeight: t.expense ? 2 : 0 }} title={`Keluar ${t.expense}`} />
                </div>
                <span className="text-[10px] text-muted">{periodLabel(t.period).slice(0, 3)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-4">
          <h2 className="font-semibold mb-4">Pengeluaran per kategori</h2>
          {cats.length === 0 ? <p className="text-sm text-muted">Belum ada pengeluaran bulan ini.</p> : (
            <ul className="space-y-3">
              {cats.map((c) => (
                <li key={c.name}>
                  <div className="flex justify-between text-sm mb-1"><span>{c.name}</span><Money value={c.total} className="font-medium" /></div>
                  <div className="h-1.5 rounded-full bg-line"><div className="h-full rounded-full bg-brand" style={{ width: `${(c.total / maxCat) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section>
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="font-semibold">Transaksi terakhir</h2>
          <a href="/transaksi" className="text-sm text-brand font-medium">Lihat semua</a>
        </div>
        <div className="card overflow-hidden"><TxList rows={recent} /></div>
      </section>
    </div>
  );
}

