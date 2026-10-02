import { lintProse } from "../domain/linter";
import type { ClaimStatus, ProseFlag, Role, Violation } from "../domain/types";
import { validateWrite } from "../domain/validator";

export type { ClaimRole, ClaimStatus, PublicationState, SourceKind } from "../domain/types";

import type {
  Citation,
  ClaimRole,
  Confidence,
  EraId,
  EvolutionType,
  Figure,
  Kind,
  Layer,
  PublicationState,
  SourceKind,
} from "../domain/types";

export type ExhibitWrite = {
  id: string;
  title: string;
  kind: Kind;
  startYear: number;
  endYear?: number;
  publicStory: string;
  technicalAccount?: string;
  publicationState: PublicationState;
  incomplete: boolean;
  noPredecessorInScope?: boolean;
  previousId?: string;
  updatedAt?: string;
  layer?: Layer;
  eraId?: EraId;
  confidence?: Confidence;
  citations?: Citation[];
  tags?: string[];
  editorialNote?: string;
  officialPrimary?: boolean;
  figure?: Figure;
};

export type ClaimWrite = {
  id: string;
  exhibitId: string;
  statement: string;
  role: ClaimRole;
  status: ClaimStatus;
  publicationState: PublicationState;
};

export type SourceWrite = {
  id: string;
  title: string;
  year: number;
  authors: string;
  locator: string;
  kind: SourceKind;
};

export type SupportLink = { claimId: string; sourceId: string };

export type EvolutionLink = { type: EvolutionType; fromId: string; toId: string };

export type Write = {
  exhibit?: ExhibitWrite;
  claims?: ClaimWrite[];
  sources?: SourceWrite[];
  supports?: SupportLink[];
  evolution?: EvolutionLink[];
  contradicts?: { fromClaimId: string; toClaimId: string }[];
  retractClaimId?: string;
  deleteClaimId?: string;
  expectedUpdatedAt?: string;
};

type ExhibitRecord = ExhibitWrite & {
  proseFlags: ProseFlag[];
  updatedAt: string;
  version: number;
  layer: Layer;
};

export type VersionRecord = {
  nodeId: string;
  version: number;
  at: string;
  blob: ExhibitWrite;
};

export type ChangelogLine = {
  at: string;
  nodeId: string;
  version: number;
  reason: string;
};

type AuditRecord = { at: string; by: Role; change: string };

export class MemoryStore {
  private exhibits = new Map<string, ExhibitRecord>();
  private claims = new Map<string, ClaimWrite>();
  private sources = new Map<string, SourceWrite>();
  private supports: SupportLink[] = [];
  private evolution: EvolutionLink[] = [];
  private contradicts: { fromClaimId: string; toClaimId: string }[] = [];
  private audits: AuditRecord[] = [];
  private versionLog: VersionRecord[] = [];
  private changeLog: ChangelogLine[] = [];

  getExhibit(id: string): ExhibitRecord | undefined {
    return this.exhibits.get(id);
  }

  getClaim(id: string): ClaimWrite | undefined {
    return this.claims.get(id);
  }

  claimsFor(exhibitId: string): ClaimWrite[] {
    return [...this.claims.values()].filter((claim) => claim.exhibitId === exhibitId);
  }

  getSource(id: string): SourceWrite | undefined {
    return this.sources.get(id);
  }

  supportsFor(claimId: string): SupportLink[] {
    return this.supports.filter((link) => link.claimId === claimId);
  }

  hasEvolution(exhibitId: string): boolean {
    return this.evolution.some((link) => link.fromId === exhibitId || link.toId === exhibitId);
  }

  claimStatus(id: string): ClaimStatus | undefined {
    return this.claims.get(id)?.status;
  }

  auditCount(): number {
    return this.audits.length;
  }

  proseFlags(id: string): ProseFlag[] {
    return this.exhibits.get(id)?.proseFlags ?? [];
  }

  versions(id: string): VersionRecord[] {
    return this.versionLog.filter((entry) => entry.nodeId === id);
  }

  changelog(): ChangelogLine[] {
    return [...this.changeLog];
  }

  publicExhibits(): ExhibitRecord[] {
    return [...this.exhibits.values()].filter(
      (exhibit) => exhibit.publicationState === "canon" || exhibit.publicationState === "provisional",
    );
  }

  snapshot(): unknown {
    return {
      exhibits: [...this.exhibits.values()],
      claims: [...this.claims.values()],
      sources: [...this.sources.values()],
      supports: this.supports,
      evolution: this.evolution,
      contradicts: this.contradicts,
      audits: this.audits,
      versions: this.versionLog,
      changelog: this.changeLog,
    };
  }

  apply(write: Write, role: Role): { ok: true } | { ok: false; violations: Violation[] } {
    const violations = validateWrite(this, write, role);
    if (violations.length > 0) return { ok: false, violations };
    this.commit(write, role);
    return { ok: true };
  }

  private commit(write: Write, role: Role): void {
    const now = new Date().toISOString();
    if (write.exhibit) {
      const existing = this.exhibits.get(write.exhibit.id);
      const layer = write.exhibit.layer ?? existing?.layer ?? "technical";
      const texts =
        layer === "technical"
          ? [
              write.exhibit.publicStory,
              write.exhibit.technicalAccount ?? "",
              ...(write.claims ?? []).map((claim) => claim.statement),
            ]
          : [];
      const proseFlags = texts.flatMap((text) => lintProse(text));
      const version = (existing?.version ?? 0) + 1;
      const incoming = Object.fromEntries(
        Object.entries(write.exhibit).filter(([, value]) => value !== undefined),
      ) as ExhibitWrite;
      const next: ExhibitRecord = {
        ...existing,
        ...incoming,
        layer,
        proseFlags,
        updatedAt: now,
        version,
      };
      this.exhibits.set(write.exhibit.id, next);
      const blob = structuredClone(next);
      this.versionLog.push({
        nodeId: next.id,
        version,
        at: now,
        blob,
      });
      this.changeLog.push({
        at: now,
        nodeId: next.id,
        version,
        reason: blob.publicStory.slice(0, 140),
      });
    }
    for (const claim of write.claims ?? []) this.claims.set(claim.id, claim);
    for (const source of write.sources ?? []) this.sources.set(source.id, source);
    for (const link of write.supports ?? []) this.supports.push(link);
    for (const link of write.evolution ?? []) this.evolution.push(link);
    for (const link of write.contradicts ?? []) this.contradicts.push(link);
    if (write.deleteClaimId) this.claims.delete(write.deleteClaimId);
    if (write.retractClaimId) {
      const claim = this.claims.get(write.retractClaimId);
      if (claim) {
        this.claims.set(claim.id, { ...claim, status: "retracted" });
        this.audits.push({ at: now, by: role, change: `retracted ${claim.id}` });
      }
    }
  }
}
