import * as ReactDOM from "react-dom";
import * as React from "react";
import { useState } from "react";
import { useAtom } from "jotai";
import "./tools.css";
import { BrowserRouter as Router, useNavigate } from "react-router-dom";

import * as Matter from "matter-js";
import { getEntity, getState, lockedAtom } from "./state";
// import { AgentLayout } from "./types";
let Vector = Matter.Vector;
import add from "./../assets/upload.png";
import Aa from "./../assets/text.png";
import chat from "./../assets/chat.gif";
import "regenerator-runtime/runtime";

import {
  getEditCode,
  sendEntityDelete,
  sendEntityUpdate,
  setEditCode,
} from "./client";
import { EntityType } from "./types";
import { uploadImage } from "./imageUpload";
import SpaceSettings, { spaceStatusAtom } from "./SpaceSettings";
// import Login from "./auth/Login";
// import Authenticate from "./auth/Authenticate";
let lastCreated: string;

let fakeInput = document.getElementById("fake-input");

// Note: A single file comes from event.target.files on <input>
function imagePrompt(event: React.MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
  let el = document.getElementById("imgupload");
  el.click();
  let state = getState();
  state.me.target = state.me.pos;
}

function textAdd(event: React.MouseEvent) {
  event.preventDefault();
  event.stopPropagation();

  let state = getState();
  state.me.target = state.me.pos;
  if (lastCreated && getEntity(lastCreated)?.value === "New Text") {
    sendEntityDelete(lastCreated);
  }

  let newEnt = {
    value: "New Text",
    type: EntityType.Text,
    uuid: Math.random().toString().slice(2, 7),
    pos: Vector.add(state.me.pos, { x: 0, y: -80 }),
    size: { x: 164, y: 55 },
    scale: 1.0,
    rotation: 0.0,
    iid:
      state.entities.map((e) => e.iid).reduce((a, b) => Math.max(a, b), 1) + 1,
  };

  state.entities.push(newEnt);
  state.entities = state.entities.sort((a, b) => a.iid - b.iid);
  sendEntityUpdate(newEnt.uuid);
  lastCreated = newEnt.uuid;
}

async function imageUpload(e: React.ChangeEvent<HTMLInputElement>) {
  let files = e.target.files;
  if (!files || files.length == 0) {
    return;
  }

  Array.from(e.target.files).forEach(uploadImage);
}

function UI({}) {
  // let [infoOpen] = useState(false);
  let [locked, setLocked] = useAtom(lockedAtom);
  let [spaceStatus] = useAtom(spaceStatusAtom);

  const urlParams = new URLSearchParams(window.location.search);
  let editCode = urlParams.get("edit");
  const navigate = useNavigate();

  React.useEffect(() => {
    if (editCode) {
      setEditCode(editCode);
    }
    navigate(window.location.pathname);
  }, []);
  editCode = editCode || getEditCode();

  if (spaceStatus === "public") {
    editCode = "true";
  }
  return (
    <>
      <SpaceSettings />
      <div id="items">
        {!locked && !editCode && (
          <input
            id="pw-input"
            placeholder="edit code?"
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
            onSubmit={() => {
              //todo
              // if (editCode) {
              //   setEditCode(editCode);
              // }
              // navigate(window.location.pathname);
            }}
            onClick={(e) => e.stopPropagation()}
          ></input>
        )}
        {locked ? (
          <div
            className="tool"
            id="locked"
            onClick={(e) => {
              e.stopPropagation();
              setLocked(false);
            }}
          />
        ) : (
          <div
            className="tool"
            id="unlocked"
            onClick={(e) => {
              e.stopPropagation();
              setLocked(true);
            }}
          />
        )}

        <input
          type="file"
          multiple
          id="imgupload"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => imageUpload(e)}
        />
        {!locked && editCode && (
          <>
            {" "}
            <img
              src={add}
              className="tool"
              id="add-image"
              onClick={imagePrompt}
            />
            <img src={Aa} className="tool" id="add-text" onClick={textAdd} />
          </>
        )}

        <img
          src={chat}
          className="tool"
          id="chat-image"
          onClick={(e) => {
            e.stopPropagation();
            let state = getState();
            state.me.target = state.me.pos;
            fakeInput.focus();
          }}
        />
      </div>
    </>
  );
}

//   {infoOpen && (
//     <div id="info">
//       <img
//         alt="ok"
//         id="close"
//         onClick={(e) => {
//           e.stopPropagation();

//           this.setState({ infoOpen: false });
//         }}
//         src={X}
//       ></img>
//       <h1>
//         Please post images of the{" "}
//         <span style={{ textDecoration: "underline" }}>sky.</span>
//       </h1>
//       <br></br>
//       <p>(updated 9/12)</p>
//     </div>
//   )}
// </div>
function startUI() {
  console.log("starting");

  ReactDOM.render(
    <Router>
      <UI />
    </Router>,
    document.getElementById("ui")
  );
}

export { startUI };
