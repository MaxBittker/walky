import { getState } from "./state";
import { convertTarget } from "./utils";
function startInput() {
  window.addEventListener("click", event => {
    console.log("click");
    let state = getState();
    let eventPos = { x: event.pageX, y: event.pageY };
    state.target = convertTarget(eventPos);
  });

  window.addEventListener("touchmove", event => {
    event.preventDefault();

    let state = getState();

    const touches = event.targetTouches;
    for (let i = 0; i < touches.length; i++) {
      state.target = convertTarget({
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
      state.target = convertTarget({
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