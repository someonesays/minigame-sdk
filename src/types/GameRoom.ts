import type { State } from "../types";

/** The room data */
export interface GameRoom {
  host: string;
  state: State;
}
