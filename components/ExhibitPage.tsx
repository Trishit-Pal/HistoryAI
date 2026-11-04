import type { ReactNode } from "react";
import { atlasLinkFor } from "../src/atlas/links";
import type { ExhibitDetail } from "../src/museum/build";
import { Breadcrumbs } from "./Breadcrumbs";
import { FieldChangeSection } from "./FieldChangeSection";
import { ArtefactCredit } from "./ArtefactCredit";
import { FigureCredit } from "./FigureCredit";
import { InspectArtefact } from "./InspectArtefact";
import { RevisionList } from "./RevisionList";
import { SafeLink } from "./SafeLink";

export function ExhibitPage({
  detail,
  eraLabel,
  eraSlug,
  archivedAt,
  children,
}: {
  detail: ExhibitDetail;
  eraLabel: string;
  eraSlug: string;
  archivedAt?: string;
  children?: ReactNode;
}) {
  const { node } = detail;
  const atlasHref = atlasLinkFor(node.id);
  return (
    <main className="exhibit-page">
      {archivedAt ? <p className="archive-banner">Archived copy from {archivedAt}.</p> : null}
      <header className="exhibit-rail">
        <Breadcrumbs
          items={[
            { label: "Timeline", href: "/" },
            { label: eraLabel, href: `/rooms/${eraSlug}#${node.id}` },
            { label: node.title },
          ]}
        />
        {atlasHref ? <a href={atlasHref}>See it in the Atlas</a> : null}
      </header>
      <article className="plate exhibit-sheet">
        <dl className="titleblock">
          <div>
            <dt>Hall</dt>
            <dd>{eraLabel}</dd>
          </div>
          <div>
            <dt>Years</dt>
            <dd>
              {node.startYear}
              {node.endYear ? `–${node.endYear}` : ""}
            </dd>
          </div>
          <div>
            <dt>Kind</dt>
            <dd>
              {node.kind}, {node.layer}
            </dd>
          </div>
          <div>
            <dt>Confidence</dt>
            <dd className="badges">
              <span className={`badge badge-${node.confidence ?? "unset"}`}>{node.confidence ?? "unset"}</span>
            </dd>
          </div>
        </dl>
        <h1>{node.title}</h1>
        <FigureCredit figure={node.figure} />
        <ArtefactCredit exhibitId={node.id} />
        <InspectArtefact key={node.id} exhibitId={node.id} title={node.title} />
        <p>{node.publicStory}</p>
        {node.editorialNote ? <p className="note">{node.editorialNote}</p> : null}
        {node.technicalAccount ? (
          <section>
            <h2>Technical account</h2>
            <p>{node.technicalAccount}</p>
          </section>
        ) : null}
        <section>
          <h2>Sources</h2>
          {node.citations.length === 0 ? <p>No sources yet.</p> : null}
          <ul>
            {node.citations.map((citation) => (
              <li key={citation.url}>
                <SafeLink href={citation.url}>{citation.publisher}</SafeLink>
              </li>
            ))}
          </ul>
        </section>
        {detail.related.length > 0 ? (
          <section>
            <h2>Connections</h2>
            <ul>
              {detail.related.map((line) => (
                <li key={`${line.label}-${line.id}`}>
                  {line.label} {line.title}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <FieldChangeSection fieldChange={detail.fieldChange} claims={detail.claims} />
        <RevisionList revisions={detail.revisions} />
        {children}
      </article>
    </main>
  );
}
