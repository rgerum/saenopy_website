"use client";

import * as React from "react";
import { ArrowLeftRight, ExternalLink, Mail } from "lucide-react";

import { DisplayMesh } from "@/components/mesh/display";
import {
  CLAIMS,
  DATASETS,
  IMMUNO,
  LINKS,
  PAPER,
  PLACEHOLDERS,
  SERVICES,
  type Dataset,
} from "@/lib/saenopy-content";

import s from "./styles.module.css";

/* -------------------------------------------------------------------------- */

/** Single-frame bundles, the ones that can be put side by side fairly. */
const COMPARABLE = ["cell004", "cell007", "cell008", "nk92", "organoid"];

const FIELDS = [
  { value: "fitted forces", label: "Fitted forces" },
  { value: "fitted deformations", label: "Fitted deformations" },
  { value: "measured deformations", label: "Measured deformations" },
];

const PRESETS = [
  {
    left: "cell004",
    right: "cell008",
    label: "Fibroblast 4 / Fibroblast 8",
    hint: "same experiment",
  },
  {
    left: "cell004",
    right: "cell007",
    label: "Fibroblast 4 / Fibroblast 7",
    hint: "same experiment",
  },
  {
    left: "cell007",
    right: "cell008",
    label: "Fibroblast 7 / Fibroblast 8",
    hint: "same experiment",
  },
  {
    left: "nk92",
    right: "cell007",
    label: "NK92 cell / Fibroblast 7",
    hint: "different cell type",
  },
  {
    left: "nk92",
    right: "organoid",
    label: "NK92 cell / Organoid",
    hint: "different scale",
  },
];

const FIBROBLASTS = ["cell004", "cell007", "cell008"];

/**
 * Hypothetical condition labels for the placeholder panels. Nothing here has
 * been measured; the cards carry a visible placeholder mark.
 */
const PLACEHOLDER_CONDITIONS: Record<string, [string, string]> = {
  "Donor-to-donor variability": ["Donor 1", "Donor 2"],
  "Stiffness response curve": ["Soft matrix", "Stiff matrix"],
  "Compound screen": ["Untreated", "Treated"],
  "Patient-derived material": ["Reference matrix", "Patient-derived matrix"],
};

/** Arrow scaling, identical on both sides of the comparison. */
const ARROW_SPAN = 0.12;

function fmt(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 3 });
}

function signed(value: number) {
  const rounded = Number(value.toFixed(3));
  return `${rounded > 0 ? "+" : rounded < 0 ? "−" : ""}${fmt(Math.abs(rounded))}`;
}

/* -------------------------------------------------------------------------- */

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className={`${s.mono} inline-flex items-center gap-1.5 border border-[#c99a3f] bg-[#fbf3e2] px-2 py-[3px] text-[10px] tracking-[0.14em] text-[#8a6412] uppercase`}
    >
      {children}
    </span>
  );
}

