import { render } from "./src/render";
import { startInput } from "./src/input";
import { updateCamera } from "./src/camera";
import { updateAgent } from "./src/movement";
import { sendUpdate, requestClockSync } from "./src/client";
import { getState } from "./src/state";

startInput();
let i = 0;
function tick() {
  let state = getState();
  let { me, agents } = state;

  state.me = updateAgent(me, state.tick);
  state.tick += 1;
  // console.log("agents:");
  state.agents = agents.map(agent => updateAgent(agent, state.tick));

  updateCamera();
  render();
  if (i % 10 == 0) {
    sendUpdate();
  }
  if (i % 100 == 0) {
    requestClockSync();
  }

  i++;
  window.requestAnimationFrame(tick);
}

window.requestAnimationFrame(tick);
