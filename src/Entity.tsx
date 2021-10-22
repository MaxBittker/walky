import * as React from "react";
import { useState, useCallback, useRef } from "react";
import move from "./../assets/dragArea.png";
import X from "./../assets/close.png";
import subtract from "./../assets/duplicate.png";
import classNames from "classnames";
import { sendEntityUpdate } from "./client";
import * as Matter from "matter-js";
import { getState, getEntity, writeEntity } from "./state";
import { convertTarget } from "./input";
import { sendEntityDelete } from "./client";
import { v4 as uuidv4 } from "uuid";

let Vector = Matter.Vector;

let grabPos: Matter.Vector;

const urlParams = new URLSearchParams(window.location.search);
let editing = true;
// urlParams.get("edit") !== null;

export default function Entity({ url, pos, scale, uuid, i }) {
  let [mode, setMode] = useState("");
  let [selected, setSelected] = useState(false);
  let img = useRef<HTMLImageElement>(null);

  let unsetSelection = useCallback(() => {}, [setSelected, mode]);
  let mouseUp = useCallback(
    (e) => {
      if (mode === "move") {
        e.preventDefault();

        setMode("");
        console.log("not dragging");
        window.setTimeout(() => {
          window.dragging = false;
        }, 200);
      } else {
        if (!e.target.classList.contains("tool")) {
          setSelected(false);
        }
      }
    },
    [setSelected, setMode, mode]
  );

  let mouseMove = useCallback((e) => {
    if (!grabPos) {
      return;
    }

    e = e || window.event;
    e.preventDefault();

    let ent = getEntity(uuid);

    let convertedMouse = convertTarget({
      x: e.clientX,
      y: e.clientY,
    });
    ent.pos = Vector.add(grabPos, convertedMouse);
    writeEntity(uuid, ent);
    // getState().entities = entities;
  }, []);
  React.useEffect(() => {
    if (selected) {
      window.addEventListener("click", unsetSelection);
    }
    window.addEventListener("mouseup", mouseUp);
    if (selected && mode === "move") {
      window.addEventListener("mousemove", mouseMove);
    }

    return () => {
      window.removeEventListener("click", unsetSelection);
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("mouseup", mouseUp);
    };
  }, [unsetSelection, selected, mode]);

  let relPos = pos;
  return (
    <div
      style={{
        position: "absolute",
        left: relPos.x,
        top: relPos.y,
        transform: `translate(-50%, -50%) scale(${scale}) `,
        display: "flex",
        zIndex: 200 + (selected ? 100 : 0),
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (editing) {
          setSelected(true);
        }
      }}
      onMouseDown={(e) => {
        const { entities } = getState();

        let ent = getEntity(uuid);

        let convertedMouse = convertTarget({
          x: e.clientX,
          y: e.clientY,
        });
        grabPos = Vector.sub(ent.pos, convertedMouse);
      }}
      onWheel={(e) => {
        if (!selected) return;
        let ent = getEntity(uuid);

        ent.scale += e.deltaY * 0.001;

        writeEntity(uuid, ent);
      }}
    >
      {selected && (
        <span className="toolbar">
          <img
            src={move}
            className={"tool " + (false ? "active" : "")}
            id="move"
            draggable="false"
            onMouseDown={(e) => {
              e.preventDefault();
              setMode("move");
              console.log("dragging");

              window.dragging = true;
            }}
          />
          <img
            src={subtract}
            className={"tool " + (false ? "active" : "")}
            id="duplicate"
            onClick={(e) => {
              const { entities } = getState();

              let oldEnt = getEntity(uuid);

              let ent = { ...oldEnt };
              ent.uuid = uuidv4().slice(0, 8);
              entities.push(ent);
              oldEnt.pos = Vector.add(oldEnt.pos, { x: 30, y: 30 });
              getState().entities = entities;
              sendEntityUpdate(ent.uuid);
              sendEntityUpdate(uuid);
              e.preventDefault();
            }}
          />
          <img
            ref={img}
            src={X}
            className={"tool "}
            id="subtract-image"
            onMouseDown={(e) => {
              console.log("delete!!");
              sendEntityDelete(uuid);
            }}
          />
        </span>
      )}

      <img
        key={i}
        // uuid={uuid}
        className={classNames("photo", { selected })}
        src={window.location.origin + url}
        // src={"http://walky.space" + url}
        style={{
          left: 0,
          top: 0,
          bottom: 0,
          right: 0,
        }}
      />
    </div>
  );
}
