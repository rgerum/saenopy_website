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
import { loadFieldBundle } from "./field_bundle.ts";

// Proportions of the arrow glyph, as fractions of its total length. These
// match the arrow pyvista uses by default, so a field drawn here looks like the
// same field rendered from saenopy itself.
const TIP_LENGTH = 0.25;
const TIP_RADIUS = 0.1;
const SHAFT_RADIUS = 0.05;
const ARROW_LENGTH = 3; // the unit the instance scale is expressed in

// Built per thickness and cached, so a viewer can be given thinner or fatter
// arrows without every other viewer on the page changing with it.
const arrow_geometry_cache = new Map();
function make_arrow_geometry(thickness = 1) {
  const key = thickness.toFixed(3);
  if (arrow_geometry_cache.has(key)) return arrow_geometry_cache.get(key);

  const arrowheadGeometry = new THREE.ConeGeometry(
    TIP_RADIUS * ARROW_LENGTH * thickness,
    TIP_LENGTH * ARROW_LENGTH,
    8,
  );
  // align the base of the cone with the origin
  arrowheadGeometry.translate(0, (TIP_LENGTH * ARROW_LENGTH) / 2, 0);

  const shaftGeometry = new THREE.CylinderGeometry(
    SHAFT_RADIUS * ARROW_LENGTH * thickness,
    SHAFT_RADIUS * ARROW_LENGTH * thickness,
    (1 - TIP_LENGTH) * ARROW_LENGTH,
    8,
  );
  // align the cylinder with the cone base
  shaftGeometry.translate(0, -((1 - TIP_LENGTH) * ARROW_LENGTH) / 2, 0);

  const geometry = mergeGeometries([arrowheadGeometry, shaftGeometry], false);
  geometry.rotateX(Math.PI / 2);
  geometry.translate(0, 0, 2);
  arrow_geometry_cache.set(key, geometry);
  return geometry;
}


/**
 * A single image slice laid flat at the bottom of the field, the way the
 * exported figures underlay the cell. Takes a plain URL plus the physical size
 * of the slice in µm, so it does not need the stack machinery.
 */
