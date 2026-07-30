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

# (field name, nodes key, vectors key, unit, factor from SI to display unit)
FIELDS = [
    ("measured deformations", "mesh_piv/0/nodes.npy", "mesh_piv/0/displacements_measured.npy", "µm", 1e6),
    ("target deformations", "solvers/0/mesh/nodes.npy", "solvers/0/mesh/displacements_target.npy", "µm", 1e6),
    ("fitted deformations", "solvers/0/mesh/nodes.npy", "solvers/0/mesh/displacements.npy", "µm", 1e6),
    ("fitted forces", "solvers/0/mesh/nodes.npy", "solvers/0/mesh/forces.npy", "nN", 1e9),
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


def encode_field(
    nodes: np.ndarray,
    vectors: np.ndarray,
    max_arrows: int,
    clip: float | None = None,
    force_quantised: bool = False,
):
    """Encode one vector field. Returns (payload bytes, metadata dict)."""
    vectors = np.nan_to_num(np.asarray(vectors, dtype=np.float64))
    magnitude = np.linalg.norm(vectors, axis=1)
    peak = float(magnitude.max())
    if peak <= 0:
        return b"", None

    keep = np.argsort(magnitude)[::-1][: min(max_arrows, len(magnitude))]
    keep = np.sort(keep[magnitude[keep] > 0])
    kept_vectors = vectors[keep]
    kept_magnitude = magnitude[keep]

    clipped = 0
    if clip is not None:
        # traction force fields are heavy tailed: a handful of nodes can be
        # thousands of times longer than the rest, which leaves the viewer
        # showing two huge arrows and nothing else. Saturating at a percentile
        # is the same thing a colorbar range does.
        limit = float(np.percentile(kept_magnitude, clip))
        if limit > 0:
            over = kept_magnitude > limit
            clipped = int(over.sum())
            kept_vectors = np.where(
                over[:, None], kept_vectors * (limit / np.maximum(kept_magnitude, 1e-300))[:, None], kept_vectors
            )
            kept_magnitude = np.minimum(kept_magnitude, limit)
            peak = limit

    direction = octahedral_encode(kept_vectors)
    quantised = np.clip(np.round(np.sqrt(kept_magnitude / peak) * 255), 0, 255).astype(np.uint8)

    grid = None if force_quantised else detect_grid(nodes)
    parts = []
    if grid is not None:
        # sorted indices, so consecutive deltas stay small and compress well
        deltas = np.diff(np.concatenate([[0], keep])).astype(np.uint32)
        parts.append(split_bytes(deltas, 2))
        positions = None
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
        "total": int(len(magnitude)),
        "max": peak,
        "clipped": clipped,
        "layout": "grid" if grid is not None else "quantised",
        "error": {"mean": float(error.mean()), "max": float(error.max())},
        # what the same field costs as deflated float32 .npy arrays, which is
        # what the viewer used to download
        "baseline": baseline_size(nodes, vectors),
    }
    if positions is not None:
        meta["positions"] = positions
    return payload, meta


def build_bundle(result: Result, max_arrows: int, clip: float | None, only: list[str] | None):
    fields = {}
    grids = []
    blocks = []
    offset = 0
    dropped = []

    for name, nodes_key, vectors_key, unit, factor in FIELDS:
        if only and name not in only:
            continue
        if not (result.has(nodes_key) and result.has(vectors_key)):
            dropped.append(f"{name} (missing in result file)")
            continue
        nodes = np.asarray(result.array(nodes_key), dtype=np.float64)
        vectors = result.array(vectors_key)
        if name == "fitted forces" and result.has("solvers/0/mesh/regularisation_mask.npy"):
            # forces are only meaningful inside the regularisation region, and
            # they are reported with the opposite sign of what we draw
            mask = result.array("solvers/0/mesh/regularisation_mask.npy")
            vectors = -np.asarray(vectors, dtype=np.float64) * np.asarray(mask, dtype=np.float64)[:, None]

        payload, meta = encode_field(nodes, vectors, max_arrows, clip)
        if meta is None:
            dropped.append(f"{name} (all zero)")
            continue

        if meta["layout"] == "grid":
            shape, origin, spacing = detect_grid(nodes)
            grid = {"shape": shape, "origin": origin, "spacing": spacing}
            if grid not in grids:
                grids.append(grid)
            meta["grid"] = grids.index(grid)

        meta.update({"unit": unit, "factor": factor, "offset": offset, "length": len(payload)})
        fields[name] = meta
        blocks.append(payload)
        offset += len(payload)

    if not fields:
        raise SystemExit("no exportable vector fields found in the result file")

    header = {"version": 1, "grids": grids, "fields": fields}
    header_bytes = json.dumps(header).encode("utf-8")
    padding = (-len(header_bytes)) % 4
    header_bytes += b" " * padding

    raw = MAGIC + len(header_bytes).to_bytes(4, "little") + header_bytes + b"".join(blocks)
    return raw, header, dropped


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
    args = parser.parse_args(argv)

    result = Result(args.input)
    raw, header, dropped = build_bundle(result, args.max_arrows, args.clip, args.field)
    compressed = gzip.compress(raw, 9)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_bytes(compressed)

    print(f"{args.input.name} -> {args.output}")
    for grid in header["grids"]:
        print(f"  grid {grid['shape']} (positions implicit)")
    for name, meta in header["fields"].items():
        print(
            f"  {name:<24} {meta['count']:>6}/{meta['total']} arrows  max {meta['max'] * meta['factor']:.3g} {meta['unit']}"
            f"  {meta['length'] / meta['count']:.1f} B/arrow"
            f"  error {meta['error']['mean'] * 100:.3f}% mean / {meta['error']['max'] * 100:.3f}% peak"
            + (f"  ({meta['clipped']} clipped)" if meta["clipped"] else "")
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
