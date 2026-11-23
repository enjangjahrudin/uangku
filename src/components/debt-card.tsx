"use client";

import { useState } from "react";
import { deleteDebt, payDebt } from "@/app/actions-p2";
import { AmountInput } from "@/components/amount-input";
import { Money } from "@/components/privacy";
import { dateLabel, todayISO } from "@/lib/format";
import type { Debt } from "@/lib/queries-p2";
import type { Wallet } from "@/lib/queries";

const STATUS_BADGE: Record<Debt["status"], { label: (d: Debt) => string; cls: string }> = {
  lunas: { label: () => "✓ Lunas", cls: "bg-brand-soft text-brand font-bold" },
  overdue: { label: (d) => `⚠️ Terlambat ${Math.abs(d.daysLeft!)} hari`, cls: "bg-out-soft text-out font-bold" },
  soon: { label: (d) => (d.daysLeft === 0 ? "🔔 Jatuh tempo hari ini" : `⏳ ${d.daysLeft} hari lagi`), cls: "bg-warn-soft text-warn font-semibold" },
  ok: { label: (d) => `Jatuh tempo ${dateLabel(d.nextDue!)}`, cls: "bg-bg text-muted border border-line" },
  none: { label: () => "Bebas / Tanpa Tempo", cls: "bg-bg text-muted border border-line" },
};

export function DebtCard({ d, wallets }: { d: Debt; wallets: Wallet[] }) {
  const [payAmount, setPayAmount] = useState<number>(
    d.installment > 0 ? Math.min(d.installment, d.remaining) : d.remaining
  );
  const [isOpen, setIsOpen] = useState(false);

  const pct = Math.min(100, Math.round((d.paid / d.principal) * 100));
  const badge = STATUS_BADGE[d.status];
  const payable = d.kind === "payable";

  return (
    <div className="card p-4 space-y-3">
      {/* Header card */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold text-base truncate">{d.party}</div>
          {d.note && <div className="text-xs text-muted truncate mt-0.5">{d.note}</div>}
        </div>
        <span className={`text-[11px] rounded-full px-2.5 py-0.5 shrink-0 ${badge.cls}`}>
          {badge.label(d)}
        </span>
      </div>

      {/* Saldo & Skema */}
      <div className="flex items-end justify-between border-t border-line/60 pt-2.5">
        <div>
          <div className="text-xs text-muted">Sisa Tagihan</div>
          <Money value={d.remaining} className={`text-xl font-bold ${d.remaining === 0 ? "text-brand" : "text-ink"}`} />
        </div>
        <div className="text-right text-xs text-muted">
          <div>Total awal: <Money value={d.principal} /></div>
          {d.installment > 0 ? (
            <div className="text-ink font-medium">Cicilan: <Money value={d.installment} />/bln</div>
          ) : (
            <div className="text-muted italic">Pembayaran bebas</div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="h-1.5 rounded-full bg-line overflow-hidden">
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-[11px] text-muted mt-1">
          <span>{pct}% {payable ? "terbayar" : "diterima"}</span>
          <span>Sudah dibayar: <Money value={d.paid} /></span>
        </div>
      </div>

      {/* Aksi Pembayaran */}
      <div className="border-t border-line/70 pt-2.5">
        {!isOpen ? (
          <div className="flex items-center gap-2">
            {d.remaining > 0 && wallets.length > 0 && (
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="btn btn-primary flex-1 !py-2 text-xs"
              >
                {payable ? "Catat Pembayaran" : "Catat Pelunasan Diterima"}
              </button>
            )}
            <form action={deleteDebt.bind(null, d.id)}>
              <button
                className="btn !py-2 text-xs !text-muted hover:!text-out hover:border-out-soft"
                title="Hapus catatan ini"
              >
                Hapus
              </button>
            </form>
          </div>
        ) : (
          <form action={payDebt} onSubmit={() => setIsOpen(false)} className="space-y-3 bg-bg/60 p-3 rounded-xl border border-line">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink">
                {payable ? "Pembayaran Hutang" : "Penerimaan Piutang"}
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs text-muted hover:text-ink font-medium"
              >
                Batal
              </button>
            </div>

            <input type="hidden" name="debt_id" value={d.id} />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label !mb-0">Nominal yang Dibayar</label>
                <button
                  type="button"
                  onClick={() => setPayAmount(d.remaining)}
                  className="text-[11px] text-brand font-semibold hover:underline"
                >
                  Lunasi Sisa (Rp{d.remaining.toLocaleString("id-ID")})
                </button>
              </div>
              <AmountInput key={payAmount} defaultValue={payAmount} autoFocus />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">{payable ? "Sumber Dompet" : "Masuk ke Dompet"}</label>
                <select name="wallet_id" className="input !py-1.5 text-xs">
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Tanggal Bayar</label>
                <input type="date" name="date" defaultValue={todayISO()} className="input !py-1.5 text-xs" />
              </div>
            </div>

            <button className="btn btn-primary w-full !py-2 text-xs shadow-xs">
              Simpan Pembayaran
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
