import { addWallet, archiveWallet } from "@/app/actions";
import { AmountInput } from "@/components/amount-input";
import { Money } from "@/components/privacy";
import { WALLET_TYPES } from "@/lib/format";
import { getWallets } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default function Dompet() {
  const wallets = getWallets();
  const total = wallets.reduce((s, w) => s + w.balance, 0);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dompet</h1>
        <p className="text-sm text-muted mt-1">Total <Money value={total} className="font-semibold text-ink" /></p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {wallets.map((w) => (
          <div key={w.id} className="card p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold truncate">{w.name}</div>
              <div className="text-xs text-muted">{WALLET_TYPES[w.type] ?? w.type}</div>
            </div>
            <div className="text-right">
              <Money value={w.balance} className="font-bold" />
              <form action={archiveWallet.bind(null, w.id)}>
                <button className="text-[11px] text-muted hover:text-out">Arsipkan</button>
              </form>
            </div>
          </div>
        ))}
      </div>

      <form action={addWallet} className="card p-4 space-y-3 max-w-md">
        <h2 className="font-semibold">Tambah dompet</h2>
        <div><label className="label">Nama</label><input name="name" required placeholder="mis. BCA, Dompet tunai, GoPay" className="input" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Jenis</label>
            <select name="type" className="input">{Object.entries(WALLET_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          </div>
          <div><label className="label">Saldo awal</label><AmountInput name="initial_balance" /></div>
        </div>
        <button className="btn btn-primary w-full">Simpan dompet</button>
      </form>
    </div>
  );
}
