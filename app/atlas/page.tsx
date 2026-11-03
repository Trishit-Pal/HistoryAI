import type { Metadata } from "next";
import { AtlasShell } from "../../components/atlas/AtlasShell";
import { governanceViews } from "../../src/atlas/governance";
import { landmarkViews } from "../../src/atlas/landmarks";
import { getAtlas } from "../../src/server/atlas";
import { getMuseum } from "../../src/server/museum";
import "./atlas.css";

export const metadata: Metadata = {
  title: "The scale of AI · Hall of Eras",
  description:
    "Every AI model in Epoch AI's data, placed by year and by the training compute or parameters it needed, with the landmark models linked to their exhibits.",
};

export default async function AtlasPage() {
  const [atlas, museum] = await Promise.all([getAtlas(), getMuseum()]);
  const landmarks = landmarkViews(atlas.models.names, museum.nodes);
  const governance = governanceViews(museum.nodes);
  return <AtlasShell atlas={atlas} landmarks={landmarks} governance={governance} />;
}
