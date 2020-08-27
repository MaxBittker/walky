import * as React from "react";
import ReactDOM from "react-dom";
import * as ReactDOMServer from "react-dom/server";
import walk from "./assets/walk1.gif";
import stand from "./assets/stand1.gif";
import * as Matter from "matter-js";
let Vector = Matter.Vector;

// let imageHTML = ReactDOMServer.renderToStaticMarkup(
//   <img id="walker" src={walk}></img>
// );
// let wd = document.getElementById("window");

// wd.innerHTML = imageHTML;
// let walker = document.getElementById("walker");

let pos: Matter.Vector = { x: 200, y: 200 };
let camera: Matter.Vector = { x: 200, y: 200 };
let velocity: Matter.Vector = { x: 0, y: 0 };

let target: Matter.Vector = null;

window.addEventListener("click", event => {
  target = { x: event.pageX, y: event.pageY };
});

window.addEventListener("touchmove", event => {
  // event. preventDefault();
  const touches = event.targetTouches;

  for (let i = 0; i < touches.length; i++) {
    target = { x: touches[i].pageX, y: touches[i].pageY };
  }
});

window.addEventListener("touchstart", event => {
  // event. preventDefault();
  const touches = event.targetTouches;

  for (let i = 0; i < touches.length; i++) {
    target = { x: touches[i].pageX, y: touches[i].pageY };
  }
});

let speed = 2;
window.addEventListener("keydown", event => {
  target = null;
  if (event.keyCode === 37) {
    velocity.x = -speed;
  }
  if (event.keyCode === 38) {
    velocity.y = -speed;
  }
  if (event.keyCode === 39) {
    velocity.x = speed;
  }
  if (event.keyCode === 40) {
    velocity.y = speed;
  }
});

function render() {
  let moving = false;
  if (Math.abs(velocity.x) > 0.01 || Math.abs(velocity.y) > 0.01) {
    moving = true;
  }
  let newsrc = moving ? walk : stand;

  const element = (
    <React.Fragment>
      <h2>It is {new Date().toLocaleTimeString()}.</h2>
      <img
        id="walker"
        src={newsrc}
        style={{
          left: pos.x,
          top: pos.y,
          transform: `translate(-50%, -50%) scaleX(${velocity.x < 0 ? -1 : 1})`
        }}
      ></img>
    </React.Fragment>
  );
  ReactDOM.render(element, document.getElementById("window"));
}
window.addEventListener("keyup", event => {
  if (event.keyCode === 37) {
    velocity.x = -0.000000001;
  }
  if (event.keyCode === 38) {
    velocity.y = -0;
  }
  if (event.keyCode === 39) {
    velocity.x = 0;
  }
  if (event.keyCode === 40) {
    velocity.y = 0;
  }
});
function tick() {
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

  pos = Vector.add(pos, velocity);

  render();

  window.requestAnimationFrame(tick);
}

window.requestAnimationFrame(tick);
