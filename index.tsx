import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import image from "./assets/walk1.gif";

let imageHTML = ReactDOMServer.renderToStaticMarkup(
  <img id="walker" src={image}></img>
);
let wd = document.getElementById("window");

wd.innerHTML = imageHTML;
let walker = document.getElementById("walker");

let x = 200;
let y = 200;
let vx = 0;
let vy = 0;

let targetX: ?Number = null;
let targetY: ?Number = null;

window.addEventListener("click", event => {
  targetX = event.pageX;
  targetY = event.pageY;
});
window.addEventListener("keydown", event => {
  targetX = null;
  targetY = null;
  if (event.keyCode === 37) {
    vx = -3;
  }
  if (event.keyCode === 38) {
    vy = -3;
  }
  if (event.keyCode === 39) {
    vx = 3;
  }
  if (event.keyCode === 40) {
    vy = 3;
  }
  console.log(event.keyCode);
});
window.addEventListener("keyup", event => {
  if (event.keyCode === 37) {
    vx = -0.000000001;
  }
  if (event.keyCode === 38) {
    vy = -0;
  }
  if (event.keyCode === 39) {
    vx = 0;
  }
  if (event.keyCode === 40) {
    vy = 0;
  }
  console.log(event.keyCode);
});
function tick() {
  if (targetX != null) {
    if( Math.abs(targetX-x)>10){
      vx = 3 * (targetX < x ? -1 : 1);
    }else{
      vx = 0;
    }
    if( Math.abs(targetY-y)>10 ){
     vy = 3 * (targetY < y ? -1 : 1);
    }else{
      vy = 0
    }
  }

  x += vx;
  y += vy;


  walker.style = `left: ${x}; top: ${y};   transform: translate(-50%, -50%) scaleX(${
    vx < 0 ? -1 : 1
  });`;
  window.requestAnimationFrame(tick);
}

window.requestAnimationFrame(tick);
