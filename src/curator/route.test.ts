import { describe, expect, it } from "vitest";
import { applyRouted, routeCandidate, type Candidate } from "./route";
import { MemoryStore } from "../store/memory";

const retrieved = "2026-09-27";

function candidate(overrides: Partial<Candidate> = {}): Candidate {
  return {
    id: "item",
    title: "A development",
    summary: "A short sourced account.",
    startYear: 2024,
    citations: [],
    ...overrides,
  };
}

describe("curator router", () => {
  it("keeps a single-source rumor rumored and unpublished", () => {
    const routed = routeCandidate(
      candidate({
        rumor: true,
        citations: [{ url: "https://blog.mean.ceo/example", publisher: "Aggregator", retrieved }],
      }),
    );
    expect(routed.confidence).toBe("rumored");
    expect(routed.routing_decision).toBe("hold_unpublished");
    const store = new MemoryStore();
    const applied = applyRouted(store, candidate({ id: "rumor" }), routed);
    expect(applied.unpublished).toBe(true);
    expect(store.getExhibit("rumor")).toBeUndefined();
  });

  it("marks two independent domains as reported", () => {
    const routed = routeCandidate(
      candidate({
        citations: [
          { url: "https://www.theverge.com/example", publisher: "The Verge", retrieved },
          { url: "https://www.reuters.com/example", publisher: "Reuters", retrieved },
        ],
      }),
    );
    expect(routed.confidence).toBe("reported");
    expect(routed.routing_decision).toBe("human_review");
  });

  it("auto-publishes a confirmed routine release as provisional", () => {
    const item = candidate({
      id: "release",
      officialPrimary: true,
      impact: "routine_release",
      citations: [
        { url: "https://openai.com/blog/release", publisher: "OpenAI", retrieved },
        { url: "https://arxiv.org/abs/0000.00000", publisher: "arXiv", retrieved },
      ],
    });
    const routed = routeCandidate(item);
    expect(routed.confidence).toBe("confirmed");
    expect(routed.routing_decision).toBe("auto_publish");
    const store = new MemoryStore();
    const applied = applyRouted(store, item, routed);
    expect(applied.ok).toBe(true);
    expect(store.getExhibit("release")?.publicationState).toBe("provisional");
    expect(store.getExhibit("release")?.incomplete).toBe(true);
  });

  it("holds harm, statutes, and named-person ethics for a person", () => {
    const sources = [
      { url: "https://incidentdatabase.ai/reports/928", publisher: "AIID", retrieved },
      { url: "https://www.reuters.com/tay", publisher: "Reuters", retrieved },
    ];
    expect(routeCandidate(candidate({ harm: true, citations: sources, officialPrimary: true })).routing_decision).toBe(
      "human_review",
    );
    expect(routeCandidate(candidate({ legal: true, citations: sources, officialPrimary: true })).routing_decision).toBe(
      "human_review",
    );
    expect(
      routeCandidate(candidate({ namedPersonEthics: true, citations: sources, officialPrimary: true })).routing_decision,
    ).toBe("human_review");
  });

  it("bumps version and keeps the first blob on a second publish", () => {
    const item = candidate({
      id: "release",
      officialPrimary: true,
      impact: "routine_release",
      citations: [
        { url: "https://openai.com/blog/release", publisher: "OpenAI", retrieved },
        { url: "https://arxiv.org/abs/0000.00000", publisher: "arXiv", retrieved },
      ],
    });
    const store = new MemoryStore();
    applyRouted(store, item, routeCandidate(item));
    applyRouted(store, { ...item, summary: "Point release notes expanded." }, routeCandidate(item));
    expect(store.getExhibit("release")?.version).toBe(2);
    expect(store.versions("release")[0]?.blob.publicStory).toBe("A short sourced account.");
  });
});
