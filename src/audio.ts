import * as Vector from "@graph-ts/vector2";

import { getState } from "./state";
import seedrandom from "seedrandom";
import ambient_sounds from "../scraper/ambient_sounds.json";

// const rng = seedrandom("hello.");
const rng = seedrandom("2");

function randomSound() {
  return ambient_sounds[Math.floor(rng() * ambient_sounds.length)];
}
function n_rng(s = 1) {
  return (rng() - 0.5) * s;
}

let radius = 10000;
function randomSoundEntity() {
  let sound = randomSound();
  return {
    pos: { x: n_rng(radius), y: n_rng(radius) },
    url: sound["url_audio"][0],
    name: sound["name_audio"][0],
  };
}
let sounds = [];

for (var i = 0; i < 130; i++) {
  sounds.push(randomSoundEntity());
}

// console.log(sounds);

const AudioContext = window.AudioContext || window.webkitAudioContext;

const audioContext = new AudioContext();

class Source {
  pos: Matter.Vector;
  url: string;
  name: string;
  playing: boolean;
  activated: boolean;
  loaded: boolean;
  audioElement: HTMLAudioElement;
  track: MediaElementAudioSourceNode;
  lowpass: BiquadFilterNode;
  gain: GainNode;

  constructor(pos: Matter.Vector, url: string, name: string) {
    this.pos = pos;
    this.url = url;
    this.name = name;
    console.log(name);
    console.log(url);
    // get the audio element
    this.audioElement = new Audio();

    this.audioElement.addEventListener(
      "ended",
      () => {
        this.audioElement.play();
      },
      false
    );

    // pass it into the audio context
    this.track = audioContext.createMediaElementSource(this.audioElement);

    this.lowpass = audioContext.createBiquadFilter();

    this.lowpass.type = "lowpass";
    this.lowpass.Q.value = 0.5;

    this.gain = audioContext.createGain();

    this.activated = false;
    this.playing = false;
    this.loaded = false;
  }
  load() {
    if (!this.loaded) {
      console.log("loading");
      this.audioElement.crossOrigin = "anonymous";
      this.audioElement.src = this.url;
      this.loaded = true;
    }
  }
  start() {
    if (this.loaded && !this.activated) {
      let playPromise = this.audioElement.play();

      this.track
        .connect(this.lowpass)
        .connect(this.gain)
        .connect(audioContext.destination);

      playPromise.then(() => {
        this.activated = true;
        this.playing = true;
      });
    }
  }
  play() {
    if (this.loaded && !this.playing && this.activated) {
      let playPromise = this.audioElement.play();

      this.track
        .connect(this.lowpass)
        .connect(this.gain)
        .connect(audioContext.destination);

      playPromise.then(() => {
        this.playing = true;
      });
    }
  }
  pause() {
    if (this.playing) {
      this.audioElement.pause();

      this.track.disconnect(this.lowpass);
      this.lowpass.disconnect(this.gain);
      this.gain.disconnect(audioContext.destination);

      this.playing = false;
    }
  }
  attenuate(ear_pos: Matter.Vector) {
    let delta = Vector.subtract(ear_pos, this.pos);
    let distance = Math.pow(Vector.length(delta), 1.5) / 3500;
    let safe_distance = Math.max(distance, 1);
    distance = Math.max(distance, 0.01);
    let gain = 0.7 / safe_distance;
    let cutoff = 2000 / Math.pow(distance, 1.5);

    this.gain.gain.value = Math.min(gain, 0.6);
    this.lowpass.frequency.value = Math.min(cutoff, 22000);

    if (gain > 0.05) {
      this.load();
    }
    if (gain < 0.1) {
      this.pause();
    } else {
      this.play();
    }
  }
}

let sources = [];
// sounds.map(({ pos, url, name }) => new Source(pos, url, name));

let state = getState();

state.audios = sources;

function start_audio() {
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  sources.forEach((s) => s.start());
}

function attenuate() {
  let { me } = getState();
  let { pos } = me;
  sources.forEach((s) => {
    if (Math.random() > 0.8) {
      s.attenuate(pos);
    }
  });
}
export { start_audio, attenuate, Source };
