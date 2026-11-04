import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ExhibitPage } from "../../../../components/ExhibitPage";
import { SuggestForm } from "../../../../components/SuggestForm";
import { eraById } from "../../../../src/domain/eras";
import { buildMuseumData } from "../../../../src/museum/build";
import { getMuseum } from "../../../../src/server/museum";
import snapshotFile from "../../../../data/museum-snapshot.json";
import type { MuseumSnapshot } from "../../../../src/store/memory";

function seededParams() {
  const file = snapshotFile as { snapshot: MuseumSnapshot };
  const data = buildMuseumData(file.snapshot, { source: "archive" });
  return data.nodes.flatMap((node) =>
    node.eraId ? [{ era: eraById(node.eraId).slug, exhibit: node.id }] : [],
  );
}

export function generateStaticParams() {
  const params = seededParams();
  return params.length > 0 ? params : [{ era: "founding", exhibit: "evt_1956_dartmouth" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ era: string; exhibit: string }>;
}): Promise<Metadata> {
  const { exhibit } = await params;
  const data = await getMuseum();
  const detail = data.exhibits[exhibit];
  if (!detail) return { title: "Exhibit" };
  return { title: `${detail.node.title} · Hall of Eras`, description: detail.node.publicStory.slice(0, 160) };
}

export const instant = false;

export default async function ExhibitRoute({ params }: { params: Promise<{ era: string; exhibit: string }> }) {
  const { era, exhibit } = await params;
  if (!/^[a-z0-9-]{1,40}$/.test(era) || !/^[a-z0-9_]{1,80}$/.test(exhibit)) notFound();
  const data = await getMuseum();
  const detail = data.exhibits[exhibit];
  if (!detail?.node.eraId) notFound();
  const slug = eraById(detail.node.eraId).slug;
  if (era !== slug) redirect(`/rooms/${slug}/${exhibit}`);
  const eraLabel = eraById(detail.node.eraId).label;
  return (
    <ExhibitPage
      detail={detail}
      eraLabel={eraLabel}
      eraSlug={slug}
      archivedAt={data.source === "archive" ? data.archivedAt : undefined}
    >
      <SuggestForm exhibitId={detail.node.id} />
    </ExhibitPage>
  );
}
