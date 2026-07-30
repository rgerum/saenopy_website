"use client";

import styles from "./styles.module.css";
import { DATASETS } from "@/lib/saenopy-content";

/*
 * Every bundle in public/data on one logarithmic force axis. Immune-cell
 * measurements are picked out in the accent colour; everything else is
 * neutral. Values are the measured peak fitted traction forces, nothing is
 * interpolated or modelled here.
 */

const ROWS = [
  { key: "nk92", immune: true },
  { key: "dynamic", immune: true },
  { key: "cell004", immune: false },
  { key: "organoid", immune: false },
  { key: "cell007", immune: false },
  { key: "cell008", immune: false },
]
  .map((r) => ({ ...r, d: DATASETS[r.key] }))
  .sort((a, b) => a.d.peakForce - b.d.peakForce);

const W = 1000;
const ROW_H = 36;
const TOP = 16;
const AXIS_Y = TOP + ROWS.length * ROW_H + 10;
const H = AXIS_Y + 46;

const PLOT_L = 292;
const PLOT_R = 944;
const LO = Math.log10(0.5);
const HI = Math.log10(260);

const x = (v: number) => PLOT_L + ((Math.log10(v) - LO) / (HI - LO)) * (PLOT_R - PLOT_L);

const DECADES = [1, 10, 100];
const MINORS = DECADES.flatMap((d) => [2, 3, 4, 5, 6, 7, 8, 9].map((m) => m * d))
  .concat([0.6, 0.7, 0.8, 0.9])
  .filter((v) => v >= 0.5 && v <= 260);

const ACCENT = "#ff9d4d";
const NEUTRAL = "#8ea0b2";

export function RangePlot() {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="auto"
      role="img"
      aria-label="Measured peak traction force for each dataset on a logarithmic axis, from 0.87 nanonewton for an NK92 cell to 126 nanonewton for a fibroblast."
      style={{ display: "block" }}
    >
      {MINORS.map((v) => (
        <line
          key={`m-${v}`}
          x1={x(v)}
          x2={x(v)}
          y1={TOP}
          y2={AXIS_Y}
          stroke="#111a22"
          strokeWidth={1}
        />
      ))}
      {DECADES.map((v) => (
        <g key={`d-${v}`}>
          <line x1={x(v)} x2={x(v)} y1={TOP} y2={AXIS_Y + 6} stroke="#243141" strokeWidth={1} />
          <text x={x(v)} y={AXIS_Y + 21} textAnchor="middle" className={styles.tick}>
            {v}
          </text>
        </g>
      ))}
      <line x1={PLOT_L} x2={PLOT_R} y1={AXIS_Y} y2={AXIS_Y} stroke="#3b4a5a" strokeWidth={1} />
      <text
        x={(PLOT_L + PLOT_R) / 2}
        y={AXIS_Y + 40}
        textAnchor="middle"
        className={styles.axisTitle}
      >
        peak fitted traction force (nN, log scale)
      </text>

      {ROWS.map((r, i) => {
        const cy = TOP + i * ROW_H + ROW_H / 2;
        const c = r.immune ? ACCENT : NEUTRAL;
        return (
          <g key={r.key}>
            <text x={PLOT_L - 18} y={cy - 2} textAnchor="end" fill="#e7eef5" fontSize={13.5}>
              {r.d.label}
            </text>
            <text x={PLOT_L - 18} y={cy + 12} textAnchor="end" className={styles.note}>
              {r.d.meshNodes.toLocaleString("en-US")} mesh nodes
            </text>
            <line
              x1={PLOT_L}
              x2={x(r.d.peakForce)}
              y1={cy}
              y2={cy}
              stroke={c}
              strokeOpacity={0.35}
              strokeWidth={1}
            />
            <circle cx={x(r.d.peakForce)} cy={cy} r={4.5} fill={c} />
            <text
              x={x(r.d.peakForce) + 11}
              y={cy + 4}
              fill={c}
              fontSize={12}
              className={styles.readout}
            >
              {r.d.peakForce} nN
            </text>
          </g>
        );
      })}
    </svg>
  );
}
