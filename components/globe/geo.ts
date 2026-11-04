const DEG = Math.PI / 180;

/** A point on a sphere of `radius`, in the axes three's SphereGeometry uses for an equirectangular map. */
export function latLonToVector(lat: number, lon: number, radius: number): [number, number, number] {
  const phi = lat * DEG;
  const lambda = lon * DEG;
  return [radius * Math.cos(phi) * Math.cos(lambda), radius * Math.sin(phi), -radius * Math.cos(phi) * Math.sin(lambda)];
}
