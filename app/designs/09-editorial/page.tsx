import type { ReactNode } from "react";

import { DisplayMesh } from "@/components/mesh/display";
import {
  CLAIMS,
  DATASETS,
  ENERGY_TRACE,
  FORCE_TRACE,
  IMMUNO,
  LINKS,
  PAPER,
} from "@/lib/saenopy-content";

import { TraceChart } from "./trace-chart";

/* Grid placement helpers. Column 1 is the margin, column 2 the measured text
   column, column 3 the spare that figures spill into. */
const COL = "lg:col-start-2 lg:col-end-3";
const WIDE = "lg:col-start-2 lg:col-end-4";
const MARGIN = "lg:col-start-1 lg:col-end-2 lg:text-right";

const ACCENT = "#9a3b3f";

const nf = new Intl.NumberFormat("en-US");

function SectionHead({
  n,
  title,
  note,
}: {
  n: string;
  title: string;
  note?: string;
}) {
  return (
    <>
      <div
        className={`${MARGIN} mt-20 hidden font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[#a29883] lg:block`}
      >
        §&thinsp;{n}
        {note ? (
          <span className="mt-3 block normal-case tracking-normal text-[#8c8474] font-serif italic text-[0.82rem] leading-snug">
            {note}
          </span>
        ) : null}
      </div>
      <h2
        className={`${COL} mt-20 border-t border-[#ded8cb] pt-4 font-serif text-[1.35rem] font-semibold tracking-tight text-[#1b1a17] lg:mt-20`}
      >
        <span className="mr-3 font-mono text-[0.8rem] font-normal text-[#a29883] lg:hidden">
          {n}
        </span>
        {title}
      </h2>
    </>
  );
}

function P({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`${COL} mt-5 font-serif text-[1.06rem] leading-[1.72] text-[#2c2a25] ${className}`}
    >
      {children}
    </p>
  );
}

function Figure({
  n,
  children,
  caption,
  tag,
}: {
  n: number;
  children: ReactNode;
  caption: ReactNode;
  tag: string;
}) {
  return (
    <figure className={`${WIDE} mt-10 max-w-[54rem]`}>
      <div className="relative overflow-hidden border border-[#0d1015] bg-[#0d1015]">
        <div className="pointer-events-none absolute left-4 top-3 z-10 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[#6d7c8f]">
          {tag}
        </div>
        <div className="pointer-events-none absolute right-4 top-3 z-10 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[#4d5765]">
          drag to rotate
        </div>
        {children}
      </div>
      <figcaption className="mt-3 max-w-[44rem] font-serif text-[0.92rem] leading-[1.6] text-[#5d564a]">
        <span className="font-semibold text-[#1b1a17]">Figure&nbsp;{n}.</span>{" "}
        {caption}
      </figcaption>
    </figure>
  );
}

