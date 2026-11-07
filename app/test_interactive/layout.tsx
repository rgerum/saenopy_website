import type { Metadata } from "next";

// An older scratch page kept for reference, not a page for visitors.
export const metadata: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function TestInteractiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
