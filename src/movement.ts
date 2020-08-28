import * as Matter from "matter-js";
import { getState } from "./state";
let Vector = Matter.Vector;

let speed = 2;
function moveAgent() {
  let state = getState();
  const { target, pos } = state.me;
  let velocity = { x: 0, y: 0 };
  if (target != null) {
    if (Math.abs(target.x - pos.x) > 10) {
      velocity.x = speed * (target.x < pos.x ? -1 : 1);
    } else {
      velocity.x = 0;
    }
    if (Math.abs(target.y - pos.y) > 10) {
      velocity.y = speed * (target.y < pos.y ? -1 : 1);
    } else {
      velocity.y = 0;
    }
  }

  state.me.pos = Vector.add(pos, velocity);

  if (velocity.x < -0.1) {
    state.me.facing = true;
  }
  if (velocity.x > 0.1) {
    state.me.facing = false;
  }

  state.me.moving = false;
  if (Math.abs(velocity.x) > 0.01 || Math.abs(velocity.y) > 0.01) {
    state.me.moving = true;
  }
}

export { moveAgent, speed };
