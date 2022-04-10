import * as React from "react";
import { useState } from "react";
// import { useAtom } from "jotai";
import classNames from "classnames";
import "./settings.css";
import { setEditCode } from "./client";

function generateCode() {
  return Math.random().toString(36).slice(2, 7);
}
const starterCode = generateCode();
export default function SpaceSettings() {
  let [open, setOpen] = useState(false);
  let [success, setSuccess] = useState(false);
  let [spaceStatus, setPlaceStatus] = useState<boolean | null>(null);

  let [code, setCode] = useState(starterCode);
  let [email, setEmail] = useState<string>("");
  let [opt, setOpt] = useState(true);

  React.useEffect(() => {
    const url = `/claimed${window.location.pathname}`;

    const fetchData = async () => {
      try {
        const response = await fetch(url);
        const json = await response.json();
        console.log(json);
        setPlaceStatus(!json?.claimed);
      } catch (error) {
        console.log("error", error);
      }
    };

    fetchData();
  }, []);

  const hidden = spaceStatus === null || spaceStatus === false;
  async function submit() {
    const url = `/claim${window.location.pathname}`;

    const payload = {
      code,
      email,
      opt: opt ? "1" : "0",
    };
    console.log("submitting" + url);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      console.log(json);
      setSuccess(!json?.claimed);
      setEditCode(code);
    } catch (error) {
      console.log("error", error);
    }
  }
  return (
    <div
      className={classNames("PullTabContent ", { open, hidden })}
      onClick={(e) => {
        e.stopPropagation();
      }}
      onKeyDown={(e) => {
        e.stopPropagation();
      }}
    >
      <h1>Claim this space?</h1>
      <p>
        <b> {window.location.hostname + window.location.pathname} </b>is
        currently open to all edits. You may <b>claim</b> this space to prevent
        anyone from editing without the code.
      </p>
      <p>It's important to save this code, so we can send it to your email.</p>

      <p>
        If you set the code to be empty, <i>everyone</i> will be able to edit.
      </p>
      <br></br>
      <label>Edit Code: </label>
      <input
        placeholder="secret code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
      ></input>
      <label> Send the code to: </label>
      <input
        type="email"
        placeholder="email address"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      ></input>
      <label> Mailing list, why not: </label>
      <input
        type="checkbox"
        onChange={() => setOpt(!opt)}
        checked={opt}
      ></input>
      <input
        type="submit"
        value={"claim " + window.location.hostname + window.location.pathname}
        onClick={() => submit()}
      ></input>

      <div
        className="PullTab"
        onClick={(e) => {
          setOpen(!open);
          e.stopPropagation();
        }}
      >
        🛈
      </div>
      {success && <h1> Space Claimed! edit code: {code}</h1>}
    </div>
  );
}
