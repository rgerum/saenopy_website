import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

import { loadNpy } from "./load_numpy.js";
import { cmaps } from "./colormaps.ts";
import { add_colormap_gui } from "./Colorbar.ts";
import { add_cube } from "./Cube.js";
import { get_file_from_zip } from "./get_file_from_zip.ts";
import { add_logo } from "./Logo.ts";
import { init_scene } from "@/components/mesh/Scene";
import { inject_style } from "@/components/mesh/inject_style";

// Arrowhead geometry (cone)
const arrowheadGeometry = new THREE.ConeGeometry(0.5, 1, 6);
arrowheadGeometry.translate(0, 0.5, 0); // Translate to align the base of the cone with the origin

// Shaft geometry (cylinder)
const shaftGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2, 6);
shaftGeometry.translate(0, -1, 0); // Translate to align the cylinder correctly with the cone base

// Merge geometries
const arrowGeometry = mergeGeometries(
  [arrowheadGeometry, shaftGeometry],
  false,
);
arrowGeometry.rotateX(Math.PI / 2);
arrowGeometry.translate(0, 0, 2);

function add_drop_show(parentDom, params) {
  const dropshow = document.createElement("div");
  const ccs_prefix = "saenopy_" + params.ccs_prefix;
  dropshow.className = ccs_prefix + "drop_show";
  dropshow.innerText = "drop .savenopy file";
  parentDom.appendChild(dropshow);
  inject_style(`
        .${ccs_prefix}drop_show {
           position: absolute;
           left: 0;
           top: 0;
           bottom: 0;
           right: 0;
           border: 5px dashed darkred;
           border-radius: 20px;
           pointer-events: none;
           margin: 0px;
           z-index: 100000;
          font-size: 2rem;
          color: white;
          text-align: center;
          display: grid;
          place-content: center;
          font-family: sans;
          backdrop-filter: blur(3px) brightness(0.5);
          opacity: 0;
          transition: opacity 300ms, margin 300ms;
       }
       .${ccs_prefix}highlight .${ccs_prefix}drop_show {
           opacity: 1;
           margin: 10px;
       }`);
}

function set_camera(scene, camera, r, theta_deg, phi_deg) {
  // Convert current camera position to spherical coordinates
  const currentSpherical = new THREE.Spherical().setFromVector3(
    camera.position,
  );

  // Only update radius if `r` is provided
  const radius = r !== undefined ? r : currentSpherical.radius;

  // Convert degrees to radians, and only update if values are provided
  let theta =
    theta_deg !== undefined
      ? (theta_deg * Math.PI) / 180
      : currentSpherical.theta;
  let phi =
    phi_deg !== undefined ? (phi_deg * Math.PI) / 180 : currentSpherical.phi; // Assuming phi is always provided for simplicity

  // Convert spherical to Cartesian coordinates for the camera position
  const spherical = new THREE.Spherical(radius, phi, theta);
  const position = new THREE.Vector3().setFromSpherical(spherical);

  // Set camera position
  camera.position.set(position.x, position.y, position.z);

  // Make the camera look at the scene center or any other point of interest
  camera.lookAt(scene.position);
}

function pad_zero(num, places) {
  return String(num).padStart(places, "0");
}

const pending = {
  state: "pending",
};

function getPromiseState(promise) {
  // We put `pending` promise after the promise to test,
  // which forces .race to test `promise` first
  return Promise.race([promise, pending]).then(
    (value) => {
      if (value === pending) {
        return value;
      }
      return {
        state: "resolved",
        value,
      };
    },
    (reason) => ({ state: "rejected", reason }),
  );
}

async function add_image(scene, params) {
  let w = params.data.stacks.im_shape[0] * params.data.stacks.voxel_size[0];
  let h = params.data.stacks.im_shape[1] * params.data.stacks.voxel_size[1];
  let d = 0;
  // Image setup
  const imageGeometry = new THREE.PlaneGeometry(w, h);
  // a black image texture to start
  const texture = new THREE.TextureLoader().load(
    "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=",
  );
  const imageMaterial = new THREE.MeshBasicMaterial({ map: texture });
  imageMaterial.side = THREE.DoubleSide;
  let imagePlane = new THREE.Mesh(imageGeometry, imageMaterial);
  imagePlane.rotation.x = -Math.PI / 2;
  scene.add(imagePlane);

  //const texture_await = get_textures_from_zip("data/stack/stack.zip");
  //let textures;

  const textures = [];
  for (let i = 0; i < params.data.stacks.z_slices_count; i++) {
    textures.push(
      get_file_from_zip(
        params.data.path,
        "stacks/0/" +
          params.data.stacks.channels[0] +
          "/" +
          pad_zero(i, 3) +
          ".jpg",
        "texture",
      ),
    );
    textures[i].then((v) => {
      textures[i] = v;
    });
  }

  async function update() {
    if (params.image === "z-pos") {
      imagePlane.position.y =
        (-params.data.stacks.im_shape[2] * params.data.stacks.voxel_size[2]) /
          2 +
        params.z * params.data.stacks.voxel_size[2];
      imagePlane.scale.x = 1;
    } else if (params.image === "floor") {
      imagePlane.position.y =
        (-params.data.stacks.im_shape[2] * params.data.stacks.voxel_size[2]) /
        2;
      imagePlane.scale.x = 1;
    } else {
      imagePlane.scale.x = 0;
    }
    const z = Math.floor(params.z);
    if (textures[z].then === undefined)
      imagePlane.material.map = await textures[z];
    else {
      textures[z].then(update);
    }
  }
  update();
  return update;
}

