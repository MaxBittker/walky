import { render } from "./src/render";
import { startInput } from "./src/input";
import { updateCamera } from "./src/camera";
import { moveAgent } from "./src/movement";
import { sendUpdate } from "./src/client";

startInput();
let i = 0;
function tick() {
  moveAgent();
  updateCamera();
  render();
  if (i == 10) {
    sendUpdate();
    i = 0;
  }

  i++;
  window.requestAnimationFrame(tick);
}

window.requestAnimationFrame(tick);
