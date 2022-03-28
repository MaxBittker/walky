import { Render } from "./src/render";
import * as React from "react";
import ReactDOM = require("react-dom");

import { startUI } from "./src/ui";
import "regenerator-runtime/runtime";

import { startInput } from "./src/input";
import { updateCamera } from "./src/camera";
import { updateAgent } from "./src/movement";
import { sendUpdate } from "./src/client";
import { getState } from "./src/state";

startInput();
startUI();
let i = 0;

const rootElement = document.getElementById("window");
ReactDOM.render(
  <React.StrictMode>
    <Render tick={tick} />
  </React.StrictMode>,
  rootElement
);

// // let debug = document.getElementById("debug");

let lasttick = Date.now();
function tick() {
  let state = getState();
  let { me, agents } = state;

  let elapsedMillis = Date.now() - lasttick;
  let millisPerTick = 1000 / 60;
  let elapsedTicks = elapsedMillis / millisPerTick;

  state.me = updateAgent(me, elapsedTicks);
  state.agents = agents.map((agent) => updateAgent(agent, elapsedTicks));

  // debug.innerHTML = state.tick;
  updateCamera(elapsedTicks);
  if (i % 10 == 0) {
    sendUpdate();
  }

  i++;

  lasttick = Date.now();
}
