import * as path from "path";
import * as fs from "fs";
import * as http from "http";
import * as express from "express";
import * as multer from "multer";

function startEndpoints(entityUpload: any) {
  const app = express();
  const httpServer = http.createServer(app);

  const PORT = process.env.PORT || 4000;

  app.use(express.static("../docs"));
  app.use("/files", express.static("./uploads"));

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
      //   console.log(req.body);
      let owner_uuid = req.body["owner"];
      let position = JSON.parse(req.body["position"]);
      const tempPath = req.file.path;
      const uuid = Math.random()
        .toString()
        .slice(2, 7);

      let file_name_uuid = `${uuid}.png`;
      let rel_path = path.join(`./uploads`, file_name_uuid);
      const targetPath = path.join(__dirname, rel_path);

      if (path.extname(req.file.originalname).toLowerCase() === ".png") {
        fs.rename(tempPath, targetPath, err => {
          if (err) return handleError(err, res);
          res
            .status(200)
            .contentType("text/plain")
            .end("File uploaded!");
        });
        entityUpload(
          uuid,
          path.join("/files", file_name_uuid),
          position,
          owner_uuid
        );
      } else {
        fs.unlink(tempPath, err => {
          if (err) return handleError(err, res);
          res
            .status(403)
            .contentType("text/plain")
            .end("Only .png files are allowed!");
        });
      }
    }
  );
}

export { startEndpoints };
