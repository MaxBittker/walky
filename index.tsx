import { render } from "./src/render";
import { startInput } from "./src/input";
import { updateCamera } from "./src/camera";
import { moveAgent } from "./src/movement";

startInput();

function tick() {
  moveAgent();
  updateCamera();
  render();
  // sendUpdate();

  window.requestAnimationFrame(tick);
}

window.requestAnimationFrame(tick);
