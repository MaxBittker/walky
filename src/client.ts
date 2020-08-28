import { getState } from "./state";
import { PacketTypes, PacketLayout, AgentLayout } from "./types";
import { nrandom } from "./utils";
import { v4 as uuidv4 } from "uuid";
import chair from "./../assets/Classroom+Chair.jpg";
import fern from "./../assets/fern.jpg";
const ws = new WebSocket("ws://localhost:9898/");

ws.onopen = function() {
  console.log("WebSocket Client Connected");
  //   ws.send("Hi this is web client.");

  for (var i = 0; i < 3; i++) {
    let packet1 = {
      type: PacketTypes.entityUpdate,
      data: {
        uuid: uuidv4().slice(0, 10),
        url: chair,
        pos: { x: nrandom() * 2000, y: nrandom() * 2000 },
        scale: nrandom() * 2
      }
    };
    let packet2 = {
      type: PacketTypes.entityUpdate,
      data: {
        uuid: uuidv4().slice(0, 10),
        url: fern,
        pos: { x: nrandom() * 2000, y: nrandom() * 2000 },
        scale: Math.random()
      }
    };
    ws.send(JSON.stringify(packet1));
    ws.send(JSON.stringify(packet2));
  }
};

ws.onmessage = function(e) {
  console.log(e.data);

  let packet = JSON.parse(e.data);

  processUpdate(packet);
};

function processUpdate(packet: any) {
  let { type, data } = packet;
  console.log(packet);

  let state = getState();
  if (type == PacketTypes.agentUpdate) {
    state.agents = Object.values(data);
  } else if (type == PacketTypes.entityUpdate) {
    state.entities = Object.values(data);
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

export { sendUpdate };
