import * as Matter from "matter-js";
import { getState } from "./state";
let Vector = Matter.Vector;

function convertTarget(t: Matter.Vector) {
  const { camera, center } = getState();
  return Vector.sub(Vector.add(t, camera), center);
}

function nrandom() {
  return Math.random() - 0.5;
}
export { convertTarget, nrandom };
