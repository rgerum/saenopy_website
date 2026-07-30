import type { Metadata } from "next";
import Link from "next/link";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

import { DisplayMesh } from "@/components/mesh/display";
import {
  CLAIMS,
  DATASETS,
  ENERGY_TRACE,
  FORCE_TRACE,
  IMMUNO,
  LINKS,
  PAPER,
  PLACEHOLDERS,
  SERVICES,
} from "@/lib/saenopy-content";

import { Ladder } from "./ladder";
import { colorFor } from "./scale";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-geist-sans",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Saenopy — four orders of magnitude",
  description:
    "3D traction force microscopy from about 1 nN to about 10 µN, with every dataset placed on a single logarithmic force axis.",
};

const PAPER_RANGE = "~1 nN to ~10 µN";
const SPREAD = Math.round(DATASETS.cell008.peakForce / DATASETS.nk92.peakForce);
const ORGANOID_RATIO = Math.round(
  DATASETS.organoid.peakForce / DATASETS.nk92.peakForce,
);

/* ---------------------------------------------------------------- traces */

function Trace({
  values,
  unit,
  caption,
  color,
  peakIndex,
  peakNote,
}: {
  values: number[];
  unit: string;
  caption: string;
  color: string;
  peakIndex: number;
  peakNote: string;
}) {
  const max = Math.max(...values);
  const x = (i: number) => 38 + (i / (values.length - 1)) * 428;
  const y = (v: number) => 116 - (v / max) * 100;
  const line = values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`).join(" ");
  const area = `${line} L${x(values.length - 1)},116 L${x(0)},116 Z`;

  return (
    <figure>
      <svg viewBox="0 0 480 150" className="w-full h-auto" role="img" aria-label={caption}>
        <line x1={38} y1={116} x2={466} y2={116} stroke="#D8D6D0" strokeWidth={1} />
        <line x1={38} y1={16} x2={38} y2={116} stroke="#D8D6D0" strokeWidth={1} />
        <path d={area} fill={color} opacity={0.09} />
        <path d={line} fill="none" stroke={color} strokeWidth={1.6} />
        {values.map((v, i) => (
          <circle key={i} cx={x(i)} cy={y(v)} r={i === peakIndex ? 3.4 : 1.7} fill={color} />
        ))}
        <line
          x1={x(peakIndex)}
          y1={y(values[peakIndex]) + 6}
          x2={x(peakIndex)}
          y2={116}
          stroke={color}
          strokeWidth={0.8}
          strokeDasharray="2 3"
        />
        <text x={30} y={y(max) + 4} textAnchor="end" fontSize={10.5} fill="#6A6C70" className={mono.className}>
          {max}
        </text>
        <text x={30} y={119} textAnchor="end" fontSize={10.5} fill="#6A6C70" className={mono.className}>
          0
        </text>
        {[0, 5, 10, 15, 20].map((m) => (
          <text
            key={m}
            x={x(m)}
            y={134}
            textAnchor="middle"
            fontSize={10.5}
            fill="#6A6C70"
            className={mono.className}
          >
            {m}
          </text>
        ))}
        <text x={466} y={134} textAnchor="end" fontSize={10.5} fill="#9A9890" className={mono.className}>
          minutes
        </text>
        <text x={38} y={12} fontSize={10.5} fill="#6A6C70" className={mono.className}>
          {unit}
        </text>
      </svg>
      <figcaption className="mt-2 text-[12.5px] leading-relaxed text-[#6A6C70]">
        <span className="text-[#191A1C]">{caption}</span> {peakNote}
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ page */

export default function ScaleLadderPage() {
  return (
    <div
      className={`${sans.variable} ${mono.variable} font-sans min-h-screen bg-[#F8F7F4] text-[#191A1C] antialiased`}
    >
      {/* ------------------------------------------------------- masthead */}
      <header className="border-b border-[#E2E1DC]">
        <div className="mx-auto flex max-w-[1160px] items-center justify-between px-6 py-4">
          <div className="flex items-baseline gap-3">
            <span className="text-[17px] font-semibold tracking-tight">saenopy</span>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#6A6C70]">
              3D traction force microscopy
            </span>
          </div>
          <nav className="flex items-center gap-6 font-mono text-[11.5px] text-[#6A6C70]">
            <a className="hover:text-[#191A1C]" href={PAPER.url}>
              Paper
            </a>
            <a className="hover:text-[#191A1C]" href={LINKS.github}>
              GitHub
            </a>
            <a className="hover:text-[#191A1C]" href={LINKS.docs}>
              Docs
            </a>
            <a
              className="border border-[#C9C7C0] px-3 py-1.5 text-[#191A1C] hover:border-[#191A1C]"
              href={LINKS.contact}
            >
              Contact
            </a>
          </nav>
        </div>
      </header>

      {/* ------------------------------------------------------------ hero */}
      <section className="mx-auto max-w-[1160px] px-6 pt-16 pb-14">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#6A6C70]">
          Range
        </div>
        <h1 className="mt-5 max-w-[15ch] text-[clamp(2.6rem,5.4vw,4.4rem)] font-semibold leading-[0.98] tracking-[-0.03em]">
          Four orders of magnitude.
        </h1>
        <p className="mt-4 font-mono text-[15px] tracking-[-0.01em] text-[#6A6C70]">
          {PAPER_RANGE} &mdash; one method across the whole range.
        </p>

        <div className="mt-12 grid gap-12 border-t border-[#E2E1DC] pt-10 md:grid-cols-[1.25fr_1fr]">
          <div>
            <p className="max-w-[62ch] text-[17px] leading-[1.6]">
              Saenopy measures the forces a cell exerts on the 3D matrix around it. A
              traction measurement is normally built around one specimen size &mdash; the
              gel, the imaging, the material model are all tuned to it, and results from
              one scale do not transfer to another. The method behind saenopy is
              sensitive from about 1&nbsp;nN, a single axon growth cone, up to about
              10&nbsp;µN, a whole mouse intestinal organoid.
            </p>
            <p className="mt-5 max-w-[62ch] text-[17px] leading-[1.6] text-[#6A6C70]">
              Everything on this page is placed on that one axis, at the force we actually
              measured. An immune cell and an organoid, {ORGANOID_RATIO}&times; apart, on
              the same scale with the same physics.
            </p>
            <a
              href="#ladder"
              className="mt-8 inline-flex items-center gap-2 border-b border-[#191A1C] pb-1 font-mono text-[12px] uppercase tracking-[0.14em]"
            >
              Travel down the axis
              <span aria-hidden>&darr;</span>
            </a>
          </div>

          <aside className="border border-[#E2E1DC] bg-white p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6A6C70]">
              Source
            </div>
            <p className="mt-3 text-[15px] leading-[1.5]">{PAPER.title}</p>
            <p className="mt-3 text-[13px] leading-[1.6] text-[#6A6C70]">
              {PAPER.shortAuthors}, <em>{PAPER.journal}</em> {PAPER.year}
            </p>
            <p className="mt-4 font-mono text-[11.5px] text-[#6A6C70]">
              doi:{PAPER.doi}
            </p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11.5px]">
              <a className="underline underline-offset-4" href={PAPER.url}>
                Nature Physics
              </a>
              <a className="underline underline-offset-4" href={PAPER.preprintUrl}>
                Preprint
              </a>
            </div>
          </aside>
        </div>

        <dl className="mt-12 grid grid-cols-2 gap-px border border-[#E2E1DC] bg-[#E2E1DC] lg:grid-cols-4">
          {[
            {
              v: "1 nN – 10 µN",
              k: "sensitivity range stated in the paper, across object sizes",
            },
            {
              v: `${SPREAD}×`,
              k: `between our smallest and largest measured peak (${DATASETS.nk92.peakForce} nN and ${DATASETS.cell008.peakForce} nN)`,
            },
            { v: "6", k: "datasets pinned to the axis below, all measured, none simulated" },
            {
              v: `${DATASETS.nk92.peakForce} nN`,
              k: "peak traction of a single NK92 cell, measured from bright-field stacks",
            },
          ].map((s) => (
            <div key={s.k} className="bg-[#F8F7F4] p-5">
              <dt className="font-mono text-[21px] tracking-[-0.02em]">{s.v}</dt>
              <dd className="mt-2 text-[12.5px] leading-[1.5] text-[#6A6C70]">{s.k}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* --------------------------------------------------------- claims */}
      <section className="border-y border-[#E2E1DC] bg-white">
        <div className="mx-auto grid max-w-[1160px] gap-x-10 gap-y-10 px-6 py-14 md:grid-cols-2 lg:grid-cols-4">
          {CLAIMS.map((c, i) => (
            <div key={c.headline}>
              <div className="font-mono text-[10.5px] text-[#B4B1A9]">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-3 text-[16px] font-medium tracking-[-0.01em]">
                {c.headline}
              </h3>
              <p className="mt-2 text-[13.5px] leading-[1.6] text-[#6A6C70]">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- ladder */}
      <section id="ladder" className="mx-auto max-w-[1160px] px-6 pt-16 pb-20">
        <div className="grid gap-10 md:grid-cols-[1fr_1.2fr]">
          <div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#6A6C70]">
              The ladder
            </div>
            <h2 className="mt-4 text-[clamp(1.9rem,3vw,2.6rem)] font-semibold leading-[1.05] tracking-[-0.025em]">
              Six datasets, pinned at the force we measured.
            </h2>
          </div>
          <div className="self-end">
            <p className="max-w-[58ch] text-[15px] leading-[1.65] text-[#6A6C70]">
              Vertical position is log<sub>10</sub> of the peak fitted traction force in
              nN, drawn to scale &mdash; every decade is the same 380&nbsp;px. Ticks sit at
              the true value; where a label would not fit there, a leader line shows how
              far it had to move. The two dashed rules are the endpoints quoted in the
              paper, and we do not have bundles for either specimen.
            </p>
          </div>
        </div>

        <div className="mt-14">
          <Ladder />
        </div>
      </section>

      {/* ----------------------------------------------------------- time */}
      <section className="border-t border-[#E2E1DC] bg-white">
        <div className="mx-auto max-w-[1160px] px-6 py-16">
          <div className="grid gap-10 md:grid-cols-[1fr_1.2fr]">
            <div>
              <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#6A6C70]">
                The same axis, through time
              </div>
              <h2 className="mt-4 text-[clamp(1.9rem,3vw,2.6rem)] font-semibold leading-[1.05] tracking-[-0.025em]">
                A burst, not a steady pull.
              </h2>
            </div>
            <div className="self-end">
              <p className="max-w-[58ch] text-[15px] leading-[1.65] text-[#6A6C70]">
                {DATASETS.dynamic.blurb} A single number on the ladder is the top of a
                trace like this one. {CLAIMS[3].body}
              </p>
            </div>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1fr]">
            <div className="border border-[#E2E1DC]">
              <div className="bg-[#101317]">
                <DisplayMesh
                  bundle={DATASETS.dynamic.bundle}
                  field="fitted deformations"
                  height="420px"
                  arrow_span={0.1}
                  zoom={1.15}
                  cube="field"
                  cube_color={0x3a4250}
                  background="transparent"
                  logo_width="0px"
                  cmap="viridis"
                  mouse_control
                  show_controls={false}
                  show_colormap
                  animations={[{ type: "time", fps: 4 }]}
                />
              </div>
              <div className="flex items-center justify-between px-4 py-3 font-mono text-[10.5px] text-[#6A6C70]">
                <span>
                  fitted deformations · {DATASETS.dynamic.frames} frames ·{" "}
                  {DATASETS.dynamic.frameInterval}&thinsp;s apart
                </span>
                <span>{DATASETS.dynamic.transferKB} kB</span>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-10">
              <Trace
                values={FORCE_TRACE}
                unit="nN"
                caption="Peak traction force per frame."
                color={colorFor(DATASETS.dynamic.peakForce)}
                peakIndex={4}
                peakNote={`Peaks at ${DATASETS.dynamic.peakForce} nN in minute 4, then settles back to a few tenths of a nN.`}
              />
              <Trace
                values={ENERGY_TRACE}
                unit="fJ"
                caption="Strain energy stored in the matrix."
                color="#4B5563"
                peakIndex={0}
                peakNote={`Highest in the first frame at ${ENERGY_TRACE[0]} fJ, lowest at ${Math.min(
                  ...ENERGY_TRACE,
                )} fJ in minute 11.`}
              />
              <p className="text-[12.5px] leading-[1.6] text-[#6A6C70]">
                The dynamic bundle carries fitted deformations for all{" "}
                {DATASETS.dynamic.frames} frames; the per-frame force and energy numbers
                are read from the bundle header.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- immuno */}
      <section className="bg-[#14161B] text-[#E8E8E6]">
        <div className="mx-auto max-w-[1160px] px-6 py-20">
          <div className="grid gap-12 md:grid-cols-[1fr_1.2fr]">
            <div>
              <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#8A8D93]">
                Bottom of the ladder
              </div>
              <h2 className="mt-4 text-[clamp(1.9rem,3vw,2.6rem)] font-semibold leading-[1.05] tracking-[-0.025em]">
                Why the smallest rung is the commercially interesting one.
              </h2>
              <p className="mt-6 max-w-[46ch] text-[14.5px] leading-[1.7] text-[#A9ACB2]">
                The NK92 cell sits at the very bottom of the axis, at{" "}
                {DATASETS.nk92.peakForce}&nbsp;nN &mdash; the low end of the range the
                paper quotes, and {SPREAD}&times; below the strongest fibroblast on the
                same axis. Immune cells move at {IMMUNO.speed}, so the measurement has to
                be both sensitive and resolved in time.
              </p>
            </div>
            <div>
              <blockquote className="border-l-2 border-[#CC5559] pl-6 text-[19px] leading-[1.5] tracking-[-0.01em]">
                {IMMUNO.finding}
              </blockquote>
              <p className="mt-3 pl-6 font-mono text-[11px] text-[#8A8D93]">
                {PAPER.shortAuthors}, {PAPER.journal} {PAPER.year}
              </p>
            </div>
          </div>

          <div className="mt-16 grid gap-px bg-[#262A31] md:grid-cols-3">
            {IMMUNO.why.map((w, i) => (
              <div key={w.title} className="bg-[#14161B] p-7">
                <div
                  className="font-mono text-[10.5px]"
                  style={{ color: colorFor([0.87, 61.3, 10000][i]) }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-3 text-[15.5px] font-medium tracking-[-0.01em]">
                  {w.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-[1.65] text-[#A9ACB2]">{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- placeholders */}
      <section className="mx-auto max-w-[1160px] px-6 py-20">
        <div className="grid gap-10 md:grid-cols-[1fr_1.2fr]">
          <div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#6A6C70]">
              Not on the ladder yet
            </div>
            <h2 className="mt-4 text-[clamp(1.7rem,2.6vw,2.2rem)] font-semibold leading-[1.1] tracking-[-0.025em]">
              Panels we would need a real engagement to fill.
            </h2>
          </div>
          <p className="max-w-[58ch] self-end text-[15px] leading-[1.65] text-[#6A6C70]">
            The four below are the measurements a cell therapy programme usually asks for
            next. We have the method for each of them; the data on this page is not that
            data, so they are drawn empty rather than filled with something illustrative.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PLACEHOLDERS.panels.map((p) => (
            <div
              key={p.title}
              className="flex flex-col border border-dashed border-[#C9C7C0] bg-[#FCFBF9] p-5"
            >
              <div
                className="mb-4 h-20 border border-dashed border-[#DCD9D2]"
                style={{
                  background:
                    "repeating-linear-gradient(45deg, transparent, transparent 6px, #EFEDE7 6px, #EFEDE7 7px)",
                }}
              />
              <h3 className="text-[14.5px] font-medium tracking-[-0.01em]">{p.title}</h3>
              <p className="mt-2 flex-1 text-[12.5px] leading-[1.6] text-[#6A6C70]">
                {p.body}
              </p>
              <div className="mt-4 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#96938B]">
                {PLACEHOLDERS.note}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------- services */}
      <section className="border-t border-[#E2E1DC] bg-white">
        <div className="mx-auto grid max-w-[1160px] gap-12 px-6 py-16 md:grid-cols-[1fr_1.2fr]">
          <div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#6A6C70]">
              Working together
            </div>
            <h2 className="mt-4 text-[clamp(1.7rem,2.6vw,2.2rem)] font-semibold leading-[1.1] tracking-[-0.025em]">
              The software is open. The rest is a conversation.
            </h2>
            <p className="mt-5 max-w-[46ch] text-[14.5px] leading-[1.7] text-[#6A6C70]">
              Saenopy is free and open source. Alongside it, the group offers:
            </p>
            <a
              href={LINKS.contact}
              className="mt-8 inline-flex items-center gap-3 bg-[#191A1C] px-6 py-3.5 font-mono text-[12px] uppercase tracking-[0.14em] text-white"
            >
              Start a conversation
              <span aria-hidden>&rarr;</span>
            </a>
          </div>
          <ol className="divide-y divide-[#E2E1DC] border-y border-[#E2E1DC]">
            {SERVICES.map((s, i) => (
              <li key={s} className="flex items-baseline gap-6 py-5">
                <span className="font-mono text-[11px] text-[#B4B1A9]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[15.5px] leading-[1.5]">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* --------------------------------------------------------- footer */}
      <footer className="border-t border-[#E2E1DC]">
        <div className="mx-auto max-w-[1160px] px-6 py-14">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6A6C70]">
                Cite
              </div>
              <p className="mt-4 max-w-[70ch] text-[13.5px] leading-[1.7]">
                {PAPER.authors}. {PAPER.title}. <em>{PAPER.journal}</em> {PAPER.year}.{" "}
                <a className="underline underline-offset-4" href={PAPER.url}>
                  doi:{PAPER.doi}
                </a>
              </p>
              <p className="mt-5 max-w-[70ch] text-[12.5px] leading-[1.7] text-[#6A6C70]">
                {PAPER.abstract}
              </p>
            </div>
            <div className="flex flex-col gap-3 font-mono text-[12px] md:items-end">
              <Link className="hover:underline underline-offset-4" href={LINKS.site}>
                saenopy.com
              </Link>
              <a className="hover:underline underline-offset-4" href={LINKS.github}>
                github.com/rgerum/saenopy
              </a>
              <a className="hover:underline underline-offset-4" href={LINKS.docs}>
                saenopy.readthedocs.io
              </a>
              <a className="hover:underline underline-offset-4" href={LINKS.contact}>
                richard.gerum@protonmail.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
