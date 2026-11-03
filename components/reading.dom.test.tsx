// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { Hall } from "../src/domain/layout";
import type { Figure } from "../src/domain/types";
import type { MuseumNode } from "../src/museum/view";
import { Dossier } from "./Dossier";
import { Flatland } from "./Flatland";

const redrawn: Figure = {
  src: "/museum/era-0/turing.svg",
  alt: "A state table with rows for machine configurations.",
  credit: "Original diagram, redrawn after Turing 1936.",
  license: "original",
  sourceUrl: "https://londmathsoc.onlinelibrary.wiley.com/doi/abs/10.1112/plms/s2-42.1.230",
  sourceLabel: "London Mathematical Society",
  kind: "redrawn",
  redrawnAfter: "https://londmathsoc.onlinelibrary.wiley.com/doi/abs/10.1112/plms/s2-42.1.230",
};

const scan: Figure = {
  src: "/museum/era-0/boole.svg",
  alt: "Title page of Boole, Laws of Thought, 1854.",
  credit: "Public-domain title page.",
  license: "PD-old",
  sourceUrl: "https://archive.org/details/investigationofl00boolrich",
  kind: "scan",
};

function node(id: string, year: number, figure?: Figure, kind: MuseumNode["kind"] = "idea"): MuseumNode {
  return {
    id,
    title: id,
    startYear: year,
    kind,
    publicStory: `${id} story`,
    publicationState: "canon",
    layer: "context",
    eraId: "era_0_precursors",
    confidence: "reported",
    citations: [],
    tags: [],
    incomplete: false,
    proseFlags: [],
    figure,
  };
}

const hall: Hall = {
  id: "era_0_precursors",
  label: "Precursors",
  startYear: 1843,
  endYear: 1949,
  mood: "open",
  width: 1,
  light: 1,
  spacing: 1.8,
  exhibitIds: [
    "evt_history_overview",
    "ctx_1843_analytical_engine",
    "ctx_1948_wiener_cybernetics",
    "tech_1948_shannon_information",
  ],
};

afterEach(() => cleanup());

describe("reading surfaces", () => {
  it("shows a redrawn figure credit in the dossier", () => {
    render(
      <Dossier node={node("ctx_1936_turing_computable", 1936, redrawn)} onFocus={() => undefined} />,
    );
    expect(screen.getByAltText("A state table with rows for machine configurations.")).toBeTruthy();
    expect(screen.getByText(redrawn.credit)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Source: London Mathematical Society" }).getAttribute("href")).toBe(
      redrawn.sourceUrl,
    );
    expect(screen.getByRole("link", { name: "London Mathematical Society" }).getAttribute("href")).toBe(
      redrawn.redrawnAfter,
    );
    expect(screen.queryByText(redrawn.sourceUrl)).toBeNull();
    expect(screen.getByText("Original illustration for this museum")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Full exhibit, sources and changes" }).getAttribute("href")).toBe(
      "/rooms/precursors/ctx_1936_turing_computable",
    );
    expect(screen.queryByLabelText("Ask the museum")).toBeNull();
  });

  it("omits the redrawn note on a scan", () => {
    render(
      <Dossier node={node("ctx_1854_boole_laws_of_thought", 1854, scan)} onFocus={() => undefined} />,
    );
    expect(screen.queryByText(/Redrawn after/)).toBeNull();
  });

  it("lists precursors in station order with the same figure sources", () => {
    const nodes = [
      node("ctx_1843_analytical_engine", 1843, { ...scan, src: "/museum/era-0/engine.svg" }),
      node("evt_history_overview", 1854, { ...scan, src: "/museum/era-0/overview.svg" }),
      node("tech_1948_shannon_information", 1948, { ...redrawn, src: "/museum/era-0/shannon-1948.svg" }, "system"),
      node("ctx_1948_wiener_cybernetics", 1948, { ...redrawn, src: "/museum/era-0/wiener.svg" }),
    ];
    render(<Flatland halls={[hall]} nodes={nodes} year={1949} visited={[]} focusedId={null} onFocus={() => undefined} />);
    const titles = screen
      .getAllByRole("button")
      .map((button) => button.textContent)
      .filter((name) => name && !name.includes("this hall"));
    expect(titles).toEqual([
      "evt_history_overview",
      "ctx_1843_analytical_engine",
      "ctx_1948_wiener_cybernetics",
      "tech_1948_shannon_information",
    ]);
    const images = screen.getAllByRole("img").map((image) => image.getAttribute("src"));
    expect(images).toEqual([
      "/museum/era-0/overview.svg",
      "/museum/era-0/engine.svg",
      "/museum/era-0/wiener.svg",
      "/museum/era-0/shannon-1948.svg",
    ]);
  });
});
