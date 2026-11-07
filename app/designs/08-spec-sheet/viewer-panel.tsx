"use client";

import * as React from "react";
import { DisplayMesh, type ViewerStats } from "@/components/mesh/display";
import { DATASETS } from "@/lib/saenopy-content";

const FIELD = "fitted forces";

function kb(bytes: number) {
  return `${(bytes / 1024).toFixed(1)} kB`;
}

/**
 * Fig. 1. One viewer, plus the transfer figures the bundle reader reports for
 * the file it just loaded — nothing here is typed in by hand.
 */
export function ViewerPanel() {
  const [stats, setStats] = React.useState<ViewerStats | null>(null);
  const field = stats?.fields?.[FIELD];

  const rows: [string, string][] = [
    ["over the wire", stats ? kb(stats.transferBytes) : "—"],
    ["decoded", stats ? kb(stats.rawBytes) : "—"],
    ["float32 .npy, deflated", stats ? kb(stats.baselineBytes) : "—"],
    [
      "ratio",
      stats ? `${(stats.baselineBytes / stats.transferBytes).toFixed(1)}×` : "—",
    ],
    [
      "arrows kept / mesh",
      field ? `${field.count.toLocaleString("en")} / ${field.total.toLocaleString("en")}` : "—",
    ],
    [
      "peak magnitude",
      field ? `${field.max.toPrecision(3)} ${field.unit}` : "—",
    ],
    ["time points", stats ? String(stats.timePoints) : "—"],
  ];

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_260px]">
      <figure className="m-0">
        <div className="border border-[#17181a] bg-[#101113]">
          <DisplayMesh
            bundle={DATASETS.nk92.bundle}
            field={FIELD}
            height="330px"
            arrow_span={0.12}
            zoom={1.45}
            cube="field"
            cube_color={0x5a5f66}
            background="transparent"
            logo_width="0px"
            cmap="turbo"
            mouse_control
            show_controls={false}
            show_colormap
            animations={[{ type: "rotate", speed: 6 }]}
            onStats={setStats}
          />
        </div>
        <figcaption className="mt-2 text-[11.5px] leading-[1.5] text-[#5c5f66]">
          <span className="mono text-[10px] uppercase tracking-[0.14em] text-[#17181a]">
            Fig. 1
          </span>{" "}
          Fitted force field, {DATASETS.nk92.label} — {DATASETS.nk92.subject}. Peak{" "}
          {DATASETS.nk92.peakForce} nN. Arrow length is scaled to the domain, colour to magnitude.
          Drag to rotate, scroll to zoom.
        </figcaption>
      </figure>

      <div>
        <div className="mono border-b border-[#17181a] pb-1 text-[10px] uppercase tracking-[0.14em]">
          Loaded bundle
        </div>
        <dl className="m-0">
          {rows.map(([k, v]) => (
            <div
              key={k}
              className="flex items-baseline justify-between gap-3 border-b border-dotted border-[#cfccc5] py-[5px]"
            >
              <dt className="text-[11.5px] text-[#5c5f66]">{k}</dt>
              <dd className="mono m-0 text-[11.5px] text-[#17181a]">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-[11px] leading-[1.5] text-[#8b8f96]">
          Read from the bundle header at load time by{" "}
          <span className="mono">components/mesh/field_bundle.ts</span>. The baseline is the same
          field stored as deflated float32 <span className="mono">.npy</span> arrays.
        </p>
      </div>
    </div>
  );
}
