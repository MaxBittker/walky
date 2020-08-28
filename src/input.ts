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

  // window.addEventListener("keydown", event => {
  //   target = null;

  //   if (event.keyCode === 37) {
  //     velocity.x = -speed;
  //   }
  //   if (event.keyCode === 38) {
  //     velocity.y = -speed;
  //   }
  //   if (event.keyCode === 39) {
  //     velocity.x = speed;
  //   }
  //   if (event.keyCode === 40) {
  //     velocity.y = speed;
  //   }
  // });
  // window.addEventListener("keyup", event => {
  //   if (event.keyCode === 37) {
  //     velocity.x = -0;
  //   }
  //   if (event.keyCode === 38) {
  //     velocity.y = -0;
  //   }
  //   if (event.keyCode === 39) {
  //     velocity.x = 0;
  //   }
  //   if (event.keyCode === 40) {
  //     velocity.y = 0;
  //   }
  // });
}

export { startInput };
