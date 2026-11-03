// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { ERAS } from "../../src/domain/eras";
import { eraLayout } from "../../src/museum/eraRooms";
import { ERA_ROOMS } from "./eraRoomMap";
import { PrecursorsRoom } from "./PrecursorsRoom";

describe("era room map", () => {
  it("has a room for every era and keeps Precursors as its own component", () => {
    expect(Object.keys(ERA_ROOMS).sort()).toEqual(ERAS.map((era) => era.id).sort());
    expect(ERA_ROOMS.era_0_precursors).toBe(PrecursorsRoom);
    expect("provisional" in ERA_ROOMS).toBe(false);
  });

  it("gives founding and frontier different floors, and leaves the provisional hall unmapped", () => {
    const founding = eraLayout("era_1_founding", ["a", "b"]);
    const frontier = eraLayout("era_10_frontier", ["a", "b", "c", "d"]);
    const symbolic = eraLayout("era_2_symbolic", ["a", "b", "c", "d", "e"]);
    const transformers = eraLayout("era_8_transformers", ["a", "b"]);
    const generative = eraLayout("era_9_generative", ["a", "b"]);
    const statistical = eraLayout("era_6_statistical", ["evt_1997_deep_blue", "evt_2011_watson"]);
    expect(founding?.[0].z).toBe(founding?.[1].z);
    expect(founding?.[0].x).toBeLessThan(0);
    expect(founding?.[1].x).toBeGreaterThan(0);
    expect(frontier?.[3].z).toBeLessThan(frontier?.[0].z ?? 0);
    expect(symbolic?.[4].y).toBeLessThan(symbolic?.[0].y ?? 0);
    expect(Math.abs((generative?.[0].x ?? 0) - (generative?.[1].x ?? 0))).toBeGreaterThan(
      Math.abs((transformers?.[0].x ?? 0) - (transformers?.[1].x ?? 0)),
    );
    expect(statistical?.[0].y).toBeLessThan(statistical?.[1].y ?? 0);
    expect(eraLayout("provisional", ["a"])).toBeUndefined();
    expect(eraLayout("era_0_precursors", ["a"])).toBeUndefined();
  });
});
