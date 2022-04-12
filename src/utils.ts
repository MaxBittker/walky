import * as Vector from "@graph-ts/vector2";

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
  return Vector.length(Vector.subtract(a, b));
}
function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

export { nrandom, randomVec, distance, clamp };
