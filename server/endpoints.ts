import * as path from "path";
import * as http from "http";
import * as https from "https";
import express from "express";
import multer from "multer";
import fs from "fs";
import db from "./database";
import dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });

// Certificate
const privateKey = fs.readFileSync(
  "/etc/letsencrypt/live/walky.space/privkey.pem",
  "utf8"
);
const certificate = fs.readFileSync(
  "/etc/letsencrypt/live/walky.space/cert.pem",
  "utf8"
);
const ca = fs.readFileSync(
  "/etc/letsencrypt/live/walky.space/chain.pem",
  "utf8"
);

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca,
};

import { uploadImage, uploadImageURl } from "./helpers";
import sendEmail from "./email";

function startEndpoints(PORT: number): https.Server {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true })); //Parse URL-encoded bodies

  const httpServer = http.createServer(app);
  const httpsServer = https.createServer(credentials, app);

  app.use(express.static("../docs"));
  app.use("/files", express.static("./uploads"));

  app.get("/claimed/:path?", async function (req, res) {
    let path = req.params.path ?? "";
    const code = req.header("code");

    // Query the space by path
    const query = "SELECT id, email, path, code FROM space WHERE path = ?";
    const params = [path];

    db.get(query, params, (err: any, row: object) => {
      if (err) return res.status(400).send(err);

      if (!row) {
        return res.status(201).send({ claimed: false, access: "public" });
      } else {
        if ((row as any)["code"] === "") {
          res.status(200).send({ claimed: true, access: "public" });
          return;
        }
        if ((row as any)["code"] === code) {
          res.status(200).send({ claimed: true, access: "editor" });
          return;
        }

        // space was already saved in database.
        res.status(200).send({ claimed: true, access: "none" });
      }
    });
  });

  app.post("/claim/:path?", async function (req, res) {
    let path = req.params.path ?? "";
    const email = req.body["email"];
    const code = req.body["code"];
    const opt = req.body["opt"];

    // Query the space by path
    const query = "SELECT id, email, path, code FROM space WHERE path = ?";
    const params = [path];

    console.log("claiming space: " + path);
    db.all(query, params, (err: any, rows: string | any[]) => {
      if (err) return res.status(400).send(err);

      // If space is not found, create an entry
      if (rows.length === 0) {
        const insertQuery =
          "INSERT INTO space (path, email, code, opt) VALUES (?, ?, ?, ?)";
        const params = [path, email, code, opt];
        db.run(insertQuery, params, (result: any, err: any) => {
          if (err) {
            return res.status(400).send(err);
          } else {
            console.log("space created");
            sendEmail({ code, path, email });
            return res.status(201).send({ path, email, code, opt });
          }
        });
      } else {
        // User was already saved in database.
        console.log("User retrieved");
        res.status(200).send(rows[0]);
      }
    });
  });

  app.get("*", function (request, response) {
    response.sendFile(path.resolve(__dirname, "../docs/index.html"));
  });

  httpServer.listen(80, () => {
    console.log(`Server is listening on port ${80}`);
  });
  httpsServer.listen(443, () => {
    console.log(`Server is listening on port ${443}`);
  });

  const handleError = (err: any, res: any) => {
    console.log(err);
    res
      .status(500)
      .contentType("text/plain")
      .end("Oops! Something went wrong!");
  };

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 6 * 1024 * 1024,
    },
  });

  app.post(
    "/upload",
    upload.single(
      "image-upload" /* name attribute of <file> element in your form */
    ),
    async (req, res) => {
      let owner_uuid = req.body["owner"];
      let name = req.body["name"];
      let position = JSON.parse(req.body["position"]);
      let size = req.body["size"] && JSON.parse(req.body["size"]);

      const uuid = Math.random().toString().slice(2, 7);
      try {
        let imageUrl;
        if (req.file) {
          imageUrl = await uploadImage(req.file, uuid + name);
        } else {
          let url = req.body["url"];
          let resp = (await uploadImageURl(url)) as any;
          size = resp.size;
          imageUrl = resp.publicUrl;
        }
        res
          .status(200)
          .contentType("text/json")
          .end(
            JSON.stringify({
              uuid,
              value: imageUrl,
              type: "img",
              position,
              size,
              owner_uuid,
            })
          );
      } catch (error) {
        return handleError(error, res);
      }
    }
  );

  return httpsServer;
}

export { startEndpoints };
