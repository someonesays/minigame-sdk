import type { State } from "../../";

/** The room data */
export interface GameRoom {
  host: number;
  state: State;
}
