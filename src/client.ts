import { getState } from "./state";
import { PacketTypes, PacketLayout, AgentLayout } from "./types";

const ws = new WebSocket("ws://localhost:9898/");

ws.onopen = function() {
  console.log("WebSocket Client Connected");
  //   ws.send("Hi this is web client.");
};

ws.onmessage = function(e) {
  let data = JSON.parse(e.data);

  processUpdate(data);
};
function processUpdate(data: any) {
  let state = getState();
  console.log(data);

  state.agents = Object.values(data);

  // console.log(data);
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
