import { useSyncExternalStore } from "react";

export function hasWebGL(): boolean {
  if (typeof document === "undefined") return false;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("webgl2") || canvas.getContext("webgl");
  if (!context) return false;
  // A probe is not the scene: give the context back so it never counts against the browser's limit.
  (context as WebGLRenderingContext).getExtension?.("WEBGL_lose_context")?.loseContext();
  return true;
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  if (typeof window.matchMedia !== "function") return () => {};
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function snapshot(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia(REDUCED_MOTION).matches;
}

// False on the server and during hydration, then the live preference.
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}
