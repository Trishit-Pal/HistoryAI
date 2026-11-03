import { rejectSuggestion } from "../../app/editor/actions";
import { isHttpUrl } from "../../src/domain/urls";

export type SuggestionRow = {
  id: string;
  exhibit_id: string;
  kind: string;
  body: string;
  source_url: string | null;
  created_at: string;
  status: string;
};

export function SuggestionQueue({ rows }: { rows: SuggestionRow[] }) {
  if (rows.length === 0) return <p>No suggestions are waiting.</p>;
  return (
    <ol className="suggestions">
      {rows.map((row) => (
        <li key={row.id}>
          <p className="years">
            {row.kind} · {row.status} · {String(row.created_at).slice(0, 10)}
          </p>
          <p>{row.body}</p>
          {row.source_url ? (
            isHttpUrl(row.source_url) ? (
              <p>
                <a href={row.source_url} rel="noopener noreferrer nofollow ugc">
                  {row.source_url}
                </a>
              </p>
            ) : (
              <p>{row.source_url}</p>
            )
          ) : null}
          {row.status === "pending" ? (
            <p>
              <a href={`/editor/exhibits/${row.exhibit_id}?suggestion=${row.id}`}>Accept in the exhibit form</a>
            </p>
          ) : null}
          {row.status === "pending" ? (
            <form action={rejectSuggestion} className="editor-form">
              <input type="hidden" name="id" value={row.id} />
              <label htmlFor={`note-${row.id}`}>Note</label>
              <input id={`note-${row.id}`} name="editorNote" />
              <button type="submit">Reject</button>
            </form>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
