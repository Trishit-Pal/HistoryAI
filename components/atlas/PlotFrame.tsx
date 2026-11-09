"use client";

import { Text } from "@react-three/drei";
import { useMemo } from "react";
import { ERAS } from "../../src/domain/eras";
import { AXIS_TITLE, formatParameters } from "../../src/atlas/format";
import { YEAR_TICKS, gridBounds, gridSegments, valueTicks } from "../../src/atlas/grid";
import { WORLD, xOfYear, yOfLog, zOfLane } from "../../src/atlas/projection";
import { ATLAS_PALETTE, laneColour } from "../../src/atlas/theme";
import type { AtlasMetric } from "../../src/atlas/types";
import { LABEL_FONT } from "../labelFont";

const FLAT: [number, number, number] = [-Math.PI / 2, 0, 0];
const TICK_SIZE = 0.7;
const LANE_SIZE = 0.65;
// Axis titles sit a step above the ticks, so they read first.
const TITLE_SIZE = 0.9;
// Where the titles sit, measured from the grid's edges, clear of the 0.7 ticks at zFront + 0.5 and x = xMin - 0.5.
const HEIGHT_TITLE_LIFT = 1.5;
const YEAR_TITLE_OFFSET = 1.6;
const DOMAIN_TITLE_X = 0.6;
const DOMAIN_TITLE_Z = -0.8;
const WINTERS = ERAS.filter((era) => era.mood === "winter" && era.endYear !== null);

function tickLabel(metric: AtlasMetric, value: number): string {
  return metric === "compute" ? `1e${value}` : formatParameters(value);
}

interface PlotFrameProps {
  metric: AtlasMetric;
  domains: readonly string[];
}

/** The plot's frame: floor and wall lines, tick labels, domain lane names and the two AI winters. */
export function PlotFrame({ metric, domains }: PlotFrameProps) {
  const laneCount = domains.length;
  const segments = useMemo(() => gridSegments(metric, laneCount), [metric, laneCount]);
  const { xMin, xMax, zBack, zFront } = gridBounds(laneCount);
  const depth = zFront - zBack;

  return (
    <group>
      <lineSegments key={metric}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[segments, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={ATLAS_PALETTE.grid} />
      </lineSegments>

      {YEAR_TICKS.map((year) => (
        <Text
          key={year}
          font={LABEL_FONT}
          fontSize={TICK_SIZE}
          color={ATLAS_PALETTE.muted}
          position={[xOfYear(year), 0.02, zFront + 0.5]}
          rotation={FLAT}
          anchorX="center"
          anchorY="top"
        >
          {String(year)}
        </Text>
      ))}

      {valueTicks(metric).map((value) => (
        <Text
          key={`${metric}-${value}`}
          font={LABEL_FONT}
          fontSize={TICK_SIZE}
          color={ATLAS_PALETTE.muted}
          position={[xMin - 0.5, yOfLog(metric, value), zBack]}
          anchorX="right"
          anchorY="middle"
        >
          {tickLabel(metric, value)}
        </Text>
      ))}

      <Text
        font={LABEL_FONT}
        fontSize={TITLE_SIZE}
        color={ATLAS_PALETTE["gold-soft"]}
        position={[xMin, WORLD.height + HEIGHT_TITLE_LIFT, zBack]}
        anchorX="left"
        anchorY="bottom"
      >
        {AXIS_TITLE[metric]}
      </Text>

      <Text
        font={LABEL_FONT}
        fontSize={TITLE_SIZE}
        color={ATLAS_PALETTE["gold-soft"]}
        position={[(xMin + xMax) / 2, 0.02, zFront + YEAR_TITLE_OFFSET]}
        rotation={FLAT}
        anchorX="center"
        anchorY="top"
      >
        Publication year
      </Text>

      <Text
        font={LABEL_FONT}
        fontSize={TITLE_SIZE}
        color={ATLAS_PALETTE["gold-soft"]}
        position={[xMax + DOMAIN_TITLE_X, 0.02, zBack + DOMAIN_TITLE_Z]}
        rotation={FLAT}
        anchorX="left"
        anchorY="bottom"
      >
        Domain
      </Text>

      {domains.map((domain, lane) => (
        <Text
          key={domain}
          font={LABEL_FONT}
          fontSize={LANE_SIZE}
          color={laneColour(lane)}
          position={[xMax + 0.6, 0.02, zOfLane(lane, laneCount)]}
          rotation={FLAT}
          anchorX="left"
          anchorY="middle"
        >
          {domain}
        </Text>
      ))}

      {WINTERS.map((era) => {
        const start = xOfYear(era.startYear);
        const end = xOfYear(era.endYear ?? era.startYear);
        return (
          <group key={era.id}>
            <mesh position={[(start + end) / 2, WORLD.height / 2, (zBack + zFront) / 2]}>
              <boxGeometry args={[end - start, WORLD.height, depth]} />
              <meshBasicMaterial color={ATLAS_PALETTE.winter} transparent opacity={0.07} depthWrite={false} />
            </mesh>
            <Text
              font={LABEL_FONT}
              fontSize={TICK_SIZE}
              color={ATLAS_PALETTE.winter}
              position={[(start + end) / 2, WORLD.height + 0.4, zBack]}
              anchorX="center"
              anchorY="bottom"
            >
              {era.label}
            </Text>
          </group>
        );
      })}
    </group>
  );
}
