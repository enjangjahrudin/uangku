import { Money } from "@/components/privacy";
import { getWallets } from "@/lib/queries";
import { getDebts, type Debt } from "@/lib/queries-p2";
import { DebtCard } from "@/components/debt-card";
import { AddDebtForm } from "@/components/add-debt-form";

export const dynamic = "force-dynamic";

export default function Hutang() {
  const debts = getDebts();
  const wallets = getWallets();
  const payables = debts.filter((d) => d.kind === "payable");
  const receivables = debts.filter((d) => d.kind === "receivable");
  const sum = (a: Debt[]) => a.reduce((s, d) => s + d.remaining, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hutang & Piutang</h1>
        <p className="text-sm text-muted mt-0.5">
          Pantau kewajiban hutang Anda maupun piutang orang lain, baik berupa cicilan rutin, tempo, atau pembayaran bebas.
        </p>
      </div>

      {/* Ringkasan Total */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <div className="text-xs text-muted">Total Sisa Hutang Saya</div>
          <Money value={sum(payables)} className="block text-2xl font-bold text-out mt-1" />
          <span className="text-[11px] text-muted">Kewajiban yang harus dibayar</span>
        </div>
        <div className="card p-4">
          <div className="text-xs text-muted">Total Piutang Saya</div>
          <Money value={sum(receivables)} className="block text-2xl font-bold text-in mt-1" />
          <span className="text-[11px] text-muted">Uang yang dipinjam orang lain</span>
        </div>
      </div>

      {/* Daftar Hutang Saya */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Hutang Saya ({payables.length})</h2>
          <span className="text-xs text-muted">Cicilan, pinjaman bank, atau perorangan</span>
        </div>
        {payables.length === 0 ? (
          <p className="p-5 text-center text-sm text-muted card">Tidak ada catatan hutang.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {payables.map((d) => (
              <DebtCard key={d.id} d={d} wallets={wallets} />
            ))}
          </div>
        )}
      </section>

      {/* Daftar Piutang */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Piutang ({receivables.length})</h2>
          <span className="text-xs text-muted">Uang yang dipinjamkan ke pihak lain</span>
        </div>
        {receivables.length === 0 ? (
          <p className="p-5 text-center text-sm text-muted card">Tidak ada catatan piutang.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {receivables.map((d) => (
              <DebtCard key={d.id} d={d} wallets={wallets} />
            ))}
          </div>
        )}
      </section>

      {/* Form Tambah */}
      <AddDebtForm wallets={wallets} />
    </div>
  );
}
