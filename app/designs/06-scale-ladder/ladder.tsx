import { DisplayMesh } from "@/components/mesh/display";
import {
  AXIS_H,
  DECADES,
  MINOR_TICKS,
  RUNGS,
  colorFor,
  fmtForce,
  stackTops,
  yFor,
  type Rung,
} from "./scale";

/* ---- diagram geometry, all in px inside a 1160-wide frame ---- */
const W = 1160;
const X_DECADE_LABEL_W = 74;
const X_AXIS = 96;
const X_ROW = 148;
const ROW_W = 316;
const X_GUTTER = 480;
const X_CARD = 500;
const CARD_W = W - X_CARD;

const ROW_H = 46;
const ROW_GAP = 8;
const VIEWER_H = 250;
const CARD_H = 386;
const CARD_GAP = 26;

const LINE = "#E2E1DC";
const LINE_STRONG = "#C9C7C0";
const MUTED = "#6A6C70";
const INK = "#191A1C";

const rowTops = stackTops(
  RUNGS.map((r) => ({ y: yFor(r.force), h: ROW_H })),
  ROW_GAP,
);
const rowCenter = (i: number) => rowTops[i] + ROW_H / 2;

const liveRungs = RUNGS.filter((r) => r.live);
const cardTops = stackTops(
  liveRungs.map((r) => ({ y: yFor(r.force), h: CARD_H })),
  CARD_GAP,
);

const FRAME_H = Math.max(AXIS_H, cardTops[cardTops.length - 1] + CARD_H) + 32;

/** the three-segment leader line from a tick to a displaced label */
function Connector({
  fromX,
  toX,
  trueY,
  labelY,
  color,
}: {
  fromX: number;
  toX: number;
  trueY: number;
  labelY: number;
  color: string;
}) {
  const bendX = fromX + (toX - fromX) * 0.35;
  const top = Math.min(trueY, labelY);
  const h = Math.abs(labelY - trueY);
  return (
    <>
      <div
        className="absolute"
        style={{
          left: fromX,
          top: trueY,
          width: bendX - fromX,
          height: 1,
          background: color,
        }}
      />
      <div
        className="absolute"
        style={{ left: bendX, top, width: 1, height: h, background: color }}
      />
      <div
        className="absolute"
        style={{
          left: bendX,
          top: labelY,
          width: toX - bendX,
          height: 1,
          background: color,
        }}
      />
    </>
  );
}

function RailRow({ rung, index }: { rung: Rung; index: number }) {
  const trueY = yFor(rung.force);
  const cy = rowCenter(index);
  const { value, unit } = fmtForce(rung.force);
  const isLimit = rung.kind === "limit";
  const color = isLimit ? LINE_STRONG : colorFor(rung.force);
  const d = rung.dataset;

  return (
    <>
      <Connector
        fromX={X_AXIS}
        toX={X_ROW}
        trueY={trueY}
        labelY={cy}
        color={isLimit ? LINE_STRONG : LINE_STRONG}
      />
      {/* marker on the axis, always at the true position */}
      {isLimit ? (
        <div
          className="absolute"
          style={{
            left: X_AXIS - 4,
            top: trueY - 4,
            width: 9,
            height: 9,
            border: `1px solid ${MUTED}`,
            background: "#F8F7F4",
            transform: "rotate(45deg)",
          }}
        />
      ) : (
        <div
          className="absolute rounded-full"
          style={{
            left: X_AXIS - 4,
            top: trueY - 4,
            width: 9,
            height: 9,
            background: color,
            boxShadow: "0 0 0 2.5px #F8F7F4",
          }}
        />
      )}
      <div
        className="absolute flex flex-col justify-center"
        style={{ left: X_ROW, top: rowTops[index], width: ROW_W, height: ROW_H }}
      >
        <div className="flex items-baseline gap-3">
          <span
            className="font-mono shrink-0 text-right tabular-nums"
            style={{ width: 66, color, fontSize: 16, fontWeight: 500 }}
          >
            {isLimit ? "~" : ""}
            {value}
            <span style={{ fontSize: 10.5, marginLeft: 2 }}>{unit}</span>
          </span>
          <span
            className="truncate"
            style={{ fontSize: 13.5, color: isLimit ? MUTED : INK }}
          >
            {rung.title}
          </span>
        </div>
        <div
          className="font-mono truncate"
          style={{ fontSize: 10.5, color: MUTED, marginTop: 3, letterSpacing: "0.02em" }}
        >
          {isLimit
            ? "stated limit — no bundle"
            : d
              ? `${d.meshNodes.toLocaleString("en-GB")} nodes · ${d.peakDeformation} µm peak deformation${d.frames ? ` · ${d.frames} frames` : ""}`
              : ""}
        </div>
      </div>
    </>
  );
}

