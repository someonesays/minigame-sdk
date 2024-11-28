import type { State } from "../../";

/** The room data */
export interface GameRoom {
  host: string;
  state: State;
}
