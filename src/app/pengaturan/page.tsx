import { addCategory, deleteCategory } from "@/app/actions";
import { addMember, deleteMember } from "@/app/actions-p3";
import { logout } from "@/app/actions-auth";
import { getCategories, getMembers } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default function Pengaturan() {
  const cats = getCategories();
  const members = getMembers();
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>

      <section className="space-y-3">
        <h2 className="font-semibold">Kategori</h2>
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

      <section className="space-y-3">
        <h2 className="font-semibold">Anggota keluarga</h2>
        <p className="text-sm text-muted max-w-xl">
          Tambahkan nama anggota agar tiap transaksi tercatat siapa pencatatnya. Pilih pencatat aktif di sidebar/header.
          Ini hanya penanda — belum ada login atau pembatasan akses per orang.
        </p>
        {members.length > 0 && (
          <div className="card divide-y divide-line max-w-md">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-4 py-2 text-sm">
                {m.name}
                <form action={deleteMember.bind(null, m.id)}><button className="text-xs text-muted hover:text-out">Hapus</button></form>
              </div>
            ))}
          </div>
        )}
        <form action={addMember} className="flex gap-2 max-w-md">
          <input name="name" required placeholder="Nama anggota" className="input" />
          <button className="btn btn-primary">Tambah</button>
        </form>
      </section>

      <section className="space-y-3 md:hidden">
        <form action={logout}><button className="btn w-full">Keluar</button></form>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Ekspor data</h2>
        <p className="text-sm text-muted">Data Anda disimpan lokal di folder <code>data/uangku.db</code>. Unduh salinannya kapan saja.</p>
        <div className="flex gap-2">
          <a className="btn" href="/api/export?format=csv">Unduh CSV (Excel)</a>
          <a className="btn" href="/api/export?format=json">Unduh JSON</a>
        </div>
      </section>
    </div>
  );
}


