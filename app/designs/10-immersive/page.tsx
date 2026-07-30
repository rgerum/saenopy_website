"use client";

/**
 * Design 10 — "Immersive".
 *
 * One continuous 3D scene fills the viewport as a living background. Scrolling
 * moves through full-height panels: the field stays, the words change, and the
 * field itself shifts underneath them. Closer to a title sequence than a page.
 *
 * Legibility over a moving WebGL scene is solved three ways at once:
 *   1. the field is pushed off-centre to the right on wide viewports, so the
 *      type column sits on quiet pixels rather than on live arrows,
 *   2. a fixed scrim layer (directional gradient + vignette + top/bottom rails)
 *      sits between the canvas and the copy,
 *   3. the headline and lead carry their own text shadows as a backstop.
 *
 * Only two WebGL contexts ever exist: the scene is double-buffered so a new
 * dataset can load behind the current one and cross-fade in, instead of the
 * canvas blanking mid-scroll. The retired layer is unmounted after the fade.
 */

import React from "react";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import { ArrowRight } from "lucide-react";

import { DisplayMesh } from "@/components/mesh/display";
import { cmaps } from "@/components/mesh/colormaps";
import {
  CLAIMS,
  DATASETS,
  FORCE_TRACE,
  IMMUNO,
  LINKS,
  PAPER,
  PLACEHOLDERS,
  SERVICES,
} from "@/lib/saenopy-content";
import styles from "./immersive.module.css";

const display = Archivo({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-immersive-display",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-immersive-mono",
  display: "swap",
});

/* -------------------------------------------------------------------------- */
/* scenes                                                                      */
/* -------------------------------------------------------------------------- */

interface SceneCfg {
  bundle: string;
  field: string;
  cmap: string;
  arrow_span: number;
  zoom: number;
  /** step through a multi-frame bundle as well as rotating */
  time?: boolean;
}

/**
 * The viewer scales its colour map from 0 to the global maximum of the field
 * (3d_viewer.mjs uses the bundle-wide max, not a per-frame one), so a legend
 * built from the peak values in DATASETS matches what is on screen.
 */
