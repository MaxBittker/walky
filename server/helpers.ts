import util from "util";
import gc from "./config/";
const bucket = gc.bucket("walky-uploads"); // should be your bucket name
import axios, { AxiosRequestConfig } from "axios";
import sizeOf from "image-size";

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

export const uploadImageURl = (url: string) =>
  new Promise(async (resolve, reject): Promise<any> => {
    const config = { responseType: "arraybuffer" };

    const resp = await axios.get(url, config as AxiosRequestConfig);
    resp.data;
    const name = encodeURI(url.substring(url.lastIndexOf("/") + 1));

    const blob = bucket.file(name);
    const blobStream = blob.createWriteStream({
      resumable: false
    });
    const dimensions = await sizeOf(resp.data);
    const size = { x: dimensions.width, y: dimensions.height };

    blobStream
      .on("finish", () => {
        const publicUrl = util.format(
          `https://storage.googleapis.com/${bucket.name}/${name}`
        );
        resolve({ publicUrl, size });
      })
      .on("error", (e: any) => {
        console.log(e);
        reject(`Unable to upload image, something went wrong`);
      })
      .end(resp.data);
  });
