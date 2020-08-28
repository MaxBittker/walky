import * as Matter from "matter-js";
import chair from "./../assets/Classroom+Chair.jpg";
import fern from "./../assets/fern.jpg";
import { nrandom } from "./utils";
import { v4 as uuidv4 } from "uuid";
import { StateLayout } from "./types";

let Vector = Matter.Vector;

let uuid = uuidv4().slice(0, 8);

let state: StateLayout = {
  me: {
    uuid,
    pos: { x: 200, y: 200 },
    target: undefined,
    facing: true,
    moving: false,
    lastUpdated: Date.now(),
    color: Math.random() * 360
  },
  camera: { x: 200, y: 200 },
  frame: { x: 0, y: 0 },
  center: { x: 0, y: 0 },
  entities: [],
  agents: []
};

state.entities = [
  {
    url: chair,
    pos: { x: 20, y: 305 },
    scale: 0.2
  },
  {
    url: fern,
    pos: { x: 300, y: 200 },
    scale: 0.9
  }
];

for (var i = 0; i < 15; i++) {
  state.entities.push({
    url: chair,
    pos: { x: nrandom() * 2000, y: nrandom() * 2000 },
    scale: nrandom() * 2
  });
  state.entities.push({
    url: fern,
    pos: { x: nrandom() * 2000, y: nrandom() * 2000 },
    scale: Math.random()
  });
}

function resize() {
  state.frame = { x: window.innerWidth, y: window.innerHeight };
  state.center = Vector.div(state.frame, 2);
}
resize();

window.onresize = resize;

function getState() {
  return state;
}
export { getState };
