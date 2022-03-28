import * as Matter from "matter-js";
import { AgentLayout } from "./types";
let Vector = Matter.Vector;

let topSpeed = 3;
let epsilon = 1;
function updateAgent(agent: AgentLayout, elapsed: number) {
  const { target, pos } = agent;
  let velocity = { x: 0, y: 0 };
  let heading = Vector.normalise(Vector.sub(target, pos));
  let distance = Vector.magnitude(Vector.sub(pos, target));
  let speed = Math.min(topSpeed, distance);
  if (distance < epsilon) {
    speed = 0;
  }
  velocity = Vector.mult(heading, speed);

  agent.pos = Vector.add(pos, Vector.mult(velocity, elapsed));
  // this might not be consistent
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

export { updateAgent, topSpeed };
