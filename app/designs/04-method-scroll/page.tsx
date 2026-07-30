"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";

import { DisplayMesh } from "@/components/mesh/display";
import {
  CLAIMS,
  DATASETS,
  IMMUNO,
  LINKS,
  PAPER,
  SERVICES,
} from "@/lib/saenopy-content";

const CELL = DATASETS.cell007;
const DYN = DATASETS.dynamic;

const SERIF: React.CSSProperties = {
  fontFamily:
    'var(--font-source-serif), "Iowan Old Style", Palatino, Georgia, "Times New Roman", serif',
};
const MONO: React.CSSProperties = {
  fontFamily:
    'var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
};
const SANS: React.CSSProperties = {
  fontFamily:
    'var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
};

const TEAL = "#2f6f63";
const OCHRE = "#a2572f";
const INK = "#23272b";

interface Step {
  n: string;
  title: string;
  /** field shown in the sticky viewer, null keeps the schematic up */
  field: string | null;
  accent: string;
  io: string;
  paragraphs: string[];
  readout: { k: string; v: string }[];
}

const STEPS: Step[] = [
  {
    n: "01",
    title: "Image the volume",
    field: null,
    accent: "#6e7168",
    io: "in: microscope → out: two image stacks",
    paragraphs: [
      "Everything starts with the cell where it actually lives: inside a three-dimensional biopolymer network — collagen, fibrin or Matrigel — rather than spread on flat plastic. Record a z-stack of that volume while the cell is pulling, then a second stack of the same volume in the relaxed reference state.",
      "The method is applied to time series of confocal or bright-field image stacks, so the cell does not have to carry a fluorescent label to be measured. The matrix fibres are the only fiducial markers the measurement needs.",
    ],
    readout: [
      { k: "modality", v: "confocal or bright-field" },
      { k: "label", v: "not required" },
    ],
  },
  {
    n: "02",
    title: "Track how the matrix moved",
    field: "measured deformations",
    accent: TEAL,
    io: "in: two image stacks → out: measured deformations",
    paragraphs: [
      "Comparing the stressed and the relaxed stack gives the displacement of the matrix texture at every point of a regular grid spanning the volume. That is the measured deformation field, and it is the only thing in this whole pipeline that is observed rather than inferred: each arrow is a piece of matrix that was seen to move.",
      `The cell in the figure is a fibroblast showing the classic three-lobed contraction pattern of a spread cell, and its field is sampled on ${CELL.meshNodes.toLocaleString("en-US")} nodes. The whole bundle you are rotating with the mouse travelled over the wire in ${CELL.transferKB} kB.`,
    ],
    readout: [
      { k: "field", v: "measured deformations" },
      { k: "grid nodes", v: CELL.meshNodes.toLocaleString("en-US") },
    ],
  },
  {
    n: "03",
    title: "Fit the material, not a spring",
    field: "fitted deformations",
    accent: TEAL,
    io: "in: measured deformations → out: fitted deformations",
    paragraphs: [
      "Biopolymer networks are not linearly elastic. Collagen, fibrin and Matrigel buckle under compression and stiffen as they are strained, and a linear model gets the forces wrong by a wide margin in exactly the regime a cell works in. Saenopy carries a non-linear material model of the fibre network instead.",
      "Under that model the solver looks for a deformation field that the material could genuinely produce and that stays as close as possible to what was measured. The result is the fitted deformation field now on the left. How closely it reproduces step 02 is the honest check on the whole reconstruction.",
    ],
    readout: [
      { k: "field", v: "fitted deformations" },
      { k: "peak", v: `${CELL.peakDeformation} µm` },
    ],
  },
  {
    n: "04",
    title: "Solve for the forces",
    field: "fitted forces",
    accent: OCHRE,
    io: "in: fitted deformations → out: fitted forces, in nN",
    paragraphs: [
      "With the material model fixed, the question inverts: which forces, applied where, must have produced that deformation? Solving it yields a force vector at every node of the mesh — the traction the cell exerts on the network around it, resolved in three dimensions rather than projected onto a plane.",
      `This fibroblast peaks at ${CELL.peakForce} nN. The same procedure spans roughly 1 nN for a single axon growth cone up to about 10 µN for a mouse intestinal organoid: four orders of magnitude of force and object size, one method.`,
    ],
    readout: [
      { k: "field", v: "fitted forces" },
      { k: "peak", v: `${CELL.peakForce} nN` },
    ],
  },
];

