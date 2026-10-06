"use client";

import React from "react";
import { DisplayMesh, type ViewerStats } from "@/components/mesh/display";

const BUNDLES = [
  {
    id: "cell",
    label: "Fibroblast",
    file: "/data/single-cell-007.sfb.gz",
    description:
      "Single cell traction force microscopy. Use the controls panel to switch between measured, target and fitted deformations and the fitted forces.",
    field: "fitted deformations",
    animations: [{ type: "rotate", speed: 6 }],
  },
  {
    id: "nk92",
    label: "NK92 immune cell",
    file: "/data/nk92-immune-cell.sfb.gz",
    description:
      "A natural killer cell measured from bright-field stacks, no fluorescent label. Peak traction is 0.87 nN, roughly a hundredth of the fibroblast.",
    field: "fitted deformations",
    animations: [{ type: "rotate", speed: 6 }],
  },
  {
    id: "organoid",
    label: "Intestinal organoid",
    file: "/data/organoid.sfb.gz",
    description:
      "A whole organoid contracting the gel around it, two orders of magnitude above a single immune cell.",
    field: "fitted deformations",
    animations: [{ type: "rotate", speed: 6 }],
  },
  {
    id: "dynamic",
    label: "Migration, 23 min",
    file: "/data/dynamic-migration.sfb.gz",
    description:
      "23 time points at one minute apart, played back as an animation. Every frame is quantised against one shared magnitude scale so the colours mean the same thing throughout.",
    field: "fitted deformations",
    animations: [
      { type: "rotate", speed: 4 },
      { type: "time", fps: 4 },
    ],
  },
];

function kb(bytes: number) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function Test3DPage() {
  const [bundle, setBundle] = React.useState(BUNDLES[0]);
  const [stats, setStats] = React.useState<ViewerStats | null>(null);

  const onStats = React.useCallback((s: ViewerStats) => setStats(s), []);

  // the preset lives in the hash so a particular view can be linked to
  React.useEffect(() => {
    const fromHash = () => {
      const found = BUNDLES.find((b) => b.id === window.location.hash.slice(1));
      if (found) setBundle(found);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  React.useEffect(() => setStats(null), [bundle]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">3D force field viewer</h1>
        <p className="text-muted-foreground max-w-2xl">
          Test page for the interactive traction force field. Drag to rotate, scroll
          to zoom, and open the panel in the top right to switch field, colormap and
          arrow scale.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {BUNDLES.map((b) => (
          <button
            key={b.id}
            onClick={() => {
              setBundle(b);
              window.history.replaceState(null, "", `#${b.id}`);
            }}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              b.id === bundle.id
                ? "bg-foreground text-background border-foreground"
                : "hover:bg-muted"
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground -mt-4">{bundle.description}</p>

      <div className="rounded-xl border bg-slate-950 overflow-hidden">
        <DisplayMesh
          key={bundle.id}
          bundle={bundle.file}
          field={bundle.field}
          height="560px"
          zoom={1.1}
          cube="field"
          cube_color={0x64748b}
          background="transparent"
          logo_width="0px"
          mouse_control
          show_controls
          show_colormap
          animations={bundle.animations}
          onStats={onStats}
        />
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Transfer size</h2>
        {stats ? (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <Stat label="Downloaded" value={kb(stats.transferBytes)} />
              <Stat label="After decompression" value={kb(stats.rawBytes)} />
              <Stat
                label="float32 .npy equivalent"
                value={kb(stats.baselineBytes)}
                note={`${(stats.baselineBytes / stats.transferBytes).toFixed(1)}× larger`}
              />
            </div>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 font-medium">Field</th>
                  <th className="py-2 font-medium">Arrows drawn</th>
                  <th className="py-2 font-medium">Mesh nodes</th>
                  <th className="py-2 font-medium">Peak magnitude</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats.fields).map(([name, f]) => (
                  <tr key={name} className="border-b last:border-0">
                    <td className="py-2">{name}</td>
                    <td className="py-2 tabular-nums">{f.count.toLocaleString()}</td>
                    <td className="py-2 tabular-nums text-muted-foreground">
                      {f.total.toLocaleString()}
                    </td>
                    <td className="py-2 tabular-nums">
                      {f.max.toPrecision(3)} {f.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Loading bundle…</p>
        )}
      </section>

      <section className="space-y-2 text-sm text-muted-foreground">
        <h2 className="text-xl font-semibold text-foreground">How the bundle is built</h2>
        <p>
          Node coordinates are dropped entirely — the solver mesh is a regular grid,
          so a position is rebuilt from{" "}
          <code className="text-foreground">origin + spacing × index</code>. Only the
          largest vectors are kept, since the rest are far shorter than one pixel.
          Each remaining arrow costs 5 bytes: a 2-byte delta-coded grid index, a
          2-byte octahedral direction, and a 1-byte magnitude stored in sqrt space so
          the fine quantisation steps land on the short arrows. Byte planes are stored
          separately so gzip sees long runs, and the file is gunzipped in the browser
          so the size does not depend on the host&apos;s compression settings. Across
          the shipped bundles the mean arrow error is 0.08–0.39% of the field&apos;s
          peak magnitude, and the worst single arrow is 1.33%.
        </p>
        <p>
          Regenerate with{" "}
          <code className="text-foreground">
            python scripts/export_field_bundle.py result.saenopy -o
            public/data/hero-deformations.sfb.gz --max-arrows 3000 --field
            &quot;fitted deformations&quot;
          </code>
          . Add <code className="text-foreground">--clip 92</code> for force
          fields.
        </p>
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      {note && <div className="text-xs text-muted-foreground mt-1">{note}</div>}
    </div>
  );
}
