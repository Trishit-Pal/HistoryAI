"use client";

import { Html, useCursor } from "@react-three/drei";
import { type ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { CircleGeometry, Color, CylinderGeometry, type InstancedMesh, MathUtils, Matrix4, Quaternion, Vector3 } from "three";
import type { GlobeCountry } from "../../src/globe/types";
import { CHALK_DIM, PALETTE, REDLINE } from "../../src/museum/theme";
import { latLonToVector } from "./geo";

export const EARTH_RADIUS = 1;
// Height ∝ log10(1 + models): one model reads, and the two leaders do not leave the planet.
const HEIGHT_PER_DECADE = 0.17;
const COLUMN_RADIUS = 0.011;
const PIN_RADIUS = 0.024;
// Just off the surface, so neither the pins nor the columns' feet fight the Earth for depth.
const LIFT = 1.002;
// ~1 s to settle: e^(-DAMP · 1 s) ≈ 1.5% left; within SETTLED the columns snap and stop asking for frames.
const DAMP = 4.2;
const SETTLED = 1e-4;

const UP = new Vector3(0, 1, 0);
const GOLD = new Color(REDLINE);
const GOLD_SOFT = new Color(PALETTE["gold-soft"]);
const UNLIT = new Color(CHALK_DIM).multiplyScalar(0.55);

export interface ColumnsProps {
  countries: GlobeCountry[];
  year: number;
  selected: string | null;
  reduced: boolean;
  onSelect: (country: string) => void;
}

function heightFor(country: GlobeCountry, year: number): number {
  const models = country.models.filter((model) => model.year <= year).length;
  return HEIGHT_PER_DECADE * Math.log10(1 + models);
}

/** One pin per country and one instanced gold column on it; the columns ease to the year's height. */
export function Columns({ countries, year, selected, reduced, onSelect }: ColumnsProps) {
  const invalidate = useThree((state) => state.invalidate);
  const columns = useRef<InstancedMesh>(null);
  const pins = useRef<InstancedMesh>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  useCursor(hovered !== null);

  const places = useMemo(
    () =>
      countries.map((country) => {
        const position = new Vector3(...latLonToVector(country.lat, country.lon, EARTH_RADIUS * LIFT));
        return { position, turn: new Quaternion().setFromUnitVectors(UP, position.clone().normalize()) };
      }),
    [countries],
  );
  const targets = useMemo(() => countries.map((country) => heightFor(country, year)), [countries, year]);
  const heights = useRef<number[] | null>(null);
  const columnGeometry = useMemo(() => new CylinderGeometry(COLUMN_RADIUS, COLUMN_RADIUS, 1, 14, 1).translate(0, 0.5, 0), []);
  const pinGeometry = useMemo(() => new CircleGeometry(PIN_RADIUS, 28).rotateX(-Math.PI / 2), []);
  useEffect(() => () => columnGeometry.dispose(), [columnGeometry]);
  useEffect(() => () => pinGeometry.dispose(), [pinGeometry]);

  // Pins sit still; only their colour changes, when a country arrives or is picked.
  useLayoutEffect(() => {
    const mesh = pins.current;
    if (!mesh) return;
    const matrix = new Matrix4();
    places.forEach(({ position, turn }, i) => {
      mesh.setMatrixAt(i, matrix.compose(position, turn, new Vector3(1, 1, 1)));
      const tone = countries[i].country === selected ? GOLD_SOFT : targets[i] > 0 ? GOLD : UNLIT;
      mesh.setColorAt(i, tone);
      columns.current?.setColorAt(i, countries[i].country === selected ? GOLD_SOFT : GOLD);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    if (columns.current?.instanceColor) columns.current.instanceColor.needsUpdate = true;
    invalidate();
  }, [places, countries, targets, selected, invalidate]);

  // A new year asks for a frame; the ease keeps asking only until every column settles.
  useEffect(() => invalidate(), [invalidate, targets]);

  useFrame((_, delta) => {
    const mesh = columns.current;
    if (!mesh) return;
    const now = (heights.current ??= reduced ? [...targets] : targets.map(() => 0));
    const matrix = new Matrix4();
    const scale = new Vector3();
    let moving = false;
    targets.forEach((target, i) => {
      const next = reduced ? target : MathUtils.damp(now[i], target, DAMP, Math.min(delta, 0.1));
      now[i] = Math.abs(next - target) <= SETTLED ? target : next;
      if (now[i] !== target) moving = true;
      // A zero-height column is scaled away entirely, so an unlit country shows only its pin.
      scale.set(now[i] > 0 ? 1 : 0, Math.max(now[i], 1e-6), now[i] > 0 ? 1 : 0);
      mesh.setMatrixAt(i, matrix.compose(places[i].position, places[i].turn, scale));
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
    if (moving) invalidate();
  });

  const pick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (event.instanceId !== undefined) onSelect(countries[event.instanceId].country);
  };
  const hover = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHovered(event.instanceId ?? null);
  };
  const hoveredPlace = hovered === null ? null : places[hovered];

  return (
    <group>
      <instancedMesh ref={pins} args={[pinGeometry, undefined, countries.length]} onClick={pick} onPointerOver={hover} onPointerOut={() => setHovered(null)}>
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={columns} args={[columnGeometry, undefined, countries.length]} onClick={pick} onPointerOver={hover} onPointerOut={() => setHovered(null)}>
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      {hoveredPlace && hovered !== null ? (
        <Html position={hoveredPlace.position} center={false} className="globe-hover" pointerEvents="none">
          {countries[hovered].country}
        </Html>
      ) : null}
    </group>
  );
}
