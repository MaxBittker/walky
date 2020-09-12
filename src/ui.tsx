import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Matter from "matter-js";
import { getState } from "./state";
// import { AgentLayout } from "./types";
// let Vector = Matter.Vector;
import add from "./../assets/add.gif";
import X from "./../assets/delete.ico";
import chat from "./../assets/chat.gif";
import subtract from "./../assets/subtract.gif";

import { readAndCompressImage } from "browser-image-resizer";
import { sendEntityUpdate } from "./client";

const config = {
  quality: 0.4,
  maxWidth: 500,
  maxHeight: 500,
  autoRotate: true,
  debug: false
};

// const target = document.getElementById('window');

let fakeInput = document.getElementById("fake-input");

// fakeInput.addEventListener("paste", e => {
//   e.preventDefault();
//   uploadImage(e.clipboardData.files[0]);
// });

// Note: A single file comes from event.target.files on <input>
document.body.addEventListener("drop", e => {
  e.stopPropagation();
  e.preventDefault();
  console.log(e.dataTransfer.getData("URL"));
  uploadImage(e.dataTransfer.files[0]);
});
document.body.addEventListener("dragenter", event => {
  event.stopPropagation();
  event.preventDefault();
});
document.body.addEventListener("dragover", event => {
  event.stopPropagation();
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
});
// ondragover="event.stopPropagation(); event.preventDefault(); handleDragOver(event);"
// ondrop="event.stopPropagation(); event.preventDefault(); handleDrop(event);">

function uploadImage(file: File) {
  readAndCompressImage(file, config).then((resizedImage: File) => {
    // Upload file to some Web API
    const formData = new FormData();
    formData.append("image-upload", resizedImage);

    let { me } = getState();
    formData.append("position", JSON.stringify(me.pos));
    formData.append("owner", me.uuid);

    fetch("/upload", {
      method: "POST",
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        add;
      })
      .catch(error => {
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
    window.deleteMode = false;
    document.body.className = "";
    this.state = { file: null, deleteMode: false, infoOpen: true };

    window.deleteImage = (uuid: string) => {
      this.setState({ deleteMode: false });
      window.deleteMode = false;
      document.body.className = "";
      let state = getState();
      state.me.target = undefined;
      sendEntityUpdate(uuid);
    };
    document.body.addEventListener("click", () => {
      if (window.deleteMode) {
        window.setTimeout(() => {
          this.setState({ deleteMode: false });
          window.deleteMode = false;
          document.body.className = "";
        }, 5);
      }
    });
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
  enterDeleteMode(e: React.MouseEvent) {
    if (this.state.deleteMode) {
      window.deleteMode = false;
      document.body.className = "";
      this.setState({ deleteMode: false });
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    let state = getState();
    state.me.target = undefined;
    window.deleteMode = true;
    document.body.className = "deleting";
    this.setState({ deleteMode: true });
  }

  render() {
    let { infoOpen } = this.state;
    return (
      <div className="items">
        <input
          type="file"
          id="imgupload"
          accept="image/*"
          style={{ display: "none" }}
          onChange={e => this.imageUpload(e)}
        />
        {/* {file && <img src={URL.createObjectURL(file)} />} */}
        <img src={add} className="tool" id="add-image" onClick={imagePrompt} />
        <img
          src={subtract}
          className={"tool " + (this.state.deleteMode ? "active" : "")}
          id="subtract-image"
          onClick={e => this.enterDeleteMode(e)}
        />

        <img
          src={chat}
          className="tool"
          id="chat-image"
          onClick={e => {
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
              onClick={e => {
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
