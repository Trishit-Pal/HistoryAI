import { describe, expect, it } from "vitest";
import { layoutHalls } from "../domain/layout";
import { seedMuseum } from "../seed/eras";
import { eraLayout } from "./eraRooms";
import {
  firstWinterBoxes,
  TRANSFORMER_FLOOR_CENTER_Z,
  TRANSFORMER_FLOOR_DEPTH,
  TRANSFORMER_SCREEN_SIZE,
  TRANSFORMER_SCREEN_Y,
  transformerScreenBox,
  type RoomBox,
} from "./roomBoxes";

type Vec3 = [number, number, number];

function bounds(box: RoomBox): { min: Vec3; max: Vec3 } {
  return {
    min: [box.position[0] - box.size[0] / 2, box.position[1] - box.size[1] / 2, box.position[2] - box.size[2] / 2],
    max: [box.position[0] + box.size[0] / 2, box.position[1] + box.size[1] / 2, box.position[2] + box.size[2] / 2],
  };
}

function segmentHitsAabb(from: Vec3, to: Vec3, min: Vec3, max: Vec3): boolean {
  let tmin = 0;
  let tmax = 1;
  for (let i = 0; i < 3; i += 1) {
    const delta = to[i] - from[i];
    if (Math.abs(delta) < 1e-9) {
      if (from[i] < min[i] || from[i] > max[i]) return false;
      continue;
    }
    let enter = (min[i] - from[i]) / delta;
    let exit = (max[i] - from[i]) / delta;
    if (enter > exit) [enter, exit] = [exit, enter];
    tmin = Math.max(tmin, enter);
    tmax = Math.min(tmax, exit);
    if (tmin > tmax) return false;
  }
  return true;
}

function aabbOverlaps(a: { min: Vec3; max: Vec3 }, b: { min: Vec3; max: Vec3 }): boolean {
  return (
    a.min[0] < b.max[0] &&
    a.max[0] > b.min[0] &&
    a.min[1] < b.max[1] &&
    a.max[1] > b.min[1] &&
    a.min[2] < b.max[2] &&
    a.max[2] > b.min[2]
  );
}

function contains(box: RoomBox, point: Vec3): boolean {
  const { min, max } = bounds(box);
  return point.every((value, index) => value >= min[index] && value <= max[index]);
}

function sight(spot: { x: number; y: number; z: number }): { from: Vec3; to: Vec3 } {
  return {
    from: [0, 1.6 + spot.y, spot.z + 4.2],
    to: [spot.x, 1.2 + spot.y, spot.z],
  };
}

function hitNames(from: Vec3, to: Vec3, boxes: RoomBox[]): string[] {
  return boxes.filter((box) => {
    const { min, max } = bounds(box);
    return segmentHitsAabb(from, to, min, max);
  }).map((box) => box.name);
}

function placed(center: Vec3, size: Vec3): { min: Vec3; max: Vec3 } {
  return bounds({ name: "piece", position: center, size });
}

function seededHall(id: string): string[] {
  const nodes = seedMuseum()
    .publicExhibits()
    .map((e) => ({ id: e.id, title: e.title, kind: e.kind, startYear: e.startYear, publicationState: e.publicationState as "canon", eraId: e.eraId }));
  return layoutHalls(nodes).find((hall) => hall.id === id)?.exhibitIds ?? [];
}

describe("seeded 2017–2026 rooms", () => {
  // A plinth disc is 0.64 in radius, so two exhibits closer than this would overlap.
  const CLEARANCE = 1.3;

  it.each([
    ["era_8_transformers", 3, 2.1],
    ["era_9_generative", 5, 3.7],
    ["era_10_frontier", 12, 3.1],
  ])("gives every exhibit in %s its own spot", (hallId, count, wall) => {
    const ids = seededHall(hallId);
    expect(ids).toHaveLength(count);
    const spots = eraLayout(hallId, ids) ?? [];
    expect(spots.map((spot) => spot.id)).toEqual(ids);
    for (const [i, a] of spots.entries()) {
      expect(Math.abs(a.x) + 0.64, a.id).toBeLessThan(wall);
      for (const b of spots.slice(i + 1)) expect(Math.hypot(a.x - b.x, a.z - b.z), `${a.id}/${b.id}`).toBeGreaterThan(CLEARANCE);
    }
  });

  it("keeps the three transformer screens on the floor and out of every sightline", () => {
    const spots = eraLayout("era_8_transformers", seededHall("era_8_transformers")) ?? [];
    const screens = spots.map((spot) => transformerScreenBox(spot));
    const floorMinZ = TRANSFORMER_FLOOR_CENTER_Z - TRANSFORMER_FLOOR_DEPTH / 2;
    for (const screen of screens) expect(bounds(screen).min[2]).toBeGreaterThan(floorMinZ);
    for (const spot of spots) {
      const { from, to } = sight(spot);
      expect(hitNames(from, to, screens), spot.id).toEqual([]);
    }
  });
});

