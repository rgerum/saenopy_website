#!/usr/bin/env python3
"""Export a saenopy result into a compact vector-field bundle for the web viewer.

Reads a ``.saenopy`` file directly (it is a numpy ``.npz`` archive), so saenopy
itself does not need to be installed -- only numpy.

The bundle trades a small, bounded amount of visual precision for roughly a
15x size reduction compared to shipping float32 ``.npy`` arrays in a zip:

* node positions are dropped entirely when the mesh is a regular grid and
  rebuilt from ``origin + spacing * index``
* only the ``--max-arrows`` largest vectors are kept; the rest are far below one
  pixel of arrow length
* each direction is octahedron-encoded into 2 bytes
* each magnitude is stored as one byte in sqrt space, which puts the fine
  quantisation steps where the small (but still visible) arrows are
* the whole file is gzipped; byte planes are stored separately so that the
  high bytes of each array compress as a run

Usage::

    python scripts/export_field_bundle.py <result.saenopy> -o public/data/cell.sfb.gz
"""

from __future__ import annotations

import argparse
import gzip
import io
import json
import sys
import zipfile
import zlib
from pathlib import Path

import numpy as np

MAGIC = b"SFB1"

# (field name, nodes key, vectors key, unit, factor from SI to display unit);
# {t} is the time point index
FIELDS = [
    ("measured deformations", "mesh_piv/{t}/nodes.npy", "mesh_piv/{t}/displacements_measured.npy", "µm", 1e6),
    ("target deformations", "solvers/{t}/mesh/nodes.npy", "solvers/{t}/mesh/displacements_target.npy", "µm", 1e6),
    ("fitted deformations", "solvers/{t}/mesh/nodes.npy", "solvers/{t}/mesh/displacements.npy", "µm", 1e6),
    ("fitted forces", "solvers/{t}/mesh/nodes.npy", "solvers/{t}/mesh/forces.npy", "nN", 1e9),
]


class Result:
    """Minimal reader for the npz-based .saenopy container."""

    def __init__(self, path: Path):
        self.zip = zipfile.ZipFile(path)
        self.names = set(self.zip.namelist())

    def has(self, key: str) -> bool:
        return key in self.names

    def array(self, key: str) -> np.ndarray:
        return np.load(io.BytesIO(self.zip.read(key)), allow_pickle=False)

    def scalar(self, key: str) -> float | None:
        """A scalar entry, or None -- saenopy writes missing values as '__NONE__'."""
        if not self.has(key):
            return None
        value = self.array(key)
        if value.dtype.kind in "US":
            return None
        return float(value)


def octahedral_encode(vectors: np.ndarray) -> np.ndarray:
    """Map unit vectors onto the [0, 255]^2 octahedron, 2 bytes per direction."""
    n = vectors / np.maximum(np.abs(vectors).sum(axis=1, keepdims=True), 1e-300)
    x, y = n[:, 0].copy(), n[:, 1].copy()
    lower = n[:, 2] < 0
    fx, fy = x.copy(), y.copy()
    x[lower] = (1 - np.abs(fy[lower])) * np.where(fx[lower] >= 0, 1.0, -1.0)
    y[lower] = (1 - np.abs(fx[lower])) * np.where(fy[lower] >= 0, 1.0, -1.0)
    return np.clip(np.round((np.stack([x, y], axis=1) * 0.5 + 0.5) * 255), 0, 255).astype(np.uint8)


def octahedral_decode(encoded: np.ndarray) -> np.ndarray:
    """Inverse of :func:`octahedral_encode`, used to report the encoding error."""
    f = encoded.astype(np.float64) / 255 * 2 - 1
    x, y = f[:, 0].copy(), f[:, 1].copy()
    z = 1 - np.abs(x) - np.abs(y)
    t = np.maximum(-z, 0)
    x -= np.where(x >= 0, 1.0, -1.0) * t
    y -= np.where(y >= 0, 1.0, -1.0) * t
    v = np.stack([x, y, z], axis=1)
    return v / np.linalg.norm(v, axis=1, keepdims=True)


