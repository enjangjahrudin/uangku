import { getTransactions, getWallets, getCategories, getSchedules } from "@/lib/queries";

export const dynamic = "force-dynamic";

const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export async function GET(req: Request) {
  const format = new URL(req.url).searchParams.get("format");
  if (format === "json") {
    return new Response(
      JSON.stringify({
        wallets: getWallets(), categories: getCategories(),
        schedules: getSchedules(), transactions: getTransactions(undefined, 100000),
      }, null, 2),
      { headers: { "Content-Type": "application/json", "Content-Disposition": 'attachment; filename="uangku.json"' } }
    );
  }
  const rows = getTransactions(undefined, 100000);
  const csv = [
    "Tanggal,Jenis,Jumlah,Dompet,Ke Dompet,Kategori,Catatan",
    ...rows.map((t) => [t.date, t.type, t.amount, q(t.wallet_name), q(t.to_wallet_name), q(t.category_name), q(t.note)].join(",")),
  ].join("\r\n");
  return new Response("\uFEFF" + csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="uangku.csv"' },
  });
}
