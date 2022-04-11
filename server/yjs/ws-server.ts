import WebSocket from "ws";
import * as https from "https";
import { setupWSConnection } from "./utils";

// const host = process.env.HOST || "localhost";

function startWsServer(server: https.Server) {
  const wss = new WebSocket.Server({ noServer: true });

  wss.on("connection", setupWSConnection);

  server.on("upgrade", (request: any, socket: any, head: any) => {
    // You may check auth of request here..
    // See https://github.com/websockets/ws#client-authentication

    const handleAuth = (ws: any) => {
      wss.emit("connection", ws, request);
    };
    wss.handleUpgrade(request, socket, head, handleAuth);
  });
}

export { startWsServer };
