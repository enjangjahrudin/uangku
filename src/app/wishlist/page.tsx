import { addWish, deleteWish, setWishBought } from "@/app/actions-p2";
import { AmountInput } from "@/components/amount-input";
import { Money } from "@/components/privacy";
import { getAvgNet, getGoals, getWishes } from "@/lib/queries-p2";

export const dynamic = "force-dynamic";

export default function Wishlist() {
  const wishes = getWishes();
  const goals = getGoals();
  const avg = getAvgNet();
  const open = wishes.filter((w) => !w.bought);
  const done = wishes.filter((w) => w.bought);
  const total = open.reduce((s, w) => s + w.price, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Wishlist</h1>
        <p className="text-sm text-muted mt-1">Total keinginan <Money value={total} className="font-semibold text-ink" />
          {avg > 0 && <> · rata-rata sisa per bulan (3 bln terakhir) <Money value={avg} className="font-semibold text-ink" /></>}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {open.length === 0 && <p className="text-sm text-muted">Wishlist masih kosong.</p>}
        {open.map((w) => {
          const pct = w.goal_id ? Math.min(100, Math.round((w.saved / w.price) * 100)) : null;
          return (
            <div key={w.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{w.url ? <a href={w.url} target="_blank" rel="noreferrer" className="hover:underline">{w.name}</a> : w.name}</div>
                  <span className={`text-[11px] font-semibold rounded-full px-2 py-0.5 ${w.priority === "need" ? "bg-brand-soft text-brand" : "bg-bg text-muted"}`}>{w.priority === "need" ? "Kebutuhan" : "Keinginan"}</span>
                </div>
                <Money value={w.price} className="font-bold" />
              </div>
              {pct !== null && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted mb-1"><span>Dari pos “{w.goal_name}”</span><span><Money value={w.saved} /> · {pct}%</span></div>
                  <div className="h-1.5 rounded-full bg-line"><div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} /></div>
                </div>
              )}
              <div className="text-xs mt-3 text-muted">
                {w.months === 0 ? <span className="text-in font-semibold">Dana sudah cukup — siap dibeli.</span>
                  : w.months === null ? "Belum ada sisa kas bulanan positif untuk diperkirakan."
                  : <>Perkiraan tercapai ≈ <b className="text-ink">{w.months} bulan</b> dengan pola kas sekarang.</>}
              </div>
              <div className="flex gap-2 mt-3">
                <form action={setWishBought.bind(null, w.id, true)} className="flex-1"><button className="btn w-full">Sudah dibeli</button></form>
                <form action={deleteWish.bind(null, w.id)}><button className="btn !text-muted hover:!text-out">Hapus</button></form>
              </div>
            </div>
          );
        })}
      </div>

      <form action={addWish} className="card p-4 space-y-3 max-w-md">
        <h2 className="font-semibold">Tambah wishlist</h2>
        <div><label className="label">Barang / tujuan</label><input name="name" required placeholder="mis. Laptop kerja" className="input" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Estimasi harga</label><AmountInput name="price" /></div>
          <div><label className="label">Prioritas</label><select name="priority" className="input"><option value="want">Keinginan</option><option value="need">Kebutuhan</option></select></div>
        </div>
        <div><label className="label">Link (opsional)</label><input name="url" type="url" placeholder="https://" className="input" /></div>
        <div>
          <label className="label">Biayai dari pos tabungan</label>
          <select name="goal_id" className="input"><option value="">— tidak dikaitkan</option>{goals.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select>
        </div>
        <button className="btn btn-primary w-full">Simpan</button>
      </form>

      {done.length > 0 && (
        <section>
          <h2 className="font-semibold mb-2">Sudah dibeli</h2>
          <div className="card divide-y divide-line">
            {done.map((w) => (
              <div key={w.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span className="flex-1 truncate line-through text-muted">{w.name}</span>
                <Money value={w.price} className="text-muted" />
                <form action={setWishBought.bind(null, w.id, false)}><button className="text-xs text-muted hover:text-ink">Batalkan</button></form>
                <form action={deleteWish.bind(null, w.id)}><button className="text-xs text-muted hover:text-out">Hapus</button></form>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
