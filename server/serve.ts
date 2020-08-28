// Node.js WebSocket server script
import * as http from "http";
import * as websocket from "websocket";
import { AgentLayout, PacketTypes, PacketLayout } from "../src/types";
import { updateAgent } from "../src/movement";
const server = http.createServer();
server.listen(9898);
const wsServer = new websocket.server({
  httpServer: server
});

let state: { [uuid: string]: AgentLayout } = {};

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
    let { type, data } = packet;

    if (type == PacketTypes.agentUpdate) {
      uuid = data.uuid;
      state[uuid] = data;
      console.log(state);
    }
  });
  connection.on("close", function(reasonCode, description) {
    openConnections.delete(connection);
    delete state[uuid];
    console.log("Client has disconnected.");
  });
});

function sendUpdate() {
  let new_data = JSON.stringify(state);
  openConnections.forEach((connection: websocket.connection) => {
    connection.sendUTF(new_data);
  });
  setTimeout(sendUpdate, 16 * 2);
}
sendUpdate();

function tick() {
  for (var key in state) {
    let agent = state[key];
    state[key] = updateAgent(agent);
  }
  setTimeout(tick, 16);
}
tick();
