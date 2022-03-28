import * as Matter from "matter-js";

interface EntityLayout {
  uuid: string;
  url: string;
  pos: Matter.Vector;
  size: Matter.Vector;
  rotation: number;
  scale: number;
  iid: number;
}

interface AgentLayout {
  uuid: string;
  pos: Matter.Vector;
  target: Matter.Vector;
  facing: Boolean;
  moving: Boolean;
  color?: number;
  word?: string;
}

interface StateLayout {
  me: AgentLayout;
  camera: Matter.Vector;
  frame: Matter.Vector;
  center: Matter.Vector;
  entities: EntityLayout[];
  // audios: Source[];
  agents: AgentLayout[];
}

export { StateLayout, EntityLayout, AgentLayout };
