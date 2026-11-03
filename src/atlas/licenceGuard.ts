import { getSource } from "./sources";

/**
 * The registry says Epoch's data is CC BY 4.0. If the README shipped inside the zip stops saying
 * so, stop: someone has to read the new terms before the atlas redistributes the numbers.
 */
export function assertEpochLicence(readme: string | undefined): void {
  if (readme === undefined) {
    throw new Error("Epoch zip has no README.md, so its licence cannot be checked.");
  }
  const registered = getSource("epoch-ai-models").licenceUrl;
  if (!readme.includes(registered)) {
    throw new Error(
      `Epoch's README no longer links the registered licence (${registered}). Read the new terms, then update src/atlas/sources.ts.`,
    );
  }
}
