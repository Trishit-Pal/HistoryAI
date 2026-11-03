import "server-only";
import { cookies } from "next/headers";
import { editorEnabled, sessionCookieName, verifySession } from "../domain/session";

export async function getEditorSession(): Promise<boolean> {
  const secret = process.env.EDITOR_SESSION_SECRET;
  const passphrase = process.env.EDITOR_PASSPHRASE;
  if (!secret || !editorEnabled(passphrase)) return false;
  const jar = await cookies();
  const token = jar.get(sessionCookieName())?.value;
  if (!token) return false;
  return verifySession(token, secret);
}

export async function requireEditor(): Promise<boolean> {
  return getEditorSession();
}
