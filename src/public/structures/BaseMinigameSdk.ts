import EventEmitter from "eventemitter3";
import { ParentOpcodes, MinigameOpcodes } from "../../";
import type { ParentTypes, MinigameTypes } from "../../";

export interface BaseMinigameSdk {
  /** The minigame data */
  data?: ParentTypes[ParentOpcodes.READY];

  /**
   * Add a listener to recieve events from the parent
   * @param evt The parent type to listen to
   * @param listener The listener
   * @returns The event emitter
   */
  on<O extends ParentOpcodes>(
    evt: O,
    listener: (payload: ParentTypes[O]) => unknown,
  ): EventEmitter<ParentOpcodes, any>;
  /**
   * Add a one-time listener to recieve events from the parent
   * @param evt The parent type to listen to
   * @param listener The listener
   * @returns The event emitter
   */
  once<O extends ParentOpcodes>(
    evt: O,
    listener: (payload: ParentTypes[O]) => unknown,
  ): EventEmitter<ParentOpcodes, any>;
  /**
   * Disable a listener from recieve events
   * @param evt The parent type to listen to
   * @param listener The listener
   * @returns The event emitter
   */
  off<O extends ParentOpcodes>(
    evt: O,
    listener: (payload: ParentTypes[O]) => unknown,
  ): EventEmitter<ParentOpcodes, any>;

  /**
   * Sends a handshake to the parent to start listening to events
   * @returns The ready payload
   */
  ready(): void;
  /**
   * End the minigame
   */
  endGame(): void;
  /**
   * Save local data store for the minigame (1KB limit)
   */
  saveLocalData(payload: MinigameTypes[MinigameOpcodes.SAVE_LOCAL_DATA]): void;
  /**
   * Set the game state (host-only, 1MB limit)
   * @param payload The state to set
   */
  setGameState(payload: MinigameTypes[MinigameOpcodes.SET_GAME_STATE]): void;
  /**
   * Set a player state (host-only, 1MB limit)
   * @param payload The state to set
   */
  setPlayerState(
    payload: MinigameTypes[MinigameOpcodes.SET_PLAYER_STATE],
  ): void;
  /**
   * Send a game message (host-only, 1MB limit)
   * @param payload The message to send
   */
  sendGameMessage(
    payload: MinigameTypes[MinigameOpcodes.SEND_GAME_MESSAGE],
  ): void;
  /**
   * Send a player message (1MB limit)
   * @param payload The message to send
   */
  sendPlayerMessage(
    payload: MinigameTypes[MinigameOpcodes.SEND_PLAYER_MESSAGE],
  ): void;
  /**
   * Send a private message to a player (1MB limit)
   *
   * Anyone can send messages to the host but only the host can send messages to other players.
   * @param payload The message to send
   */
  sendPrivateMessage(
    payload: MinigameTypes[MinigameOpcodes.SEND_PRIVATE_MESSAGE],
  ): void;
  /**
   * Send a binary game message (host-only, 1MB limit)
   * @param payload The message to send
   */
  sendBinaryGameMessage(
    payload: MinigameTypes[MinigameOpcodes.SEND_BINARY_GAME_MESSAGE],
  ): void;
  /**
   * Send a player message (1MB limit)
   * @param payload The message to send
   */
  sendBinaryPlayerMessage(
    payload: MinigameTypes[MinigameOpcodes.SEND_BINARY_PLAYER_MESSAGE],
  ): void;
  /**
   * Send a private message to a player (1MB limit)
   *
   * Anyone can send messages to the host but only the host can send messages to other players.
   * @param payload The message to send
   */
  sendBinaryPrivateMessage(
    payload: MinigameTypes[MinigameOpcodes.SEND_BINARY_PRIVATE_MESSAGE],
  ): void;

  destroy(): void;
}
