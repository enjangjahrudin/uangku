"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { MEMBER_COOKIE } from "@/lib/member";

const refresh = () => revalidatePath("/", "layout");

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
  if (!name) return;
  const r = db.prepare("INSERT INTO members (name) VALUES (?)").run(name);
  const count = (db.prepare("SELECT COUNT(*) AS c FROM members").get() as { c: number }).c;
  if (count === 1) await setCookie(Number(r.lastInsertRowid));
  refresh();
}

export async function deleteMember(id: number) {
  db.prepare("UPDATE transactions SET created_by = NULL WHERE created_by = ?").run(id);
  db.prepare("DELETE FROM members WHERE id = ?").run(id);
  refresh();
}
