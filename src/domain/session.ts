import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const SESSION_MS = 8 * 60 * 60 * 1000;

export function editorEnabled(passphrase: string | undefined): boolean {
  return Boolean(passphrase && passphrase.length >= 32);
}

export function passphraseMatches(input: string, expected: string): boolean {
  const left = createHash("sha256").update(input).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
}

export function signSession(secret: string, now = Date.now()): string {
  const payload = Buffer.from(JSON.stringify({ v: 1, exp: now + SESSION_MS })).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySession(token: string, secret: string, now = Date.now()): boolean {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return false;
  try {
    const body = JSON.parse(Buffer.from(payload, "base64url").toString()) as { v?: number; exp?: number };
    return body.v === 1 && typeof body.exp === "number" && body.exp > now;
  } catch {
    return false;
  }
}

export function sessionCookieName(): string {
  return process.env.NODE_ENV === "production" ? "__Host-editor" : "editor_session";
}

export const SESSION_MAX_AGE = 8 * 60 * 60;
