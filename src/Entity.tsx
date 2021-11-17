import * as React from "react";
import { useState, useCallback, useRef } from "react";
import { Simulate } from "react-dom/test-utils";
import X from "./../assets/close.png";
import subtract from "./../assets/duplicate.png";
import classNames from "classnames";
import { sendEntityUpdate } from "./client";
import * as Matter from "matter-js";
import { Vector } from "matter-js";

import { getState, getEntity, writeEntity } from "./state";
import { convertTarget, deconvertTarget } from "./input";
import { sendEntityDelete } from "./client";
import { v4 as uuidv4 } from "uuid";

let V = Matter.Vector;

let grabPos: Matter.Vector;

const urlParams = new URLSearchParams(window.location.search);
let editing = true;
// urlParams.get("edit") !== null;
let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");
// document.body.appendChild(ctx.canvas); // used for debugging
function checkImageCoord(
  img_element: HTMLElement,
  pos: Vector,
  scale: number,
  rotation: number,
  event: MouseEvent
) {
  if (!ctx) {
    return img_element;
  }
  // non-image elements are always considered opaque
  if (img_element?.tagName !== "IMG") {
    return img_element;
  }

  // Get click coordinates
  let x = event.clientX;
  let y = event.clientY;
  let w = (ctx.canvas.width = window.innerWidth);
  let h = (ctx.canvas.height = window.innerHeight);

  ctx.clearRect(0, 0, w, h);

  let pc = deconvertTarget(pos);
  ctx.translate(pc.x, pc.y);
  ctx.scale(scale, scale);
  ctx.rotate(rotation / (180 / Math.PI));

  ctx.drawImage(
    img_element,
    -img_element.width / 2,
    -img_element.height / 2,
    img_element.width,
    img_element.height
  );
  ctx.resetTransform();
  let alpha = 1;
  try {
    alpha = ctx.getImageData(x, y, 1, 1).data[3]; // [0]R [1]G [2]B [3]A
    if (!img_element.complete) {
      alpha = 1;
    }
  } catch (e) {
    console.warn(`add crossorigin="anonymous" to your img`);
  }
  // If pixel is transparent, then retrieve the element underneath
  // and trigger it's click event
  if (alpha === 0) {
    img_element.style.pointerEvents = "none";
    let nextTarget = document.elementFromPoint(event.clientX, event.clientY);
    let nextEl = null;
    if (nextTarget && nextTarget.classList.contains("draggable")) {
      //todo drop dom reads here
      let scale = getCurrentScale(nextTarget);
      let rotation = getCurrentRotation(nextTarget) * (180 / Math.PI);
      let styles = window.getComputedStyle(nextTarget);
      let pos = {
        x: parseFloat(styles.left),
        y: parseFloat(styles.top),
      };

      nextEl = checkImageCoord(nextTarget, pos, scale, rotation, event);
    }
    img_element.style.pointerEvents = "auto";
    return nextEl;
  } else {
    //image is opaque at location
    return img_element;
  }
}

function magnitude(a) {
  return Math.sqrt(Math.pow(a.x, 2) + Math.pow(a.y, 2));
}
function angle(b) {
  return Math.atan2(b.y, b.x); //radians
}

function distance(a, b) {
  return magnitude(V.sub(a, b));
}

