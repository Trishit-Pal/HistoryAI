"use client";

import { useActionState } from "react";
import { saveExhibit, type EditorState } from "../../app/editor/actions";
import type { ExhibitWrite } from "../../src/store/memory";

const initial: EditorState = { error: "" };

export function ExhibitForm({
  exhibit,
  suggestion,
}: {
  exhibit?: ExhibitWrite & { updatedAt?: string };
  suggestion?: { id: string; body: string; sourceUrl?: string | null };
}) {
  const [state, action, pending] = useActionState(saveExhibit, initial);
  const value = exhibit;
  return (
    <form action={action} className="editor-form">
      <h1>{value ? value.title : "New exhibit"}</h1>
      {suggestion ? (
        <p className="note">
          Visitor suggestion: {suggestion.body}
          {suggestion.sourceUrl ? ` ${suggestion.sourceUrl}` : ""}
        </p>
      ) : null}
      <input type="hidden" name="mode" value={value ? "replace" : "create"} />
      <input type="hidden" name="expectedUpdatedAt" value={value?.updatedAt ?? ""} />
      <input type="hidden" name="suggestionId" value={suggestion?.id ?? ""} />
      <label htmlFor="id">Id</label>
      <input id="id" name="id" defaultValue={value?.id ?? ""} required readOnly={Boolean(value)} />
      <label htmlFor="title">Title</label>
      <input id="title" name="title" defaultValue={value?.title ?? ""} required />
      <label htmlFor="kind">Kind</label>
      <input id="kind" name="kind" defaultValue={value?.kind ?? "idea"} required />
      <label htmlFor="startYear">Start year</label>
      <input id="startYear" name="startYear" defaultValue={value?.startYear ?? ""} required />
      <label htmlFor="endYear">End year</label>
      <input id="endYear" name="endYear" defaultValue={value?.endYear ?? ""} />
      <label htmlFor="layer">Layer</label>
      <input id="layer" name="layer" defaultValue={value?.layer ?? "context"} />
      <label htmlFor="eraId">Era id</label>
      <input id="eraId" name="eraId" defaultValue={value?.eraId ?? ""} />
      <label htmlFor="publicationState">Publication state</label>
      <input id="publicationState" name="publicationState" defaultValue={value?.publicationState ?? "draft"} />
      <label htmlFor="confidence">Confidence</label>
      <input id="confidence" name="confidence" defaultValue={value?.confidence ?? "reported"} />
      <label>
        <input type="checkbox" name="incomplete" defaultChecked={value?.incomplete ?? true} /> Incomplete
      </label>
      <label>
        <input type="checkbox" name="officialPrimary" defaultChecked={value?.officialPrimary === true} /> Official primary source
      </label>
      <label>
        <input type="checkbox" name="noPredecessorInScope" defaultChecked={value?.noPredecessorInScope === true} /> No predecessor in scope
      </label>
      <label htmlFor="publicStory">Public story</label>
      <textarea id="publicStory" name="publicStory" rows={5} defaultValue={value?.publicStory ?? ""} required />
      <label htmlFor="technicalAccount">Technical account</label>
      <textarea id="technicalAccount" name="technicalAccount" rows={4} defaultValue={value?.technicalAccount ?? ""} />
      <label htmlFor="editorialNote">Editorial note</label>
      <textarea id="editorialNote" name="editorialNote" rows={3} defaultValue={value?.editorialNote ?? ""} />
      <label htmlFor="citations">Citations JSON</label>
      <textarea id="citations" name="citations" rows={6} defaultValue={JSON.stringify(value?.citations ?? [], null, 2)} />
      <label htmlFor="figure">Figure JSON</label>
      <textarea id="figure" name="figure" rows={6} defaultValue={value?.figure ? JSON.stringify(value.figure, null, 2) : ""} />
      <label htmlFor="fieldBefore">Field before</label>
      <textarea id="fieldBefore" name="fieldBefore" rows={3} defaultValue={value?.fieldChange?.before ?? ""} />
      <label htmlFor="fieldAfter">Field after</label>
      <textarea id="fieldAfter" name="fieldAfter" rows={3} defaultValue={value?.fieldChange?.after ?? ""} />
      <label htmlFor="fieldCitations">Field-change source URLs</label>
      <textarea id="fieldCitations" name="fieldCitations" rows={2} defaultValue={value?.fieldChange?.citationUrls.join("\n") ?? ""} />
      <label htmlFor="reason">Reason for this change</label>
      <input id="reason" name="reason" required minLength={3} />
      {state.error ? <p role="alert">{state.error}</p> : null}
      <button type="submit" disabled={pending}>
        {pending ? "Saving" : "Save exhibit"}
      </button>
    </form>
  );
}
