// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Hall } from "../src/domain/layout";
import type { MuseumNode } from "../src/museum/view";
import { MuseumShell } from "./MuseumShell";

vi.mock("../src/museum/env", () => ({ hasWebGL: () => false, usePrefersReducedMotion: () => false }));

afterEach(() => cleanup());

const exhibit: MuseumNode = {
  id: "evt_1956_dartmouth",
  title: "Dartmouth Summer Research Project",
  startYear: 1956,
  kind: "turning_point",
  publicStory: "A sourced account.",
  publicationState: "canon",
  layer: "context",
  confidence: "confirmed",
  citations: [],
  tags: [],
  incomplete: false,
  proseFlags: [],
};

const hall: Hall = {
  id: "era_1_founding",
  label: "Formal founding",
  startYear: 1950,
  endYear: null,
  mood: "open",
  width: 1,
  light: 1,
  spacing: 1,
  exhibitIds: [exhibit.id],
};

describe("MuseumShell", () => {
  it("announces the focused exhibit as 'title, confidence, in hall' with a space after each comma", () => {
    render(<MuseumShell nodes={[exhibit]} halls={[hall]} />);
    expect(screen.getByRole("status").textContent).toBe(
      "Dartmouth Summer Research Project, confirmed, in Formal founding.",
    );
  });
});
