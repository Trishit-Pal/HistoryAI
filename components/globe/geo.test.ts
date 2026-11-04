import { describe, expect, it } from "vitest";
import { latLonToVector } from "./geo";

// three's SphereGeometry maps u = 0 (longitude -180) to -x, so longitude 0 faces +x and east turns towards -z.
function close(actual: [number, number, number], expected: [number, number, number]) {
  actual.forEach((value, i) => expect(value).toBeCloseTo(expected[i], 9));
}

describe("latLonToVector", () => {
  it("puts (0, 0) on +x", () => close(latLonToVector(0, 0, 1), [1, 0, 0]));
  it("puts the north pole on +y", () => close(latLonToVector(90, 0, 1), [0, 1, 0]));
  it("puts (0, 90) on -z", () => close(latLonToVector(0, 90, 1), [0, 0, -1]));
  it("puts (0, -180) on -x, the left edge of the texture", () => close(latLonToVector(0, -180, 1), [-1, 0, 0]));
  it("scales by the radius", () => close(latLonToVector(0, 0, 2.5), [2.5, 0, 0]));
});
