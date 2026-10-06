"use client";

import styles from "./styles.module.css";
import { ENERGY_TRACE, FORCE_TRACE } from "@/lib/saenopy-content";

/*
 * Two stacked panels sharing one time axis, the way the same pair of
 * observables would be plotted in the paper. No dual y-axis: peak traction
 * (nN) and stored strain energy (fJ) are different quantities and get their
 * own scale each.
 */

const W = 1000;
const H = 372;
const LEFT = 66;
const RIGHT = 116;
const PLOT_W = W - LEFT - RIGHT;

const N = FORCE_TRACE.length; // 23 time points, one per minute
const T_MAX = N - 1;

const A_TOP = 22;
const A_H = 142;
const A_BOT = A_TOP + A_H;
const B_TOP = 202;
const B_H = 120;
const B_BOT = B_TOP + B_H;

/* axes are derived from the traces rather than hard-coded, so an update to
   lib/saenopy-content.ts cannot silently clip a point off the top */
const headroom = (values: number[], step: number) =>
  Math.max(step, Math.ceil((Math.max(...values) * 1.07) / (step / 10)) * (step / 10));
const ticksTo = (max: number, step: number) =>
  Array.from({ length: Math.floor(max / step) + 1 }, (_, i) => i * step);

const F_STEP = 0.2;
const E_STEP = 20;
const F_MAX = headroom(FORCE_TRACE, F_STEP); // nN
const E_MAX = headroom(ENERGY_TRACE, E_STEP); // fJ

const F_TICKS = ticksTo(F_MAX, F_STEP);
const E_TICKS = ticksTo(E_MAX, E_STEP);

const x = (i: number) => LEFT + (i / T_MAX) * PLOT_W;
const yF = (v: number) => A_BOT - (v / F_MAX) * A_H;
const yE = (v: number) => B_BOT - (v / E_MAX) * B_H;

const path = (values: number[], y: (v: number) => number) =>
  values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

const FORCE_PATH = path(FORCE_TRACE, yF);
const ENERGY_PATH = path(ENERGY_TRACE, yE);

const PEAK_I = FORCE_TRACE.indexOf(Math.max(...FORCE_TRACE));

/** median of every frame except the burst, computed rather than asserted */
export const MEDIAN_WITHOUT_PEAK = (() => {
  const rest = FORCE_TRACE.filter((_, i) => i !== PEAK_I).sort((a, b) => a - b);
  const m = Math.floor(rest.length / 2);
  return rest.length % 2 ? rest[m] : (rest[m - 1] + rest[m]) / 2;
})();

/**
 * Start of the trailing run of frames that sit below half the baseline and
 * never recover — the end-of-recording collapse, as opposed to the single-frame
 * fall off the burst. -1 when the trace has no such tail.
 */
const DROP_I = (() => {
  let i = N;
  while (i > 0 && FORCE_TRACE[i - 1] < MEDIAN_WITHOUT_PEAK / 2) i -= 1;
  return i > 0 && i < N ? i : -1;
})();

const GRID = "#16202b";
const SPINE = "#3b4a5a";
const FORCE_C = "#ff9d4d";
const ENERGY_C = "#5cb8ff";

function Panel({
  letter,
  top,
  bottom,
  ticks,
  y,
  title,
  colour,
  format,
}: {
  letter: string;
  top: number;
  bottom: number;
  ticks: number[];
  y: (v: number) => number;
  title: string;
  colour: string;
  format: (v: number) => string;
}) {
  return (
    <g>
      <text x={16} y={top + 10} className={styles.axisTitle} fill="#e7eef5">
        {letter}
      </text>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={LEFT} x2={LEFT + PLOT_W} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth={1} />
          <line x1={LEFT - 5} x2={LEFT} y1={y(t)} y2={y(t)} stroke={SPINE} strokeWidth={1} />
          <text x={LEFT - 10} y={y(t) + 3.6} textAnchor="end" className={styles.tick}>
            {format(t)}
          </text>
        </g>
      ))}
      <line x1={LEFT} x2={LEFT} y1={top} y2={bottom} stroke={SPINE} strokeWidth={1} />
      <line x1={LEFT} x2={LEFT + PLOT_W} y1={bottom} y2={bottom} stroke={SPINE} strokeWidth={1} />
      <text
        transform={`translate(28 ${(top + bottom) / 2}) rotate(-90)`}
        textAnchor="middle"
        className={styles.axisTitle}
        fill={colour}
      >
        {title}
      </text>
    </g>
  );
}

