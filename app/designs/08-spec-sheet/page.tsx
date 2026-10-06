import type { Metadata } from "next";
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
  type Dataset,
} from "@/lib/saenopy-content";
import { ViewerPanel } from "./viewer-panel";

export const metadata: Metadata = {
  title: "Saenopy — technical specification",
  description:
    "Method, inputs, outputs and reference measurements for saenopy, 3D traction force microscopy in non-linear biopolymer matrices.",
};

/* ------------------------------------------------------------------ layout */

const SHEET_CSS = `
.spec {
  --ink: #17181a;
  --mid: #5c5f66;
  --dim: #8b8f96;
  --rule: #d8d5ce;
  --acc: #b32b23;
  font-family: "Helvetica Neue", Helvetica, Arial, "Liberation Sans", system-ui, sans-serif;
  font-size: 13px;
  line-height: 1.55;
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
.spec .mono {
  font-family: ui-monospace, "SF Mono", "Menlo", "Consolas", "Liberation Mono", monospace;
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
}
.spec table { width: 100%; border-collapse: collapse; }
.spec th, .spec td { text-align: left; vertical-align: top; padding: 5px 10px 5px 0; }
.spec thead th {
  font-family: ui-monospace, "SF Mono", "Menlo", "Consolas", "Liberation Mono", monospace;
  font-size: 9.5px;
  font-weight: 400;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--mid);
  border-bottom: 1px solid var(--ink);
  padding-bottom: 4px;
}
.spec tbody tr { border-bottom: 1px dotted var(--rule); }
.spec a { color: inherit; text-decoration: none; border-bottom: 1px solid var(--acc); }
.spec a:hover { color: var(--acc); }
.spec .num { text-align: right; padding-right: 0; }
`;

