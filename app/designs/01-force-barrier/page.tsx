import type { Metadata } from "next";
import { Instrument_Serif, Inter, IBM_Plex_Mono } from "next/font/google";

import { DisplayMesh } from "@/components/mesh/display";
import {
  CLAIMS,
  DATASETS,
  FORCE_TRACE,
  IMMUNO,
  LINKS,
  PAPER,
  PLACEHOLDERS,
  SERVICES,
} from "@/lib/saenopy-content";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--fb-display",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--fb-sans",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--fb-mono",
});

export const metadata: Metadata = {
  title: "The force barrier — saenopy",
  description:
    "Traction force microscopy in 3D: measuring whether a transferred cell can push through dense tumour stroma.",
};

const INK = "#07080A";
const ACCENT = "#FF5B35";

const nk92 = DATASETS.nk92;
const dynamic = DATASETS.dynamic;

/* ------------------------------------------------------------------ */

function Mono({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`font-[family-name:var(--fb-mono)] text-[11px] uppercase tracking-[0.18em] ${className}`}
    >
      {children}
    </span>
  );
}

function Ledger({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <Mono className="text-white/35">{label}</Mono>
      <span className="font-[family-name:var(--fb-mono)] text-[13px] text-white/80">
        {value}
      </span>
    </div>
  );
}

/* ---------------------------- force trace --------------------------- */

