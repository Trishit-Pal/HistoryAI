export type RoomBox = {
  name: string;
  position: [number, number, number];
  size: [number, number, number];
};

const WINTER_BAYS: Array<[string, [number, number, number], [number, number, number]]> = [
  ["front-pier", [1.7, 0.9, -0.55], [0.1, 1.8, 1.5]],
  ["back-pier", [1.7, 0.9, -3.85], [0.1, 1.8, 1.5]],
  ["outer-wall", [3.25, 0.9, -2.2], [0.1, 1.8, 1.9]],
  ["alcove-front", [2.5, 0.9, -1.25], [1.5, 1.8, 0.1]],
  ["alcove-back", [2.5, 0.9, -3.15], [1.5, 1.8, 0.1]],
];

export function firstWinterBoxes(): RoomBox[] {
  return [-1, 1].flatMap((side) => {
    const label = side < 0 ? "l" : "r";
    return WINTER_BAYS.map(([name, position, size]) => ({
      name: `${label}-${name}`,
      position: [side * position[0], position[1], position[2]],
      size,
    }));
  });
}

export const TRANSFORMER_SCREEN_SIZE: [number, number, number] = [0.16, 2.5, 1.2];
export const TRANSFORMER_SCREEN_Y = 1.25;
export const TRANSFORMER_SCREEN_Z_OFFSET = -1.15;
export const TRANSFORMER_FLOOR_CENTER_Z = -1.8;
export const TRANSFORMER_FLOOR_DEPTH = 3.6;

export function transformerScreenBox(spot: { x: number; z: number }): RoomBox {
  return {
    name: "screen",
    position: [spot.x, TRANSFORMER_SCREEN_Y, spot.z + TRANSFORMER_SCREEN_Z_OFFSET],
    size: TRANSFORMER_SCREEN_SIZE,
  };
}
