import * as Vector from "@graph-ts/vector2";

import { v4 as uuidv4 } from "uuid";
import { EntityLayout, StateLayout } from "./types";
import { sendEntityUpdate } from "./client";
import { nrandom, randomVec } from "./utils";
import { atom } from "jotai";

export const lockedAtom = atom<Boolean>(true);
export const claimedStatusAtom = atom<true | false | null>(null);
export const spaceSettingsOpen = atom<boolean>(false);
export const accessStatusAtom = atom<"public" | "editor" | "none" | null>(null);

let uuid = uuidv4().slice(0, 8);

let state: StateLayout = {
  me: {
    uuid,
    pos: randomVec(50),
    target: randomVec(50),
    facing: true,
    animation: "stand",
    timeIdle: 0,
    color: Math.random() * 360,
  },
  camera: { x: 0, y: 0 },
  frame: { x: 0, y: 0 },
  center: { x: 0, y: 0 },
  entities: [],
  // audios: [],
  agents: [],
};

state.entities = [];

function resize() {
  state.frame = { x: window.innerWidth, y: window.innerHeight };
  state.center = Vector.divideScalar(state.frame, 2);
  // console.log("resized!");
}
resize();
window.state = state;
window.addEventListener("resize", resize);
window.setInterval(resize, 2000);
function getState() {
  return state;
}

function getEntity(uuid: string) {
  // set the element's new position:
  const { entities } = getState();

  let i = entities.findIndex(({ uuid: u }) => {
    return u === uuid;
  });
  return entities[i];
}
function writeEntity(uuid: string, v: EntityLayout) {
  // set the element's new position:
  const { entities } = getState();

  let i = entities.findIndex(({ uuid: u }) => {
    return u === uuid;
  });
  entities[i] = v;
  sendEntityUpdate(uuid);
}
export { getState, getEntity, writeEntity };
