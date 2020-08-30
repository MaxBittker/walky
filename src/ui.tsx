import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Matter from "matter-js";
import { getState } from "./state";
// import { getState } from "./state";
// import { AgentLayout } from "./types";
// let Vector = Matter.Vector;

function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("image-upload", file);
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
}

function imagePrompt() {
  let el = document.getElementById("imgupload");
  el.click();
}

class UI extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { file: null };
  }
  imageUpload(e: React.ChangeEvent) {
    e.preventDefault();
    console.log(e.target.files);
    let files = e.target.files;
    if (files.length == 0) {
      return;
    }
    uploadImage(files[0]);
    this.setState({ file: files[0] });
  }

  render() {
    let { file } = this.state;
    return (
      <div className="items">
        <input
          type="file"
          id="imgupload"
          accept="image/*"
          style={{ display: "none" }}
          onChange={e => this.imageUpload(e)}
        />
        {file && <img src={URL.createObjectURL(file)} />}
        <span id="add-image" onClick={imagePrompt}>
          +
        </span>
      </div>
    );
  }
}

function startUI() {
  console.log("starting");

  ReactDOM.render(<UI />, document.getElementById("ui"));
}

export { startUI };
