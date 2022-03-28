// Node.js WebSocket server script
import * as http from "http";
import { startEndpoints } from "./endpoints";

const server = http.createServer();

server.listen(9898);
// const wsServer = new websocket.server({
//   httpServer: server
// });

console.log("LISTENING!");

// let openConnections = new Set<websocket.connection>();

startEndpoints();