const TURBO = `linear-gradient(90deg, ${cmaps.turbo
  .filter((_, i) => i % 16 === 0 || i === cmaps.turbo.length - 1)
  .map((c) => `#${c.toString(16).padStart(6, "0")}`)
  .join(", ")})`;

/** Identity of a scene: two panels sharing one config never trigger a reload. */
const sceneId = (s: SceneCfg) =>
  `${s.bundle}|${s.field}|${s.cmap}|${s.arrow_span}|${s.zoom}|${s.time ?? false}`;

const NK_DEFORM: SceneCfg = {
  bundle: DATASETS.nk92.bundle,
  field: "fitted deformations",
  cmap: "turbo",
  arrow_span: 0.13,
  zoom: 1.15,
};

const NK_FORCE: SceneCfg = {
  bundle: DATASETS.nk92.bundle,
  field: "fitted forces",
  cmap: "turbo",
  arrow_span: 0.14,
  zoom: 1.15,
};

const ORGANOID: SceneCfg = {
  bundle: DATASETS.organoid.bundle,
  field: "fitted forces",
  cmap: "turbo",
  arrow_span: 0.15,
  zoom: 1.05,
};

const DYNAMIC: SceneCfg = {
  bundle: DATASETS.dynamic.bundle,
  field: "fitted forces",
  cmap: "turbo",
  arrow_span: 0.13,
  zoom: 1.1,
  time: true,
};

const FIBRO_STRAIN: SceneCfg = {
  bundle: DATASETS.cell008.bundle,
  field: "fitted deformations",
  cmap: "turbo",
  arrow_span: 0.14,
  zoom: 1.05,
};

/* cell007's fitted force field is a handful of arrows and reads as empty at
   full-bleed; its deformation field fills the frame. */
const FIBRO_STRAIN_2: SceneCfg = {
  bundle: DATASETS.cell007.bundle,
  field: "fitted deformations",
  cmap: "turbo",
  arrow_span: 0.11,
  zoom: 1.2,
};

/* -------------------------------------------------------------------------- */
/* panels                                                                      */
/* -------------------------------------------------------------------------- */

const peakIndex = FORCE_TRACE.indexOf(Math.max(...FORCE_TRACE));
const peakForce = FORCE_TRACE[peakIndex];
const dyn = DATASETS.dynamic;

interface Panel {
  id: string;
  nav: string;
  scene: SceneCfg;
  eyebrow: string;
  headline: string;
  variant?: "wordmark" | "mega";
  lead: string;
  note?: string;
  bullets?: string[];
  readout: { label: string; field: string; value: string };
}

const PANELS: Panel[] = [
  {
    id: "open",
    nav: "Saenopy",
    scene: NK_DEFORM,
    eyebrow: `${PAPER.journal} ${PAPER.year} — open source`,
    headline: "saenopy",
    variant: "wordmark",
    lead: "The forces a cell exerts on the 3D matrix around it, measured per cell in that matrix rather than on flat plastic.",
    readout: {
      label: DATASETS.nk92.label,
      field: NK_DEFORM.field,
      value: `${DATASETS.nk92.peakDeformation} µm`,
    },
  },
  {
    id: "range",
    nav: "Range",
    scene: ORGANOID,
    eyebrow: "Dynamic range",
    headline: CLAIMS[0].headline,
    variant: "mega",
    lead: CLAIMS[0].body,
    readout: {
      label: DATASETS.organoid.label,
      field: ORGANOID.field,
      value: `${DATASETS.organoid.peakForce} nN`,
    },
  },
  {
    id: "burst",
    nav: "Bursts",
    scene: DYNAMIC,
    eyebrow: "The finding",
    headline: "Bursts, not a steady pull.",
    lead: IMMUNO.finding,
    note: `${dyn.frames} time points, ${dyn.frameInterval} s apart — peak fitted traction force per frame.`,
    readout: {
      label: dyn.label,
      field: DYNAMIC.field,
      value: `${dyn.peakForce} nN`,
    },
  },
  {
    id: "label",
    nav: "Label-free",
    scene: NK_FORCE,
    eyebrow: "Sample preparation",
    headline: "No fluorescent label.",
    lead: CLAIMS[2].body,
    note: `${DATASETS.nk92.subject} — peak fitted force ${DATASETS.nk92.peakForce} nN.`,
    readout: {
      label: DATASETS.nk92.label,
      field: NK_FORCE.field,
      value: `${DATASETS.nk92.peakForce} nN`,
    },
  },
  {
    id: "matrix",
    nav: "Matrix",
    scene: FIBRO_STRAIN,
    eyebrow: "Material model",
    headline: "The matrix stiffens as it is strained.",
    lead: CLAIMS[1].body,
    note: `${DATASETS.cell008.label} — peak fitted deformation ${DATASETS.cell008.peakDeformation} µm.`,
    readout: {
      label: DATASETS.cell008.label,
      field: FIBRO_STRAIN.field,
      value: `${DATASETS.cell008.peakDeformation} µm`,
    },
  },
  {
    id: "stroma",
    nav: "Cell therapy",
    scene: FIBRO_STRAIN_2,
    eyebrow: "Cell therapy",
    headline: `${IMMUNO.why[0].title}.`,
    lead: IMMUNO.why[0].body,
    bullets: [IMMUNO.why[1].title, IMMUNO.why[2].title],
    readout: {
      label: DATASETS.cell007.label,
      field: FIBRO_STRAIN_2.field,
      value: `${DATASETS.cell007.peakDeformation} µm`,
    },
  },
  {
    id: "work",
    nav: "Work with us",
    scene: NK_DEFORM,
    eyebrow: "Work with us",
    headline: "Measure your cells.",
    lead: "Saenopy is open source and documented. The group behind the method also takes on collaborations:",
    readout: {
      label: DATASETS.nk92.label,
      field: NK_DEFORM.field,
      value: `${DATASETS.nk92.peakDeformation} µm`,
    },
  },
];

/* -------------------------------------------------------------------------- */
/* the force-trace sparkline (real per-frame numbers from FORCE_TRACE)         */
/* -------------------------------------------------------------------------- */

function ForceSpark() {
  const w = 320;
  const h = 62;
  const max = Math.max(...FORCE_TRACE);
  const points = FORCE_TRACE.map((v, i) => {
    const x = (i / (FORCE_TRACE.length - 1)) * w;
    const y = h - (v / max) * (h - 6) - 3;
    return [x, y] as const;
  });

  return (
    <>
      <svg
        className={styles.spark}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Peak fitted traction force per minute for ${dyn.label}, peaking at ${peakForce} nN in minute ${peakIndex}`}
      >
        <line className={styles.sparkAxis} x1={0} y1={h} x2={w} y2={h} />
        <polyline
          className={styles.sparkLine}
          points={points.map(([x, y]) => `${x},${y}`).join(" ")}
          vectorEffect="non-scaling-stroke"
        />
        <circle
          className={styles.sparkDot}
          cx={points[peakIndex][0]}
          cy={points[peakIndex][1]}
          r={3}
        />
      </svg>
      <div className={styles.sparkCaption}>
        <span>min 0</span>
        <span>
          {peakForce} nN at min {peakIndex}
        </span>
        <span>min {FORCE_TRACE.length - 1}</span>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* the persistent scene, double-buffered                                       */
