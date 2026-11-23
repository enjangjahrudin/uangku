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

export async function createSession(): Promise<string> {
  const exp = Date.now() + SESSION_DAYS * 86400_000;
  return `${exp}.${await hmac(process.env.AUTH_SECRET ?? "", String(exp))}`;
}

export async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const expected = await hmac(process.env.AUTH_SECRET ?? "", exp);
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}
