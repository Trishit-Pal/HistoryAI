"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { describeModel, featuredDrawn, isDrawn } from "../../src/atlas/describe";
import type { GovernanceView } from "../../src/atlas/governance";
import { hashForModel, modelFromHash } from "../../src/atlas/hash";
import type { LandmarkView } from "../../src/atlas/landmarks";
import { YEAR_AXIS } from "../../src/atlas/projection";
import { getSource } from "../../src/atlas/sources";
import type { AtlasMetric, AtlasSnapshot } from "../../src/atlas/types";
import { hasWebGL, usePrefersReducedMotion } from "../../src/museum/env";
import { AtlasControls, AtlasDetail } from "./AtlasPanel";
import { AtlasTable } from "./AtlasTable";
import { GovernanceTable } from "./GovernanceTable";

const ScaleScene = dynamic(() => import("./ScaleScene").then((mod) => mod.ScaleScene), {
  ssr: false,
  loading: () => (
    <p className="atlas-loading" role="status">
      Loading the 3D view…
    </p>
  ),
});

const SCENE_LABEL =
  "Three-dimensional plot of AI models. Left to right is the year, height is training compute or parameters, and depth separates domains. A table of the most significant models follows the plot.";

interface AtlasShellProps {
  atlas: AtlasSnapshot;
  landmarks: LandmarkView[];
  governance: GovernanceView[];
}

export function AtlasShell({ atlas, landmarks, governance }: AtlasShellProps) {
  const reduced = usePrefersReducedMotion();
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [metric, setMetric] = useState<AtlasMetric>("compute");
  const [cutoff, setCutoff] = useState<number>(YEAR_AXIS.max);
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const [markerId, setMarkerId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const epoch = getSource("epoch-ai-models");
  const stage = useRef<HTMLElement>(null);

  const landmarkByIndex = useMemo(() => new Map(landmarks.map((l) => [l.index, l])), [landmarks]);

  // Every featured model, with its exhibit link when it has one: what the plot labels and the table lists.
  const featuredViews = useMemo<LandmarkView[]>(
    () =>
      atlas.models.names.flatMap((model, index) => {
        if (!atlas.models.featured[index]) return [];
        const exhibit = landmarkByIndex.get(index)?.exhibit;
        return [exhibit ? { index, model, exhibit } : { index, model }];
      }),
    [atlas, landmarkByIndex],
  );
  const featuredByName = useMemo(() => new Map(featuredViews.map((view) => [view.model, view.index])), [featuredViews]);
  const drawn = useMemo(() => featuredDrawn(atlas.models, metric), [atlas, metric]);

  const focus = useCallback(
    (index: number | null) => {
      setFocused(index);
      if (index !== null) setMarkerId(null);
      // Only featured models get an address; one picked from "Show all" has none to share.
      const isFeatured = index !== null && atlas.models.featured[index];
      const hash = hashForModel(isFeatured ? atlas.models.names[index] : null);
      window.history.replaceState(null, "", hash || window.location.pathname + window.location.search);
    },
    [atlas],
  );

  // A table row can be far below the plot, so bring the plot into view as the camera flies to the model.
  const showFromTable = useCallback(
    (index: number) => {
      focus(index);
      stage.current?.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
    },
    [focus, reduced],
  );

  useEffect(() => {
    setWebgl(hasWebGL());
  }, []);

  // Follow the address: on arrival, and when a pasted link or Back and Forward changes the hash.
  // Our own focus() uses replaceState, which does not fire hashchange, so this never loops.
  useEffect(() => {
    const followHash = (clearWhenEmpty: boolean) => {
      const named = modelFromHash(window.location.hash);
      const index = named === undefined ? undefined : featuredByName.get(named);
      if (index !== undefined) {
        setFocused(index);
        setMarkerId(null);
      } else if (clearWhenEmpty) {
        setFocused(null);
      }
    };
    followHash(false);
    const onHashChange = () => followHash(true);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [featuredByName]);

  // Turning "Show all" off must not leave the panel, the camera or the table on a dot that is no longer drawn.
  const changeShowAll = useCallback(
    (next: boolean) => {
      setShowAll(next);
      if (next) return;
      if (focused !== null && !isDrawn(atlas.models.featured, focused, false)) focus(null);
      setHovered((current) => (isDrawn(atlas.models.featured, current, false) ? current : null));
    },
    [atlas, focused, focus],
  );

  const selectMarker = useCallback(
    (id: string) => {
      setMarkerId(id);
      focus(null);
    },
    [focus],
  );

  const marker = governance.find((candidate) => candidate.id === markerId) ?? null;
  const shown = hovered ?? focused;
  const facts = shown === null ? null : describeModel(atlas, shown);
  const shownExhibit = shown === null ? undefined : landmarkByIndex.get(shown)?.exhibit;

  return (
    <main className="night atlas">
      <header className="atlas-intro">
        <h1>The scale of AI</h1>
        <p>
          Each dot is an AI model. Left to right is the year it was published. Height is the training compute, or the
          parameter count, that Epoch AI estimates for it. Each row of dots is one domain, such as language or vision. The plot
          shows the {atlas.totals.featured} most significant models, and one switch brings back the rest.
        </p>
      </header>

      <section ref={stage} className="atlas-stage" aria-label="Interactive plot">
        <div className="atlas-canvas" role="img" aria-label={SCENE_LABEL}>
          {webgl === true ? (
            <ScaleScene
              atlas={atlas}
              labels={featuredViews}
              governance={governance}
              markerId={markerId}
              metric={metric}
              cutoff={cutoff}
              showAll={showAll}
              hovered={hovered}
              focused={focused}
              reduced={reduced}
              onHover={setHovered}
              onFocus={focus}
              onMarker={selectMarker}
            />
          ) : webgl === false ? (
            <p className="atlas-nowebgl">
              This browser cannot draw the 3D view, so the same landmark models are listed in the table below.
            </p>
          ) : null}
        </div>
        <aside className="atlas-side">
          <AtlasControls
            metric={metric}
            cutoff={cutoff}
            totals={atlas.totals}
            showAll={showAll}
            drawn={drawn}
            canReset={focused !== null}
            onMetric={setMetric}
            onShowAll={changeShowAll}
            onCutoff={setCutoff}
            onReset={() => focus(null)}
          />
          <AtlasDetail facts={facts} exhibit={shownExhibit} marker={marker} />
        </aside>
      </section>

      <section className="atlas-block">
        <h2>The most significant models</h2>
        <AtlasTable atlas={atlas} rows={featuredViews} canShow={webgl === true} focused={focused} onShow={showFromTable} />
      </section>

      <section className="atlas-block">
        <h2>Laws, treaties and frameworks</h2>
        <GovernanceTable markers={governance} />
      </section>

      <footer className="atlas-block atlas-credit">
        <p>
          Data: {epoch.attribution} Licensed{" "}
          <a href={epoch.licenceUrl} target="_blank" rel="noopener noreferrer">
            CC BY 4.0
          </a>
          . Copied on {atlas.generatedAt}. Figures are Epoch AI&rsquo;s estimates and are shown as reported, not
          confirmed.
        </p>
      </footer>
    </main>
  );
}
