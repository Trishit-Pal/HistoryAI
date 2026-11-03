import { describe, expect, it } from "vitest";
import { ATLAS_PATH, atlasLinkFor } from "./links";

describe("atlasLinkFor", () => {
  it("sends a landmark exhibit to its model, hash included, so the atlas opens focused on it", () => {
    expect(atlasLinkFor("evt_2012_alexnet")).toBe(`${ATLAS_PATH}#model=AlexNet`);
    expect(atlasLinkFor("evt_2017_transformer")).toBe(`${ATLAS_PATH}#model=Transformer`);
  });

  it("sends a governance exhibit to the atlas, where its marker stands", () => {
    expect(atlasLinkFor("evt_2024_eu_ai_act")).toBe(ATLAS_PATH);
  });

  it("gives no link to an exhibit the atlas does not show", () => {
    expect(atlasLinkFor("evt_1966_eliza")).toBeUndefined();
    expect(atlasLinkFor("nonsense")).toBeUndefined();
  });
});
