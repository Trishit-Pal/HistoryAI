import { Suspense } from "react";
import { LoginForm } from "../../../components/editor/LoginForm";
import { SuggestionQueue, type SuggestionRow } from "../../../components/editor/SuggestionQueue";
import { getEditorSession } from "../../../src/server/auth";
import { db } from "../../../src/server/db";

async function Queue() {
  if (!(await getEditorSession())) return <LoginForm />;
  if (!process.env.DATABASE_URL) return <p>The database is not connected.</p>;
  const rows = await db().query<SuggestionRow>(
    "select id, exhibit_id, kind, body, source_url, created_at, status from suggestions order by created_at desc limit 100",
  );
  return (
    <>
      <p>
        <a href="/editor">Back to the list</a>
      </p>
      <h1>Suggestions</h1>
      <SuggestionQueue rows={rows} />
    </>
  );
}

export default function SuggestionsPage() {
  return (
    <Suspense fallback={<p>Opening the queue.</p>}>
      <Queue />
    </Suspense>
  );
}
