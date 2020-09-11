import * as React from "react";
import ReactDOM = require("react-dom");
import walk from "./../assets/walk2.gif";
import stand from "./../assets/stand1.gif";
import bubble from "./../assets/bubble.png";
import * as Matter from "matter-js";
import { getState } from "./state";
import { AgentLayout } from "./types";
let Vector = Matter.Vector;

let zoom = window.innerWidth <= 600 ? 1.0 : 1.0;
window.addEventListener("resize", () => {
  zoom = window.innerWidth <= 600 ? 1.0 : 1.0;
});

function renderAgent(agent: AgentLayout) {
  let { camera, center, me } = getState();
  if (agent.uuid == me.uuid) {
    agent = me;
  }
  let { pos, moving, facing, color, word } = agent;

  let newsrc = moving ? walk : stand;
  let relPos = Vector.add(Vector.sub(pos, camera), center);

  return (
    <React.Fragment>
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
          top: relPos.y
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
          transform: `translate(-50%, -75%) scaleX(${facing ? -1 : 1})`
        }}
      ></img>
    </React.Fragment>
  );
}
function render() {
  const { camera, entities, me, agents, center } = getState();
  const cameraPos = Vector.sub(center, camera);
  const element = (
    <React.Fragment>
      {agents.map(renderAgent)}
      <div
        id="entities"
        className={window.deleteMode ? "deleting" : ""}
        style={{ transform: `translate(${cameraPos.x}px,${cameraPos.y}px ) ` }}
      >
        {entities.map(({ url, pos, scale, uuid }, i) => {
          // let relPos = Vector.add(Vector.sub(pos, camera), center);
          let relPos = pos;
          return (
            <img
              key={i}
              onClick={e => {
                e.stopPropagation();
                window.deleteImage(uuid);
              }}
              src={window.location.origin + url}
              // src={"http://walky.space" + url}
              style={{
                left: relPos.x,
                top: relPos.y,
                transform: `translate(-50%, -50%) scale(${scale * zoom}) `
              }}
            />
          );
        })}
      </div>
    </React.Fragment>
  );
  ReactDOM.render(element, document.getElementById("window"));
}

export { render };