export default function EditorialPage() {
  const nk92 = DATASETS.nk92;
  const organoid = DATASETS.organoid;
  const dynamic = DATASETS.dynamic;
  const tableRows = [
    DATASETS.nk92,
    DATASETS.dynamic,
    DATASETS.cell004,
    DATASETS.cell007,
    DATASETS.cell008,
    DATASETS.organoid,
  ];
  const roman = ["i", "ii", "iii", "iv", "v", "vi"];

  return (
    <main className="min-h-screen bg-[#fbf9f4] text-[#1b1a17] antialiased">
      {/* running head */}
      <div className="border-b border-[#ded8cb]">
        <div className="mx-auto flex max-w-[68rem] items-baseline justify-between px-6 py-4">
          <span className="font-serif text-[1.05rem] font-semibold tracking-tight">
            saenopy
          </span>
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[#8c8474]">
            3D traction force microscopy · open source
          </span>
        </div>
      </div>

      <div className="mx-auto grid max-w-[68rem] grid-cols-1 gap-x-10 px-6 pb-24 lg:grid-cols-[11rem_minmax(0,40rem)_minmax(0,1fr)]">
        {/* ---------------------------------------------------------- head */}
        <div
          className={`${MARGIN} hidden pt-[6.1rem] font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[#a29883] lg:block`}
        >
          Method paper
          <span className="mt-3 block font-serif text-[0.82rem] normal-case italic leading-snug tracking-normal text-[#8c8474]">
            The method saenopy implements, and the measured fields behind it.
          </span>
        </div>
        <div className={`${COL} pt-16`}>
          <div className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[#9a3b3f]">
            {PAPER.journal} · {PAPER.year} · Article
          </div>
          <h1 className="mt-6 font-serif text-[2.4rem] font-normal leading-[1.18] tracking-[-0.015em] text-[#14130f] sm:text-[2.9rem]">
            {PAPER.title}
          </h1>
          <p className="mt-7 font-serif text-[1rem] leading-[1.75] text-[#4a443a]">
            {PAPER.authors}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[#ded8cb] pt-4 font-mono text-[0.72rem] tracking-[0.04em] text-[#6b6455]">
            <span>
              doi:
              <a
                href={PAPER.url}
                className="ml-1 underline decoration-[#c9c1b0] underline-offset-4 transition-colors hover:text-[#9a3b3f] hover:decoration-[#9a3b3f]"
              >
                {PAPER.doi}
              </a>
            </span>
            <a
              href={PAPER.preprintUrl}
              className="underline decoration-[#c9c1b0] underline-offset-4 transition-colors hover:text-[#9a3b3f] hover:decoration-[#9a3b3f]"
            >
              preprint (bioRxiv)
            </a>
            <a
              href={LINKS.github}
              className="underline decoration-[#c9c1b0] underline-offset-4 transition-colors hover:text-[#9a3b3f] hover:decoration-[#9a3b3f]"
            >
              source
            </a>
            <a
              href={LINKS.docs}
              className="underline decoration-[#c9c1b0] underline-offset-4 transition-colors hover:text-[#9a3b3f] hover:decoration-[#9a3b3f]"
            >
              documentation
            </a>
          </div>
        </div>

        {/* ------------------------------------------------------ abstract */}
        <div
          className={`${MARGIN} mt-12 hidden font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[#a29883] lg:block`}
        >
          Abstract
          <span className="mt-3 block font-serif text-[0.82rem] normal-case italic leading-snug tracking-normal text-[#8c8474]">
            Quoted verbatim from the published article.
          </span>
        </div>
        <div className={`${COL} mt-12 border-y border-[#ded8cb] py-7`}>
          <p className="font-serif text-[1.09rem] leading-[1.75] text-[#2c2a25]">
            <span className="mr-2 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[#9a3b3f] lg:hidden">
              Abstract
            </span>
            {PAPER.abstract}
          </p>
        </div>

        {/* ------------------------------------------------------ software */}
        <SectionHead
          n="1"
          title="The software"
          note="saenopy is the open implementation of the method above."
        />
        <p
          className={`${COL} mt-5 font-serif text-[1.06rem] leading-[1.72] text-[#2c2a25] first-letter:float-left first-letter:mr-[0.12em] first-letter:mt-[0.06em] first-letter:font-serif first-letter:text-[3.4rem] first-letter:leading-[0.78] first-letter:text-[#14130f]`}
        >
          Saenopy is the open-source Python implementation of the method
          described above. It reconstructs the deformation field a cell imposes
          on the biopolymer network around it, then solves for the traction
          forces that produced it under a material model that lets the fibres
          buckle and strain-stiffen rather than assuming linear elasticity. The
          source and the documentation are both public; links are in §&thinsp;7.
        </p>
        <P>
          The three figures below are not renderings made for this page. Each is
          a solved field exported out of saenopy and drawn in the browser from
          the numbers themselves — between 27 and 103&nbsp;kB per dataset, as
          listed in Table&nbsp;1. Drag any of them.
        </P>

        {/* ------------------------------------------------- method claims */}
        <SectionHead n="2" title="What the method does" />
        <dl className={`${COL} mt-6`}>
          {CLAIMS.map((claim, i) => (
            <div
              key={claim.headline}
              className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 border-b border-dotted border-[#ded8cb] py-4 last:border-b-0"
            >
              <dt className="pt-[0.35rem] font-mono text-[0.72rem] text-[#a29883]">
                ({roman[i]})
              </dt>
              <dd className="font-serif text-[1.02rem] leading-[1.68] text-[#3a362e]">
                <span className="font-semibold text-[#14130f]">
                  {claim.headline}.
                </span>{" "}
                {claim.body}
              </dd>
            </div>
          ))}
        </dl>

        {/* -------------------------------------------------- figures 1, 2 */}
        <SectionHead
          n="3"
          title="The measured fields"
          note="Peak values read from the exported bundle headers."
        />
        <P>
          Figure&nbsp;1 is the cell type the paper is about: a natural killer
          cell in 3D collagen, measured from bright-field stacks, so nothing had
          to be labelled to make it visible. Figure&nbsp;2 is an intestinal
          organoid — the same solver, the same material model, about seventy
          times the peak force.
        </P>

        <Figure
          n={1}
          tag="fitted deformations · turbo"
          caption={
            <>
              Fitted deformation field of an {nk92.label} in 3D collagen,
              recovered from bright-field image stacks. Peak deformation{" "}
              {nk92.peakDeformation.toFixed(2)}&nbsp;µm; peak fitted traction
              force {nk92.peakForce}&nbsp;nN. Tetrahedral mesh,{" "}
              {nf.format(nk92.meshNodes)} nodes. Arrows give the local
              displacement direction, colour its magnitude.
            </>
          }
        >
          <DisplayMesh
            bundle={nk92.bundle}
            field="fitted deformations"
            height="520px"
            arrow_span={0.1}
            zoom={1.15}
            cube="field"
            cube_color={0x3b4756}
            background="transparent"
            logo_width="0px"
            cmap="turbo"
            mouse_control
            show_controls={false}
            show_colormap
            animations={[{ type: "rotate", speed: 5 }]}
          />
        </Figure>

        <Figure
          n={2}
          tag="fitted forces · viridis"
          caption={
            <>
              Fitted traction forces of an {organoid.label.toLowerCase()}{" "}
              contracting the surrounding gel. Peak fitted force{" "}
              {organoid.peakForce}&nbsp;nN, peak deformation{" "}
              {organoid.peakDeformation}&nbsp;µm — roughly seventy times the
              force of the immune cell in Figure&nbsp;1, resolved by the same
              method. Mesh, {nf.format(organoid.meshNodes)} nodes.
            </>
          }
        >
          <DisplayMesh
            bundle={organoid.bundle}
            field="fitted forces"
            height="460px"
            arrow_span={0.14}
            zoom={1.7}
            cube="field"
            cube_color={0x3b4756}
            background="transparent"
            logo_width="0px"
            cmap="viridis"
            mouse_control
            show_controls={false}
            show_colormap
            animations={[{ type: "rotate", speed: 5 }]}
          />
        </Figure>

        {/* -------------------------------------------------- figure 3 */}
        <SectionHead
          n="4"
          title="Forces resolved in time"
          note="23 frames, one per minute."
        />
        <P>
          A single number per cell hides the thing the paper is actually about.
          Measured frame by frame, traction is not a steady pull: it arrives in
          bursts. Figure&nbsp;3 shows one migrating cell over{" "}
          {dynamic.frames} consecutive minutes, with the peak force and the
          stored strain energy read out of every frame.
        </P>

        <Figure
          n={3}
          tag={`fitted deformations · ${dynamic.frames} frames`}
          caption={
            <>
              <span className="font-semibold text-[#1b1a17]">(a)</span> Fitted
              deformation field of a migrating cell over{" "}
              {dynamic.frames} consecutive time points at{" "}
              {(dynamic.frameInterval ?? 60) / 60}&nbsp;min intervals, played in
              sequence.{" "}
              <span className="font-semibold text-[#1b1a17]">(b)</span> Peak
              fitted traction force per frame, in nN; the marked frame is the
              maximum, {dynamic.peakForce}&nbsp;nN at minute&nbsp;4.{" "}
              <span className="font-semibold text-[#1b1a17]">(c)</span> Total
              strain energy stored in the matrix per frame, in femtojoules. The
              force trace peaks at minute 4 and settles back — a burst, not a
              steady pull.
            </>
          }
        >
          <DisplayMesh
            bundle={dynamic.bundle}
            field="fitted deformations"
            height="420px"
            arrow_span={0.09}
            zoom={1.45}
            cube="field"
            cube_color={0x3b4756}
            background="transparent"
            logo_width="0px"
            cmap="turbo"
            mouse_control
            show_controls={false}
            show_colormap
            animations={[{ type: "time", fps: 4 }]}
          />
        </Figure>

        <div className={`${WIDE} mt-6 grid max-w-[54rem] grid-cols-1 gap-x-10 gap-y-8 border-t border-[#ded8cb] pt-6 sm:grid-cols-2`}>
          <div>
            <div className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-[#8c8474]">
              (b) peak traction force
            </div>
            <div className="mt-2">
              <TraceChart
                values={FORCE_TRACE}
                yLabel="nN"
                xLabel="time (min)"
                color={ACCENT}
                markIndex={FORCE_TRACE.indexOf(Math.max(...FORCE_TRACE))}
              />
            </div>
          </div>
          <div>
            <div className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-[#8c8474]">
              (c) strain energy
            </div>
            <div className="mt-2">
              <TraceChart
                values={ENERGY_TRACE}
                yLabel="fJ"
                xLabel="time (min)"
                color="#3d5a6c"
              />
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------- table 1 */}
        <SectionHead
          n="5"
          title="Datasets on this page"
          note="Every field shown here ships with the page."
        />
        <div className={`${WIDE} mt-6 max-w-[54rem] overflow-x-auto`}>
          <table className="w-full border-collapse font-serif text-[0.93rem]">
            <caption className="mb-3 text-left font-serif text-[0.92rem] leading-[1.6] text-[#5d564a]">
              <span className="font-semibold text-[#1b1a17]">Table&nbsp;1.</span>{" "}
              Exported solutions rendered on this page. Peak values are read from
              the bundle headers; transfer size is the compressed payload the
              browser downloads.
            </caption>
            <thead>
              <tr className="border-y border-[#1b1a17] font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[#6b6455]">
                <th className="py-2 pr-4 text-left font-normal">Dataset</th>
                <th className="py-2 pr-4 text-left font-normal">Subject</th>
                <th className="py-2 pr-4 text-right font-normal">
                  Peak def. <span className="normal-case">(µm)</span>
                </th>
                <th className="py-2 pr-4 text-right font-normal">
                  Peak force <span className="normal-case">(nN)</span>
                </th>
                <th className="py-2 pr-4 text-right font-normal">Nodes</th>
                <th className="py-2 text-right font-normal">
                  Transfer <span className="normal-case">(kB)</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((d) => (
                <tr key={d.id} className="border-b border-[#e6e0d4] align-top">
                  <td className="py-2.5 pr-4 text-[#1b1a17]">{d.label}</td>
                  <td className="py-2.5 pr-4 text-[#6b6455]">{d.subject}</td>
                  <td className="py-2.5 pr-4 text-right font-mono text-[0.8rem] text-[#3a362e]">
                    {d.peakDeformation}
                  </td>
                  <td className="py-2.5 pr-4 text-right font-mono text-[0.8rem] text-[#3a362e]">
                    {d.peakForce}
                  </td>
                  <td className="py-2.5 pr-4 text-right font-mono text-[0.8rem] text-[#6b6455]">
                    {nf.format(d.meshNodes)}
                  </td>
                  <td className="py-2.5 text-right font-mono text-[0.8rem] text-[#6b6455]">
                    {d.transferKB}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ------------------------------------------------------- finding */}
        <SectionHead
          n="6"
          title="Principal finding, and why a cell therapy group should care"
        />
        <blockquote
          className={`${COL} mt-6 border-l-2 pl-6 font-serif text-[1.22rem] italic leading-[1.62] text-[#14130f]`}
          style={{ borderColor: ACCENT }}
        >
          {IMMUNO.finding}
          <footer className="mt-3 font-mono text-[0.68rem] not-italic uppercase tracking-[0.18em] text-[#8c8474]">
            {PAPER.shortAuthors}, {PAPER.journal} {PAPER.year}
          </footer>
        </blockquote>
        <P>
          NK cells move through dense tissue at {IMMUNO.speed}. The mechanical
          argument for reading that out per cell is short, and it is the reason
          this page exists in a form you can forward.
        </P>
        <div className={`${COL} mt-7`}>
          {IMMUNO.why.map((item, i) => (
            <div
              key={item.title}
              className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 border-b border-dotted border-[#ded8cb] py-4 last:border-b-0"
            >
              <div className="pt-[0.35rem] font-mono text-[0.72rem] text-[#a29883]">
                ({roman[i]})
              </div>
              <div>
                <div className="font-serif text-[1.02rem] font-semibold text-[#14130f]">
                  {item.title}
                </div>
                <p className="mt-1 font-serif text-[1rem] leading-[1.66] text-[#3a362e]">
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* -------------------------------------------------- availability */}
        <SectionHead n="7" title="Availability and correspondence" />
        <div className={`${COL} mt-6 font-serif text-[1.02rem] leading-[1.7] text-[#3a362e]`}>
          <dl className="space-y-4">
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-[9rem_minmax(0,1fr)]">
              <dt className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[#8c8474] sm:pt-[0.45rem]">
                Code
              </dt>
              <dd>
                <a
                  href={LINKS.github}
                  className="underline decoration-[#c9c1b0] underline-offset-4 transition-colors hover:text-[#9a3b3f] hover:decoration-[#9a3b3f]"
                >
                  github.com/rgerum/saenopy
                </a>{" "}
                — the reference implementation of the method.
              </dd>
            </div>
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-[9rem_minmax(0,1fr)]">
              <dt className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[#8c8474] sm:pt-[0.45rem]">
                Documentation
              </dt>
              <dd>
                <a
                  href={LINKS.docs}
                  className="underline decoration-[#c9c1b0] underline-offset-4 transition-colors hover:text-[#9a3b3f] hover:decoration-[#9a3b3f]"
                >
                  saenopy.readthedocs.io
                </a>{" "}
                — installation, the solver, and the worked examples.
              </dd>
            </div>
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-[9rem_minmax(0,1fr)]">
              <dt className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[#8c8474] sm:pt-[0.45rem]">
                Article
              </dt>
              <dd>
                <a
                  href={PAPER.url}
                  className="underline decoration-[#c9c1b0] underline-offset-4 transition-colors hover:text-[#9a3b3f] hover:decoration-[#9a3b3f]"
                >
                  {PAPER.journal} {PAPER.year}
                </a>
                , doi:{PAPER.doi}. Author manuscript on{" "}
                <a
                  href={PAPER.preprintUrl}
                  className="underline decoration-[#c9c1b0] underline-offset-4 transition-colors hover:text-[#9a3b3f] hover:decoration-[#9a3b3f]"
                >
                  bioRxiv
                </a>
                .
              </dd>
            </div>
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-[9rem_minmax(0,1fr)]">
              <dt className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[#8c8474] sm:pt-[0.45rem]">
                Correspondence
              </dt>
              <dd>
                Questions about applying the method to your own cells, or about
                a measurement run on material you cannot share:{" "}
                <a
                  href={LINKS.contact}
                  className="underline decoration-[#c9c1b0] underline-offset-4 transition-colors hover:text-[#9a3b3f] hover:decoration-[#9a3b3f]"
                >
                  richard.gerum@protonmail.com
                </a>
                .
              </dd>
            </div>
          </dl>
        </div>

        {/* -------------------------------------------------------- footer */}
        <div
          className={`${WIDE} mt-20 max-w-[54rem] border-t border-[#1b1a17] pt-4 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-[#8c8474]`}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-y-2">
            <span>
              {PAPER.shortAuthors} · {PAPER.journal} · {PAPER.year}
            </span>
            <span>
              <a
                href={LINKS.site}
                className="underline decoration-[#d5cdbc] underline-offset-4 hover:text-[#9a3b3f]"
              >
                saenopy.com
              </a>
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
