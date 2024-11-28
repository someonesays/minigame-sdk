/** These are the different types of prizes the minigame can give when a minigame ends */
export enum GamePrizeType {
  /** Send 1 point for participation */
  PARTICIPATION = 0,
  /** Give 5 points to the winner */
  WINNER = 1,
  /** Give 4 points to second place */
  SECOND = 2,
  /** Give 3 points to third place */
  THIRD = 3,
}

/** A prize to give to a player */
export interface GamePrize {
  user: string;
  type: GamePrizeType;
}

/** The array of prizes to give to players */
export type GamePrizes = GamePrize[];
