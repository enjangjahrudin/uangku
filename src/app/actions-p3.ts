"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { MEMBER_COOKIE } from "@/lib/member";

const refresh = () => revalidatePath("/", "layout");

export function hashPin(pin: string): string {
  return createHash("sha256").update(pin.trim()).digest("hex");
}

async function setCookie(id: number | null) {
  const jar = await cookies();
  if (id) jar.set(MEMBER_COOKIE, String(id), { path: "/", maxAge: 60 * 60 * 24 * 365 });
  else jar.delete(MEMBER_COOKIE);
}

export async function setMember(id: number) {
  await setCookie(id || null);
  refresh();
}

export async function addMember(fd: FormData) {
  const name = String(fd.get("name") ?? "").trim();
  const pin = String(fd.get("pin") ?? "").trim();
  if (!name) return;
  const pinHash = pin ? hashPin(pin) : null;
  const r = db.prepare("INSERT INTO members (name, pin) VALUES (?, ?)").run(name, pinHash);
  const count = (db.prepare("SELECT COUNT(*) AS c FROM members").get() as { c: number }).c;
  if (count === 1) await setCookie(Number(r.lastInsertRowid));
  refresh();
}

export async function setMemberPin(fd: FormData) {
  const id = Number(fd.get("member_id"));
  const pin = String(fd.get("pin") ?? "").trim();
  if (!id) return;
  const pinHash = pin ? hashPin(pin) : null;
  db.prepare("UPDATE members SET pin = ? WHERE id = ?").run(pinHash, id);
  refresh();
}

export async function deleteMember(id: number) {
  db.prepare("UPDATE transactions SET created_by = NULL WHERE created_by = ?").run(id);
  db.prepare("DELETE FROM members WHERE id = ?").run(id);
  refresh();
}