/* -------------------------------------------------------------------------- */

function SceneLayer({
  cfg,
  visible,
  onLoaded,
}: {
  cfg: SceneCfg | null;
  visible: boolean;
  onLoaded: (id: string) => void;
}) {
  const id = cfg ? sceneId(cfg) : "";
  const handleStats = React.useCallback(() => onLoaded(id), [onLoaded, id]);

  if (!cfg) return null;

  return (
    <div className={`${styles.layer} ${visible ? styles.layerOn : ""}`}>
      <DisplayMesh
        bundle={cfg.bundle}
        field={cfg.field}
        cmap={cfg.cmap}
        arrow_span={cfg.arrow_span}
        zoom={cfg.zoom}
        height="100%"
        cube="field"
        cube_color={0x2f3d5c}
        background="transparent"
        logo_width="0px"
        mouse_control={false}
        show_controls={false}
        show_colormap={false}
        animations={
          cfg.time
            ? [
                { type: "rotate", speed: 4 },
                { type: "time", fps: 2.5 },
              ]
            : [{ type: "rotate", speed: 4 }]
        }
        onStats={handleStats}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export default function ImmersivePage() {
  const [active, setActive] = React.useState(0);
  const [slotA, setSlotA] = React.useState<SceneCfg | null>(PANELS[0].scene);
  const [slotB, setSlotB] = React.useState<SceneCfg | null>(null);
  const [front, setFront] = React.useState<0 | 1>(0);

  const panelRefs = React.useRef<(HTMLElement | null)[]>([]);
  const targetIdRef = React.useRef(sceneId(PANELS[0].scene));
  const slotARef = React.useRef(slotA);
  const slotBRef = React.useRef(slotB);

  React.useEffect(() => {
    slotARef.current = slotA;
    slotBRef.current = slotB;
  }, [slotA, slotB]);

  /* which panel owns the viewport */
  React.useEffect(() => {
    const nodes = panelRefs.current.filter(Boolean) as HTMLElement[];
    if (nodes.length === 0) return;
    const ratios = new Array(PANELS.length).fill(0);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const i = Number((entry.target as HTMLElement).dataset.panel);
          if (!Number.isNaN(i)) ratios[i] = entry.intersectionRatio;
        }
        let best = 0;
        for (let i = 1; i < ratios.length; i++) {
          if (ratios[i] > ratios[best] + 0.001) best = i;
        }
        setActive(best);
      },
      { threshold: [0, 0.2, 0.4, 0.55, 0.7, 0.85, 1] },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const targetScene = PANELS[active].scene;
  const targetId = sceneId(targetScene);
  const frontCfg = front === 0 ? slotA : slotB;
  const backCfg = front === 0 ? slotB : slotA;

  /* load the next scene into the hidden slot */
  React.useEffect(() => {
    targetIdRef.current = targetId;
    const setBack = front === 0 ? setSlotB : setSlotA;
    if (frontCfg && sceneId(frontCfg) === targetId) return;
    if (backCfg && sceneId(backCfg) === targetId) return;
    setBack(targetScene);
  }, [targetId, targetScene, front, frontCfg, backCfg]);

  /* cross-fade to whichever slot just finished loading the wanted scene */
  const handleLoaded = React.useCallback((id: string) => {
    if (id !== targetIdRef.current) return;
    const a = slotARef.current;
    const b = slotBRef.current;
    if (a && sceneId(a) === id) setFront(0);
    else if (b && sceneId(b) === id) setFront(1);
  }, []);

  /* backstop: if the viewer never reports back, swap anyway */
  React.useEffect(() => {
    if (!backCfg || sceneId(backCfg) !== targetId) return;
    const back: 0 | 1 = front === 0 ? 1 : 0;
    const timer = window.setTimeout(() => setFront(back), 5000);
    return () => window.clearTimeout(timer);
  }, [backCfg, targetId, front]);

  /* retire the layer we faded away from, freeing its WebGL context */
  React.useEffect(() => {
    if (!backCfg || sceneId(backCfg) === targetId) return;
    const clear = front === 0 ? setSlotB : setSlotA;
    const timer = window.setTimeout(() => clear(null), 1400);
    return () => window.clearTimeout(timer);
  }, [backCfg, targetId, front]);

  const readout = PANELS[active].readout;

  return (
    <main className={`${styles.page} ${display.variable} ${mono.variable}`}>
      {/* the field */}
      <div className={styles.scene} aria-hidden="true">
        <SceneLayer cfg={slotA} visible={front === 0} onLoaded={handleLoaded} />
        <SceneLayer cfg={slotB} visible={front === 1} onLoaded={handleLoaded} />
      </div>

      {/* everything that keeps the type readable */}
      <div className={styles.scrim} aria-hidden="true" />

      {/* fixed instrument chrome */}
      <div className={styles.hud}>
        <div className={styles.hudTop}>
          <span className={styles.mark}>SAENOPY</span>
          <nav className={styles.hudNav}>
            <a href={PAPER.url} target="_blank" rel="noreferrer">
              Paper
            </a>
            <a href={LINKS.github} target="_blank" rel="noreferrer">
              Code
            </a>
            <a href={LINKS.docs} target="_blank" rel="noreferrer">
              Docs
            </a>
          </nav>
        </div>

        <div className={styles.readout}>
          <div className={styles.readoutLabel}>{readout.label}</div>
          <div className={styles.legend}>
            <span className={styles.legendMin}>0</span>
            <span
              className={styles.legendBar}
              style={{ background: TURBO }}
              aria-hidden="true"
            />
            <span className={styles.legendMax}>{readout.value}</span>
          </div>
          <div className={styles.readoutField}>{readout.field}</div>
        </div>

        <div className={styles.rail}>
          {PANELS.map((panel, i) => (
            <button
              key={panel.id}
              type="button"
              aria-label={panel.nav}
              aria-current={i === active}
              className={`${styles.railTick} ${i === active ? styles.railTickOn : ""}`}
              onClick={() =>
                panelRefs.current[i]?.scrollIntoView({ behavior: "smooth" })
              }
            />
          ))}
        </div>
      </div>

      {/* the words */}
      <div className={styles.panels}>
        {PANELS.map((panel, i) => {
          const Heading = i === 0 ? "h1" : "h2";
          return (
          <section
            key={panel.id}
            id={panel.id}
            data-panel={i}
            ref={(el) => {
              panelRefs.current[i] = el;
            }}
            className={styles.panel}
          >
            <div
              className={`${styles.panelBody} ${i === active ? styles.panelBodyOn : ""}`}
            >
              <p className={styles.eyebrow}>{panel.eyebrow}</p>

              <Heading
                className={`${styles.headline} ${
                  panel.variant === "wordmark"
                    ? styles.wordmark
                    : panel.variant === "mega"
                      ? styles.mega
                      : ""
                }`}
              >
                {panel.headline}
              </Heading>

              <p className={styles.lead}>{panel.lead}</p>

              {panel.id === "burst" && <ForceSpark />}

              {panel.bullets && (
                <ul className={styles.bullets}>
                  {panel.bullets.map((line) => (
                    <li key={line}>
                      <span>—</span>
                      {line}
                    </li>
                  ))}
                </ul>
              )}

              {panel.note && <p className={styles.note}>{panel.note}</p>}

              {panel.id === "open" && (
                <p className={styles.cue}>
                  <span className={styles.cueLine} />
                  Scroll
                </p>
              )}

              {panel.id === "work" && (
                <>
                  <ul className={styles.services}>
                    {SERVICES.map((service) => (
                      <li key={service}>{service}</li>
                    ))}
                  </ul>

                  <div className={styles.actions}>
                    <a
                      className={`${styles.btn} ${styles.btnPrimary}`}
                      href={LINKS.contact}
                    >
                      Start a conversation
                      <ArrowRight size={14} aria-hidden="true" />
                    </a>
                    <a
                      className={styles.btn}
                      href={LINKS.github}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Source
                    </a>
                    <a
                      className={styles.btn}
                      href={LINKS.docs}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Documentation
                    </a>
                  </div>

                  <div className={styles.placeholder}>
                    <span className={styles.placeholderTag}>
                      {PLACEHOLDERS.note}
                    </span>
                    <ul className={styles.placeholderList}>
                      {PLACEHOLDERS.panels.map((p) => (
                        <li key={p.title}>{p.title}</li>
                      ))}
                    </ul>
                  </div>

                  <p className={styles.cite}>
                    {PAPER.shortAuthors}{" "}
                    <span className={styles.citeTitle}>{PAPER.title}</span>{" "}
                    {PAPER.journal} {PAPER.year}.{" "}
                    <a href={PAPER.url} target="_blank" rel="noreferrer">
                      doi:{PAPER.doi}
                    </a>
                  </p>
                </>
              )}
            </div>
          </section>
          );
        })}
      </div>
    </main>
  );
}
