import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Matter from "matter-js";
import { getState } from "./state";
// import { getState } from "./state";
// import { AgentLayout } from "./types";
// let Vector = Matter.Vector;
import add from "./../assets/add.gif";

import { readAndCompressImage } from "browser-image-resizer";

const config = {
  quality: 0.4,
  maxWidth: 500,
  maxHeight: 500,
  autoRotate: true,
  debug: false
};

// // Note: A single file comes from event.target.files on <input>
// document.getElementById("window").addEventListener("drop", e => {
//   e.stopPropagation();
//   e.preventDefault();

//   uploadImage(e.dataTransfer.files);
// });

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
    this.state = { file: null };
  }
  imageUpload(e: React.ChangeEvent) {
    console.log(e.target.files);
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
    // let { file } = this.state;
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
        <img src={add} id="add-image" onClick={imagePrompt} />
        {/* </span> */}
      </div>
    );
  }
}

function startUI() {
  console.log("starting");

  ReactDOM.render(<UI />, document.getElementById("ui"));
}

export { startUI };
