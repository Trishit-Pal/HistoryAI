import { loadMuseum } from "../../src/museum/load";

export default function ChangelogPage() {
  const { changelog, nodes } = loadMuseum();
  const titles = new Map(nodes.map((node) => [node.id, node.title]));
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
          .map((line) => (
            <li key={`${line.nodeId}-${line.version}`}>
              <span className="years">v{line.version}</span>{" "}
              <a href={`/#${line.nodeId}`}>{titles.get(line.nodeId) ?? line.nodeId}</a>: {line.reason}
            </li>
          ))}
      </ol>
    </main>
  );
}
