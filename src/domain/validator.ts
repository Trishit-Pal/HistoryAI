import { confidenceAllowed } from "./confidence";
import { ERAS } from "./eras";
import {
  CLAIM_ROLES,
  FIGURE_LICENSES,
  PRIMARY_SOURCE_KINDS,
  type Citation,
  type ClaimRole,
  type Confidence,
  type FieldChange,
  type Figure,
  type Kind,
  type Layer,
  type PublicationState,
  type Role,
  type SourceKind,
  type Violation,
} from "./types";
import { isHttpUrl, isMuseumAssetPath } from "./urls";
import type { ClaimWrite, ExhibitWrite, SourceWrite, Write } from "../store/memory";

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

const KINDS: readonly Kind[] = [
  "idea",
  "system",
  "institution",
  "period",
  "failure",
  "turning_point",
  "dataset",
  "benchmark",
];
const LAYERS: readonly Layer[] = ["technical", "context"];
const CONFIDENCES: readonly Confidence[] = ["confirmed", "reported", "disputed", "rumored"];
const PUBLICATION_STATES: readonly PublicationState[] = ["draft", "provisional", "proposed", "canon", "withdrawn"];

function shapeViolations(exhibit: ExhibitWrite): Violation[] {
  const violations: Violation[] = [];
  const allowed = (path: string, value: string | undefined, list: readonly string[], required: boolean) => {
    if (value === undefined ? required : !list.includes(value)) {
      violations.push(violation(`exhibit.${path}`, "invalid-shape", `${path} must be one of: ${list.join(", ")}.`));
    }
  };
  allowed("kind", exhibit.kind, KINDS, true);
  allowed("layer", exhibit.layer, LAYERS, false);
  allowed("confidence", exhibit.confidence, CONFIDENCES, false);
  allowed("publicationState", exhibit.publicationState, PUBLICATION_STATES, true);
  allowed("eraId", exhibit.eraId, ERAS.map((era) => era.id), false);
  if (!Number.isInteger(exhibit.startYear)) {
    violations.push(violation("exhibit.startYear", "invalid-shape", "The start year is a whole number."));
  }
  if (exhibit.endYear !== undefined && (!Number.isInteger(exhibit.endYear) || exhibit.endYear < exhibit.startYear)) {
    violations.push(violation("exhibit.endYear", "invalid-shape", "The end year is a whole number no earlier than the start."));
  }
  return violations;
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
    const existing = store.getExhibit(exhibit.id);
    violations.push(...shapeViolations(exhibit));
    if (write.mode === "create" && existing) {
      violations.push(violation("exhibit.id", "conflict", "An exhibit with this id already exists."));
    }
    if (write.mode === "replace" && existing && !write.expectedUpdatedAt) {
      violations.push(violation("exhibit.updatedAt", "conflict", "An edit must say which version it was read from."));
    }
    if (existing?.layer && exhibit.layer && exhibit.layer !== existing.layer) {
      violations.push(violation("exhibit.layer", "forbidden-transition", "An exhibit does not change layer."));
    }
    const layer = exhibit.layer ?? existing?.layer ?? "technical";
    const citations = exhibit.citations ?? existing?.citations ?? [];
    const confidence = exhibit.confidence ?? existing?.confidence;
    const official = (exhibit.officialPrimary ?? existing?.officialPrimary) === true;
    if (layer === "technical" && exhibit.startYear < 1943) {
      violations.push(violation("exhibit.startYear", "forbidden-transition", "The canon starts in 1943."));
    }
    if (layer === "context" && citations.length < 1) {
      violations.push(violation("exhibit.citations", "invalid-shape", "A context exhibit needs at least one source URL."));
    }
    if (citations.some((citation) => !isHttpUrl(citation.url))) {
      violations.push(violation("exhibit.citations", "invalid-shape", "A source URL must be http or https."));
    }
    if (confidence && !confidenceAllowed(confidence, citations, official)) {
      violations.push(violation("exhibit.confidence", "source-rule", "The claimed confidence is higher than the sources allow."));
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
    if (write.expectedUpdatedAt && existing && existing.updatedAt !== write.expectedUpdatedAt) {
      violations.push(violation("exhibit.updatedAt", "conflict", "The exhibit changed since it was read."));
    }
    if (role === "agent" && (exhibit.publicationState === "canon" || existing?.publicationState === "canon")) {
      violations.push(violation("exhibit.publicationState", "forbidden-transition", "An agent cannot write the canon."));
    }
    if (exhibit.publicationState === "provisional") {
      const sourceCount = (write.sources?.length ?? 0) + (exhibit.citations?.length ?? 0);
      if (!exhibit.title || !exhibit.kind || !exhibit.publicStory || sourceCount < 1 || exhibit.incomplete !== true) {
        violations.push(violation("exhibit", "invalid-shape", "A provisional card needs a title, kind, story, source, and incomplete set."));
      }
    }
    if (exhibit.figure) violations.push(...figureViolations(exhibit.figure));
    if (exhibit.fieldChange) violations.push(...fieldChangeViolations(exhibit.fieldChange, citations, write));
    if (exhibit.publicationState === "canon" && layer === "technical") {
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
  for (const source of write.sources ?? []) {
    if (!isHttpUrl(source.locator)) {
      violations.push(violation("source.locator", "invalid-shape", "A source locator must be http or https."));
    }
  }
  for (const link of write.evolution ?? []) {
    const cited = link.sourceId ? sourceOf(store, write, link.sourceId) : undefined;
    if (!link.sourceId || !cited) {
      violations.push(violation("evolution", "source-rule", "An evolution link cites a source."));
    }
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

function figureViolations(figure: Figure): Violation[] {
  const violations: Violation[] = [];
  const licenseOk = (FIGURE_LICENSES as readonly string[]).includes(figure.license);
  if (!licenseOk || !isHttpUrl(figure.sourceUrl) || !isMuseumAssetPath(figure.src)) {
    violations.push(violation("exhibit.figure", "invalid-shape", "A figure needs an allowed license, a source URL, and a museum path."));
  }
  if (figure.redrawnAfter && !isHttpUrl(figure.redrawnAfter)) {
    violations.push(violation("exhibit.figure", "invalid-shape", "A redrawn figure follows an http or https source."));
  }
  if (figure.kind === "redrawn" && !figure.redrawnAfter) {
    violations.push(violation("exhibit.figure", "invalid-shape", "A redrawn figure names the source it follows."));
  }
  return violations;
}

function fieldChangeViolations(change: FieldChange, citations: Citation[], write: Write): Violation[] {
  const violations: Violation[] = [];
  const before = change.before.trim();
  const after = change.after.trim();
  if (before.length === 0 || before.length > 600 || after.length === 0 || after.length > 600) {
    violations.push(
      violation(
        "exhibit.fieldChange",
        "invalid-shape",
        "How the field changed needs a before and an after, each at most 600 characters.",
      ),
    );
  }
  const known = new Set([
    ...citations.map((citation) => citation.url),
    ...(write.sources ?? []).map((source) => source.locator),
  ]);
  const urls = change.citationUrls ?? [];
  if (urls.length < 1 || urls.some((url) => !isHttpUrl(url) || !known.has(url))) {
    violations.push(
      violation("exhibit.fieldChange", "invalid-shape", "A field change cites one of the exhibit's source URLs."),
    );
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
