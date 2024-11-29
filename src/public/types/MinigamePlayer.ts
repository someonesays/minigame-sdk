import type { State } from "../../";

/** A minigame player  */
export interface MinigamePlayer {
  id: string;
  displayName: string;
  avatar: string;
  mobile: boolean;
  state: State;
}
