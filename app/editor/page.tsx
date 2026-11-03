import { Suspense } from "react";
import { LoginForm } from "../../components/editor/LoginForm";
import { logout } from "./actions";
import { ERAS } from "../../src/domain/eras";
import { getEditorSession } from "../../src/server/auth";
import { db } from "../../src/server/db";
import { getEditorGraph } from "../../src/server/museum";

async function Dashboard() {
  const authed = await getEditorSession();
  if (!authed) return <LoginForm />;
  if (!process.env.DATABASE_URL) return <p>The database is not connected.</p>;
  const graph = await getEditorGraph();
  const pending = await db().query<{ count: string }>(
    "select count(*)::text as count from suggestions where status = 'pending'",
  );
  const groups = new Map<string, typeof graph.exhibits>();
  for (const exhibit of graph.exhibits) {
    const key = exhibit.eraId ?? "unplaced";
    const list = groups.get(key) ?? [];
    list.push(exhibit);
    groups.set(key, list);
  }
  return (
    <>
      <h1>Editor</h1>
      <p>
        <a href="/editor/suggestions">{pending[0]?.count ?? "0"} suggestions waiting</a>
        {" · "}
        <a href="/editor/exhibits/new">New exhibit</a>
      </p>
      {([...groups.entries()] as const).map(([eraId, exhibits]) => (
        <section key={eraId}>
          <h2>{ERAS.find((era) => era.id === eraId)?.label ?? eraId}</h2>
          <ul>
            {exhibits.map((exhibit) => (
              <li key={exhibit.id}>
                <a href={`/editor/exhibits/${exhibit.id}`}>{exhibit.title}</a>
                <span className="years"> {exhibit.publicationState}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <form action={logout}>
        <button type="submit">Log out</button>
      </form>
    </>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<p>Opening the editor.</p>}>
      <Dashboard />
    </Suspense>
  );
}
