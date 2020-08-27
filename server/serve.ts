// Node.js WebSocket server script
import * as http from "http";
import * as websocket from "websocket";
const server = http.createServer();
server.listen(9898);
const wsServer = new websocket.server({
  httpServer: server
});

let state = {
  1: {
    pos: { x: 50, y: 50 },
    target: { x: 50, y: 50 },
    color: "50",
    facing: true
  }
};
let openConnections = [];
wsServer.on("request", function(request) {
  const connection = request.accept(undefined, request.origin);
  connection.on("message", function(message) {
    // console.log("Received Message:", message.utf8Data);
    // connection.sendUTF("Hi this is WebSocket server!");
  });
  connection.on("close", function(reasonCode, description) {
    console.log("Client has disconnected.");
  });
});
