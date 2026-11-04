// Applies the November 2026 accuracy audit (docs/accuracy-audit-2026-11.md) to a database that
// was seeded before it. Every change goes through commitWrite, so it runs as museum_app and each
// change appends an honest version row. Idempotent: an exhibit that already matches is skipped,
// and a seed exhibit the database lacks is inserted once.
import { SEED_NODES, toWrite } from "../seed/eras";
import { WITHDRAWN_NODES } from "../seed/withdrawn";
import type { ExhibitWrite, MuseumSnapshot, Write } from "../store/memory";
import { commitWrite, loadGraph } from "./graph";
import type { Db } from "./pg";

const AUDIT_FIELDS = ["title", "publicStory", "confidence", "officialPrimary", "citations", "fieldChange", "editorialNote"] as const;
export const CONFIRM_REASON =
  "Accuracy audit, November 2026: confirmed against a primary record and two independent sources.";
export const WORDING_REASON = "Accuracy audit, November 2026: wording corrected to match the sources.";
export const INSERT_REASON =
  "Added from the museum seed: confirmed against a primary record and sources on two domains.";
const CONFIRM_FIELDS: readonly string[] = ["confidence", "officialPrimary", "citations"];

/** Says what kind of change the audit made, so the changelog does not claim more than happened. */
function auditReason(fields: string[]): string {
  const confirmed = fields.some((field) => CONFIRM_FIELDS.includes(field));
  const reworded = fields.some((field) => !CONFIRM_FIELDS.includes(field));
  if (confirmed && reworded) return `${CONFIRM_REASON} Wording corrected to match the sources.`;
  return confirmed ? CONFIRM_REASON : WORDING_REASON;
}

type Stored = MuseumSnapshot["exhibits"][number];

export type AuditResult = { lines: string[]; writes: number; failed: boolean };

function editable(stored: Stored): ExhibitWrite {
  const { proseFlags: _flags, version: _version, updatedAt: _updatedAt, ...rest } = stored;
  return rest;
}

/** JSON with sorted object keys, because jsonb does not keep key order. */
function canonical(value: unknown): string {
  return JSON.stringify(value, (_key, item: unknown) =>
    item && typeof item === "object" && !Array.isArray(item)
      ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b)))
      : item,
  );
}

/** The audit fields where the seed has a value and the database differs. */
function auditChanges(stored: Stored, seeded: ExhibitWrite): Partial<ExhibitWrite> {
  const changes: Partial<ExhibitWrite> = {};
  for (const field of AUDIT_FIELDS) {
    const wanted = seeded[field];
    if (wanted === undefined) continue; // a merge write cannot clear a field, so it is not compared
    if (canonical(wanted) !== canonical(stored[field])) Object.assign(changes, { [field]: wanted });
  }
  return changes;
}

export async function applyAudit(db: Db, opts: { dryRun?: boolean } = {}): Promise<AuditResult> {
  const result: AuditResult = { lines: [], writes: 0, failed: false };
  const graph = await loadGraph(db, { publicOnly: false });
  const byId = new Map(graph.exhibits.map((exhibit) => [exhibit.id, exhibit]));

  const apply = async (id: string, write: Write, summary: string) => {
    if (opts.dryRun) {
      result.lines.push(`would ${summary}: ${id}`);
      return;
    }
    const committed = await commitWrite(db, write, "editor");
    if (committed.ok) {
      result.writes += 1;
      result.lines.push(`${summary}: ${id}`);
      return;
    }
    result.failed = true;
    result.lines.push(`rejected ${id}: ${committed.violations.map((v) => v.message).join("; ")}`);
  };

  for (const node of WITHDRAWN_NODES) {
    const stored = byId.get(node.id);
    if (!stored) {
      result.lines.push(`absent, nothing to withdraw: ${node.id}`);
    } else if (stored.publicationState === "withdrawn") {
      result.lines.push(`already withdrawn: ${node.id}`);
    } else {
      const exhibit = { ...editable(stored), publicationState: "withdrawn" as const };
      await apply(node.id, { exhibit, reason: `Withdrawn: ${node.withdrawnReason}` }, "withdrew");
    }
  }

  for (const node of SEED_NODES) {
    const stored = byId.get(node.id);
    if (!stored) {
      const { claims, sources, supports } = node;
      const write: Write = { mode: "create", exhibit: toWrite(node), claims, sources, supports, reason: INSERT_REASON };
      await apply(node.id, write, "insert");
      continue;
    }
    const changes = auditChanges(stored, toWrite(node));
    if (Object.keys(changes).length === 0) {
      result.lines.push(`already matches: ${node.id}`);
      continue;
    }
    const fields = Object.keys(changes);
    const exhibit = { ...editable(stored), ...changes };
    await apply(node.id, { exhibit, reason: auditReason(fields) }, `updated ${fields.join(", ")}`);
  }
  return result;
}
