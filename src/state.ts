import * as Matter from "matter-js";

import { nrandom } from "./utils";
import { v4 as uuidv4 } from "uuid";
import { StateLayout } from "./types";

let Vector = Matter.Vector;

let uuid = uuidv4().slice(0, 8);

let state: StateLayout = {
  tick: 0,
  me: {
    uuid,
    pos: { x: 0, y: 0 },
    target: undefined,
    facing: true,
    moving: false,
    lastUpdated: 0,
    color: Math.random() * 360
  },
  camera: { x: 0, y: 0 },
  frame: { x: 0, y: 0 },
  center: { x: 0, y: 0 },
  entities: [],
  agents: []
};

state.entities = [];

function resize() {
  state.frame = { x: window.innerWidth, y: window.innerHeight };
  state.center = Vector.div(state.frame, 2);
}
resize();
window.state = state;
window.onresize = resize;

function getState() {
  return state;
}
export { getState };
