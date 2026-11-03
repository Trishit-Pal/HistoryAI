import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { ExhibitForm } from "../../../../components/editor/ExhibitForm";
import { LoginForm } from "../../../../components/editor/LoginForm";
import { getEditorSession } from "../../../../src/server/auth";
import { db } from "../../../../src/server/db";
import { getEditorGraph } from "../../../../src/server/museum";

async function EditExhibit({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ suggestion?: string }>;
}) {
  const { id } = await params;
  const { suggestion } = await searchParams;
  if (!/^[a-z0-9_]{1,80}$/.test(id)) redirect("/editor");
  if (!(await getEditorSession())) return <LoginForm />;
  if (!process.env.DATABASE_URL) return <p>The database is not connected.</p>;
  const graph = await getEditorGraph();
  const exhibit = graph.exhibits.find((item) => item.id === id);
  if (!exhibit) notFound();
  let note: { id: string; body: string; sourceUrl?: string | null } | undefined;
  if (suggestion && /^[0-9a-f-]{36}$/i.test(suggestion)) {
    const rows = await db().query<{ id: string; body: string; source_url: string | null }>(
      "select id, body, source_url from suggestions where id = $1 and exhibit_id = $2",
      [suggestion, id],
    );
    const row = rows[0];
    if (row) note = { id: row.id, body: row.body, sourceUrl: row.source_url };
  }
  return (
    <>
      <p>
        <a href="/editor">Back to the list</a>
      </p>
      <ExhibitForm exhibit={exhibit} suggestion={note} />
    </>
  );
}

export default function EditExhibitPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ suggestion?: string }>;
}) {
  return (
    <Suspense fallback={<p>Opening the exhibit.</p>}>
      <EditExhibit params={params} searchParams={searchParams} />
    </Suspense>
  );
}