async function add_test(scene, renderer, params) {
  const color = new THREE.Color();

  let count = 0;
  //const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const material = new THREE.MeshPhongMaterial({ color: 0xdfdfdf });
  let mesh = undefined;
  const dummyObject = new THREE.Object3D();

  const light = new THREE.HemisphereLight(0xffffff, 0x888888, 3);
  light.position.set(0, 1, 0);
  scene.add(light);
  scene.light = light;

  function convert_pos(x, y, z) {
    const f = 1e6;
    return new THREE.Vector3(-y * f, z * f, -x * f);
  }
  function convert_vec(x, y, z) {
    const f = params.data.fields[params.field]?.factor || 1;
    return new THREE.Vector3(-y * f, z * f, -x * f);
  }
  const colormap_update = add_colormap_gui(renderer.domElement, params);

  let scaleFactor = 1;
  let last_field = {};
  let nodes, vectors;
  async function draw() {
    let arrows = last_field.arrows || [];
    let max_length = last_field.max_length || 0;
    let needs_update = false;

    if (
      params.path !== last_field.path ||
      params.field !== last_field.field ||
      params.data.path !== last_field.data_path
    ) {
      max_length = 0;
      arrows = [];
      last_field.path = params.path;
      last_field.field = params.field;
      last_field.data_path = params.data.path;
      needs_update = true;
      if (params.field !== "none") {
        console.log(params.data.path, params.data.fields[params.field].nodes);
        try {
          nodes = await loadNpy(
            await get_file_from_zip(
              params.data.path,
              params.data.fields[params.field].nodes,
              "blob",
            ),
          );
          vectors = await loadNpy(
            await get_file_from_zip(
              params.data.path,
              params.data.fields[params.field].vectors,
              "blob",
            ),
          );
          console.log("nodes", nodes, "vectors", vectors);
        } catch (e) {
          nodes = await loadNpy(
            params.data.path + "/" + params.data.fields[params.field].nodes,
          );
          vectors = await loadNpy(
            params.data.path + "/" + params.data.fields[params.field].vectors,
          );
          console.log("could not load", e);
        }
      }

      if (!nodes || !vectors) {
      } else {
        for (let i = 0; i < nodes.header.shape[0]; i++) {
          const position = nodes.header.fortran_order
            ? convert_pos(
                nodes[i],
                nodes[i + nodes.header.shape[0]],
                nodes[i + nodes.header.shape[0] * 2],
              )
            : convert_pos(
                nodes[i * nodes.header.shape[1]],
                nodes[i * nodes.header.shape[1] + 1],
                nodes[i * nodes.header.shape[1] + 2],
              );
          const orientationVector = vectors.header.fortran_order
            ? convert_vec(
                vectors[i],
                vectors[i + vectors.header.shape[0]],
                vectors[i + vectors.header.shape[0] * 2],
              )
            : convert_vec(
                vectors[i * vectors.header.shape[1]],
                vectors[i * vectors.header.shape[1] + 1],
                vectors[i * vectors.header.shape[1] + 2],
              );
          const target = position.clone().add(orientationVector);
          const scaleValue = orientationVector.length();
          if (scaleValue > max_length) {
            max_length = scaleValue;
          }
          arrows.push([position, target, scaleValue]);
        }
      }

      if (nodes) {
        const [min_x, max_x] = get_extend(nodes, 0);
        const [min_y, max_y] = get_extend(nodes, 1);
        const [min_z, max_z] = get_extend(nodes, 2);
        params.extent = [min_x, max_x, min_y, max_y, min_z, max_z];
      }
    }
    last_field.arrows = arrows;
    last_field.max_length = max_length;

    const cmap = cmaps[params.cmap];
    if (last_field.cmap !== params.cmap) {
      last_field.cmap = params.cmap;
      needs_update = true;
    }

    if (arrows.length > count) {
      count = arrows.length;
      if (mesh) scene.remove(mesh);
      mesh = new THREE.InstancedMesh(arrowGeometry, material, count);
      scene.add(mesh);
    }
    if (mesh) mesh.count = arrows.length;
    if (last_field.scale !== params.scale) {
      last_field.scale = params.scale;
      needs_update = true;
    }
    if (needs_update) {
      for (let i = 0; i < arrows.length; i++) {
        const [position, target, scaleValue] = arrows[i];

        dummyObject.position.copy(position);
        dummyObject.lookAt(target);
        dummyObject.scale.set(
          scaleValue * params.scale,
          scaleValue * params.scale,
          scaleValue * params.scale,
        ); // Set uniform scale based on the vector's length
        dummyObject.updateMatrix();

        mesh.setMatrixAt(i, dummyObject.matrix);
        mesh.setColorAt(
          i,
          color.setHex(
            cmap[
              Math.min(
                cmap.length - 1,
                Math.floor((scaleValue / max_length) * (cmap.length - 1)),
              )
            ],
          ),
        );
      }
      if (mesh) {
        mesh.instanceMatrix.needsUpdate = true;
        mesh.instanceColor.needsUpdate = true;
      }
    }

    colormap_update(
      params.cmap,
      params.show_colormap ? max_length : 0,
      params.data.fields[params.field]
        ? `${params.field} (${params.data.fields[params.field].unit})`
        : "",
    );
  }
  await draw();

  function setScale(scaleValue) {
    scaleFactor = scaleValue;
    draw();
  }

  return { setScale, draw };
}

