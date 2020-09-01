import * as Matter from "matter-js";
import { AgentLayout } from "./types";
let Vector = Matter.Vector;

let speed = 3;
function updateAgent(agent: AgentLayout, tick: number) {
  const { target, pos, lastUpdated } = agent;
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

  let elapsedticks = tick - lastUpdated;
  // if (elapsedticks > 3) console.log(elapsedticks);
  elapsedticks = Math.min(elapsedticks, 3);
  //   console.log(tick, lastUpdated);
  agent.pos = Vector.add(pos, Vector.mult(velocity, elapsedticks));
  agent.lastUpdated = tick;
  if (velocity.x < -0.1) {
    agent.facing = true;
  }
  if (velocity.x > 0.1) {
    agent.facing = false;
  }

  agent.moving = false;
  if (Math.abs(velocity.x) > 0.01 || Math.abs(velocity.y) > 0.01) {
    agent.moving = true;
  }
  return agent;
}

export { updateAgent, speed };
