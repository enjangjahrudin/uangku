import { cookies } from "next/headers";
import { db } from "./db";

export const MEMBER_COOKIE = "uangku-member";

/** Anggota aktif (pencatat) dari cookie; null jika belum ada anggota / tidak valid. */
export async function currentMemberId(): Promise<number | null> {
  const v = parseInt((await cookies()).get(MEMBER_COOKIE)?.value ?? "", 10);
  if (!v) return null;
  return db.prepare("SELECT id FROM members WHERE id = ?").get(v) ? v : null;
}
