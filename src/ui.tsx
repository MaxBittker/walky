import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Matter from "matter-js";
import { getState } from "./state";
// import { AgentLayout } from "./types";
let Vector = Matter.Vector;
import add from "./../assets/upload.png";
import Aa from "./../assets/text.png";
import X from "./../assets/delete.ico";
import chat from "./../assets/chat.gif";
import "regenerator-runtime/runtime";

import * as browserImageResizer from "browser-image-resizer";
import { sendEntityUpdate } from "./client";
import { EntityType } from "./types";

const config = {
  quality: 0.8,
  maxWidth: 1000,
  maxHeight: 1000,
  autoRotate: true,
  debug: false,
  mimeType: "image/png"
};

let fakeInput = document.getElementById("fake-input");

// fakeInput.addEventListener("paste", e => {
//   e.preventDefault();
//   uploadImage(e.clipboardData.files[0]);
// });

// Note: A single file comes from event.target.files on <input>
document.body.addEventListener("drop", (e) => {
  e.stopPropagation();
  e.preventDefault();
  // console.log(e);
  console.log(e.dataTransfer.getData("URL"));
  let files = Array.from(e.dataTransfer.files);
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
        width: img.width
      });
    };
    img.src = dataURL;
  });

function uploadImage(file: File, i = 0) {
  console.log(file);
  browserImageResizer
    .readAndCompressImage(file, { ...config, mimeType: file.type })
    .then(async (resizedImage: File) => {
      console.log(resizedImage);

      const fileAsDataURL = window.URL.createObjectURL(resizedImage);
      const dimensions = (await getHeightAndWidthFromDataUrl(
        fileAsDataURL
      )) as any;
      // Upload file to some Web API
      const formData = new FormData();
      formData.append("image-upload", resizedImage);

      let { me, entities } = getState();
      formData.append(
        "position",
        JSON.stringify(
          Vector.add(
            me.pos,
            Vector.mult(
              {
                x: 30,
                y: 30
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
          y: dimensions.height
        })
      );
      formData.append("owner", me.uuid);

      fetch("/upload", {
        method: "POST",
        body: formData
      })
        // .then((response) => response.json())
        .then((bod) => {
          return bod.json();
        })
        .then((data) => {
          console.log(data);

          let maxDimension = Math.max(dimensions.width, dimensions.height);
          let scale = 300 / maxDimension;
          let newEnt = {
            ...data,
            uuid: Math.random().toString().slice(2, 7),
            pos: data.position,
            scale,
            rotation: 0.0,
            iid:
              entities.map((e) => e.iid).reduce((a, b) => Math.max(a, b), 1) + 1
          };
          let state = getState();

          state.entities.push(newEnt);
          state.entities = state.entities.sort((a, b) => a.iid - b.iid);
          sendEntityUpdate(newEnt.uuid);
        })
        .catch((error) => {
          console.error(error);
        });

      // return fetch(url, options);
    })
    .catch((e: any) => console.error(e));
  // .then(result => {
  // TODO: Handle the result
  // console.log(result);
  // });
}

function imagePrompt(event: React.MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
  let el = document.getElementById("imgupload");
  el.click();
  let state = getState();
  state.me.target = state.me.pos;
}

function textAdd(event: React.MouseEvent) {
  event.preventDefault();
  event.stopPropagation();

  let state = getState();
  state.me.target = state.me.pos;

  let newEnt = {
    value: "New Text",
    type: EntityType.Text,
    uuid: Math.random().toString().slice(2, 7),
    pos: state.me.pos,
    size: { x: 164, y: 55 },
    scale: 1.0,
    rotation: 0.0,
    iid:
      state.entities.map((e) => e.iid).reduce((a, b) => Math.max(a, b), 1) + 1
  };

  state.entities.push(newEnt);
  state.entities = state.entities.sort((a, b) => a.iid - b.iid);
  sendEntityUpdate(newEnt.uuid);
}

class UI extends React.Component {
  constructor(props: any) {
    super(props);
    document.body.className = "";
    this.state = {
      infoOpen: false
    };
  }
  async imageUpload(e: React.ChangeEvent) {
    let files = e.target.files;
    if (files.length == 0) {
      return;
    }

    Array.from(e.target.files).forEach(uploadImage);
  }
  openKB(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    document.getElementById("fake-input").focus();
    return;
  }

  render() {
    let { infoOpen } = this.state;
    const urlParams = new URLSearchParams(window.location.search);
    let editing = true;
    //  urlParams.get("edit") !== null;
    return (
      <div id="items">
        <input
          type="file"
          multiple
          id="imgupload"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => this.imageUpload(e)}
        />
        {/* {file && <img src={URL.createObjectURL(file)} />} */}
        {editing && (
          <>
            {" "}
            <img
              src={add}
              className="tool"
              id="add-image"
              onClick={imagePrompt}
            />
            <img src={Aa} className="tool" id="add-text" onClick={textAdd} />
          </>
        )}

        <img
          src={chat}
          className="tool"
          id="chat-image"
          onClick={(e) => {
            e.stopPropagation();
            let state = getState();
            state.me.target = state.me.pos;
            fakeInput.focus();
          }}
        />

        {infoOpen && (
          <div id="info">
            <img
              alt="ok"
              id="close"
              onClick={(e) => {
                e.stopPropagation();

                this.setState({ infoOpen: false });
              }}
              src={X}
            ></img>
            <h1>
              Please post images of the{" "}
              <span style={{ textDecoration: "underline" }}>sky.</span>
            </h1>
            <br></br>
            <p>(updated 9/12)</p>
          </div>
        )}
      </div>
    );
  }
}

function startUI() {
  console.log("starting");

  ReactDOM.render(<UI />, document.getElementById("ui"));
}

export { startUI };
