import type { ReactNode } from "react";

export const metadata = {
  title: "Editor · Hall of Eras",
  robots: { index: false, follow: false },
};

export default function EditorLayout({ children }: { children: ReactNode }) {
  return <div className="page plate editor">{children}</div>;
}
