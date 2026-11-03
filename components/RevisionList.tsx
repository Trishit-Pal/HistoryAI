import type { RevisionChange } from "../src/domain/revisions";
import type { RevisionView } from "../src/museum/build";

function line(change: RevisionChange): string {
  if (change.field === "created") return "First published.";
  if (change.field === "confidence") {
    return `Confidence changed from ${change.from ?? "unset"} to ${change.to ?? "unset"}.`;
  }
  if (change.field === "citations") {
    const added = change.added.length ? change.added.join(", ") : "none";
    const removed = change.removed.length ? change.removed.join(", ") : "none";
    return `Sources added: ${added}. Removed: ${removed}.`;
  }
  if (change.field === "publicationState") return `State changed from ${change.from} to ${change.to}.`;
  if (change.field === "text") return `Text changed: ${change.parts.join(", ")}.`;
  return "The figure changed.";
}

export function RevisionList({ revisions }: { revisions: RevisionView[] }) {
  return (
    <section>
      <h2>Revision history</h2>
      {revisions.length === 0 ? <p>No revisions are stored yet.</p> : null}
      <ol className="revisions">
        {[...revisions].reverse().map((revision) => (
          <li key={revision.version}>
            <p className="years">
              v{revision.version} · {revision.at.slice(0, 10)}
              {revision.fromSuggestion ? " · from a visitor suggestion" : ""}
            </p>
            <p>{revision.reason}</p>
            <ul>
              {revision.changes.map((change, index) => (
                <li key={`${revision.version}-${change.field}-${index}`}>{line(change)}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
