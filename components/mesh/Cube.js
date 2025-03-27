import * as THREE from "three";

export function add_cube(scene, params) {
  // Cube setup
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const wireframe = new THREE.EdgesGeometry(geometry);
  console.log("cube", params.cube_color);
  const material = new THREE.LineBasicMaterial({
    color: params.cube_color,
  });
  let cube = new THREE.LineSegments(wireframe, material);
  scene.add(cube);

  function update_cube() {
    if (params.cube === "field") {
      cube.scale.x = params.extent[1] * 1e6 * 2;
      cube.scale.y = params.extent[3] * 1e6 * 2;
      cube.scale.z = params.extent[5] * 1e6 * 2;
    } else if (params.cube === "stack") {
      cube.scale.x =
        params.data.stacks.im_shape[0] * params.data.stacks.voxel_size[0];
      cube.scale.y =
        params.data.stacks.im_shape[1] * params.data.stacks.voxel_size[1];
      cube.scale.z =
        params.data.stacks.im_shape[2] * params.data.stacks.voxel_size[2];
    } else {
      cube.scale.x = 0;
      cube.scale.y = 0;
      cube.scale.z = 0;
    }
  }
  update_cube();
  return update_cube;
}
