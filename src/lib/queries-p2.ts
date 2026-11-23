import { db } from "./db";
import { currentPeriod, shiftPeriod, todayISO } from "./format";
import { getMonthSummary, getPending, getWallets } from "./queries";

export type Debt = {
  id: number; kind: "payable" | "receivable"; party: string; principal: number; installment: number;
  due_day: number | null; due_date: string | null; note: string; paid: number; remaining: number;
  nextDue: string | null; status: "lunas" | "overdue" | "soon" | "ok" | "none"; daysLeft: number | null;
};

function lastDay(period: string) {
  const [y, m] = period.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}
const diffDays = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  const [ty, tm, td] = todayISO().split("-").map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(ty, tm - 1, td)) / 86400000);
};

export function getDebts(): Debt[] {
  const rows = db.prepare(`
    SELECT d.*, COALESCE((SELECT SUM(amount) FROM transactions WHERE debt_id = d.id), 0) AS paid
    FROM debts d ORDER BY d.id DESC
  `).all() as (Omit<Debt, "remaining" | "nextDue" | "status" | "daysLeft">)[];
  const cur = currentPeriod();
  return rows.map((d) => {
    const remaining = Math.max(0, d.principal - d.paid);
    let nextDue: string | null = null;
    if (remaining > 0) {
      if (d.due_day) {
        const paidThisMonth = (db.prepare(
          "SELECT COALESCE(SUM(amount),0) AS s FROM transactions WHERE debt_id = ? AND date LIKE ?"
        ).get(d.id, cur + "-%") as { s: number }).s;
        const covered = d.installment > 0 && paidThisMonth >= d.installment;
        const p = covered ? shiftPeriod(cur, 1) : cur;
        nextDue = `${p}-${String(Math.min(d.due_day, lastDay(p))).padStart(2, "0")}`;
      } else if (d.due_date) nextDue = d.due_date;
    }
    const daysLeft = nextDue ? diffDays(nextDue) : null;
    const status: Debt["status"] = remaining === 0 ? "lunas" : daysLeft === null ? "none" : daysLeft < 0 ? "overdue" : daysLeft <= 7 ? "soon" : "ok";
    return { ...d, remaining, nextDue, status, daysLeft };
  });
}

export type Goal = { id: number; name: string; target: number; target_date: string | null; saved: number };
export function getGoals(): Goal[] {
  return db.prepare(`
    SELECT g.*, COALESCE((SELECT SUM(amount) FROM goal_entries WHERE goal_id = g.id), 0) AS saved
    FROM goals g ORDER BY g.id
  `).all() as Goal[];
}

export type Investment = { id: number; name: string; type: string; invested: number; current_value: number; updated_at: string };
export function getInvestments(): Investment[] {
  return db.prepare("SELECT * FROM investments ORDER BY id").all() as Investment[];
}

export type Wish = {
  id: number; name: string; price: number; priority: "need" | "want"; url: string; goal_id: number | null;
  bought: number; goal_name: string | null; saved: number; months: number | null;
};

/** Rata-rata selisih bersih (masuk - keluar) 3 bulan terakhir yang sudah berjalan. */
export function getAvgNet(): number {
  const cur = currentPeriod();
  const nets = [1, 2, 3].map((i) => getMonthSummary(shiftPeriod(cur, -i)).net);
  return Math.round(nets.reduce((a, b) => a + b, 0) / 3);
}

export function getWishes(): Wish[] {
  const avg = getAvgNet();
  const rows = db.prepare(`
    SELECT w.*, g.name AS goal_name,
      COALESCE((SELECT SUM(amount) FROM goal_entries WHERE goal_id = w.goal_id), 0) AS saved
    FROM wishes w LEFT JOIN goals g ON g.id = w.goal_id
    ORDER BY w.bought, CASE w.priority WHEN 'need' THEN 0 ELSE 1 END, w.id
  `).all() as Omit<Wish, "months">[];
  return rows.map((w) => {
    const need = Math.max(0, w.price - w.saved);
    const months = need === 0 ? 0 : avg > 0 ? Math.ceil(need / avg) : null;
    return { ...w, months };
  });
}

export function getDebtTotals() {
  const debts = getDebts();
  const payable = debts.filter((d) => d.kind === "payable").reduce((s, d) => s + d.remaining, 0);
  const receivable = debts.filter((d) => d.kind === "receivable").reduce((s, d) => s + d.remaining, 0);
  const attention = debts.filter((d) => d.kind === "payable" && (d.status === "overdue" || d.status === "soon"));
  return { payable, receivable, attention };
}

/** "Uang dingin": saldo kas dikurangi yang sudah "bertuan" bulan ini. */
export function getSafeToSpend() {
  const wallets = getWallets().filter((w) => w.type !== "invest");
  const cash = wallets.reduce((s, w) => s + w.balance, 0);
  const earmarked = getGoals().reduce((s, g) => s + g.saved, 0);
  const cur = currentPeriod();
  const endOfMonth = `${cur}-31`;
  const debtDue = getDebts()
    .filter((d) => d.kind === "payable" && d.remaining > 0 && d.nextDue && d.nextDue <= endOfMonth)
    .reduce((s, d) => s + (d.installment > 0 ? Math.min(d.installment, d.remaining) : d.remaining), 0);
  const billsDue = getPending().filter((p) => p.kind === "expense").reduce((s, p) => s + p.amount, 0);
  return { cash, earmarked, debtDue, billsDue, safe: cash - earmarked - debtDue - billsDue };
}

