import { describe, expect, it } from "vitest";
import { assertEpochLicence } from "./licenceGuard";

const README_OK = `## Licensing
Epoch AI's data is free to use, distribute, and reproduce provided the source and authors are credited under the [Creative Commons Attribution license](https://creativecommons.org/licenses/by/4.0/).`;

describe("assertEpochLicence", () => {
  it("accepts the CC BY 4.0 wording we recorded in the registry", () => {
    expect(() => assertEpochLicence(README_OK)).not.toThrow();
  });

  it("refuses a README whose licence link changed, so a refresh cannot ship under unread terms", () => {
    const changed = README_OK.replace("licenses/by/4.0", "licenses/by-nc/4.0");
    expect(() => assertEpochLicence(changed)).toThrow(/licence/i);
  });

  it("refuses a missing README", () => {
    expect(() => assertEpochLicence(undefined)).toThrow(/README/);
  });
});
