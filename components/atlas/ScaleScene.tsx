"use client";

import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";
import type { GovernanceView } from "../../src/atlas/governance";
import { gridBounds } from "../../src/atlas/grid";
import type { LandmarkView } from "../../src/atlas/landmarks";
import { DEFAULT_POSE, ENTRANCE_POSE, FIELD_OF_VIEW, focusPose, instanceState, readingFor } from "../../src/atlas/projection";
import { ATLAS_PALETTE } from "../../src/atlas/theme";
import type { AtlasMetric, AtlasSnapshot } from "../../src/atlas/types";
import { CameraRig } from "./CameraRig";
import { GovernanceRibbon } from "./GovernanceRibbon";
import { LandmarkLabels } from "./LandmarkLabels";
import { PlotFrame } from "./PlotFrame";
import { PointCloud } from "./PointCloud";
import { useBlend } from "./useBlend";

const FOG_DENSITY = 0.012;

export interface ScaleSceneProps {
  atlas: AtlasSnapshot;
  /** The models to label: every featured model. */
  labels: readonly LandmarkView[];
  governance: readonly GovernanceView[];
  markerId: string | null;
  metric: AtlasMetric;
  /** Models published after this year are dimmed. */
  cutoff: number;
  showAll: boolean;
  hovered: number | null;
  focused: number | null;
  reduced: boolean;
  onHover: (index: number | null) => void;
  onFocus: (index: number) => void;
  onMarker: (id: string) => void;
}

function Plot({
  atlas,
  labels,
  governance,
  markerId,
  metric,
  cutoff,
  showAll,
  hovered,
  focused,
  reduced,
  onHover,
  onFocus,
  onMarker,
}: ScaleSceneProps) {
  const blend = useBlend(metric, reduced);

  // Where the camera should look: at the focused model's place in the current metric.
  const pose = useMemo(() => {
    if (focused === null) return null;
    const { models, domains } = atlas;
    const reading = readingFor(models, focused, metric);
    const state = instanceState({
      year: models.years[focused],
      lane: models.domainIndex[focused],
      laneCount: domains.length,
      from: reading,
      to: reading,
      mix: 1,
      cutoff: Infinity,
      featured: true,
      showAll: true,
    });
    return state.scale > 0 ? focusPose(state.position, gridBounds(domains.length).zFront) : null;
  }, [atlas, focused, metric]);

  return (
    <>
      <color attach="background" args={[ATLAS_PALETTE.ground]} />
      <fogExp2 attach="fog" args={[ATLAS_PALETTE.ground, FOG_DENSITY]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 14, 8]} intensity={1.1} />
      <PlotFrame metric={metric} domains={atlas.domains} />
      <PointCloud
        atlas={atlas}
        blend={blend}
        cutoff={cutoff}
        showAll={showAll}
        hovered={hovered}
        focused={focused}
        onHover={onHover}
        onFocus={onFocus}
      />
      <LandmarkLabels
        atlas={atlas}
        labels={labels}
        blend={blend}
        cutoff={cutoff}
        focused={focused}
        onFocus={onFocus}
      />
      <GovernanceRibbon markers={governance} laneCount={atlas.domains.length} selected={markerId} onSelect={onMarker} />
      <CameraRig pose={pose} reduced={reduced} />
    </>
  );
}

export function ScaleScene(props: ScaleSceneProps) {
  // Start far back so arriving is one eased move; reduced motion starts at rest.
  const start = props.reduced ? DEFAULT_POSE : ENTRANCE_POSE;
  return (
    <Canvas dpr={[1, 1.5]} camera={{ fov: FIELD_OF_VIEW, near: 0.1, far: 300, position: [...start.position] }}>
      <Plot {...props} />
    </Canvas>
  );
}
