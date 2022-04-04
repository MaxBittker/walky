import { Storage } from "@google-cloud/storage";
import path from "path";
const serviceKey = path.join(__dirname, "./keys.json");

const storage = new Storage({
  keyFilename: serviceKey,
  projectId: "walky-345702"
});

export default storage;
