import { Suspense } from "react";
import { ExhibitForm } from "../../../../components/editor/ExhibitForm";
import { LoginForm } from "../../../../components/editor/LoginForm";
import { getEditorSession } from "../../../../src/server/auth";

async function NewExhibit() {
  if (!(await getEditorSession())) return <LoginForm />;
  return (
    <>
      <p>
        <a href="/editor">Back to the list</a>
      </p>
      <ExhibitForm />
    </>
  );
}

export default function NewExhibitPage() {
  return (
    <Suspense fallback={<p>Opening a blank exhibit.</p>}>
      <NewExhibit />
    </Suspense>
  );
}
