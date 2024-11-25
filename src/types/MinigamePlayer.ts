import type { State } from "../types";

/** A minigame player  */
export interface MinigamePlayer {
  id: string;
  displayName: string;
  avatar: string;
  state: State;
}
