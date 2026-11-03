import type { FieldChange } from "../src/domain/types";
import { SafeLink } from "./SafeLink";

export function FieldChangeSection({
  fieldChange,
  claims,
}: {
  fieldChange?: FieldChange;
  claims: { role: string; statement: string; status: string }[];
}) {
  const changed = claims.filter((claim) => claim.role === "what_changed" && claim.status !== "retracted");
  return (
    <section>
      <h2>How the field changed</h2>
      {fieldChange ? (
        <>
          <h3>Before</h3>
          <p>{fieldChange.before}</p>
          <h3>After</h3>
          <p>{fieldChange.after}</p>
          <ul>
            {fieldChange.citationUrls.map((url) => (
              <li key={url}>
                <SafeLink href={url}>{url}</SafeLink>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>The museum has not yet written how this changed the field.</p>
      )}
      {changed.map((claim) => (
        <p key={claim.statement}>{claim.statement}</p>
      ))}
    </section>
  );
}