function get_extend(nodes, offset) {
  let max = -Infinity;
  let min = Infinity;
  for (let i = 0; i < nodes.length / 3; i++) {
    const v = nodes[i * 3 + offset];
    if (v > max) {
      max = v;
    }
    if (v < min) {
      min = v;
    }
  }
  return [min, max];
}

async function load_add_field(scene, renderer, params) {
  const controls = await add_test(scene, renderer, params);
  return controls.draw;
}

export async function init(initial_params) {
  console.log("init", initial_params);
  const params = {
    scale: 1,
    cmap: "turbo", // ["turbo", "viridis"]
    field: "fitted deformations", // fitted deformations
    z: 0,
    cube: "field", // ["none", "stack", "field"]
    image: "z-pos", // ["none", "z-pos", "floor"]
    background: "black",
    cube_color: 0x000000,
    height: "400px",
    width: "auto",
    logo_width: "200px",
    zoom: 1,
    animations: [],
    pre_load_images: true,
    show_controls: true,
    show_colormap: true,
    mouse_control: true,
    extent: [0, 1, 0, 1, 0, 1],
    ...initial_params,
  };
  params.data = {
    fields: {
      "measured deformations": {
        nodes: "mesh_piv/0/nodes.npy",
        vectors: "mesh_piv/0/displacements_measured.npy",
        unit: "\u00b5m",
        factor: 1000000.0,
      },
      "target deformations": {
        nodes: "solvers/0/mesh/nodes.npy",
        vectors: "solvers/0/mesh/displacements_target.npy",
        unit: "\u00b5m",
        factor: 1000000.0,
      },
      "fitted deformations": {
        nodes: "solvers/0/mesh/nodes.npy",
        vectors: "solvers/0/mesh/displacements.npy",
        unit: "\u00b5m",
        factor: 1000000.0,
      },
      "fitted forces": {
        nodes: "solvers/0/mesh/nodes.npy",
        vectors: "solvers/0/mesh/forces.npy",
        unit: "nN",
        factor: 1000000000.0,
      },
    },
    ...params.data,
  };

  if (initial_params.dom_node) {
    initial_params.dom_node.style.position = "relative";
    initial_params.dom_node.style.background = params.background;
    initial_params.dom_node.style.minHeight = params.height;
    initial_params.dom_node.style.width = params.width;
  }
  console.log("load data", params.data === undefined);

  if (1) {
    const data = await (await fetch(initial_params.path + "/data.json")).json();
    console.log("data", data);
    params.data = data;
    params.data.path = initial_params.path;
  }
  console.log("params", params);

  // Scene setup
  const { scene, renderer, camera } = init_scene(
    initial_params.dom_node,
    params,
  );

  add_logo(renderer.domElement.parentElement, params);
  add_drop_show(renderer.domElement.parentElement, params);

  const update_image =
    params.data.stacks && params.data.channels
      ? await add_image(scene, params)
      : () => {};

  console.log("mouse", params.mouse_control);
  if (params.mouse_control) {
    console.log("mouse control");
    const controlsCam = new OrbitControls(camera, renderer.domElement);
    controlsCam.update();
    scene.controls = controlsCam;
  }

  //add_arrows();
  const update_field = params.data.fields
    ? await load_add_field(scene, renderer, params)
    : () => {};
  const update_cube = add_cube(scene, params);

  const radius = params.extent[0]
    ? params.extent[1] * 1e6 * 4
    : params.data.stacks.im_shape[0] * params.data.stacks.voxel_size[0] * 2;
  set_camera(scene, camera, radius / params.zoom, 30, 60);

  async function update_all() {
    update_image();
    await update_field();
    update_cube();
  }
  // Animation loop
  animate(scene, renderer, camera, params, update_all);

  if (params.show_controls) {
    const gui = new GUI({ container: renderer.domElement.parentElement });
    gui.domElement.classList.add("autoPlace");
    gui.domElement.style.position = "absolute";
    window.gui = gui;

    const options = ["none"];
    for (let name in params.data.fields) {
      options.push(name);
    }
    if (options.length > 1) {
      gui.add(params, "scale", 0, 10).onChange(update_all);
      gui.add(params, "field", options).onChange(update_all);
    }
    if (options.length > 1)
      gui.add(params, "cmap", Object.keys(cmaps)).onChange(update_all);
    const cube_options = ["none"];
    if (options.length > 1) cube_options.push("field");
    if (params.data.stacks) cube_options.push("stack");
    gui.add(params, "cube", cube_options).onChange(update_all);
    if (params.data.stacks)
      gui.add(params, "image", ["none", "z-pos", "floor"]).onChange(update_all);
    if (options.length > 1)
      gui.add(params, "show_colormap").onChange(update_all);
    if (params.data.stacks)
      gui
        .add(params, "z", 0, params.data.stacks.z_slices_count - 1, 1)
        .onChange(update_all);

    gui.close();
  }
  add_drop(renderer.domElement.parentElement, params, update_all);
}

