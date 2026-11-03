"use client";

import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";
import { type ElementRef, useEffect, useRef } from "react";
import { DEFAULT_POSE, type Pose, restPose } from "../../src/atlas/projection";
import { cameraMove } from "../../src/museum/view";

const MOVE_SECONDS = 1.1;
const ENTRANCE_SECONDS = 1.8;
const MIN_DISTANCE = 5;
const MAX_DISTANCE = 90;
// Stay above the floor: just short of looking straight along it.
const MAX_POLAR_ANGLE = Math.PI * 0.49;

type Controls = ElementRef<typeof OrbitControls>;

interface CameraRigProps {
  /** Where to look. Null means the resting view of the whole plot. */
  pose: Pose | null;
  reduced: boolean;
}

/**
 * Orbit with damping for the visitor's own moves. Moves the program makes (arriving, focusing a
 * model, resetting) ease over about a second, or snap when the visitor prefers reduced motion.
 * The Canvas starts the camera at the entrance pose, so the first move is the arrival.
 */
export function CameraRig({ pose, reduced }: CameraRigProps) {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  // Read at the moment of a move, not a dependency: resizing the window must not yank the camera
  // back from wherever the visitor has orbited to.
  const aspect = useRef(1);
  aspect.current = size.height > 0 ? size.width / size.height : 1;
  // The store holds the controls once they exist; depending on it re-runs the move at that point.
  const controls = useThree((state) => state.controls) as unknown as Controls | null;

  useEffect(() => {
    if (!controls) return;
    const goal = pose ?? restPose(aspect.current);
    const stop = () => {
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(controls.target);
    };
    stop();

    if (cameraMove(reduced) === "snap") {
      camera.position.set(...goal.position);
      controls.target.set(...goal.lookAt);
      controls.update();
      return;
    }
    const duration = pose ? MOVE_SECONDS : ENTRANCE_SECONDS;
    gsap.to(camera.position, {
      x: goal.position[0],
      y: goal.position[1],
      z: goal.position[2],
      duration,
      ease: "power2.inOut",
    });
    gsap.to(controls.target, {
      x: goal.lookAt[0],
      y: goal.lookAt[1],
      z: goal.lookAt[2],
      duration,
      ease: "power2.inOut",
    });
    return stop;
  }, [camera, controls, pose, reduced]);

  return (
    <OrbitControls
      makeDefault
      target={[...DEFAULT_POSE.lookAt]}
      enableDamping={!reduced}
      minDistance={MIN_DISTANCE}
      maxDistance={MAX_DISTANCE}
      maxPolarAngle={MAX_POLAR_ANGLE}
      onStart={() => {
        // A drag takes over from any move in progress.
        gsap.killTweensOf(camera.position);
        if (controls) gsap.killTweensOf(controls.target);
      }}
    />
  );
}
