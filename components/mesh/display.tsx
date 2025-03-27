"use client";
import React from "react";
import { init } from "./3d_viewer.mjs";

export function DisplayMesh() {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!ref.current) return;
    init({
      path: "docs/_static/vector_data2",
      scale: 1,
      dom_node: ref.current,
      zoom: 1.5,
      image: "z-pos",
      mouse_control: true,
      //animations: [{ type: "scroll-tilt" }],
    });
  }, [ref.current]);
  return <div ref={ref}>display</div>;
}
