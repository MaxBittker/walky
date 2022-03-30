const util = require("util");
const gc = require("./config/");
const bucket = gc.bucket("walky-uploads"); // should be your bucket name

/**
 *
 * @param { File } object file object that will be uploaded
 * @description - This function does the following
 * - It uploads a file to the image bucket on Google Cloud
 * - It accepts an object as an argument with the
 *   "originalname" and "buffer" as keys
 */

export const uploadImage = (
  file: { originalname: any; buffer: any },
  originalname: string
) =>
  new Promise((resolve, reject) => {
    const { buffer } = file;
    let name = originalname.replace(/ /g, "_");
    const blob = bucket.file(name);
    const blobStream = blob.createWriteStream({
      resumable: false
    });
    blobStream
      .on("finish", () => {
        const publicUrl = util.format(
          `https://storage.googleapis.com/${bucket.name}/${name}`
        );
        resolve(publicUrl);
      })
      .on("error", (e: any) => {
        console.log(e);
        reject(`Unable to upload image, something went wrong`);
      })
      .end(buffer);
  });
