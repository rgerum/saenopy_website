"use client";

/**
 * Design 03 — "The Explorer"
 *
 * The landing page is the instrument. One viewport, a real control surface and
 * a readout panel fed by the viewer's onStats callback. Everything factual on
 * this page comes from lib/saenopy-content.ts or from the live bundle stats.
 */

import * as React from "react";
import {
  ArrowUpRight,
  Github,
  Mail,
  Pause,
  Play,
  RotateCw,
} from "lucide-react";

import { DisplayMesh, type ViewerStats } from "@/components/mesh/display";
import {
  CLAIMS,
  DATASETS,
  IMMUNO,
  LINKS,
  PAPER,
  PLACEHOLDERS,
  SERVICES,
} from "@/lib/saenopy-content";

import s from "./explorer.module.css";

/* ------------------------------------------------------------------ config */

const GROUPS: { title: string; ids: string[] }[] = [
  { title: "Immune cells", ids: ["nk92", "dynamic"] },
  { title: "Fibroblasts — one experiment", ids: ["cell004", "cell007", "cell008"] },
  { title: "Multicellular", ids: ["organoid"] },
];

const FIELDS = [
  { id: "fitted forces", label: "Fitted forces", note: "reconstructed traction" },
  { id: "fitted deformations", label: "Fitted deformations", note: "fitted displacement" },
  { id: "measured deformations", label: "Measured deformations", note: "measured displacement" },
];

/** Fields each bundle actually carries; anything not listed carries all three. */
const FIELDS_IN_BUNDLE: Record<string, string[]> = {
  dynamic: ["fitted deformations"],
};

const SPANS = [0.05, 0.1, 0.15, 0.2];

const ACCENT = "#35d69b";

/* --------------------------------------------------------------- utilities */

function sig(x: number | undefined | null, digits = 3) {
  if (x === undefined || x === null || !Number.isFinite(x)) return "——";
  return x.toPrecision(digits);
}

function int(x: number | undefined | null) {
  if (x === undefined || x === null || !Number.isFinite(x)) return "——";
  return Math.round(x).toLocaleString("en-US");
}

function kb(bytes: number | undefined | null) {
  if (bytes === undefined || bytes === null || !Number.isFinite(bytes)) return "——";
  return `${(bytes / 1024).toFixed(1)} kB`;
}

/* -------------------------------------------------------- small components */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${s.mono} px-4 pt-5 pb-2 text-[10px] uppercase tracking-[0.2em] text-[#59636f]`}
    >
      {children}
    </div>
  );
}

