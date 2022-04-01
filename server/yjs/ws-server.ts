const WebSocket = require("ws");
const http = require("http");
const setupWSConnection = require("./utils.ts").setupWSConnection;

const host = process.env.HOST || "localhost";

function startWsServer(port: number) {
  const wss = new WebSocket.Server({ noServer: true });

  const server = http.createServer(
    (
      request: any,
      response: {
        writeHead: (arg0: number, arg1: { "Content-Type": string }) => void;
        end: (arg0: string) => void;
      }
    ) => {
      response.writeHead(200, { "Content-Type": "text/plain" });
      response.end("okay");
    }
  );

  wss.on("connection", setupWSConnection);

  server.on("upgrade", (request: any, socket: any, head: any) => {
    // You may check auth of request here..
    // See https://github.com/websockets/ws#client-authentication

    const handleAuth = (ws: any) => {
      wss.emit("connection", ws, request);
    };
    wss.handleUpgrade(request, socket, head, handleAuth);
  });

  server.listen(port, () => {
    console.log(`ws running at '${host}' on port ${port}`);
  });
}

export { startWsServer };
