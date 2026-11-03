"use client";

import { useActionState } from "react";
import { login, type EditorState } from "../../app/editor/actions";

const initial: EditorState = { error: "" };

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initial);
  return (
    <form action={action} className="editor-form">
      <h1>Editor</h1>
      <label htmlFor="passphrase">Passphrase</label>
      <input id="passphrase" name="passphrase" type="password" autoComplete="current-password" required />
      <button type="submit" disabled={pending}>
        {pending ? "Checking" : "Open the editor"}
      </button>
      {state.error ? <p role="alert">{state.error}</p> : null}
    </form>
  );
}
