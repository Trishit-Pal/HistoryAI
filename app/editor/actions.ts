"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { parseExhibitForm } from "../../src/editor/parseForm";
import {
  editorEnabled,
  passphraseMatches,
  SESSION_MAX_AGE,
  sessionCookieName,
  signSession,
} from "../../src/domain/session";
import { requireEditor } from "../../src/server/auth";
import { db } from "../../src/server/db";
import { commitWrite } from "../../src/server/graph";
import { MUSEUM_TAG } from "../../src/server/museum";
import { hit, ipKey } from "../../src/server/rateLimit";

export type EditorState = { error: string };

export async function login(_prev: EditorState, formData: FormData): Promise<EditorState> {
  const expected = process.env.EDITOR_PASSPHRASE;
  const secret = process.env.EDITOR_SESSION_SECRET;
  if (!secret || !editorEnabled(expected) || !expected) return { error: "The editor is not configured." };
  if (process.env.DATABASE_URL) {
    const headerList = await headers();
    const key = ipKey(headerList);
    const database = db();
    if (!(await hit(database, "login:ip", key, 5, 15 * 60))) return { error: "Too many attempts. Wait and try again." };
  }
  if (!passphraseMatches(String(formData.get("passphrase") ?? ""), expected)) {
    return { error: "That passphrase is not right." };
  }
  const jar = await cookies();
  jar.set(sessionCookieName(), signSession(secret), cookieOptions(SESSION_MAX_AGE));
  redirect("/editor");
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge,
  };
}

export async function logout(): Promise<void> {
  const jar = await cookies();
  // A __Host- cookie is only replaced by a Set-Cookie that is also Secure with Path=/.
  jar.set(sessionCookieName(), "", cookieOptions(0));
  redirect("/editor");
}

export async function saveExhibit(_prev: EditorState, formData: FormData): Promise<EditorState> {
  if (!(await requireEditor())) return { error: "Sign in required." };
  if (!process.env.DATABASE_URL) return { error: "The database is not connected." };
  const parsed = parseExhibitForm(formData);
  if (!parsed.ok) return { error: parsed.error };
  let result: Awaited<ReturnType<typeof commitWrite>>;
  try {
    result = await commitWrite(db(), parsed.write, "editor");
  } catch (error) {
    console.error("saveExhibit failed", error);
    return { error: "The database refused this save. Check the values and try again." };
  }
  if (!result.ok) return { error: result.violations.map((item) => item.message).join(" ") };
  updateTag(MUSEUM_TAG);
  redirect(`/editor/exhibits/${parsed.write.exhibit?.id}`);
}

export async function rejectSuggestion(formData: FormData): Promise<void> {
  if (!(await requireEditor())) redirect("/editor");
  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("editorNote") ?? "");
  await db().query(
    `update suggestions set status = 'rejected', resolved_at = now(), editor_note = $2 where id = $1`,
    [id, note],
  );
  redirect("/editor/suggestions");
}
