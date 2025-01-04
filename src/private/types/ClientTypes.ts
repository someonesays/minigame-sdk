import { ClientOpcodes, State } from "../../";

export interface ClientTypes {
  [ClientOpcodes.PING]: {};
  [ClientOpcodes.KICK_PLAYER]: number;
  [ClientOpcodes.TRANSFER_HOST]: number;
  [ClientOpcodes.SET_ROOM_SETTINGS]?: string | null;
  [ClientOpcodes.BEGIN_GAME]?: null;
  [ClientOpcodes.MINIGAME_HANDSHAKE]?: number;
  [ClientOpcodes.MINIGAME_END_GAME]: boolean;
  [ClientOpcodes.MINIGAME_SET_GAME_STATE]: State;
  [ClientOpcodes.MINIGAME_SET_PLAYER_STATE]: { user: number; state: State };
  [ClientOpcodes.MINIGAME_SEND_GAME_MESSAGE]: State;
  [ClientOpcodes.MINIGAME_SEND_PLAYER_MESSAGE]: State;
  [ClientOpcodes.MINIGAME_SEND_PRIVATE_MESSAGE]: [
    State,
    number | null | undefined,
  ];
  [ClientOpcodes.MINIGAME_SEND_BINARY_GAME_MESSAGE]: Uint8Array;
  [ClientOpcodes.MINIGAME_SEND_BINARY_PLAYER_MESSAGE]: Uint8Array;
  [ClientOpcodes.MINIGAME_SEND_BINARY_PRIVATE_MESSAGE]: [
    Uint8Array,
    number | null | undefined,
  ];
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
  | ClientOpcodeAndData<ClientOpcodes.MINIGAME_SEND_PRIVATE_MESSAGE>
  | ClientOpcodeAndData<ClientOpcodes.MINIGAME_SEND_BINARY_GAME_MESSAGE>
  | ClientOpcodeAndData<ClientOpcodes.MINIGAME_SEND_BINARY_PLAYER_MESSAGE>
  | ClientOpcodeAndData<ClientOpcodes.MINIGAME_SEND_BINARY_PRIVATE_MESSAGE>;
