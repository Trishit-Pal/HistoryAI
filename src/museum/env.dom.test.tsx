// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { hasWebGL, usePrefersReducedMotion } from "./env";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  Reflect.deleteProperty(window, "matchMedia");
});

function Probe() {
  return <p>{usePrefersReducedMotion() ? "reduced" : "full"}</p>;
}

function stubMedia(matches: boolean) {
  const listeners = new Set<() => void>();
  const query = {
    matches,
    addEventListener: (_: string, fn: () => void) => listeners.add(fn),
    removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
  };
  window.matchMedia = vi.fn(() => query) as unknown as typeof window.matchMedia;
  return {
    flip(next: boolean) {
      query.matches = next;
      listeners.forEach((fn) => fn());
    },
    listenerCount: () => listeners.size,
  };
}

describe("usePrefersReducedMotion", () => {
  it("is false where matchMedia is missing", () => {
    render(<Probe />);
    expect(screen.getByText("full")).toBeTruthy();
  });

  it("reads the current preference", () => {
    stubMedia(true);
    render(<Probe />);
    expect(screen.getByText("reduced")).toBeTruthy();
  });

  it("follows a change and stops listening on unmount", () => {
    const media = stubMedia(false);
    const view = render(<Probe />);
    expect(screen.getByText("full")).toBeTruthy();
    act(() => media.flip(true));
    expect(screen.getByText("reduced")).toBeTruthy();
    view.unmount();
    expect(media.listenerCount()).toBe(0);
  });
});

describe("hasWebGL", () => {
  it("is true when a canvas gives a webgl context", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({} as RenderingContext);
    expect(hasWebGL()).toBe(true);
  });

  it("hands the probe context back so it cannot count against the browser's limit", () => {
    const loseContext = vi.fn();
    const context = { getExtension: vi.fn(() => ({ loseContext })) };
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context as unknown as RenderingContext);
    expect(hasWebGL()).toBe(true);
    expect(context.getExtension).toHaveBeenCalledWith("WEBGL_lose_context");
    expect(loseContext).toHaveBeenCalledTimes(1);
  });

  it("is false when no context can be made", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    expect(hasWebGL()).toBe(false);
  });
});
