import type { MinigameOpcodes, State } from "../../";

export interface MinigameTypes {
  [MinigameOpcodes.HANDSHAKE]: {};
  [MinigameOpcodes.END_GAME]: {};
  [MinigameOpcodes.SAVE_LOCAL_DATA]: { data?: string | Uint8Array | null };
  [MinigameOpcodes.SET_GAME_STATE]: { state: State };
  [MinigameOpcodes.SET_PLAYER_STATE]: { user: number; state: State };
  [MinigameOpcodes.SEND_GAME_MESSAGE]: { message: State };
  [MinigameOpcodes.SEND_PLAYER_MESSAGE]: { message: State };
  [MinigameOpcodes.SEND_PRIVATE_MESSAGE]: {
    user?: number | null;
    message: State;
  };
  [MinigameOpcodes.SEND_BINARY_GAME_MESSAGE]: { message: Uint8Array };
  [MinigameOpcodes.SEND_BINARY_PLAYER_MESSAGE]: { message: Uint8Array };
  [MinigameOpcodes.SEND_BINARY_PRIVATE_MESSAGE]: {
    user?: number | null;
    message: Uint8Array;
  };
}
