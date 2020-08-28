import * as Matter from "matter-js";
import { getState } from "./state";
import { speed } from "./movement";
let Vector = Matter.Vector;

function updateCamera() {
  let state = getState();
  const { me, camera, frame } = state;
  let { pos } = me;
  let distanceFromPos = Vector.magnitude(Vector.sub(pos, camera));

  let camera_speed = speed;
  if (distanceFromPos < Vector.magnitude(frame) / 20) {
    camera_speed = 0;
  }
  camera_speed *= distanceFromPos / (Vector.magnitude(frame) / 6);
  let directionTowardsPos = Vector.normalise(Vector.sub(pos, camera));

  state.camera = Vector.add(
    camera,
    Vector.mult(directionTowardsPos, camera_speed)
  );
}

export { updateCamera };
