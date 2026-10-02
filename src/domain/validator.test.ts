import { describe, expect, it } from "vitest";
import type { ClaimRole, ClaimStatus, PublicationState, SourceKind, Write } from "../store/memory";
import { MemoryStore } from "../store/memory";

const ROLES: ClaimRole[] = ["what_changed", "capability", "limit", "failure", "unknown"];

function canonWrite(publicStory = "A method for credit assignment."): Write {
  return {
    exhibit: {
      id: "ex",
      title: "Example",
      kind: "idea",
      startYear: 1950,
      publicStory,
      technicalAccount: "The gradient is computed from the output error.",
      publicationState: "canon",
      incomplete: false,
      noPredecessorInScope: true,
    },
    claims: ROLES.map((role) => ({
      id: `c-${role}`,
      exhibitId: "ex",
      statement: `Technical ${role} claim.`,
      role,
      status: "established" as ClaimStatus,
      publicationState: "canon" as PublicationState,
    })),
    sources: ROLES.map((role) => ({
      id: `s-${role}`,
      title: "A paper",
      year: 1950,
      authors: "Author",
      locator: "doi:10.0000/example",
      kind: "paper" as SourceKind,
    })),
    supports: ROLES.map((role) => ({ claimId: `c-${role}`, sourceId: `s-${role}` })),
  };
}

describe("MemoryStore.apply", () => {
  it("start year 1942 is forbidden and persists nothing", () => {
    const store = new MemoryStore();
    const before = store.snapshot();
    const result = store.apply(
      {
        exhibit: {
          id: "early",
          title: "Too early",
          kind: "idea",
          startYear: 1942,
          publicStory: "Before the canon.",
          technicalAccount: "",
          publicationState: "draft",
          incomplete: true,
        },
      },
      "editor",
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.violations[0]?.rule).toBe("forbidden-transition");
    expect(store.snapshot()).toEqual(before);
  });

  it("contradicts leaves both established statuses unchanged", () => {
    const store = new MemoryStore();
    store.apply(
      {
        exhibit: {
          id: "ex",
          title: "Example",
          kind: "idea",
          startYear: 1950,
          publicStory: "A method.",
          technicalAccount: "Details.",
          publicationState: "draft",
          incomplete: true,
        },
        claims: [
          {
            id: "c1",
            exhibitId: "ex",
            statement: "The bound holds.",
            role: "what_changed",
            status: "established",
            publicationState: "draft",
          },
          {
            id: "c2",
            exhibitId: "ex",
            statement: "The bound fails on the reported split.",
            role: "limit",
            status: "established",
            publicationState: "draft",
          },
        ],
      },
      "editor",
    );
    const result = store.apply({ contradicts: [{ fromClaimId: "c1", toClaimId: "c2" }] }, "editor");
    expect(result.ok).toBe(true);
    expect(store.claimStatus("c1")).toBe("established");
    expect(store.claimStatus("c2")).toBe("established");
  });

  it("retraction keeps the claim and writes an audit record", () => {
    const store = new MemoryStore();
    store.apply(
      {
        exhibit: {
          id: "ex",
          title: "Example",
          kind: "idea",
          startYear: 1950,
          publicStory: "A method.",
          technicalAccount: "Details.",
          publicationState: "draft",
          incomplete: true,
        },
        claims: [
          {
            id: "c1",
            exhibitId: "ex",
            statement: "The bound holds.",
            role: "what_changed",
            status: "established",
            publicationState: "draft",
          },
        ],
      },
      "editor",
    );
    const result = store.apply({ retractClaimId: "c1" }, "editor");
    expect(result.ok).toBe(true);
    expect(store.claimStatus("c1")).toBe("retracted");
    expect(store.auditCount()).toBe(1);
  });

  it("agent cannot set canon", () => {
    const store = new MemoryStore();
    const before = store.snapshot();
    const result = store.apply(canonWrite(), "agent");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.violations.some((v) => v.rule === "forbidden-transition")).toBe(true);
    expect(store.snapshot()).toEqual(before);
  });

  it("canon claim supported only by a model card is source-rule", () => {
    const store = new MemoryStore();
    const before = store.snapshot();
    const write = canonWrite();
    write.sources = [
      {
        id: "s-card",
        title: "Model card",
        year: 2024,
        authors: "Lab",
        locator: "https://example.test/card",
        kind: "model_card",
      },
    ];
    write.supports = [{ claimId: "c-what_changed", sourceId: "s-card" }];
    const result = store.apply(write, "editor");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.violations.some((v) => v.rule === "source-rule")).toBe(true);
    expect(store.snapshot()).toEqual(before);
  });

  it("banned phrase on a canon write persists and stores the flag", () => {
    const store = new MemoryStore();
    const result = store.apply(canonWrite("A note on regulation of step size."), "editor");
    expect(result.ok).toBe(true);
    expect(store.proseFlags("ex").some((flag) => flag.rule === "out-of-scope-prose")).toBe(true);
  });
});
