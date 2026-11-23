"use client";

import { useState, useTransition } from "react";
import { confirmOccurrence, skipOccurrence } from "@/app/actions";
import { AmountInput } from "./amount-input";
import { Money } from "./privacy";
import { dateLabel, periodLabel, todayISO } from "@/lib/format";
import type { Pending, Wallet } from "@/lib/queries";

export function PendingItem({ p, wallets }: { p: Pending; wallets: Wallet[] }) {
  const [open, setOpen] = useState(false);
  const [busy, start] = useTransition();
  const income = p.kind === "income";

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold truncate">{p.name}</div>
          <div className={`text-xs mt-0.5 ${p.overdue ? "text-warn font-semibold" : "text-muted"}`}>
            {periodLabel(p.period)} · {income ? "estimasi cair" : "jatuh tempo"} {dateLabel(p.due)}{p.overdue && " · terlewat"}
          </div>
        </div>
        <div className="text-right shrink-0">
          <Money value={p.amount} className={`font-semibold ${income ? "text-in" : "text-out"}`} />
          <div className="text-[11px] text-muted">{income ? "belum diterima" : "belum dibayar"}</div>
        </div>
      </div>
      {!open ? (
        <div className="flex gap-2 mt-3">
          <button className="btn btn-primary flex-1" onClick={() => setOpen(true)}>{income ? "Tandai sudah diterima" : "Tandai sudah dibayar"}</button>
          <button className="btn" disabled={busy} onClick={() => start(() => skipOccurrence(p.schedule_id, p.period))}>Lewati</button>
        </div>
      ) : (
        <form action={(fd) => start(async () => { await confirmOccurrence(fd); })} className="mt-3 space-y-3 border-t border-line pt-3">
          <input type="hidden" name="schedule_id" value={p.schedule_id} />
          <input type="hidden" name="period" value={p.period} />
          <div>
            <label className="label">{income ? "Nominal yang benar-benar diterima" : "Nominal yang dibayar"}</label>
            <AmountInput defaultValue={p.amount} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{income ? "Masuk ke" : "Dibayar dari"}</label>
              <select name="wallet_id" className="input" defaultValue={p.wallet_id ?? wallets[0]?.id}>
                {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div><label className="label">Tanggal</label><input type="date" name="date" defaultValue={todayISO()} className="input" /></div>
          </div>
          <div className="flex gap-2">
            <button disabled={busy} className="btn btn-primary flex-1">{busy ? "Menyimpan…" : "Konfirmasi"}</button>
            <button type="button" className="btn" onClick={() => setOpen(false)}>Batal</button>
          </div>
        </form>
      )}
    </div>
  );
}
