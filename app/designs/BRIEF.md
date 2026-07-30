# Landing page design brief

Ten alternative landing pages for saenopy.com. They have two jobs at once:

1. Sell saenopy as software to the cell-mechanics research community.
2. Double as material we can send to a pharma company to open a services
   conversation — specifically around cell therapy and immuno-oncology.

Each design explores a different angle. They are meant to be compared side by
side, so **they must not look like variations of one template.** Different
layout skeleton, different type treatment, different colour temperature,
different density.

## The pitch, in one paragraph

Saenopy measures the forces a cell exerts on the 3D matrix around it. The
Nature Physics paper behind it is about immune cells: NK cells generate bursts
of traction force that grow with matrix stiffness and let them squeeze through
tight constrictions. That matters commercially because transferred cell
therapies have to physically push through dense tumour stroma before their
cytotoxic machinery is worth anything, and traction force is a direct,
per-cell, in-3D readout of whether they can.

## Hard rules

- **Never invent a claim.** Everything factual comes from
  `lib/saenopy-content.ts` (`PAPER`, `CLAIMS`, `IMMUNO`, `DATASETS`,
  `FORCE_TRACE`, `ENERGY_TRACE`, `SERVICES`, `LINKS`). Those numbers were
  measured from the real data or taken from the paper. Do not round them into
  something punchier and do not add clinical or regulatory claims.
- **Label placeholders.** Where you show something we cannot yet back up, use
  `PLACEHOLDERS` and make the label visible in the UI. The user will supply
  real data later. A placeholder that reads as real is the one thing that
  would actually damage the pitch.
- **No fake logos, no fake testimonials, no invented customer names.**
- Write for a scientifically literate reader. No breathless marketing voice.

## Available data

All bundles live in `public/data` and are listed in `DATASETS`:

| key | what it is | note |
| --- | --- | --- |
| `nk92` | NK92 natural killer cell | the immunotherapy hero, bright-field, 0.87 nN peak |
| `organoid` | intestinal organoid | 61.3 nN peak, two orders up from the immune cell |
| `cell004` / `cell007` / `cell008` | three fibroblasts | same experiment, 47.7 / 77.2 / 126 nN — good for showing spread |
| `dynamic` | 23 time points, one per minute | animates; `FORCE_TRACE` and `ENERGY_TRACE` are its per-frame numbers |

## The viewer

```tsx
import { DisplayMesh } from "@/components/mesh/display";

<DisplayMesh
  bundle={DATASETS.nk92.bundle}
  field="fitted deformations"   // or "fitted forces", "measured deformations"
  height="520px"
  arrow_span={0.1}              // longest arrow as a fraction of the domain
  zoom={1.1}
  cube="field"                  // wireframe bounding box; "none" to hide it
  cube_color={0x64748b}
  background="transparent"
  logo_width="0px"
  cmap="turbo"                  // or "viridis"
  mouse_control                 // drag to rotate, scroll to zoom
  show_controls={false}         // the lil-gui panel
  show_colormap                 // the colour bar
  animations={[{ type: "rotate", speed: 6 }]}
  onStats={(s) => ...}          // fires once loaded, gives transfer sizes etc.
/>
```

Animation types: `rotate` (`speed` in deg/s), `time` (`fps`, steps a
multi-frame bundle), `scroll-tilt` (camera elevation follows scroll).

Notes that will save you time:

- Prefer `arrow_span` over `scale`. Fields differ by orders of magnitude
  between datasets and `arrow_span` normalises that automatically.
- The viewer is WebGL and mounts on the client. It already carries
  `"use client"`, so a server component can render it directly. Add
  `"use client"` to your page only if you need state or effects.
- Each `DisplayMesh` is its own WebGL context. Browsers cap those at roughly
  8–16, so **keep it to at most 4 viewers mounted at once on a page.** If a
  design wants more, mount them behind a tab/selector rather than all at once.
- It needs a real height. Pass `height` and give the wrapper a dark
  background — the fields are drawn light-on-dark.
- `arrow_span={0.1}` is a good default; go smaller (0.05) for a dense look,
  larger (0.2) for a sparse dramatic one.

## Technical constraints

- Next.js 16 App Router, React 19, Tailwind v4, shadcn/ui in `components/ui`,
  `lucide-react` for icons.
- Create **only** files inside your own design folder. Other designs are being
  built in parallel; do not touch `lib/`, `components/mesh/`, `app/globals.css`,
  or another design's folder. Local sub-components go in your own folder.
- `pnpm typecheck` and `pnpm exec eslint app components` must pass. Common
  trip-ups: refs must not be written during render, and apostrophes in JSX text
  need `&apos;`.
- The dev server runs on port 3100. Verify your page renders before you finish.
