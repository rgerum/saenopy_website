import type { Metadata } from "next";

// An internal harness for the field bundle format, not a page for visitors.
// The page itself is a client component, so the tag has to live in a layout.
export const metadata: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function TestViewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
