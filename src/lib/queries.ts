import { db } from "./db";
import { currentPeriod, shiftPeriod, todayISO } from "./format";

export type Wallet = { id: number; name: string; type: string; initial_balance: number; balance: number };
export type Category = { id: number; name: string; kind: "income" | "expense" };
export type Tx = {
  id: number; type: "income" | "expense" | "transfer"; amount: number; wallet_id: number;
  to_wallet_id: number | null; category_id: number | null; note: string; date: string;
  schedule_id: number | null; created_by: number | null; creator_name: string | null; wallet_name: string; to_wallet_name: string | null; category_name: string | null;
};
export type Schedule = {
  id: number; name: string; kind: "income" | "expense"; amount: number; day_of_month: number;
  wallet_id: number | null; wallet_name: string | null; category_id: number | null; active: number;
};
export type Pending = {
  schedule_id: number; name: string; kind: "income" | "expense"; amount: number; period: string;
  due: string; overdue: boolean; wallet_id: number | null; category_id: number | null;
};

export function getWallets(): Wallet[] {
  return db.prepare(`
    SELECT w.id, w.name, w.type, w.initial_balance,
      w.initial_balance
      + COALESCE((SELECT SUM(amount) FROM transactions WHERE wallet_id = w.id AND type = 'income'), 0)
      - COALESCE((SELECT SUM(amount) FROM transactions WHERE wallet_id = w.id AND type IN ('expense','transfer')), 0)
      + COALESCE((SELECT SUM(amount) FROM transactions WHERE to_wallet_id = w.id AND type = 'transfer'), 0)
      AS balance
    FROM wallets w WHERE w.archived = 0 ORDER BY w.id
  `).all() as Wallet[];
}

export function getCategories(): Category[] {
  return db.prepare("SELECT id, name, kind FROM categories ORDER BY kind, name").all() as Category[];
}

export type TxFilter = { q?: string; wallet?: number; category?: number; member?: number };

export function getTransactions(period?: string, limit = 500, f: TxFilter = {}): Tx[] {
  const cond: string[] = [];
  const args: (string | number)[] = [];
  if (period) { cond.push("t.date LIKE ?"); args.push(period + "-%"); }
  if (f.q) { cond.push("(t.note LIKE ? OR c.name LIKE ?)"); args.push(`%${f.q}%`, `%${f.q}%`); }
  if (f.wallet) { cond.push("(t.wallet_id = ? OR t.to_wallet_id = ?)"); args.push(f.wallet, f.wallet); }
  if (f.category) { cond.push("t.category_id = ?"); args.push(f.category); }
  if (f.member) { cond.push("t.created_by = ?"); args.push(f.member); }
  const where = cond.length ? "WHERE " + cond.join(" AND ") : "";
  return db.prepare(`
    SELECT t.*, w.name AS wallet_name, w2.name AS to_wallet_name, c.name AS category_name, m.name AS creator_name
    FROM transactions t
    JOIN wallets w ON w.id = t.wallet_id
    LEFT JOIN wallets w2 ON w2.id = t.to_wallet_id
    LEFT JOIN categories c ON c.id = t.category_id
    LEFT JOIN members m ON m.id = t.created_by
    ${where}
    ORDER BY t.date DESC, t.id DESC LIMIT ${limit}
  `).all(...args) as Tx[];
}

export type Member = { id: number; name: string };
export function getMembers(): Member[] {
  return db.prepare("SELECT id, name FROM members ORDER BY id").all() as Member[];
}

export function getMonthSummary(period: string) {
  const rows = db.prepare(`
    SELECT type, SUM(amount) AS total FROM transactions
    WHERE date LIKE ? AND type IN ('income','expense') GROUP BY type
  `).all(period + "-%") as { type: string; total: number }[];
  const income = rows.find((r) => r.type === "income")?.total ?? 0;
  const expense = rows.find((r) => r.type === "expense")?.total ?? 0;
  return { income, expense, net: income - expense };
}

export function getCategoryBreakdown(period: string) {
  return db.prepare(`
    SELECT COALESCE(c.name, 'Tanpa kategori') AS name, SUM(t.amount) AS total
    FROM transactions t LEFT JOIN categories c ON c.id = t.category_id
    WHERE t.type = 'expense' AND t.date LIKE ?
    GROUP BY name ORDER BY total DESC LIMIT 6
  `).all(period + "-%") as { name: string; total: number }[];
}

export function getMonthlyTrend(months = 6) {
  const end = currentPeriod();
  const out: { period: string; income: number; expense: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const p = shiftPeriod(end, -i);
    const s = getMonthSummary(p);
    out.push({ period: p, income: s.income, expense: s.expense });
  }
  return out;
}

export function getSchedules(): Schedule[] {
  return db.prepare(`
    SELECT s.*, w.name AS wallet_name FROM schedules s
    LEFT JOIN wallets w ON w.id = s.wallet_id ORDER BY s.kind, s.day_of_month
  `).all() as Schedule[];
}

function dueDate(period: string, day: number) {
  const [y, m] = period.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  return `${period}-${String(Math.min(day, last)).padStart(2, "0")}`;
}

/** Jadwal tetap yang belum dikonfirmasi (belum diterima/dibayar) pada periode berjalan dan sebelumnya. */
export function getPending(): Pending[] {
  const cur = currentPeriod();
  const today = todayISO();
  const scheds = db.prepare("SELECT * FROM schedules WHERE active = 1").all() as (Schedule & { start_period: string })[];
  const done = new Set(
    (db.prepare("SELECT schedule_id, period FROM transactions WHERE schedule_id IS NOT NULL").all() as { schedule_id: number; period: string }[])
      .map((r) => `${r.schedule_id}|${r.period}`)
  );
  for (const r of db.prepare("SELECT schedule_id, period FROM schedule_skips").all() as { schedule_id: number; period: string }[])
    done.add(`${r.schedule_id}|${r.period}`);

  const out: Pending[] = [];
  for (const s of scheds) {
    let p = s.start_period < shiftPeriod(cur, -5) ? shiftPeriod(cur, -5) : s.start_period;
    while (p <= cur) {
      if (!done.has(`${s.id}|${p}`)) {
        const due = dueDate(p, s.day_of_month);
        out.push({
          schedule_id: s.id, name: s.name, kind: s.kind, amount: s.amount, period: p, due,
          overdue: due < today, wallet_id: s.wallet_id, category_id: s.category_id,
        });
      }
      p = shiftPeriod(p, 1);
    }
  }
  return out.sort((a, b) => a.due.localeCompare(b.due));
}


