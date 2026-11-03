import { notFound } from "next/navigation";
import { MuseumShell } from "../../../components/MuseumShell";
import { ERAS, eraBySlug } from "../../../src/domain/eras";
import { getMuseum } from "../../../src/server/museum";

export function generateStaticParams() {
  return ERAS.map((era) => ({ era: era.slug }));
}

export const instant = false;

export default async function RoomPage({ params }: { params: Promise<{ era: string }> }) {
  const { era } = await params;
  const found = eraBySlug(era);
  if (!found) notFound();
  const data = await getMuseum();
  return (
    <MuseumShell
      nodes={data.nodes}
      halls={data.halls}
      initialHallId={found.id}
      archivedAt={data.source === "archive" ? data.archivedAt : undefined}
    />
  );
}
