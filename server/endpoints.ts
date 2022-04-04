import * as path from "path";
import * as http from "http";
import express from "express";
import multer from "multer";
import { uploadImage, uploadImageURl } from "./helpers";

function startEndpoints(PORT: number) {
  const app = express();
  const httpServer = http.createServer(app);

  app.use(express.static("../docs"));
  app.use("/files", express.static("./uploads"));
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
