import EventEmitter from "eventemitter3";
import { ParentOpcodes, MinigameOpcodes } from "../../";
import type { ParentTypes, MinigameTypes } from "../../";

export interface BaseMinigameSdk {
  data?: ParentTypes[ParentOpcodes.READY];

  on<O extends ParentOpcodes>(
    evt: O,
    listener: (payload: ParentTypes[O]) => unknown,
  ): EventEmitter<ParentOpcodes, any>;
  once<O extends ParentOpcodes>(
    evt: O,
    listener: (payload: ParentTypes[O]) => unknown,
  ): EventEmitter<ParentOpcodes, any>;
  off<O extends ParentOpcodes>(
    evt: O,
    listener: (payload: ParentTypes[O]) => unknown,
  ): EventEmitter<ParentOpcodes, any>;

  ready(): void;
  endGame(): void;
  setGameState(payload: MinigameTypes[MinigameOpcodes.SET_GAME_STATE]): void;
  setPlayerState(
    payload: MinigameTypes[MinigameOpcodes.SET_PLAYER_STATE],
  ): void;
  sendGameMessage(
    payload: MinigameTypes[MinigameOpcodes.SEND_GAME_MESSAGE],
  ): void;
  sendPlayerMessage(
    payload: MinigameTypes[MinigameOpcodes.SEND_PLAYER_MESSAGE],
  ): void;
  sendPrivateMessage(
    payload: MinigameTypes[MinigameOpcodes.SEND_PRIVATE_MESSAGE],
  ): void;
  sendBinaryGameMessage(
    payload: MinigameTypes[MinigameOpcodes.SEND_BINARY_GAME_MESSAGE],
  ): void;
  sendBinaryPlayerMessage(
    payload: MinigameTypes[MinigameOpcodes.SEND_BINARY_PLAYER_MESSAGE],
  ): void;
  sendBinaryPrivateMessage(
    payload: MinigameTypes[MinigameOpcodes.SEND_BINARY_PRIVATE_MESSAGE],
  ): void;

  destroy(): void;
}
