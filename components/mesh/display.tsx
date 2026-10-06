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

interface LiveParams {
  frame: number;
  field: string;
  time_points?: number;
  bundle_stats?: ViewerStats;
  data?: { fields: Record<string, unknown> };
}

export function DisplayMesh({
  className,
  onStats,
  height = "400px",
  frame = 0,
  field,
  ...options
}: DisplayMeshProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const onStatsRef = React.useRef(onStats);
  React.useEffect(() => {
    onStatsRef.current = onStats;
  }, [onStats]);

  // the live viewer params and its redraw, so the time point can be changed
  // without tearing down the WebGL context and re-decoding the bundle
  const live = React.useRef<{ params: LiveParams; redraw: () => void } | null>(null);
  const wantedFrame = React.useRef(frame);
  const wantedField = React.useRef(field);

  // serialised so a caller passing inline objects does not restart the viewer.
  // `frame` and `field` are deliberately not part of this: every field of a
  // bundle is already decoded in memory, so both are applied in place below
  // rather than by rebuilding the WebGL context and re-fetching.
  const key = JSON.stringify(options);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const controller = new AbortController();
    let dispose: (() => void) | undefined;
    live.current = null;

    init({
      ...JSON.parse(key),
      height,
      frame: wantedFrame.current,
      field: wantedField.current,
      dom_node: node,
      signal: controller.signal,
      on_ready: (params: LiveParams, redraw: () => void) => {
        live.current = { params, redraw };
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
      live.current = null;
      node.replaceChildren();
    };
  }, [key, height]);

  React.useEffect(() => {
    wantedFrame.current = frame;
    const current = live.current;
    if (!current) return;
    const count = current.params.time_points ?? 1;
    if (count < 2 || current.params.frame === frame) return;
    current.params.frame = ((frame % count) + count) % count;
    current.redraw();
  }, [frame]);

  React.useEffect(() => {
    wantedField.current = field;
    const current = live.current;
    if (!current || !field || current.params.field === field) return;
    // silently ignoring an unknown field would leave the colour bar labelled
    // with one quantity while showing another
    if (!current.params.data?.fields[field]) {
      console.warn(`3D viewer: bundle has no field "${field}"`);
      return;
    }
    current.params.field = field;
    current.redraw();
  }, [field]);

  // the height is reserved here as well as inside the viewer, so a figure does
  // not reflow while its bundle is still loading
  return <div ref={ref} className={className} style={{ minHeight: height }} />;
}
