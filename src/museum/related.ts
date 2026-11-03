import type { EvolutionLink } from "../store/memory";

export type RelatedLine = {
  label: string;
  id: string;
  title: string;
};

export function relatedFor(
  id: string,
  links: EvolutionLink[],
  nodes: { id: string; title: string }[],
): RelatedLine[] {
  const titles = new Map(nodes.map((node) => [node.id, node.title]));
  const lines: RelatedLine[] = [];
  for (const link of links) {
    const otherId = link.fromId === id ? link.toId : link.toId === id ? link.fromId : undefined;
    if (!otherId || !titles.has(otherId)) continue;
    const title = titles.get(otherId) ?? otherId;
    let label: string | undefined;
    if (link.type === "INFLUENCED_BY") label = link.fromId === id ? "Built on" : "Influenced";
    else if (link.type === "SUPERSEDED_BY") label = link.fromId === id ? "Replaced by" : "Replaced";
    else if (link.type === "EVALUATED_ON" && link.fromId === id) label = "Evaluated on";
    else if (link.type === "COMPONENT_OF" && link.fromId === id) label = "Part of";
    if (!label) continue;
    lines.push({ label, id: otherId, title });
  }
  return lines;
}
