import { inject_style } from "@/components/mesh/inject_style";

export function add_logo(
  parentDom: HTMLElement | null,
  params: { logo_width: string | number; ccs_prefix?: string },
) {
  const ccs_prefix = "saenopy_" + params.ccs_prefix;
  const logo = document.createElement("img");
  logo.className = ccs_prefix + "logo";
  logo.src =
    "https://saenopy.readthedocs.io/en/latest/_static/img/Logo_black.png";
  if (parentDom) parentDom.appendChild(logo);
  inject_style(`
       .${ccs_prefix}logo {
           position: absolute;
           left: 0;
           top: 0;
           width: min(${params.logo_width}, 40%);
       }`);
}
