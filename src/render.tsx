import * as React from "react";
import ReactDOM = require("react-dom");
import walk from "./../assets/walk1.gif";
import stand from "./../assets/stand1.gif";
import * as Matter from "matter-js";
import { getState } from "./state";
import { AgentLayout } from "./types";
let Vector = Matter.Vector;

function renderAgent(agent: AgentLayout) {
  let { camera, center, me } = getState();
  if (agent.uuid == me.uuid) {
    agent = me;
  }
  let { pos, moving, facing, color } = agent;

  let newsrc = moving ? walk : stand;
  let relPos = Vector.add(Vector.sub(pos, camera), center);

  return (
    <img
      id="walker"
      src={newsrc}
      style={{
        left: relPos.x,
        top: relPos.y,
        filter: `sepia(1) saturate(2.5) hue-rotate(${color}deg)`,
        transform: `translate(-50%, -75%) scaleX(${facing ? -1 : 1})`
      }}
    ></img>
  );
}
function render() {
  const { camera, entities, me, agents } = getState();
  const element = (
    <React.Fragment>
      {agents.map(renderAgent)}
      {entities.map(({ url, pos, scale }, i) => {
        let relPos = Vector.sub(pos, camera);
        return (
          <img
            key={i}
            src={url}
            style={{
              left: relPos.x,
              top: relPos.y,
              transform: `scale(${scale}) `,
              filter: `hue-rotate(${i}deg)`
            }}
          />
        );
      })}
    </React.Fragment>
  );
  ReactDOM.render(element, document.getElementById("window"));
}

export { render };
