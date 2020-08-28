import * as Matter from "matter-js";

interface EntityLayout {
  uuid: string;
  url: string;
  pos: Matter.Vector;
  scale: number;
}

interface AgentLayout {
  uuid: string;
  pos: Matter.Vector;
  target?: Matter.Vector;
  facing: Boolean;
  moving: Boolean;
  color?: number;
  lastUpdated: number;
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
  agentUpdate = 1,
  entityUpdate = 2
}
interface PacketLayout {
  type: PacketTypes;
  data: AgentLayout | EntityLayout;
}

export { StateLayout, EntityLayout, AgentLayout, PacketTypes, PacketLayout };
