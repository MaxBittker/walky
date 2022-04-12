import * as Vector from "@graph-ts/vector2";

import { getState } from "./state";
import { topSpeed } from "./movement";

// the 0 is weird.
let zoom = window.innerWidth <= 600 ? 0.6 : 0.0;

window.addEventListener("resize", () => {
  zoom = window.innerWidth <= 600 ? 0.6 : 0.0;
});

function updateCamera(elapsedTicks: number) {
  let state = getState();
  const { me, camera, frame, center } = state;
  let { pos } = me;

  // unfortunately this line makes no sense to me:
  pos = Vector.subtract(pos, Vector.multiplyScalar(center, zoom));

  let distanceFromPos = Vector.length(Vector.subtract(pos, camera));
  let camera_speed = topSpeed;
  if (distanceFromPos < Vector.length(frame) / 20) {
    camera_speed = 0;
  }
  camera_speed *= distanceFromPos / (Vector.length(frame) / 6);
  let directionTowardsPos = Vector.normal(Vector.subtract(pos, camera));
  camera_speed *= elapsedTicks;
  camera_speed = Math.min(camera_speed, distanceFromPos);
  state.camera = Vector.add(
    camera,
    Vector.multiplyScalar(directionTowardsPos, camera_speed)
  );
  // state.camera = { x: 0, y: 0 };
}

export { updateCamera };
