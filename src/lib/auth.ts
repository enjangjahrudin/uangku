// Aman dipakai di middleware (Edge) maupun server actions: hanya Web Crypto.
export const SESSION_COOKIE = "uangku-session";
export const SESSION_DAYS = 30;

const enc = new TextEncoder();

async function hmac(secret: string, msg: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const authEnabled = () => !!process.env.APP_PASSWORD;

function getSecret() {
  return process.env.AUTH_SECRET || "uangku-default-secret-salt-family-app";
}

/** Buat session token bertanda tangan HMAC. */
export async function createSession(memberId: number | null = null): Promise<string> {
  const mid = memberId ?? 0;
  const exp = Date.now() + SESSION_DAYS * 86400_000;
  const payload = `${mid}.${exp}`;
  const sig = await hmac(getSecret(), payload);
  return `${payload}.${sig}`;
}

export type SessionResult = { valid: boolean; memberId: number | null };

/** Verifikasi session token. Mendukung format lama (${exp}.${sig}) dan format baru (${mid}.${exp}.${sig}). */
export async function verifySession(token: string | undefined): Promise<SessionResult> {
  if (!token) return { valid: false, memberId: null };
  const parts = token.split(".");

  // Format baru: memberId.exp.sig
  if (parts.length === 3) {
    const [midStr, exp, sig] = parts;
    if (!exp || !sig || Number(exp) < Date.now()) return { valid: false, memberId: null };
    const expected = await hmac(getSecret(), `${midStr}.${exp}`);
    if (expected.length !== sig.length) return { valid: false, memberId: null };
    let diff = 0;
    for (let i = 0; i < sig.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
    if (diff !== 0) return { valid: false, memberId: null };
    const mid = Number(midStr);
    return { valid: true, memberId: mid > 0 ? mid : null };
  }

  // Format lama (legacy master): exp.sig
  if (parts.length === 2) {
    const [exp, sig] = parts;
    if (!exp || !sig || Number(exp) < Date.now()) return { valid: false, memberId: null };
    const expected = await hmac(getSecret(), exp);
    if (expected.length !== sig.length) return { valid: false, memberId: null };
    let diff = 0;
    for (let i = 0; i < sig.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
    return { valid: diff === 0, memberId: null };
  }

  return { valid: false, memberId: null };
}
