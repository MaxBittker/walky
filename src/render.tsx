import * as React from "react";
import ReactDOM = require("react-dom");
import walk from "./../assets/ear_walk.gif";
// import walk from "./../assets/walk1.gif";
// import stand from "./../assets/stand1.gif";
import stand from "./../assets/ear_stand.gif";
// import bubble from "./../assets/bubble.png";
import { sendEntityUpdate } from "./client";
import * as Matter from "matter-js";
import Entity from "./Entity";
import { getState } from "./state";
import { AgentLayout } from "./types";
import { convertTarget } from "./input";
let Vector = Matter.Vector;

// let zoom = window.innerWidth <= 600 ? 1.0 : 1.0;
// window.addEventListener("resize", () => {
//   zoom = window.innerWidth <= 600 ? 1.0 : 1.0;
// });

function renderAgent(agent: AgentLayout, i: number) {
  let { camera, center, me } = getState();
  if (agent.uuid == me.uuid) {
    agent = me;
  }
  let { pos, moving, facing, color, word } = agent;

  let newsrc = moving ? walk : stand;
  let relPos = Vector.add(Vector.sub(pos, camera), center);

  return (
    <React.Fragment key={i}>
      {/* {!word && (
        <img
          className="bubble"
          src={bubble}
          style={{
            left: relPos.x,
            top: relPos.y
            // filter: `sepia(1) saturate(2.5) hue-rotate(${color}deg)`,
            // transform: `translate(-50%, -75%)`
          }}
        ></img>
      )} */}
      <h1
        className="speech"
        key={"w" + agent.uuid}
        style={{
          left: relPos.x,
          top: relPos.y,
          // filter: `sepia(1) saturate(2.5) hue-rotate(${color}deg)`,
          // transform: `translate(-50%, -75%)`
        }}
      >
        {word}
      </h1>
      <img
        id="walker"
        src={newsrc}
        key={agent.uuid}
        style={{
          left: relPos.x,
          top: relPos.y,
          filter: `sepia(1) saturate(2.5) hue-rotate(${color}deg)`,
          transform: `translate(-50%, -75%) scaleX(${facing ? -1 : 1})`,
        }}
      ></img>
    </React.Fragment>
  );
}
function render() {
  const { camera, entities, me, agents, center, audios } = getState();
  const cameraPos = Vector.sub(center, camera);
  const element = (
    <React.Fragment>
      {/* <div
        id="background"
        style={{
          backgroundPosition: `${cameraPos.x * 0.5}px,${cameraPos.y * 0.5}px `
        }}
      ></div> */}
      {agents.map(renderAgent)}
      <div
        id="entities"
        style={{ transform: `translate(${cameraPos.x}px,${cameraPos.y}px ) ` }}
      >
        <div id="info">
          <h2>Welcome!</h2>
          {/* <h2>note: walky.space contains loud or scary sounds today</h2> */}
          <p style={{ float: "right" }}>The space is under construction </p>
        </div>
        {/* {audios.map(({ url, pos, name }, i) => {
          // let relPos = Vector.add(Vector.sub(pos, camera), center);
          let relPos = pos;
          return (
            <h1
              key={i}
              className="photo audio"
              style={{
                left: relPos.x,
                top: relPos.y,
                transform: `translate(-50%, -50%)`,
              }}
            >
              {name}
            </h1>
          );
        })} */}

        {entities.map(({ url, pos, size, rotation, scale, uuid }, i) => {
          // let relPos = Vector.add(Vector.sub(pos, camera), center);
          return (
            <Entity
              key={uuid}
              url={url}
              pos={pos}
              size={size}
              rotation={rotation}
              scale={scale}
              uuid={uuid}
              i={i}
            ></Entity>
          );
        })}
      </div>
    </React.Fragment>
  );
  ReactDOM.render(element, document.getElementById("window"));
}

export { render };
