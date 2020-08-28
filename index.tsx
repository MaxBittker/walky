import { render } from "./src/render";
import { startInput } from "./src/input";
import { updateCamera } from "./src/camera";
import { updateAgent } from "./src/movement";
import { sendUpdate } from "./src/client";
import { getState } from "./src/state";

startInput();
let i = 0;
function tick() {
  let state = getState();
  let { me, agents } = state;

  state.me = updateAgent(me);
  // state.agents = agents.map(updateAgent);

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
