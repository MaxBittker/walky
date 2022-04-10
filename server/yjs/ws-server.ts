import WebSocket from "ws";
import http from "http";
import { setupWSConnection } from "./utils";


const host = process.env.HOST || "localhost";



// Certificate
const privateKey = fs.readFileSync('/etc/letsencrypt/live/walky.space/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/walky.space/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/walky.space/chain.pem', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};



function startWsServer(port: number) {
  const wss = new WebSocket.Server({ noServer: true });

  const server = https.createServer(
  credentials,
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
