import type { Metadata } from "next";

/**
 * These are draft landing pages shared by direct link — with a client, or
 * internally — so they must not turn up in search results next to the real
 * saenopy.com pages, and they must not pass link equity to anything they
 * point at.
 *
 * `noindex` is deliberately done with a meta tag rather than a robots.txt
 * disallow: a disallow stops the crawler reading the page at all, which means
 * it never sees the noindex and can still list a bare URL it found elsewhere.
 * Letting it crawl and telling it not to index is what actually keeps these
 * out of the index.
 *
 * This is not access control. Anyone with the URL can read these.
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function DesignsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
