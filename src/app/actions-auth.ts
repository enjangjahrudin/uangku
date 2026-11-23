"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { timingSafeEqual } from "node:crypto";
import { SESSION_COOKIE, SESSION_DAYS, authEnabled, createSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { hashPin } from "@/lib/hash";
import { MEMBER_COOKIE } from "@/lib/member";

const attempts = new Map<string, { n: number; first: number }>();
const WINDOW = 15 * 60_000;
const MAX = 5;

function same(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function login(_: { error?: string } | undefined, fd: FormData): Promise<{ error?: string }> {
  const type = String(fd.get("type") ?? "master");

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const now = Date.now();
  const rec = attempts.get(ip);
  if (rec && now - rec.first < WINDOW && rec.n >= MAX) {
    return { error: "Terlalu banyak percobaan. Coba lagi 15 menit lagi." };
  }

  const recordAttempt = () => {
    attempts.set(ip, !rec || now - rec.first >= WINDOW ? { n: 1, first: now } : { n: rec.n + 1, first: rec.first });
  };

  // Login Anggota Keluarga dengan PIN
  if (type === "member") {
    const memberId = Number(fd.get("member_id"));
    const pin = String(fd.get("pin") ?? "").trim();
    if (!memberId) return { error: "Silakan pilih profil anggota." };

    const member = db.prepare("SELECT id, name, pin FROM members WHERE id = ?").get(memberId) as
      | { id: number; name: string; pin: string | null } | undefined;
    if (!member) return { error: "Akun anggota tidak ditemukan." };

    // Jika akun memiliki PIN, validasi PIN
    if (member.pin && member.pin.trim() !== "") {
      if (!pin) return { error: "Masukkan PIN akun Anda." };
      const pinHash = hashPin(pin);
      if (pinHash !== member.pin) {
        recordAttempt();
        return { error: "PIN salah. Silakan coba lagi." };
      }
    }

    attempts.delete(ip);
    const sessionToken = await createSession(member.id);
    const jar = await cookies();
    jar.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true, sameSite: "lax", path: "/", maxAge: SESSION_DAYS * 86400,
      secure: process.env.COOKIE_SECURE === "true",
    });
    jar.set(MEMBER_COOKIE, String(member.id), {
      path: "/", maxAge: SESSION_DAYS * 86400,
    });
    redirect("/");
  }

  // Master Login (dengan APP_PASSWORD)
  if (!authEnabled()) redirect("/");
  if (!same(String(fd.get("password") ?? ""), process.env.APP_PASSWORD!)) {
    recordAttempt();
    return { error: "Kata sandi master salah." };
  }

  attempts.delete(ip);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await createSession(null), {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: SESSION_DAYS * 86400,
    secure: process.env.COOKIE_SECURE === "true",
  });
  redirect("/");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete(MEMBER_COOKIE);
  redirect("/login");
}
