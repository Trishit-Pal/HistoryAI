"use client";

import { Billboard, Text, useCursor } from "@react-three/drei";
import { useState } from "react";
import { type GovernanceView, governanceX } from "../../src/atlas/governance";
import { gridBounds } from "../../src/atlas/grid";
import { ATLAS_PALETTE } from "../../src/atlas/theme";
import { LABEL_FONT } from "../labelFont";

const PIN_HEIGHT = 2.6;
const PIN_RADIUS = 0.05;
const GEM_SIZE = 0.5;
const LABEL_SIZE = 0.6;
const RAIL_GAP = 2.2;
const ACTIVE_GROWTH = 1.5;

interface GovernanceRibbonProps {
  markers: readonly GovernanceView[];
  laneCount: number;
  selected: string | null;
  onSelect: (id: string) => void;
}

/** Laws, treaties and frameworks, standing on a rail behind the plot at the year they took effect. */
export function GovernanceRibbon({ markers, laneCount, selected, onSelect }: GovernanceRibbonProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const { zBack, xMin } = gridBounds(laneCount);
  const z = zBack - RAIL_GAP;
  useCursor(hovered !== null);

  return (
    <group>
      <Text
        font={LABEL_FONT}
        fontSize={LABEL_SIZE}
        color={ATLAS_PALETTE.cyan}
        position={[xMin, 0.02, z + 1.2]}
        rotation={[-Math.PI / 2, 0, 0]}
        anchorX="left"
        anchorY="middle"
      >
        Governance
      </Text>
      {markers.map((marker) => {
        const active = selected === marker.id || hovered === marker.id;
        return (
          <group key={marker.id} position={[governanceX(marker), 0, z]}>
            <mesh position={[0, PIN_HEIGHT / 2, 0]}>
              <cylinderGeometry args={[PIN_RADIUS, PIN_RADIUS, PIN_HEIGHT, 6]} />
              <meshBasicMaterial color={ATLAS_PALETTE.cyan} />
            </mesh>
            <mesh
              position={[0, PIN_HEIGHT, 0]}
              scale={active ? ACTIVE_GROWTH : 1}
              onClick={(event) => {
                event.stopPropagation();
                onSelect(marker.id);
              }}
              onPointerOver={(event) => {
                event.stopPropagation();
                setHovered(marker.id);
              }}
              onPointerOut={() => setHovered(null)}
            >
              <octahedronGeometry args={[GEM_SIZE]} />
              <meshStandardMaterial
                color={ATLAS_PALETTE.cyan}
                emissive={ATLAS_PALETTE.cyan}
                emissiveIntensity={active ? 0.8 : 0.25}
              />
            </mesh>
            <Billboard position={[0, PIN_HEIGHT + 1, 0]}>
              <Text
                font={LABEL_FONT}
                fontSize={LABEL_SIZE}
                color={ATLAS_PALETTE.cyan}
                outlineWidth={0.04}
                outlineColor={ATLAS_PALETTE.ground}
                anchorX="center"
                anchorY="bottom"
              >
                {marker.short}
              </Text>
            </Billboard>
          </group>
        );
      })}
    </group>
  );
}
