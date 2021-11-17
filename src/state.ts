import * as Matter from "matter-js";

import { nrandom } from "./utils";
import { v4 as uuidv4 } from "uuid";
import { StateLayout } from "./types";
import { sendEntityUpdate } from "./client";

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
    color: Math.random() * 360,
  },
  camera: { x: 0, y: 0 },
  frame: { x: 0, y: 0 },
  center: { x: 0, y: 0 },
  entities: [],
  // audios: [],
  agents: [],
};

state.entities = [];

function resize() {
  state.frame = { x: window.innerWidth, y: window.innerHeight };
  state.center = Vector.div(state.frame, 2);
  // console.log("resized!");
}
resize();
window.state = state;
window.addEventListener("resize", resize);
window.setInterval(resize, 2000);
function getState() {
  return state;
}

function getEntity(uuid: string) {
  // set the element's new position:
  const { entities } = getState();

  let i = entities.findIndex(({ uuid: u }) => {
    return u === uuid;
  });
  return entities[i];
}
function writeEntity(uuid, v) {
  // set the element's new position:
  const { entities } = getState();

  let i = entities.findIndex(({ uuid: u }) => {
    return u === uuid;
  });
  entities[i] = v;
  sendEntityUpdate(uuid);
}
export { getState, getEntity, writeEntity };
