"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { timingSafeEqual } from "node:crypto";
import { SESSION_COOKIE, SESSION_DAYS, authEnabled, createSession } from "@/lib/auth";

const attempts = new Map<string, { n: number; first: number }>();
const WINDOW = 15 * 60_000;
const MAX = 5;

function same(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function login(_: { error?: string } | undefined, fd: FormData): Promise<{ error?: string }> {
  if (!authEnabled()) redirect("/");
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const now = Date.now();
  const rec = attempts.get(ip);
  if (rec && now - rec.first < WINDOW && rec.n >= MAX) return { error: "Terlalu banyak percobaan. Coba lagi 15 menit lagi." };

  if (!same(String(fd.get("password") ?? ""), process.env.APP_PASSWORD!)) {
    attempts.set(ip, !rec || now - rec.first >= WINDOW ? { n: 1, first: now } : { n: rec.n + 1, first: rec.first });
    return { error: "Kata sandi salah." };
  }
  attempts.delete(ip);
  (await cookies()).set(SESSION_COOKIE, await createSession(), {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: SESSION_DAYS * 86400,
    secure: process.env.COOKIE_SECURE === "true",
  });
  redirect("/");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
