import { addDebt, deleteDebt, payDebt } from "@/app/actions-p2";
import { AmountInput } from "@/components/amount-input";
import { Money } from "@/components/privacy";
import { dateLabel, todayISO } from "@/lib/format";
import { getWallets } from "@/lib/queries";
import { getDebts, type Debt } from "@/lib/queries-p2";

export const dynamic = "force-dynamic";

const STATUS: Record<Debt["status"], { label: (d: Debt) => string; cls: string }> = {
  lunas: { label: () => "Lunas", cls: "bg-brand-soft text-brand" },
  overdue: { label: (d) => `Terlambat ${Math.abs(d.daysLeft!)} hari`, cls: "bg-out-soft text-out" },
  soon: { label: (d) => (d.daysLeft === 0 ? "Jatuh tempo hari ini" : `${d.daysLeft} hari lagi`), cls: "bg-warn-soft text-warn" },
  ok: { label: (d) => `Jatuh tempo ${dateLabel(d.nextDue!)}`, cls: "bg-bg text-muted" },
  none: { label: () => "Tanpa jatuh tempo", cls: "bg-bg text-muted" },
};

function DebtCard({ d, wallets }: { d: Debt; wallets: ReturnType<typeof getWallets> }) {
  const pct = Math.min(100, Math.round((d.paid / d.principal) * 100));
  const st = STATUS[d.status];
  const payable = d.kind === "payable";
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold truncate">{d.party}</div>
          {d.note && <div className="text-xs text-muted truncate">{d.note}</div>}
        </div>
        <span className={`text-[11px] font-semibold rounded-full px-2 py-0.5 shrink-0 ${st.cls}`}>{st.label(d)}</span>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <div>
          <div className="text-xs text-muted">Sisa</div>
          <Money value={d.remaining} className={`text-xl font-bold ${d.remaining === 0 ? "text-brand" : ""}`} />
        </div>
        <div className="text-right text-xs text-muted">
          dari <Money value={d.principal} />
          {d.installment > 0 && <div>cicilan <Money value={d.installment} />/bln</div>}
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-line mt-3"><div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} /></div>
      <div className="text-[11px] text-muted mt-1">{pct}% {payable ? "terbayar" : "kembali"}</div>

      <div className="flex items-center gap-2 mt-3">
        {d.remaining > 0 && wallets.length > 0 && (
          <details className="flex-1 group">
            <summary className="btn btn-primary w-full list-none cursor-pointer">{payable ? "Catat pembayaran" : "Catat pelunasan diterima"}</summary>
            <form action={payDebt} className="mt-3 space-y-3 border-t border-line pt-3">
              <input type="hidden" name="debt_id" value={d.id} />
              <div><label className="label">Nominal</label><AmountInput defaultValue={d.installment > 0 ? Math.min(d.installment, d.remaining) : 0} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">{payable ? "Dibayar dari" : "Masuk ke"}</label>
                  <select name="wallet_id" className="input">{wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
                </div>
                <div><label className="label">Tanggal</label><input type="date" name="date" defaultValue={todayISO()} className="input" /></div>
              </div>
              <button className="btn btn-primary w-full">Simpan</button>
            </form>
          </details>
        )}
        <form action={deleteDebt.bind(null, d.id)}><button className="btn !text-muted hover:!text-out" title="Hapus catatan">Hapus</button></form>
      </div>
    </div>
  );
}

export default function Hutang() {
  const debts = getDebts();
  const wallets = getWallets();
  const payables = debts.filter((d) => d.kind === "payable");
  const receivables = debts.filter((d) => d.kind === "receivable");
  const sum = (a: Debt[]) => a.reduce((s, d) => s + d.remaining, 0);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Hutang & piutang</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4"><div className="text-xs text-muted">Sisa hutang saya</div><Money value={sum(payables)} className="block text-xl font-bold text-out mt-1" /></div>
        <div className="card p-4"><div className="text-xs text-muted">Piutang (orang lain berhutang)</div><Money value={sum(receivables)} className="block text-xl font-bold text-in mt-1" /></div>
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold">Hutang saya</h2>
        {payables.length === 0 ? <p className="text-sm text-muted">Tidak ada hutang tercatat.</p> :
          <div className="grid gap-3 md:grid-cols-2">{payables.map((d) => <DebtCard key={d.id} d={d} wallets={wallets} />)}</div>}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Piutang</h2>
        {receivables.length === 0 ? <p className="text-sm text-muted">Tidak ada piutang tercatat.</p> :
          <div className="grid gap-3 md:grid-cols-2">{receivables.map((d) => <DebtCard key={d.id} d={d} wallets={wallets} />)}</div>}
      </section>

      <form action={addDebt} className="card p-4 space-y-3 max-w-md">
        <h2 className="font-semibold">Tambah catatan</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Jenis</label>
            <select name="kind" className="input"><option value="payable">Hutang saya</option><option value="receivable">Piutang</option></select>
          </div>
          <div><label className="label">Pihak</label><input name="party" required placeholder="mis. KPR BTN, Budi" className="input" /></div>
        </div>
        <div><label className="label">Total pokok (sisa saat ini)</label><AmountInput name="principal" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Cicilan per bulan</label><AmountInput name="installment" /></div>
          <div><label className="label">Tanggal cicilan (1–31)</label><input name="due_day" type="number" min={1} max={31} placeholder="mis. 5" className="input" /></div>
        </div>
        <div><label className="label">Atau tenggat lunas (tanpa cicilan)</label><input name="due_date" type="date" className="input" /></div>
        <div><label className="label">Catatan</label><input name="note" placeholder="Opsional" className="input" /></div>
        {wallets.length > 0 && (
          <div className="rounded-lg bg-bg border border-line p-3 space-y-2">
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" name="record_cash" className="mt-1" />
              <span>Uang pinjaman baru terjadi sekarang — catat ke saldo dompet<br /><span className="text-xs text-muted">Biarkan kosong untuk hutang lama yang sudah berjalan.</span></span>
            </label>
            <select name="wallet_id" className="input">{wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
          </div>
        )}
        <button className="btn btn-primary w-full">Simpan</button>
      </form>
    </div>
  );
}