/** Schematic that stands in for step 01, where there is no field to draw yet. */
const SPECKLES = [
  [24, 8],
  [52, -6],
  [86, 10],
  [118, -4],
  [40, 22],
  [98, 24],
  [66, -18],
];

function StackSchematic() {
  const slices = [0, 1, 2, 3, 4];
  /** pull > 0 drags the matrix speckles toward the cell, as a stressed matrix is */
  const stack = (x: number, label: string, tint: string, pull: number) => (
    <g transform={`translate(${x} 0)`}>
      {slices.map((i) => {
        const y = 190 - i * 27;
        return (
          <g key={i}>
            <polygon
              points={`0,${y} 62,${y - 34} 178,${y - 34} 116,${y}`}
              fill="#20262b"
              fillOpacity={0.88}
              stroke="#5d6a72"
              strokeWidth={1}
            />
            {SPECKLES.map(([sx, sy], j) => {
              const cx = 89;
              const cy = y - 17;
              const px = 20 + sx;
              const py = y - 17 + sy * 0.55;
              return (
                <circle
                  key={j}
                  cx={px + (cx - px) * pull}
                  cy={py + (cy - py) * pull}
                  r={1.6}
                  fill="#93a0a8"
                  fillOpacity={0.85}
                />
              );
            })}
          </g>
        );
      })}
      <ellipse
        cx={89}
        cy={122}
        rx={16}
        ry={8}
        fill={tint}
        fillOpacity={0.5}
        stroke={tint}
      />
      <ellipse
        cx={89}
        cy={95}
        rx={11}
        ry={6}
        fill={tint}
        fillOpacity={0.32}
        stroke={tint}
        strokeOpacity={0.7}
      />
      <text
        x={89}
        y={228}
        textAnchor="middle"
        fill="#9aa5ac"
        fontSize={12}
        letterSpacing={1.4}
        style={MONO}
      >
        {label}
      </text>
    </g>
  );

  return (
    <svg
      viewBox="0 0 470 250"
      className="h-full w-full"
      role="img"
      aria-label="Schematic of two image stacks of the same volume, stressed and relaxed"
    >
      {stack(20, "STRESSED", "#c8763f", 0.16)}
      {stack(272, "RELAXED", "#4f8f83", 0)}
      <g stroke="#6d7a82" strokeWidth={1}>
        <line x1={215} y1={110} x2={262} y2={110} />
        <polygon points="272,110 260,105 260,115" fill="#6d7a82" stroke="none" />
      </g>
      <text
        x={238}
        y={98}
        textAnchor="middle"
        fill="#9aa5ac"
        fontSize={11}
        letterSpacing={1.2}
        style={MONO}
      >
        COMPARE
      </text>
      <text
        x={235}
        y={20}
        textAnchor="middle"
        fill="#7e8990"
        fontSize={11}
        letterSpacing={1.2}
        style={MONO}
      >
        Z-STACK OF THE SAME VOLUME, TWICE
      </text>
    </svg>
  );
}

/** the three fields the pipeline walks through, in step order */
const FIELDS = [
  "measured deformations",
  "fitted deformations",
  "fitted forces",
] as const;

