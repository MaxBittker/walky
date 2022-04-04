import * as path from "path";
import * as http from "http";
import express from "express";
import multer from "multer";

import * as stytch from "stytch";
import db from "./database";
import dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });

import { uploadImage, uploadImageURl } from "./helpers";

function startEndpoints(PORT: number) {
  const app = express();
  app.use(express.json());
  const httpServer = http.createServer(app);

  app.use(express.static("../docs"));
  app.use("/files", express.static("./uploads"));

  app.post("/users", async function (req, res) {
    const stytchUserId = req.body.userId;
    const email = req.body.email;

    // Query the user by stytch_id and email
    const query =
      "SELECT id, email FROM user WHERE stytch_id = ? AND email = ?";
    const params = [stytchUserId, email];

    db.all(query, [], (err: any, rows: string | any[]) => {
      if (err) return res.status(400).send(err);

      // If user is not found, create a new user with stytch_id and email
      if (rows.length === 0) {
        const insertQuery = "INSERT INTO user (stytch_id, email) VALUES (?, ?)";
        const params = [stytchUserId, email];
        db.run(insertQuery, params, (result: any, err: any) => {
          if (err) {
            return res.status(400).send(err);
          } else {
            console.log("User created");
            return res.status(201).send(result);
          }
        });
      } else {
        // User was already saved in database.
        console.log("User retrieved");
        res.status(200).send(rows[0]);
      }
    });
  });

  app.get("/stytch", function (req, res) {
    var token = req?.query?.token?.toString();
    const stytchClient = new stytch.Client({
      project_id: process.env.STYTCH_PROJECT_ID!,
      secret: process.env.STYTCH_SECRET!,
      env: stytch.envs.test
    });
    stytchClient.magicLinks
      .authenticate(token!)
      .then((resp: any) => {
        if (resp.ok) {
          res.send(`Authenticated user with stytchUserId: ${resp}`);
        } else {
          res.status(resp.status_code).send("Could not authenticate the user.");
        }
      })
      .catch((err) => res.status(500).send(`Error authenticating user ${err}`));
  });

  app.get("*", function (request, response) {
    response.sendFile(path.resolve(__dirname, "../docs/index.html"));
  });

  httpServer.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
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
      fileSize: 6 * 1024 * 1024
    }
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
              owner_uuid
            })
          );
      } catch (error) {
        return handleError(error, res);
      }
    }
  );
}

export { startEndpoints };
