import type { GamePrizes, MinigameOpcodes, State } from "../../";

export interface MinigameTypes {
  [MinigameOpcodes.HANDSHAKE]: {};
  [MinigameOpcodes.END_GAME]: { prizes: GamePrizes };
  [MinigameOpcodes.SET_GAME_STATE]: { state: State };
  [MinigameOpcodes.SET_PLAYER_STATE]: { user: string; state: State };
  [MinigameOpcodes.SEND_GAME_MESSAGE]: { message: State };
  [MinigameOpcodes.SEND_PLAYER_MESSAGE]: { message: State };
  [MinigameOpcodes.SEND_PRIVATE_MESSAGE]: { user?: string; message: State };
  [MinigameOpcodes.SEND_BINARY_GAME_MESSAGE]: Uint8Array;
  [MinigameOpcodes.SEND_BINARY_PLAYER_MESSAGE]: Uint8Array;
  [MinigameOpcodes.SEND_BINARY_PRIVATE_MESSAGE]: {
    user?: string;
    message: Uint8Array;
  };
}
