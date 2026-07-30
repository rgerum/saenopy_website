import type { Metadata } from "next";
import { IBM_Plex_Mono, Source_Serif_4 } from "next/font/google";

/**
 * The editorial design is the only serif-led page of the set, so it carries its
 * own type stack. Scoped to this route so no other design is affected.
 */
const serif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  variable: "--font-source-serif",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "saenopy — Dynamic traction force measurements in 3D matrices",
  description:
    "The Nature Physics method behind saenopy, with the measured fields shown as interactive figures.",
};

export default function EditorialLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className={`${serif.variable} ${mono.variable}`}>{children}</div>;
}
