import * as React from "react";
import ReactDOM = require("react-dom");
// import * as ReactDOMServer from "react-dom/server";
import walk from "./../assets/walk1.gif";
import stand from "./../assets/stand1.gif";
import * as Matter from "matter-js";
import { getState, AgentLayout } from "./state";
let Vector = Matter.Vector;

function renderAgent(agent: AgentLayout) {
  let { pos, moving, facing } = agent;
  let { camera, center } = getState();

  let newsrc = moving ? walk : stand;
  let relPos = Vector.add(Vector.sub(pos, camera), center);

  return (
    <img
      id="walker"
      src={newsrc}
      style={{
        left: relPos.x,
        top: relPos.y,
        transform: `translate(-50%, -75%) scaleX(${facing ? -1 : 1})`
      }}
    ></img>
  );
}
function render() {
  const { camera, entities, me, agents } = getState();

  const element = (
    <React.Fragment>
      {renderAgent(me)}
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
