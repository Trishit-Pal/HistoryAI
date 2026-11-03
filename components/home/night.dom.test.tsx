// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { Hall } from "../../src/domain/layout";
import type { MuseumNode } from "../../src/museum/view";
import { NightMuseum } from "./NightMuseum";
import { stepCloud } from "./HeroCloud";

afterEach(() => cleanup());

const node: MuseumNode = {
  id: "evt_1956_dartmouth",
  title: "Dartmouth Summer Research Project on Artificial Intelligence",
  startYear: 1956,
  kind: "turning_point",
  publicStory: "An eight-week workshop that coined the term artificial intelligence.",
  publicationState: "canon",
  layer: "context",
  eraId: "era_1_founding",
  confidence: "confirmed",
  citations: [{ url: "https://home.dartmouth.edu/about/artificial-intelligence-ai-coined-dartmouth", publisher: "Dartmouth College", retrieved: "2026-10-04" }],
  tags: [],
  incomplete: false,
  proseFlags: [],
  fieldChange: {
    before: "Research on machines and intelligence had no common name.",
    after: "Dartmouth College's account says the name was coined in 1956.",
    citationUrls: ["https://home.dartmouth.edu/about/artificial-intelligence-ai-coined-dartmouth"],
  },
};

const hall: Hall = {
  id: "era_1_founding",
  label: "Formal founding",
  startYear: 1950,
  endYear: 1956,
  mood: "open",
  width: 1,
  light: 1,
  spacing: 1,
  exhibitIds: [node.id],
};

describe("night museum home", () => {
  it("lists a hall, has no video, and opens a reading panel that links to the exhibit", async () => {
    render(<NightMuseum nodes={[node]} halls={[hall]} archivedAt="2026-10-04" />);
    expect(document.querySelector("video")).toBeNull();
    expect(screen.getByText(/Showing the archived copy from 2026-10-04/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Enter the hall" }).getAttribute("href")).toBe("/rooms/founding");
    fireEvent.click(screen.getByRole("button", { name: /Formal founding/ }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText(node.fieldChange!.after)).toBeTruthy();
    const link = screen.getByRole("link", { name: "Full exhibit" });
    expect(link.getAttribute("href")).toBe("/rooms/founding/evt_1956_dartmouth");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Close" }));
  });

  it("does not yaw the cloud when motion is reduced", () => {
    expect(stepCloud(1, true, 0.4)).toBe(1);
  });
});
