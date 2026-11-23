import { addGoal, addInvestment, deleteGoal, deleteInvestment, goalEntry, updateInvestment } from "@/app/actions-p2";
import { AmountInput } from "@/components/amount-input";
import { Money } from "@/components/privacy";
import { dateLabel } from "@/lib/format";
import { getGoals, getInvestments } from "@/lib/queries-p2";

export const dynamic = "force-dynamic";

const INV_TYPES = ["reksadana", "saham", "emas", "kripto", "deposito", "lainnya"];

export default function Tabungan() {
  const goals = getGoals();
  const invs = getInvestments();
  const saved = goals.reduce((s, g) => s + g.saved, 0);
  const invValue = invs.reduce((s, i) => s + i.current_value, 0);
  const invCost = invs.reduce((s, i) => s + i.invested, 0);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Tabungan & investasi</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4"><div className="text-xs text-muted">Total tabungan (pos)</div><Money value={saved} className="block text-xl font-bold mt-1" /></div>
        <div className="card p-4">
          <div className="text-xs text-muted">Nilai investasi</div>
          <Money value={invValue} className="block text-xl font-bold mt-1" />
          {invCost > 0 && <Money value={invValue - invCost} sign className={`text-xs font-semibold ${invValue >= invCost ? "text-in" : "text-out"}`} />}
        </div>
      </div>
      <p className="text-xs text-muted -mt-4 max-w-xl">
        Pos tabungan adalah penandaan alokasi (amplop virtual) — tidak mengurangi saldo dompet. Untuk memindahkan uang
        sungguhan ke rekening tabungan, gunakan Transfer antar dompet.
      </p>

      <section className="space-y-3">
        <h2 className="font-semibold">Pos tabungan</h2>
        {goals.length === 0 && <p className="text-sm text-muted">Belum ada pos tabungan.</p>}
        <div className="grid gap-3 md:grid-cols-2">
          {goals.map((g) => {
            const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
            return (
              <div key={g.id} className="card p-4">
                <div className="flex justify-between gap-3">
                  <div className="font-semibold truncate">{g.name}</div>
                  <div className="text-sm font-semibold">{pct}%</div>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <Money value={g.saved} className="font-bold" />
                  <span className="text-muted">target <Money value={g.target} /></span>
                </div>
                <div className="h-2 rounded-full bg-line mt-2"><div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} /></div>
                {g.target_date && <div className="text-[11px] text-muted mt-1">Target {dateLabel(g.target_date)}</div>}
                <details className="mt-3">
                  <summary className="btn w-full list-none cursor-pointer">Setor / tarik</summary>
                  <form action={goalEntry} className="mt-3 space-y-3 border-t border-line pt-3">
                    <input type="hidden" name="goal_id" value={g.id} />
                    <AmountInput />
                    <div className="grid grid-cols-2 gap-3">
                      <select name="dir" className="input"><option value="in">Setor</option><option value="out">Tarik</option></select>
                      <input name="note" placeholder="Catatan" className="input" />
                    </div>
                    <button className="btn btn-primary w-full">Simpan</button>
                  </form>
                </details>
                <form action={deleteGoal.bind(null, g.id)} className="mt-2 text-right"><button className="text-xs text-muted hover:text-out">Hapus pos</button></form>
              </div>
            );
          })}
        </div>
        <form action={addGoal} className="card p-4 space-y-3 max-w-md">
          <h3 className="font-semibold">Tambah pos tabungan</h3>
          <div><label className="label">Nama</label><input name="name" required placeholder="mis. Dana darurat, Liburan" className="input" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Target</label><AmountInput name="target" /></div>
            <div><label className="label">Sudah terkumpul</label><AmountInput name="initial" /></div>
          </div>
          <div><label className="label">Target tanggal (opsional)</label><input type="date" name="target_date" className="input" /></div>
          <button className="btn btn-primary w-full">Simpan pos</button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Investasi</h2>
        {invs.length === 0 && <p className="text-sm text-muted">Belum ada investasi tercatat.</p>}
        <div className="grid gap-3 md:grid-cols-2">
          {invs.map((i) => {
            const gain = i.current_value - i.invested;
            const pct = i.invested > 0 ? (gain / i.invested) * 100 : 0;
            return (
              <div key={i.id} className="card p-4">
                <div className="flex justify-between gap-3">
                  <div><div className="font-semibold">{i.name}</div><div className="text-xs text-muted capitalize">{i.type} · nilai per {dateLabel(i.updated_at)}</div></div>
                  <div className="text-right">
                    <Money value={i.current_value} className="font-bold" />
                    <div className={`text-xs font-semibold ${gain >= 0 ? "text-in" : "text-out"}`}><Money value={gain} sign /> ({pct.toFixed(1)}%)</div>
                  </div>
                </div>
                <div className="text-xs text-muted mt-1">Modal <Money value={i.invested} /></div>
                <details className="mt-3">
                  <summary className="btn w-full list-none cursor-pointer">Perbarui</summary>
                  <form action={updateInvestment} className="mt-3 space-y-3 border-t border-line pt-3">
                    <input type="hidden" name="id" value={i.id} />
                    <div><label className="label">Nilai pasar saat ini</label><AmountInput name="current_value" defaultValue={i.current_value} /></div>
                    <div><label className="label">Tambah modal (opsional)</label><AmountInput name="add_capital" /></div>
                    <button className="btn btn-primary w-full">Simpan</button>
                  </form>
                </details>
                <form action={deleteInvestment.bind(null, i.id)} className="mt-2 text-right"><button className="text-xs text-muted hover:text-out">Hapus</button></form>
              </div>
            );
          })}
        </div>
        <form action={addInvestment} className="card p-4 space-y-3 max-w-md">
          <h3 className="font-semibold">Tambah investasi</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Nama</label><input name="name" required placeholder="mis. Reksadana X" className="input" /></div>
            <div><label className="label">Jenis</label><select name="type" className="input">{INV_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Total modal</label><AmountInput name="invested" /></div>
            <div><label className="label">Nilai saat ini</label><AmountInput name="current_value" /></div>
          </div>
          <button className="btn btn-primary w-full">Simpan</button>
        </form>
      </section>
    </div>
  );
}
