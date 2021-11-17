// Node.js WebSocket server script
import * as http from "http";
import * as websocket from "websocket";
import { startEndpoints } from "./endpoints";

import {
  AgentLayout,
  PacketTypes,
  PacketLayout,
  EntityLayout,
  PingLayout,
} from "../src/types";
import { updateAgent } from "../src/movement";
import { Vector } from "matter-js";
import { existsSync, readFileSync, writeFile } from "fs";

const dbLocation = "db.txt";
let db = JSON.parse(
  (existsSync(dbLocation) && readFileSync(dbLocation).toString()) || "{}"
);

let writeLocked = false;
let lastCheckpoint = "{}";
let t = 0;
let iid = 1;
let agentState: { [uuid: string]: AgentLayout } = {};
let entityState: { [uuid: string]: EntityLayout } = db;

setInterval(() => {
  let checkpoint = JSON.stringify(entityState);
  if (writeLocked || checkpoint === lastCheckpoint) {
    return;
  }
  writeLocked = true;
  console.log("writing checkpoint");
  writeFile(dbLocation, checkpoint, (err) => {
    lastCheckpoint = checkpoint;
    writeLocked = false;
  });
}, 1000 * 60);

const server = http.createServer();

server.listen(9898);
const wsServer = new websocket.server({
  httpServer: server,
});

console.log("LISTENING!");

let openConnections = new Set<websocket.connection>();

function entityUpload(
  uuid: string,
  url: string,
  position: Vector,
  size: Vector,
  owner: string
) {
  console.log(url);
  entityState[uuid] = {
    uuid,
    url,
    pos: position,
    size,
    scale: 1.0,
    rotation: 0.0,
    iid,
  };
  iid++;
  sendEntityUpdate();
}
startEndpoints(entityUpload);

wsServer.on("request", function (request) {
  const connection = request.accept(undefined, request.origin);
  let uuid: string;
  openConnections.add(connection);
  sendEntityUpdate(connection);
  connection.on("message", function (message: any) {
    if (!message.utf8Data) {
      return;
    }

    let packet: PacketLayout = JSON.parse(message.utf8Data);
    let { type } = packet;
    if (type == PacketTypes.ping) {
      let { pingtime, tick } = packet.data as PingLayout;
      let pongPacket = {
        type: PacketTypes.pong,
        data: {
          pingtime,
          tick: t,
        },
      };
      connection.sendUTF(JSON.stringify(pongPacket));
    } else if (type == PacketTypes.agentUpdate) {
      let data = packet.data as AgentLayout;
      uuid = data.uuid;
      agentState[uuid] = data;
    } else if (type == PacketTypes.entityUpdate) {
      let data = packet.data as EntityLayout;
      if (data.pos) {
        // movement;
        iid++;
        entityState[data.uuid] = data;
        entityState[data.uuid].iid = iid;
      } else {
        // deletion;
        delete entityState[data.uuid];
      }
      sendEntityUpdate();
    }
  });
  connection.on("close", function (reasonCode, description) {
    openConnections.delete(connection);
    delete agentState[uuid];
    console.log("Client has disconnected.");
  });
});

function sendEntityUpdate(connection?: websocket.connection) {
  let packet = JSON.stringify({
    type: PacketTypes.entityUpdate,
    data: entityState,
  });
  console.log("sending entities");

  let connections = openConnections;
  if (connection) {
    connections = new Set([connection]);
  }
  connections.forEach((connection: websocket.connection) => {
    connection.sendUTF(packet);
  });
}

function sendAgentUpdate() {
  let packet = JSON.stringify({
    type: PacketTypes.agentUpdate,
    data: agentState,
  });
  openConnections.forEach((connection: websocket.connection) => {
    connection.sendUTF(packet);
  });
  setTimeout(sendAgentUpdate, 1000 / 30);
}
sendAgentUpdate();

function doTick() {
  t++;

  for (var key in agentState) {
    let agent = agentState[key];
    agentState[key] = updateAgent(agent, t);
  }
  setTimeout(doTick, 1000 / 60);
}
doTick();
