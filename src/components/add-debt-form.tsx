"use client";

import { useState } from "react";
import { addDebt } from "@/app/actions-p2";
import { AmountInput } from "@/components/amount-input";
import type { Wallet } from "@/lib/queries";

type PaymentType = "flexible" | "installment" | "deadline";

export function AddDebtForm({ wallets }: { wallets: Wallet[] }) {
  const [payType, setPayType] = useState<PaymentType>("flexible");
  const [kind, setKind] = useState<"payable" | "receivable">("payable");

  return (
    <form action={addDebt} className="card p-5 space-y-4 max-w-lg">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <h2 className="font-semibold text-base">Tambah Catatan Hutang / Piutang</h2>
        <span className="text-xs text-muted">Bebas cicilan atau berjadwal</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Jenis</label>
          <select
            name="kind"
            value={kind}
            onChange={(e) => setKind(e.target.value as "payable" | "receivable")}
            className="input font-medium"
          >
            <option value="payable">Hutang Saya (Kewajiban)</option>
            <option value="receivable">Piutang (Orang Pinjam ke Saya)</option>
          </select>
        </div>
        <div>
          <label className="label">{kind === "payable" ? "Pemberi Pinjaman" : "Nama Peminjam"}</label>
          <input name="party" required placeholder="mis. Teman, Keluarga, Bank" className="input" />
        </div>
      </div>

      <div>
        <label className="label">Total Pokok (Sisa Saldo Saat Ini)</label>
        <AmountInput name="principal" />
      </div>

      {/* Tipe Pembayaran */}
      <div>
        <label className="label">Skema Pembayaran</label>
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-bg border border-line text-xs font-semibold">
          <button
            type="button"
            onClick={() => setPayType("flexible")}
            className={`py-2 px-1 rounded-lg transition-all text-center ${payType === "flexible" ? "bg-surface shadow-xs text-brand font-bold" : "text-muted hover:text-ink"}`}
          >
            Bebas / Fleksibel
          </button>
          <button
            type="button"
            onClick={() => setPayType("installment")}
            className={`py-2 px-1 rounded-lg transition-all text-center ${payType === "installment" ? "bg-surface shadow-xs text-brand font-bold" : "text-muted hover:text-ink"}`}
          >
            Cicilan Bulanan
          </button>
          <button
            type="button"
            onClick={() => setPayType("deadline")}
            className={`py-2 px-1 rounded-lg transition-all text-center ${payType === "deadline" ? "bg-surface shadow-xs text-brand font-bold" : "text-muted hover:text-ink"}`}
          >
            Tenggat Lunas
          </button>
        </div>
      </div>

      {/* Field Kondisional berdasarkan Skema */}
      {payType === "flexible" && (
        <div className="rounded-lg bg-bg/80 border border-line p-3 text-xs text-muted leading-relaxed">
          💡 <b>Pembayaran bebas:</b> Tanpa cicilan tetap dan tanpa batas tanggal jatuh tempo. Anda dapat mencatat pembayaran dengan nominal berapa pun kapan saja saat ada rezeki.
        </div>
      )}

      {payType === "installment" && (
        <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-bg/50 border border-line">
          <div>
            <label className="label">Cicilan per Bulan</label>
            <AmountInput name="installment" />
          </div>
          <div>
            <label className="label">Tanggal Jatuh Tempo (1–31)</label>
            <input name="due_day" type="number" min={1} max={31} placeholder="mis. 5 atau 25" className="input" />
          </div>
        </div>
      )}

      {payType === "deadline" && (
        <div className="p-3 rounded-lg bg-bg/50 border border-line">
          <label className="label">Tanggal Batas Akhir Pelunasan</label>
          <input name="due_date" type="date" className="input" />
        </div>
      )}

      <div>
        <label className="label">Catatan Tambahan (Opsional)</label>
        <input name="note" placeholder="mis. Pinjaman tanpa bunga untuk modal usaha" className="input" />
      </div>

      {wallets.length > 0 && (
        <div className="rounded-lg bg-bg border border-line p-3 space-y-2">
          <label className="flex items-start gap-2 text-xs">
            <input type="checkbox" name="record_cash" className="mt-0.5" />
            <span className="text-ink">
              <b>Uang pinjaman baru diterima/diberikan sekarang</b> — langsung catat ke saldo dompet:
            </span>
          </label>
          <select name="wallet_id" className="input text-xs">
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({kind === "payable" ? "Uang masuk ke sini" : "Uang keluar dari sini"})
              </option>
            ))}
          </select>
        </div>
      )}

      <button className="btn btn-primary w-full !py-2.5 shadow-sm">Simpan Catatan</button>
    </form>
  );
}
