/**
 * A small, print-styled line chart for the per-frame traces of the dynamic
 * dataset. Static SVG, so it stays a server component.
 */

const INK = "#1b1a17";
const RULE = "#ded8cb";
const MUTED = "#7a7365";

interface TraceChartProps {
  values: number[];
  /** axis label, e.g. "peak traction force (nN)" */
  yLabel: string;
  xLabel: string;
  color: string;
  /** index of a frame to call out with a hollow marker */
  markIndex?: number;
}

function format(value: number) {
  if (value === 0) return "0";
  if (value >= 10) return value.toFixed(0);
  if (value >= 1) return value.toFixed(1);
  return value.toFixed(2);
}

export function TraceChart({
  values,
  yLabel,
  xLabel,
  color,
  markIndex,
}: TraceChartProps) {
  const w = 520;
  const h = 210;
  const padL = 52;
  const padR = 12;
  const padT = 26;
  const padB = 34;

  const peak = Math.max(...values);
  const top = peak * 1.12;
  const x = (i: number) => padL + (i / (values.length - 1)) * (w - padL - padR);
  const y = (v: number) => padT + (1 - v / top) * (h - padT - padB);

  const line = values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const yTicks = [0, top / 2, top];
  const xTicks = [0, 5, 10, 15, 20];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full"
      role="img"
      aria-label={`${yLabel} against ${xLabel}`}
    >
      {yTicks.map((t) => (
        <g key={t}>
          <line
            x1={padL}
            x2={w - padR}
            y1={y(t)}
            y2={y(t)}
            stroke={RULE}
            strokeWidth={t === 0 ? 1 : 0.5}
          />
          <text
            x={padL - 8}
            y={y(t) + 3.5}
            textAnchor="end"
            fill={MUTED}
            fontSize={10}
            fontFamily="var(--font-geist-mono), monospace"
          >
            {format(t)}
          </text>
        </g>
      ))}

      {xTicks.map((t) => (
        <g key={t}>
          <line
            x1={x(t)}
            x2={x(t)}
            y1={h - padB}
            y2={h - padB + 4}
            stroke={RULE}
            strokeWidth={1}
          />
          <text
            x={x(t)}
            y={h - padB + 16}
            textAnchor="middle"
            fill={MUTED}
            fontSize={10}
            fontFamily="var(--font-geist-mono), monospace"
          >
            {t}
          </text>
        </g>
      ))}

      <path d={line} fill="none" stroke={color} strokeWidth={1.4} strokeLinejoin="round" />
      {values.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r={1.9} fill={color} />
      ))}
      {markIndex !== undefined && (
        <circle
          cx={x(markIndex)}
          cy={y(values[markIndex])}
          r={5}
          fill="none"
          stroke={INK}
          strokeWidth={1}
        />
      )}

      <text
        x={4}
        y={10}
        fill={MUTED}
        fontSize={10}
        fontFamily="var(--font-geist-mono), monospace"
        letterSpacing="0.08em"
      >
        {yLabel}
      </text>
      <text
        x={w - padR}
        y={h - 4}
        textAnchor="end"
        fill={MUTED}
        fontSize={10}
        fontFamily="var(--font-geist-mono), monospace"
        letterSpacing="0.08em"
      >
        {xLabel}
      </text>
    </svg>
  );
}
