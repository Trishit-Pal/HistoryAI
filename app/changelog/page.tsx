import { eraById } from "../../src/domain/eras";
import { getMuseum } from "../../src/server/museum";

export default async function ChangelogPage() {
  const { changelog, nodes } = await getMuseum();
  const byId = new Map(nodes.map((node) => [node.id, node]));
  return (
    <main className="page plate">
      <p>
        <a href="/changelog.xml">RSS</a>
      </p>
      <h1>Changelog</h1>
      <ol className="changelog">
        {changelog
          .slice()
          .reverse()
          .map((line) => {
            const node = byId.get(line.nodeId);
            const title = node?.title ?? line.title ?? line.nodeId;
            // A withdrawn exhibit has no page left to link to.
            const name = node ? (
              <a href={node.eraId ? `/rooms/${eraById(node.eraId).slug}/${line.nodeId}` : `/#${line.nodeId}`}>{title}</a>
            ) : (
              <span>{title}</span>
            );
            return (
              <li key={`${line.nodeId}-${line.version}`}>
                <span className="years">v{line.version}</span> <time dateTime={line.at}>{line.at.slice(0, 10)}</time>{" "}
                {name}: {line.reason}
              </li>
            );
          })}
      </ol>
    </main>
  );
}
