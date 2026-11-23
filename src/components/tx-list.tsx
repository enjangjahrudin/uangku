import { deleteTransaction } from "@/app/actions";
import { Money } from "./privacy";
import { dateLabel } from "@/lib/format";
import type { Tx } from "@/lib/queries";

export function TxList({ rows }: { rows: Tx[] }) {
  if (rows.length === 0) return <p className="p-6 text-center text-sm text-muted">Belum ada transaksi.</p>;
  return (
    <ul className="divide-y divide-line">
      {rows.map((t) => {
        const color = t.type === "income" ? "text-in" : t.type === "expense" ? "text-out" : "text-muted";
        const title = t.note || t.category_name || (t.type === "transfer" ? "Transfer" : "Tanpa kategori");
        return (
          <li key={t.id} className="group flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{title}</div>
              <div className="text-xs text-muted truncate">
                {dateLabel(t.date)} · {t.type === "transfer" ? `${t.wallet_name} → ${t.to_wallet_name}` : `${t.category_name ?? "Tanpa kategori"} · ${t.wallet_name}`}{t.creator_name ? ` · ${t.creator_name}` : ""}
              </div>
            </div>
            <Money value={t.type === "expense" ? -t.amount : t.amount} sign={t.type !== "transfer"} className={`text-sm font-semibold ${color}`} />
            <form action={deleteTransaction.bind(null, t.id)}>
              <button className="text-xs text-muted hover:text-out md:opacity-0 group-hover:opacity-100 px-1" aria-label="Hapus" title="Hapus">✕</button>
            </form>
          </li>
        );
      })}
    </ul>
  );
}

