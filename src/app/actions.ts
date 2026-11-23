"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { currentPeriod, todayISO } from "@/lib/format";
import { currentMemberId } from "@/lib/member";

const num = (v: FormDataEntryValue | null) => parseInt(String(v ?? "").replace(/\D/g, ""), 10) || 0;
const str = (v: FormDataEntryValue | null) => String(v ?? "").trim();
const idOrNull = (v: FormDataEntryValue | null) => { const n = parseInt(String(v ?? ""), 10); return n > 0 ? n : null; };
const refresh = () => revalidatePath("/", "layout");

export async function addTransaction(fd: FormData) {
  const type = str(fd.get("type")) as "income" | "expense" | "transfer";
  const amount = num(fd.get("amount"));
  const wallet = idOrNull(fd.get("wallet_id"));
  if (!amount || !wallet || !["income", "expense", "transfer"].includes(type)) return;
  const to = type === "transfer" ? idOrNull(fd.get("to_wallet_id")) : null;
  if (type === "transfer" && (!to || to === wallet)) return;
  db.prepare(`INSERT INTO transactions (type, amount, wallet_id, to_wallet_id, category_id, note, date, created_by)
    VALUES (?,?,?,?,?,?,?,?)`).run(
    type, amount, wallet, to, type === "transfer" ? null : idOrNull(fd.get("category_id")),
    str(fd.get("note")), str(fd.get("date")) || todayISO(), await currentMemberId()
  );
  refresh();
}

export async function deleteTransaction(id: number) {
  db.prepare("DELETE FROM transactions WHERE id = ?").run(id);
  refresh();
}

export async function addWallet(fd: FormData) {
  const name = str(fd.get("name"));
  if (!name) return;
  db.prepare("INSERT INTO wallets (name, type, initial_balance) VALUES (?,?,?)")
    .run(name, str(fd.get("type")) || "bank", num(fd.get("initial_balance")));
  refresh();
}

export async function archiveWallet(id: number) {
  db.prepare("UPDATE wallets SET archived = 1 WHERE id = ?").run(id);
  refresh();
}

export async function addSchedule(fd: FormData) {
  const name = str(fd.get("name"));
  const amount = num(fd.get("amount"));
  const kind = str(fd.get("kind")) === "expense" ? "expense" : "income";
  const day = Math.min(31, Math.max(1, num(fd.get("day_of_month")) || 1));
  if (!name || !amount) return;
  db.prepare(`INSERT INTO schedules (name, kind, amount, day_of_month, wallet_id, category_id, start_period)
    VALUES (?,?,?,?,?,?,?)`).run(name, kind, amount, day, idOrNull(fd.get("wallet_id")), idOrNull(fd.get("category_id")), currentPeriod());
  refresh();
}

export async function deleteSchedule(id: number) {
  db.prepare("DELETE FROM schedules WHERE id = ?").run(id);
  refresh();
}

export async function toggleSchedule(id: number, active: boolean) {
  db.prepare("UPDATE schedules SET active = ? WHERE id = ?").run(active ? 1 : 0, id);
  refresh();
}

/** Konfirmasi: gaji benar-benar diterima / tagihan benar-benar dibayar. Saldo baru berubah di sini. */
export async function confirmOccurrence(fd: FormData) {
  const sid = idOrNull(fd.get("schedule_id"));
  const period = str(fd.get("period"));
  const amount = num(fd.get("amount"));
  const wallet = idOrNull(fd.get("wallet_id"));
  if (!sid || !period || !amount || !wallet) return;
  const s = db.prepare("SELECT name, kind, category_id FROM schedules WHERE id = ?").get(sid) as
    | { name: string; kind: string; category_id: number | null } | undefined;
  if (!s) return;
  const exists = db.prepare("SELECT 1 FROM transactions WHERE schedule_id = ? AND period = ?").get(sid, period);
  if (exists) return;
  db.prepare(`INSERT INTO transactions (type, amount, wallet_id, category_id, note, date, schedule_id, period, created_by)
    VALUES (?,?,?,?,?,?,?,?,?)`).run(s.kind, amount, wallet, s.category_id, s.name, str(fd.get("date")) || todayISO(), sid, period, await currentMemberId());
  refresh();
}

export async function skipOccurrence(scheduleId: number, period: string) {
  db.prepare("INSERT OR IGNORE INTO schedule_skips (schedule_id, period) VALUES (?,?)").run(scheduleId, period);
  refresh();
}

export async function addCategory(fd: FormData) {
  const name = str(fd.get("name"));
  const kind = str(fd.get("kind")) === "income" ? "income" : "expense";
  if (!name) return;
  db.prepare("INSERT INTO categories (name, kind) VALUES (?,?)").run(name, kind);
  refresh();
}

export async function deleteCategory(id: number) {
  db.prepare("UPDATE transactions SET category_id = NULL WHERE category_id = ?").run(id);
  db.prepare("UPDATE schedules SET category_id = NULL WHERE category_id = ?").run(id);
  db.prepare("DELETE FROM categories WHERE id = ?").run(id);
  refresh();
}

