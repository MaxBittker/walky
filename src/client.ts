import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

import { getState } from "./state";
import { AgentLayout, EntityLayout } from "./types";

import { nrandom, distance } from "./utils";
// import { v4 as uuidv4 } from "uuid";

export function setEditCode(editCode: string) {
  localStorage.setItem("code:" + window.location.pathname, editCode);
}
export function getEditCode() {
  return localStorage.getItem("code:" + window.location.pathname);
}

const ydoc = new Y.Doc();
const yMapEnts = ydoc.getMap("entities");
// observers are called after each transaction
yMapEnts.observe((event) => {
  let data = Object.values(ydoc.toJSON().entities);
  let state = getState();

  state.entities = data as EntityLayout[];
  state.entities = state.entities.sort((a, b) => a.iid - b.iid);
});

const roomname = `walky-space-${window.location.pathname}`;

const urlParams = new URLSearchParams(window.location.search);
const editCode = urlParams.get("code");

const yProvider = new WebsocketProvider(
  `wss://${window.location.hostname}`,
  roomname,
  ydoc,
  { params: { authToken: getEditCode() || editCode || "" } }
);

const awareness = yProvider.awareness;
const myYId = awareness.clientID;

// You can observe when a user updates their awareness information
awareness.on("change", (_changes: any) => {
  // todo be more selective
  const newStates = awareness.getStates();
  let agents = Array.from(newStates.values())
    .map((e) => e.agent)
    .filter((e) => e);

  processAgents(agents);
});

function processAgents(agents: AgentLayout[]) {
  let state = getState();

  let agentsMap: { [uuid: string]: AgentLayout } = {};
  state.agents.forEach((a) => {
    agentsMap[a.uuid] = a;
  });

  state.agents = agents.map((a) => {
    let pos = agentsMap[a.uuid]?.pos || a.pos;
    if (distance(a.target, a.pos) < 1) {
      pos = a.pos;
    }
    return {
      ...a,
      pos,
    };
  });
}
let lastJSON = "";
function sendUpdate() {
  let newJSON = JSON.stringify(getState().me);
  if (lastJSON !== newJSON) {
    awareness.setLocalStateField("agent", getState().me);
    lastJSON = newJSON;
  }
}

function sendEntityUpdate(i_uuid: string) {
  const { entities } = getState();

  let ent = entities.find(({ uuid }) => uuid === i_uuid);
  if (!ent) {
    console.log("bad entity update: " + i_uuid);
    return;
  }

  yMapEnts.set(i_uuid, ent);
}

function sendEntityDelete(uuid: string) {
  console.log("deleting: " + uuid);
  yMapEnts.delete(uuid);
}

export { sendUpdate, sendEntityDelete, sendEntityUpdate };
