"use client";
import React from "react";
import { init } from "./3d_viewer.mjs";

export interface ViewerStats {
  transferBytes: number;
  rawBytes: number;
  baselineBytes: number;
  timePoints: number;
  timeDelta: number | null;
  series: { strainEnergy: (number | null)[]; peakForce: (number | null)[] };
  fields: Record<
    string,
    {
      count: number;
      total: number;
      unit: string;
      max: number;
      /** peak magnitude per time point, in display units */
      frameMax: number[];
    }
  >;
}

export interface DisplayMeshProps {
  /** path to a bundle produced by scripts/export_field_bundle.py */
  bundle?: string;
  /** legacy path to a folder holding data.json plus .npy files */
  path?: string;
  field?: string;
  /**
   * Longest arrow as a fraction of the domain size, default 0.1. Prefer this
   * over `scale`: it looks right on any dataset without retuning, since fields
   * differ by orders of magnitude between an immune cell and an organoid.
   */
  arrow_span?: number;
  /** fixed arrow scale; only used when arrow_span is explicitly set to 0 */
  scale?: number;
  zoom?: number;
  cmap?: string;
  cube?: "none" | "stack" | "field";
  cube_color?: number;
  background?: string;
  height?: string;
  logo_width?: string;
  mouse_control?: boolean;
  show_controls?: boolean;
  show_colormap?: boolean;
  /** starting time point for a multi-frame bundle */
  frame?: number;
  /**
   * "rotate" spins the camera, "time" steps through a multi-frame bundle at
   * `fps`, "scroll-tilt" ties the camera elevation to the scroll position.
   */
  animations?: { type: string; speed?: number; fps?: number }[];
  className?: string;
  onStats?: (stats: ViewerStats) => void;
}

export function DisplayMesh({
  className,
  onStats,
  height = "400px",
  ...options
}: DisplayMeshProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const onStatsRef = React.useRef(onStats);
  React.useEffect(() => {
    onStatsRef.current = onStats;
  }, [onStats]);

  // serialised so a caller passing inline objects does not restart the viewer
  const key = JSON.stringify(options);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const controller = new AbortController();
    let dispose: (() => void) | undefined;

    init({
      ...JSON.parse(key),
      height,
      dom_node: node,
      signal: controller.signal,
      on_ready: (params: { bundle_stats?: ViewerStats }) => {
        if (params.bundle_stats) onStatsRef.current?.(params.bundle_stats);
      },
    })
      .then((d: () => void) => {
        dispose = d;
        if (controller.signal.aborted) d();
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) console.error("3D viewer failed", error);
      });

    return () => {
      controller.abort();
      dispose?.();
      node.replaceChildren();
    };
  }, [key, height]);

  return <div ref={ref} className={className} />;
}
