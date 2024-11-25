import type { GamePrizes, MinigameOpcodes, State } from "../types";

export interface MinigameTypes {
  [MinigameOpcodes.HANDSHAKE]: {};
  [MinigameOpcodes.END_GAME]: {
    prizes: GamePrizes;
  };
  [MinigameOpcodes.SET_CLIENT_PROMPT]: {
    prompt: string;
  };
  [MinigameOpcodes.SET_GAME_STATE]: {
    state: State;
  };
  [MinigameOpcodes.SET_PLAYER_STATE]: {
    user: string;
    state: State;
  };
  [MinigameOpcodes.SEND_GAME_MESSAGE]: {
    message: State;
  };
  [MinigameOpcodes.SEND_PLAYER_MESSAGE]: {
    message: State;
  };
  [MinigameOpcodes.SEND_PRIVATE_MESSAGE]: {
    user?: string;
    message: State;
  };
}
