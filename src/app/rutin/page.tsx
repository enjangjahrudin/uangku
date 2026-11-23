import { addSchedule, deleteSchedule, toggleSchedule } from "@/app/actions";
import { AmountInput } from "@/components/amount-input";
import { PendingItem } from "@/components/pending-item";
import { Money } from "@/components/privacy";
import { getCategories, getPending, getSchedules, getWallets } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default function Rutin() {
  const schedules = getSchedules();
  const pending = getPending();
  const wallets = getWallets();
  const categories = getCategories();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pemasukan & tagihan rutin</h1>
        <p className="text-sm text-muted mt-1 max-w-xl">
          Gaji dan tagihan rutin <b>tidak</b> masuk ke saldo secara otomatis. Saldo baru berubah setelah Anda menekan konfirmasi
          bahwa uang benar-benar diterima atau tagihan benar-benar dibayar.
        </p>
      </div>

      <section>
        <h2 className="font-semibold mb-2">Menunggu konfirmasi ({pending.length})</h2>
        {pending.length === 0 ? <p className="text-sm text-muted">Tidak ada yang menunggu.</p> : (
          <div className="grid gap-3 md:grid-cols-2">
            {pending.map((p) => <PendingItem key={`${p.schedule_id}-${p.period}`} p={p} wallets={wallets} />)}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-semibold mb-2">Jadwal aktif</h2>
        <div className="card divide-y divide-line">
          {schedules.length === 0 && <p className="p-4 text-sm text-muted">Belum ada jadwal.</p>}
          {schedules.map((s) => (
            <div key={s.id} className={`flex items-center gap-3 p-4 ${s.active ? "" : "opacity-50"}`}>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{s.name}</div>
                <div className="text-xs text-muted">{s.kind === "income" ? "Pemasukan tetap" : "Tagihan"} · tiap tanggal {s.day_of_month}</div>
              </div>
              <Money value={s.amount} className={`font-semibold ${s.kind === "income" ? "text-in" : "text-out"}`} />
              <form action={toggleSchedule.bind(null, s.id, !s.active)}><button className="text-xs text-muted hover:text-ink">{s.active ? "Jeda" : "Aktifkan"}</button></form>
              <form action={deleteSchedule.bind(null, s.id)}><button className="text-xs text-muted hover:text-out">Hapus</button></form>
            </div>
          ))}
        </div>
      </section>

      <form action={addSchedule} className="card p-4 space-y-3 max-w-md">
        <h2 className="font-semibold">Tambah jadwal</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Jenis</label>
            <select name="kind" className="input"><option value="income">Pemasukan tetap (gaji)</option><option value="expense">Tagihan rutin</option></select>
          </div>
          <div><label className="label">Tanggal tiap bulan</label><input name="day_of_month" type="number" min={1} max={31} defaultValue={25} className="input" /></div>
        </div>
        <div><label className="label">Nama</label><input name="name" required placeholder="mis. Gaji kantor, Internet" className="input" /></div>
        <div><label className="label">Nominal estimasi</label><AmountInput /></div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Dompet default</label>
            <select name="wallet_id" className="input"><option value="">—</option>{wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
          </div>
          <div>
            <label className="label">Kategori</label>
            <select name="category_id" className="input"><option value="">—</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.kind === "income" ? "masuk" : "keluar"})</option>)}</select>
          </div>
        </div>
        <button className="btn btn-primary w-full">Simpan jadwal</button>
      </form>
    </div>
  );
}
