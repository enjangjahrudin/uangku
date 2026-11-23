"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { todayISO } from "@/lib/format";
import { currentMemberId } from "@/lib/member";

const num = (v: FormDataEntryValue | null) => parseInt(String(v ?? "").replace(/\D/g, ""), 10) || 0;
const str = (v: FormDataEntryValue | null) => String(v ?? "").trim();
const idOrNull = (v: FormDataEntryValue | null) => { const n = parseInt(String(v ?? ""), 10); return n > 0 ? n : null; };
const refresh = () => revalidatePath("/", "layout");

// ---------- Hutang & piutang ----------
export async function addDebt(fd: FormData) {
  const kind = str(fd.get("kind")) === "receivable" ? "receivable" : "payable";
  const party = str(fd.get("party"));
  const principal = num(fd.get("principal"));
  if (!party || !principal) return;
  const day = num(fd.get("due_day"));
  const res = db.prepare(`INSERT INTO debts (kind, party, principal, installment, due_day, due_date, note, created_at)
    VALUES (?,?,?,?,?,?,?,?)`).run(
    kind, party, principal, num(fd.get("installment")), day >= 1 && day <= 31 ? day : null,
    str(fd.get("due_date")) || null, str(fd.get("note")), todayISO()
  );
  // Opsional: uang pinjaman benar-benar baru diterima/diberikan sekarang -> catat ke dompet
  const wallet = idOrNull(fd.get("wallet_id"));
  if (wallet && fd.get("record_cash")) {
    db.prepare(`INSERT INTO transactions (type, amount, wallet_id, note, date, debt_id) VALUES (?,?,?,?,?,NULL)`).run(
      kind === "payable" ? "income" : "expense", principal, wallet,
      kind === "payable" ? `Pinjaman dari ${party}` : `Meminjamkan ke ${party}`, todayISO()
    );
  }
  void res;
  refresh();
}

export async function payDebt(fd: FormData) {
  const id = idOrNull(fd.get("debt_id"));
  const wallet = idOrNull(fd.get("wallet_id"));
  let amount = num(fd.get("amount"));
  if (!id || !wallet || !amount) return;
  const d = db.prepare(`SELECT kind, party, principal,
      COALESCE((SELECT SUM(amount) FROM transactions WHERE debt_id = debts.id),0) AS paid
      FROM debts WHERE id = ?`).get(id) as { kind: string; party: string; principal: number; paid: number } | undefined;
  if (!d) return;
  amount = Math.min(amount, d.principal - d.paid);
  if (amount <= 0) return;
  db.prepare(`INSERT INTO transactions (type, amount, wallet_id, note, date, debt_id, created_by) VALUES (?,?,?,?,?,?,?)`).run(
    d.kind === "payable" ? "expense" : "income", amount, wallet,
    d.kind === "payable" ? `Bayar hutang: ${d.party}` : `Terima piutang: ${d.party}`,
    str(fd.get("date")) || todayISO(), id, await currentMemberId()
  );
  refresh();
}

export async function updateDebt(fd: FormData) {
  const id = idOrNull(fd.get("debt_id"));
  if (!id) return;
  const kind = str(fd.get("kind")) === "receivable" ? "receivable" : "payable";
  const party = str(fd.get("party"));
  const principal = num(fd.get("principal"));
  if (!party || !principal) return;
  const day = num(fd.get("due_day"));
  db.prepare(`UPDATE debts SET kind = ?, party = ?, principal = ?, installment = ?, due_day = ?, due_date = ?, note = ? WHERE id = ?`).run(
    kind, party, principal, num(fd.get("installment")), day >= 1 && day <= 31 ? day : null,
    str(fd.get("due_date")) || null, str(fd.get("note")), id
  );
  refresh();
}

export async function deleteDebt(id: number) {
  db.prepare("UPDATE transactions SET debt_id = NULL WHERE debt_id = ?").run(id);
  db.prepare("DELETE FROM debts WHERE id = ?").run(id);
  refresh();
}

// ---------- Tabungan (pos) ----------
export async function addGoal(fd: FormData) {
  const name = str(fd.get("name"));
  const target = num(fd.get("target"));
  if (!name || !target) return;
  const g = db.prepare("INSERT INTO goals (name, target, target_date) VALUES (?,?,?)").run(name, target, str(fd.get("target_date")) || null);
  const initial = num(fd.get("initial"));
  if (initial > 0) db.prepare("INSERT INTO goal_entries (goal_id, amount, date, note) VALUES (?,?,?,?)").run(Number(g.lastInsertRowid), initial, todayISO(), "Saldo awal");
  refresh();
}

export async function goalEntry(fd: FormData) {
  const id = idOrNull(fd.get("goal_id"));
  const amount = num(fd.get("amount"));
  if (!id || !amount) return;
  const sign = str(fd.get("dir")) === "out" ? -1 : 1;
  if (sign < 0) {
    const s = db.prepare("SELECT COALESCE(SUM(amount),0) AS s FROM goal_entries WHERE goal_id = ?").get(id) as { s: number };
    if (amount > s.s) return;
  }
  db.prepare("INSERT INTO goal_entries (goal_id, amount, date, note) VALUES (?,?,?,?)").run(id, sign * amount, todayISO(), str(fd.get("note")));
  refresh();
}

export async function deleteGoal(id: number) {
  db.prepare("DELETE FROM goals WHERE id = ?").run(id);
  refresh();
}

// ---------- Investasi ----------
export async function addInvestment(fd: FormData) {
  const name = str(fd.get("name"));
  if (!name) return;
  const invested = num(fd.get("invested"));
  const value = num(fd.get("current_value")) || invested;
  db.prepare("INSERT INTO investments (name, type, invested, current_value, updated_at) VALUES (?,?,?,?,?)")
    .run(name, str(fd.get("type")) || "reksadana", invested, value, todayISO());
  refresh();
}

export async function updateInvestment(fd: FormData) {
  const id = idOrNull(fd.get("id"));
  if (!id) return;
  const addCapital = num(fd.get("add_capital"));
  const value = num(fd.get("current_value"));
  db.prepare(`UPDATE investments SET invested = invested + ?, current_value = CASE WHEN ? > 0 THEN ? ELSE current_value + ? END, updated_at = ? WHERE id = ?`)
    .run(addCapital, value, value, addCapital, todayISO(), id);
  refresh();
}

export async function deleteInvestment(id: number) {
  db.prepare("DELETE FROM investments WHERE id = ?").run(id);
  refresh();
}

// ---------- Wishlist ----------
export async function addWish(fd: FormData) {
  const name = str(fd.get("name"));
  const price = num(fd.get("price"));
  if (!name || !price) return;
  db.prepare("INSERT INTO wishes (name, price, priority, url, goal_id) VALUES (?,?,?,?,?)")
    .run(name, price, str(fd.get("priority")) === "need" ? "need" : "want", str(fd.get("url")), idOrNull(fd.get("goal_id")));
  refresh();
}

export async function setWishBought(id: number, bought: boolean) {
  db.prepare("UPDATE wishes SET bought = ? WHERE id = ?").run(bought ? 1 : 0, id);
  refresh();
}

export async function deleteWish(id: number) {
  db.prepare("DELETE FROM wishes WHERE id = ?").run(id);
  refresh();
}

