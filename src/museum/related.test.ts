import { describe, expect, it } from "vitest";
import { relatedFor } from "./related";

const nodes = [
  { id: "x", title: "X" },
  { id: "y", title: "Y" },
];

describe("relatedFor", () => {
  it("names the direction of a public link", () => {
    expect(
      relatedFor(
        "x",
        [
          { type: "INFLUENCED_BY", fromId: "x", toId: "y", sourceId: "s" },
          { type: "SUPERSEDED_BY", fromId: "y", toId: "x", sourceId: "s" },
        ],
        nodes,
      ),
    ).toEqual([
      { label: "Built on", id: "y", title: "Y" },
      { label: "Replaced", id: "y", title: "Y" },
    ]);
  });

  it("hides a link whose other end is not public", () => {
    expect(relatedFor("x", [{ type: "INFLUENCED_BY", fromId: "x", toId: "secret", sourceId: "s" }], nodes)).toEqual(
      [],
    );
  });
});
