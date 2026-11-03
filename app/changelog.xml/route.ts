import { eraById } from "../../src/domain/eras";
import { getMuseum } from "../../src/server/museum";

export async function GET() {
  const { changelog, nodes } = await getMuseum();
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const items = changelog
    .slice()
    .reverse()
    .map((line) => {
      const node = byId.get(line.nodeId);
      const path = node?.eraId ? `/rooms/${eraById(node.eraId).slug}/${line.nodeId}` : `/changelog`;
      return `<item>
  <title>${escapeXml(node?.title ?? line.nodeId)} v${line.version}</title>
  <description>${escapeXml(line.reason)}</description>
  <link>${site}${path}</link>
  <pubDate>${new Date(line.at).toUTCString()}</pubDate>
  <guid>${line.nodeId}-${line.version}</guid>
</item>`;
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>Hall of Eras changelog</title>
  <link>${site}/changelog</link>
  <description>Every stored version of a museum node.</description>
  ${items}
</channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
