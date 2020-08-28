// Node.js WebSocket server script
import * as http from "http";
import * as websocket from "websocket";
import {
  AgentLayout,
  PacketTypes,
  PacketLayout,
  EntityLayout
} from "../src/types";
import { updateAgent } from "../src/movement";
const server = http.createServer();
server.listen(9898);
const wsServer = new websocket.server({
  httpServer: server
});

let agentState: { [uuid: string]: AgentLayout } = {};
let entityState: { [uuid: string]: EntityLayout } = {};

let openConnections = new Set<websocket.connection>();

wsServer.on("request", function(request) {
  const connection = request.accept(undefined, request.origin);
  let uuid: string;
  openConnections.add(connection);
  connection.on("message", function(message) {
    if (!message.utf8Data) {
      return;
    }

    let packet: PacketLayout = JSON.parse(message.utf8Data);
    let { type } = packet;

    if (type == PacketTypes.agentUpdate) {
      let data = packet.data as AgentLayout;
      uuid = data.uuid;
      agentState[uuid] = data;
    } else if (type == PacketTypes.entityUpdate) {
      if (Object.keys(entityState).length > 30) {
        return;
      }
      let data = packet.data as EntityLayout;
      entityState[data.uuid] = data;
      sendEntityUpdate();
    }
  });
  connection.on("close", function(reasonCode, description) {
    openConnections.delete(connection);
    delete agentState[uuid];
    console.log("Client has disconnected.");
  });
});
function sendEntityUpdate() {
  let packet = JSON.stringify({
    type: PacketTypes.entityUpdate,
    data: entityState
  });
  console.log("sending entities");
  openConnections.forEach((connection: websocket.connection) => {
    connection.sendUTF(packet);
  });
}
function sendAgentUpdate() {
  let packet = JSON.stringify({
    type: PacketTypes.agentUpdate,
    data: agentState
  });
  openConnections.forEach((connection: websocket.connection) => {
    connection.sendUTF(packet);
  });
  setTimeout(sendAgentUpdate, 16 * 2);
}
sendAgentUpdate();

function tick() {
  for (var key in agentState) {
    let agent = agentState[key];
    agentState[key] = updateAgent(agent);
  }
  setTimeout(tick, 16);
}
tick();
