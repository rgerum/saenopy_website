import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { DATASETS, PAPER } from "@/lib/saenopy-content";

export const metadata = {
  title: "Landing page directions — Saenopy",
  description:
    "Ten alternative landing page designs for saenopy.com, doubling as pharma-facing material.",
};

interface Direction {
  slug: string;
  number: string;
  title: string;
  angle: string;
  audience: string;
  visual: string;
  data: string;
}

const DIRECTIONS: Direction[] = [
  {
    slug: "01-force-barrier",
    number: "01",
    title: "The Force Barrier",
    angle:
      "A cell therapy has to physically push through tumour stroma before its cytotoxic machinery matters. Nobody measures whether it can.",
    audience: "Immuno-oncology lead",
    visual: "Dark, cinematic, editorial",
    data: "NK92 immune cell",
  },
  {
    slug: "02-assay-catalogue",
    number: "02",
    title: "Assay Catalogue",
    angle:
      "Each dataset framed as a commissionable measurement, with what you send and what comes back.",
    audience: "Business development, procurement",
    visual: "Light, structured, product-like",
    data: "All six datasets",
  },
  {
    slug: "03-explorer",
    number: "03",
    title: "The Explorer",
    angle:
      "The landing page is the demo. Drive the viewer for thirty seconds and you understand the product.",
    audience: "Hands-on scientist",
    visual: "Dark instrument panel",
    data: "All six, switchable",
  },
  {
    slug: "04-method-scroll",
    number: "04",
    title: "How The Measurement Works",
    angle:
      "The pipeline explained one scroll step at a time, with the sticky viewer showing the actual field at each stage.",
    audience: "Sceptical technical reader",
    visual: "Calm, diagrammatic, two-column",
    data: "Fibroblast, all three fields",
  },
  {
    slug: "05-force-bursts",
    number: "05",
    title: "Force Bursts",
    angle:
      "Cells do not pull steadily. The 23-minute time series animates against a synchronised force trace — a snapshot would have missed the burst.",
    audience: "Cell biologist, biophysicist",
    visual: "Dark, chart-forward",
    data: "23-frame migration series",
  },
  {
    slug: "06-scale-ladder",
    number: "06",
    title: "Four Orders of Magnitude",
    angle:
      "A true logarithmic axis from 1 nN to 10 µN with our real datasets pinned at their measured positions.",
    audience: "Method evaluator",
    visual: "Infographic, axis-driven",
    data: "Immune cell through organoid",
  },
  {
    slug: "07-comparison",
    number: "07",
    title: "Mechanical Phenotype as a Readout",
    angle:
      "Three fibroblasts from one experiment span 47.7 to 126 nN. That spread is the argument for measuring rather than assuming.",
    audience: "Screening, assay development",
    visual: "Symmetrical, evidence-like",
    data: "Paired fibroblasts",
  },
  {
    slug: "08-spec-sheet",
    number: "08",
    title: "Technical Specification",
    angle:
      "No persuasion. Method, inputs, material model, outputs, licence — for the person asked whether this is real.",
    audience: "Computational reviewer",
    visual: "Dense datasheet, near-monochrome",
    data: "One illustrative field",
  },
  {
    slug: "09-editorial",
    number: "09",
    title: "The Paper",
    angle:
      "Built around the Nature Physics publication, with the fields presented as captioned figures.",
    audience: "Scientific advisor",
    visual: "Serif, light, journal-like",
    data: "Two to three figures",
  },
  {
    slug: "10-immersive",
    number: "10",
    title: "Immersive",
    angle:
      "One continuous 3D scene filling the viewport, a single sentence per panel. A deliberate risk.",
    audience: "First impression, conference screen",
    visual: "Full-bleed, atmospheric, very large type",
    data: "Shifting fields",
  },
];

export default function DesignsIndex() {
  const totalKB = Object.values(DATASETS).reduce((sum, d) => sum + d.transferKB, 0);

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="max-w-2xl space-y-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Saenopy — landing page directions
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-balance">
          Ten ways to open the conversation
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Each page is a different argument for the same software, built on the
          same real measurements. They are meant to be compared, so no two share
          a layout, a colour temperature or a target reader. All of them draw on{" "}
          {PAPER.journal} {PAPER.year} and on {Object.keys(DATASETS).length} real
          saenopy datasets totalling {totalKB.toFixed(0)} KB of 3D field data.
        </p>
      </header>

      <ul className="mt-14 divide-y border-t">
        {DIRECTIONS.map((d) => (
          <li key={d.slug}>
            <Link
              href={`/designs/${d.slug}`}
              className="group grid gap-4 py-7 sm:grid-cols-[3rem_1fr_auto] sm:items-baseline hover:bg-muted/40 transition-colors -mx-4 px-4 rounded-lg"
            >
              <span className="font-mono text-sm text-muted-foreground tabular-nums">
                {d.number}
              </span>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-tight flex items-center gap-1.5">
                  {d.title}
                  <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-60 transition-opacity" />
                </h2>
                <p className="text-muted-foreground leading-relaxed max-w-xl">
                  {d.angle}
                </p>
                <dl className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground pt-1">
                  <div className="flex gap-1.5">
                    <dt className="opacity-60">Reader</dt>
                    <dd>{d.audience}</dd>
                  </div>
                  <div className="flex gap-1.5">
                    <dt className="opacity-60">Look</dt>
                    <dd>{d.visual}</dd>
                  </div>
                  <div className="flex gap-1.5">
                    <dt className="opacity-60">Data</dt>
                    <dd>{d.data}</dd>
                  </div>
                </dl>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-16 rounded-xl border bg-muted/30 p-6 text-sm leading-relaxed text-muted-foreground space-y-3">
        <h2 className="font-semibold text-foreground">Before sending any of these out</h2>
        <p>
          Every factual claim comes from{" "}
          <code className="text-foreground">lib/saenopy-content.ts</code>, which
          holds the paper&apos;s wording and numbers measured directly from the
          exported bundles. Anything we cannot yet back up is drawn from the
          placeholder set and is labelled as a placeholder in the page — swap
          those for real data before this goes to a client.
        </p>
        <p>
          The 3D fields are live WebGL, not video: drag to rotate, scroll to zoom.
          They are also small enough to be a hero asset —{" "}
          {DATASETS.nk92.transferKB} KB for the immune cell, against roughly a
          megabyte for the same field as float32 arrays. See{" "}
          <Link href="/test-3d" className="underline text-foreground">
            the viewer test page
          </Link>{" "}
          for the encoding details.
        </p>
      </section>
    </main>
  );
}
