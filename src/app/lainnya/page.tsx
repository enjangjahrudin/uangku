import Link from "next/link";

const ITEMS = [
  { href: "/wishlist", title: "Wishlist", desc: "Barang yang ingin dibeli" },
  { href: "/rutin", title: "Rutin", desc: "Gaji & tagihan berulang" },
  { href: "/dompet", title: "Dompet", desc: "Rekening, tunai, e-wallet" },
  { href: "/pengaturan", title: "Pengaturan", desc: "Kategori & ekspor data" },
];

export default function Lainnya() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Menu lainnya</h1>
      <div className="card divide-y divide-line">
        {ITEMS.map((i) => (
          <Link key={i.href} href={i.href} className="flex items-center justify-between px-4 py-4">
            <div><div className="font-semibold">{i.title}</div><div className="text-xs text-muted">{i.desc}</div></div>
            <span className="text-muted">›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
