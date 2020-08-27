import * as Matter from "matter-js";
import { getState } from "./state";
let Vector = Matter.Vector;

let speed = 2;
function moveAgent() {
  let state = getState();
  const { target, velocity, pos } = state;
  if (target != null) {
    if (Math.abs(target.x - pos.x) > 10) {
      state.velocity.x = speed * (target.x < pos.x ? -1 : 1);
    } else {
      state.velocity.x = 0;
    }
    if (Math.abs(target.y - pos.y) > 10) {
      state.velocity.y = speed * (target.y < pos.y ? -1 : 1);
    } else {
      state.velocity.y = 0;
    }
  }

  state.pos = Vector.add(pos, velocity);

  if (velocity.x < -0.1) {
    state.facing = true;
  }
  if (velocity.x > 0.1) {
    state.facing = false;
  }

  state.moving = false;
  if (Math.abs(velocity.x) > 0.01 || Math.abs(velocity.y) > 0.01) {
    state.moving = true;
  }
}

export { moveAgent, speed };
