import * as React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import { Simulate } from "react-dom/test-utils";
import "./entity.css";
import classNames from "classnames";
import { sendEntityUpdate } from "./client";
import * as Vector from "@graph-ts/vector2";

import { getState, getEntity, writeEntity, lockedAtom } from "./state";
import { convertTarget, deconvertTarget } from "./input";
import { sendEntityDelete } from "./client";
import { v4 as uuidv4 } from "uuid";
import { useDelayedGate } from "./hooks";
import { EntityType } from "./types";
import { clamp } from "./utils";
import { useAtom } from "jotai";

let grabPos: Matter.Vector;

let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");
// document.body.appendChild(ctx.canvas); // used for debugging
function checkImageCoord(
  img_element: HTMLElement,
  pos: Vector.Vector2,
  scale: number,
  rotation: number,
  event: MouseEvent
): any {
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
  ctx.scale(scale * window.zoom, scale * window.zoom);
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

function angle(b: Vector.Vector2) {
  return Math.atan2(b.y, b.x); //radians
}

function distance(a: Vector.Vector2, b: Vector.Vector2) {
  return Vector.length(Vector.subtract(a, b));
}

interface IControlledTextArea {
  value: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement> | undefined;
  [x: string]: any;
}

const ControlledTextArea = ({
  value,
  onChange,
  refa,
  ...rest
}: IControlledTextArea) => {
  const [cursor, setCursor] = useState(0);
  // const ref = useRef(null)

  useEffect(() => {
    const input: any = refa.current;
    if (input) {
      input.setSelectionRange(cursor, cursor);
    }
  }, [refa, cursor, value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCursor(e.target.selectionStart);
    onChange && onChange(e);
  };

  return (
    <textarea ref={refa} value={value} onChange={handleChange} {...rest} />
  );
};

export default function Entity({
  value,
  type,
  pos,
  size,
  scale,
  rotation,
  uuid,
  i,
}: {
  value: string;
  type: EntityType;
  pos: Vector.Vector2;
  size: Vector.Vector2;
  scale: number;
  rotation: number;
  uuid: string;
  i: number;
}) {
  let [locked] = useAtom(lockedAtom);

  let [mode, setMode] = useState("");
  let [selected, setSelected] = useState(false);
  let beenSelected = useDelayedGate(selected, 200 / window.zoom);
  if (locked) {
    selected = false;
    beenSelected = false;
  }
  let [startScale, setStartScale] = useState<number | null>(null);
  let img = useRef<HTMLImageElement>(null);
  let handleContainer = useRef<HTMLDivElement>(null);
  let handle = useRef<HTMLDivElement>(null);

  let unsetSelection = useCallback(() => {}, [setSelected, mode]);
  let mouseDown = useCallback(
    (e) => {
      if (!e.target.classList.contains("tool") && e.target !== img.current) {
        setSelected(false);
        setMode("");
      }
    },
    [setSelected, setMode, mode]
  );
  let mouseUp = useCallback(
    (e) => {
      if (selected && !beenSelected) {
        setSelected(false);
      }
      if (mode !== "") {
        e.preventDefault();
        setMode("");

        window.setTimeout(() => {
          window.dragging = false;
        }, 200);
      }
    },
    [setSelected, beenSelected, selected, setMode, mode]
  );

  useEffect(() => {
    if (beenSelected) {
      window.dragging = true;
      img.current?.focus();
    } else {
      window.dragging = false;
    }
  }, [mode, beenSelected]);

  let mouseMove = useCallback((e) => {
    if (!grabPos) {
      return;
    }
    if (e.touches) {
      e.clientX = e.touches[0].clientX;
      e.clientY = e.touches[0].clientY;
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
  }, []);

  let mouseResize = useCallback(
    (e) => {
      if (!grabPos) {
        return;
      }
      if (e.touches) {
        e.clientX = e.touches[0].clientX;
        e.clientY = e.touches[0].clientY;
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
      let p2 = Vector.add(center, Vector.subtract(center, p1));

      let newDistance = distance(p1, p2);

      startScale = startScale ?? 1;
      let newScale =
        startScale * (newDistance / (Vector.length(size) * startScale));

      let pDifference = Vector.subtract(p1, p2);
      let handleAngle = angle(pDifference);

      let a = Math.atan2(size.y, size.x); //+ Math.PI;

      let newAngle = handleAngle - a;

      let maxDim = Math.max(size.x, size.y);
      let maxScale = 1000 / maxDim;
      let minScale = type === EntityType.Text ? 0.2 : 0.1;
      ent.scale = clamp(newScale, minScale, maxScale);
      ent.rotation = newAngle * (180 / Math.PI);
      writeEntity(uuid, ent);
    },
    [startScale]
  );

  React.useEffect(() => {
    if (beenSelected) {
      window.dragging = true;
      window.dispatchEvent(new Event("stop"));
    }
    if (!locked) {
      if (selected) {
        window.addEventListener("click", unsetSelection);
        window.addEventListener("mouseup", mouseUp);
        window.addEventListener("touchend", mouseUp);
        window.addEventListener("mousedown", mouseDown);
        window.addEventListener("touchstart", mouseDown);
      }

      if (beenSelected && mode === "move") {
        window.addEventListener("mousemove", mouseMove);
        window.addEventListener("touchmove", mouseMove);
      }
      if (beenSelected && mode === "resize") {
        window.addEventListener("mousemove", mouseResize);
        window.addEventListener("touchmove", mouseResize);
      }
    }

    return () => {
      window.removeEventListener("click", unsetSelection);
      window.removeEventListener("mouseup", mouseUp);
      window.removeEventListener("touchend", mouseUp);
      window.removeEventListener("mousedown", mouseDown);
      window.removeEventListener("touchstart", mouseDown);

      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("touchmove", mouseMove);

      window.removeEventListener("mousemove", mouseResize);
      window.removeEventListener("touchmove", mouseResize);
    };
  }, [unsetSelection, selected, beenSelected, mode, mouseMove, locked]);

  let relPos = pos;

  let imageMouseDown = useCallback(
    (e) => {
      if (e.target.tagName !== "TEXTAREA" || !beenSelected) {
        e.preventDefault();
      }
      if (e.touches) {
        e.clientX = e.touches[0].clientX;
        e.clientY = e.touches[0].clientY;
      }
      let hit = checkImageCoord(img.current, pos, scale, rotation, e);

      if (hit !== img.current) {
        if (hit) {
          Simulate.mouseDown(hit, {
            clientX: e.clientX,
            clientY: e.clientY,
            target: hit,
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
      grabPos = Vector.subtract(ent.pos, convertedMouse);
      setMode("move");
    },
    [pos, scale, rotation, img.current, setMode, beenSelected]
  );

  let resizeHandleMouseDown = useCallback(
    (e) => {
      let ent = getEntity(uuid);
      if (e.touches) {
        e.clientX = e.touches[0].clientX;
        e.clientY = e.touches[0].clientY;
      }

      let convertedMouse = convertTarget({
        x: e.clientX,
        y: e.clientY,
      });
      grabPos = Vector.subtract(ent.pos, convertedMouse);
      setMode("resize");
      setStartScale(scale);
    },
    [pos, setMode, setStartScale]
  );
  let selectedN = selected && mode === "move" ? 1 : 0;
  let shadowFactor = type === EntityType.Text ? 0.5 : 1;
  let shadowSize = (shadowFactor * selectedN) / scale;
  let shadowFilter = "";
  if (selectedN > 0) {
    shadowFilter = `drop-shadow(${10 * shadowSize}px ${
      16 * shadowSize
    }px 0px rgba(15, 15, 15, 0.281))`;
  }
  return (
    <React.Fragment key={uuid}>
      {type === EntityType.Text && (
        <ControlledTextArea
          spellCheck={false}
          //  contentEditable={beenSelected}
          //  onDoubleClick={e=>{
          //    console.log("dbl")
          //    img.current?.focus();
          //  }}
          //  suppressContentEditableWarning={true}
          key={uuid}
          refa={img}
          onChange={(e) => {
            let ent = getEntity(uuid);
            ent.value = e.target.value;
            if (img.current) {
              let prev;

              prev = img.current.style.width;
              img.current.style.width = "1px";
              img.current.style.whiteSpace = "pre";
              ent.size.x = Math.min(img.current.scrollWidth + 40, 1500);
              img.current.style.width = ent.size.x + "px";

              img.current.style.whiteSpace = "normal";
              prev = img.current.scrollHeight;
              img.current.style.height = "1px";
              ent.size.y = Math.min(img.current.scrollHeight, 5000);
              img.current.style.height = prev + "px";
              // img.current.style.whiteSpace = "pre";

              let maxDim = Math.max(ent.size.x, ent.size.y);
              let maxScale = 1000 / maxDim;
              let minScale = 0.2;
              ent.scale = clamp(ent.scale, minScale, maxScale);
            }
            writeEntity(uuid, ent);
          }}
          className={classNames("text draggable " + mode, {
            locked,
            selected: beenSelected,
          })}
          style={{
            position: "absolute",
            left: relPos.x,
            top: relPos.y,
            height: size.y,
            width: size.x,
            transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale}) `,
            display: "flex",
            zIndex: 500 + (beenSelected ? 500 : 0),
            filter: shadowFilter,
            // whiteSpace: beenSelected ? "pre" : "normal",
          }}
          onMouseDown={imageMouseDown}
          onTouchStart={imageMouseDown}
          value={value}
        />
      )}
      {type === EntityType.Image && (
        <img
          key={uuid}
          ref={img}
          className={classNames("photo draggable " + mode, {
            locked,
            selected: beenSelected,
          })}
          src={
            value.startsWith("http") ? value : window.location.origin + value
          }
          crossOrigin="anonymous"
          style={{
            position: "absolute",
            left: relPos.x,
            top: relPos.y,
            transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale}) `,
            display: "flex",
            zIndex: 500 + (beenSelected ? 500 : 0),
            filter: shadowFilter,
          }}
          onMouseDown={imageMouseDown}
          onTouchStart={imageMouseDown}
        ></img>
      )}
      {beenSelected && (
        <>
          <div
            style={{
              position: "absolute",
              left: relPos.x,
              top: relPos.y,
              width: size.x * scale,
              height: size.y * scale,
              transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${
                mode === "move" ? 1.005 : 1.0
              })`,
              zIndex: 500 + (beenSelected ? 500 : 0),
            }}
            ref={handleContainer}
            className={classNames("handle-container " + mode, {
              locked,
            })}
          >
            <button
              className="tool duplicate"
              tabIndex={-1}
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
                e.stopPropagation();
              }}
            >
              <svg className="tool" id="d" viewBox="0 0 25 25">
                <path className="tool" d="M 18 6 h 4 v 18 h -16 v -4 h 12" />

                <rect className="tool" x="2" y="2" width="16" height="18" />
              </svg>
            </button>

            <button
              className="tool x"
              tabIndex={-1}
              onClick={(e) => {
                console.log("delete!!");
                e.stopPropagation();

                sendEntityDelete(uuid);
              }}
            >
              <svg
                className="tool"
                height="18"
                width="18"
                id="d"
                viewBox="0 0 18 18"
              >
                <polyline className="tool" points="0,0 , 18,18"></polyline>
                <polyline className="tool" points="18,0 , 0,18"></polyline>
              </svg>
            </button>
            <div
              onMouseDown={resizeHandleMouseDown}
              onTouchStart={resizeHandleMouseDown}
              ref={handle}
              className="resize-handle tool"
            ></div>
          </div>
        </>
      )}
    </React.Fragment>
  );
}

function getTransform(el: Element) {
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
function getCurrentScale(el: Element) {
  let values = getTransform(el);

  return Math.sqrt(values[0] * values[0] + values[1] * values[1]);
}

function getCurrentRotation(el: Element) {
  let values = getTransform(el);

  return Math.atan2(values[1], values[0]);
}