function SectionLabel({
  index,
  children,
}: {
  index: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-baseline gap-3 border-b border-[#d9d5cc] pb-2">
      <span className={`${s.mono} text-[11px] text-[#a09a8c]`}>{index}</span>
      <span
        className={`${s.mono} text-[11px] tracking-[0.16em] text-[#5c5a54] uppercase`}
      >
        {children}
      </span>
    </div>
  );
}

/** One side of the comparison: selector, viewer, headline number. */
function Panel({
  side,
  dataset,
  field,
  otherPeak,
  onSelect,
}: {
  side: "A" | "B";
  dataset: Dataset;
  field: string;
  otherPeak: number;
  onSelect: (id: string) => void;
}) {
  const stronger = dataset.peakForce > otherPeak;

  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-[#d9d5cc] pb-2">
        <span
          className={`${s.mono} text-[11px] tracking-[0.16em] text-[#a09a8c] uppercase`}
        >
          Panel {side}
        </span>
        <div className="relative">
          <select
            aria-label={`Specimen in panel ${side}`}
            value={dataset.id}
            onChange={(event) => onSelect(event.target.value)}
            className={`${s.selectReset} ${s.mono} cursor-pointer rounded-none border border-[#c9c4b8] bg-white py-1.5 pr-7 pl-2.5 text-[12px] text-[#16171a] hover:border-[#8b8578] focus:ring-1 focus:ring-[#16171a] focus:outline-none`}
          >
            {COMPARABLE.map((id) => (
              <option key={id} value={id}>
                {DATASETS[id].label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[9px] text-[#8b8578]">
            ▼
          </span>
        </div>
      </div>

      <div className={`${s.viewerFrame} mt-px overflow-hidden`}>
        <DisplayMesh
          key={`${side}-${dataset.id}-${field}`}
          bundle={dataset.bundle}
          field={field}
          height="420px"
          arrow_span={ARROW_SPAN}
          zoom={1.55}
          cube="field"
          cube_color={0x3f4855}
          background="transparent"
          logo_width="0px"
          cmap="turbo"
          mouse_control
          show_controls={false}
          show_colormap
          animations={[{ type: "rotate", speed: 5 }]}
        />
      </div>

      <div className="border-x border-b border-[#d9d5cc] bg-white px-5 py-4">
        <p className="text-[15px] leading-snug font-medium">{dataset.label}</p>
        <p className="mt-1 text-[13px] leading-snug text-[#6a6862]">
          {dataset.subject}
        </p>

        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <p
              className={`${s.mono} text-[10px] tracking-[0.14em] text-[#8b8578] uppercase`}
            >
              Peak traction force
            </p>
            <p className={`${s.serif} ${s.tabular} mt-1 text-[42px] leading-none`}>
              {fmt(dataset.peakForce)}
              <span className="ml-1.5 text-[16px] text-[#6a6862]">nN</span>
            </p>
          </div>
          <div className="pb-1 text-right">
            <p
              className={`${s.mono} text-[10px] tracking-[0.14em] text-[#8b8578] uppercase`}
            >
              Peak deformation
            </p>
            <p className={`${s.serif} ${s.tabular} mt-1 text-[22px] leading-none`}>
              {fmt(dataset.peakDeformation)}
              <span className="ml-1 text-[13px] text-[#6a6862]">µm</span>
            </p>
          </div>
        </div>

        {dataset.peakForce !== otherPeak ? (
          <p
            className={`${s.mono} mt-4 border-t border-dashed border-[#d9d5cc] pt-3 text-[11px] text-[#6a6862]`}
          >
            {stronger ? "Higher" : "Lower"} peak traction of the pair
          </p>
        ) : null}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export default function ComparisonDesign() {
  const [leftId, setLeftId] = React.useState("cell004");
  const [rightId, setRightId] = React.useState("cell008");
  const [field, setField] = React.useState("fitted forces");

  const left = DATASETS[leftId];
  const right = DATASETS[rightId];

  const ratio =
    left.peakForce > 0 && right.peakForce > 0
      ? Math.max(left.peakForce, right.peakForce) /
        Math.min(left.peakForce, right.peakForce)
      : 1;
  const sameSpecimen = leftId === rightId;

  const rows: {
    label: string;
    unit: string;
    a: number;
    b: number;
    readout: boolean;
  }[] = [
    {
      label: "Peak traction force",
      unit: "nN",
      a: left.peakForce,
      b: right.peakForce,
      readout: true,
    },
    {
      label: "Peak matrix deformation",
      unit: "µm",
      a: left.peakDeformation,
      b: right.peakDeformation,
      readout: true,
    },
    {
      label: "Mesh nodes",
      unit: "",
      a: left.meshNodes,
      b: right.meshNodes,
      readout: false,
    },
    {
      label: "Bundle transferred",
      unit: "KB",
      a: left.transferKB,
      b: right.transferKB,
      readout: false,
    },
  ];

  const swap = () => {
    setLeftId(rightId);
    setRightId(leftId);
  };

  return (
    <main className={`${s.page} min-h-screen`}>
      {/* ------------------------------------------------ masthead */}
      <header className="border-b border-[#d9d5cc]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
          <div className="flex items-baseline gap-3">
            <span className={`${s.serif} text-[19px] tracking-tight`}>
              saenopy
            </span>
            <span className={`${s.mono} text-[11px] text-[#8b8578]`}>
              3D traction force microscopy
            </span>
          </div>
          <nav className={`${s.mono} flex items-center gap-6 text-[12px]`}>
            <a
              href={LINKS.docs}
              className="text-[#5c5a54] underline-offset-4 hover:text-[#16171a] hover:underline"
            >
              Documentation
            </a>
            <a
              href={LINKS.github}
              className="text-[#5c5a54] underline-offset-4 hover:text-[#16171a] hover:underline"
            >
              Source
            </a>
            <a
              href={LINKS.contact}
              className="border border-[#16171a] px-3 py-1.5 text-[#16171a] hover:bg-[#16171a] hover:text-[#f5f4f1]"
            >
              Contact
            </a>
          </nav>
        </div>
      </header>

      {/* ------------------------------------------------ hero */}
      <section className="mx-auto max-w-6xl px-8 pt-16 pb-12">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <div>
            <p
              className={`${s.mono} text-[11px] tracking-[0.18em] text-[#8b8578] uppercase`}
            >
              Mechanical phenotype as a readout
            </p>
            <h1
              className={`${s.serif} mt-5 text-[52px] leading-[1.04] tracking-[-0.015em]`}
            >
              The force a cell exerts is a number. Numbers can be compared.
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-[#3f3f45]">
              Saenopy reconstructs the traction a cell applies to the 3D matrix
              around it, per cell, inside the gel rather than on flat plastic.
              Run it on two conditions with the same acquisition and the same
              reconstruction and mechanics stops being a picture and starts
              being an endpoint.
            </p>
          </div>
          <div className="border-l border-[#d9d5cc] pl-8">
            <p
              className={`${s.mono} text-[10px] tracking-[0.14em] text-[#8b8578] uppercase`}
            >
              Method
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-[#3f3f45]">
              {PAPER.shortAuthors},{" "}
              <span className="italic">{PAPER.journal}</span> {PAPER.year}.{" "}
              {PAPER.title}.
            </p>
            <a
              href={PAPER.url}
              className={`${s.mono} mt-3 inline-flex items-center gap-1.5 text-[12px] text-[#5c5a54] underline underline-offset-4 hover:text-[#16171a]`}
            >
              doi:{PAPER.doi}
              <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
            <dl className="mt-6 space-y-2 border-t border-[#d9d5cc] pt-4">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[13px] text-[#6a6862]">Reported range</dt>
                <dd className={`${s.mono} text-[13px]`}>1 nN – 10 µN</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[13px] text-[#6a6862]">Input</dt>
                <dd className={`${s.mono} text-[13px]`}>
                  confocal or bright-field
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[13px] text-[#6a6862]">Matrix model</dt>
                <dd className={`${s.mono} text-[13px]`}>non-linear</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ the comparison */}
      <section className="mx-auto max-w-6xl px-8 pb-16">
        <SectionLabel index="Fig. 1">Paired measurement</SectionLabel>

        {/* controls */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6 border border-[#d9d5cc] bg-white px-5 py-4">
          <div>
            <p
              className={`${s.mono} mb-2 text-[10px] tracking-[0.14em] text-[#8b8578] uppercase`}
            >
              Preset pairs
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => {
                const active =
                  preset.left === leftId && preset.right === rightId;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setLeftId(preset.left);
                      setRightId(preset.right);
                    }}
                    className={`${s.mono} border px-3 py-1.5 text-left text-[11px] transition-colors ${
                      active
                        ? "border-[#16171a] bg-[#16171a] text-[#f5f4f1]"
                        : "border-[#c9c4b8] text-[#3f3f45] hover:border-[#8b8578]"
                    }`}
                  >
                    {preset.label}
                    <span
                      className={`ml-2 ${active ? "text-[#a8a49b]" : "text-[#a09a8c]"}`}
                    >
                      {preset.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-end gap-6">
            <div>
              <p
                className={`${s.mono} mb-2 text-[10px] tracking-[0.14em] text-[#8b8578] uppercase`}
              >
                Field, both panels
              </p>
              <div className="flex">
                {FIELDS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setField(option.value)}
                    className={`${s.mono} -ml-px border px-3 py-1.5 text-[11px] first:ml-0 ${
                      field === option.value
                        ? "border-[#16171a] bg-[#16171a] text-[#f5f4f1]"
                        : "border-[#c9c4b8] text-[#3f3f45] hover:border-[#8b8578]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={swap}
              className={`${s.mono} flex items-center gap-2 border border-[#c9c4b8] px-3 py-1.5 text-[11px] text-[#3f3f45] hover:border-[#8b8578]`}
            >
              <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden />
              Swap sides
            </button>
          </div>
        </div>

        {/* the two fields */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel
            side="A"
            dataset={left}
            field={field}
            otherPeak={right.peakForce}
            onSelect={setLeftId}
          />
          <Panel
            side="B"
            dataset={right}
            field={field}
            otherPeak={left.peakForce}
            onSelect={setRightId}
          />
        </div>

        {/* the delta */}
        <div className="mt-6 grid gap-px border border-[#d9d5cc] bg-[#d9d5cc] md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
          <div className="flex flex-col justify-center bg-white px-6 py-6">
            <p
              className={`${s.mono} text-[10px] tracking-[0.14em] text-[#8b8578] uppercase`}
            >
              Difference in peak traction
            </p>
            {sameSpecimen ? (
              <p className={`${s.serif} mt-3 text-[28px] leading-none`}>
                Same specimen
              </p>
            ) : (
              <>
                <p
                  className={`${s.serif} ${s.tabular} mt-3 text-[56px] leading-none`}
                >
                  ×{ratio.toFixed(2)}
                </p>
                <p className={`${s.mono} ${s.tabular} mt-3 text-[13px]`}>
                  {signed(right.peakForce - left.peakForce)} nN
                  <span className="ml-2 text-[#8b8578]">B − A</span>
                </p>
              </>
            )}
            <p className="mt-4 text-[12px] leading-relaxed text-[#6a6862]">
              Ratio of the two measured peaks. Nothing is modelled here — it is
              division.
            </p>
          </div>

          <table className={`${s.tabular} w-full bg-white text-[13px]`}>
            <thead>
              <tr className="border-b border-[#d9d5cc]">
                <th
                  className={`${s.mono} px-5 py-3 text-left text-[10px] font-normal tracking-[0.14em] text-[#8b8578] uppercase`}
                >
                  Metric
                </th>
                <th
                  className={`${s.mono} px-5 py-3 text-right text-[10px] font-normal tracking-[0.14em] text-[#8b8578] uppercase`}
                >
                  A
                </th>
                <th
                  className={`${s.mono} px-5 py-3 text-right text-[10px] font-normal tracking-[0.14em] text-[#8b8578] uppercase`}
                >
                  B
                </th>
                <th
                  className={`${s.mono} px-5 py-3 text-right text-[10px] font-normal tracking-[0.14em] text-[#8b8578] uppercase`}
                >
                  B − A
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.label}
                  className="border-b border-[#eae7e0] last:border-b-0"
                >
                  <td className="px-5 py-3 text-left text-[#3f3f45]">
                    {row.label}
                    {row.unit ? (
                      <span className={`${s.mono} ml-2 text-[11px] text-[#a09a8c]`}>
                        {row.unit}
                      </span>
                    ) : null}
                  </td>
                  <td className={`${s.mono} px-5 py-3 text-right`}>
                    {fmt(row.a)}
                  </td>
                  <td className={`${s.mono} px-5 py-3 text-right`}>
                    {fmt(row.b)}
                  </td>
                  <td
                    className={`${s.mono} px-5 py-3 text-right ${
                      row.readout ? "text-[#16171a]" : "text-[#a09a8c]"
                    }`}
                  >
                    {row.readout ? signed(row.b - row.a) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* the methodological caveat */}
        <div className="mt-4 grid gap-6 border-t border-[#d9d5cc] pt-4 md:grid-cols-2">
          <p className="text-[12px] leading-relaxed text-[#6a6862]">
            <span className={`${s.mono} text-[#3f3f45]`}>Same settings.</span>{" "}
            Both panels are drawn from the same field (
            <span className={s.mono}>{field}</span>) with the same arrow scaling
            (<span className={s.mono}>arrow_span = {ARROW_SPAN}</span>) and the
            same camera. Changing the control changes both sides at once; there
            is no way to flatter one panel here.
          </p>
          <p className="text-[12px] leading-relaxed text-[#6a6862]">
            <span className={`${s.mono} text-[#3f3f45]`}>
              Each panel self-normalises.
            </span>{" "}
            Arrow length and colour are scaled to that panel&apos;s own maximum,
            so the pictures show the shape of the force field, not its absolute
            size. Two specimens two orders of magnitude apart can look alike on
            screen. The absolute scale is on the colour bar — for the fitted
            fields its upper end is the peak quoted under the panel.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------ spread */}
      <section className="border-y border-[#d9d5cc] bg-[#efeee9]">
        <div className="mx-auto max-w-6xl px-8 py-16">
          <SectionLabel index="Fig. 2">
            Three cells, one experiment
          </SectionLabel>

          <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <div>
              <h2 className={`${s.serif} text-[30px] leading-[1.15]`}>
                The strongest of the three is 2.6× the weakest. Neither is a bad
                measurement.
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-[#3f3f45]">
                These are three fibroblasts from the same experiment, measured
                the same way, exported from the same pipeline. The spread
                between them is not noise to be tuned away — it is the cell
                population. Any effect you want to claim has to be read against
                it, which is why a single cell, however beautiful the picture,
                does not tell you anything about a condition.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-[#3f3f45]">
                Load any pair into the comparison above to see the two fields
                next to each other.
              </p>
            </div>

            <div>
              {FIBROBLASTS.map((id) => {
                const cell = DATASETS[id];
                const width = (cell.peakForce / 126) * 100;
                const selected = id === leftId || id === rightId;
                return (
                  <div
                    key={id}
                    className="border-b border-[#d9d5cc] py-4 first:border-t"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <span
                        className={`text-[14px] ${selected ? "text-[#16171a]" : "text-[#6a6862]"}`}
                      >
                        {cell.label}
                      </span>
                      <span className={`${s.mono} ${s.tabular} text-[14px]`}>
                        {fmt(cell.peakForce)}{" "}
                        <span className="text-[#8b8578]">nN</span>
                      </span>
                    </div>
                    <div className="mt-2 h-[10px] w-full bg-[#dedbd4]">
                      <div
                        className="h-full bg-[#16171a]"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <p className="mt-2 text-[12px] leading-snug text-[#8b8578]">
                      {cell.blurb}
                    </p>
                  </div>
                );
              })}
              <p
                className={`${s.mono} mt-4 text-[11px] leading-relaxed text-[#8b8578]`}
              >
                Bars scaled to the largest of the three. Peak fitted traction
                force, measured from the exported bundles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ what the method covers */}
      <section className="mx-auto max-w-6xl px-8 py-16">
        <SectionLabel index="Method">What the measurement rests on</SectionLabel>
        <div className="grid gap-px bg-[#d9d5cc] md:grid-cols-2 lg:grid-cols-4">
          {CLAIMS.map((claim) => (
            <div key={claim.headline} className="bg-[#f5f4f1] px-5 py-6">
              <p className={`${s.serif} text-[22px] leading-tight`}>
                {claim.headline}
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-[#5c5a54]">
                {claim.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ immuno */}
      <section className="border-y border-[#d9d5cc] bg-[#16171a] text-[#f0efec]">
        <div className="mx-auto max-w-6xl px-8 py-16">
          <div className="mb-6 flex items-baseline gap-3 border-b border-[#33343a] pb-2">
            <span className={`${s.mono} text-[11px] text-[#7c7d85]`}>
              Application
            </span>
            <span
              className={`${s.mono} text-[11px] tracking-[0.16em] text-[#a9aab1] uppercase`}
            >
              Cell therapy and immuno-oncology
            </span>
          </div>

          <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div>
              <blockquote
                className={`${s.serif} text-[26px] leading-[1.3] text-[#f5f4f1]`}
              >
                &ldquo;{IMMUNO.finding}&rdquo;
              </blockquote>
              <p className={`${s.mono} mt-4 text-[11px] text-[#7c7d85]`}>
                {PAPER.shortAuthors}, {PAPER.journal} {PAPER.year}
              </p>
              <p className="mt-6 text-[14px] leading-relaxed text-[#c3c4c9]">
                NK cells migrate at {IMMUNO.speed} through dense tissue. The
                same reconstruction that produced the panels above produced
                that finding, on bright-field stacks, one cell at a time.
              </p>
            </div>
            <div className="space-y-6">
              {IMMUNO.why.map((item) => (
                <div key={item.title} className="border-t border-[#33343a] pt-4">
                  <p className="text-[15px] font-medium text-[#f5f4f1]">
                    {item.title}
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#a9aab1]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ placeholders */}
      <section className="mx-auto max-w-6xl px-8 py-16">
        <SectionLabel index="Fig. 3">
          The same panel, with your conditions
        </SectionLabel>

        <div className="mb-8 flex flex-wrap items-center gap-4">
          <Chip>Placeholder</Chip>
          <p className="max-w-3xl text-[14px] leading-relaxed text-[#5c5a54]">
            Everything below this line is an illustration of a study we have not
            run. There are no numbers in it, because we do not have them. The
            comparison above uses real measurements; these four are the shape a
            paired readout would take once your material goes through the same
            pipeline. {PLACEHOLDERS.note}.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {PLACEHOLDERS.panels.map((panel) => {
            const conditions = PLACEHOLDER_CONDITIONS[panel.title] ?? [
              "Condition A",
              "Condition B",
            ];

            return (
              <div
                key={panel.title}
                className="border border-dashed border-[#c99a3f] bg-[#fcfaf5]"
              >
                <div className="flex items-center justify-between gap-4 border-b border-dashed border-[#c99a3f] px-5 py-3">
                  <p className="text-[15px] font-medium">{panel.title}</p>
                  <Chip>Placeholder</Chip>
                </div>

                <div className="grid grid-cols-2 gap-px bg-[#e6dcc6]">
                  {conditions.map((condition) => (
                    <div
                      key={condition}
                      className={`${s.hatch} flex h-[132px] flex-col items-center justify-center bg-[#fdfcf8]`}
                    >
                      <span
                        className={`${s.mono} text-[11px] tracking-[0.14em] text-[#8a6412] uppercase`}
                      >
                        {condition}
                      </span>
                      <span className={`${s.mono} mt-2 text-[11px] text-[#b09452]`}>
                        no data
                      </span>
                    </div>
                  ))}
                </div>

                <p className="border-t border-dashed border-[#c99a3f] px-5 py-4 text-[13px] leading-relaxed text-[#5c5a54]">
                  {panel.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------ services + footer */}
      <section className="border-t border-[#d9d5cc] bg-[#efeee9]">
        <div className="mx-auto max-w-6xl px-8 py-16">
          <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div>
              <SectionLabel index="Next">Working together</SectionLabel>
              <h2 className={`${s.serif} text-[28px] leading-[1.2]`}>
                Saenopy is open source. The measurement design usually is not
                the part you want to do yourself.
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-[#3f3f45]">
                The software is on GitHub and documented; run it on your own
                stacks today. Where we help is everything around it — getting a
                comparison like the one above to hold up.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={LINKS.contact}
                  className={`${s.mono} inline-flex items-center gap-2 bg-[#16171a] px-4 py-2.5 text-[12px] text-[#f5f4f1] hover:bg-[#33343a]`}
                >
                  <Mail className="h-3.5 w-3.5" aria-hidden />
                  Start a conversation
                </a>
                <a
                  href={LINKS.github}
                  className={`${s.mono} inline-flex items-center gap-2 border border-[#16171a] px-4 py-2.5 text-[12px] text-[#16171a] hover:bg-[#e4e2db]`}
                >
                  github.com/rgerum/saenopy
                </a>
              </div>
            </div>

            <div className="md:pt-[62px]">
              <ol className="border-t border-[#d9d5cc]">
                {SERVICES.map((service, index) => (
                  <li
                    key={service}
                    className="flex gap-4 border-b border-[#d9d5cc] py-4"
                  >
                    <span className={`${s.mono} text-[11px] text-[#a09a8c]`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[14px] leading-snug text-[#3f3f45]">
                      {service}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-8 py-10">
        <div className="flex flex-wrap items-start justify-between gap-6 border-t border-[#d9d5cc] pt-6">
          <p className="max-w-2xl text-[12px] leading-relaxed text-[#8b8578]">
            {PAPER.authors}. {PAPER.title}.{" "}
            <span className="italic">{PAPER.journal}</span> ({PAPER.year}).{" "}
            <a
              href={PAPER.url}
              className="underline underline-offset-4 hover:text-[#16171a]"
            >
              doi:{PAPER.doi}
            </a>{" "}
            ·{" "}
            <a
              href={PAPER.preprintUrl}
              className="underline underline-offset-4 hover:text-[#16171a]"
            >
              preprint
            </a>
          </p>
          <p className={`${s.mono} text-[11px] text-[#8b8578]`}>
            All figures rendered live in the browser from the exported bundles.
          </p>
        </div>
      </footer>
    </main>
  );
}