def detect_grid(nodes: np.ndarray):
    """Return (shape, origin, spacing) if the nodes are a C-ordered regular grid."""
    axes = [np.unique(nodes[:, i]) for i in range(3)]
    shape = [len(a) for a in axes]
    if int(np.prod(shape)) != len(nodes):
        return None
    for a in axes:
        if len(a) < 2:
            return None
        steps = np.diff(a)
        if not np.allclose(steps, steps[0], rtol=1e-6, atol=0):
            return None
    index = np.arange(len(nodes))
    rebuilt = np.stack(
        [
            axes[0][index // (shape[1] * shape[2])],
            axes[1][(index // shape[2]) % shape[1]],
            axes[2][index % shape[2]],
        ],
        axis=1,
    )
    if not np.allclose(rebuilt, nodes, rtol=0, atol=1e-12):
        return None
    origin = [float(a[0]) for a in axes]
    spacing = [float(a[1] - a[0]) for a in axes]
    return shape, origin, spacing


def split_bytes(values: np.ndarray, width: int) -> bytes:
    """Store a uint array as separate byte planes (big-endian, most significant first)."""
    planes = [((values >> (8 * i)) & 0xFF).astype(np.uint8) for i in reversed(range(width))]
    return np.concatenate(planes).tobytes()


def baseline_size(nodes: np.ndarray, vectors: np.ndarray) -> int:
    """Deflated size of the same field as a pair of float32 .npy arrays."""
    blob = b""
    for array in (nodes, vectors):
        buffer = io.BytesIO()
        np.save(buffer, np.asarray(array).astype(np.float32))
        blob += buffer.getvalue()
    return len(zlib.compress(blob, 9))


def select_arrows(magnitude: np.ndarray, max_arrows: int) -> np.ndarray:
    """Indices of the largest arrows, in ascending order."""
    order = np.argsort(magnitude)[::-1][: min(max_arrows, len(magnitude))]
    return np.sort(order[magnitude[order] > 0])


def encode_frame(nodes: np.ndarray, vectors: np.ndarray, keep: np.ndarray, peak: float, force_quantised: bool):
    """Encode one time point of a field against a shared magnitude scale."""
    kept_vectors = np.asarray(vectors, dtype=np.float64)[keep]
    kept_magnitude = np.linalg.norm(kept_vectors, axis=1)

    over = kept_magnitude > peak
    clipped = int(over.sum())
    if clipped:
        kept_vectors = np.where(
            over[:, None], kept_vectors * (peak / np.maximum(kept_magnitude, 1e-300))[:, None], kept_vectors
        )
        kept_magnitude = np.minimum(kept_magnitude, peak)

    direction = octahedral_encode(kept_vectors)
    quantised = np.clip(np.round(np.sqrt(kept_magnitude / peak) * 255), 0, 255).astype(np.uint8)

    grid = None if force_quantised else detect_grid(nodes)
    parts = []
    positions = None
    if grid is not None:
        # sorted indices, so consecutive deltas stay small and compress well
        deltas = np.diff(np.concatenate([[0], keep])).astype(np.uint32)
        parts.append(split_bytes(deltas, 2))
    else:
        lower = nodes.min(axis=0)
        upper = nodes.max(axis=0)
        span = np.where(upper > lower, upper - lower, 1.0)
        q = np.clip(np.round((nodes[keep] - lower) / span * 65535), 0, 65535).astype(np.uint32)
        for axis in range(3):
            parts.append(split_bytes(q[:, axis], 2))
        positions = {"origin": lower.tolist(), "span": span.tolist()}

    parts.append(direction[:, 0].tobytes())
    parts.append(direction[:, 1].tobytes())
    parts.append(quantised.tobytes())
    payload = b"".join(parts)

    decoded = octahedral_decode(direction) * ((quantised / 255.0) ** 2 * peak)[:, None]
    error = np.linalg.norm(decoded - kept_vectors, axis=1) / peak

    meta = {
        "count": int(len(keep)),
        "clipped": clipped,
        "layout": "grid" if grid is not None else "quantised",
        "error": {"mean": float(error.mean()), "max": float(error.max())},
    }
    if positions is not None:
        meta["positions"] = positions
    return payload, meta


def load_vectors(result: Result, name: str, vectors_key: str, t: int) -> np.ndarray:
    vectors = np.nan_to_num(np.asarray(result.array(vectors_key), dtype=np.float64))
    mask_key = f"solvers/{t}/mesh/regularisation_mask.npy"
    if name == "fitted forces" and result.has(mask_key):
        # forces are only meaningful inside the regularisation region, and they
        # are reported with the opposite sign of what we draw
        vectors = -vectors * np.asarray(result.array(mask_key), dtype=np.float64)[:, None]
    return vectors


def time_points(result: Result) -> list[int]:
    """Solver time points present in the result, in order."""
    found = set()
    for key in result.names:
        parts = key.split("/")
        if len(parts) > 2 and parts[0] == "solvers" and parts[2] == "mesh" and parts[1].isdigit():
            found.add(int(parts[1]))
    return sorted(found)


def build_bundle(
    result: Result,
    max_arrows: int,
    clip: float | None,
    only: list[str] | None,
    frames: int = 1,
):
    fields = {}
    grids = []
    blocks = []
    offset = 0
    dropped = []

    available = time_points(result) or [0]
    used_times = available[:frames] if frames > 1 else [available[0]]

    for name, nodes_template, vectors_template, unit, factor in FIELDS:
        if only and name not in only:
            continue
        keys = [(nodes_template.format(t=t), vectors_template.format(t=t)) for t in used_times]
        if not all(result.has(n) and result.has(v) for n, v in keys):
            dropped.append(f"{name} (missing in result file)")
            continue

        nodes = np.asarray(result.array(keys[0][0]), dtype=np.float64)
        series = [load_vectors(result, name, v, t) for (_, v), t in zip(keys, used_times)]
        if any(len(v) != len(nodes) for v in series):
            dropped.append(f"{name} (mesh changes between time points)")
            continue

        # one arrow set and one magnitude scale for every frame, so the
        # animation neither pops nor reshuffles its colours
        mean_magnitude = np.mean([np.linalg.norm(v, axis=1) for v in series], axis=0)
        keep = select_arrows(mean_magnitude, max_arrows)
        if len(keep) == 0:
            dropped.append(f"{name} (all zero)")
            continue
        pooled = np.concatenate([np.linalg.norm(v[keep], axis=1) for v in series])
        peak = float(np.percentile(pooled, clip)) if clip is not None else float(pooled.max())
        if peak <= 0:
            dropped.append(f"{name} (all zero)")
            continue

        force_quantised = False
        if detect_grid(nodes) is not None:
            shape, origin, spacing = detect_grid(nodes)
            grid = {"shape": shape, "origin": origin, "spacing": spacing}
            if grid not in grids:
                grids.append(grid)
            grid_index = grids.index(grid)
        else:
            grid_index = None

        frame_meta = []
        layout = None
        positions = None
        for vectors in series:
            payload, meta = encode_frame(nodes, vectors, keep, peak, force_quantised)
            layout = meta["layout"]
            positions = meta.get("positions", positions)
            frame_meta.append(
                {
                    "offset": offset,
                    "length": len(payload),
                    "clipped": meta["clipped"],
                    "error": meta["error"],
                    "max": float(np.linalg.norm(vectors[keep], axis=1).max()),
                }
            )
            blocks.append(payload)
            offset += len(payload)

        field = {
            "count": int(len(keep)),
            "total": int(len(nodes)),
            "max": peak,
            "unit": unit,
            "factor": factor,
            "layout": layout,
            "frames": frame_meta,
            "baseline": baseline_size(nodes, series[0]) * len(series),
        }
        if grid_index is not None:
            field["grid"] = grid_index
        if positions is not None:
            field["positions"] = positions
        fields[name] = field

    if not fields:
        raise SystemExit("no exportable vector fields found in the result file")

    header = {
        "version": 2,
        "grids": grids,
        "fields": fields,
        "timePoints": len(used_times),
        "timeDelta": result.scalar("time_delta.npy"),
        "series": frame_series(result, used_times),
    }
    header_bytes = json.dumps(header).encode("utf-8")
    padding = (-len(header_bytes)) % 4
    header_bytes += b" " * padding

    raw = MAGIC + len(header_bytes).to_bytes(4, "little") + header_bytes + b"".join(blocks)
    return raw, header, dropped


def frame_series(result: Result, used_times: list[int]) -> dict:
    """Scalar quantities per time point, handy for plotting alongside the field."""
    energy = []
    peak_force = []
    for t in used_times:
        energy_key = f"solvers/{t}/mesh/strain_energy.npy"
        energy.append(float(np.sum(result.array(energy_key))) if result.has(energy_key) else None)
        force_key = f"solvers/{t}/mesh/forces.npy"
        if result.has(force_key):
            forces = load_vectors(result, "fitted forces", force_key, t)
            peak_force.append(float(np.linalg.norm(forces, axis=1).max()))
        else:
            peak_force.append(None)
    return {"strainEnergy": energy, "peakForce": peak_force}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("input", type=Path, help="a .saenopy result file")
    parser.add_argument("-o", "--output", type=Path, required=True, help="output path, e.g. public/data/cell.sfb.gz")
    parser.add_argument(
        "--max-arrows",
        type=int,
        default=4000,
        help="keep at most this many arrows per field, largest first (default: 4000)",
    )
    parser.add_argument(
        "--clip",
        type=float,
        default=None,
        help="saturate magnitudes above this percentile of the kept arrows, so a few extreme\nnodes do not dwarf the rest (e.g. 98)",
    )
    parser.add_argument("--field", action="append", help="export only this field (repeatable)")
    parser.add_argument(
        "--frames",
        type=int,
        default=1,
        help="export this many solver time points as animation frames (default: 1)",
    )
    args = parser.parse_args(argv)

    result = Result(args.input)
    raw, header, dropped = build_bundle(result, args.max_arrows, args.clip, args.field, args.frames)
    compressed = gzip.compress(raw, 9)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_bytes(compressed)

    print(f"{args.input.name} -> {args.output}")
    for grid in header["grids"]:
        print(f"  grid {grid['shape']} (positions implicit)")
    if header["timePoints"] > 1:
        span = header["timePoints"] * (header["timeDelta"] or 0) / 60
        print(f"  {header['timePoints']} frames" + (f" over {span:.0f} min" if span else ""))
    for name, meta in header["fields"].items():
        bytes_per_arrow = sum(f["length"] for f in meta["frames"]) / (meta["count"] * len(meta["frames"]))
        worst = max(f["error"]["max"] for f in meta["frames"])
        mean = sum(f["error"]["mean"] for f in meta["frames"]) / len(meta["frames"])
        clipped = sum(f["clipped"] for f in meta["frames"])
        print(
            f"  {name:<24} {meta['count']:>6}/{meta['total']} arrows  max {meta['max'] * meta['factor']:.3g} {meta['unit']}"
            f"  {bytes_per_arrow:.1f} B/arrow"
            f"  error {mean * 100:.3f}% mean / {worst * 100:.3f}% peak"
            + (f"  ({clipped} clipped)" if clipped else "")
        )
    for item in dropped:
        print(f"  skipped {item}")
    baseline = sum(meta["baseline"] for meta in header["fields"].values())
    print(
        f"  {len(raw) / 1024:.1f} KB raw -> {len(compressed) / 1024:.1f} KB gzipped"
        f"  (deflated float32 .npy baseline: {baseline / 1024:.1f} KB, {baseline / len(compressed):.1f}x)"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
