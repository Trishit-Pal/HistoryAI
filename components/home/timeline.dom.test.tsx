// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { Hall } from "../../src/domain/layout";
import type { MuseumNode } from "../../src/museum/view";
import { Timeline } from "./Timeline";

afterEach(() => cleanup());

function node(id: string, title: string, startYear: number): MuseumNode {
  return {
    id,
    title,
    startYear,
    kind: "turning_point",
    publicStory: "A sourced account.",
    publicationState: "canon",
    layer: "context",
    citations: [],
    tags: [],
    incomplete: false,
    proseFlags: [],
  };
}

function hall(id: string, label: string, startYear: number | null, exhibitIds: string[]): Hall {
  return { id, label, startYear, endYear: null, mood: "open", width: 1, light: 1, spacing: 1, exhibitIds };
}

const dartmouth = { ...node("evt_1956_dartmouth", "Dartmouth Summer Research Project", 1956), confidence: "confirmed" as const };
const turing = node("evt_1950_turing", "Computing Machinery and Intelligence", 1950);
const halls = [
  { ...hall("era_1_founding", "Formal founding", 1950, [turing.id, dartmouth.id]), summary: "Turing and Dartmouth." },
  hall("provisional", "Provisional hall", null, []),
];

describe("timeline home", () => {
  it("renders one labelled band per era with chip links into the room", () => {
    render(<Timeline nodes={[turing, dartmouth]} halls={halls} archivedAt="2026-10-04" />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByText(/Showing the archived copy from 2026-10-04/)).toBeTruthy();
    const band = screen.getByRole("region", { name: "Formal founding" });
    expect(band.id).toBe("era-founding");
    expect(within(band).getByText("Turing and Dartmouth.")).toBeTruthy();
    const card = within(band).getByRole("link", { name: /Dartmouth Summer/ });
    expect(card.textContent).toContain("● confirmed");
    expect(within(band).getByRole("link", { name: /Computing Machinery/ }).textContent).toContain("– unset");
    expect(within(band).getByRole("link", { name: /Dartmouth Summer/ }).getAttribute("href")).toBe(
      "/rooms/founding#evt_1956_dartmouth",
    );
    expect(within(band).getByRole("link", { name: /Enter the hall/ }).getAttribute("href")).toBe("/rooms/founding");
    const sealed = screen.getByRole("region", { name: "Provisional hall" });
    expect(sealed.className).toContain("is-muted");
    expect(within(sealed).queryAllByRole("link")).toHaveLength(0);
    expect(screen.getByRole("navigation", { name: "Eras" }).querySelector("a[href='#era-founding']")).toBeTruthy();
  });

  it("filters chips by title and says when nothing matches", () => {
    render(<Timeline nodes={[turing, dartmouth]} halls={halls} />);
    const search = screen.getByLabelText("Search exhibits");
    fireEvent.change(search, { target: { value: "DARTMOUTH" } });
    const status = screen.getByRole("status");
    expect(status.textContent).toBe("");
    expect(screen.getByRole("link", { name: /Dartmouth Summer/ })).toBeTruthy();
    expect(screen.queryByRole("link", { name: /Computing Machinery/ })).toBeNull();
    const sealedItem = document.getElementById("era-provisional")!.closest("li")!;
    expect(sealedItem.hidden).toBe(true);
    const railItem = document.querySelector("a[href='#era-provisional']")!.closest("li")!;
    expect(railItem.hidden).toBe(true);
    fireEvent.change(search, { target: { value: "zzz" } });
    expect(screen.getByRole("status")).toBe(status);
    expect(status.textContent).toMatch(/No exhibits match/);
    expect(document.getElementById("era-founding")!.closest("li")!.hidden).toBe(true);
  });
});
