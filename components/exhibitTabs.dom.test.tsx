// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { MuseumNode } from "../src/museum/view";
import { EXHIBIT_PANEL_ID, ExhibitTabs } from "./ExhibitTabs";

afterEach(cleanup);

function node(id: string, startYear: number): MuseumNode {
  return { id, title: `Title ${id}`, startYear } as MuseumNode;
}

const exhibits = [node("a", 1950), node("b", 1960), node("c", 1990)];

function setup(focusedId: string | null = "b", year = 2000) {
  const onFocus = vi.fn();
  render(<ExhibitTabs exhibits={exhibits} year={year} focusedId={focusedId} onFocus={onFocus} />);
  return { onFocus, list: screen.getByRole("tablist", { name: "Exhibits in this hall" }) };
}

describe("ExhibitTabs", () => {
  it("renders nothing for a hall with no exhibits", () => {
    const { container } = render(<ExhibitTabs exhibits={[]} year={2000} focusedId={null} onFocus={() => {}} />);
    expect(container.innerHTML).toBe("");
  });

  it("marks the focused exhibit selected and makes it the only tab stop", () => {
    setup("b");
    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((tab) => tab.getAttribute("aria-selected"))).toEqual(["false", "true", "false"]);
    expect(tabs.map((tab) => tab.tabIndex)).toEqual([-1, 0, -1]);
  });

  it("selects the first exhibit when the focus is in another hall", () => {
    setup("elsewhere");
    expect(screen.getAllByRole("tab")[0]!.getAttribute("aria-selected")).toBe("true");
  });

  it("selects an exhibit on click", () => {
    const { onFocus } = setup("a");
    fireEvent.click(screen.getByRole("tab", { name: /Title c/ }));
    expect(onFocus).toHaveBeenCalledWith("c");
  });

  it("moves with the arrow keys and wraps at both ends", () => {
    const { onFocus } = setup("b");
    const tabs = screen.getAllByRole("tab");
    fireEvent.keyDown(tabs[1]!, { key: "ArrowRight" });
    expect(onFocus).toHaveBeenLastCalledWith("c");
    fireEvent.keyDown(tabs[1]!, { key: "ArrowLeft" });
    expect(onFocus).toHaveBeenLastCalledWith("a");
    fireEvent.keyDown(tabs[2]!, { key: "ArrowRight" });
    expect(onFocus).toHaveBeenLastCalledWith("a");
    fireEvent.keyDown(tabs[0]!, { key: "ArrowLeft" });
    expect(onFocus).toHaveBeenLastCalledWith("c");
  });

  it("leaves Alt, Ctrl and Meta arrow shortcuts to the browser", () => {
    const { onFocus } = setup("b");
    const tab = screen.getAllByRole("tab")[1]!;
    fireEvent.keyDown(tab, { key: "ArrowLeft", altKey: true });
    fireEvent.keyDown(tab, { key: "ArrowRight", ctrlKey: true });
    fireEvent.keyDown(tab, { key: "ArrowRight", metaKey: true });
    expect(onFocus).not.toHaveBeenCalled();
  });

  it("jumps to the first and last exhibit with Home and End", () => {
    const { onFocus } = setup("b");
    const tabs = screen.getAllByRole("tab");
    fireEvent.keyDown(tabs[1]!, { key: "End" });
    expect(onFocus).toHaveBeenLastCalledWith("c");
    fireEvent.keyDown(tabs[1]!, { key: "Home" });
    expect(onFocus).toHaveBeenLastCalledWith("a");
  });

  it("keeps the arrow keys from reaching the hall-travel listener on the window", () => {
    setup("b");
    const onWindowKey = vi.fn();
    window.addEventListener("keydown", onWindowKey);
    fireEvent.keyDown(screen.getAllByRole("tab")[1]!, { key: "ArrowRight" });
    window.removeEventListener("keydown", onWindowKey);
    expect(onWindowKey).not.toHaveBeenCalled();
  });

  it("dims exhibits that start after the year cursor but still lets them be selected", () => {
    const { onFocus } = setup("a", 1955);
    const future = screen.getByRole("tab", { name: /Title c/ });
    expect(future.classList.contains("ghost")).toBe(true);
    fireEvent.click(future);
    expect(onFocus).toHaveBeenCalledWith("c");
  });

  it("points every tab at the panel it controls", () => {
    setup("a");
    for (const tab of screen.getAllByRole("tab")) expect(tab.getAttribute("aria-controls")).toBe(EXHIBIT_PANEL_ID);
  });

  it("ties each tab to its exhibit so a panel can name itself from it", () => {
    setup("a");
    expect(screen.getByRole("tab", { name: /Title a/ }).id).toBe("exhibit-tab-a");
  });
});
