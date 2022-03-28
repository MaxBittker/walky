import * as path from "path";
import * as fs from "fs";
import * as http from "http";
import express from "express";
import multer from "multer";
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
    res
      .status(500)
      .contentType("text/plain")
      .end("Oops! Something went wrong!");
  };

  const upload = multer({
    dest: "./uploads/"
    // you might also want to set some limits: https://github.com/expressjs/multer#limits
  });

  app.post(
    "/upload",
    upload.single(
      "image-upload" /* name attribute of <file> element in your form */
    ),
    (req, res) => {
      let owner_uuid = req.body["owner"];
      let position = JSON.parse(req.body["position"]);
      let size = JSON.parse(req.body["size"]);
      if (!req.file) {
        return handleError(new Error("no file"), res);
      }
      const tempPath = req.file.path;
      const uuid = Math.random().toString().slice(2, 7);

      let ext = ".jpg";
      let file_name_uuid = `${uuid}${ext}`;
      let rel_path = path.join(`./uploads`, file_name_uuid);
      const targetPath = path.join(__dirname, rel_path);

      if (ext === ".png" || ext == ".jpg" || ext == ".jpeg") {
        fs.rename(tempPath, targetPath, (err) => {
          if (err) return handleError(err, res);
          res
            .status(200)
            .contentType("text/json")
            .end(
              JSON.stringify({
                uuid,
                value: path.join("/files", file_name_uuid),
                type: "img",
                position,
                size,
                owner_uuid
              })
            );
        });
      } else {
        fs.unlink(tempPath, (err) => {
          console.log(ext);
          if (err) return handleError(err, res);
          res
            .status(403)
            .contentType("text/plain")
            .end("Only .png, jpg, and jpeg files are allowed!");
        });
      }
    }
  );
}

export { startEndpoints };
