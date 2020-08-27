import * as Matter from "matter-js";
import chair from "./../assets/Classroom+Chair.jpg";
import fern from "./../assets/fern.jpg";
import { nrandom } from "./utils";
let Vector = Matter.Vector;

interface EntityLayout {
  url: String;
  pos: Matter.Vector;
  scale: Number;
}

interface StateLayout {
  facing: Boolean;
  moving: Boolean;
  pos: Matter.Vector;
  velocity: Matter.Vector;
  target?: Matter.Vector;
  camera: Matter.Vector;
  frame: Matter.Vector;
  center: Matter.Vector;
  entities: EntityLayout[];
}

let state: StateLayout = {
  facing: true,
  moving: false,
  pos: { x: 200, y: 200 },
  velocity: { x: 0, y: 0 },
  target: undefined,
  camera: { x: 200, y: 200 },
  frame: { x: 0, y: 0 },
  center: { x: 0, y: 0 },
  entities: []
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
