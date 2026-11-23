import { cookies } from "next/headers";
import { db } from "./db";
import { SESSION_COOKIE, verifySession } from "./auth";

export const MEMBER_COOKIE = "uangku-member";

/** Anggota aktif (pencatat): dibaca dari session terverifikasi, atau cookie aktif. */
export async function currentMemberId(): Promise<number | null> {
  const jar = await cookies();
  const sessionToken = jar.get(SESSION_COOKIE)?.value;
  if (sessionToken) {
    const session = await verifySession(sessionToken);
    if (session.valid && session.memberId) {
      const exists = db.prepare("SELECT id FROM members WHERE id = ?").get(session.memberId);
      if (exists) return session.memberId;
    }
  }

  // Fallback ke member cookie (jika login master)
  const v = parseInt(jar.get(MEMBER_COOKIE)?.value ?? "", 10);
  if (!v) return null;
  return db.prepare("SELECT id FROM members WHERE id = ?").get(v) ? v : null;
}
