"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitSuggestion, type SuggestionState } from "../app/rooms/[era]/[exhibit]/actions";

const initial: SuggestionState = { ok: false, message: "" };

const TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type Turnstile = {
  render(container: HTMLElement, options: { sitekey: string; action: string }): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
};

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

let turnstileLoad: Promise<Turnstile> | undefined;

function loadTurnstile(): Promise<Turnstile> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  turnstileLoad ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TURNSTILE_SRC;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile missing")));
    script.onerror = () => {
      turnstileLoad = undefined;
      reject(new Error("Turnstile failed to load"));
    };
    document.head.append(script);
  });
  return turnstileLoad;
}

export function SuggestForm({ exhibitId }: { exhibitId: string }) {
  const [state, action, pending] = useActionState(submitSuggestion, initial);
  const [open, setOpen] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);

  useEffect(() => {
    const container = widgetRef.current;
    if (!open || !siteKey || !container) return;
    let cancelled = false;
    loadTurnstile()
      .then((turnstile) => {
        if (!cancelled) widgetId.current = turnstile.render(container, { sitekey: siteKey, action: "suggest" });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = undefined;
    };
  }, [open, siteKey]);

  // A Turnstile token is single use; every server reply spends it.
  useEffect(() => {
    if (state !== initial && widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
  }, [state]);

  const values = state.ok ? undefined : state.values;

  return (
    <details
      className="suggest"
      onToggle={(event) => setOpen((event.currentTarget as HTMLDetailsElement).open)}
    >
      <summary>Suggest a correction or source</summary>
      <form action={action} className="suggest-form">
        <input type="hidden" name="exhibitId" value={exhibitId} />
        <input className="honeypot" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <label htmlFor="kind">Kind</label>
        <select id="kind" name="kind" defaultValue={values?.kind ?? "correction"}>
          <option value="correction">Correction</option>
          <option value="source">Source</option>
        </select>
        <label htmlFor="body">What should change</label>
        <textarea
          id="body"
          name="body"
          required
          minLength={20}
          maxLength={2000}
          rows={5}
          defaultValue={values?.body ?? ""}
        />
        <label htmlFor="sourceUrl">Source link, if you have one</label>
        <input id="sourceUrl" name="sourceUrl" type="url" defaultValue={values?.sourceUrl ?? ""} />
        {siteKey ? <div ref={widgetRef} /> : null}
        <button type="submit" disabled={pending}>
          {pending ? "Sending" : "Send suggestion"}
        </button>
        {state.message ? <p role="status">{state.message}</p> : null}
      </form>
    </details>
  );
}
