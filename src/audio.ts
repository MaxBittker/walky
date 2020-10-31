import * as Matter from "matter-js";
let Vector = Matter.Vector;
import { getState } from "./state";
import { nrandom } from "./utils";

import ambient_sounds from "../scraper/ambient_sounds.json";

function randomSound() {
  return ambient_sounds[Math.floor(Math.random() * ambient_sounds.length)];
}

let radius = 2000;
function randomSoundEntity() {
  let sound = randomSound();
  return {
    pos: { x: nrandom(radius), y: nrandom(radius) },
    url: sound["url_audio"][0]
  };
}
let sounds = [];

for (var i = 0; i < 100; i++) {
  sounds.push(randomSoundEntity());
}

console.log(sounds);

const AudioContext = window.AudioContext || window.webkitAudioContext;

const audioContext = new AudioContext();

class Source {
  pos: Matter.Vector;
  url: String;
  playing: boolean;
  activated: boolean;
  audioElement: HTMLAudioElement;
  track: MediaElementAudioSourceNode;
  lowpass: BiquadFilterNode;
  gain: GainNode;

  constructor(pos: Matter.Vector, url: string) {
    this.pos = pos;
    this.url = url;

    // get the audio element
    this.audioElement = new Audio();
    this.audioElement.crossOrigin = "anonymous";
    this.audioElement.src = url;

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

    this.track
      .connect(this.lowpass)
      .connect(this.gain)
      .connect(audioContext.destination);

    this.activated = false;
    this.playing = false;
  }

  start() {
    if (!this.activated) {
      let playPromise = this.audioElement.play();
      playPromise.then(() => {
        this.activated = true;
        this.playing = true;
      });
    }
  }
  play() {
    if (!this.playing && this.activated) {
      let playPromise = this.audioElement.play();
      playPromise.then(() => {
        this.playing = true;
      });
    }
  }
  pause() {
    if (this.playing) {
      this.audioElement.pause();
      this.playing = false;
    }
  }
  attenuate(ear_pos: Matter.Vector) {
    let delta = Vector.sub(ear_pos, this.pos);
    let distance = Math.pow(Vector.magnitude(delta), 1.5) / 3500;
    let safe_distance = Math.max(distance, 1);
    distance = Math.max(distance, 0.01);
    let gain = 0.8 / safe_distance;
    let cutoff = 2000 / Math.pow(distance, 1.5);

    this.gain.gain.value = Math.min(gain, 0.8);
    this.lowpass.frequency.value = Math.min(cutoff, 22000);

    if (gain < 0.1) {
      this.pause();
    } else {
      this.play();
    }
  }
}

let sources = sounds.map(({ pos, url }) => new Source(pos, url));

function start_audio() {
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  sources.forEach(s => s.start());
}

function attenuate() {
  let { me } = getState();
  let { pos } = me;
  sources.forEach(s => s.attenuate(pos));
}
export { start_audio, attenuate };
