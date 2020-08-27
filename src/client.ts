import { v4 as uuidv4 } from "uuid";

let uuid = uuidv4();

const ws = new WebSocket("ws://localhost:9898/");

ws.onopen = function() {
  console.log("WebSocket Client Connected");
  ws.send("Hi this is web client.");
};

ws.onmessage = function(e) {
  console.log("Received: '" + e.data + "'");
};

function sendUpdate() {
  // if (ws.readyState != ws.OPEN) {
  //   return;
  // }
  // let data = {
  //   uuid: {
  //     pos,
  //     target,
  //     facing,
  //     moving
  //   }
  // };
  // ws.send(JSON.stringify(data));
}

export sendUpdate();