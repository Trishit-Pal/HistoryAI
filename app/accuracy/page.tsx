import { ATLAS_SOURCES } from "../../src/atlas/sources";

export default function AccuracyPage() {
  return (
    <main className="page plate">
      <h1>How this museum stays accurate</h1>
      <p>
        Every exhibit on the floor is confirmed. An exhibit that is not confirmed is not shown.
      </p>
      <ul className="rules">
        <li>
          <span className="badge badge-confirmed">confirmed</span>
          <span>
            One source is the primary record itself: the paper, the report, the law, or the official
            page of the organisation involved. And its sources come from at least two different
            websites.
          </span>
        </li>
      </ul>
      <h2>Withdrawals</h2>
      <p>
        In November 2026 every exhibit was checked against this rule. Those that met it stayed, some
        with corrected wording or an added primary source. Eight did not and were withdrawn. A
        withdrawn exhibit leaves the halls but stays in the <a href="/changelog">changelog</a>, with
        &ldquo;Withdrawn&rdquo;, the date and the reason. Two eras, the expert systems boom and the
        second AI winter, have no confirmed exhibit yet, so they have no hall.
      </p>
      <h2>Two layers</h2>
      <p>
        The technical canon is methods, systems, datasets, and benchmarks from 1943. A second
        context layer holds winters, funding cuts, regulation, incidents, and open debates, and is
        not the technical lineage. A curator&apos;s note, when present, is the only unsourced
        judgment and is set apart from the summary.
      </p>
      <h2>The curator</h2>
      <p>
        A router, not a live model in this build, decides whether a new item can be stored. A
        single-source rumor stays rumored and unpublished. Harm, legal rulings, and named-person
        ethics wait for a person even when sources agree. A confirmed routine release may be stored
        as a provisional card. The curator cannot write the technical canon. Every change adds a
        version, and the previous one stays.
      </p>
      <h2>Data from outside the museum</h2>
      <p>
        The scale of AI page draws on published datasets and official records. Each is copied at a
        known date and shown with its licence. Figures are the source&apos;s own estimates and are
        labelled that way, not as confirmed exhibits. Sources whose reuse is unclear are linked, not
        redrawn.
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
        <a href="/changelog">Every change to the exhibits</a>
      </p>
      <h2>Suggestions</h2>
      <p>
        Each exhibit page has a form for a correction or a new source. Nothing is published from it.
        An editor reviews the queue. The site stores a hash of the sender&apos;s network address, not
        the address itself, and asks for no name or email.
      </p>
    </main>
  );
}
