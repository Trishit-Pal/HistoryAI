import { describe, expect, it } from "vitest";
import { landmarkViews } from "./landmarks";

const exhibits = [
  { id: "evt_2012_alexnet", title: "AlexNet at ILSVRC", eraId: "era_7_deep_learning" as const },
  { id: "evt_no_era", title: "Unplaced", eraId: undefined },
];

describe("landmarkViews", () => {
  it("finds each landmark's point in the snapshot by its exact model name", () => {
    const views = landmarkViews(["Theseus", "AlexNet", "Other"], exhibits);
    const alexnet = views.find((view) => view.model === "AlexNet");
    expect(alexnet?.index).toBe(1);
    expect(views.find((view) => view.model === "Theseus")?.index).toBe(0);
  });

  it("links a landmark to its exhibit page through the era slug", () => {
    const view = landmarkViews(["AlexNet"], exhibits).find((v) => v.model === "AlexNet");
    expect(view?.exhibit).toEqual({
      id: "evt_2012_alexnet",
      title: "AlexNet at ILSVRC",
      href: "/rooms/deep-learning/evt_2012_alexnet",
    });
  });

  it("leaves milestone models without an exhibit unlinked", () => {
    const view = landmarkViews(["Theseus"], exhibits).find((v) => v.model === "Theseus");
    expect(view?.exhibit).toBeUndefined();
  });

  it("skips a landmark whose model is not in the snapshot rather than pointing at a wrong row", () => {
    const views = landmarkViews(["Theseus"], exhibits);
    expect(views.map((view) => view.model)).toEqual(["Theseus"]);
  });

  it("drops the exhibit link when the exhibit is unknown or has no era", () => {
    expect(landmarkViews(["AlexNet"], []).find((v) => v.model === "AlexNet")?.exhibit).toBeUndefined();
    const noEra = [{ id: "evt_2012_alexnet", title: "AlexNet", eraId: undefined }];
    expect(landmarkViews(["AlexNet"], noEra).find((v) => v.model === "AlexNet")?.exhibit).toBeUndefined();
  });
});
