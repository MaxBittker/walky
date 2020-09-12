import { getState } from "./state";
import { PacketTypes, PacketLayout, AgentLayout, PingLayout } from "./types";
import { nrandom } from "./utils";
// import { v4 as uuidv4 } from "uuid";
// import chair from "./../assets/Classroom+Chair.jpg";
let ws = new WebSocket("ws://159.203.112.6:9898/");
// let ws = new WebSocket("ws://localhost:9898/");

ws.onerror = () => {
  ws = new WebSocket("ws://localhost:9898/");
};

ws.onopen = function() {
  console.log("WebSocket Client Connected");

  requestClockSync();
};

ws.onmessage = function(e) {
  let packet = JSON.parse(e.data);
  processUpdate(packet);
};

function requestClockSync() {
  if (ws.readyState != ws.OPEN) {
    return;
  }
  let pingPacket: PacketLayout = {
    type: PacketTypes.ping,
    data: {
      pingtime: Date.now(),
      tick: getState().tick
    }
  };
  ws.send(JSON.stringify(pingPacket));
}

function clockSync(pingData: PingLayout) {
  let pingMs = Date.now() - pingData.pingtime;
  let state = getState();
  state.tick = pingData.tick + pingMs / (16 * 2);
  state.me.lastUpdated = state.tick;
}

function processAgents(agentMap: { [uuid: string]: AgentLayout }) {
  let state = getState();
  let new_agents = agentMap;

  // remove agents who aren't in the map
  state.agents = state.agents.filter(a => new_agents[a.uuid]);

  // for each agent, get the new target from the server
  state.agents.forEach(a => {
    a.target = new_agents[a.uuid].target;
    a.word = new_agents[a.uuid].word;
    delete new_agents[a.uuid];
  });
  // if an agent wasn't seen before, add it;
  //  (maybe set its clock to match local)
  state.agents = [...state.agents, ...Object.values(new_agents)];
}

function processUpdate(packet: PacketLayout) {
  let { type, data } = packet;
  // console.log(packet);

  let state = getState();
  if (type == PacketTypes.agentUpdate) {
    processAgents(data as { [uuid: string]: AgentLayout });
    // console.log(state.agents[0].lastUpdated - Date.now());
  } else if (type == PacketTypes.entityUpdate) {
    state.entities = Object.values(data).sort((a, b) => a.iid - b.iid);
  } else if (type == PacketTypes.pong) {
    clockSync(data as PingLayout);
  }
}

function sendUpdate() {
  if (ws.readyState != ws.OPEN) {
    return;
  }

  let packet = {
    type: PacketTypes.agentUpdate,
    data: getState().me
  };
  ws.send(JSON.stringify(packet));
}

function sendEntityUpdate(uuid: string) {
  if (ws.readyState != ws.OPEN) {
    return;
  }

  let packet = {
    type: PacketTypes.entityUpdate,
    data: { uuid }
  };
  console.log("deleting: " + uuid);
  ws.send(JSON.stringify(packet));
}

export { sendUpdate, requestClockSync, sendEntityUpdate };
