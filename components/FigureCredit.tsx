import type { Figure, FigureLicense } from "../src/domain/types";

const LICENSE_LABEL: Record<FigureLicense, string> = {
  "PD-old": "Public domain (author died over 100 years ago)",
  "PD-US-expired": "Public domain in the US",
  "CC0-1.0": "CC0 1.0",
  "CC-BY-4.0": "CC BY 4.0",
  "CC-BY-SA-4.0": "CC BY-SA 4.0",
  original: "Original illustration for this museum",
};

export function FigureCredit({ figure }: { figure?: Figure }) {
  if (!figure) return null;
  const label = figure.sourceLabel ?? "Source";
  return (
    <figure className="exhibit-figure">
      <img src={figure.src} alt={figure.alt} />
      <figcaption>
        <p>{figure.credit}</p>
        <p>{LICENSE_LABEL[figure.license]}</p>
        <a href={figure.sourceUrl}>Source: {label}</a>
        {figure.kind === "redrawn" && figure.redrawnAfter ? (
          <p>
            Redrawn after <a href={figure.redrawnAfter}>{label}</a>
          </p>
        ) : null}
      </figcaption>
    </figure>
  );
}
