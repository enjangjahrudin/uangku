import { addCategory, deleteCategory } from "@/app/actions";
import { logout } from "@/app/actions-auth";
import { getCategories, getMembers } from "@/lib/queries";
import { MemberSettings } from "@/components/member-settings";

export const dynamic = "force-dynamic";

export default function Pengaturan() {
  const cats = getCategories();
  const members = getMembers();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-sm text-muted mt-0.5">Kelola kategori pengeluaran, akun keluarga & PIN, serta cadangan data.</p>
      </div>

      {/* Modul Anggota & PIN */}
      <MemberSettings members={members} />

      {/* Kategori Transaksi */}
      <section className="space-y-3">
        <h2 className="font-semibold text-lg">Kategori Transaksi</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {(["expense", "income"] as const).map((k) => (
            <div key={k} className="card">
              <div className="px-4 py-2 text-xs font-semibold text-muted border-b border-line">{k === "expense" ? "Pengeluaran" : "Pemasukan"}</div>
              <ul className="divide-y divide-line">
                {cats.filter((c) => c.kind === k).map((c) => (
                  <li key={c.id} className="flex items-center justify-between px-4 py-2 text-sm">
                    {c.name}
                    <form action={deleteCategory.bind(null, c.id)}><button className="text-xs text-muted hover:text-out">Hapus</button></form>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <form action={addCategory} className="flex gap-2 max-w-md">
          <input name="name" required placeholder="Kategori baru" className="input" />
          <select name="kind" className="input !w-auto"><option value="expense">Keluar</option><option value="income">Masuk</option></select>
          <button className="btn btn-primary">Tambah</button>
        </form>
      </section>

      {/* Ekspor Data */}
      <section className="space-y-3">
        <h2 className="font-semibold text-lg">Ekspor & Cadangan Data</h2>
        <p className="text-sm text-muted">Data Anda disimpan lokal di folder <code>data/uangku.db</code>. Unduh salinannya kapan saja.</p>
        <div className="flex gap-2">
          <a className="btn" href="/api/export?format=csv">Unduh CSV (Excel)</a>
          <a className="btn" href="/api/export?format=json">Unduh JSON</a>
        </div>
      </section>

      {/* Tombol Keluar untuk Mobile */}
      <section className="space-y-3 md:hidden border-t border-line pt-4">
        <form action={logout}><button className="btn w-full !text-out hover:bg-out-soft">Keluar Akun</button></form>
      </section>
    </div>
  );
}
