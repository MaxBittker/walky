import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Matter from "matter-js";
import { getState } from "./state";
// import { AgentLayout } from "./types";
// let Vector = Matter.Vector;
import add from "./../assets/add.gif";
import move from "./../assets/move.gif";
import X from "./../assets/delete.ico";
import chat from "./../assets/chat.gif";
import subtract from "./../assets/subtract.gif";

import { readAndCompressImage } from "browser-image-resizer";

const config = {
  quality: 0.8,
  maxWidth: 800,
  maxHeight: 800,
  autoRotate: true,
  debug: false,
};

// const target = document.getElementById('window');

let fakeInput = document.getElementById("fake-input");

// fakeInput.addEventListener("paste", e => {
//   e.preventDefault();
//   uploadImage(e.clipboardData.files[0]);
// });

// Note: A single file comes from event.target.files on <input>
document.body.addEventListener("drop", (e) => {
  e.stopPropagation();
  e.preventDefault();
  console.log(e);
  console.log(e.dataTransfer.getData("URL"));
  uploadImage(e.dataTransfer.files[0]);
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

function uploadImage(file: File) {
  readAndCompressImage(file, config).then(async (resizedImage: File) => {
    const fileAsDataURL = window.URL.createObjectURL(resizedImage);
    const dimensions = (await getHeightAndWidthFromDataUrl(
      fileAsDataURL
    )) as any;
    console.log(dimensions);
    // Upload file to some Web API
    const formData = new FormData();
    formData.append("image-upload", resizedImage);

    let { me } = getState();
    formData.append("position", JSON.stringify(me.pos));
    formData.append(
      "size",
      JSON.stringify({
        x: dimensions.width,
        y: dimensions.height,
      })
    );
    formData.append("owner", me.uuid);

    fetch("/upload", {
      method: "POST",
      body: formData,
    })
      // .then((response) => response.json())
      .then((data) => {
        console.log(data);
        // add;
      })
      .catch((error) => {
        console.error(error);
      });

    // return fetch(url, options);
  });
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
  state.me.target = undefined;
}

class UI extends React.Component {
  constructor(props: any) {
    super(props);
    document.body.className = "";
    this.state = {
      file: null,
      infoOpen: false,
    };
  }
  imageUpload(e: React.ChangeEvent) {
    let files = e.target.files;
    if (files.length == 0) {
      return;
    }
    uploadImage(files[0]);
    this.setState({ file: files[0] });
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
    let editing = urlParams.get("edit") !== null;
    return (
      <div className="items">
        <input
          type="file"
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
          </>
        )}

        <img
          src={chat}
          className="tool"
          id="chat-image"
          onClick={(e) => {
            e.stopPropagation();
            let state = getState();
            state.me.target = undefined;
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
