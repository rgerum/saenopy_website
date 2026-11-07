"use client";

import * as React from "react";
import { ArrowUpRight, Mail } from "lucide-react";

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
  type Dataset,
} from "@/lib/saenopy-content";

/* ------------------------------------------------------------------ */
/* catalogue definition — every number below comes from DATASETS       */
/* ------------------------------------------------------------------ */

interface AssayEntry {
  ref: string;
  key: string;
  title: string;
  category: string;
  /** fields present in this bundle, in the order they should be offered */
  fields: string[];
  send: string[];
  returns: string[];
}

const ALL_FIELDS = [
  "fitted forces",
  "fitted deformations",
  "measured deformations",
];

const CATALOGUE: AssayEntry[] = [
  {
    ref: "TF-01",
    key: "nk92",
    title: "Immune-cell traction, single cell",
    category: "Cell therapy",
    fields: ALL_FIELDS,
    send: [
      "Bright-field 3D image stacks — the cell carries no fluorescent label",
      "The matrix used; collagen, fibrin and Matrigel are covered by the material model",
      "Voxel size and stack spacing",
    ],
    returns: [
      "Fitted 3D deformation field of the surrounding network",
      "Fitted 3D traction force field, per cell, in the 3D matrix",
      "Peak traction force and matrix strain energy",
    ],
  },
  {
    ref: "TF-02",
    key: "dynamic",
    title: "Time-resolved traction, migrating cell",
    category: "Cell therapy",
    fields: ["fitted deformations"],
    send: [
      "A time series of confocal or bright-field image stacks",
      "The imaging interval — this reference run is one stack per minute",
      "The matrix used and its voxel size",
    ],
    returns: [
      "Fitted deformation and traction force field for every time point",
      "Per-frame peak force and strain energy trace (23 frames, plotted below)",
      "Frame-by-frame animation of the force field",
    ],
  },
  {
    ref: "TF-03",
    key: "organoid",
    title: "Organoid contraction",
    category: "Tissue model",
    fields: ALL_FIELDS,
    send: [
      "3D image stacks of the organoid in its gel",
      "The matrix used and its voxel size",
      "Any treatment or time-point structure you want resolved",
    ],
    returns: [
      "Fitted 3D deformation field of the contracted gel",
      "Fitted 3D traction force field for the whole multicellular body",
      "Peak traction force and matrix strain energy",
    ],
  },
  {
    ref: "TF-04",
    key: "cell004",
    title: "Adherent single-cell traction — position 4",
    category: "Single cell",
    fields: ALL_FIELDS,
    send: [
      "3D image stacks per imaged position",
      "The matrix used and its voxel size",
      "The positions you want treated as one run",
    ],
    returns: [
      "Fitted 3D deformation and traction force field per position",
      "Peak traction force and matrix strain energy per cell",
      "Cell-to-cell comparison across the positions in the run",
    ],
  },
  {
    ref: "TF-05",
    key: "cell007",
    title: "Adherent single-cell traction — position 7",
    category: "Single cell",
    fields: ALL_FIELDS,
    send: [
      "3D image stacks per imaged position",
      "The matrix used and its voxel size",
      "The positions you want treated as one run",
    ],
    returns: [
      "Fitted 3D deformation and traction force field per position",
      "Peak traction force and matrix strain energy per cell",
      "Cell-to-cell comparison across the positions in the run",
    ],
  },
  {
    ref: "TF-06",
    key: "cell008",
    title: "Adherent single-cell traction — position 8",
    category: "Single cell",
    fields: ALL_FIELDS,
    send: [
      "3D image stacks per imaged position",
      "The matrix used and its voxel size",
      "The positions you want treated as one run",
    ],
    returns: [
      "Fitted 3D deformation and traction force field per position",
      "Peak traction force and matrix strain energy per cell",
      "Cell-to-cell comparison across the positions in the run",
    ],
  },
];

const FIBROBLAST_RUN = ["cell004", "cell007", "cell008"];

