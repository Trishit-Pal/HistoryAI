"use client";

import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";
import { type ElementRef, useCallback, useEffect, useRef } from "react";
import {
  type Bounds,
  DEFAULT_POSE,
  type Pose,
  type ViewRequest,
  clampTarget,
  presetPose,
  restPose,
} from "../../src/atlas/projection";
import { cameraMove } from "../../src/museum/view";

const MOVE_SECONDS = 1.1;
const ENTRANCE_SECONDS = 1.8;
const MIN_DISTANCE = 4;
const MAX_DISTANCE = 45;
// Nearly straight over and straight under, so every model can be reached from any side.
const MIN_POLAR_ANGLE = Math.PI * 0.02;
const MAX_POLAR_ANGLE = Math.PI * 0.98;
const DAMPING = 0.08;
// Resizing refits to the nearest tenth of an aspect ratio, so a drag-resize does not restart the move every pixel.
const ASPECT_STEPS = 10;

type Controls = ElementRef<typeof OrbitControls>;

interface CameraRigProps {
  /** Where to look. Null means the resting view of the whole plot. */
  pose: Pose | null;
  /** Which view to rest in when no model is focused. */
  view: ViewRequest;
  /** What the resting and preset views fit: the visible models. */
  fit: Bounds;
  /** Where the camera's target may pan to. */
  limits: Bounds;
  reduced: boolean;
}

/**
 * Orbit with damping for the visitor's own moves. Moves the program makes (arriving, focusing a
 * model, resetting) ease over about a second, or snap when the visitor prefers reduced motion.
 * The Canvas starts the camera at the entrance pose, so the first move is the arrival.
 */
export function CameraRig({ pose, view, fit, limits, reduced }: CameraRigProps) {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const aspect = size.height > 0 ? size.width / size.height : 1;
  // Read at the moment of a move, not a dependency: switching measure must not move the camera.
  const latest = useRef({ aspect, fit, limits });
  latest.current = { aspect, fit, limits };
  // With nothing focused a resize refits the view; with a model focused it leaves the camera alone.
  const refit = pose ? 0 : Math.round(aspect * ASPECT_STEPS);
  const arrived = useRef(false);
  // The store holds the controls once they exist; depending on it re-runs the move at that point.
  const controls = useThree((state) => state.controls) as unknown as Controls | null;

  useEffect(() => {
    if (!controls) return;
    const { aspect: now, fit: bounds } = latest.current;
    const goal = pose ?? (view.name === "rest" ? restPose(now, bounds) : presetPose(view.name, now, bounds));
    const stop = () => {
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(controls.target);
    };
    stop();

    if (cameraMove(reduced) === "snap") {
      camera.position.set(...goal.position);
      controls.target.set(...goal.lookAt);
      controls.update();
      arrived.current = true;
      return;
    }
    const duration = arrived.current ? MOVE_SECONDS : ENTRANCE_SECONDS;
    gsap.to(camera.position, {
      x: goal.position[0],
      y: goal.position[1],
      z: goal.position[2],
      duration,
      ease: "power2.inOut",
      onComplete: () => {
        arrived.current = true;
      },
    });
    gsap.to(controls.target, {
      x: goal.lookAt[0],
      y: goal.lookAt[1],
      z: goal.lookAt[2],
      duration,
      ease: "power2.inOut",
    });
    return stop;
  }, [camera, controls, pose, view, refit, reduced]);

  // Panning drags the target; carry the camera with it when the target is held at the edge of the
  // plot, so the view stops there instead of rotating.
  const keepInside = useCallback(() => {
    if (!controls) return;
    const { target } = controls;
    const [x, y, z] = clampTarget([target.x, target.y, target.z], latest.current.limits);
    const [dx, dy, dz] = [x - target.x, y - target.y, z - target.z];
    if (dx === 0 && dy === 0 && dz === 0) return;
    target.set(x, y, z);
    camera.position.set(camera.position.x + dx, camera.position.y + dy, camera.position.z + dz);
  }, [camera, controls]);

  return (
    <OrbitControls
      makeDefault
      target={[...DEFAULT_POSE.lookAt]}
      enableDamping={!reduced}
      dampingFactor={DAMPING}
      minDistance={MIN_DISTANCE}
      maxDistance={MAX_DISTANCE}
      minPolarAngle={MIN_POLAR_ANGLE}
      maxPolarAngle={MAX_POLAR_ANGLE}
      onChange={keepInside}
      onStart={() => {
        // A drag takes over from any move in progress.
        gsap.killTweensOf(camera.position);
        if (controls) gsap.killTweensOf(controls.target);
      }}
    />
  );
}