let animation_time = new Date();
function animate(scene, renderer, camera, params, update_all) {
  requestAnimationFrame(() =>
    animate(scene, renderer, camera, params, update_all),
  );

  const current_time = new Date();
  const delta_t = (current_time - animation_time) / 1000;
  animation_time = current_time;

  if (params.mouse_control) scene.controls.update();
  for (let animation of params.animations) {
    if (animation.type === "scanX") {
      animation.z = animation.z || 0;
      animation.z += (animation.speed || 10) * delta_t;
      params.z = Math.floor(animation.z % params.data.stacks.z_slices_count);
      update_all();
    }
    if (animation.type === "rotateX") {
      const campos = new THREE.Spherical().setFromVector3(camera.position);
      campos.theta += (((animation.speed || 10) * Math.PI) / 180) * delta_t;
      camera.position.setFromSpherical(campos);
      camera.lookAt(scene.position);
    }
    if (animation.type === "scroll-tiltX") {
      if (
        renderer.domElement.getBoundingClientRect().top !==
        animation.last_top_pos
      ) {
        const factor =
          (renderer.domElement.getBoundingClientRect().top +
            renderer.domElement.getBoundingClientRect().height) /
          (window.innerHeight +
            renderer.domElement.getBoundingClientRect().height);
        const top = animation.top || 120;
        const bottom = animation.bottom || 30;
        set_camera(
          scene,
          undefined,
          undefined,
          top * (1 - factor) + bottom * factor,
        );
        animation.last_top_pos =
          renderer.domElement.getBoundingClientRect().top;
      }
    }
  }

  if (scene.light) {
    const campos = new THREE.Spherical().setFromVector3(camera.position);
    const lightpos = new THREE.Spherical(
      campos.radius,
      campos.phi,
      campos.theta + (30 / 180) * Math.PI,
    );
    scene.light.position.setFromSpherical(lightpos);
  }

  renderer.render(scene, camera);
}

function add_drop(dropZone, params, update_all) {
  // Prevent default drag behaviors
  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });

  // Highlight drop area when item is dragged over it
  ["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(eventName, highlight, false);
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, unhighlight, false);
  });

  // Handle dropped files
  dropZone.addEventListener("drop", handleDrop, false);

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function highlight(e) {
    dropZone.classList.add(ccs_prefix + "highlight");
  }

  function unhighlight(e) {
    dropZone.classList.remove(ccs_prefix + "highlight");
  }

  function handleDrop(e) {
    var dt = e.dataTransfer;
    var files = dt.files;

    handleFiles(files);
  }

  function handleFiles(files) {
    [...files].forEach(loadFile);
    init;
  }

  function loadFile(file) {
    console.log("loadFile", file);
    params.data.path = file;
    update_all();
    return;
    var reader = new FileReader();
    reader.readAsText(file); // Or readAsDataURL(file) for images
    reader.onloadend = function () {
      console.log(reader.result); // Do something with the file content
      // For example, display the file content in the drop zone
      dropZone.textContent = reader.result;
    };
  }
}
