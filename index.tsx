import { render } from "./src/render";
import { startUI } from "./src/ui";

import { startInput } from "./src/input";
import { updateCamera } from "./src/camera";
import { updateAgent } from "./src/movement";
import { sendUpdate, requestClockSync } from "./src/client";
import { getState } from "./src/state";
startInput();
startUI();
let i = 0;

let debug = document.getElementById("debug");

function tick() {
  let state = getState();
  let { me, agents } = state;

  state.me = updateAgent(me, state.tick);
  state.tick += 1;
  // console.log("agents:");
  state.agents = agents.map(agent => updateAgent(agent, state.tick));

  // debug.innerHTML = state.tick;
  updateCamera();
  render();
  if (i % 10 == 0) {
    sendUpdate();
  }
  if (i % 60 == 0) {
    requestClockSync();
  }

  i++;
  window.setTimeout(tick, 1000 / 60);
}
// tick();
window.requestAnimationFrame(tick);
