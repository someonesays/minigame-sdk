import type { MinigamePlayer } from "../../";

export interface GamePlayer extends MinigamePlayer {
  ready: boolean;
}
