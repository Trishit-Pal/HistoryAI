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
            const href = node?.eraId ? `/rooms/${eraById(node.eraId).slug}/${line.nodeId}` : `/#${line.nodeId}`;
            return (
              <li key={`${line.nodeId}-${line.version}`}>
                <span className="years">v{line.version}</span> <a href={href}>{node?.title ?? line.nodeId}</a>: {line.reason}
              </li>
            );
          })}
      </ol>
    </main>
  );
}
