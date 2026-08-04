import * as THREE from "three";

export function init_scene(dom_elem: HTMLDivElement) {
  // if no element is defined, add a new one to the body
  const canvas = (function () {
    if (!dom_elem) {
      const canvas = document.createElement("canvas");
      document.body.appendChild(dom_elem);
      return canvas;
    }
    if (dom_elem.tagName !== "CANVAS") {
      const canvas = document.createElement("canvas");
      dom_elem.appendChild(canvas);
      return canvas;
    }
    throw new Error("Can't find canvas element");
  })();

  canvas.style.display = "block";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    20,
    window.innerWidth / window.innerHeight,
    0.1,
    15000,
  );
  //scene.camera = camera;
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    canvas: canvas,
    antialias: true,
  });
  // Without this the drawing buffer is sized in CSS pixels and the browser
  // upscales it on a high-DPI screen, which no amount of multisampling can
  // undo -- thin arrows come out ragged. Capped at 2, because the buffer grows
  // with the square of this and several viewers can share a page.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  //renderer.setSize(window.innerWidth, window.innerHeight);
  //document.body.appendChild(renderer.domElement);
  //scene.renderer = renderer;
  //window.scene = scene;

  function onWindowResize() {
    let container = canvas.parentElement;
    if (!container) return;
    let width = container.clientWidth;
    let height = container.clientHeight;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    // Update camera aspect ratio
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    // Update renderer size
    renderer.setSize(width, height);
  }
  //scene.onWindowResize = onWindowResize;
  //document.onWindowResize = onWindowResize;
  onWindowResize();
  // Add a resize event listener
  window.addEventListener("resize", onWindowResize, false);

  return { scene, camera, renderer };
}
