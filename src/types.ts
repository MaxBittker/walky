import * as Matter from "matter-js";

interface EntityLayout {
  url: string;
  pos: Matter.Vector;
  scale: Number;
}
interface AgentLayout {
  uuid: string;
  pos: Matter.Vector;
  target?: Matter.Vector;
  facing: Boolean;
  moving: Boolean;
  color?: Number;
}
interface StateLayout {
  me: AgentLayout;
  camera: Matter.Vector;
  frame: Matter.Vector;
  center: Matter.Vector;
  entities: EntityLayout[];
  agents: AgentLayout[];
}

enum PacketTypes {
  agentUpdate = 1
}
interface PacketLayout {
  type: PacketTypes;
  data: AgentLayout;
}

export { StateLayout, EntityLayout, AgentLayout, PacketTypes, PacketLayout };
