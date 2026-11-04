// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { ExhibitDetail } from "../src/museum/build";
import { ExhibitPage } from "./ExhibitPage";
import { SafeLink } from "./SafeLink";

afterEach(() => cleanup());

const detail: ExhibitDetail = {
  node: {
    id: "evt_example",
    title: "Example exhibit",
    startYear: 1854,
    kind: "idea",
    publicStory: "A short story.",
    publicationState: "canon",
    layer: "context",
    eraId: "era_0_precursors",
    confidence: "reported",
    citations: [{ url: "https://example.com/a", publisher: "Example Press", retrieved: "2026-10-03" }],
    tags: [],
    incomplete: false,
    proseFlags: [],
  },
  related: [],
  revisions: [
    {
      version: 1,
      at: "2026-10-03T00:00:00.000Z",
      reason: "First published",
      fromSuggestion: false,
      changes: [{ field: "created" }],
    },
  ],
  claims: [],
};

describe("exhibit page atlas link", () => {
  it("offers the atlas for an exhibit that appears there, and not otherwise", () => {
    const alexnet = { ...detail, node: { ...detail.node, id: "evt_2012_alexnet" } };
    const { rerender } = render(
      <ExhibitPage detail={alexnet} eraSlug="deep-learning" eraLabel="Deep learning" />,
    );
    expect(screen.getByRole("link", { name: "See it in the atlas" }).getAttribute("href")).toBe("/atlas#model=AlexNet");

    rerender(<ExhibitPage detail={detail} eraSlug="precursors" eraLabel="Precursors" />);
    expect(screen.queryByRole("link", { name: "See it in the atlas" })).toBeNull();
  });
});

describe("exhibit page", () => {
  it("shows sources, the empty field note, and revision history", () => {
    render(<ExhibitPage detail={detail} eraLabel="Precursors" eraSlug="precursors" />);
    expect(screen.getByRole("heading", { name: "Sources" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "How the field changed" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Revision history" })).toBeTruthy();
    expect(screen.getByText("The museum has not yet written how this changed the field.")).toBeTruthy();
    expect(screen.getByText("First published.")).toBeTruthy();
  });

  it("opens with a title block and a way back to the hall", () => {
    const { container } = render(<ExhibitPage detail={detail} eraLabel="Precursors" eraSlug="precursors" />);
    const terms = [...container.querySelectorAll(".titleblock dt")].map((term) => term.textContent);
    expect(terms).toEqual(["Hall", "Years", "Kind", "Confidence"]);
    const values = [...container.querySelectorAll(".titleblock dd")].map((value) => value.textContent);
    expect(values).toEqual(["Precursors", "1854", "idea, context", "reported"]);
    // The class is what carries the confidence shape (a glyph drawn in CSS), not only the word.
    expect(container.querySelector(".titleblock .badge.badge-reported")).not.toBeNull();
    const back = screen.getByRole("link", { name: "Precursors" });
    expect(back.getAttribute("href")).toBe("/rooms/precursors#evt_example");
    expect(screen.getByRole("navigation", { name: "Breadcrumb" }).querySelector("[aria-current='page']")).not.toBeNull();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("shows the end year in the title block when the exhibit spans years", () => {
    const spanning = { ...detail, node: { ...detail.node, endYear: 1860 } };
    const { container } = render(<ExhibitPage detail={spanning} eraLabel="Precursors" eraSlug="precursors" />);
    expect(container.querySelectorAll(".titleblock dd")[1]?.textContent).toBe("1854–1860");
  });

  it("renders a javascript URL as text", () => {
    render(<SafeLink href="javascript:alert(1)">Bad</SafeLink>);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("Bad")).toBeTruthy();
  });
});
