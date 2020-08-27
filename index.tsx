import * as React from "react";
import ReactDOM from "react-dom";
import * as ReactDOMServer from "react-dom/server";
import walk from "./assets/walk1.gif";
import stand from "./assets/stand1.gif";
import chair from "./assets/Classroom+Chair.jpg";
import fern from "./assets/fern.jpg";
import * as Matter from "matter-js";
let Vector = Matter.Vector;

let frame = { x: window.innerWidth, y: window.innerHeight };
let center = Vector.div(frame, 2);
let pos: Matter.Vector = { x: 200, y: 200 };
let camera: Matter.Vector = { x: 200, y: 200 };
let velocity: Matter.Vector = { x: 0, y: 0 };

let target: Matter.Vector = null;

function convertTarget(t: Matter.Vector) {
  return Vector.sub(Vector.add(t, camera), center);
}
window.addEventListener("click", event => {
  let eventPos = { x: event.pageX, y: event.pageY };

  target = convertTarget(eventPos);
});

window.addEventListener("touchmove", event => {
  // event. preventDefault();
  const touches = event.targetTouches;

  for (let i = 0; i < touches.length; i++) {
    target = convertTarget({ x: touches[i].pageX, y: touches[i].pageY });
  }
});

window.addEventListener("touchstart", event => {
  // event. preventDefault();
  const touches = event.targetTouches;

  for (let i = 0; i < touches.length; i++) {
    target = convertTarget({ x: touches[i].pageX, y: touches[i].pageY });
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
let imgs = [
  {
    url: chair,
    pos: { x: 20, y: 305 },
    scale: 0.2
  },
  {
    url: fern,
    pos: { x: 300, y: 200 },
    scale: 0.9
  }
];
function nrandom() {
  return Math.random() - 0.5;
}
for (var i = 0; i < 15; i++) {
  imgs.push({
    url: chair,
    pos: { x: nrandom() * 2000, y: nrandom() * 2000 },
    scale: nrandom() * 2
  });
  imgs.push({
    url: fern,
    pos: { x: nrandom() * 2000, y: nrandom() * 2000 },
    scale: Math.random()
  });
}
function render() {
  let moving = false;
  if (Math.abs(velocity.x) > 0.01 || Math.abs(velocity.y) > 0.01) {
    moving = true;
  }
  let newsrc = moving ? walk : stand;
  let relPos = Vector.add(Vector.sub(pos, camera), center);

  const element = (
    <React.Fragment>
      <img
        id="walker"
        src={newsrc}
        style={{
          left: relPos.x,
          top: relPos.y,
          transform: `translate(-50%, -75%) scaleX(${velocity.x < 0 ? -1 : 1})`
        }}
      ></img>

      {imgs.map(({ url, pos, scale }, i) => {
        let relPos = Vector.sub(pos, camera);
        return (
          <img
            key={i}
            src={url}
            style={{
              left: relPos.x,
              top: relPos.y,
              transform: `scale(${scale}) `
            }}
          />
        );
      })}
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

  let distanceFromPos = Vector.magnitude(Vector.sub(pos, camera));

  let camera_speed = speed;
  if (distanceFromPos < Vector.magnitude(frame) / 20) {
    camera_speed = 0;
  }
  camera_speed *= distanceFromPos / 400;
  let directionTowardsPos = Vector.normalise(Vector.sub(pos, camera));
  camera = Vector.add(camera, Vector.mult(directionTowardsPos, camera_speed));

  render();

  window.requestAnimationFrame(tick);
}

window.requestAnimationFrame(tick);
