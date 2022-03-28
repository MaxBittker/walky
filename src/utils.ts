import * as Matter from "matter-js";

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

export { nrandom, randomVec };
