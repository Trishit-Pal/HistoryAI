import { ATLAS_SOURCES } from "../../src/atlas/sources";

export default function AccuracyPage() {
  return (
    <main className="page plate">
      <h1>How this museum stays accurate</h1>
      <p>
        Every public node carries at least one literal source URL. A confidence badge sits on the
        node. Confirmed needs an official primary source and two independent domains. A single
        secondary URL is reported at most. Conflicting material facts are disputed.
      </p>
      <ul className="rules">
        <li>
          <span className="badge badge-confirmed">confirmed</span>
          <span>Official primary source and two independent domains.</span>
        </li>
        <li>
          <span className="badge badge-reported">reported</span>
          <span>A single secondary URL, at most.</span>
        </li>
        <li>
          <span className="badge badge-disputed">disputed</span>
          <span>Conflicting material facts in the record.</span>
        </li>
        <li>
          <span className="badge badge-rumored">rumored</span>
          <span>Thin or single-source rumor, unpublished.</span>
        </li>
      </ul>
      <h2>Two layers</h2>
      <p>
        The technical canon is methods, systems, datasets, and benchmarks from 1943. A second
        context layer holds winters, funding cuts, regulation, incidents, and open debates. Context
        copy is not the technical lineage. A curator&apos;s note, when present, is the only unsourced
        judgment and is set apart from the summary.
      </p>
      <h2>The curator</h2>
      <p>
        A router, not a live model in this build, decides whether a new item can be stored. A
        single-source rumor stays rumored and unpublished. Harm, legal rulings, and named-person
        ethics wait for a person even when sources agree. A confirmed routine release may be stored
        as a provisional card. Nothing in the curator may write the technical canon. Every change
        appends a version. The previous blob stays.
      </p>
      <h2>Data from outside the museum</h2>
      <p>
        The scale of AI page draws on published datasets and official records. Each is copied at a
        known date and shown with its licence. Figures are estimates published by their source, so
        they carry the confidence word reported and never confirmed. Sources whose reuse is unclear
        are linked, not redrawn.
      </p>
      <ul className="rules">
        {ATLAS_SOURCES.map((source) => (
          <li key={source.id}>
            <span>
              <a href={source.homepage} target="_blank" rel="noopener noreferrer">
                {source.name}
              </a>
              . {source.linkOnly ? "Linked only, not reused. " : ""}Licence: {source.licence}. Checked{" "}
              {source.retrieved}.
            </span>
          </li>
        ))}
      </ul>
      <h2>Changelog</h2>
      <p>
        <a href="/changelog">Changelog — every change to the exhibits</a>
      </p>
      <h2>Suggestions</h2>
      <p>
        Each exhibit page has a form for a correction or a new source. Nothing is published from that
        form. An editor reviews the queue. The site stores a hash of the network address used to send
        the suggestion, not the address itself, and it does not ask for a name or an email.
      </p>
    </main>
  );
}