export default function MethodScrollPage() {
  const [active, setActive] = React.useState(0);
  const sectionRefs = React.useRef<(HTMLElement | null)[]>([]);

  const step = STEPS[active];

  // One viewer, one WebGL context. `shown` is the field it currently holds and
  // `busy` is true while a field is being loaded; a new field is only handed to
  // the viewer once the previous one has finished, so a fast scroll can never
  // tear down a load that is still in flight. Step 01 has no field of its own
  // and simply keeps whatever is loaded behind the schematic.
  const [shown, setShown] = React.useState<string>(FIELDS[0]);
  const [busy, setBusy] = React.useState(true);
  const target = step.field ?? shown;

  React.useEffect(() => {
    if (busy || shown === target) return;
    setShown(target);
    setBusy(true);
  }, [busy, shown, target]);

  const onReady = React.useCallback(() => setBusy(false), []);

  // a missed callback must not leave the panel dark for good
  React.useEffect(() => {
    const timer = window.setTimeout(() => setBusy(false), 4000);
    return () => window.clearTimeout(timer);
  }, [shown]);

  // A step is current once its top has passed the middle of the window; the
  // observer is only the trigger, the geometry decides, so landing anywhere —
  // including a deep link past the last step — resolves to the right step.
  React.useEffect(() => {
    const nodes = sectionRefs.current.filter(Boolean) as HTMLElement[];
    if (!nodes.length) return;
    const resolve = () => {
      const middle = window.innerHeight / 2;
      let next = 0;
      nodes.forEach((node, index) => {
        if (node.getBoundingClientRect().top <= middle) next = index;
      });
      setActive(next);
    };
    const observer = new IntersectionObserver(resolve, {
      rootMargin: "-48% 0px -48% 0px",
      threshold: 0,
    });
    nodes.forEach((node) => observer.observe(node));
    window.addEventListener("resize", resolve);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resolve);
    };
  }, []);

  // the time-resolved viewer only mounts once it is nearly in view, so the page
  // never holds more WebGL contexts than it is actually showing
  const dynRef = React.useRef<HTMLDivElement | null>(null);
  const [dynMounted, setDynMounted] = React.useState(false);
  React.useEffect(() => {
    const node = dynRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setDynMounted(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const fieldVisible = Boolean(step.field) && step.field === shown && !busy;

  const goTo = (index: number) => {
    sectionRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return (
    <div
      className="min-h-screen bg-[#e9e6df] text-[#23272b] antialiased"
      style={SANS}
    >
      {/* ---------------------------------------------------------------- nav */}
      <header className="border-b border-[#cfcbc1]">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-4">
          <div className="flex items-baseline gap-3">
            <span className="text-[17px] font-semibold tracking-tight">
              saenopy
            </span>
            <span
              className="text-[11px] uppercase tracking-[0.18em] text-[#6e7168]"
              style={MONO}
            >
              method note
            </span>
          </div>
          <nav
            className="flex items-center gap-5 text-[13px] text-[#5c6058]"
            style={MONO}
          >
            <a className="hover:text-[#23272b]" href={PAPER.url}>
              paper
            </a>
            <a className="hover:text-[#23272b]" href={LINKS.docs}>
              docs
            </a>
            <a className="hover:text-[#23272b]" href={LINKS.github}>
              github
            </a>
          </nav>
        </div>
      </header>

      {/* -------------------------------------------------------------- intro */}
      <section className="mx-auto max-w-[1180px] px-6 pt-16 pb-12 md:pt-24">
        <p
          className="text-[11px] uppercase tracking-[0.22em] text-[#6e7168]"
          style={MONO}
        >
          Four steps, one cell
        </p>
        <h1
          className="mt-5 max-w-3xl text-[40px] leading-[1.08] tracking-[-0.015em] md:text-[58px]"
          style={SERIF}
        >
          How the measurement works
        </h1>
        <div className="mt-8 grid gap-10 border-t border-[#cfcbc1] pt-8 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <p className="max-w-[46ch] text-[18px] leading-[1.75] text-[#3a3f40]">
            Saenopy turns image stacks of a cell inside a three-dimensional
            matrix into the forces that cell exerts on it. Nothing here is a
            proxy or a stiffness index: the output is a force, in nanonewtons,
            per cell, in 3D. The four steps below are the whole pipeline, and
            the figure alongside them is one real dataset moving through it.
          </p>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 self-start text-[13px]">
            {[
              { k: "dataset", v: CELL.label },
              { k: "subject", v: CELL.subject },
              { k: "grid nodes", v: CELL.meshNodes.toLocaleString("en-US") },
              { k: "bundle transferred", v: `${CELL.transferKB} kB` },
              { k: "peak deformation", v: `${CELL.peakDeformation} µm` },
              { k: "peak traction", v: `${CELL.peakForce} nN` },
            ].map((item) => (
              <div key={item.k}>
                <dt
                  className="text-[10px] uppercase tracking-[0.16em] text-[#82857c]"
                  style={MONO}
                >
                  {item.k}
                </dt>
                <dd className="mt-1 leading-snug text-[#33383a]">{item.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ------------------------------------------------------ the scrolling */}
      <section className="mx-auto max-w-[1180px] px-6 pb-24">
        <div className="grid gap-x-16 lg:grid-cols-2">
          {/* ---- sticky figure ---- */}
          <div className="sticky top-0 z-20 -mx-6 bg-[#e9e6df] px-6 pt-3 pb-4 lg:top-8 lg:mx-0 lg:self-start lg:px-0 lg:pt-0">
            <figure className="border border-[#cfcbc1] bg-[#1a1e22]">
              <div className="relative h-[38vh] min-h-[240px] w-full lg:h-[490px]">
                <div
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    step.field ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <StackSchematic />
                </div>
                <div
                  aria-hidden={!fieldVisible}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    fieldVisible ? "opacity-100" : "pointer-events-none opacity-0"
                  }`}
                >
                  <DisplayMesh
                    bundle={CELL.bundle}
                    field={shown}
                    height="100%"
                    className="h-full w-full"
                    arrow_span={0.09}
                    zoom={1.15}
                    cube="field"
                    cube_color={0x5b6770}
                    background="transparent"
                    logo_width="0px"
                    cmap="turbo"
                    show_controls={false}
                    show_colormap
                    mouse_control
                    animations={[{ type: "rotate", speed: 5 }]}
                    onStats={onReady}
                  />
                </div>
                <span
                  className="pointer-events-none absolute left-4 top-4 text-[10px] uppercase tracking-[0.18em] text-[#8f9aa1]"
                  style={MONO}
                >
                  {step.field ?? "schematic"}
                </span>
                <span
                  className={`pointer-events-none absolute right-4 top-4 text-[10px] uppercase tracking-[0.18em] text-[#8f9aa1] transition-opacity duration-300 ${
                    step.field && !fieldVisible ? "opacity-100" : "opacity-0"
                  }`}
                  style={MONO}
                >
                  loading field…
                </span>
              </div>
              <figcaption className="flex flex-wrap items-center justify-between gap-3 border-t border-[#333b41] px-4 py-3">
                <div className="flex items-center gap-2">
                  {STEPS.map((s, i) => (
                    <button
                      key={s.n}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-label={`Go to step ${s.n}: ${s.title}`}
                      aria-current={i === active}
                      className={`h-7 w-9 border text-[11px] transition-colors ${
                        i === active
                          ? "border-transparent bg-[#e9e6df] text-[#1a1e22]"
                          : "border-[#3d464c] text-[#8b959b] hover:border-[#5b6770]"
                      }`}
                      style={MONO}
                    >
                      {s.n}
                    </button>
                  ))}
                </div>
                <p
                  className="text-[11px] text-[#8b959b]"
                  style={MONO}
                  aria-live="polite"
                >
                  {step.field
                    ? `mouse: drag to rotate · colour = magnitude`
                    : "no field yet — this is the raw acquisition"}
                </p>
              </figcaption>
            </figure>
          </div>

          {/* ---- steps ---- */}
          <div className="lg:pt-4">
            {STEPS.map((s, i) => (
              <section
                key={s.n}
                id={`step-${s.n}`}
                data-index={i}
                ref={(node) => {
                  sectionRefs.current[i] = node;
                }}
                className="flex min-h-[72vh] flex-col justify-center border-b border-[#d7d3ca] py-14 last:border-b-0"
              >
                <div className="flex items-baseline gap-4">
                  <span
                    className="text-[13px] tabular-nums"
                    style={{ ...MONO, color: s.accent }}
                  >
                    {s.n}
                  </span>
                  <h2
                    className="text-[28px] leading-[1.15] tracking-[-0.01em] md:text-[34px]"
                    style={SERIF}
                  >
                    {s.title}
                  </h2>
                </div>
                <p
                  className="mt-4 text-[11px] tracking-[0.06em] text-[#7c7f76]"
                  style={MONO}
                >
                  {s.io}
                </p>
                <div className="mt-6 space-y-5 text-[17px] leading-[1.8] text-[#3a3f40]">
                  {s.paragraphs.map((p) => (
                    <p key={p.slice(0, 24)}>{p}</p>
                  ))}
                </div>
                <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-3 border-t border-[#d7d3ca] pt-4">
                  {s.readout.map((r) => (
                    <div key={r.k} className="flex items-baseline gap-2">
                      <dt
                        className="text-[10px] uppercase tracking-[0.16em] text-[#82857c]"
                        style={MONO}
                      >
                        {r.k}
                      </dt>
                      <dd
                        className="text-[13px]"
                        style={{ ...MONO, color: s.accent }}
                      >
                        {r.v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- time-resolved band */}
      <section className="border-y border-[#cfcbc1] bg-[#e1ddd4]">
        <div className="mx-auto grid max-w-[1180px] gap-12 px-6 py-16 md:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <div>
            <p
              className="text-[11px] uppercase tracking-[0.22em] text-[#6e7168]"
              style={MONO}
            >
              Step 05, if you want it
            </p>
            <h2
              className="mt-4 max-w-[20ch] text-[32px] leading-[1.12] md:text-[40px]"
              style={SERIF}
            >
              Then run the whole thing on every frame
            </h2>
            <p className="mt-6 max-w-[48ch] text-[17px] leading-[1.8] text-[#3a3f40]">
              Fast migrating cells are tracked frame by frame, which is what
              exposed the NK cell force bursts in the first place. The dataset
              alongside is {DYN.frames} consecutive time points, one per minute,
              of a migrating cell. Peak traction over the series is{" "}
              {DYN.peakForce} nN, and the trace peaks at minute 4 and settles
              back — a burst, not a steady pull.
            </p>
            <p className="mt-5 max-w-[48ch] text-[17px] leading-[1.8] text-[#3a3f40]">
              Immune cells migrate at {IMMUNO.speed} through dense tissue.
              Reading their mechanics out of a still image would miss the part
              that matters.
            </p>
            <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-3 border-t border-[#cbc7bd] pt-4 text-[13px]">
              {[
                { k: "time points", v: String(DYN.frames) },
                { k: "interval", v: `${DYN.frameInterval} s` },
                { k: "peak traction", v: `${DYN.peakForce} nN` },
                { k: "transferred", v: `${DYN.transferKB} kB` },
              ].map((item) => (
                <div key={item.k} className="flex items-baseline gap-2">
                  <dt
                    className="text-[10px] uppercase tracking-[0.16em] text-[#82857c]"
                    style={MONO}
                  >
                    {item.k}
                  </dt>
                  <dd className="tabular-nums" style={MONO}>
                    {item.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <figure className="border border-[#cfcbc1] bg-[#1a1e22]">
            <div ref={dynRef} className="h-[320px] w-full md:h-[380px]">
              {dynMounted ? (
                <DisplayMesh
                  bundle={DYN.bundle}
                  field="fitted forces"
                  height="100%"
                  className="h-full w-full"
                  arrow_span={0.1}
                  zoom={1.1}
                  cube="field"
                  cube_color={0x5b6770}
                  background="transparent"
                  logo_width="0px"
                  cmap="turbo"
                  show_controls={false}
                  show_colormap
                  mouse_control
                  animations={[
                    { type: "time", fps: 4 },
                    { type: "rotate", speed: 4 },
                  ]}
                />
              ) : null}
            </div>
            <figcaption
              className="border-t border-[#333b41] px-4 py-3 text-[11px] text-[#8b959b]"
              style={MONO}
            >
              {DYN.label} · fitted forces · playing at 4 fps
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ------------------------------------------------------------ claims */}
      <section className="mx-auto max-w-[1180px] px-6 py-20">
        <h2
          className="text-[11px] uppercase tracking-[0.22em] text-[#6e7168]"
          style={MONO}
        >
          What the method is good for
        </h2>
        <div className="mt-8 grid gap-px border border-[#cfcbc1] bg-[#cfcbc1] md:grid-cols-2 lg:grid-cols-4">
          {CLAIMS.map((claim) => (
            <div key={claim.headline} className="bg-[#e9e6df] p-6">
              <p
                className="text-[22px] leading-tight tracking-[-0.01em]"
                style={SERIF}
              >
                {claim.headline}
              </p>
              <p className="mt-3 text-[14px] leading-[1.7] text-[#4a4f4d]">
                {claim.body}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-[70ch] text-[13px] leading-[1.7] text-[#6e7168]">
          Every number on this page is either quoted from the paper or measured
          directly from the bundles the viewer above is loading. Peaks per
          dataset: {DATASETS.nk92.peakForce} nN for an NK92 cell,{" "}
          {DATASETS.cell004.peakForce} / {DATASETS.cell007.peakForce} /{" "}
          {DATASETS.cell008.peakForce} nN for three fibroblasts from one
          experiment, {DATASETS.organoid.peakForce} nN for an intestinal
          organoid.
        </p>
      </section>

      {/* ------------------------------------------------------------ immuno */}
      <section className="border-t border-[#cfcbc1] bg-[#dfe2dc]">
        <div className="mx-auto max-w-[1180px] px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div>
              <p
                className="text-[11px] uppercase tracking-[0.22em] text-[#5f6a62]"
                style={MONO}
              >
                Why a cell therapy group reads this page
              </p>
              <blockquote
                className="mt-6 border-l-2 pl-5 text-[21px] leading-[1.6]"
                style={{ ...SERIF, borderColor: TEAL }}
              >
                &ldquo;{IMMUNO.finding}&rdquo;
              </blockquote>
              <p
                className="mt-4 pl-5 text-[12px] text-[#5f6a62]"
                style={MONO}
              >
                {PAPER.shortAuthors}, {PAPER.journal} {PAPER.year}
              </p>
            </div>
            <ol className="space-y-7">
              {IMMUNO.why.map((item, i) => (
                <li key={item.title} className="flex gap-5">
                  <span
                    className="pt-1 text-[12px] tabular-nums text-[#7d8781]"
                    style={MONO}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-[17px] font-semibold tracking-[-0.005em]">
                      {item.title}
                    </h3>
                    <p className="mt-2 max-w-[52ch] text-[15px] leading-[1.75] text-[#3f4643]">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ footer */}
      <footer className="mx-auto max-w-[1180px] px-6 py-20">
        <div className="grid gap-12 border-t border-[#cfcbc1] pt-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div>
            <p
              className="text-[11px] uppercase tracking-[0.22em] text-[#6e7168]"
              style={MONO}
            >
              The paper behind the method
            </p>
            <h3
              className="mt-4 max-w-[38ch] text-[22px] leading-[1.35]"
              style={SERIF}
            >
              {PAPER.title}
            </h3>
            <p className="mt-4 max-w-[60ch] text-[13px] leading-[1.7] text-[#5c6058]">
              {PAPER.authors}. {PAPER.journal}, {PAPER.year}.
            </p>
            <div
              className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[13px]"
              style={MONO}
            >
              <a
                className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-[#2f6f63]"
                href={PAPER.url}
              >
                doi:{PAPER.doi} <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a
                className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-[#2f6f63]"
                href={PAPER.preprintUrl}
              >
                preprint <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
          <div>
            <p
              className="text-[11px] uppercase tracking-[0.22em] text-[#6e7168]"
              style={MONO}
            >
              Working with us
            </p>
            <p className="mt-4 max-w-[46ch] text-[15px] leading-[1.75] text-[#3a3f40]">
              Saenopy is open source and documented; the group behind it also
              takes on work directly:
            </p>
            <ul className="mt-5 space-y-2 text-[15px] leading-[1.6] text-[#3a3f40]">
              {SERVICES.map((service) => (
                <li key={service} className="flex gap-3">
                  <span aria-hidden className="text-[#9aa096]">
                    —
                  </span>
                  <span>{service}</span>
                </li>
              ))}
            </ul>
            <div
              className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[13px]"
              style={MONO}
            >
              <a
                className="inline-flex items-center gap-1 border px-3 py-2 hover:bg-[#dfdbd2]"
                style={{ borderColor: INK }}
                href={LINKS.contact}
              >
                start a conversation
              </a>
              <a
                className="inline-flex items-center gap-1 px-3 py-2 underline underline-offset-4 hover:text-[#2f6f63]"
                href={LINKS.github}
              >
                github <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a
                className="inline-flex items-center gap-1 px-3 py-2 underline underline-offset-4 hover:text-[#2f6f63]"
                href={LINKS.docs}
              >
                documentation <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
