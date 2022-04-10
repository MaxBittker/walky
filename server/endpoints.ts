import * as path from "path";
import * as http from "http";
import express from "express";
import multer from "multer";

import db from "./database";
import dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });

import { uploadImage, uploadImageURl } from "./helpers";
import sendEmail from "./email";

function startEndpoints(PORT: number) {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true })); //Parse URL-encoded bodies

  const httpServer = http.createServer(app);

  app.use(express.static("../docs"));
  app.use("/files", express.static("./uploads"));

  app.get("/claimed/:path?", async function (req, res) {
    let path = req.params.path;

    // Query the space by path
    const query = "SELECT id, email, path, code FROM space WHERE path = ?";
    const params = [path];

    db.all(query, params, (err: any, rows: string | any[]) => {
      if (err) return res.status(400).send(err);

      if (rows.length === 0) {
        return res.status(201).send({ claimed: false });
      } else {
        // space was already saved in database.
        res.status(200).send({ claimed: true });
      }
    });
  });

  app.post("/claim/:path?", async function (req, res) {
    let path = req.params.path ?? "/";
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
}

export { startEndpoints };
