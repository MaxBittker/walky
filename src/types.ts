import * as Matter from "matter-js";
import { string } from "prop-types";
import { type } from "os";

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
  tick: number;
  me: AgentLayout;
  camera: Matter.Vector;
  frame: Matter.Vector;
  center: Matter.Vector;
  entities: EntityLayout[];
  agents: AgentLayout[];
}

enum PacketTypes {
  agentUpdate = 1,
  entityUpdate = 2,
  ping = 3,
  pong = 4
}

interface PingLayout {
  pingtime: number;
  tick: number;
}

interface PacketLayout {
  type: PacketTypes;
  data:
    | { [uuid: string]: AgentLayout }
    | AgentLayout
    | EntityLayout
    | PingLayout;
}

export {
  StateLayout,
  EntityLayout,
  AgentLayout,
  PacketTypes,
  PacketLayout,
  PingLayout
};
