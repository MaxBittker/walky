import * as React from "react";
import ReactDOM = require("react-dom");
import walk from "./../assets/walk2.gif";
import stand from "./../assets/stand1.gif";
// import bubble from "./../assets/bubble.png";
import classNames from "classnames";
import { sendEntityUpdate } from "./client";
import * as Matter from "matter-js";
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
        className={classNames({
          deleting: window.deleteMode,
          moving: window.moveMode
        })}
        style={{ transform: `translate(${cameraPos.x}px,${cameraPos.y}px ) ` }}
      >
        <div id="info">
          <h2>
            Please post the spookiest photo in your camera roll / downloads
            folder.
          </h2>
          <p style={{ float: "right" }}>(updated 10/23)</p>
        </div>
        {entities.map(({ url, pos, scale, uuid }, i) => {
          // let relPos = Vector.add(Vector.sub(pos, camera), center);
          let relPos = pos;
          return (
            <img
              key={i}
              onClick={e => {
                e.stopPropagation();
                window.deleteMode && window.deleteImage(uuid);
              }}
              uuid={uuid}
              className="photo"
              // src={window.location.origin + url}
              src={"http://walky.space" + url}
              style={{
                left: relPos.x,
                top: relPos.y,
                transform: `translate(-50%, -50%) scale(${scale}) `
              }}
            />
          );
        })}
      </div>
    </React.Fragment>
  );
  ReactDOM.render(element, document.getElementById("window"));
  dragElement(document.getElementById("window"));
}

function dragElement(elmnt) {
  let grabPos: Matter.Vector;
  let activeUUID: string;
  elmnt.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    if (!e.target.classList.contains("photo")) {
      return;
    }
    e = e || window.event;
    e.preventDefault();

    const { entities } = getState();
    let i = entities.findIndex(({ uuid }) => {
      return uuid === e.target.getAttribute("uuid").toString();
    });
    let ent = entities[i];

    let convertedMouse = convertTarget({
      x: e.clientX,
      y: e.clientY
    });
    grabPos = Vector.sub(ent.pos, convertedMouse);
    activeUUID = e.target.getAttribute("uuid").toString();

    console.log("startDrag");
    document.body.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.body.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    if (!grabPos) {
      return;
    }

    e = e || window.event;
    e.preventDefault();

    // set the element's new position:
    const { entities } = getState();

    let i = entities.findIndex(({ uuid }) => {
      return uuid === activeUUID;
    });
    let ent = entities[i];

    let convertedMouse = convertTarget({
      x: e.clientX,
      y: e.clientY
    });
    ent.pos = Vector.add(grabPos, convertedMouse);

    entities[i] = ent;
    getState().entities = entities;

    // sendEntityUpdate(activeUUID);
  }

  function closeDragElement() {
    sendEntityUpdate(activeUUID);
    // stop moving when mouse button is released:
    grabPos = null;
    activeUUID = null;
    document.body.onmouseup = null;
    document.body.onmousemove = null;
  }
}

export { render };