function add_floor_image(scene, params) {
  const spec = params.floor_image;
  if (!spec?.url) return;
  const geometry = new THREE.PlaneGeometry(spec.width, spec.height);
  const texture = new THREE.TextureLoader().load(spec.url, () => {
    params.needs_render = true;
  });
  texture.colorSpace = THREE.SRGBColorSpace;
  // The plane's own texture mapping runs both axes backwards relative to the
  // data axes: with no transform, image[0,0] lands at the +x/+y corner. This
  // was measured by projecting the plane's corners into world space and
  // reading back their data coordinates. Mirroring both by default therefore
  // makes the natural reading correct -- a slice indexed [x, y] with both
  // increasing, which is what saenopy's get_image returns. Callers whose image
  // follows a different convention override these.
  texture.center.set(0.5, 0.5);
  if (spec.rotate90) texture.rotation = Math.PI / 2;
  texture.repeat.set((spec.flip_u ?? true) ? -1 : 1, (spec.flip_v ?? true) ? -1 : 1);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
    transparent: spec.opacity !== undefined,
    opacity: spec.opacity ?? 1,
  });
  const plane = new THREE.Mesh(geometry, material);
  plane.rotation.x = -Math.PI / 2;
  // params.extent is in metres, the scene in µm; the floor sits at the bottom
  // of the field unless the caller says otherwise
  plane.position.y = spec.z !== undefined ? spec.z : params.extent[4] * 1e6;
  scene.add(plane);
  return plane;
}

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
  material.transparent = true;
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

    const field_def = params.data.fields[params.field];
    if (
      params.path !== last_field.path ||
      params.field !== last_field.field ||
      params.frame !== last_field.frame ||
      params.data.path !== last_field.data_path
    ) {
      max_length = 0;
      arrows = [];
      last_field.path = params.path;
      last_field.field = params.field;
      last_field.frame = params.frame;
      last_field.data_path = params.data.path;
      needs_update = true;
      if (params.field !== "none" && field_def?.preloaded) {
        // bundle fields are already decoded into memory
        const preloaded = field_def.preloaded;
        const frame =
          preloaded.frames[
            ((params.frame % preloaded.frames.length) + preloaded.frames.length) %
              preloaded.frames.length
          ];
        nodes = frame.nodes;
        vectors = frame.vectors;
      } else if (params.field !== "none") {
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
        } catch (e) {
          nodes = await loadNpy(
            params.data.path + "/" + params.data.fields[params.field].nodes,
          );
          vectors = await loadNpy(
            params.data.path + "/" + params.data.fields[params.field].vectors,
          );
          console.error("could not load field from zip", e);
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

      if (field_def?.preloaded) {
        // the bundle quantises every frame against one shared peak, so pin the
        // colour scale to it instead of renormalising each frame
        max_length = field_def.preloaded.max * (field_def.factor || 1);
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

    // Two panels showing the same quantity are only comparable if they share a
    // scale; otherwise each normalises to its own peak and a 9.6 µm field looks
    // identical to a 10.8 µm one. Expressed in display units, like saenopy's
    // scale_max. Applied outside the field-change branch so that changing it
    // takes effect on the next redraw.
    if (params.scale_max) max_length = params.scale_max;
    if (last_field.applied_max !== max_length) {
      last_field.applied_max = max_length;
      needs_update = true;
    }

    // Fields differ by orders of magnitude between datasets (0.3 µm for an
    // immune cell, 10 µm for a fibroblast), so a fixed arrow scale has to be
    // retuned every time. Sizing the longest arrow as a fraction of the domain
    // instead makes any dataset look right without a magic number.
    let scale = params.scale;
    const domain =
      Math.max(
        params.extent[1] - params.extent[0],
        params.extent[3] - params.extent[2],
        params.extent[5] - params.extent[4],
      ) * 1e6;

    // Traction forces span orders of magnitude and concentrate on a handful of
    // nodes, so on a linear length scale everything but the peak collapses to
    // nothing. saenopy's own renderer draws forces on a log scale by default;
    // matching that keeps the two pictures comparable.
    const log_scale = params.scale_mode === "log";
    const length_of = (magnitude) =>
      log_scale
        ? Math.max(0, Math.log10(magnitude / (params.log_floor || 1e-3)))
        : magnitude;
    const max_display = length_of(max_length);

    if (params.arrow_span && max_display > 0) {
      scale = (params.arrow_span * domain) / max_display;
    }
    if (
      last_field.effective_scale !== scale ||
      last_field.scale_mode !== params.scale_mode
    ) {
      last_field.effective_scale = scale;
      last_field.scale_mode = params.scale_mode;
      needs_update = true;
    }

    const cmap = cmaps[params.cmap];
    if (last_field.cmap !== params.cmap) {
      last_field.cmap = params.cmap;
      needs_update = true;
    }

    const thickness = params.arrow_thickness ?? 1;
    if (arrows.length > count || thickness !== last_field.thickness) {
      count = Math.max(count, arrows.length);
      last_field.thickness = thickness;
      if (mesh) scene.remove(mesh);
      mesh = new THREE.InstancedMesh(
        make_arrow_geometry(thickness),
        material,
        count,
      );
      scene.add(mesh);
      needs_update = true;
    }
    const opacity = params.arrow_opacity ?? 1;
    if (material.opacity !== opacity) material.opacity = opacity;
    if (mesh) mesh.count = arrows.length;
    if (last_field.scale !== params.scale) {
      last_field.scale = params.scale;
      needs_update = true;
    }
    if (needs_update) {
      for (let i = 0; i < arrows.length; i++) {
        const [position, target, scaleValue] = arrows[i];
        const displayValue = length_of(scaleValue);

        dummyObject.position.copy(position);
        dummyObject.lookAt(target);
        dummyObject.scale.set(
          displayValue * scale,
          displayValue * scale,
          displayValue * scale,
        ); // Set uniform scale based on the vector's length
        dummyObject.updateMatrix();

        mesh.setMatrixAt(i, dummyObject.matrix);
        mesh.setColorAt(
          i,
          color.setHex(
            cmap[
              Math.min(
                cmap.length - 1,
                Math.max(
                  0,
                  Math.floor((displayValue / max_display) * (cmap.length - 1)),
                ),
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
  const params = {
    ccs_prefix: "",
    needs_render: true,
    scale: 1,
    // longest arrow as a fraction of the domain; overrides `scale` when set
    arrow_span: 0.1,
    frame: 0,
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
  if (params.bundle) {
    const bundle = await loadFieldBundle(params.bundle);
    params.time_points = bundle.timePoints;
    params.bundle_stats = {
      transferBytes: bundle.transferBytes,
      rawBytes: bundle.rawBytes,
      baselineBytes: bundle.baselineBytes,
      timePoints: bundle.timePoints,
      timeDelta: bundle.timeDelta,
      series: bundle.series,
      fields: Object.fromEntries(
        Object.entries(bundle.fields).map(([name, f]) => [
          name,
          {
            count: f.count,
            total: f.total,
            unit: f.unit,
            max: f.max * f.factor,
            frameMax: f.frames.map((frame) => frame.max * f.factor),
          },
        ]),
      ),
    };
    params.data = {
      path: params.bundle,
      fields: Object.fromEntries(
        Object.entries(bundle.fields).map(([name, f]) => [
          name,
          { unit: f.unit, factor: f.factor, preloaded: f },
        ]),
      ),
    };
    if (!params.data.fields[params.field]) {
      params.field = Object.keys(params.data.fields)[0];
    }
  } else {
    const data = await (await fetch(initial_params.path + "/data.json")).json();
    params.data = data;
    params.data.path = initial_params.path;
  }

  // the caller may have unmounted while the field data was still loading
  if (params.signal?.aborted) return () => {};

  // Scene setup
  const { scene, renderer, camera } = init_scene(
    initial_params.dom_node,
    params,
  );

  window.addEventListener("resize", () => {
    params.needs_render = true;
  });

  add_logo(renderer.domElement.parentElement, params);
  add_drop_show(renderer.domElement.parentElement, params);

  const update_image =
    params.data.stacks && params.data.channels
      ? await add_image(scene, params)
      : () => {};

  if (params.mouse_control) {
    const controlsCam = new OrbitControls(camera, renderer.domElement);
    controlsCam.addEventListener("change", () => {
      params.needs_render = true;
    });
    controlsCam.update();
    scene.controls = controlsCam;
  }

  //add_arrows();
  const update_field = params.data.fields
    ? await load_add_field(scene, renderer, params)
    : () => {};
  const update_cube = add_cube(scene, params);
  const floor_image = add_floor_image(scene, params);

  const radius = params.data.fields
    ? params.extent[1] * 1e6 * 4
    : params.data.stacks.im_shape[0] * params.data.stacks.voxel_size[0] * 2;
  set_camera(scene, camera, (radius / params.zoom) * 5, 30, 60);

  async function update_all() {
    update_image();
    await update_field();
    update_cube();
    params.needs_render = true;
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
      if (params.arrow_span)
        gui.add(params, "arrow_span", 0.01, 0.4).name("arrow size").onChange(update_all);
      else gui.add(params, "scale", 0, 10).onChange(update_all);
      gui.add(params, "field", options).onChange(update_all);
    }
    if (params.time_points > 1)
      gui.add(params, "frame", 0, params.time_points - 1, 1).onChange(update_all);
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

  // hand the caller the live params plus a redraw, so a changing time point
  // can be applied in place instead of tearing the viewer down. The third
  // argument exposes the scene objects, which is what lets several viewers
  // share one camera.
  if (params.on_ready)
    params.on_ready(params, update_all, {
      scene,
      camera,
      renderer,
      controls: scene.controls,
      floor_image,
    });

  return function dispose() {
    params.disposed = true;
    scene.controls?.dispose();
    renderer.dispose();
    const container = initial_params.dom_node;
    if (container) container.replaceChildren();
  };
}

let animation_time = new Date();
function animate(scene, renderer, camera, params, update_all) {
  if (params.disposed || params.signal?.aborted) return;
  requestAnimationFrame(() =>
    animate(scene, renderer, camera, params, update_all),
  );

  const current_time = new Date();
  const delta_t = (current_time - animation_time) / 1000;
  animation_time = current_time;

  if (params.mouse_control) scene.controls.update();
  for (let animation of params.animations) {
    if (animation.type === "scan") {
      animation.z = animation.z || 0;
      animation.z += (animation.speed || 10) * delta_t;
      params.z = Math.floor(animation.z % params.data.stacks.z_slices_count);
      update_all();
    }
    if (animation.type === "time" && params.time_points > 1) {
      animation.elapsed = (animation.elapsed || 0) + delta_t;
      const step = 1 / (animation.fps || 4);
      if (animation.elapsed >= step) {
        animation.elapsed = 0;
        params.frame = (params.frame + 1) % params.time_points;
        update_all();
      }
    }
    if (animation.type === "rotate") {
      const campos = new THREE.Spherical().setFromVector3(camera.position);
      campos.theta += (((animation.speed || 10) * Math.PI) / 180) * delta_t;
      camera.position.setFromSpherical(campos);
      camera.lookAt(scene.position);
    }
    if (animation.type === "scroll-tilt") {
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
          camera,
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

  // Redrawing a static scene sixty times a second costs a GPU context and a
  // core for nothing, and several viewers on one page add up to a stalled tab.
  // Anything that changes the picture sets params.needs_render; an animation
  // keeps it set for as long as it runs.
  if (params.animations.length > 0) params.needs_render = true;
  if (params.needs_render) {
    params.needs_render = false;
    renderer.render(scene, camera);
  }
}

function add_drop(dropZone, params, update_all) {
  const ccs_prefix = "saenopy_" + params.ccs_prefix;
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
