/**
 * Shared factual content for the landing page designs.
 *
 * These pages double as material sent to pharma companies, so everything here
 * has to be defensible. Claims are drawn from the Nature Physics paper or
 * measured directly from the exported bundles in public/data. Anything we
 * cannot yet back up lives in PLACEHOLDERS and is labelled as such in the UI.
 */

export const PAPER = {
  title:
    "Dynamic traction force measurements of migrating immune cells in 3D biopolymer matrices",
  journal: "Nature Physics",
  year: 2024,
  doi: "10.1038/s41567-024-02632-8",
  url: "https://www.nature.com/articles/s41567-024-02632-8",
  preprintUrl: "https://www.biorxiv.org/content/10.1101/2022.11.16.516758v1",
  authors:
    "Böhringer D, Cóndor M, Bischof L, Czerwinski T, Gampl N, Ngo PA, Bauer A, Voskens C, López-Posadas R, Franze K, Budday S, Mark C, Fabry B, Gerum R",
  shortAuthors: "Böhringer et al.",
  abstract:
    "Immune cells such as natural killer (NK) cells migrate with high speeds of several µm/min through dense tissue, but the traction forces are unknown. We present a method to measure dynamic traction forces of fast migrating cells in non-linear biopolymer matrices. The method accounts for the mechanical non-linearity of the 3D tissue matrix and can be applied to time series of confocal or bright-field image stacks. The method is highly sensitive over a large range of forces and object sizes, from ∼1 nN for axon growth cones up to ∼10 µN for mouse intestinal organoids. We find that NK cells display bursts of large traction forces that increase with matrix stiffness and facilitate migration through tight constrictions.",
} as const;

/** Claims that come straight from the paper, safe to put in front of a client. */
export const CLAIMS = [
  {
    headline: "1 nN to 10 µN",
    body: "Four orders of magnitude, from a single axon growth cone up to a whole mouse intestinal organoid — one method across the range.",
  },
  {
    headline: "Non-linear matrices",
    body: "Collagen, fibrin and Matrigel stiffen as they are strained. The material model accounts for that instead of assuming linear elasticity.",
  },
  {
    headline: "Bright-field is enough",
    body: "Works on time series of confocal or bright-field image stacks, so cells do not need fluorescent labelling to be measured.",
  },
  {
    headline: "Forces resolved in time",
    body: "Fast migrating cells are tracked frame by frame, which is what exposed the NK cell force bursts in the first place.",
  },
] as const;

/** The immuno-oncology narrative, the reason a pharma audience should care. */
export const IMMUNO = {
  finding:
    "NK cells display bursts of large traction forces that increase with matrix stiffness and facilitate migration through tight constrictions.",
  speed: "several µm/min",
  why: [
    {
      title: "Stiff stroma is a barrier, not a backdrop",
      body: "Solid tumours sit behind dense, cross-linked matrix. A transferred cell has to physically push through it before any of its cytotoxic machinery matters.",
    },
    {
      title: "Force generation is measurable, per cell",
      body: "Traction force is a direct mechanical readout of whether a cell can do that pushing, measured in the 3D matrix rather than on flat plastic.",
    },
    {
      title: "Matrix stiffness is a controllable variable",
      body: "The same donor cells can be measured across a stiffness range, separating an intrinsic defect from an environment the cells simply cannot penetrate.",
    },
  ],
} as const;

export interface Dataset {
  id: string;
  bundle: string;
  label: string;
  subject: string;
  /** peak fitted traction force in nN, measured from the bundle */
  peakForce: number;
  /** peak fitted deformation in µm, measured from the bundle */
  peakDeformation: number;
  meshNodes: number;
  transferKB: number;
  blurb: string;
  frames?: number;
  /** seconds between frames */
  frameInterval?: number;
}

/**
 * Everything in public/data. Numbers are what the exporter reported, so they
 * can be quoted in the UI without hand-waving.
 */
