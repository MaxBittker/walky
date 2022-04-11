// Node.js WebSocket server script
import { startEndpoints } from "./endpoints";
import { startWsServer } from "./yjs/ws-server";

let basePort: number = parseInt(process.env?.PORT || "4000", 10);

let server = startEndpoints(basePort);
startWsServer(server);
