import type { MinigamePlayer } from "../../";

export interface GamePlayer extends MinigamePlayer {
  points: number;
  ready: boolean;
}
