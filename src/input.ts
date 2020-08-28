import { getState } from "./state";
import * as Matter from "matter-js";
let Vector = Matter.Vector;

function convertTarget(t: Matter.Vector) {
  const { camera, center } = getState();
  return Vector.sub(Vector.add(t, camera), center);
}

function startInput() {
  window.addEventListener("click", event => {
    event.preventDefault();

    let state = getState();
    let eventPos = { x: event.pageX, y: event.pageY };
    state.me.target = convertTarget(eventPos);
  });

  window.addEventListener("touchmove", event => {
    event.preventDefault();

    let state = getState();

    const touches = event.targetTouches;
    for (let i = 0; i < touches.length; i++) {
      state.me.target = convertTarget({
        x: touches[i].pageX,
        y: touches[i].pageY
      });
    }
  });

  window.addEventListener("touchstart", event => {
    event.preventDefault();
    let state = getState();

    const touches = event.targetTouches;

    for (let i = 0; i < touches.length; i++) {
      state.me.target = convertTarget({
        x: touches[i].pageX,
        y: touches[i].pageY
      });
    }
  });

  let left = false;
  let up = false;
  let right = false;
  let down = false;

  window.addEventListener("keydown", event => {
    if (event.keyCode === 37) {
      left = true;
    }
    if (event.keyCode === 38) {
      up = true;
    }
    if (event.keyCode === 39) {
      right = true;
    }
    if (event.keyCode === 40) {
      down = true;
    }
  });
  window.addEventListener("keyup", event => {
    if (event.keyCode === 37) {
      left = false;
    }
    if (event.keyCode === 38) {
      up = false;
    }
    if (event.keyCode === 39) {
      right = false;
    }
    if (event.keyCode === 40) {
      down = false;
    }
  });
  function pollKeys() {
    if (!(left || right || up || down)) {
      return;
    }
    let velocity = { x: 0, y: 0 };
    if (left) {
      velocity.x -= 1.0;
    }
    if (right) {
      velocity.x += 1.0;
    }
    if (up) {
      velocity.y -= 1.0;
    }
    if (down) {
      velocity.y += 1.0;
    }

    let state = getState();
    let keyTarget = Vector.add(state.me.pos, Vector.mult(velocity, 5));
    state.me.target = keyTarget;
  }
  window.setInterval(pollKeys, 16);
}

export { startInput };
