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
      <h2>Ask the museum</h2>
      <p>
        Questions are answered only from this site&apos;s sourced nodes. If nothing matches, the museum
        says so and does not invent an exhibit.
      </p>
      <h2>Corrections</h2>
      <p>
        Send a correction to <a href="mailto:corrections@localhost">corrections@localhost</a> with
        the node id, the claimed error, and a source URL. That address is a documented path in this
        build, not an account system.
      </p>
    </main>
  );
}
