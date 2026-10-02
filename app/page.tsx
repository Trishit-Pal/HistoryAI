import { loadMuseum } from "../src/museum/load";
import { MuseumShell } from "../components/MuseumShell";

export default function HomePage() {
  const data = loadMuseum();
  return <MuseumShell nodes={data.nodes} halls={data.halls} changelog={data.changelog} />;
}
