import type { Metadata } from "next";
import snapshotFile from "../../data/globe-snapshot.json";
import { GlobeShell } from "../../components/globe/GlobeShell";
import type { GlobeSnapshot } from "../../src/globe/types";
import "./globe.css";
import "./globe-panel.css";

export const metadata: Metadata = {
  title: "Who builds the frontier · Hall of Eras",
  description:
    "Where large-scale AI is built: every model trained with at least 10^23 FLOP in Epoch AI's data, by country, from 2018 to November 2026.",
};

const snapshot = snapshotFile as GlobeSnapshot;

export default function GlobePage() {
  return <GlobeShell snapshot={snapshot} />;
}
