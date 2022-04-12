import * as Vector from "@graph-ts/vector2";

enum EntityType {
  Image = "img",
  Text = "text",
}

interface EntityLayout {
  uuid: string;
  value: string;
  type: EntityType;
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
  animation: "move" | "stand" | "sit";
  timeIdle: number;
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

export { StateLayout, EntityLayout, AgentLayout, EntityType };
