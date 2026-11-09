"use client";

import dynamic from "next/dynamic";
import { type KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { describeModel, featuredDrawn, isDrawn, visibleModels } from "../../src/atlas/describe";
import type { GovernanceView } from "../../src/atlas/governance";
import { hashForModel, modelFromHash } from "../../src/atlas/hash";
import type { LandmarkView } from "../../src/atlas/landmarks";
import { type ViewRequest, YEAR_AXIS } from "../../src/atlas/projection";
import { getSource } from "../../src/atlas/sources";
import type { AtlasMetric, AtlasSnapshot } from "../../src/atlas/types";
import { hasWebGL, usePrefersReducedMotion } from "../../src/museum/env";
import { AtlasHowTo, AtlasLegend } from "./AtlasLegend";
import { AtlasControls, AtlasDetail, AtlasViews } from "./AtlasPanel";
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
  "3D plot of AI models: year left to right, training compute or parameters as height, domain as depth. A table of the most significant models follows.";

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
  const [view, setView] = useState<ViewRequest>({ name: "rest", seq: 0 });
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
      // Whatever clears focus lands on the whole plot, not a preset left over from earlier.
      else setView((current) => ({ name: "rest", seq: current.seq + 1 }));
      // Only featured models get an address; one picked from "Show all" has none to share.
      const isFeatured = index !== null && atlas.models.featured[index];
      const hash = hashForModel(isFeatured ? atlas.models.names[index] : null);
      window.history.replaceState(null, "", hash || window.location.pathname + window.location.search);
    },
    [atlas],
  );

  // Clearing focus and asking for a view together: Reset still works when nothing is focused but the visitor has orbited away.
  const showView = useCallback(
    (name: ViewRequest["name"]) => {
      focus(null);
      setView((current) => ({ name, seq: current.seq + 1 }));
    },
    [focus],
  );

  // Previous and next walk the models that are drawn, oldest first, and wrap round at the ends.
  const step = useCallback(
    (direction: -1 | 1) => {
      const order = visibleModels(atlas.models, metric, showAll);
      if (order.length === 0) return;
      const at = focused === null ? -1 : order.indexOf(focused);
      const next = at < 0 ? (direction > 0 ? 0 : order.length - 1) : (at + direction + order.length) % order.length;
      focus(order[next]);
    },
    [atlas, metric, showAll, focused, focus],
  );

  const stepFromKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const direction = event.key === "ArrowRight" || event.key === "]" ? 1 : event.key === "ArrowLeft" || event.key === "[" ? -1 : 0;
    if (direction === 0) return;
    event.preventDefault();
    step(direction);
  };

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
        setView((current) => ({ name: "rest", seq: current.seq + 1 }));
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
          Each dot is an AI model. Left to right is its publication year, height is the training compute or parameter
          count Epoch AI estimates, and each row is a domain, such as language or vision.
        </p>
      </header>

      <section ref={stage} className="atlas-stage" aria-label="Interactive plot">
        <div className="atlas-plot">
          <div
            className="atlas-canvas"
            role="application"
            aria-describedby="atlas-keys-hint"
            aria-label={SCENE_LABEL}
            aria-keyshortcuts="ArrowLeft ArrowRight [ ]"
            tabIndex={webgl === true ? 0 : undefined}
            onKeyDown={stepFromKey}
          >
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
                view={view}
                reduced={reduced}
                onHover={setHovered}
                onFocus={focus}
                onMarker={selectMarker}
              />
            ) : null}
            {webgl === true ? (
              <AtlasHowTo />
            ) : webgl === false ? (
              <p className="atlas-nowebgl">
                This browser cannot draw the 3D view. The landmark models are in the table below.
              </p>
            ) : null}
          </div>
          {/* A sibling of the plot, not inside it: arrow keys on these buttons must not step between models. */}
          {webgl === true ? <AtlasViews onView={showView} onReset={() => showView("rest")} /> : null}
          {webgl === false ? null : <AtlasLegend metric={metric} domains={atlas.domains} />}
        </div>
        <aside className="atlas-side">
          <AtlasControls
            metric={metric}
            cutoff={cutoff}
            totals={atlas.totals}
            showAll={showAll}
            drawn={drawn}
            canView={webgl !== false}
            onMetric={setMetric}
            onShowAll={changeShowAll}
            onCutoff={setCutoff}
            onStep={step}
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
          . Copied on {atlas.generatedAt}. Figures are Epoch AI&rsquo;s own estimates.
        </p>
      </footer>
    </main>
  );
}