export default function Entity({
  url,
  pos,
  size,
  scale,
  rotation,
  uuid,
  i,
}: {
  url: string;
  pos: Vector;
  size: Vector;
  scale: number;
  rotation: number;
  uuid: string;
  i: number;
}) {
  let [mode, setMode] = useState("");
  let [selected, setSelected] = useState(false);
  let [startScale, setStartScale] = useState<number>(NaN);
  let img = useRef<HTMLImageElement>(null);
  let handleContainer = useRef<HTMLDivElement>(null);
  let handle = useRef<HTMLDivElement>(null);

  let unsetSelection = useCallback(() => {}, [setSelected, mode]);
  let mouseUp = useCallback(
    (e) => {
      if (mode === "move") {
        e.preventDefault();

        setMode("");
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
    ent.pos = V.add(grabPos, convertedMouse);
    writeEntity(uuid, ent);
    // getState().entities = entities;
  }, []);

  let mouseResize = useCallback(
    (e) => {
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

      let p1 = convertedMouse;
      let center = pos;
      let p2 = V.add(center, V.sub(center, p1));

      let newDistance = distance(p1, p2);

      let newScale =
        startScale * (newDistance / (magnitude(size) * startScale));

      let pDifference = V.sub(p1, p2);
      let handleAngle = angle(pDifference);

      let a = Math.atan2(size.y, size.x); //+ Math.PI;

      let newAngle = handleAngle - a;

      ent.scale = newScale;
      ent.rotation = newAngle * (180 / Math.PI);
      writeEntity(uuid, ent);
    },
    [startScale]
  );

  React.useEffect(() => {
    if (selected) {
      window.dragging = true;
      window.dispatchEvent(new Event("stop"));
      window.addEventListener("click", unsetSelection);
    }
    window.addEventListener("mouseup", mouseUp);
    if (selected && mode === "move") {
      window.addEventListener("mousemove", mouseMove);
    }
    if (selected && mode === "resize") {
      window.addEventListener("mousemove", mouseResize);
    }

    return () => {
      window.removeEventListener("click", unsetSelection);
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("mousemove", mouseResize);
      window.removeEventListener("mouseup", mouseUp);
    };
  }, [unsetSelection, selected, mode]);

  let relPos = pos;
  return (
    <React.Fragment key={uuid}>
      <img
        key={uuid}
        ref={img}
        className={classNames("photo draggable", { selected })}
        src={window.location.origin + url}
        crossOrigin="anonymous"
        style={{
          position: "absolute",
          left: relPos.x,
          top: relPos.y,
          transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale}) `,
          display: "flex",
          zIndex: 200 + (selected ? 100 : 0),
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          if (!editing) {
            return;
          }

          let hit = checkImageCoord(img.current, pos, scale, rotation, e);

          if (hit !== img.current) {
            if (hit) {
              Simulate.mouseDown(hit, {
                clientX: e.clientX,
                clientY: e.clientY,
              });
            }
            return;
          }
          setSelected(true);

          let ent = getEntity(uuid);

          let convertedMouse = convertTarget({
            x: e.clientX,
            y: e.clientY,
          });
          grabPos = V.sub(ent.pos, convertedMouse);
          setMode("move");
        }}
        onWheel={(e) => {
          if (!selected) return;
          let ent = getEntity(uuid);

          ent.scale += e.deltaY * 0.001;

          writeEntity(uuid, ent);
        }}
      ></img>
      {selected && (
        <>
          <span
            className="toolbar"
            style={{
              position: "absolute",
              left: relPos.x,
              top: relPos.y,
              width: size.x * scale,
              height: size.y * scale,
              transform: `translate(-50%, -50%) rotate(${rotation}deg)  `,
              zIndex: 200 + (selected ? 100 : 0),
            }}
          >
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
                oldEnt.pos = V.add(oldEnt.pos, { x: 30, y: 30 });
                getState().entities = entities;
                sendEntityUpdate(ent.uuid);
                sendEntityUpdate(uuid);
                e.preventDefault();
              }}
            />
            <img
              src={X}
              className={"tool "}
              id="subtract-image"
              onMouseDown={(e) => {
                console.log("delete!!");
                sendEntityDelete(uuid);
              }}
            />
          </span>
          <div
            style={{
              position: "absolute",
              left: relPos.x,
              top: relPos.y,
              width: size.x * scale,
              height: size.y * scale,
              transform: `translate(-50%, -50%) rotate(${rotation}deg) `,
              zIndex: 200 + (selected ? 100 : 0),
            }}
            ref={handleContainer}
            className="handle-container"
          >
            <div
              onMouseDown={(e) => {
                let ent = getEntity(uuid);

                let convertedMouse = convertTarget({
                  x: e.clientX,
                  y: e.clientY,
                });
                grabPos = V.sub(ent.pos, convertedMouse);
                setMode("resize");
                setStartScale(scale);
              }}
              ref={handle}
              className="resize-handle"
            ></div>
          </div>
        </>
      )}
    </React.Fragment>
  );
}

function getTransform(el) {
  try {
    let st = window.getComputedStyle(el, null);
    let tr =
      st.getPropertyValue("-webkit-transform") ||
      st.getPropertyValue("-moz-transform") ||
      st.getPropertyValue("-ms-transform") ||
      st.getPropertyValue("-o-transform") ||
      st.getPropertyValue("transform") ||
      "FAIL";

    return tr.split("(")[1].split(")")[0].split(",");
  } catch (e) {
    console.log(e);
    return [0, 0, 0, 0];
  }
}
function getCurrentScale(el) {
  let values = getTransform(el);

  return Math.sqrt(values[0] * values[0] + values[1] * values[1]);
}

function getCurrentRotation(el) {
  let values = getTransform(el);

  return Math.atan2(values[1], values[0]);
}
