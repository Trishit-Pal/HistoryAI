import { NightMuseum } from "../components/home/NightMuseum";
import { getMuseum } from "../src/server/museum";

export default async function HomePage() {
  const data = await getMuseum();
  return (
    <NightMuseum
      nodes={data.nodes}
      halls={data.halls}
      archivedAt={data.source === "archive" ? data.archivedAt : undefined}
    />
  );
}
