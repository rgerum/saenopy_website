/**
 * Geometry and colour for the logarithmic force axis.
 *
 * Everything on the ladder is placed by log10 of its peak traction force in nN,
 * so the diagram is genuinely to scale. One decade is DECADE_PX pixels, always.
 */
import { DATASETS, type Dataset } from "@/lib/saenopy-content";

/** axis domain, in log10(nN). 0 = 1 nN, 4 = 10 µN. A little headroom on both ends. */
export const LOG_MIN = -0.35;
export const LOG_MAX = 4.15;
export const DECADE_PX = 380;
export const AXIS_H = (LOG_MAX - LOG_MIN) * DECADE_PX;

/** pixel offset from the top of the axis for a force in nN */
export function yFor(nN: number): number {
  return (LOG_MAX - Math.log10(nN)) * DECADE_PX;
}

export const DECADES: { nN: number; label: string }[] = [
  { nN: 10000, label: "10 µN" },
  { nN: 1000, label: "1 µN" },
  { nN: 100, label: "100 nN" },
  { nN: 10, label: "10 nN" },
  { nN: 1, label: "1 nN" },
];

/** 2..9 inside each decade, the marks that make a log axis readable as one */
export const MINOR_TICKS: number[] = [0, 1, 2, 3].flatMap((d) =>
  [2, 3, 4, 5, 6, 7, 8, 9].map((m) => m * Math.pow(10, d)),
);

/**
 * Sequential ramp, cool at the bottom of the scale to the saenopy red at the
 * top. Blue through plum to red, so no interpolated step goes grey.
 */
const STOPS: { t: number; rgb: [number, number, number] }[] = [
  { t: 0, rgb: [38, 74, 124] },
  { t: 0.5, rgb: [138, 68, 110] },
  { t: 1, rgb: [204, 85, 89] },
];

export function colorAt(t: number): string {
  const u = Math.min(1, Math.max(0, t));
  let a = STOPS[0];
  let b = STOPS[STOPS.length - 1];
  for (let i = 1; i < STOPS.length; i += 1) {
    if (u <= STOPS[i].t) {
      a = STOPS[i - 1];
      b = STOPS[i];
      break;
    }
  }
  const f = b.t === a.t ? 0 : (u - a.t) / (b.t - a.t);
  const mix = a.rgb.map((v, i) => Math.round(v + (b.rgb[i] - v) * f));
  return `rgb(${mix[0]}, ${mix[1]}, ${mix[2]})`;
}

/** colour for a force, keyed to its position between 1 nN and 10 µN */
export function colorFor(nN: number): string {
  return colorAt(Math.log10(nN) / 4);
}

export function fmtForce(nN: number): { value: string; unit: string } {
  if (nN >= 1000) return { value: String(nN / 1000), unit: "µN" };
  return { value: String(nN), unit: "nN" };
}

export interface Rung {
  id: string;
  /** peak traction force in nN — the coordinate on the axis */
  force: number;
  kind: "data" | "limit";
  title: string;
  detail: string;
  dataset?: Dataset;
  /** rendered as a live 3D field on the ladder */
  live?: boolean;
}

/** top of the axis first, i.e. descending force */
export const RUNGS: Rung[] = [
  {
    id: "limit-high",
    force: 10000,
    kind: "limit",
    title: "Mouse intestinal organoid",
    detail: "Upper end of the range stated in the paper. No bundle here.",
  },
  {
    id: "cell008",
    force: DATASETS.cell008.peakForce,
    kind: "data",
    title: DATASETS.cell008.label,
    detail: DATASETS.cell008.blurb,
    dataset: DATASETS.cell008,
    live: true,
  },
  {
    id: "cell007",
    force: DATASETS.cell007.peakForce,
    kind: "data",
    title: DATASETS.cell007.label,
    detail: DATASETS.cell007.blurb,
    dataset: DATASETS.cell007,
  },
  {
    id: "organoid",
    force: DATASETS.organoid.peakForce,
    kind: "data",
    title: DATASETS.organoid.label,
    detail: DATASETS.organoid.blurb,
    dataset: DATASETS.organoid,
    live: true,
  },
  {
    id: "cell004",
    force: DATASETS.cell004.peakForce,
    kind: "data",
    title: DATASETS.cell004.label,
    detail: DATASETS.cell004.blurb,
    dataset: DATASETS.cell004,
  },
  {
    id: "limit-low",
    force: 1,
    kind: "limit",
    title: "Axon growth cone",
    detail: "Lower end of the range stated in the paper. No bundle here.",
  },
  {
    id: "nk92",
    force: DATASETS.nk92.peakForce,
    kind: "data",
    title: DATASETS.nk92.label,
    detail: DATASETS.nk92.blurb,
    dataset: DATASETS.nk92,
    live: true,
  },
  {
    id: "dynamic",
    force: DATASETS.dynamic.peakForce,
    kind: "data",
    title: DATASETS.dynamic.label,
    detail: DATASETS.dynamic.blurb,
    dataset: DATASETS.dynamic,
  },
];

/**
 * Ticks stay at their true position; labels may not fit there. Walk the list in
 * order and push each block down until it clears the previous one, then draw a
 * connector back to the tick so the displacement stays visible.
 */
export function stackTops(items: { y: number; h: number }[], gap: number): number[] {
  let bottom = -Infinity;
  return items.map(({ y, h }) => {
    const top = Math.max(y - h / 2, bottom + gap);
    bottom = top + h;
    return top;
  });
}
