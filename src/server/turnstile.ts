import "server-only";

export async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || !token) return false;
  const body = new URLSearchParams({ secret, response: token, remoteip: ip });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: controller.signal,
    });
    const payload = (await response.json()) as { success?: boolean; hostname?: string; action?: string };
    return payload.success === true && payload.action === "suggest";
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
