import Link from "next/link";

const ITEMS = [
  { href: "/tabungan", title: "Tabungan & Investasi", desc: "Pos alokasi tabungan dan pantau nilai investasi" },
  { href: "/hutang", title: "Hutang & Piutang", desc: "Daftar hutang, piutang, dan jadwal jatuh tempo" },
  { href: "/wishlist", title: "Wishlist", desc: "Rencana barang impian & simulasi waktu ketercapaian" },
  { href: "/rutin", title: "Pemasukan & Tagihan Rutin", desc: "Konfirmasi pencairan gaji dan tagihan berulang" },
  { href: "/dompet", title: "Dompet & Rekening", desc: "Kelola kas tunai, rekening bank, dan e-wallet" },
  { href: "/pengaturan", title: "Pengaturan & Anggota", desc: "Kategori transaksi, nama anggota keluarga, dan ekspor data" },
];

export default function Lainnya() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Menu Lainnya</h1>
        <p className="text-sm text-muted mt-0.5">Akses cepat seluruh modul dan fitur UangKu.</p>
      </div>
      <div className="card divide-y divide-line">
        {ITEMS.map((i) => (
          <Link key={i.href} href={i.href} className="flex items-center justify-between px-4 py-3.5 hover:bg-bg/60 transition-colors">
            <div className="min-w-0 pr-3">
              <div className="font-semibold text-sm">{i.title}</div>
              <div className="text-xs text-muted truncate mt-0.5">{i.desc}</div>
            </div>
            <span className="text-muted text-lg">›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
