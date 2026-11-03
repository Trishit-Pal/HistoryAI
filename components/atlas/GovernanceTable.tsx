"use client";

import Link from "next/link";
import type { GovernanceView } from "../../src/atlas/governance";

/** Governance markers as text: the keyboard and screen-reader route to what the ribbon shows. */
export function GovernanceTable({ markers }: { markers: readonly GovernanceView[] }) {
  return (
    <div className="atlas-table-wrap">
      <table className="atlas-table">
        <caption>Laws, treaties and frameworks, oldest first. Each links to the issuer&rsquo;s own page.</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">What happened</th>
            <th scope="col">Issued by</th>
            <th scope="col">Sources</th>
          </tr>
        </thead>
        <tbody>
          {markers.map((marker) => (
            <tr key={marker.id}>
              <td>{marker.date}</td>
              <th scope="row">
                {marker.title}
                <span className="atlas-table-note">{marker.dateMeans}</span>
              </th>
              <td>{marker.issuer}</td>
              <td>
                <a href={marker.url} target="_blank" rel="noopener noreferrer">
                  Issuer&rsquo;s page
                </a>
                {marker.exhibit ? <Link href={marker.exhibit.href}>Exhibit: {marker.exhibit.title}</Link> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
