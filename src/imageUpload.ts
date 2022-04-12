import "./tools.css";

import * as Vector from "@graph-ts/vector2";
import { getState } from "./state";

import "regenerator-runtime/runtime";

import { readAndCompressImage } from "browser-image-resizer";
import { sendEntityUpdate } from "./client";
import { EntityLayout } from "./types";

document.onpaste = function (event) {
  const items = event?.clipboardData?.items ?? [];
  for (let index in items) {
    const item = items[index];
    if (item.kind === "file") {
      const blob = item.getAsFile();
      if (!blob) return;
      const reader = new FileReader();
      reader.onload = function () {
        uploadImage(blob);
      }; // data url!
      reader.readAsDataURL(blob);
    }
  }
};

document.body.addEventListener("drop", async (e) => {
  e.stopPropagation();
  e.preventDefault();
  if (!e.dataTransfer) {
    return;
  }
  let html = e.dataTransfer.getData("text/html");
  let regexp = /src="(.*?)"/g;

  let matches = html.matchAll(regexp);
  for (const match of matches) {
    console.log(match);
    if (match[1].startsWith("data:image")) {
      uploadImageDataUrl(match[1]);
    } else {
      uploadImageUrl(match[1]);
    }
  }

  let files = Array.from(e.dataTransfer.files);

  console.log(files);
  files.forEach(uploadImage);
});
document.body.addEventListener("dragenter", (event) => {
  event.stopPropagation();
  event.preventDefault();
});
document.body.addEventListener("dragover", (event) => {
  event.stopPropagation();
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
});
// ondragover="event.stopPropagation(); event.preventDefault(); handleDragOver(event);"
// ondrop="event.stopPropagation(); event.preventDefault(); handleDrop(event);">

const getHeightAndWidthFromDataUrl = (dataURL: string) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        height: img.height,
        width: img.width,
      });
    };
    img.src = dataURL;
  });
function createEnt(data: {
  size: { x: number; y: number };
  type: any;
  value: any;
  position: any;
}) {
  let { entities } = getState();

  console.log(data);
  let maxDimension = Math.max(data.size.x, data.size.y);
  let scale = 300 / maxDimension;
  let newEnt: EntityLayout = {
    type: data.type,
    value: data.value,
    size: data.size,
    uuid: Math.random().toString().slice(2, 7),
    pos: data.position,
    scale,
    rotation: 0.0,
    iid: entities.map((e) => e.iid).reduce((a, b) => Math.max(a, b), 1) + 1,
  };
  let state = getState();

  state.entities.push(newEnt);
  state.entities = state.entities.sort((a, b) => a.iid - b.iid);
  sendEntityUpdate(newEnt.uuid);
}
function uploadImageUrl(url: string, i = 0) {
  const formData = new FormData();

  let { me } = getState();
  formData.append(
    "position",
    JSON.stringify(
      Vector.add(
        me.pos,
        Vector.multiplyScalar(
          {
            x: 30,
            y: 30,
          },
          i
        )
      )
    )
  );

  formData.append("owner", me.uuid);
  formData.append("name", url);
  formData.append("url", url);

  fetch("/upload", {
    method: "POST",
    body: formData,
  })
    .then((bod) => {
      return bod.json();
    })
    .then(createEnt)
    .catch((error) => {
      console.error(error);
    });
}

function dataURLtoBlob(dataurl: string) {
  var arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

async function uploadImageDataUrl(fileAsDataURL: string, i = 0) {
  const dimensions = (await getHeightAndWidthFromDataUrl(fileAsDataURL)) as any;
  const formData = new FormData();
  formData.append("image-upload", dataURLtoBlob(fileAsDataURL));

  let { me } = getState();
  formData.append(
    "position",
    JSON.stringify(
      Vector.add(
        me.pos,
        Vector.multiplyScalar(
          {
            x: 30,
            y: 30,
          },
          i
        )
      )
    )
  );
  formData.append(
    "size",
    JSON.stringify({
      x: dimensions.width,
      y: dimensions.height,
    })
  );
  formData.append("owner", me.uuid);
  formData.append("name", "dataurl.jpg");

  fetch("/upload", {
    method: "POST",
    body: formData,
  })
    .then((bod) => {
      return bod.json();
    })
    .then(createEnt)
    .catch((error) => {
      console.error(error);
    });
}

async function uploadPreparedImage(file: File, i = 0) {
  const fileAsDataURL = window.URL.createObjectURL(file);
  const dimensions = (await getHeightAndWidthFromDataUrl(fileAsDataURL)) as any;
  const formData = new FormData();
  formData.append("image-upload", file);

  let { me } = getState();
  formData.append(
    "position",
    JSON.stringify(
      Vector.add(
        me.pos,
        Vector.multiplyScalar(
          {
            x: 30,
            y: 30,
          },
          i
        )
      )
    )
  );
  formData.append(
    "size",
    JSON.stringify({
      x: dimensions.width,
      y: dimensions.height,
    })
  );
  formData.append("owner", me.uuid);
  formData.append("name", file.name);

  fetch("/upload", {
    method: "POST",
    body: formData,
  })
    .then((bod) => {
      return bod.json();
    })
    .then(createEnt)
    .catch((error) => {
      console.error(error);
    });
}

const config = {
  quality: 0.8,
  maxWidth: 1000,
  maxHeight: 1000,
  autoRotate: true,
  debug: false,
  mimeType: "image/png",
};

async function uploadImage(file: File, i = 0) {
  if (file.type === "image/gif") {
    uploadPreparedImage(file, i);
    return;
  }
  readAndCompressImage(file, { ...config, mimeType: file.type })
    .then(async (resizedImage: File) => {
      uploadPreparedImage(resizedImage, i);
    })
    .catch((e: any) => console.error(e));
}
export { uploadImage };
