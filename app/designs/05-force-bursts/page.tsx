"use client";

import * as React from "react";
import { ArrowUpRight, Mail, Pause, Play, SkipBack, SkipForward } from "lucide-react";

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

import { RangePlot } from "./range-plot";
import { DisplayMesh } from "@/components/mesh/display";
import { MEDIAN_WITHOUT_PEAK, TraceFigure } from "./trace-figure";
import styles from "./styles.module.css";

const DYN = DATASETS.dynamic;
const N = FORCE_TRACE.length;
const STEP_MS = 900;

/* everything below is derived from the two measured traces, not asserted */
const PEAK = Math.max(...FORCE_TRACE);
const PEAK_I = FORCE_TRACE.indexOf(PEAK);
const QUIET = Math.min(...FORCE_TRACE);
const QUIET_I = FORCE_TRACE.indexOf(QUIET);
const BURST_RATIO = PEAK / MEDIAN_WITHOUT_PEAK;
const SPREAD = PEAK / QUIET;
const E_START = ENERGY_TRACE[0];
const E_MIN = Math.min(...ENERGY_TRACE);
const E_MIN_I = ENERGY_TRACE.indexOf(E_MIN);

const pad = (n: number) => String(n).padStart(2, "0");

export default function ForceBurstsPage() {
  const [frame, setFrame] = React.useState(0);
  const [playing, setPlaying] = React.useState(true);

  React.useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setFrame((f) => (f + 1) % N), STEP_MS);
    return () => window.clearInterval(id);
  }, [playing]);

  const step = React.useCallback((d: number) => {
    setPlaying(false);
    setFrame((f) => (f + d + N) % N);
  }, []);

  return (
    <div className={`${styles.root} min-h-screen`}>
      {/* ---------------------------------------------------------- nav */}
      <header className="border-b border-[var(--rule)]">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-4">
          <div className="flex items-baseline gap-3">
            <span className="text-[17px] font-semibold tracking-tight">saenopy</span>
            <span className={`${styles.mono} text-[11px] text-[var(--ink-faint)]`}>
              3D traction force microscopy
            </span>
          </div>
          <nav className={`${styles.mono} flex items-center gap-6 text-[12px]`}>
            <a
              href={PAPER.url}
              className="text-[var(--ink-dim)] transition-colors hover:text-[var(--ink)]"
            >
              paper
            </a>
            <a
              href={LINKS.github}
              className="text-[var(--ink-dim)] transition-colors hover:text-[var(--ink)]"
            >
              github
            </a>
            <a
              href={LINKS.docs}
              className="text-[var(--ink-dim)] transition-colors hover:text-[var(--ink)]"
            >
              docs
            </a>
            <a
              href={LINKS.contact}
              className="border border-[var(--rule)] px-3 py-1.5 text-[var(--ink)] transition-colors hover:border-[var(--force)] hover:text-[var(--force)]"
            >
              contact
            </a>
          </nav>
        </div>
      </header>

      {/* --------------------------------------------------------- hero */}
      <section className="mx-auto max-w-[1180px] px-6 pt-16 pb-10">
        <p className={`${styles.mono} text-[11px] tracking-[0.16em] text-[var(--ink-faint)]`}>
          {PAPER.shortAuthors.toUpperCase()} · {PAPER.journal.toUpperCase()} {PAPER.year} · DOI{" "}
          {PAPER.doi}
        </p>
        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
          <h1 className="text-[clamp(2.4rem,5.4vw,4.1rem)] leading-[0.98] font-semibold tracking-[-0.03em] text-balance">
            Cells do not pull steadily.
            <br />
            <span className="text-[var(--force)]">They pull in bursts.</span>
          </h1>
          <div className="max-w-[46ch] self-end">
            <p className="text-[16.5px] leading-[1.65] text-[var(--ink-dim)]">
              Saenopy reconstructs the forces a cell exerts on the 3D matrix around it, frame by
              frame. In the 23-minute recording below, peak traction jumps to{" "}
              <span className="text-[var(--ink)]">{PEAK} nN</span> at minute {PEAK_I} —{" "}
              {BURST_RATIO.toFixed(1)}× the median of the other {N - 1} frames — and is gone again a
              minute later.
            </p>
            <p className="mt-4 text-[16.5px] leading-[1.65] text-[var(--ink-dim)]">
              Imaged once, at almost any other minute, this cell would have been recorded as quiet.
              That is the whole argument for measuring force in time.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- fig. 1 */}
      <section className="mx-auto max-w-[1180px] px-6 pb-16">
        <figure className="border border-[var(--rule)] bg-[var(--panel)]">
          <figcaption
            className={`${styles.mono} flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-[var(--rule)] px-5 py-3 text-[11px]`}
          >
            <span className="text-[var(--ink)]">
              FIG. 1 — {DYN.label.toUpperCase()} · {DYN.subject.toUpperCase()}
            </span>
            <span className="text-[var(--ink-faint)]">
              {DYN.frames} time points · {(DYN.frameInterval ?? 60) / 60} min interval ·{" "}
              {DYN.meshNodes.toLocaleString("en-US")} mesh nodes · {DYN.transferKB} kB over the wire
            </span>
          </figcaption>

          {/* panel A — the reconstructed deformation field.
              The viewer is re-initialised whenever `frame` changes, and its
              container has no height until it has mounted, so the stage pins
              440 px itself. Without that the whole page reflows once a second. */}
          <div className={`relative h-[440px] overflow-hidden ${styles.stage}`}>
            <DisplayMesh
              bundle={DYN.bundle}
              field="fitted deformations"
              frame={frame}
              height="440px"
              arrow_span={0.16}
              zoom={1.8}
              cube="field"
              cube_color={0x22303d}
              background="transparent"
              logo_width="0px"
              cmap="turbo"
              mouse_control
              show_controls={false}
              show_colormap
            />
            <div
              className={`${styles.mono} pointer-events-none absolute top-4 left-5 text-[11px] leading-relaxed`}
            >
              <div className="text-[var(--ink)]">A — fitted matrix deformation</div>
              <div className="text-[var(--ink-faint)]">
                t = {pad(frame)} min · frame {pad(frame + 1)}/{N} · peak {DYN.peakDeformation} µm
              </div>
            </div>
            <div
              className={`${styles.mono} pointer-events-none absolute right-5 bottom-4 text-[10px] text-[var(--ink-faint)]`}
            >
              pause, then drag to rotate
            </div>
          </div>

          {/* transport — the one clock for panels A, B and C */}
          <div className="flex items-center gap-4 border-y border-[var(--rule)] bg-[var(--panel-2)] px-5 py-3">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="previous time point"
                className="border border-[var(--rule)] p-2 text-[var(--ink-dim)] transition-colors hover:border-[var(--force)] hover:text-[var(--force)]"
              >
                <SkipBack className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? "pause" : "play"}
                className="border border-[var(--force)] bg-[var(--force)]/10 p-2 text-[var(--force)] transition-colors hover:bg-[var(--force)]/20"
              >
                {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="next time point"
                className="border border-[var(--rule)] p-2 text-[var(--ink-dim)] transition-colors hover:border-[var(--force)] hover:text-[var(--force)]"
              >
                <SkipForward className="size-3.5" />
              </button>
            </div>
            <input
              type="range"
              min={0}
              max={N - 1}
              step={1}
              value={frame}
              aria-label="time point"
              onChange={(e) => {
                setPlaying(false);
                setFrame(Number(e.target.value));
              }}
              className={styles.scrub}
            />
            <div className={`${styles.mono} shrink-0 text-[12px] text-[var(--ink)]`}>
              t = {pad(frame)} min
            </div>
          </div>

          {/* panels B and C — the measured traces on the same clock */}
          <div className="px-4 pt-4 pb-2">
            <TraceFigure frame={frame} />
          </div>

          <p className="border-t border-[var(--rule)] px-5 py-4 text-[13.5px] leading-[1.6] text-[var(--ink-dim)]">
            <span className={`${styles.mono} text-[var(--ink)]`}>A</span> the fitted deformation
            field the cell imposes on the surrounding matrix, one arrow per mesh node, coloured by
            magnitude. <span className={`${styles.mono} text-[var(--ink)]`}>B</span> peak fitted
            traction force and <span className={`${styles.mono} text-[var(--ink)]`}>C</span> total
            strain energy stored in the matrix, both from the same solve, read out per time point.
            Dashed line in B: the median of the {N - 1} frames other than the burst. B and C are
            different observables and they do not track each other — stored energy falls from{" "}
            {E_START} fJ to {E_MIN} fJ over the first {E_MIN_I} minutes while the traction burst at
            minute {PEAK_I} comes and goes inside two frames.
          </p>
        </figure>
      </section>

      {/* --------------------------------------- what a snapshot misses */}
      <section className="border-y border-[var(--rule)] bg-[var(--panel)]">
        <div className="mx-auto max-w-[1180px] px-6 py-12">
          <h2 className={`${styles.mono} text-[11px] tracking-[0.16em] text-[var(--ink-faint)]`}>
            THE SAME CELL, SAMPLED ONCE
          </h2>
          <div className="mt-6 grid gap-px bg-[var(--rule)] sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                v: PEAK.toFixed(3),
                u: "nN",
                l: `burst, minute ${PEAK_I}`,
                accent: true,
              },
              {
                v: MEDIAN_WITHOUT_PEAK.toFixed(3),
                u: "nN",
                l: `median of the other ${N - 1} frames`,
                accent: false,
              },
              {
                v: QUIET.toFixed(3),
                u: "nN",
                l: `quietest, minute ${QUIET_I}`,
                accent: false,
              },
              {
                v: `${SPREAD.toFixed(0)}×`,
                u: "",
                l: "spread within one recording",
                accent: false,
              },
            ].map((s) => (
              <div key={s.l} className="bg-[var(--bg)] px-5 py-6">
                <div
                  className={`${styles.mono} text-[30px] leading-none ${
                    s.accent ? "text-[var(--force)]" : "text-[var(--ink)]"
                  }`}
                >
                  {s.v}
                  {s.u ? <span className="ml-1.5 text-[13px] text-[var(--ink-faint)]">{s.u}</span> : null}
                </div>
                <div className="mt-3 text-[13px] text-[var(--ink-dim)]">{s.l}</div>
              </div>
            ))}
          </div>
          <p className="mt-6 max-w-[70ch] text-[14.5px] leading-[1.65] text-[var(--ink-dim)]">
            A fixed-timepoint assay draws one of those numbers at random. Time resolution is what
            turns a lottery into a measurement — and it is what exposed the NK cell force bursts in
            the first place.
          </p>
        </div>
      </section>

      {/* -------------------------------------------------- the method */}
      <section className="mx-auto max-w-[1180px] px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:gap-16">
          <div>
            <h2 className="text-[26px] leading-tight font-semibold tracking-[-0.02em]">
              What the method does
            </h2>
            <p className="mt-3 text-[14.5px] leading-[1.6] text-[var(--ink-dim)]">
              Four properties of the reconstruction, straight from the paper.
            </p>
          </div>
          <ol className="border-t border-[var(--rule)]">
            {CLAIMS.map((c, i) => (
              <li
                key={c.headline}
                className="grid gap-3 border-b border-[var(--rule)] py-5 sm:grid-cols-[40px_minmax(0,220px)_minmax(0,1fr)] sm:gap-6"
              >
                <span className={`${styles.mono} text-[12px] text-[var(--ink-faint)]`}>
                  {pad(i + 1)}
                </span>
                <span className={`${styles.mono} text-[14px] text-[var(--force)]`}>
                  {c.headline}
                </span>
                <span className="text-[14.5px] leading-[1.6] text-[var(--ink-dim)]">{c.body}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ----------------------------------------------- dynamic range */}
      <section className="border-y border-[var(--rule)] bg-[var(--panel)]">
        <div className="mx-auto max-w-[1180px] px-6 py-14">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="max-w-[24ch] text-[26px] leading-tight font-semibold tracking-[-0.02em]">
              One reconstruction, across four orders of magnitude
            </h2>
            <p className="max-w-[52ch] text-[14.5px] leading-[1.6] text-[var(--ink-dim)]">
              {CLAIMS[0].body} Below are the bundles rendered on this site, plotted at their measured
              peak traction. Immune-cell datasets are in orange.
            </p>
          </div>
          <figure className="mt-8 border border-[var(--rule)] bg-[var(--bg)] px-4 py-5">
            <RangePlot />
          </figure>
          <p className={`${styles.mono} mt-3 text-[11px] text-[var(--ink-faint)]`}>
            FIG. 2 — peak fitted traction force per dataset, measured from the exported bundles.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------- immuno-onc */}
      <section className="mx-auto max-w-[1180px] px-6 py-16">
        <h2 className={`${styles.mono} text-[11px] tracking-[0.16em] text-[var(--ink-faint)]`}>
          WHY BURSTS MATTER FOR A TRANSFERRED CELL
        </h2>
        <blockquote className="mt-6 max-w-[36ch] border-l-2 border-[var(--force)] pl-6 text-[clamp(1.35rem,2.6vw,1.9rem)] leading-[1.25] font-medium tracking-[-0.02em] text-balance">
          {IMMUNO.finding}
        </blockquote>
        <p className="mt-4 pl-6 text-[13.5px] text-[var(--ink-faint)]">
          {PAPER.shortAuthors}, {PAPER.journal} {PAPER.year}. NK cells migrate at {IMMUNO.speed}{" "}
          through dense tissue.
        </p>
        <div className="mt-12 grid gap-px bg-[var(--rule)] md:grid-cols-3">
          {IMMUNO.why.map((w) => (
            <div key={w.title} className="bg-[var(--bg)] px-6 py-7">
              <h3 className="text-[16px] leading-snug font-semibold tracking-[-0.01em]">
                {w.title}
              </h3>
              <p className="mt-3 text-[14px] leading-[1.6] text-[var(--ink-dim)]">{w.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ placeholders */}
      <section className="border-y border-[var(--rule)] bg-[var(--panel)]">
        <div className="mx-auto max-w-[1180px] px-6 py-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-[26px] leading-tight font-semibold tracking-[-0.02em]">
              Traces we would run for you
            </h2>
            <span
              className={`${styles.mono} border border-dashed border-[var(--ink-faint)] px-3 py-1.5 text-[11px] text-[var(--ink-dim)]`}
            >
              {PLACEHOLDERS.note}
            </span>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PLACEHOLDERS.panels.map((p) => (
              <div
                key={p.title}
                className="border border-dashed border-[var(--rule)] bg-[var(--bg)] px-5 py-6"
              >
                <span
                  className={`${styles.mono} text-[10px] tracking-[0.14em] text-[var(--ink-faint)]`}
                >
                  PLACEHOLDER
                </span>
                <h3 className="mt-3 text-[15px] leading-snug font-semibold">{p.title}</h3>
                <p className="mt-2 text-[13.5px] leading-[1.55] text-[var(--ink-dim)]">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- working */}
      <section className="mx-auto max-w-[1180px] px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-20">
          <div>
            <h2 className="text-[26px] leading-tight font-semibold tracking-[-0.02em]">
              Working with the group behind it
            </h2>
            <ul className="mt-6 border-t border-[var(--rule)]">
              {SERVICES.map((s, i) => (
                <li
                  key={s}
                  className="flex gap-5 border-b border-[var(--rule)] py-4 text-[15px] text-[var(--ink-dim)]"
                >
                  <span className={`${styles.mono} text-[12px] text-[var(--ink-faint)]`}>
                    {pad(i + 1)}
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-[var(--rule)] bg-[var(--panel)] px-7 py-8">
            <h3 className="text-[18px] font-semibold tracking-[-0.01em]">
              Bring us a time series.
            </h3>
            <p className="mt-3 text-[14.5px] leading-[1.6] text-[var(--ink-dim)]">
              Saenopy is open source and free to use. If you want the analysis run, extended, or
              taught to your team, write to us — bright-field stacks are enough to start.
            </p>
            <a
              href={LINKS.contact}
              className={`${styles.mono} mt-6 inline-flex items-center gap-2 border border-[var(--force)] px-4 py-2.5 text-[13px] text-[var(--force)] transition-colors hover:bg-[var(--force)] hover:text-[var(--bg)]`}
            >
              <Mail className="size-3.5" />
              start a conversation
            </a>
            <div className={`${styles.mono} mt-6 flex flex-col gap-2 text-[12px]`}>
              <a
                href={LINKS.github}
                className="inline-flex items-center gap-1.5 text-[var(--ink-dim)] hover:text-[var(--ink)]"
              >
                {LINKS.github.replace("https://", "")} <ArrowUpRight className="size-3" />
              </a>
              <a
                href={LINKS.docs}
                className="inline-flex items-center gap-1.5 text-[var(--ink-dim)] hover:text-[var(--ink)]"
              >
                {LINKS.docs.replace("https://", "")} <ArrowUpRight className="size-3" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ footer */}
      <footer className="border-t border-[var(--rule)] bg-[var(--panel)]">
        <div className="mx-auto max-w-[1180px] px-6 py-10">
          <p className="max-w-[80ch] text-[13px] leading-[1.7] text-[var(--ink-dim)]">
            <span className="text-[var(--ink)]">{PAPER.authors}.</span> {PAPER.title}.{" "}
            <span className="italic">{PAPER.journal}</span> {PAPER.year}.
          </p>
          <div className={`${styles.mono} mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[11.5px]`}>
            <a href={PAPER.url} className="text-[var(--ink-dim)] hover:text-[var(--force)]">
              doi:{PAPER.doi}
            </a>
            <a href={PAPER.preprintUrl} className="text-[var(--ink-dim)] hover:text-[var(--force)]">
              preprint
            </a>
            <a href={LINKS.site} className="text-[var(--ink-faint)] hover:text-[var(--ink)]">
              {LINKS.site.replace("https://", "")}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
