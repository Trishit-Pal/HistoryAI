import { CLAIM_ROLES, PRIMARY_SOURCE_KINDS, type ClaimRole, type Role, type SourceKind, type Violation } from "./types.js";
import type { ClaimWrite, ExhibitWrite, SourceWrite, Write } from "../store/memory.js";

export type StoreView = {
  getExhibit(id: string): (ExhibitWrite & { publicationState: ExhibitWrite["publicationState"] }) | undefined;
  getClaim(id: string): ClaimWrite | undefined;
  claimsFor(exhibitId: string): ClaimWrite[];
  getSource(id: string): SourceWrite | undefined;
  supportsFor(claimId: string): { sourceId: string }[];
  hasEvolution(exhibitId: string): boolean;
};

function violation(path: string, rule: Violation["rule"], message: string): Violation {
  return { path, rule, message };
}

function sourceOf(store: StoreView, write: Write, sourceId: string): SourceWrite | undefined {
  return write.sources?.find((source) => source.id === sourceId) ?? store.getSource(sourceId);
}

function isPrimary(kind: SourceKind): boolean {
  return PRIMARY_SOURCE_KINDS.includes(kind);
}

export function validateWrite(store: StoreView, write: Write, role: Role): Violation[] {
  const violations: Violation[] = [];
  const exhibit = write.exhibit;
  if (exhibit) {
    if (exhibit.startYear < 1943) {
      violations.push(violation("exhibit.startYear", "forbidden-transition", "The canon starts in 1943."));
    }
    if (exhibit.previousId && exhibit.previousId !== exhibit.id) {
      violations.push(violation("exhibit.id", "forbidden-transition", "Ids do not change."));
    }
    if (exhibit.kind === "period" && exhibit.endYear === undefined) {
      violations.push(violation("exhibit.endYear", "invalid-shape", "A period requires an end year."));
    }
    if (exhibit.kind === "turning_point" && !Number.isFinite(exhibit.startYear)) {
      violations.push(violation("exhibit.startYear", "invalid-shape", "A turning point requires a start year."));
    }
    const existing = store.getExhibit(exhibit.id);
    if (write.expectedUpdatedAt && existing && existing.updatedAt !== write.expectedUpdatedAt) {
      violations.push(violation("exhibit.updatedAt", "conflict", "The exhibit changed since it was read."));
    }
    if (role === "agent" && (exhibit.publicationState === "canon" || existing?.publicationState === "canon")) {
      violations.push(violation("exhibit.publicationState", "forbidden-transition", "An agent cannot write the canon."));
    }
    if (exhibit.publicationState === "provisional") {
      const sourceCount = write.sources?.length ?? 0;
      if (!exhibit.title || !exhibit.kind || !exhibit.publicStory || sourceCount < 1 || exhibit.incomplete !== true) {
        violations.push(violation("exhibit", "invalid-shape", "A provisional card needs a title, kind, story, source, and incomplete set."));
      }
    }
    if (exhibit.publicationState === "canon") {
      violations.push(...canonViolations(store, write, exhibit));
    }
  }
  if (write.deleteClaimId) {
    const claim = store.getClaim(write.deleteClaimId);
    const parent = claim ? store.getExhibit(claim.exhibitId) : undefined;
    if (claim?.publicationState === "canon" || parent?.publicationState === "canon") {
      violations.push(violation("claim", "forbidden-transition", "Canon claims are not deleted."));
    }
  }
  for (const link of write.evolution ?? []) {
    if (link.type !== "EVALUATED_ON") continue;
    const target = store.getExhibit(link.toId);
    const written = write.exhibit?.id === link.toId ? write.exhibit : undefined;
    const kind = written?.kind ?? target?.kind;
    if (kind !== "dataset" && kind !== "benchmark") {
      violations.push(violation("evolution", "illegal-relation", "EVALUATED_ON must end on a dataset or benchmark."));
    }
  }
  return violations;
}

function canonViolations(store: StoreView, write: Write, exhibit: ExhibitWrite): Violation[] {
  const violations: Violation[] = [];
  if (!exhibit.publicStory || !exhibit.technicalAccount || exhibit.incomplete !== false) {
    violations.push(violation("exhibit", "canon-incomplete", "A canon exhibit needs both stories and incomplete set to false."));
  }
  const claims = new Map<string, ClaimWrite>();
  for (const claim of store.claimsFor(exhibit.id)) claims.set(claim.id, claim);
  for (const claim of write.claims ?? []) claims.set(claim.id, claim);
  const roles = new Set<ClaimRole>([...claims.values()].map((claim) => claim.role));
  if (CLAIM_ROLES.some((role) => !roles.has(role))) {
    violations.push(violation("claims", "canon-incomplete", "A canon exhibit needs all five claim roles."));
  }
  const hasEvolution =
    exhibit.noPredecessorInScope === true ||
    store.hasEvolution(exhibit.id) ||
    (write.evolution ?? []).some((link) => link.fromId === exhibit.id || link.toId === exhibit.id);
  if (!hasEvolution) {
    violations.push(violation("evolution", "canon-incomplete", "A canon exhibit needs an evolution link or no predecessor in scope."));
  }
  for (const claim of claims.values()) {
    const written = (write.supports ?? []).filter((link) => link.claimId === claim.id);
    const links = written.length > 0 ? written : store.supportsFor(claim.id);
    const kinds = links
      .map((link) => sourceOf(store, write, link.sourceId)?.kind)
      .filter((kind): kind is SourceKind => kind !== undefined);
    if (kinds.some(isPrimary)) continue;
    if (kinds.length > 0) {
      violations.push(violation(`claim.${claim.id}`, "source-rule", "A canon claim cannot rest only on a provisional source."));
    } else {
      violations.push(violation(`claim.${claim.id}`, "canon-incomplete", "A canon claim needs a primary source."));
    }
  }
  return violations;
}
