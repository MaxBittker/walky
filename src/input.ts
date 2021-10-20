import { getState } from "./state";
import * as Matter from "matter-js";
import { start_audio } from "./audio";
let Vector = Matter.Vector;

let zoom = window.innerWidth <= 600 ? 0.6 : 1.0;
window.addEventListener("resize", () => {
  zoom = window.innerWidth <= 600 ? 0.6 : 1.0;
});

function convertTarget(t: Matter.Vector) {
  const { camera, center } = getState();
  // let zCamera = Vector.div(camera, zoom);
  let zCenter = center;
  let zPos = Vector.div(t, zoom);
  // console.log(t);
  return Vector.sub(Vector.add(zPos, camera), zCenter);
}
let mouseDown = false;
function startInput() {
  window.addEventListener("click", (event) => {
    // event.preventDefault();
    start_audio();

    if (window.dragging) return;

    let state = getState();
    let eventPos = { x: event.pageX, y: event.pageY };
    state.me.target = convertTarget(eventPos);
  });
  window.addEventListener("mousedown", (event) => {
    mouseDown = true;
  });
  window.addEventListener("mouseup", (event) => {
    mouseDown = false;
  });
  window.addEventListener("mouseleave", (event) => {
    mouseDown = false;
  });
  window.addEventListener("mousemove", (event) => {
    // event.preventDefault();
    if (!mouseDown || window.dragging) return;
    let state = getState();
    let eventPos = { x: event.pageX, y: event.pageY };
    state.me.target = convertTarget(eventPos);
  });

  window.addEventListener("touchmove", (event) => {
    event.preventDefault();

    let state = getState();

    const touches = event.targetTouches;
    for (let i = 0; i < touches.length; i++) {
      state.me.target = convertTarget({
        x: touches[i].pageX,
        y: touches[i].pageY,
      });
    }
  });

  window.addEventListener("touchstart", (event) => {
    // event.preventDefault();
    let state = getState();

    const touches = event.targetTouches;

    for (let i = 0; i < touches.length; i++) {
      state.me.target = convertTarget({
        x: touches[i].pageX,
        y: touches[i].pageY,
      });
    }
  });

  let left = false;
  let up = false;
  let right = false;
  let down = false;
  let keypoll: number;
  window.addEventListener("keydown", (event) => {
    let { key, keyCode } = event;
    let { me } = getState();
    if (key == "Control") {
      console.log("focusing");
      document.getElementById("fake-input").focus();
    }
    if (event.getModifierState("Control")) {
      return;
    }
    if (!me.word) {
      me.word = "";
    }
    if (key.length == 1) {
      if (me.word.length >= 3) {
        me.word = me.word.slice(1);
      }
      me.word += key;
    }
    if (key == "Backspace" || key == "Delete") {
      event.preventDefault();
      me.word = me.word.slice(0, me.word.length - 1);
    }
    if (keyCode === 37) {
      left = true;
    }
    if (keyCode === 38) {
      up = true;
    }
    if (keyCode === 39) {
      right = true;
    }
    if (keyCode === 40) {
      down = true;
    }
    keypoll = window.setInterval(pollKeys, 16);
  });
  window.addEventListener("keyup", (event) => {
    let { keyCode } = event;
    if (keyCode === 37) {
      left = false;
    }
    if (keyCode === 38) {
      up = false;
    }
    if (keyCode === 39) {
      right = false;
    }
    if (keyCode === 40) {
      down = false;
    }

    if (!(left || right || up || down)) {
      let state = getState();
      state.me.target = state.me.pos;
    }
  });
  function pollKeys() {
    if (!(left || right || up || down)) {
      window.clearInterval(keypoll);
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
    let keyTarget = Vector.add(state.me.pos, Vector.mult(velocity, 25));
    state.me.target = keyTarget;
  }
}

export { startInput, convertTarget };
