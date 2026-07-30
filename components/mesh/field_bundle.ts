/**
 * Reader for the compact vector-field bundles produced by
 * `scripts/export_field_bundle.py`.
 *
 * A bundle stores each arrow in 5 bytes (grid index, octahedral direction,
 * sqrt-quantised magnitude) instead of the 24 bytes a float32 node/vector pair
 * costs, and drops the node coordinates entirely for regular grids. The file
 * itself is gzipped and unpacked here rather than by the server, so the
 * transfer size does not depend on how the site is hosted.
 *
 * The decoded fields imitate the shape of `loadNpy` results, so the viewer can
 * consume them through the same code path as raw `.npy` files.
 */

const MAGIC = "SFB1";

export type NpyLike = Float32Array & {
  header: { shape: [number, number]; fortran_order: boolean; descr: string };
};

export interface BundleField {
  nodes: NpyLike;
  vectors: NpyLike;
  /** arrows kept in the bundle */
  count: number;
  /** arrows in the original mesh */
  total: number;
  unit: string;
  factor: number;
  /** largest magnitude in SI units */
  max: number;
  /** what this field costs as deflated float32 .npy arrays */
  baseline: number;
}

export interface Bundle {
  fields: Record<string, BundleField>;
  /** size of the file as it came over the wire */
  transferBytes: number;
  /** size after decompression */
  rawBytes: number;
  /** combined deflated float32 .npy size of all fields */
  baselineBytes: number;
}

interface GridHeader {
  shape: [number, number, number];
  origin: [number, number, number];
  spacing: [number, number, number];
}

interface FieldHeader {
  count: number;
  total: number;
  baseline: number;
  max: number;
  unit: string;
  factor: number;
  offset: number;
  length: number;
  layout: "grid" | "quantised";
  grid?: number;
  positions?: { origin: [number, number, number]; span: [number, number, number] };
}

function asNpyLike(data: Float32Array, rows: number): NpyLike {
  const out = data as NpyLike;
  out.header = { shape: [rows, 3], fortran_order: false, descr: "<f4" };
  return out;
}

/** Inverse of the octahedral direction encoding, for one arrow. */
function decodeDirection(ex: number, ey: number, out: Float32Array, at: number) {
  let x = (ex / 255) * 2 - 1;
  let y = (ey / 255) * 2 - 1;
  const z = 1 - Math.abs(x) - Math.abs(y);
  if (z < 0) {
    // fold the lower hemisphere back out of the octahedron's outer triangles
    x -= Math.sign(x || 1) * -z;
    y -= Math.sign(y || 1) * -z;
  }
  const len = Math.hypot(x, y, z) || 1;
  out[at] = x / len;
  out[at + 1] = y / len;
  out[at + 2] = z / len;
}

function decodeField(bytes: Uint8Array, field: FieldHeader, grids: GridHeader[]): BundleField {
  const n = field.count;
  const positions = new Float32Array(n * 3);
  const vectors = new Float32Array(n * 3);
  let cursor = 0;

  if (field.layout === "grid") {
    const grid = grids[field.grid ?? 0];
    const [, sy, sz] = grid.shape;
    const hi = bytes.subarray(cursor, cursor + n);
    const lo = bytes.subarray(cursor + n, cursor + 2 * n);
    cursor += 2 * n;
    let index = 0;
    for (let i = 0; i < n; i++) {
      index += (hi[i] << 8) | lo[i];
      const ix = Math.floor(index / (sy * sz));
      const iy = Math.floor(index / sz) % sy;
      const iz = index % sz;
      positions[i * 3] = grid.origin[0] + grid.spacing[0] * ix;
      positions[i * 3 + 1] = grid.origin[1] + grid.spacing[1] * iy;
      positions[i * 3 + 2] = grid.origin[2] + grid.spacing[2] * iz;
    }
  } else {
    const { origin, span } = field.positions!;
    for (let axis = 0; axis < 3; axis++) {
      const hi = bytes.subarray(cursor, cursor + n);
      const lo = bytes.subarray(cursor + n, cursor + 2 * n);
      cursor += 2 * n;
      for (let i = 0; i < n; i++) {
        positions[i * 3 + axis] = origin[axis] + (((hi[i] << 8) | lo[i]) / 65535) * span[axis];
      }
    }
  }

  const octX = bytes.subarray(cursor, cursor + n);
  const octY = bytes.subarray(cursor + n, cursor + 2 * n);
  const mag = bytes.subarray(cursor + 2 * n, cursor + 3 * n);

  for (let i = 0; i < n; i++) {
    decodeDirection(octX[i], octY[i], vectors, i * 3);
    // magnitudes are stored in sqrt space so the quantisation steps are finest
    // for the short arrows, where a fixed step would be most visible
    const q = mag[i] / 255;
    const length = q * q * field.max;
    vectors[i * 3] *= length;
    vectors[i * 3 + 1] *= length;
    vectors[i * 3 + 2] *= length;
  }

  return {
    nodes: asNpyLike(positions, n),
    vectors: asNpyLike(vectors, n),
    count: n,
    total: field.total,
    unit: field.unit,
    factor: field.factor,
    max: field.max,
    baseline: field.baseline,
  };
}

async function gunzip(buffer: ArrayBuffer): Promise<ArrayBuffer> {
  if (typeof DecompressionStream === "undefined") {
    throw new Error("this browser cannot decompress the field bundle (no DecompressionStream)");
  }
  const stream = new Blob([buffer]).stream().pipeThrough(new DecompressionStream("gzip"));
  return await new Response(stream).arrayBuffer();
}

export async function loadFieldBundle(url: string): Promise<Bundle> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`could not load field bundle ${url}: ${response.status}`);
  const compressed = await response.arrayBuffer();

  // a host that already applied Content-Encoding: gzip hands us plain bytes
  const view = new Uint8Array(compressed);
  const isGzip = view[0] === 0x1f && view[1] === 0x8b;
  const raw = isGzip ? await gunzip(compressed) : compressed;

  const rawView = new Uint8Array(raw);
  const magic = String.fromCharCode(...rawView.subarray(0, 4));
  if (magic !== MAGIC) throw new Error(`${url} is not a saenopy field bundle (got "${magic}")`);

  const headerLength = new DataView(raw).getUint32(4, true);
  const header = JSON.parse(new TextDecoder().decode(rawView.subarray(8, 8 + headerLength)));
  const body = rawView.subarray(8 + headerLength);

  const fields: Record<string, BundleField> = {};
  for (const [name, field] of Object.entries(header.fields as Record<string, FieldHeader>)) {
    fields[name] = decodeField(body.subarray(field.offset, field.offset + field.length), field, header.grids);
  }

  return {
    fields,
    transferBytes: compressed.byteLength,
    rawBytes: raw.byteLength,
    baselineBytes: Object.values(fields).reduce((sum, f) => sum + f.baseline, 0),
  };
}