function FieldCard({ rung, top }: { rung: Rung; top: number }) {
  const d = rung.dataset;
  if (!d) return null;
  const { value, unit } = fmtForce(rung.force);
  const color = colorFor(rung.force);

  return (
    <div
      className="absolute flex flex-col overflow-hidden"
      style={{
        left: X_CARD,
        top,
        width: CARD_W,
        height: CARD_H,
        background: "#FFFFFF",
        border: `1px solid ${LINE}`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 3,
      }}
    >
      <div className="flex items-start justify-between gap-6 px-5 pt-4 pb-3">
        <div className="min-w-0">
          <div style={{ fontSize: 15, color: INK, fontWeight: 500 }}>{d.label}</div>
          <div style={{ fontSize: 12.5, color: MUTED, marginTop: 2 }}>{d.subject}</div>
        </div>
        <div className="text-right shrink-0">
          <div
            className="font-mono tabular-nums"
            style={{ fontSize: 27, lineHeight: 1, color }}
          >
            {value}
            <span style={{ fontSize: 13, marginLeft: 3 }}>{unit}</span>
          </div>
          <div
            className="font-mono"
            style={{
              fontSize: 9.5,
              color: MUTED,
              marginTop: 5,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            peak fitted traction
          </div>
        </div>
      </div>
      <div className="px-4" style={{ background: "transparent" }}>
        <div style={{ background: "#101317", borderRadius: 2, overflow: "hidden" }}>
          <DisplayMesh
            bundle={d.bundle}
            field="fitted forces"
            height={`${VIEWER_H}px`}
            arrow_span={0.1}
            zoom={1.15}
            cube="field"
            cube_color={0x3a4250}
            background="transparent"
            logo_width="0px"
            cmap="turbo"
            mouse_control
            show_controls={false}
            show_colormap
          />
        </div>
      </div>
      <div
        className="font-mono flex items-center justify-between px-5 mt-auto pb-3 pt-3"
        style={{ fontSize: 10.5, color: MUTED, letterSpacing: "0.02em" }}
      >
        <span>fitted forces · arrow_span 0.1 · drag to rotate</span>
        <span>{d.transferKB} kB over the wire</span>
      </div>
    </div>
  );
}

export function Ladder() {
  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: W }}>
        {/* axis heading */}
        <div className="flex items-end justify-between pb-3" style={{ width: W }}>
          <div
            className="font-mono"
            style={{
              fontSize: 10.5,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: INK,
              paddingLeft: 0,
            }}
          >
            Peak traction force · log<sub>10</sub> scale, drawn to scale
          </div>
          <div
            className="font-mono"
            style={{ fontSize: 10.5, letterSpacing: "0.06em", color: MUTED }}
          >
            one decade = {380} px
          </div>
        </div>

        <div className="relative" style={{ width: W, height: FRAME_H }}>
          {/* decade grid lines across the whole frame */}
          {DECADES.map((dec) => (
            <div
              key={`grid-${dec.nN}`}
              className="absolute"
              style={{
                left: X_AXIS,
                top: yFor(dec.nN),
                width: W - X_AXIS,
                height: 1,
                background: LINE,
              }}
            />
          ))}

          {/* the axis itself */}
          <div
            className="absolute"
            style={{
              left: X_AXIS,
              top: 0,
              width: 2,
              height: AXIS_H,
              background:
                "linear-gradient(to bottom, rgb(216,96,96), rgb(204,85,89), rgb(138,68,110), rgb(38,74,124), rgb(30,62,106))",
            }}
          />

          {/* minor ticks, 2..9 in each decade */}
          {MINOR_TICKS.map((v) => (
            <div
              key={`minor-${v}`}
              className="absolute"
              style={{
                left: X_AXIS - 6,
                top: yFor(v),
                width: 6,
                height: 1,
                background: LINE_STRONG,
              }}
            />
          ))}

          {/* decade ticks and labels */}
          {DECADES.map((dec) => (
            <div key={`dec-${dec.nN}`}>
              <div
                className="absolute"
                style={{
                  left: X_AXIS - 14,
                  top: yFor(dec.nN),
                  width: 14,
                  height: 1,
                  background: MUTED,
                }}
              />
              <div
                className="absolute font-mono text-right tabular-nums"
                style={{
                  left: 0,
                  top: yFor(dec.nN) - 9,
                  width: X_DECADE_LABEL_W,
                  fontSize: 13,
                  color: INK,
                }}
              >
                {dec.label}
              </div>
            </div>
          ))}

          {/* dashed rules for the two endpoints quoted in the paper */}
          {RUNGS.filter((r) => r.kind === "limit").map((r) => (
            <div
              key={`limit-${r.id}`}
              className="absolute"
              style={{
                left: X_AXIS,
                top: yFor(r.force),
                width: W - X_AXIS,
                height: 0,
                borderTop: `1px dashed ${LINE_STRONG}`,
              }}
            />
          ))}

          {/* the reading key, sitting in the empty top of the content column */}
          <ReadingKey />

          {/* the empty stretch between the fibroblasts and the immune cells */}
          <GapNote />

          {RUNGS.map((rung, i) => (
            <RailRow key={rung.id} rung={rung} index={i} />
          ))}

          {liveRungs.map((rung, i) => (
            <div key={`card-${rung.id}`}>
              <Connector
                fromX={X_ROW + ROW_W}
                toX={X_CARD}
                trueY={rowCenter(RUNGS.indexOf(rung))}
                labelY={cardTops[i] + CARD_H / 2}
                color={LINE_STRONG}
              />
              <FieldCard rung={rung} top={cardTops[i]} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReadingKey() {
  return (
    <div
      className="absolute"
      style={{
        left: X_CARD,
        top: 34,
        width: CARD_W,
        background: "#FFFFFF",
        border: `1px solid ${LINE}`,
        borderRadius: 3,
        padding: "20px 22px 22px",
      }}
    >
      <div
        className="font-mono"
        style={{
          fontSize: 10,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: MUTED,
        }}
      >
        How to read this
      </div>
      <dl style={{ marginTop: 16 }}>
        {[
          {
            marker: "dot",
            term: "Measured",
            def: "Peak fitted traction force, read out of a bundle in public/data. Position on the axis is log₁₀ of that number.",
          },
          {
            marker: "diamond",
            term: "Stated limit",
            def: "An endpoint quoted in the paper abstract. We do not have those two specimens, so they are drawn as limits, not as data.",
          },
          {
            marker: "ramp",
            term: "Colour",
            def: "Position on the scale — deep blue at 1 nN through to red at 10 µN. It carries no other meaning.",
          },
        ].map((row) => (
          <div key={row.term} className="flex gap-4" style={{ marginBottom: 12 }}>
            <div className="shrink-0" style={{ width: 22, paddingTop: 5 }}>
              {row.marker === "dot" && (
                <div
                  className="rounded-full"
                  style={{ width: 9, height: 9, background: colorFor(60) }}
                />
              )}
              {row.marker === "diamond" && (
                <div
                  style={{
                    width: 9,
                    height: 9,
                    border: `1px solid ${MUTED}`,
                    transform: "rotate(45deg)",
                  }}
                />
              )}
              {row.marker === "ramp" && (
                <div
                  style={{
                    width: 9,
                    height: 26,
                    marginTop: -8,
                    background:
                      "linear-gradient(to bottom, rgb(204,85,89), rgb(138,68,110), rgb(38,74,124))",
                  }}
                />
              )}
            </div>
            <div>
              <dt style={{ fontSize: 13, color: INK, fontWeight: 500 }}>{row.term}</dt>
              <dd style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.55, marginTop: 2 }}>
                {row.def}
              </dd>
            </div>
          </div>
        ))}
      </dl>
      <div
        style={{
          borderTop: `1px solid ${LINE}`,
          marginTop: 8,
          paddingTop: 16,
        }}
      >
        <div style={{ fontSize: 13, color: INK, fontWeight: 500 }}>
          Why the three fields below look alike
        </div>
        <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.6, marginTop: 4 }}>
          Every field on this page is drawn with{" "}
          <code
            className="font-mono"
            style={{ fontSize: 11.5, color: INK, background: "#F1F0EC", padding: "1px 4px" }}
          >
            arrow_span = 0.1
          </code>
          : the longest arrow is one tenth of the domain, whatever the absolute force. The
          organoid pulls 70&times; harder than the NK92 cell. Drawn on a shared arrow
          scale, one of the two would be a blank box — which is the whole reason these
          specimens are normally not compared at all.
        </p>
      </div>
    </div>
  );
}

function GapNote() {
  return (
    <div
      className="absolute"
      style={{
        left: X_ROW,
        top: 1180,
        width: ROW_W,
        background: "#F8F7F4",
        paddingTop: 14,
        paddingBottom: 14,
      }}
    >
      <div
        className="font-mono"
        style={{ fontSize: 22, color: INK, letterSpacing: "-0.01em" }}
      >
        1.7 decades
      </div>
      <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.6, marginTop: 6 }}>
        of empty axis between the fibroblasts and the immune cells. Nothing about the
        measurement changes across the gap: the same solver, the same non-linear material
        model, the same kind of image stack going in.
      </p>
    </div>
  );
}
