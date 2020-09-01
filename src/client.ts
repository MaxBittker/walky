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
  //   ws.send("Hi this is web client.");

  // for (var i = 0; i < 3; i++) {
  //   let packet1 = {
  //     type: PacketTypes.entityUpdate,
  //     data: {
  //       uuid: uuidv4().slice(0, 10),
  //       url: chair,
  //       pos: { x: nrandom() * 2000, y: nrandom() * 2000 },
  //       scale: nrandom() * 2
  //     }
  //   };
  //   let packet2 = {
  //     type: PacketTypes.entityUpdate,
  //     data: {
  //       uuid: uuidv4().slice(0, 10),
  //       url: fern,
  //       pos: { x: nrandom() * 2000, y: nrandom() * 2000 },
  //       scale: Math.random()
  //     }
  //   };
  //   ws.send(JSON.stringify(packet1));
  //   ws.send(JSON.stringify(packet2));
  // }
  requestClockSync();
};

ws.onmessage = function(e) {
  // console.log(e.data);

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
  // console.log("ping: " + pingMs);
  let state = getState();
  // console.log("old/new " + state.tick, pingData.tick + pingMs / (16 * 2));

  state.tick = pingData.tick + pingMs / (16 * 2);
  state.me.lastUpdated = state.tick;
}

function processAgents(agentMap: { [uuid: string]: AgentLayout }) {
  let state = getState();
  let new_agents = agentMap;

  state.agents = state.agents.filter(a => new_agents[a.uuid]);
  state.agents.forEach(a => {
    a.target = new_agents[a.uuid].target;
    delete new_agents[a.uuid];
  });

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
    state.entities = Object.values(data);
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

export { sendUpdate, requestClockSync };
