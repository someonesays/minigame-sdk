import { ClientOpcodes, GamePrizes, State } from "../../";

export interface ClientTypes {
  [ClientOpcodes.PING]: {};
  [ClientOpcodes.KICK_PLAYER]: { user: string };
  [ClientOpcodes.TRANSFER_HOST]: { user: string };
  [ClientOpcodes.SET_ROOM_SETTINGS]: { packId: string; minigameId: string };
  [ClientOpcodes.BEGIN_GAME]: {};
  [ClientOpcodes.MINIGAME_HANDSHAKE]: { roomHandshakeCount?: number };
  [ClientOpcodes.MINIGAME_END_GAME]: { prizes?: GamePrizes };
  [ClientOpcodes.MINIGAME_SET_GAME_STATE]: { state: State };
  [ClientOpcodes.MINIGAME_SET_PLAYER_STATE]: { user: string; state: State };
  [ClientOpcodes.MINIGAME_SEND_GAME_MESSAGE]: { message: State };
  [ClientOpcodes.MINIGAME_SEND_PLAYER_MESSAGE]: { message: State };
  [ClientOpcodes.MINIGAME_SEND_PRIVATE_MESSAGE]: {
    user?: string;
    message: State;
  };
}

export interface ClientOpcodeAndData<O extends ClientOpcodes> {
  opcode: O;
  data: ClientTypes[O];
}

export type ClientOpcodeAndDatas =
  | ClientOpcodeAndData<ClientOpcodes.PING>
  | ClientOpcodeAndData<ClientOpcodes.KICK_PLAYER>
  | ClientOpcodeAndData<ClientOpcodes.TRANSFER_HOST>
  | ClientOpcodeAndData<ClientOpcodes.SET_ROOM_SETTINGS>
  | ClientOpcodeAndData<ClientOpcodes.BEGIN_GAME>
  | ClientOpcodeAndData<ClientOpcodes.MINIGAME_HANDSHAKE>
  | ClientOpcodeAndData<ClientOpcodes.MINIGAME_END_GAME>
  | ClientOpcodeAndData<ClientOpcodes.MINIGAME_SET_GAME_STATE>
  | ClientOpcodeAndData<ClientOpcodes.MINIGAME_SET_PLAYER_STATE>
  | ClientOpcodeAndData<ClientOpcodes.MINIGAME_SEND_GAME_MESSAGE>
  | ClientOpcodeAndData<ClientOpcodes.MINIGAME_SEND_PLAYER_MESSAGE>
  | ClientOpcodeAndData<ClientOpcodes.MINIGAME_SEND_PRIVATE_MESSAGE>;