function ForceTrace() {
  const W = 980;
  const H = 250;
  const padL = 54;
  const padR = 132;
  const padT = 36;
  const padB = 34;
  const yMax = 1;
  const n = FORCE_TRACE.length;

  const x = (i: number) => padL + (i * (W - padL - padR)) / (n - 1);
  const y = (v: number) => H - padB - (v / yMax) * (H - padB - padT);

  const line = FORCE_TRACE.map(
    (v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`,
  ).join(" ");
  const area = `${line} L${x(n - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`;

  const peakValue = Math.max(...FORCE_TRACE);
  const peakIndex = FORCE_TRACE.indexOf(peakValue);

  return (
    <figure className="mt-16">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`Peak traction force per minute for the ${dynamic.label} dataset, ${n} time points, peaking at ${peakValue} nanonewtons at minute ${peakIndex}.`}
      >
        <defs>
          <linearGradient id="fb-trace-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.28" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.5, 1].map((g) => (
          <g key={g}>
            <line
              x1={padL}
              x2={W - padR}
              y1={y(g)}
              y2={y(g)}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <text
              x={padL - 12}
              y={y(g) + 4}
              textAnchor="end"
              className="font-[family-name:var(--fb-mono)]"
              fontSize="11"
              fill="rgba(255,255,255,0.35)"
            >
              {g.toFixed(1)}
            </text>
          </g>
        ))}

        <line
          x1={padL}
          x2={W - padR}
          y1={y(0)}
          y2={y(0)}
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />

        <path d={area} fill="url(#fb-trace-fill)" />
        <path
          d={line}
          fill="none"
          stroke={ACCENT}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {FORCE_TRACE.map((v, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(v)}
            r={i === peakIndex ? 5.5 : 2.6}
            fill={ACCENT}
            stroke={INK}
            strokeWidth={i === peakIndex ? 2.5 : 0}
          >
            <title>{`Minute ${i} — ${v} nN`}</title>
          </circle>
        ))}

        <line
          x1={x(peakIndex)}
          x2={x(peakIndex)}
          y1={y(peakValue) + 12}
          y2={y(0)}
          stroke={ACCENT}
          strokeOpacity="0.35"
          strokeWidth="1"
          strokeDasharray="2 4"
          vectorEffect="non-scaling-stroke"
        />
        <text
          x={x(peakIndex) + 14}
          y={y(peakValue) - 12}
          className="font-[family-name:var(--fb-mono)]"
          fontSize="13"
          fill="#ffffff"
        >
          {peakValue} nN
        </text>
        <text
          x={x(peakIndex) + 14}
          y={y(peakValue) + 5}
          className="font-[family-name:var(--fb-mono)]"
          fontSize="11"
          fill="rgba(255,255,255,0.45)"
        >
          minute {peakIndex}
        </text>

        {[0, 5, 10, 15, 20].map((t) => (
          <text
            key={t}
            x={x(t)}
            y={H - 12}
            textAnchor="middle"
            className="font-[family-name:var(--fb-mono)]"
            fontSize="11"
            fill="rgba(255,255,255,0.35)"
          >
            {t}
          </text>
        ))}
        <text
          x={W - padR + 16}
          y={y(0) + 4}
          className="font-[family-name:var(--fb-mono)]"
          fontSize="11"
          fill="rgba(255,255,255,0.35)"
        >
          minutes
        </text>
        <text
          x={padL - 12}
          y={14}
          textAnchor="end"
          className="font-[family-name:var(--fb-mono)]"
          fontSize="11"
          fill="rgba(255,255,255,0.35)"
        >
          nN
        </text>
      </svg>

      <table className="sr-only">
        <caption>
          Peak traction force per minute, {dynamic.label} dataset, in nN
        </caption>
        <thead>
          <tr>
            <th scope="col">Minute</th>
            <th scope="col">Peak traction force (nN)</th>
          </tr>
        </thead>
        <tbody>
          {FORCE_TRACE.map((v, i) => (
            <tr key={i}>
              <th scope="row">{i}</th>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <figcaption className="mt-6 max-w-2xl text-[15px] leading-relaxed text-white/45">
        Peak fitted traction force per frame, read out of the{" "}
        <span className="text-white/70">{dynamic.label}</span> bundle.{" "}
        {dynamic.blurb}
      </figcaption>
    </figure>
  );
}

/* ------------------------------- page ------------------------------- */

export default function ForceBarrierPage() {
  return (
    <div
      className={`${display.variable} ${sans.variable} ${mono.variable} min-h-screen font-[family-name:var(--fb-sans)] antialiased selection:bg-[#FF5B35] selection:text-black`}
      style={{ backgroundColor: INK, color: "#E9E7E4" }}
    >
      {/* ------------------------------ hero ----------------------------- */}
      <section className="relative w-full overflow-hidden lg:h-[100svh] lg:max-h-[900px] lg:min-h-[640px]">
        <div className="pointer-events-none relative z-10 flex flex-col lg:h-full">
          <div className="order-3 h-[400px] w-full sm:h-[470px] lg:absolute lg:inset-x-0 lg:top-0 lg:bottom-[116px] lg:left-[32%] lg:-z-10 lg:h-auto">
            <DisplayMesh
              bundle={nk92.bundle}
              field="fitted forces"
              height="100%"
              className="pointer-events-auto h-full w-full"
              arrow_span={0.15}
              zoom={1.32}
              cube="field"
              cube_color={0x3f4550}
              background="transparent"
              logo_width="0px"
              cmap="turbo"
              mouse_control
              show_controls={false}
              show_colormap
              animations={[{ type: "rotate", speed: 4 }]}
            />
          </div>

          <div
            className="hidden lg:absolute lg:inset-0 lg:-z-[5] lg:block"
            style={{
              background: `linear-gradient(100deg, ${INK} 0%, ${INK} 26%, rgba(7,8,10,0.82) 44%, rgba(7,8,10,0.15) 66%, rgba(7,8,10,0) 100%)`,
            }}
          />
          <div
            className="hidden lg:absolute lg:inset-x-0 lg:bottom-0 lg:-z-[5] lg:block lg:h-56"
            style={{
              background: `linear-gradient(180deg, rgba(7,8,10,0) 0%, ${INK} 88%)`,
            }}
          />

          <header className="order-1 flex items-baseline justify-between px-6 pt-8 md:px-12">
            <div className="pointer-events-auto flex items-baseline gap-4">
              <span className="font-[family-name:var(--fb-display)] text-2xl tracking-tight">
                saenopy
              </span>
              <Mono className="hidden text-white/35 sm:inline">
                3D traction force microscopy
              </Mono>
            </div>
            <nav className="pointer-events-auto flex gap-7">
              <a
                href={PAPER.url}
                className="font-[family-name:var(--fb-mono)] text-[11px] uppercase tracking-[0.18em] text-white/45 transition-colors hover:text-white"
              >
                Paper
              </a>
              <a
                href={LINKS.docs}
                className="font-[family-name:var(--fb-mono)] text-[11px] uppercase tracking-[0.18em] text-white/45 transition-colors hover:text-white"
              >
                Docs
              </a>
              <a
                href={LINKS.github}
                className="font-[family-name:var(--fb-mono)] text-[11px] uppercase tracking-[0.18em] text-white/45 transition-colors hover:text-white"
              >
                Source
              </a>
            </nav>
          </header>

          <div className="order-2 flex flex-1 items-center px-6 pt-16 pb-12 md:px-12 lg:py-0">
            <div className="max-w-[46rem]">
              <Mono className="text-[#FF8A6A]">
                For cell therapy &amp; immuno-oncology
              </Mono>
              <h1 className="mt-7 font-[family-name:var(--fb-display)] text-[clamp(2.9rem,6.6vw,6.2rem)] leading-[0.94] tracking-[-0.02em]">
                Before it can kill,
                <br />
                <em className="not-italic" style={{ color: ACCENT }}>
                  it has to get through.
                </em>
              </h1>
              <p className="mt-9 max-w-[34rem] text-[17px] leading-[1.65] text-white/60">
                Saenopy measures the force a single cell exerts on the 3D
                matrix around it — collagen, fibrin, Matrigel — from image
                stacks, with no fluorescent label on the cell. It is the step
                that comes before killing, and it has a number.
              </p>
            </div>
          </div>

          <div className="order-4 border-t border-white/10 px-6 py-6 md:px-12">
            <div className="flex flex-wrap items-end gap-x-12 gap-y-6">
              <Ledger label="Shown above" value={nk92.label} />
              <Ledger label="Peak traction" value={`${nk92.peakForce} nN`} />
              <Ledger
                label="Peak deformation"
                value={`${nk92.peakDeformation} µm`}
              />
              <Ledger
                label="Mesh nodes"
                value={nk92.meshNodes.toLocaleString("en-US")}
              />
              <Ledger label="Imaging" value="Bright-field, unlabelled" />
              <Mono className="pointer-events-auto ml-auto hidden text-white/25 lg:inline">
                Drag to rotate
              </Mono>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------- the problem ------------------------ */}
      <section className="mx-auto max-w-[78rem] px-6 py-28 md:px-12 md:py-40">
        <div className="grid gap-12 lg:grid-cols-[14rem_minmax(0,1fr)]">
          <Mono className="pt-3 text-white/30">01 — The unmeasured step</Mono>
          <div className="max-w-[42rem]">
            <h2 className="font-[family-name:var(--fb-display)] text-[clamp(2rem,3.4vw,3.1rem)] leading-[1.08] tracking-[-0.015em]">
              A tumour is not only a target. It is a place a cell has to reach.
            </h2>
            <div className="mt-10 space-y-7 text-[18px] leading-[1.7] text-white/65">
              <p>
                Natural killer cells migrate through dense tissue at speeds of{" "}
                <span className="text-white">{IMMUNO.speed}</span>. The traction
                forces they generate while doing it were unknown, in the
                literal sense — until the method behind saenopy measured them.
              </p>
              <p>
                A potency readout describes what a cell does once it is already
                in contact with its target. Whether it can reach that target
                through cross-linked stroma is a separate question, and it is a
                mechanical one — so it needs a mechanical measurement.
              </p>
              <p>
                <span className="text-white">{PAPER.title}</span>: the title of
                the paper is the whole proposition. Fast migrating cells,
                tracked frame by frame, in matrices that stiffen as they are
                strained, from time series of confocal or bright-field image
                stacks. The measurement exists. The open question is what it
                says about your cells.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------- the three points ---------------------- */}
      <section className="mx-auto max-w-[78rem] px-6 md:px-12">
        <div className="border-t border-white/10 pt-10">
          <Mono className="text-white/30">02 — Why it matters commercially</Mono>
        </div>
        <ol className="mt-6">
          {IMMUNO.why.map((item, i) => (
            <li
              key={item.title}
              className="grid gap-6 border-t border-white/10 py-14 first:border-t-0 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12"
            >
              <span
                className="font-[family-name:var(--fb-mono)] text-[13px] tabular-nums"
                style={{ color: ACCENT }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16">
                <h3 className="font-[family-name:var(--fb-display)] text-[clamp(1.7rem,2.6vw,2.4rem)] leading-[1.12] tracking-[-0.01em]">
                  {item.title}
                </h3>
                <p className="max-w-[30rem] self-center text-[16.5px] leading-[1.7] text-white/55">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ----------------------------- the finding ----------------------- */}
      <section className="mx-auto mt-16 max-w-[78rem] px-6 pb-32 md:px-12">
        <div className="border-t border-white/10 pt-10">
          <Mono className="text-white/30">03 — What the paper found</Mono>
        </div>

        <blockquote className="mt-14 max-w-[52rem]">
          <p className="font-[family-name:var(--fb-display)] text-[clamp(2.1rem,4.3vw,4rem)] leading-[1.06] tracking-[-0.02em]">
            <span style={{ color: ACCENT }}>&ldquo;</span>
            {IMMUNO.finding}
            <span style={{ color: ACCENT }}>&rdquo;</span>
          </p>
          <footer className="mt-10 flex flex-col gap-2 border-l border-white/15 pl-6 text-[14px] leading-relaxed text-white/45 md:pl-8">
            <cite className="not-italic">
              <span className="text-white/75">{PAPER.shortAuthors}</span>,{" "}
              {PAPER.title}.{" "}
              <em className="not-italic text-white/60">{PAPER.journal}</em>{" "}
              {PAPER.year}.
            </cite>
            <a
              href={PAPER.url}
              className="font-[family-name:var(--fb-mono)] text-[12px] tracking-[0.04em] text-white/40 transition-colors hover:text-white"
            >
              doi:{PAPER.doi} ↗
            </a>
          </footer>
        </blockquote>

        <ForceTrace />
      </section>

      {/* --------------------------- placeholders ------------------------ */}
      <section
        id="engagement"
        className="border-y border-white/10 scroll-mt-0"
        style={{ backgroundColor: "#0C0E12" }}
      >
        <div className="mx-auto max-w-[78rem] px-6 py-28 md:px-12 md:py-32">
          <div className="grid gap-12 lg:grid-cols-[14rem_minmax(0,1fr)]">
            <Mono className="pt-3 text-white/30">04 — In an engagement</Mono>
            <div>
              <h2 className="max-w-[38rem] font-[family-name:var(--fb-display)] text-[clamp(1.9rem,3.2vw,2.9rem)] leading-[1.1] tracking-[-0.015em]">
                The four experiments we would run for a cell therapy programme.
              </h2>
              <div
                className="mt-8 inline-flex items-center gap-3 border border-dashed px-4 py-2.5"
                style={{ borderColor: "rgba(255,91,53,0.45)" }}
              >
                <span
                  aria-hidden
                  className="h-2 w-2 shrink-0"
                  style={{ backgroundColor: ACCENT }}
                />
                <span
                  className="font-[family-name:var(--fb-mono)] text-[11px] uppercase tracking-[0.2em]"
                  style={{ color: ACCENT }}
                >
                  {PLACEHOLDERS.note}
                </span>
              </div>
              <p className="mt-8 max-w-[36rem] text-[16.5px] leading-[1.7] text-white/55">
                Nothing below is a result. These are the measurements the method
                supports and that we would design with you — each one is shown
                here without data because we have not yet run it on your
                material.
              </p>

              <ul className="mt-14">
                {PLACEHOLDERS.panels.map((panel, i) => (
                  <li
                    key={panel.title}
                    className="grid gap-4 border-t border-white/10 py-8 md:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.15fr)] md:gap-10"
                  >
                    <span className="font-[family-name:var(--fb-mono)] text-[12px] tabular-nums text-white/30">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-[17px] font-medium tracking-[-0.01em] text-white/90">
                        {panel.title}
                      </h3>
                      <span
                        className="font-[family-name:var(--fb-mono)] text-[10px] uppercase tracking-[0.24em]"
                        style={{ color: "rgba(255,91,53,0.75)" }}
                      >
                        Placeholder — no data shown
                      </span>
                    </div>
                    <p className="text-[15.5px] leading-[1.65] text-white/50">
                      {panel.body}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------ method --------------------------- */}
      <section
        id="method"
        className="mx-auto max-w-[78rem] px-6 py-28 md:px-12 md:py-36"
      >
        <div className="grid gap-12 lg:grid-cols-[14rem_minmax(0,1fr)]">
          <Mono className="pt-3 text-white/30">05 — The method</Mono>
          <div>
            <h2 className="max-w-[36rem] font-[family-name:var(--fb-display)] text-[clamp(1.9rem,3.2vw,2.9rem)] leading-[1.1] tracking-[-0.015em]">
              One measurement, across four orders of magnitude.
            </h2>
            <dl className="mt-12 max-w-[52rem]">
              {CLAIMS.map((claim) => (
                <div
                  key={claim.headline}
                  className="grid gap-3 border-t border-white/10 py-7 md:grid-cols-[16rem_minmax(0,1fr)] md:gap-10"
                >
                  <dt className="font-[family-name:var(--fb-mono)] text-[15px] leading-tight tracking-[-0.01em] text-white/90">
                    {claim.headline}
                  </dt>
                  <dd className="text-[15.5px] leading-[1.7] text-white/50">
                    {claim.body}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-10 max-w-[38rem] text-[15px] leading-[1.7] text-white/40">
              Saenopy is open source and free to use. The field shown at the top
              of this page is the real {nk92.label} bundle — {nk92.transferKB} kB
              over the wire, {nk92.meshNodes.toLocaleString("en-US")} mesh nodes.{" "}
              {nk92.blurb}
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------- contact ------------------------- */}
      <section id="contact" className="border-t border-white/10">
        <div className="mx-auto max-w-[78rem] px-6 py-28 md:px-12 md:py-36">
          <div className="grid gap-12 lg:grid-cols-[14rem_minmax(0,1fr)]">
            <Mono className="pt-3 text-white/30">06 — Talk to us</Mono>
            <div className="grid gap-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
              <div>
                <h2 className="font-[family-name:var(--fb-display)] text-[clamp(2.2rem,4vw,3.6rem)] leading-[1.05] tracking-[-0.02em]">
                  If your cells have to get somewhere,
                  <br />
                  <em className="not-italic" style={{ color: ACCENT }}>
                    we can measure whether they can.
                  </em>
                </h2>
                <p className="mt-8 max-w-[32rem] text-[17px] leading-[1.7] text-white/55">
                  The group behind the method works directly with teams that
                  need the measurement rather than the software. A conversation
                  is the right first step — tell us what you are transferring
                  and into what.
                </p>
                <a
                  href={LINKS.contact}
                  className="mt-10 inline-flex items-center gap-3 px-7 py-4 text-[14px] font-medium tracking-[-0.01em] text-black transition-opacity hover:opacity-85"
                  style={{ backgroundColor: ACCENT }}
                >
                  Start a conversation
                  <span aria-hidden>→</span>
                </a>
              </div>
              <div>
                <Mono className="text-white/30">What that includes</Mono>
                <ul className="mt-6">
                  {SERVICES.map((service) => (
                    <li
                      key={service}
                      className="border-t border-white/10 py-5 text-[15.5px] leading-[1.6] text-white/60"
                    >
                      {service}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------- footer -------------------------- */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-[78rem] flex-col gap-10 px-6 py-16 md:px-12">
          <p className="max-w-[54rem] text-[13.5px] leading-[1.7] text-white/35">
            <span className="text-white/55">{PAPER.authors}.</span>{" "}
            {PAPER.title}.{" "}
            <em className="not-italic text-white/45">{PAPER.journal}</em>{" "}
            {PAPER.year}. doi:{PAPER.doi}
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {[
              { label: "Journal article", href: PAPER.url },
              { label: "Preprint", href: PAPER.preprintUrl },
              { label: "GitHub", href: LINKS.github },
              { label: "Documentation", href: LINKS.docs },
              { label: "saenopy.com", href: LINKS.site },
              { label: "Contact", href: LINKS.contact },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-[family-name:var(--fb-mono)] text-[11px] uppercase tracking-[0.18em] text-white/40 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
