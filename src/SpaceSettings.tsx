import * as React from "react";
import { useState } from "react";
import { useAtom, atom } from "jotai";
import classNames from "classnames";

import "./settings.css";
import { getEditCode, setEditCode } from "./client";
import {
  accessStatusAtom,
  claimedStatusAtom,
  spaceSettingsOpen,
} from "./state";
import { useNavigate } from "react-router";

function generateCode() {
  return Math.random().toString(36).slice(2, 7);
}

const starterCode = generateCode();
export default function SpaceSettings() {
  let [open, setOpen] = useAtom(spaceSettingsOpen);
  let [success, setSuccess] = useState(false);
  let [claimed, setClaimedStatus] = useAtom(claimedStatusAtom);
  let [accessStatus, setAccessStatus] = useAtom(accessStatusAtom);

  let [code, setCode] = useState(starterCode);
  let [email, setEmail] = useState<string>("");
  let [opt, setOpt] = useState(true);

  React.useEffect(() => {
    const url = `/claimed${window.location.pathname}`;

    const fetchData = async () => {
      try {
        const response = await fetch(url, {
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
            code: getEditCode() ?? "",
          },
        });
        const json = await response.json();
        console.log(json);
        if (json?.access) {
          setAccessStatus(json?.access);
        }
        setClaimedStatus(json?.claimed);
      } catch (error) {
        console.log("error", error);
      }
    };

    fetchData();
  }, []);

  const hidden = claimed === true || claimed === null;
  const navigate = useNavigate();

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
      // window.setTimeout(() => {
      //   // navigate(window.location.pathname);
      // }, 3000);
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

      {success && (
        <h3> Space Claimed! Write down this code: {code} .Refresh to edit!</h3>
      )}
    </div>
  );
}
