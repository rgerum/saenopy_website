import { cmaps, valid_colormaps } from "./colormaps";
import { inject_style } from "./inject_style";

function color_to_hex(color: number) {
  let hex = color.toString(16);
  while (hex.length < 6) {
    hex = "0" + hex;
  }
  return "#" + hex;
}

function colormap_to_gradient(colormap: number[]) {
  let gradient = [];
  for (let i = 0; i < colormap.length; i++) {
    gradient.push(color_to_hex(colormap[i]));
  }
  return "linear-gradient(90deg, " + gradient.join(", ") + ")";
}

export function add_colormap_gui(
  parentDom: HTMLCanvasElement,
  params: { cmap: valid_colormaps; ccs_prefix?: string },
) {
  const ccs_prefix = "saenopy_" + params.ccs_prefix;
  const colorbar = document.createElement("div");
  colorbar.className = ccs_prefix + "colorbar";
  if (parentDom.parentElement) parentDom.parentElement.appendChild(colorbar);
  const colorbar_gradient = document.createElement("div");
  colorbar_gradient.className = ccs_prefix + "colorbar_gradient";
  colorbar.appendChild(colorbar_gradient);
  colorbar_gradient.style.background = colormap_to_gradient(cmaps[params.cmap]);

  const colorbar_title = document.createElement("div");
  colorbar_title.className = ccs_prefix + "title";
  colorbar.appendChild(colorbar_title);

  const ticks: HTMLDivElement[] = [];
  function add_tick() {
    const colorbar_number = document.createElement("div");
    colorbar_number.innerText = "0";
    colorbar_number.style.left = "10%";
    colorbar_number.className = ccs_prefix + "tick";
    colorbar.appendChild(colorbar_number);
    ticks.push(colorbar_number);
  }
  for (let i = 0; i < 5; i++) {
    add_tick();
  }

  let last_props: { max: number; colormap: string; title: string } = {
    max: 0,
    colormap: "viridis",
    title: "",
  };
  function update(colormap: string, max: number, title: string) {
    if (max !== last_props.max) {
      colorbar.style.display = max === 0 ? "none" : "block";
      for (let i = 0; i < ticks.length; i++) {
        ticks[i].style.left = (i / (ticks.length - 1)) * 100 + "%";
        ticks[i].innerText = ((i / (ticks.length - 1)) * max).toFixed(1);
      }
      last_props.max = max;
    }
    if (colormap !== last_props.colormap) {
      colorbar_gradient.style.background = colormap_to_gradient(
        cmaps[params.cmap],
      );
      last_props.colormap = colormap;
    }
    if (title !== last_props.title) {
      colorbar_title.innerText = title;
      last_props.title = title;
    }
  }

  inject_style(`
         .${ccs_prefix}colorbar {
            font-family: sans-serif;
            position: absolute;
            bottom: 30px;
            left: 20px;
            width: min(300px, 100% - 40px);
            height: 20px;
            background-color: white;   
            color: white;         
         }
         .${ccs_prefix}colorbar .${ccs_prefix}colorbar_gradient {
            width: 100%;
            height: 20px;
         }
         .${ccs_prefix}colorbar .${ccs_prefix}title {
            position: absolute;
              left: 50%;
              top: 0px;
              text-align: center;
              transform: translate(-50%, -100%);
              white-space: nowrap;
              padding-bottom: 5px;
         }
         .${ccs_prefix}colorbar .${ccs_prefix}tick {
             position: absolute;
             bottom: 0;
             left: 0;
             text-align: center;
             --tick-height: 7px;
             transform: translate(-50%, calc(100% + var(--tick-height)));
         }
         .${ccs_prefix}colorbar .${ccs_prefix}tick::before {
             content: "";
              width: 2px;
              height: var(--tick-height);
              display: block;
              background: white;
              position: absolute;
              top: 0;
              left: calc(50% - 1px);
              transform: translateY(-100%);
         }
         `);
  return update;
}
