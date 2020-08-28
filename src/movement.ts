import * as Matter from "matter-js";
import { AgentLayout } from "./types";
import { elapsedMillis } from "./utils";
let Vector = Matter.Vector;

let speed = 2;
function updateAgent(agent: AgentLayout) {
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

  agent.pos = Vector.add(
    pos,
    Vector.mult(velocity, elapsedMillis(lastUpdated) / 16)
  );
  agent.lastUpdated = Date.now();
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
