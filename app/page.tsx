import { Timeline } from "../components/home/Timeline";
import { getMuseum } from "../src/server/museum";

export default async function HomePage() {
  const data = await getMuseum();
  return (
    <Timeline
      nodes={data.nodes}
      halls={data.halls}
      archivedAt={data.source === "archive" ? data.archivedAt : undefined}
    />
  );
}