function Section({
  n,
  title,
  note,
  children,
}: {
  n: string;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[#17181a] pt-2 pb-9">
      <div className="mb-4 flex items-baseline justify-between gap-6">
        <h2 className="mono m-0 text-[11px] font-normal uppercase tracking-[0.18em]">
          <span className="text-[var(--acc)]">{n}</span>
          <span className="px-2 text-[var(--rule)]">/</span>
          {title}
        </h2>
        {note ? (
          <span className="mono shrink-0 text-[9.5px] uppercase tracking-[0.14em] text-[var(--dim)]">
            {note}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function SpecRow({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <tr>
      <th scope="row" className="mono w-[190px] text-[10.5px] font-normal text-[var(--mid)]">
        {k}
      </th>
      <td className="text-[12.5px] leading-[1.5]">{children}</td>
    </tr>
  );
}

/* ------------------------------------------------------------------- chart */

function Trace({
  values,
  unit,
  caption,
}: {
  values: number[];
  unit: string;
  caption: string;
}) {
  const w = 900;
  const h = 150;
  const l = 46;
  const r = 8;
  const t = 30;
  const b = 24;
  const max = Math.max(...values);
  const peak = values.indexOf(max);
  const x = (i: number) => l + (i / (values.length - 1)) * (w - l - r);
  const y = (v: number) => t + (1 - v / max) * (h - t - b);
  const path = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join("");
  const ticks = [0, 5, 10, 15, 20];
  const digits = max >= 10 ? 1 : 3;

  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${w} ${h}`} className="block w-full" role="img" aria-label={caption}>
        {[0, 0.5, 1].map((f) => (
          <line
            key={f}
            x1={l}
            x2={w - r}
            y1={y(max * f)}
            y2={y(max * f)}
            stroke={f === 0 ? "#17181a" : "#e2e0db"}
            strokeWidth="1"
          />
        ))}
        {ticks.map((i) => (
          <g key={i}>
            <line x1={x(i)} x2={x(i)} y1={h - b} y2={h - b + 4} stroke="#8b8f96" strokeWidth="1" />
            <text
              x={x(i)}
              y={h - b + 16}
              textAnchor="middle"
              fontSize="10.5"
              fill="#8b8f96"
              fontFamily="ui-monospace, Menlo, Consolas, monospace"
            >
              {i}
            </text>
          </g>
        ))}
        <text
          x={l - 7}
          y={y(max) + 4}
          textAnchor="end"
          fontSize="10.5"
          fill="#5c5f66"
          fontFamily="ui-monospace, Menlo, Consolas, monospace"
        >
          {max.toFixed(digits)}
        </text>
        <text
          x={l - 7}
          y={y(0) + 4}
          textAnchor="end"
          fontSize="10.5"
          fill="#5c5f66"
          fontFamily="ui-monospace, Menlo, Consolas, monospace"
        >
          0
        </text>
        <path d={path} fill="none" stroke="#17181a" strokeWidth="1.2" />
        {values.map((v, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(v)}
            r={i === peak ? 2.6 : 1.5}
            fill={i === peak ? "#b32b23" : "#17181a"}
          />
        ))}
        <line
          x1={x(peak)}
          x2={x(peak)}
          y1={y(max) - 5}
          y2={t - 9}
          stroke="#b32b23"
          strokeWidth="0.8"
        />
        <text
          x={x(peak) + 6}
          y={t - 13}
          fontSize="11.5"
          fill="#b32b23"
          fontFamily="ui-monospace, Menlo, Consolas, monospace"
        >
          {max} {unit} at t = {peak} min
        </text>
      </svg>
      <figcaption className="mt-1 text-[11px] leading-[1.5] text-[var(--mid)]">{caption}</figcaption>
    </figure>
  );
}

/* -------------------------------------------------------------------- data */

const ORDER = ["nk92", "dynamic", "cell004", "cell007", "cell008", "organoid"];
const ROWS: Dataset[] = ORDER.map((k) => DATASETS[k]);

const REFERENCE: [string, React.ReactNode][] = [
  [
    "Method reference",
    <>
      {PAPER.shortAuthors}, <i>{PAPER.journal}</i> {PAPER.year}
    </>,
  ],
  [
    "DOI",
    <a key="doi" href={PAPER.url}>
      {PAPER.doi}
    </a>,
  ],
  [
    "Preprint",
    <a key="pre" href={PAPER.preprintUrl}>
      biorxiv.org/…/516758v1
    </a>,
  ],
  [
    "Source",
    <a key="src" href={LINKS.github}>
      github.com/rgerum/saenopy
    </a>,
  ],
  [
    "Documentation",
    <a key="doc" href={LINKS.docs}>
      saenopy.readthedocs.io
    </a>,
  ],
];

const HEADLINE: { k: string; v: string }[] = [
  { k: "Force range", v: "1 nN – 10 µN" },
  { k: "Input", v: "confocal / bright-field stacks" },
  { k: "Matrix model", v: "non-linear, strain-stiffening" },
  { k: "Time", v: "series, solved per frame" },
];

/* -------------------------------------------------------------------- page */

export default function SpecSheet() {
  const forcePeak = Math.max(...FORCE_TRACE);
  const dyn = DATASETS.dynamic;

  return (
    <main className="spec min-h-screen bg-[#eeece7] py-10 px-4 print:bg-white">
      <style>{SHEET_CSS}</style>

      <div className="mx-auto max-w-[1080px] border border-[#c9c5bd] bg-white px-10 py-9 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        {/* ------------------------------------------------------- masthead */}
        <header className="border-b-2 border-[#17181a] pb-4">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_300px]">
            <div>
              <div className="mono text-[10px] uppercase tracking-[0.24em] text-[var(--acc)]">
                Technical specification
              </div>
              <h1 className="mt-2 mb-0 text-[38px] font-medium leading-[1] tracking-[-0.025em]">
                Saenopy
              </h1>
              <p className="mt-2 mb-0 max-w-[52ch] text-[13.5px] leading-[1.5] text-[var(--mid)]">
                Open-source 3D traction force microscopy. It measures the forces a cell exerts on
                the matrix around it, in a non-linear biopolymer network, from image stacks —
                including bright-field.
              </p>
            </div>
            <dl className="m-0 self-end">
              {REFERENCE.map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-baseline justify-between gap-4 border-b border-dotted border-[var(--rule)] py-[3px]"
                >
                  <dt className="mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--dim)]">
                    {k}
                  </dt>
                  <dd className="mono m-0 text-right text-[11px]">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </header>

        <div className="grid grid-cols-2 border-b border-[#17181a] md:grid-cols-4">
          {HEADLINE.map((c, i) => (
            <div
              key={c.k}
              className={`py-3 ${i ? "border-l border-[var(--rule)] pl-4" : "pr-4"} ${
                i < 3 ? "pr-4" : ""
              }`}
            >
              <div className="mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--dim)]">
                {c.k}
              </div>
              <div className="mono mt-1 text-[13px] leading-[1.3]">{c.v}</div>
            </div>
          ))}
        </div>

        <div className="mt-9">
          {/* ------------------------------------------------------ 1 scope */}
          <Section n="01" title="Scope" note={`${PAPER.journal} ${PAPER.year}`}>
            <div className="grid gap-9 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div>
                <p className="mt-0 text-[13px] leading-[1.6]">
                  Saenopy implements the method published as{" "}
                  <a href={PAPER.url}>&ldquo;{PAPER.title}&rdquo;</a>. It reconstructs the
                  deformation field a cell imposes on a 3D biopolymer matrix and solves for the
                  forces that produced it, using a material model that accounts for the
                  non-linearity of collagen, fibrin and Matrigel rather than assuming linear
                  elasticity.
                </p>
                <p className="mb-0 text-[13px] leading-[1.6]">
                  It is a measurement, not a proxy: the output is a force field in nN at every node
                  of the mesh, per time point. The paper reports it across four orders of magnitude
                  and applies it to natural killer cells migrating at {IMMUNO.speed}.
                </p>
                <ul className="mt-4 mb-0 list-none p-0">
                  {CLAIMS.map((c) => (
                    <li
                      key={c.headline}
                      className="border-t border-dotted border-[var(--rule)] py-[6px]"
                    >
                      <span className="mono text-[11px] text-[var(--acc)]">{c.headline}</span>
                      <span className="mono px-2 text-[var(--rule)]">·</span>
                      <span className="text-[12px] leading-[1.45] text-[var(--mid)]">{c.body}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="self-start border border-[var(--rule)] bg-[#faf9f7] p-5">
                <div className="mono text-[9.5px] uppercase tracking-[0.16em] text-[var(--dim)]">
                  Abstract, verbatim
                </div>
                <p className="mt-3 mb-0 text-[12px] leading-[1.6]">{PAPER.abstract}</p>
                <p className="mono mt-4 mb-0 text-[10px] leading-[1.6] text-[var(--mid)]">
                  {PAPER.authors}. {PAPER.title}. {PAPER.journal}, {PAPER.year}.{" "}
                  <a href={PAPER.url}>{PAPER.doi}</a>
                </p>
              </div>
            </div>
          </Section>

          {/* ---------------------------------------------- 2 specification */}
          <Section n="02" title="Specification" note="method + i/o">
            <div className="grid gap-x-10 md:grid-cols-2">
              <table>
                <tbody>
                  <SpecRow k="Measurand">
                    Traction forces a cell exerts on the surrounding 3D matrix
                  </SpecRow>
                  <SpecRow k="Sensitive range">
                    ∼1 nN (axon growth cone) to ∼10 µN (mouse intestinal organoid)
                  </SpecRow>
                  <SpecRow k="Object size">
                    Single cells up to multicellular organoids, one method across the range
                  </SpecRow>
                  <SpecRow k="Input">
                    Time series of confocal <i>or</i> bright-field image stacks
                  </SpecRow>
                  <SpecRow k="Labelling">
                    Not required — bright-field stacks are sufficient, so cells need no fluorescent
                    label
                  </SpecRow>
                  <SpecRow k="Matrix">
                    Non-linear biopolymer networks: collagen, fibrin, Matrigel
                  </SpecRow>
                  <SpecRow k="Material model">
                    Accounts for strain stiffening of the network instead of assuming linear
                    elasticity
                  </SpecRow>
                </tbody>
              </table>
              <table>
                <tbody>
                  <SpecRow k="Time resolution">
                    Solved per frame; the reference series here is {dyn.frames} points at{" "}
                    {dyn.frameInterval} s
                  </SpecRow>
                  <SpecRow k="Output — deformation">
                    <span className="mono text-[11.5px]">measured</span>,{" "}
                    <span className="mono text-[11.5px]">target</span> and{" "}
                    <span className="mono text-[11.5px]">fitted deformations</span>, in µm per node
                  </SpecRow>
                  <SpecRow k="Output — force">
                    <span className="mono text-[11.5px]">fitted forces</span>, in nN per node
                  </SpecRow>
                  <SpecRow k="Output — scalars">
                    Total strain energy stored in the matrix and peak force, per time point
                  </SpecRow>
                  <SpecRow k="Mesh">
                    Regular grid; the reference results here use 25³ = 15,625 and 29³ = 24,389 nodes
                  </SpecRow>
                  <SpecRow k="Implementation">
                    Python, open source. Desktop GUI and scriptable API
                  </SpecRow>
                  <SpecRow k="Source / licence">
                    <a href={LINKS.github}>github.com/rgerum/saenopy</a> — licence as stated in the
                    repository
                  </SpecRow>
                </tbody>
              </table>
            </div>
            <p className="mt-4 mb-0 text-[11px] leading-[1.5] text-[var(--dim)]">
              Range, input modality, matrix non-linearity and the NK cell result are taken from the{" "}
              {PAPER.journal} paper. Mesh sizes and field names are read from the exported results
              listed in §03.
            </p>
          </Section>

          {/* ----------------------------------------- 3 reference measurements */}
          <Section n="03" title="Reference measurements" note="measured from public/data">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Specimen</th>
                  <th>Preparation</th>
                  <th className="num">Nodes</th>
                  <th className="num">
                    Peak def. <span className="normal-case">[µm]</span>
                  </th>
                  <th className="num">
                    Peak force <span className="normal-case">[nN]</span>
                  </th>
                  <th className="num">
                    Frames
                  </th>
                  <th className="num">
                    Bundle <span className="normal-case">[kB]</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((d) => (
                  <tr key={d.id}>
                    <td className="mono w-[74px] text-[11px] text-[var(--acc)]">{d.id}</td>
                    <td className="text-[12px] leading-[1.4]">{d.label}</td>
                    <td className="text-[12px] leading-[1.4] text-[var(--mid)]">{d.subject}</td>
                    <td className="mono num text-[11.5px]">{d.meshNodes.toLocaleString("en")}</td>
                    <td className="mono num text-[11.5px]">{d.peakDeformation.toFixed(2)}</td>
                    <td className="mono num text-[11.5px]">{d.peakForce}</td>
                    <td className="mono num text-[11.5px] text-[var(--mid)]">{d.frames ?? 1}</td>
                    <td className="mono num text-[11.5px]">{d.transferKB}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 grid gap-8 md:grid-cols-3">
              <p className="m-0 text-[11.5px] leading-[1.55] text-[var(--mid)]">
                <span className="mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink)]">
                  Spread
                </span>{" "}
                — <span className="mono">cell004/007/008</span> are three fibroblasts from one
                experiment: {DATASETS.cell004.peakForce}, {DATASETS.cell007.peakForce} and{" "}
                {DATASETS.cell008.peakForce} nN. {DATASETS.cell008.blurb}
              </p>
              <p className="m-0 text-[11.5px] leading-[1.55] text-[var(--mid)]">
                <span className="mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink)]">
                  Dynamic range
                </span>{" "}
                — the same pipeline resolves {DATASETS.nk92.peakForce} nN on an unlabelled immune
                cell and {DATASETS.organoid.peakForce} nN on a whole organoid, two orders of
                magnitude apart.
              </p>
              <p className="m-0 text-[11.5px] leading-[1.55] text-[var(--mid)]">
                <span className="mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink)]">
                  Note
                </span>{" "}
                — peaks are the largest fitted value in each result, as reported by the exporter.
                They are the datasets shown on this site, not a benchmark suite.
              </p>
            </div>
          </Section>

          {/* --------------------------------------------------- 4 field view */}
          <Section n="04" title="Field output" note="fig. 1">
            <ViewerPanel />
          </Section>

          {/* ------------------------------------------------- 5 time series */}
          <Section n="05" title="Time-resolved output" note={`${dyn.frames} frames · 1 min`}>
            <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_240px]">
              <div className="grid gap-5">
                <Trace
                  values={FORCE_TRACE}
                  unit="nN"
                  caption="Fig. 2a — peak traction force per frame, nN. Frame n is minute n."
                />
                <Trace
                  values={ENERGY_TRACE}
                  unit="fJ"
                  caption="Fig. 2b — total strain energy stored in the matrix per frame, fJ."
                />
              </div>
              <div>
                <div className="mono border-b border-[#17181a] pb-1 text-[10px] uppercase tracking-[0.14em]">
                  Reading
                </div>
                <p className="mt-2 mb-3 text-[11.5px] leading-[1.55] text-[var(--mid)]">
                  {dyn.blurb}
                </p>
                <p className="m-0 text-[11.5px] leading-[1.55] text-[var(--mid)]">
                  {IMMUNO.finding}
                </p>
                <p className="mono mt-3 mb-0 text-[10px] leading-[1.6] text-[var(--dim)]">
                  peak {forcePeak} nN · bundle {dyn.transferKB} kB · {dyn.meshNodes.toLocaleString("en")}{" "}
                  nodes
                </p>
              </div>
            </div>
          </Section>

          {/* --------------------------------------------------- 6 transport */}
          <Section n="06" title="Field transport format" note="sfb1 · this site only">
            <div className="grid gap-9 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
              <div>
                <p className="mt-0 text-[12.5px] leading-[1.6]">
                  The fields on this page are not shipped as raw arrays. Each result is exported by{" "}
                  <span className="mono text-[11.5px]">scripts/export_field_bundle.py</span> into a
                  bundle that stores one arrow in <b>5 bytes</b>, against the <b>24 bytes</b> a
                  float32 node/vector pair costs, and read back in the browser by{" "}
                  <span className="mono text-[11.5px]">components/mesh/field_bundle.ts</span>.
                </p>
                <div className="mt-5 grid grid-cols-5 border border-[#17181a] text-center">
                  <div className="col-span-2 border-r border-[#17181a] px-2 py-3">
                    <div className="mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--acc)]">
                      byte 0–1
                    </div>
                    <div className="mono mt-1 text-[11px]">grid index</div>
                    <div className="mt-1 text-[10.5px] leading-[1.4] text-[var(--mid)]">
                      delta-coded, uint16
                    </div>
                  </div>
                  <div className="col-span-2 border-r border-[#17181a] px-2 py-3">
                    <div className="mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--acc)]">
                      byte 2–3
                    </div>
                    <div className="mono mt-1 text-[11px]">direction</div>
                    <div className="mt-1 text-[10.5px] leading-[1.4] text-[var(--mid)]">
                      octahedron-encoded
                    </div>
                  </div>
                  <div className="px-2 py-3">
                    <div className="mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--acc)]">
                      byte 4
                    </div>
                    <div className="mono mt-1 text-[11px]">magnitude</div>
                    <div className="mt-1 text-[10.5px] leading-[1.4] text-[var(--mid)]">
                      sqrt space, uint8
                    </div>
                  </div>
                </div>
                <div className="mt-5">
                  {[
                    { k: "SFB1", v: 5, acc: true },
                    { k: "float32 pair", v: 24, acc: false },
                  ].map((bar) => (
                    <div key={bar.k} className="mb-1 flex items-center gap-3">
                      <span className="mono w-[86px] shrink-0 text-[10px] uppercase tracking-[0.1em] text-[var(--mid)]">
                        {bar.k}
                      </span>
                      <span
                        className={`h-[10px] ${bar.acc ? "bg-[var(--acc)]" : "bg-[#17181a]"}`}
                        style={{ width: `${(bar.v / 24) * 76}%` }}
                      />
                      <span className="mono text-[10.5px]">{bar.v} B / arrow</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 mb-0 text-[11.5px] leading-[1.55] text-[var(--mid)]">
                  In practice: all {ROWS.length} results in §03, including the{" "}
                  {DATASETS.dynamic.frames}-frame time series, come to{" "}
                  <span className="mono">
                    {ROWS.reduce((s, d) => s + d.transferKB, 0).toFixed(1)} kB
                  </span>{" "}
                  in total over the wire.
                </p>
                <p className="mt-4 mb-0 border-t border-dotted border-[var(--rule)] pt-3 text-[11.5px] leading-[1.55] text-[var(--dim)]">
                  This format is a delivery detail of the web viewer, not part of the measurement.
                  Saenopy results themselves stay in full float precision — the bundle exists so
                  that a reviewer can rotate a real force field over a hotel connection instead of
                  looking at a screenshot of one.
                </p>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Step</th>
                    <th>What it does</th>
                  </tr>
                </thead>
                <tbody>
                  <SpecRow k="Node positions">
                    Dropped entirely when the mesh is a regular grid and rebuilt as{" "}
                    <span className="mono text-[11px]">origin + spacing × index</span>
                  </SpecRow>
                  <SpecRow k="Arrow selection">
                    Only the largest vectors are kept; the rest are far below one pixel of arrow
                    length. The kept and total counts travel in the header
                  </SpecRow>
                  <SpecRow k="Direction">
                    Unit vector octahedron-encoded into two bytes
                  </SpecRow>
                  <SpecRow k="Magnitude">
                    One byte in sqrt space, which puts the fine quantisation steps where the small
                    but still visible arrows are
                  </SpecRow>
                  <SpecRow k="Container">
                    Gzipped, with byte planes stored separately so the high bytes compress as a run.
                    Unpacked in the browser, so the transfer size does not depend on the host
                  </SpecRow>
                  <SpecRow k="Reconstruction error">
                    The exporter measures the decoded field against the original and writes the mean
                    and worst per-arrow error into the header. For the six bundles here: mean 0.08 –
                    0.29 % of peak magnitude, worst single arrow 1.33 %
                  </SpecRow>
                </tbody>
              </table>
            </div>
          </Section>

          {/* ------------------------------------------- 7 application note */}
          <Section n="07" title="Application note — cell therapy" note="immuno-oncology">
            <div className="border-l-2 border-[var(--acc)] pl-4">
              <p className="m-0 max-w-[76ch] text-[13.5px] leading-[1.55]">{IMMUNO.finding}</p>
              <p className="mono mt-1 mb-0 text-[10px] uppercase tracking-[0.12em] text-[var(--dim)]">
                {PAPER.shortAuthors}, {PAPER.journal} {PAPER.year}
              </p>
            </div>
            <div className="mt-6 grid gap-8 md:grid-cols-3">
              {IMMUNO.why.map((w, i) => (
                <div key={w.title} className="border-t border-[#17181a] pt-2">
                  <div className="mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--dim)]">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-1 mb-1 text-[12.5px] font-medium leading-[1.35]">{w.title}</h3>
                  <p className="m-0 text-[12px] leading-[1.55] text-[var(--mid)]">{w.body}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 mb-0 max-w-[86ch] text-[12px] leading-[1.6] text-[var(--mid)]">
              The measurement relevant to a transferred cell product is therefore the same one shown
              in §04 and §05: a per-cell, in-3D traction readout, taken from bright-field stacks of
              cells in a matrix whose stiffness you set.
            </p>
          </Section>

          {/* ----------------------------------------------- 8 placeholders */}
          <Section n="08" title="Not characterised here" note={PLACEHOLDERS.note}>
            <p className="mt-0 mb-4 max-w-[86ch] text-[12.5px] leading-[1.6]">
              The following are within the method&apos;s scope but are <b>not</b> shown on this
              page, because we do not have data we could stand behind in front of a reviewer. Each
              needs an experiment on your material. They are listed so the gap is explicit.
            </p>
            <table>
              <thead>
                <tr>
                  <th className="w-[36px]">#</th>
                  <th className="w-[220px]">Measurement</th>
                  <th>What it would show</th>
                  <th className="w-[130px]">Status</th>
                </tr>
              </thead>
              <tbody>
                {PLACEHOLDERS.panels.map((p, i) => (
                  <tr key={p.title}>
                    <td className="mono text-[11px] text-[var(--dim)]">
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td className="text-[12.5px] leading-[1.4]">{p.title}</td>
                    <td className="text-[12px] leading-[1.5] text-[var(--mid)]">{p.body}</td>
                    <td>
                      <span className="mono inline-block border border-[var(--acc)] px-[6px] py-[1px] text-[9px] uppercase tracking-[0.12em] text-[var(--acc)]">
                        Placeholder
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* -------------------------------------------------- 9 availability */}
          <Section n="09" title="Availability and support" note="open source + services">
            <div className="grid gap-9 md:grid-cols-[minmax(0,1fr)_300px]">
              <div>
                <p className="mt-0 mb-3 text-[12.5px] leading-[1.6]">
                  The software is open source and can be installed and run without us. The group
                  that wrote it also takes on work directly:
                </p>
                <ol className="m-0 list-none p-0">
                  {SERVICES.map((s, i) => (
                    <li
                      key={s}
                      className="flex gap-3 border-t border-dotted border-[var(--rule)] py-[6px] text-[12.5px]"
                    >
                      <span className="mono shrink-0 text-[10px] text-[var(--acc)]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="border border-[#17181a] p-5">
                <div className="mono text-[9.5px] uppercase tracking-[0.16em] text-[var(--dim)]">
                  Contact
                </div>
                <a
                  href={LINKS.contact}
                  className="mono mt-2 block text-[13px] leading-[1.4] break-all"
                >
                  richard.gerum@protonmail.com
                </a>
                <p className="mt-3 mb-0 text-[11.5px] leading-[1.55] text-[var(--mid)]">
                  For an evaluation, the useful first message is a description of your cells, your
                  matrix and the imaging you already have. We can say quickly whether the method
                  applies.
                </p>
                <div className="mono mt-4 border-t border-dotted border-[var(--rule)] pt-3 text-[10.5px] leading-[1.8]">
                  <div>
                    <a href={LINKS.github}>github.com/rgerum/saenopy</a>
                  </div>
                  <div>
                    <a href={LINKS.docs}>saenopy.readthedocs.io</a>
                  </div>
                  <div>
                    <a href={LINKS.site}>saenopy.com</a>
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </div>

        <footer className="mono flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t-2 border-[#17181a] pt-3 text-[9.5px] uppercase tracking-[0.14em] text-[var(--dim)]">
          <span>Saenopy — 3D traction force microscopy</span>
          <span>
            Method: <a href={PAPER.url}>{PAPER.doi}</a>
          </span>
          <span>
            All figures generated from the bundles in <span className="normal-case">public/data</span>
          </span>
        </footer>
      </div>
    </main>
  );
}
