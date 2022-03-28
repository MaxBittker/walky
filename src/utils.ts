import * as Matter from "matter-js";
let Vector = Matter.Vector;

function nrandom(s = 1) {
  return (Math.random() - 0.5) * s;
}
function randomVec(r = 1) {
  let ang = Math.random() * 2 * Math.PI,
    hyp = (Math.sqrt(Math.random()) * r) / 2,
    adj = Math.cos(ang) * hyp,
    opp = Math.sin(ang) * hyp;
  return { x: adj, y: opp };
}
function distance(a: Matter.Vector, b: Matter.Vector) {
  return Vector.magnitude(Vector.sub(a, b));
}
export { nrandom, randomVec, distance };