export function TraceFigure({ frame }: { frame: number }) {
  const fx = x(frame);
  const force = FORCE_TRACE[frame];
  const energy = ENERGY_TRACE[frame];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="auto"
      role="img"
      aria-label={`Peak traction force and matrix strain energy over 23 minutes. Currently showing minute ${frame}: ${force} nanonewton, ${energy} femtojoule.`}
      style={{ display: "block" }}
    >
      {/* minor ticks, one per minute, on the shared time axis */}
      {Array.from({ length: N }, (_, i) => (
        <line
          key={`minor-${i}`}
          x1={x(i)}
          x2={x(i)}
          y1={B_BOT}
          y2={B_BOT + 3}
          stroke={SPINE}
          strokeWidth={1}
        />
      ))}
      {Array.from({ length: Math.floor(T_MAX / 2) + 1 }, (_, k) => k * 2).map((t) => (
        <g key={`major-${t}`}>
          <line x1={x(t)} x2={x(t)} y1={B_BOT} y2={B_BOT + 6} stroke={SPINE} strokeWidth={1} />
          <line x1={x(t)} x2={x(t)} y1={A_BOT} y2={A_BOT + 4} stroke={SPINE} strokeWidth={1} />
          <text x={x(t)} y={B_BOT + 19} textAnchor="middle" className={styles.tick}>
            {t}
          </text>
        </g>
      ))}
      <text x={LEFT + PLOT_W / 2} y={H - 6} textAnchor="middle" className={styles.axisTitle}>
        time (min)
      </text>

      <Panel
        letter="B"
        top={A_TOP}
        bottom={A_BOT}
        ticks={F_TICKS}
        y={yF}
        title="peak traction (nN)"
        colour={FORCE_C}
        format={(v) => v.toFixed(1)}
      />
      <Panel
        letter="C"
        top={B_TOP}
        bottom={B_BOT}
        ticks={E_TICKS}
        y={yE}
        title="strain energy (fJ)"
        colour={ENERGY_C}
        format={(v) => String(v)}
      />

      {/* median of the non-burst frames, the level the burst stands out from */}
      <line
        x1={LEFT}
        x2={LEFT + PLOT_W}
        y1={yF(MEDIAN_WITHOUT_PEAK)}
        y2={yF(MEDIAN_WITHOUT_PEAK)}
        stroke="#7d8d9d"
        strokeWidth={1}
        strokeDasharray="4 4"
      />
      <text x={LEFT + 6} y={yF(MEDIAN_WITHOUT_PEAK) + 14} className={styles.note}>
        median {MEDIAN_WITHOUT_PEAK.toFixed(2)} nN
      </text>

      <path d={FORCE_PATH} fill="none" stroke={FORCE_C} strokeWidth={1.8} strokeLinejoin="round" />
      <path
        d={ENERGY_PATH}
        fill="none"
        stroke={ENERGY_C}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />

      {FORCE_TRACE.map((v, i) => (
        <circle key={`fp-${i}`} cx={x(i)} cy={yF(v)} r={2.2} fill={FORCE_C} />
      ))}
      {ENERGY_TRACE.map((v, i) => (
        <circle key={`ep-${i}`} cx={x(i)} cy={yE(v)} r={2.2} fill={ENERGY_C} />
      ))}

      {/* annotations */}
      <line
        x1={x(PEAK_I) + 7}
        x2={x(PEAK_I) + 24}
        y1={yF(FORCE_TRACE[PEAK_I])}
        y2={yF(FORCE_TRACE[PEAK_I])}
        stroke="#7d8d9d"
        strokeWidth={1}
      />
      <text
        x={x(PEAK_I) + 29}
        y={yF(FORCE_TRACE[PEAK_I]) + 3.6}
        className={styles.note}
        fill="#c3cfdb"
      >
        burst — {FORCE_TRACE[PEAK_I]} nN at minute {PEAK_I}
      </text>
      {DROP_I > 0 ? (
        <g>
          <line
            x1={x(DROP_I) - 10}
            x2={x(DROP_I) - 4}
            y1={yF(FORCE_TRACE[DROP_I])}
            y2={yF(FORCE_TRACE[DROP_I])}
            stroke="#7d8d9d"
            strokeWidth={1}
          />
          <text
            x={x(DROP_I) - 15}
            y={yF(FORCE_TRACE[DROP_I]) + 3.6}
            textAnchor="end"
            className={styles.note}
          >
            collapse after minute {DROP_I - 1}
          </text>
        </g>
      ) : null}

      {/* the marker that tracks the 3D field */}
      <g>
        <line
          x1={fx}
          x2={fx}
          y1={A_TOP - 8}
          y2={B_BOT}
          stroke="#e7eef5"
          strokeWidth={1}
          strokeOpacity={0.55}
        />
        <path
          d={`M${fx - 5},${A_TOP - 14} L${fx + 5},${A_TOP - 14} L${fx},${A_TOP - 6} Z`}
          fill="#e7eef5"
        />
        <circle cx={fx} cy={yF(force)} r={5} fill="#05070a" stroke={FORCE_C} strokeWidth={2} />
        <circle cx={fx} cy={yE(energy)} r={5} fill="#05070a" stroke={ENERGY_C} strokeWidth={2} />
      </g>

      {/* live readout, in the right gutter, one block per panel */}
      <g className={styles.readout}>
        <text x={W - RIGHT + 22} y={A_TOP + 14} fill="#62717f" fontSize={9} letterSpacing="0.12em">
          PEAK TRACTION
        </text>
        <text x={W - RIGHT + 22} y={A_TOP + 44} fill={FORCE_C} fontSize={26}>
          {force.toFixed(3)}
        </text>
        <text x={W - RIGHT + 22} y={A_TOP + 62} fill="#93a3b3" fontSize={11}>
          nN · minute {String(frame).padStart(2, "0")}
        </text>

        <text x={W - RIGHT + 22} y={B_TOP + 14} fill="#62717f" fontSize={9} letterSpacing="0.12em">
          STRAIN ENERGY
        </text>
        <text x={W - RIGHT + 22} y={B_TOP + 44} fill={ENERGY_C} fontSize={26}>
          {energy.toFixed(2)}
        </text>
        <text x={W - RIGHT + 22} y={B_TOP + 62} fill="#93a3b3" fontSize={11}>
          fJ stored
        </text>
      </g>
    </svg>
  );
}