export const DATASETS: Record<string, Dataset> = {
  nk92: {
    id: "nk92",
    bundle: "/data/nk92-immune-cell.sfb.gz",
    label: "NK92 natural killer cell",
    subject: "Immune cell in 3D collagen, imaged bright-field",
    peakForce: 0.87,
    peakDeformation: 0.321,
    meshNodes: 24389,
    transferKB: 34.5,
    blurb:
      "A natural killer cell pulling on the collagen network around it. Measured from bright-field stacks, so the cell carries no label.",
  },
  organoid: {
    id: "organoid",
    bundle: "/data/organoid.sfb.gz",
    label: "Intestinal organoid",
    subject: "Multicellular organoid contracting its matrix",
    peakForce: 61.3,
    peakDeformation: 8.85,
    meshNodes: 15625,
    transferKB: 27.4,
    blurb:
      "A whole organoid contracting the surrounding gel — two orders of magnitude above a single immune cell, measured the same way.",
  },
  cell004: {
    id: "cell004",
    bundle: "/data/single-cell-004.sfb.gz",
    label: "Fibroblast — position 4",
    subject: "Single cell traction force microscopy",
    peakForce: 47.7,
    peakDeformation: 8.38,
    meshNodes: 15625,
    transferKB: 35.9,
    blurb: "One of three cells from the same experiment, showing cell-to-cell spread.",
  },
  cell007: {
    id: "cell007",
    bundle: "/data/single-cell-007.sfb.gz",
    label: "Fibroblast — position 7",
    subject: "Single cell traction force microscopy",
    peakForce: 77.2,
    peakDeformation: 10.8,
    meshNodes: 15625,
    transferKB: 34.6,
    blurb: "The classic three-lobed contraction pattern of a spread fibroblast.",
  },
  cell008: {
    id: "cell008",
    bundle: "/data/single-cell-008.sfb.gz",
    label: "Fibroblast — position 8",
    subject: "Single cell traction force microscopy",
    peakForce: 126,
    peakDeformation: 10.5,
    meshNodes: 15625,
    transferKB: 33.2,
    blurb: "The strongest of the three cells, at 2.6x the traction of position 4.",
  },
  dynamic: {
    id: "dynamic",
    bundle: "/data/dynamic-migration.sfb.gz",
    label: "Migrating cell, 23 min",
    subject: "Time-resolved traction forces",
    peakForce: 0.893,
    peakDeformation: 1.66,
    meshNodes: 24389,
    transferKB: 200.7,
    frames: 23,
    frameInterval: 60,
    blurb:
      "23 consecutive time points, one per minute. The force trace peaks at minute 4 and settles back — a burst, not a steady pull.",
  },
};

/**
 * Peak traction force per frame for the dynamic dataset, in nN, read out of the
 * bundle header. Frame n is minute n.
 */
export const FORCE_TRACE = [
  0.634, 0.551, 0.512, 0.477, 0.893, 0.413, 0.302, 0.423, 0.501, 0.386, 0.328,
  0.315, 0.479, 0.416, 0.248, 0.305, 0.363, 0.33, 0.35, 0.354, 0.383, 0.065,
  0.056,
];

/** Total strain energy stored in the matrix per frame, in femtojoules. */
export const ENERGY_TRACE = [
  56.76, 47.75, 32.04, 34.0, 31.38, 19.38, 17.39, 15.03, 12.18, 11.74, 10.37,
  8.76, 10.38, 10.5, 10.91, 14.11, 17.4, 19.02, 21.55, 23.62, 25.53, 13.06,
  14.38,
];

/** Services the group already offers, from the current saenopy.com copy. */
export const SERVICES = [
  "Implementation assistance for your specific research needs",
  "Custom feature development and integration",
  "Training and workshops for your research team",
  "Ongoing support and troubleshooting",
] as const;

/**
 * Things we would need real data or a real engagement to claim. Every design
 * that shows one of these must label it visibly as a placeholder, so nothing
 * unverified goes out to a client by accident.
 */
export const PLACEHOLDERS = {
  note: "Placeholder — real data available on request",
  panels: [
    {
      title: "Donor-to-donor variability",
      body: "Traction force distributions across NK cell donors, to separate product variability from assay noise.",
    },
    {
      title: "Stiffness response curve",
      body: "Force output measured across a matrix stiffness range, the experiment behind the paper's stiffness finding.",
    },
    {
      title: "Compound screen",
      body: "Mechanical phenotype before and after treatment, as a dose-response readout.",
    },
    {
      title: "Patient-derived material",
      body: "Primary cells in patient-derived matrix, matched to the tumour they would have to enter.",
    },
  ],
} as const;

export const LINKS = {
  github: "https://github.com/rgerum/saenopy/",
  docs: "https://saenopy.readthedocs.io",
  site: "https://saenopy.com",
  contact: "mailto:richard.gerum@protonmail.com",
} as const;
