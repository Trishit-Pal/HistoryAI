import { describe, expect, it } from "vitest";
import { layoutRooms, sealRooms, type PublicExhibit } from "./layout.js";

function exhibit(
  id: string,
  startYear: number,
  kind: PublicExhibit["kind"] = "idea",
  publicationState: PublicExhibit["publicationState"] = "canon",
): PublicExhibit {
  return { id, title: id, kind, startYear, publicationState };
}

describe("layoutRooms", () => {
  const early = [
    exhibit("a", 1943),
    exhibit("b", 1948, "system"),
    exhibit("c", 1951),
    exhibit("d", 1956, "system"),
    exhibit("e", 1958, "failure"),
  ];

  it("same exhibits produce the same floor", () => {
    expect(layoutRooms(early)).toEqual(layoutRooms([...early].reverse()));
  });

  it("a decade under three exhibits joins the next decade", () => {
    const floor = layoutRooms(early);
    const canonRooms = floor.rooms.filter((room) => room.id !== "provisional");
    expect(canonRooms).toHaveLength(1);
    expect(canonRooms[0]?.exhibitIds).toEqual(["a", "b", "c", "d", "e"]);
    expect(canonRooms[0]?.startYear).toBe(1943);
    expect(canonRooms[0]?.endYear).toBe(1958);
  });

  it("provisional exhibits stand in the empty-capable hall", () => {
    const emptyHall = layoutRooms(early).rooms.find((room) => room.id === "provisional");
    expect(emptyHall?.exhibitIds).toEqual([]);

    const floor = layoutRooms([
      ...early,
      exhibit("p", 2024, "system", "provisional"),
    ]);
    const hall = floor.rooms.find((room) => room.id === "provisional");
    expect(hall?.exhibitIds).toEqual(["p"]);
    expect(floor.rooms[0]?.exhibitIds).not.toContain("p");
  });

  it("year cursor seals later rooms", () => {
    const exhibits = [
      exhibit("a", 1943),
      exhibit("b", 1944),
      exhibit("c", 1945),
      exhibit("d", 2012, "system"),
      exhibit("e", 2013, "system"),
      exhibit("f", 2014, "turning_point"),
    ];
    const floor = layoutRooms(exhibits);
    const sealed = sealRooms(floor, 2000);
    const later = floor.rooms.find((room) => room.exhibitIds.includes("d"));
    const earlier = floor.rooms.find((room) => room.exhibitIds.includes("a"));
    expect(sealed).toContain(later?.id);
    expect(sealed).toContain("provisional");
    expect(sealed).not.toContain(earlier?.id);
  });
});
