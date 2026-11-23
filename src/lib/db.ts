import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const globalForDb = globalThis as unknown as { __db2?: DatabaseSync };

function init(): DatabaseSync {
  const dir = path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  const db = new DatabaseSync(path.join(dir, "uangku.db"));
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  db.exec(`
    CREATE TABLE IF NOT EXISTS wallets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'bank',
      initial_balance INTEGER NOT NULL DEFAULT 0,
      archived INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      kind TEXT NOT NULL CHECK (kind IN ('income','expense'))
    );
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      kind TEXT NOT NULL CHECK (kind IN ('income','expense')),
      amount INTEGER NOT NULL,
      day_of_month INTEGER NOT NULL,
      wallet_id INTEGER REFERENCES wallets(id),
      category_id INTEGER REFERENCES categories(id),
      active INTEGER NOT NULL DEFAULT 1,
      start_period TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK (type IN ('income','expense','transfer')),
      amount INTEGER NOT NULL CHECK (amount > 0),
      wallet_id INTEGER NOT NULL REFERENCES wallets(id),
      to_wallet_id INTEGER REFERENCES wallets(id),
      category_id INTEGER REFERENCES categories(id),
      note TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL,
      schedule_id INTEGER REFERENCES schedules(id) ON DELETE SET NULL,
      period TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_tx_date ON transactions(date);
    CREATE TABLE IF NOT EXISTS schedule_skips (
      schedule_id INTEGER NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
      period TEXT NOT NULL,
      PRIMARY KEY (schedule_id, period)
    );
  `);

  // ---- Fase 2: hutang/piutang, tabungan, investasi, wishlist ----
  db.exec(`
    CREATE TABLE IF NOT EXISTS debts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kind TEXT NOT NULL CHECK (kind IN ('payable','receivable')),
      party TEXT NOT NULL,
      principal INTEGER NOT NULL CHECK (principal > 0),
      installment INTEGER NOT NULL DEFAULT 0,
      due_day INTEGER,
      due_date TEXT,
      note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      target INTEGER NOT NULL CHECK (target > 0),
      target_date TEXT
    );
    CREATE TABLE IF NOT EXISTS goal_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
      amount INTEGER NOT NULL,
      date TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS investments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'reksadana',
      invested INTEGER NOT NULL DEFAULT 0,
      current_value INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS wishes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price INTEGER NOT NULL CHECK (price > 0),
      priority TEXT NOT NULL DEFAULT 'want' CHECK (priority IN ('need','want')),
      url TEXT NOT NULL DEFAULT '',
      goal_id INTEGER REFERENCES goals(id) ON DELETE SET NULL,
      bought INTEGER NOT NULL DEFAULT 0
    );
  `);
  const txCols = db.prepare("PRAGMA table_info(transactions)").all() as { name: string }[];
  if (!txCols.some((c) => c.name === "debt_id"))
    db.exec("ALTER TABLE transactions ADD COLUMN debt_id INTEGER REFERENCES debts(id)");

  // ---- Fase 3: anggota keluarga & login PIN ----
  db.exec(`CREATE TABLE IF NOT EXISTS members (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, pin TEXT)`);
  const memberCols = db.prepare("PRAGMA table_info(members)").all() as { name: string }[];
  if (!memberCols.some((c) => c.name === "pin"))
    db.exec("ALTER TABLE members ADD COLUMN pin TEXT");

  if (!txCols.some((c) => c.name === "created_by"))
    db.exec("ALTER TABLE transactions ADD COLUMN created_by INTEGER REFERENCES members(id)");

  const count = db.prepare("SELECT COUNT(*) AS c FROM categories").get() as { c: number };
  if (count.c === 0) {
    const ins = db.prepare("INSERT INTO categories (name, kind) VALUES (?, ?)");
    for (const n of ["Gaji", "Bonus", "Freelance", "Hadiah", "Lainnya"]) ins.run(n, "income");
    for (const n of [
      "Makan & Minum", "Belanja Dapur", "Transportasi", "Tagihan & Utilitas",
      "Rumah Tangga", "Kesehatan", "Pendidikan", "Hiburan", "Belanja", "Lainnya",
    ]) ins.run(n, "expense");
  }
  return db;
}

/** node:sqlite mengembalikan objek null-prototype; ubah jadi objek biasa agar bisa dikirim ke Client Components. */
function plain(db: DatabaseSync): DatabaseSync {
  const prepare = db.prepare.bind(db);
  db.prepare = ((sql: string) => {
    const st = prepare(sql);
    const all = st.all.bind(st);
    const get = st.get.bind(st);
    st.all = ((...a: never[]) => all(...a).map((r) => ({ ...r }))) as typeof st.all;
    st.get = ((...a: never[]) => { const r = get(...a); return r ? { ...r } : r; }) as typeof st.get;
    return st;
  }) as typeof db.prepare;
  return db;
}

export const db: DatabaseSync = globalForDb.__db2 ?? (globalForDb.__db2 = plain(init()));