function Chip({
  active,
  disabled,
  onClick,
  children,
  title,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={[
        s.mono,
        "h-7 flex-1 border text-[11px] tracking-wide transition-colors",
        disabled
          ? "cursor-not-allowed border-[#161d25] text-[#39424d]"
          : active
            ? "border-[#35d69b] bg-[#35d69b]/12 text-[#35d69b]"
            : "border-[#232c37] text-[#8b96a5] hover:border-[#3a4553] hover:text-[#dbe2ea]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Readout({
  k,
  v,
  hint,
}: {
  k: string;
  v: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-[#131a22] px-4 py-1.5">
      <span className="text-[11px] leading-tight text-[#8b96a5]">
        {k}
        {hint ? (
          <span className="block text-[10px] text-[#4c5561]">{hint}</span>
        ) : null}
      </span>
      <span className={`${s.mono} shrink-0 text-[12px] text-[#dbe2ea]`}>{v}</span>
    </div>
  );
}

function Sparkline({
  values,
  unit,
  caption,
}: {
  values: number[];
  unit: string;
  caption: string;
}) {
  const max = Math.max(...values, 0);
  const peak = values.indexOf(max);
  return (
    <div className="px-4 pt-2.5 pb-3">
      <div className="flex items-end justify-between">
        <span className="text-[11px] text-[#8b96a5]">{caption}</span>
        <span className={`${s.mono} text-[11px] text-[#dbe2ea]`}>
          {sig(max)} {unit}
        </span>
      </div>
      <div className="mt-2 flex h-11 items-end gap-[2px]">
        {values.map((v, i) => (
          <div
            key={i}
            title={`frame ${i} · ${sig(v)} ${unit}`}
            className="flex-1"
            style={{
              height: `${Math.max(2, max > 0 ? (v / max) * 100 : 0)}%`,
              background: i === peak ? ACCENT : "#2c3742",
            }}
          />
        ))}
      </div>
      <div
        className={`${s.mono} mt-1 flex justify-between text-[10px] text-[#4c5561]`}
      >
        <span>frame 0</span>
        <span>peak at {peak}</span>
        <span>frame {values.length - 1}</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- page */

export default function ExplorerPage() {
  const [datasetId, setDatasetId] = React.useState("nk92");
  const [field, setField] = React.useState("fitted forces");
  const [cmap, setCmap] = React.useState("turbo");
  const [span, setSpan] = React.useState(0.1);
  const [cube, setCube] = React.useState(true);
  const [rotate, setRotate] = React.useState(true);
  const [playing, setPlaying] = React.useState(true);
  const [stats, setStats] = React.useState<ViewerStats | null>(null);

  const dataset = DATASETS[datasetId];

  const handleStats = React.useCallback(
    (next: ViewerStats) => {
      setStats(next);
      // a bundle may not carry every field; follow what it actually has
      if (!(field in next.fields)) {
        const first = Object.keys(next.fields)[0];
        if (first) setField(first);
      }
    },
    [field],
  );

  const reload = React.useCallback(<T,>(setter: (v: T) => void) => {
    return (v: T) => {
      setStats(null);
      setter(v);
    };
  }, []);

  const pickDataset = (id: string) => {
    setStats(null);
    setDatasetId(id);
    const available = FIELDS_IN_BUNDLE[id];
    if (available && !available.includes(field)) setField(available[0]);
  };

  const fieldAvailable = (id: string) => {
    if (stats) return id in stats.fields;
    const listed = FIELDS_IN_BUNDLE[datasetId];
    return listed ? listed.includes(id) : true;
  };

  const animations = [
    ...(rotate ? [{ type: "rotate", speed: 6 }] : []),
    ...(dataset.frames && playing ? [{ type: "time", fps: 4 }] : []),
  ];

  const live = stats?.fields[field];
  const ratio =
    stats && stats.transferBytes > 0 ? stats.baselineBytes / stats.transferBytes : null;
  const forceTrace = (stats?.series.peakForce ?? [])
    .filter((v): v is number => typeof v === "number")
    .map((v) => v * 1e9);
  const energyTrace = (stats?.series.strainEnergy ?? [])
    .filter((v): v is number => typeof v === "number")
    .map((v) => v * 1e15);

  return (
    <div className={`${s.root} min-h-screen bg-[#070a0e] text-[#dbe2ea]`}>
      {/* ------------------------------------------------------------ bar */}
      <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-[#1a212a] bg-[#070a0e]/95 px-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="text-[15px] font-semibold tracking-tight">saenopy</span>
          <span className="hidden h-3 w-px bg-[#232c37] sm:block" />
          <span
            className={`${s.mono} hidden text-[10px] uppercase tracking-[0.2em] text-[#59636f] sm:block`}
          >
            3D traction force microscopy
          </span>
        </div>
        <nav
          className={`${s.mono} flex items-center gap-4 text-[11px] uppercase tracking-[0.14em]`}
        >
          <a
            href={PAPER.url}
            target="_blank"
            rel="noreferrer"
            className="hidden text-[#8b96a5] transition-colors hover:text-[#35d69b] sm:block"
          >
            Paper
          </a>
          <a
            href={LINKS.docs}
            target="_blank"
            rel="noreferrer"
            className="hidden text-[#8b96a5] transition-colors hover:text-[#35d69b] sm:block"
          >
            Docs
          </a>
          <a
            href={LINKS.github}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-[#8b96a5] transition-colors hover:text-[#35d69b]"
          >
            <Github className="h-3.5 w-3.5" />
            GitHub
          </a>
          <a
            href={LINKS.contact}
            className="flex h-7 items-center gap-1.5 border border-[#35d69b]/45 px-3 text-[#35d69b] transition-colors hover:bg-[#35d69b]/12"
          >
            <Mail className="h-3.5 w-3.5" />
            Contact
          </a>
        </nav>
      </header>

      {/* ------------------------------------------------------ workbench */}
      <div className="grid grid-cols-1 border-b border-[#1a212a] lg:h-[calc(100vh-3rem)] lg:max-h-[860px] lg:min-h-[660px] lg:grid-cols-[266px_minmax(0,1fr)_316px]">
        {/* viewport (first in the DOM, middle column on desktop) */}
        <section
          className={`${s.viewport} relative order-1 h-[52vh] max-h-[560px] min-h-[380px] bg-[#04060a] lg:order-2 lg:h-full lg:max-h-none`}
        >
          <div className="absolute inset-0">
            <DisplayMesh
              key={datasetId}
              bundle={dataset.bundle}
              field={field}
              height="100%"
              className="h-full w-full"
              arrow_span={span}
              zoom={1.5}
              cube={cube ? "field" : "none"}
              cube_color={0x2f3d4c}
              background="transparent"
              logo_width="0px"
              cmap={cmap}
              mouse_control
              show_controls={false}
              show_colormap
              animations={animations}
              onStats={handleStats}
            />
          </div>

          {/* overlays */}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-4">
            <div>
              <div className="text-[13px] font-medium text-[#dbe2ea]">
                {dataset.label}
              </div>
              <div className="mt-0.5 max-w-[38ch] text-[11px] leading-snug text-[#8b96a5]">
                {dataset.subject}
              </div>
            </div>
            <div
              className={`${s.mono} text-right text-[10px] uppercase tracking-[0.16em] text-[#59636f]`}
            >
              <div className="text-[#8b96a5]">{field}</div>
              <div className="mt-0.5">
                {cmap} · span {span.toFixed(2)}
              </div>
            </div>
          </div>

          {!stats ? (
            <div
              className={`${s.mono} pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] uppercase tracking-[0.24em] text-[#59636f]`}
            >
              <span className="animate-pulse">loading bundle…</span>
            </div>
          ) : null}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4">
            <span className={`${s.mono} text-[10px] text-[#3d4652]`}>
              {/* the viewer paints its colour bar just above this line */}
            </span>
            <div className="flex flex-col items-end gap-2">
              {dataset.frames ? (
                <div className="pointer-events-auto flex items-center gap-3 border border-[#232c37] bg-[#070a0e]/85 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStats(null);
                      setPlaying((p) => !p);
                    }}
                    className="flex h-6 w-6 items-center justify-center border border-[#35d69b]/45 text-[#35d69b] transition-colors hover:bg-[#35d69b]/12"
                    aria-label={playing ? "pause time series" : "play time series"}
                  >
                    {playing ? (
                      <Pause className="h-3 w-3" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                  </button>
                  <span className={`${s.mono} text-[10px] text-[#8b96a5]`}>
                    {dataset.frames} frames · 1 per minute · 4 fps playback
                  </span>
                </div>
              ) : null}
              <span className={`${s.mono} hidden text-[10px] text-[#4c5561] sm:block`}>
                drag to rotate · scroll to zoom
              </span>
            </div>
          </div>
        </section>

        {/* control surface */}
        <aside
          className={`${s.panel} order-2 overflow-y-auto border-[#1a212a] bg-[#0b0f14] lg:order-1 lg:h-full lg:border-r`}
        >
          <SectionLabel>Specimen</SectionLabel>
          {GROUPS.map((group) => (
            <div key={group.title}>
              <div className="px-4 pt-2 pb-1 text-[10px] text-[#4c5561]">
                {group.title}
              </div>
              {group.ids.map((id) => {
                const d = DATASETS[id];
                const active = id === datasetId;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => pickDataset(id)}
                    className={[
                      "block w-full border-l-2 px-4 py-2 text-left transition-colors",
                      active
                        ? "border-l-[#35d69b] bg-[#35d69b]/8"
                        : "border-l-transparent hover:bg-[#111820]",
                    ].join(" ")}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className={`truncate text-[12px] ${active ? "text-[#dbe2ea]" : "text-[#a7b1bd]"}`}
                      >
                        {d.label}
                      </span>
                      <span
                        className={`${s.mono} shrink-0 text-[11px] ${active ? "text-[#35d69b]" : "text-[#59636f]"}`}
                      >
                        {d.peakForce} nN
                      </span>
                    </div>
                    <div className="mt-0.5 truncate text-[10px] text-[#59636f]">
                      {d.subject}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}

          <SectionLabel>Field</SectionLabel>
          <div className="space-y-1 px-4">
            {FIELDS.map((f) => {
              const available = fieldAvailable(f.id);
              const active = f.id === field;
              return (
                <button
                  key={f.id}
                  type="button"
                  disabled={!available}
                  onClick={() => reload(setField)(f.id)}
                  className={[
                    "flex w-full items-center justify-between gap-2 border px-2.5 py-1.5 text-left transition-colors",
                    !available
                      ? "cursor-not-allowed border-[#161d25] text-[#39424d]"
                      : active
                        ? "border-[#35d69b] bg-[#35d69b]/10"
                        : "border-[#232c37] hover:border-[#3a4553]",
                  ].join(" ")}
                >
                  <span>
                    <span
                      className={`block text-[12px] ${!available ? "text-[#39424d]" : active ? "text-[#35d69b]" : "text-[#a7b1bd]"}`}
                    >
                      {f.label}
                    </span>
                    <span className="block text-[10px] text-[#59636f]">
                      {available ? f.note : "not in this bundle"}
                    </span>
                  </span>
                  <span className={`${s.mono} text-[11px] text-[#59636f]`}>
                    {stats?.fields[f.id]?.unit ?? ""}
                  </span>
                </button>
              );
            })}
          </div>

          <SectionLabel>Arrow length</SectionLabel>
          <div className="flex gap-1 px-4">
            {SPANS.map((v) => (
              <Chip
                key={v}
                active={v === span}
                onClick={() => reload(setSpan)(v)}
                title="longest arrow as a fraction of the domain"
              >
                {v.toFixed(2)}
              </Chip>
            ))}
          </div>

          <SectionLabel>Colormap</SectionLabel>
          <div className="flex gap-1 px-4">
            {["turbo", "viridis"].map((c) => (
              <Chip key={c} active={c === cmap} onClick={() => reload(setCmap)(c)}>
                {c}
              </Chip>
            ))}
          </div>

          <SectionLabel>Scene</SectionLabel>
          <div className="flex gap-1 px-4 pb-6">
            <Chip active={cube} onClick={() => reload(setCube)(!cube)}>
              bounding box
            </Chip>
            <Chip active={rotate} onClick={() => reload(setRotate)(!rotate)}>
              <span className="flex items-center justify-center gap-1.5">
                <RotateCw className="h-3 w-3" />
                spin
              </span>
            </Chip>
          </div>
        </aside>

        {/* readout */}
        <aside
          className={`${s.panel} order-3 overflow-y-auto border-[#1a212a] bg-[#0b0f14] lg:h-full lg:border-l`}
        >
          <div className="flex items-center justify-between border-b border-[#1a212a] px-4 py-3">
            <span
              className={`${s.mono} text-[10px] uppercase tracking-[0.2em] text-[#59636f]`}
            >
              Readout
            </span>
            <span className={`${s.mono} flex items-center gap-1.5 text-[10px]`}>
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: stats ? ACCENT : "#59636f" }}
              />
              <span className="text-[#59636f]">
                {stats ? "loaded" : "loading"}
              </span>
            </span>
          </div>

          <div className="px-4 pt-4 pb-3">
            <div
              className={`${s.mono} text-[10px] uppercase tracking-[0.18em] text-[#59636f]`}
            >
              peak {field}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span
                className={`${s.mono} text-[40px] leading-none`}
                style={{ color: stats ? ACCENT : "#39424d" }}
              >
                {sig(live?.max)}
              </span>
              <span className={`${s.mono} text-[15px] text-[#8b96a5]`}>
                {live?.unit ?? ""}
              </span>
            </div>
            <div className="mt-2 text-[11px] leading-snug text-[#59636f]">
              measured from the bundle now in the viewport, over{" "}
              {stats ? int(stats.timePoints) : "——"}{" "}
              {stats && stats.timePoints === 1 ? "time point" : "time points"}
            </div>
          </div>

          <SectionLabel>Mesh</SectionLabel>
          <Readout k="Arrows drawn" v={int(live?.count)} hint="subsampled for display" />
          <Readout k="Mesh nodes" v={int(live?.total)} hint="in the solved mesh" />
          <Readout k="Time points" v={int(stats?.timePoints)} />
          <Readout
            k="Frame interval"
            v={stats?.timeDelta ? `${stats.timeDelta} s` : "——"}
          />

          <SectionLabel>Transfer</SectionLabel>
          <Readout k="Over the wire" v={kb(stats?.transferBytes)} hint="gzipped bundle" />
          <Readout k="Decompressed" v={kb(stats?.rawBytes)} />
          <Readout
            k="Same fields as .npy"
            v={kb(stats?.baselineBytes)}
            hint="deflated float32 arrays"
          />
          <Readout
            k="Ratio"
            v={ratio ? `${ratio.toFixed(1)}×` : "——"}
            hint="baseline ÷ over the wire"
          />

          {stats && stats.timePoints > 1 && forceTrace.length > 1 ? (
            <>
              <SectionLabel>Time series</SectionLabel>
              <Sparkline
                values={forceTrace}
                unit="nN"
                caption="Peak traction per frame"
              />
              <Sparkline
                values={energyTrace}
                unit="fJ"
                caption="Strain energy per frame"
              />
            </>
          ) : null}

          <SectionLabel>Notes</SectionLabel>
          <p className="px-4 pb-6 text-[11px] leading-relaxed text-[#8b96a5]">
            {dataset.blurb}
          </p>
        </aside>
      </div>

      {/* ------------------------------------------------------ below fold */}
      <main className="mx-auto max-w-[1180px] px-6">
        <section className="grid gap-10 border-b border-[#1a212a] py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <h1 className="text-[26px] leading-[1.25] font-medium tracking-tight text-[#eef2f6]">
              Saenopy measures the forces a cell exerts on the 3D matrix around
              it.
            </h1>
            <p className="mt-4 max-w-[58ch] text-[14px] leading-relaxed text-[#8b96a5]">
              The six bundles in the picker above are exported saenopy results,
              decoded in your browser. Each arrow is a fitted force or a matrix
              deformation at a node of the solved mesh — the same output the
              desktop application and the Python API produce.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={LINKS.github}
                target="_blank"
                rel="noreferrer"
                className={`${s.mono} flex h-9 items-center gap-2 border border-[#35d69b]/45 px-4 text-[12px] text-[#35d69b] transition-colors hover:bg-[#35d69b]/12`}
              >
                <Github className="h-4 w-4" />
                Source on GitHub
              </a>
              <a
                href={LINKS.docs}
                target="_blank"
                rel="noreferrer"
                className={`${s.mono} flex h-9 items-center gap-2 border border-[#232c37] px-4 text-[12px] text-[#a7b1bd] transition-colors hover:border-[#3a4553]`}
              >
                Documentation
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
          <dl className="grid gap-px self-start bg-[#1a212a] sm:grid-cols-2">
            {CLAIMS.map((c) => (
              <div key={c.headline} className="bg-[#0b0f14] p-4">
                <dt
                  className={`${s.mono} text-[13px] text-[#35d69b]`}
                >
                  {c.headline}
                </dt>
                <dd className="mt-1.5 text-[12px] leading-relaxed text-[#8b96a5]">
                  {c.body}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="grid gap-10 border-b border-[#1a212a] py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div>
            <div
              className={`${s.mono} text-[10px] uppercase tracking-[0.2em] text-[#59636f]`}
            >
              Why immuno-oncology
            </div>
            <blockquote className="mt-4 border-l-2 border-[#35d69b] pl-4 text-[16px] leading-relaxed text-[#eef2f6]">
              {IMMUNO.finding}
            </blockquote>
            <p className={`${s.mono} mt-3 pl-4 text-[11px] text-[#59636f]`}>
              {PAPER.shortAuthors}, {PAPER.journal} {PAPER.year} · NK cells
              migrate at {IMMUNO.speed}
            </p>
          </div>
          <div className="grid gap-px bg-[#1a212a]">
            {IMMUNO.why.map((w) => (
              <div key={w.title} className="bg-[#0b0f14] p-4">
                <h3 className="text-[13px] font-medium text-[#dbe2ea]">
                  {w.title}
                </h3>
                <p className="mt-1.5 max-w-[70ch] text-[12px] leading-relaxed text-[#8b96a5]">
                  {w.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-[#1a212a] py-14">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div
              className={`${s.mono} text-[10px] uppercase tracking-[0.2em] text-[#59636f]`}
            >
              Panels we would add for a programme
            </div>
            <div
              className={`${s.mono} border border-[#4a3a12] bg-[#2a2008] px-2 py-1 text-[10px] tracking-wide text-[#e0b64a]`}
            >
              {PLACEHOLDERS.note}
            </div>
          </div>
          <div className="mt-5 grid gap-px bg-[#1a212a] sm:grid-cols-2 lg:grid-cols-4">
            {PLACEHOLDERS.panels.map((p) => (
              <div key={p.title} className="bg-[#0b0f14] p-4">
                <div
                  className={`${s.mono} text-[9px] uppercase tracking-[0.18em] text-[#e0b64a]`}
                >
                  Placeholder
                </div>
                <h3 className="mt-2 text-[13px] font-medium text-[#dbe2ea]">
                  {p.title}
                </h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-[#8b96a5]">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-10 border-b border-[#1a212a] py-14 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div>
            <div
              className={`${s.mono} text-[10px] uppercase tracking-[0.2em] text-[#59636f]`}
            >
              The method
            </div>
            <p className="mt-4 max-w-[75ch] text-[13px] leading-relaxed text-[#8b96a5]">
              {PAPER.abstract}
            </p>
            <p className={`${s.mono} mt-5 text-[11px] leading-relaxed text-[#59636f]`}>
              {PAPER.authors}. {PAPER.title}. {PAPER.journal}, {PAPER.year}.
              <br />
              <a
                href={PAPER.url}
                target="_blank"
                rel="noreferrer"
                className="text-[#35d69b] hover:underline"
              >
                doi:{PAPER.doi}
              </a>
              <span className="mx-2 text-[#2c3742]">|</span>
              <a
                href={PAPER.preprintUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#8b96a5] hover:text-[#35d69b]"
              >
                preprint
              </a>
            </p>
          </div>
          <div>
            <div
              className={`${s.mono} text-[10px] uppercase tracking-[0.2em] text-[#59636f]`}
            >
              Working with us
            </div>
            <ul className="mt-4 space-y-2">
              {SERVICES.map((service) => (
                <li
                  key={service}
                  className="flex gap-3 border-b border-[#131a22] pb-2 text-[12px] leading-relaxed text-[#a7b1bd]"
                >
                  <span className={`${s.mono} text-[#35d69b]`}>—</span>
                  {service}
                </li>
              ))}
            </ul>
            <a
              href={LINKS.contact}
              className={`${s.mono} mt-5 inline-flex h-9 items-center gap-2 border border-[#35d69b]/45 px-4 text-[12px] text-[#35d69b] transition-colors hover:bg-[#35d69b]/12`}
            >
              <Mail className="h-4 w-4" />
              Start a conversation
            </a>
          </div>
        </section>

        <footer
          className={`${s.mono} flex flex-wrap items-center justify-between gap-4 py-8 text-[11px] text-[#4c5561]`}
        >
          <span>saenopy · open source 3D traction force microscopy</span>
          <span className="flex gap-4">
            <a href={LINKS.site} className="hover:text-[#35d69b]">
              saenopy.com
            </a>
            <a
              href={LINKS.github}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#35d69b]"
            >
              github
            </a>
            <a
              href={LINKS.docs}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#35d69b]"
            >
              docs
            </a>
          </span>
        </footer>
      </main>
    </div>
  );
}