describe("room sightlines", () => {
  it("keeps the first-winter look point in the bay mouth", () => {
    const spots = eraLayout("era_3_first_winter", ["a", "b"]);
    const walls = firstWinterBoxes();
    expect(spots).toEqual([
      { id: "a", x: -2, y: 0, z: -2.2 },
      { id: "b", x: 2, y: 0, z: -2.2 },
    ]);
    expect(walls).toHaveLength(10);
    for (const spot of spots ?? []) {
      const { from, to } = sight(spot);
      expect(hitNames(from, to, walls)).toEqual([]);
      const pieces = [
        placed([spot.x, 0.08, spot.z], [0.85, 0.12, 0.85]),
        placed([spot.x, 0.46, spot.z], [1.32, 0.92, 1.32]),
        placed([spot.x, spot.y + 0.55, spot.z + 0.5], [0.72, 0.48, 0]),
      ];
      for (const piece of pieces) {
        expect(walls.some((wall) => aabbOverlaps(piece, bounds(wall)))).toBe(false);
      }
    }
    expect(hitNames(...Object.values(sight({ x: 2.45, y: 0, z: -2.2 })) as [Vec3, Vec3], walls)).toEqual([
      "r-front-pier",
      "r-alcove-front",
    ]);
    expect(hitNames(...Object.values(sight({ x: -2.45, y: 0, z: -2.2 })) as [Vec3, Vec3], walls)).toEqual([
      "l-front-pier",
      "l-alcove-front",
    ]);
    expect(hitNames(...Object.values(sight({ x: 2.1, y: 0, z: -2.2 })) as [Vec3, Vec3], walls)).toEqual(["r-front-pier"]);
    expect(hitNames(...Object.values(sight({ x: -2.1, y: 0, z: -2.2 })) as [Vec3, Vec3], walls)).toEqual(["l-front-pier"]);
  });

  it("keeps the transformer look point in front of the screen", () => {
    const spots = eraLayout("era_8_transformers", ["a", "b"]);
    expect(spots).toEqual([
      { id: "a", x: -0.85, y: 0, z: -1.7 },
      { id: "b", x: 0.85, y: 0, z: -1.7 },
    ]);
    const floorMinZ = TRANSFORMER_FLOOR_CENTER_Z - TRANSFORMER_FLOOR_DEPTH / 2;
    for (const spot of spots ?? []) {
      const screen = transformerScreenBox(spot);
      const { min, max } = bounds(screen);
      expect(screen.size).toEqual(TRANSFORMER_SCREEN_SIZE);
      expect(screen.position[0]).toBe(spot.x);
      expect(screen.position[1]).toBe(TRANSFORMER_SCREEN_Y);
      expect(screen.position[2]).toBeCloseTo(spot.z - 1.15);
      expect(max[2]).toBeCloseTo(spot.z - 0.55);
      expect(max[2]).toBeLessThan(spot.z - 0.425);
      expect(min[2]).toBeCloseTo(spot.z - 1.75);
      expect(min[2]).toBeGreaterThan(floorMinZ);
      const look: Vec3 = [spot.x, 1.2, spot.z];
      expect(contains(screen, look)).toBe(false);
      const { from, to } = sight(spot);
      expect(segmentHitsAabb(from, to, min, max)).toBe(false);
      const buried: RoomBox = {
        name: "old-screen",
        position: [spot.x, TRANSFORMER_SCREEN_Y, spot.z - 0.45],
        size: TRANSFORMER_SCREEN_SIZE,
      };
      expect(contains(buried, look)).toBe(true);
    }
  });
});