/* ------------------------------------------------------------------ */
/* small building blocks                                               */
/* ------------------------------------------------------------------ */

function Label({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`block font-mono text-[10px] uppercase tracking-[0.2em] ${className}`}
      style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
    >
      {children}
    </span>
  );
}

function Mono({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={className}
      style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
    >
      {children}
    </span>
  );
}

function SpecRow({
  name,
  value,
  note,
}: {
  name: string;
  value: React.ReactNode;
  note?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-slate-200 py-2.5">
      <Label className="shrink-0 pt-0.5 text-slate-400">{name}</Label>
      <span className="text-right text-[13px] leading-snug text-slate-900">
        {value}
        {note ? (
          <span className="ml-1.5 text-[11px] text-slate-400">{note}</span>
        ) : null}
      </span>
    </div>
  );
}

function SectionHead({
  index,
  title,
  lede,
  id,
}: {
  index: string;
  title: string;
  lede?: string;
  id?: string;
}) {
  return (
    <div id={id} className="scroll-mt-24 border-t-2 border-slate-900 pt-4">
      <div className="flex items-baseline gap-3">
        <Mono className="text-[11px] tracking-widest text-[#1B49C4]">
          {index}
        </Mono>
        <h2 className="text-[22px] font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
      </div>
      {lede ? (
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-slate-500">
          {lede}
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* charts                                                              */
/* ------------------------------------------------------------------ */

function ForceTraceChart() {
  const max = Math.max(...FORCE_TRACE);
  const peakIndex = FORCE_TRACE.indexOf(max);
  const w = 460;
  const h = 116;
  const step = w / FORCE_TRACE.length;

  return (
    <svg viewBox={`0 -14 ${w} ${h + 30}`} className="w-full" role="img">
      <title>Peak traction force per minute</title>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1={0}
          x2={w}
          y1={h - f * h}
          y2={h - f * h}
          stroke="#e6eaf1"
          strokeWidth={1}
        />
      ))}
      <line x1={0} x2={w} y1={h} y2={h} stroke="#cbd3e0" strokeWidth={1} />
      {FORCE_TRACE.map((v, i) => {
        const barH = (v / max) * (h - 6);
        return (
          <rect
            key={i}
            x={i * step + 2}
            y={h - barH}
            width={step - 4}
            height={barH}
            fill={i === peakIndex ? "#1B49C4" : "#9fb0cc"}
          />
        );
      })}
      <text
        x={peakIndex * step + step / 2}
        y={h - (max / max) * (h - 6) - 4}
        textAnchor="middle"
        fontSize={9}
        fill="#1B49C4"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
      >
        {max} nN
      </text>
      {[0, 5, 10, 15, 20, 22].map((i) => (
        <text
          key={i}
          x={i * step + step / 2}
          y={h + 12}
          textAnchor="middle"
          fontSize={9}
          fill="#94a3b8"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        >
          {i}
        </text>
      ))}
    </svg>
  );
}

function EnergyTraceChart() {
  const max = Math.max(...ENERGY_TRACE);
  const w = 460;
  const h = 116;
  const step = w / ENERGY_TRACE.length;
  const points = ENERGY_TRACE.map(
    (v, i) => `${i * step + step / 2},${h - (v / max) * (h - 8)}`,
  ).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h + 16}`} className="w-full" role="img">
      <title>Matrix strain energy per minute</title>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1={0}
          x2={w}
          y1={h - f * h}
          y2={h - f * h}
          stroke="#e6eaf1"
          strokeWidth={1}
        />
      ))}
      <line x1={0} x2={w} y1={h} y2={h} stroke="#cbd3e0" strokeWidth={1} />
      <polyline
        points={points}
        fill="none"
        stroke="#1B49C4"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      {ENERGY_TRACE.map((v, i) => (
        <circle
          key={i}
          cx={i * step + step / 2}
          cy={h - (v / max) * (h - 8)}
          r={2}
          fill="#ffffff"
          stroke="#1B49C4"
          strokeWidth={1.2}
        />
      ))}
      {[0, 5, 10, 15, 20, 22].map((i) => (
        <text
          key={i}
          x={i * step + step / 2}
          y={h + 12}
          textAnchor="middle"
          fontSize={9}
          fill="#94a3b8"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        >
          {i}
        </text>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* page                                                                */
/* ------------------------------------------------------------------ */

const FIELDS = [
  { id: "fitted forces", label: "Traction forces" },
  { id: "fitted deformations", label: "Deformations" },
  { id: "measured deformations", label: "Measured" },
];

export default function AssayCataloguePage() {
  const [activeRef, setActiveRef] = React.useState("TF-01");
  const [field, setField] = React.useState("fitted forces");

  const entry = CATALOGUE.find((e) => e.ref === activeRef) ?? CATALOGUE[0];
  const data: Dataset = DATASETS[entry.key];
  const isRun = FIBROBLAST_RUN.includes(entry.key);
  // not every export carries every field, so fall back rather than show blank
  const activeField = entry.fields.includes(field) ? field : entry.fields[0];

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      {/* utility bar ------------------------------------------------ */}
      <div className="bg-slate-900 text-slate-300">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-2">
          <Mono className="text-[11px] text-slate-400">
            saenopy — 3D traction force microscopy — open source
          </Mono>
          <div className="hidden gap-5 sm:flex">
            {[
              { label: "Documentation", href: LINKS.docs },
              { label: "GitHub", href: LINKS.github },
              { label: `${PAPER.journal} ${PAPER.year}`, href: PAPER.url },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-[11px] text-slate-300 underline-offset-4 hover:text-white hover:underline"
                style={{
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                }}
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* header ----------------------------------------------------- */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-3.5">
          <div className="flex items-baseline gap-3">
            <span className="text-[19px] font-semibold tracking-tight">
              saenopy
            </span>
            <span className="hidden border border-slate-300 px-1.5 py-0.5 sm:block">
              <Label className="text-slate-500">Assay catalogue</Label>
            </span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            {[
              ["Assays", "#assays"],
              ["Time-resolved", "#time"],
              ["In development", "#development"],
              ["Services", "#services"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="text-[13px] text-slate-600 hover:text-[#1B49C4]"
              >
                {label}
              </a>
            ))}
            <a
              href={LINKS.contact}
              className="flex items-center gap-1.5 bg-[#1B49C4] px-3.5 py-2 text-[13px] font-medium text-white hover:bg-[#173da6]"
            >
              <Mail className="h-3.5 w-3.5" />
              Enquire
            </a>
          </nav>
        </div>
      </header>

      {/* hero ------------------------------------------------------- */}
      <section className="border-b border-slate-200">
        <div className="mx-auto grid max-w-[1180px] gap-10 px-6 py-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <Label className="text-[#1B49C4]">
              Measurement services · cell mechanics
            </Label>
            <h1 className="mt-5 text-[44px] leading-[1.05] font-semibold tracking-tight text-slate-900 sm:text-[52px]">
              A catalogue of 3D
              <br />
              force measurements.
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-slate-600">
              Saenopy measures the forces a cell exerts on the 3D matrix around
              it. The catalogue below is not a mock-up: every entry is a real
              measurement, with the numbers it produced and the 3D field it
              produced them from. Pick the one closest to your question and we
              will talk about running it on your material.
            </p>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-600">
              The method behind it is published in{" "}
              <a
                href={PAPER.url}
                className="text-[#1B49C4] underline underline-offset-4"
              >
                {PAPER.journal} ({PAPER.year})
              </a>
              : NK cells generate bursts of traction force that grow with matrix
              stiffness and let them squeeze through tight constrictions.
            </p>

            <div className="mt-9 grid grid-cols-2 border-t border-l border-slate-200 sm:grid-cols-4">
              {[
                ["Force range", "1 nN – 10 µN"],
                ["Dimension", "3D matrix"],
                ["Imaging", "Bright-field or confocal"],
                ["Resolution", "Per cell, per frame"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="border-r border-b border-slate-200 px-3 py-3"
                >
                  <Label className="text-slate-400">{k}</Label>
                  <div className="mt-1.5 text-[13px] font-medium text-slate-900">
                    {v}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#assays"
                className="bg-slate-900 px-5 py-2.5 text-[13px] font-medium text-white hover:bg-slate-700"
              >
                Browse the catalogue
              </a>
              <a
                href={LINKS.contact}
                className="border border-slate-300 px-5 py-2.5 text-[13px] font-medium text-slate-700 hover:border-slate-900"
              >
                Discuss a measurement
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
                <Label className="text-slate-400">Reference run TF-01</Label>
                <Mono className="text-[10px] text-slate-400">
                  fitted forces · turbo
                </Mono>
              </div>
              <div className="bg-slate-900">
                <DisplayMesh
                  bundle={DATASETS.nk92.bundle}
                  field="fitted forces"
                  height="420px"
                  arrow_span={0.12}
                  zoom={1.1}
                  cube="field"
                  cube_color={0x64748b}
                  background="transparent"
                  logo_width="0px"
                  cmap="turbo"
                  mouse_control
                  show_controls={false}
                  show_colormap
                  animations={[{ type: "rotate", speed: 6 }]}
                />
              </div>
              <div className="grid grid-cols-3 border-t border-slate-200">
                {[
                  ["Sample", DATASETS.nk92.label],
                  ["Peak force", `${DATASETS.nk92.peakForce} nN`],
                  ["Mesh nodes", DATASETS.nk92.meshNodes.toLocaleString("en")],
                ].map(([k, v]) => (
                  <div key={k} className="border-r border-slate-200 px-3 py-2.5 last:border-r-0">
                    <Label className="text-slate-400">{k}</Label>
                    <div className="mt-1 text-[12px] leading-snug font-medium text-slate-900">
                      {v}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              Drag to rotate. Rendered in your browser from a{" "}
              {DATASETS.nk92.transferKB} KB bundle of the measured field.
            </p>
          </div>
        </div>
      </section>

      {/* method capabilities ---------------------------------------- */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-[1180px] px-6 py-12">
          <Label className="text-slate-400">What the method does</Label>
          <div className="mt-6 grid gap-px bg-slate-200 md:grid-cols-4">
            {CLAIMS.map((c) => (
              <div key={c.headline} className="bg-slate-50 p-5">
                <div className="text-[17px] font-semibold tracking-tight text-slate-900">
                  {c.headline}
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* immuno rationale ------------------------------------------- */}
      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-[1180px] px-6 py-14">
          <SectionHead
            index="01"
            title="Why a cell therapy programme would buy this"
            lede="Transferred cells have to physically push through dense tumour stroma before their cytotoxic machinery is worth anything. Traction force is a direct, per-cell, in-3D readout of whether they can."
          />
          <div className="mt-8 grid gap-8 lg:grid-cols-12">
            <blockquote className="lg:col-span-5">
              <div className="border-l-2 border-[#1B49C4] pl-5">
                <Label className="text-[#1B49C4]">Published finding</Label>
                <p className="mt-3 text-[19px] leading-snug text-slate-900">
                  {IMMUNO.finding}
                </p>
                <Mono className="mt-4 block text-[11px] text-slate-500">
                  {PAPER.shortAuthors}, {PAPER.journal} {PAPER.year} · migration
                  speeds of {IMMUNO.speed}
                </Mono>
              </div>
            </blockquote>
            <div className="lg:col-span-7">
              <div className="border-t border-slate-200">
                {IMMUNO.why.map((w, i) => (
                  <div
                    key={w.title}
                    className="grid grid-cols-[2.5rem_1fr] gap-4 border-b border-slate-200 py-5"
                  >
                    <Mono className="text-[11px] text-slate-300">
                      {String(i + 1).padStart(2, "0")}
                    </Mono>
                    <div>
                      <div className="text-[15px] font-medium text-slate-900">
                        {w.title}
                      </div>
                      <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-600">
                        {w.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* catalogue -------------------------------------------------- */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-[1180px] px-6 py-14">
          <SectionHead
            id="assays"
            index="02"
            title="The catalogue"
            lede="Six measurements we have already run and can show you in full. Select a reference to load its field, its measured numbers and what an engagement on it involves."
          />

          <div className="mt-8 grid gap-px bg-slate-200 lg:grid-cols-12">
            {/* list */}
            <div className="bg-white lg:col-span-4">
              <div className="grid grid-cols-[3.4rem_1fr_auto] gap-2 border-b border-slate-200 px-4 py-2.5">
                <Label className="text-slate-400">Ref</Label>
                <Label className="text-slate-400">Assay</Label>
                <Label className="text-slate-400">Peak</Label>
              </div>
              {CATALOGUE.map((e) => {
                const d = DATASETS[e.key];
                const active = e.ref === activeRef;
                return (
                  <button
                    key={e.ref}
                    type="button"
                    onClick={() => setActiveRef(e.ref)}
                    className={`grid w-full grid-cols-[3.4rem_1fr_auto] items-start gap-2 border-b border-slate-100 border-l-2 px-4 py-3.5 text-left transition-colors ${
                      active
                        ? "border-l-[#1B49C4] bg-[#F2F5FD]"
                        : "border-l-transparent hover:bg-slate-50"
                    }`}
                  >
                    <Mono
                      className={`text-[11px] ${active ? "text-[#1B49C4]" : "text-slate-400"}`}
                    >
                      {e.ref}
                    </Mono>
                    <span>
                      <span className="block text-[13.5px] leading-snug font-medium text-slate-900">
                        {e.title}
                      </span>
                      <span className="mt-0.5 block text-[11.5px] text-slate-500">
                        {e.category} · {d.subject}
                      </span>
                    </span>
                    <Mono className="pt-0.5 text-right text-[11.5px] text-slate-600">
                      {d.peakForce} nN
                    </Mono>
                  </button>
                );
              })}
              <div className="px-4 py-4">
                <p className="text-[11.5px] leading-relaxed text-slate-500">
                  Pricing and turnaround are quoted per project — on request.
                  Everything in this catalogue was measured with the open-source{" "}
                  <a
                    href={LINKS.github}
                    className="text-[#1B49C4] underline underline-offset-2"
                  >
                    saenopy
                  </a>{" "}
                  package, which you are free to run yourself.
                </p>
              </div>
            </div>

            {/* detail */}
            <div className="bg-white lg:col-span-8">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
                <div className="flex items-baseline gap-3">
                  <Mono className="text-[11px] text-[#1B49C4]">
                    {entry.ref}
                  </Mono>
                  <span className="text-[16px] font-semibold tracking-tight">
                    {entry.title}
                  </span>
                </div>
                <div className="flex border border-slate-200">
                  {FIELDS.filter((f) => entry.fields.includes(f.id)).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setField(f.id)}
                      className={`px-2.5 py-1.5 text-[11px] ${
                        activeField === f.id
                          ? "bg-slate-900 text-white"
                          : "text-slate-500 hover:bg-slate-100"
                      }`}
                      style={{
                        fontFamily:
                          "ui-monospace, SFMono-Regular, Menlo, monospace",
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid lg:grid-cols-2">
                <div className="bg-slate-900">
                  <DisplayMesh
                    key={`${entry.key}-${activeField}`}
                    bundle={data.bundle}
                    field={activeField}
                    height="400px"
                    arrow_span={0.14}
                    zoom={1.05}
                    cube="field"
                    cube_color={0x64748b}
                    background="transparent"
                    logo_width="0px"
                    cmap="turbo"
                    mouse_control
                    show_controls={false}
                    show_colormap
                    animations={
                      data.frames
                        ? [{ type: "time", fps: 4 }]
                        : [{ type: "rotate", speed: 5 }]
                    }
                  />
                </div>
                <div className="border-t border-slate-200 px-5 py-4 lg:border-t-0 lg:border-l">
                  <Label className="text-slate-400">Measured specification</Label>
                  <div className="mt-2">
                    <SpecRow name="Sample" value={data.label} />
                    <SpecRow name="Preparation" value={data.subject} />
                    <SpecRow
                      name="Peak traction"
                      value={`${data.peakForce} nN`}
                    />
                    <SpecRow
                      name="Peak deformation"
                      value={`${data.peakDeformation} µm`}
                    />
                    <SpecRow
                      name="Mesh nodes"
                      value={data.meshNodes.toLocaleString("en")}
                    />
                    <SpecRow
                      name="Time points"
                      value={
                        data.frames
                          ? `${data.frames}`
                          : "1"
                      }
                      note={
                        data.frameInterval
                          ? `one per ${data.frameInterval} s`
                          : "single state"
                      }
                    />
                    <SpecRow
                      name="Fields in this export"
                      value={entry.fields.length}
                      note="selectable above"
                    />
                    <SpecRow
                      name="Bundle size"
                      value={`${data.transferKB} KB`}
                      note="browser-viewable"
                    />
                    <SpecRow name="Turnaround" value="On request" />
                  </div>
                  <p className="mt-4 text-[12.5px] leading-relaxed text-slate-600">
                    {data.blurb}
                  </p>
                </div>
              </div>

              <div className="grid border-t border-slate-200 lg:grid-cols-2">
                <div className="px-5 py-5">
                  <Label className="text-[#1B49C4]">What you send us</Label>
                  <ul className="mt-3 space-y-2">
                    {entry.send.map((s) => (
                      <li
                        key={s}
                        className="flex gap-2.5 text-[12.5px] leading-relaxed text-slate-700"
                      >
                        <span className="mt-[7px] h-[3px] w-[3px] shrink-0 bg-slate-400" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-t border-slate-200 px-5 py-5 lg:border-t-0 lg:border-l">
                  <Label className="text-[#1B49C4]">What you get back</Label>
                  <ul className="mt-3 space-y-2">
                    {entry.returns.map((s) => (
                      <li
                        key={s}
                        className="flex gap-2.5 text-[12.5px] leading-relaxed text-slate-700"
                      >
                        <span className="mt-[7px] h-[3px] w-[3px] shrink-0 bg-[#1B49C4]" />
                        {s}
                      </li>
                    ))}
                    <li className="flex gap-2.5 text-[12.5px] leading-relaxed text-slate-700">
                      <span className="mt-[7px] h-[3px] w-[3px] shrink-0 bg-[#1B49C4]" />
                      An interactive 3D bundle like the one on the left,{" "}
                      {data.transferKB} KB, viewable in a browser
                    </li>
                  </ul>
                </div>
              </div>

              {isRun ? (
                <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
                  <Label className="text-slate-400">
                    Spread across the run — same experiment, three positions
                  </Label>
                  <div className="mt-3 space-y-1.5">
                    {FIBROBLAST_RUN.map((k) => {
                      const d = DATASETS[k];
                      const maxForce = Math.max(
                        ...FIBROBLAST_RUN.map((x) => DATASETS[x].peakForce),
                      );
                      return (
                        <div
                          key={k}
                          className="grid grid-cols-[8.5rem_1fr_4rem] items-center gap-3"
                        >
                          <Mono
                            className={`text-[11px] ${
                              k === entry.key
                                ? "text-slate-900"
                                : "text-slate-400"
                            }`}
                          >
                            {d.label.replace("Fibroblast — ", "")}
                          </Mono>
                          <div className="h-2.5 bg-slate-200">
                            <div
                              className={
                                k === entry.key ? "h-2.5 bg-[#1B49C4]" : "h-2.5 bg-slate-400"
                              }
                              style={{
                                width: `${(d.peakForce / maxForce) * 100}%`,
                              }}
                            />
                          </div>
                          <Mono className="text-right text-[11px] text-slate-600">
                            {d.peakForce} nN
                          </Mono>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* time-resolved ---------------------------------------------- */}
      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-[1180px] px-6 py-14">
          <SectionHead
            id="time"
            index="03"
            title="Option: resolve the force in time"
            lede={DATASETS.dynamic.blurb}
          />
          <div className="mt-8 grid gap-px bg-slate-200 lg:grid-cols-12">
            <div className="bg-white lg:col-span-5">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
                <Label className="text-slate-400">
                  {DATASETS.dynamic.label}
                </Label>
                <Mono className="text-[10px] text-slate-400">
                  {DATASETS.dynamic.frames} frames · fitted deformations
                </Mono>
              </div>
              <div className="bg-slate-900">
                <DisplayMesh
                  bundle={DATASETS.dynamic.bundle}
                  field="fitted deformations"
                  height="330px"
                  arrow_span={0.14}
                  zoom={1.05}
                  cube="field"
                  cube_color={0x64748b}
                  background="transparent"
                  logo_width="0px"
                  cmap="turbo"
                  mouse_control
                  show_controls={false}
                  show_colormap
                  animations={[{ type: "time", fps: 4 }]}
                />
              </div>
              <div className="px-4 py-3">
                <SpecRow
                  name="Interval"
                  value={`${DATASETS.dynamic.frameInterval} s per frame`}
                />
                <SpecRow
                  name="Peak force"
                  value={`${DATASETS.dynamic.peakForce} nN`}
                  note="at minute 4"
                />
                <SpecRow
                  name="Peak deformation"
                  value={`${DATASETS.dynamic.peakDeformation} µm`}
                />
              </div>
            </div>

            <div className="bg-white lg:col-span-7">
              <div className="px-5 py-4">
                <div className="flex items-baseline justify-between">
                  <Label className="text-slate-900">
                    Peak traction force per frame
                  </Label>
                  <Mono className="text-[10px] text-slate-400">nN</Mono>
                </div>
                <div className="mt-3">
                  <ForceTraceChart />
                </div>
              </div>
              <div className="border-t border-slate-200 px-5 py-4">
                <div className="flex items-baseline justify-between">
                  <Label className="text-slate-900">
                    Matrix strain energy per frame
                  </Label>
                  <Mono className="text-[10px] text-slate-400">fJ</Mono>
                </div>
                <div className="mt-3">
                  <EnergyTraceChart />
                </div>
                <Mono className="mt-3 block text-[10px] text-slate-400">
                  x axis: minutes from the start of the recording
                </Mono>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* placeholders ----------------------------------------------- */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-[1180px] px-6 py-14">
          <SectionHead
            id="development"
            index="04"
            title="In development — not yet backed by data"
            lede="These are the panels a cell therapy programme usually asks for next. We can describe how each would be run, but the figures do not exist yet, so nothing is shown here as if it did."
          />
          <div className="mt-6 flex items-center gap-3 border border-[#1B49C4] bg-[#F2F5FD] px-4 py-2.5">
            <Mono className="bg-[#1B49C4] px-2 py-0.5 text-[10px] tracking-widest text-white">
              PLACEHOLDER
            </Mono>
            <span className="text-[12.5px] text-slate-700">
              {PLACEHOLDERS.note}
            </span>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {PLACEHOLDERS.panels.map((p, i) => (
              <div
                key={p.title}
                className="border border-dashed border-slate-300 bg-white/60 p-5"
              >
                <div className="flex items-center justify-between">
                  <Mono className="text-[10px] tracking-widest text-slate-300">
                    TF-X{String(i + 1).padStart(2, "0")}
                  </Mono>
                  <Mono className="border border-[#1B49C4] px-1.5 py-px text-[9px] tracking-widest text-[#1B49C4]">
                    PLACEHOLDER
                  </Mono>
                </div>
                <div className="mt-4 text-[15px] font-medium text-slate-900">
                  {p.title}
                </div>
                <p className="mt-2 text-[12.5px] leading-relaxed text-slate-600">
                  {p.body}
                </p>
                <div className="mt-5 border-t border-dashed border-slate-300 pt-3">
                  <Mono className="text-[10px] text-slate-400">
                    No measured data on this page
                  </Mono>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* services ---------------------------------------------------- */}
      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-[1180px] px-6 py-14">
          <SectionHead
            id="services"
            index="05"
            title="Around the measurements"
            lede="Saenopy is open source and you can run all of it yourself. What we also offer today, alongside commissioned measurements:"
          />
          <div className="mt-8 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="border-t border-slate-200">
                {SERVICES.map((s, i) => (
                  <div
                    key={s}
                    className="grid grid-cols-[2.5rem_1fr] items-baseline gap-4 border-b border-slate-200 py-4"
                  >
                    <Mono className="text-[11px] text-[#1B49C4]">
                      {String(i + 1).padStart(2, "0")}
                    </Mono>
                    <span className="text-[14.5px] text-slate-800">{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="border border-slate-900 p-6">
                <Label className="text-slate-400">Next step</Label>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-800">
                  Tell us the cell type, the matrix and the question. We will say
                  whether traction force is the right readout for it, and what a
                  first run would look like.
                </p>
                <a
                  href={LINKS.contact}
                  className="mt-5 flex items-center justify-between bg-[#1B49C4] px-4 py-3 text-[13px] font-medium text-white hover:bg-[#173da6]"
                >
                  Open a conversation
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <div className="mt-4 grid grid-cols-2 gap-px bg-slate-200">
                  <a
                    href={LINKS.github}
                    className="bg-white px-3 py-2.5 text-[12px] text-slate-600 hover:text-[#1B49C4]"
                  >
                    Source code
                  </a>
                  <a
                    href={LINKS.docs}
                    className="bg-white px-3 py-2.5 text-[12px] text-slate-600 hover:text-[#1B49C4]"
                  >
                    Documentation
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* footer ------------------------------------------------------ */}
      <footer className="bg-slate-900 text-slate-300">
        <div className="mx-auto max-w-[1180px] px-6 py-12">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Label className="text-slate-500">Method reference</Label>
              <p className="mt-3 text-[14px] leading-relaxed text-slate-200">
                {PAPER.authors}. {PAPER.title}.{" "}
                <span className="italic">{PAPER.journal}</span> ({PAPER.year}).
              </p>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
                <a
                  href={PAPER.url}
                  className="text-[12px] text-slate-400 underline-offset-4 hover:text-white hover:underline"
                  style={{
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, monospace",
                  }}
                >
                  doi:{PAPER.doi}
                </a>
                <a
                  href={PAPER.preprintUrl}
                  className="text-[12px] text-slate-400 underline-offset-4 hover:text-white hover:underline"
                  style={{
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, monospace",
                  }}
                >
                  preprint on bioRxiv
                </a>
              </div>
              <p className="mt-6 max-w-xl text-[12px] leading-relaxed text-slate-500">
                {PAPER.abstract}
              </p>
            </div>
            <div className="lg:col-span-5">
              <Label className="text-slate-500">Contact</Label>
              <div className="mt-3 grid gap-px bg-slate-800">
                {[
                  ["Email", LINKS.contact, "richard.gerum@protonmail.com"],
                  ["GitHub", LINKS.github, "rgerum/saenopy"],
                  ["Docs", LINKS.docs, "saenopy.readthedocs.io"],
                  ["Site", LINKS.site, "saenopy.com"],
                ].map(([k, href, v]) => (
                  <a
                    key={k}
                    href={href}
                    className="flex items-baseline justify-between bg-slate-900 px-3 py-2.5 hover:bg-slate-800"
                  >
                    <Label className="text-slate-500">{k}</Label>
                    <Mono className="text-[12px] text-slate-200">{v}</Mono>
                  </a>
                ))}
              </div>
              <Mono className="mt-6 block text-[11px] text-slate-500">
                Prices, turnaround and capacity: on request.
              </Mono>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
