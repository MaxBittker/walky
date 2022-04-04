import * as Matter from "matter-js";
import { AgentLayout } from "./types";
let Vector = Matter.Vector;

let topSpeed = 3;
let epsilon = 1;
function updateAgent(agent: AgentLayout, elapsed: number) {
  agent.timeIdle += elapsed;
  const { target, pos } = agent;
  let velocity = { x: 0, y: 0 };
  let heading = Vector.normalise(Vector.sub(target, pos));
  let distance = Vector.magnitude(Vector.sub(pos, target));
  let speed = Math.min(topSpeed, distance);
  if (distance < epsilon) {
    speed = 0;
  }
  let dT = Math.min(speed * elapsed, distance);
  velocity = Vector.mult(heading, dT);

  agent.pos = Vector.add(pos, velocity);
  // this might not be consistent
  if (velocity.x < -0.1) {
    agent.facing = true;
  }
  if (velocity.x > 0.1) {
    agent.facing = false;
  }

  agent.animation = "stand";
  if (Math.abs(velocity.x) > 0.02 || Math.abs(velocity.y) > 0.02) {
    agent.animation = "move";
    agent.timeIdle = 0;
  }
  if (agent.timeIdle > 3000) {
    agent.animation = "sit";
  }
  return agent;
}

export { updateAgent, topSpeed };
