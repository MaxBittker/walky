import * as Matter from "matter-js";
import { getState } from "./state";
import { speed } from "./movement";
let Vector = Matter.Vector;
let zoom = window.innerWidth <= 600 ? 0.6 : 0.0;
window.onresize = () => {
  zoom = window.innerWidth <= 600 ? 0.6 : 0.0;
};
function updateCamera(elapsedTicks: number) {
  let state = getState();
  const { me, camera, frame, center } = state;
  let { pos } = me;

  // unfortunately this line makes no sense to me:
  pos = Vector.sub(pos, Vector.mult(center, zoom));

  let distanceFromPos = Vector.magnitude(Vector.sub(pos, camera));
  let camera_speed = speed;
  if (distanceFromPos < Vector.magnitude(frame) / 20) {
    camera_speed = 0;
  }
  camera_speed *= distanceFromPos / (Vector.magnitude(frame) / 6);
  let directionTowardsPos = Vector.normalise(Vector.sub(pos, camera));
  camera_speed *= elapsedTicks;

  state.camera = Vector.add(
    camera,
    Vector.mult(directionTowardsPos, camera_speed)
  );
}

export { updateCamera };
