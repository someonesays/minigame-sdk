import EventEmitter from "eventemitter3";
import { BaseMinigameSdk, ParentOpcodes, MinigameOpcodes } from "../..";
import type { ParentTypes, MinigameTypes } from "../..";

export class MinigameSdk implements BaseMinigameSdk {
  /** The minigame data */
  data?: ParentTypes[ParentOpcodes.READY];

  private isWaiting = false;
  private isDestroyed = false;

  private emitter = new EventEmitter<ParentOpcodes>();
  private source = window.parent.opener ?? window.parent;
  private targetOrigin = document.referrer || "*";

  /**
   * Create the MinigameSDK for Someone Says.
   */
  constructor() {
    try {
      if (window.self === window.top) throw new Error();
    } catch (e) {
      throw new Error(
        "Failed to initiate MinigameSdk. Are you running this minigame inside the game?",
      );
    }

    this.handleMessage = this.handleMessage.bind(this);
    window.addEventListener("message", this.handleMessage, false);
  }
  private handleMessage<O extends ParentOpcodes>({
    source,
    data,
  }: { source: MessageEvent["source"]; data: [O, ParentTypes[O]] }) {
    if (this.source !== source) return;

    const [opcode, payload] = data;

    if (this.data) {
      switch (opcode) {
        case ParentOpcodes.UPDATE_SETTINGS:
          const { settings } =
            payload as ParentTypes[ParentOpcodes.UPDATE_SETTINGS];
          if (settings.language)
            this.data.settings.language = settings.language;
          if (typeof settings.volume === "number")
            this.data.settings.volume = settings.volume;
          break;
        case ParentOpcodes.MINIGAME_PLAYER_READY:
          this.data.players.push(
            (payload as ParentTypes[ParentOpcodes.MINIGAME_PLAYER_READY])
              .player,
          );
          break;
        case ParentOpcodes.PLAYER_LEFT: {
          const player = this.data.players.find(
            (p) =>
              p.id === (payload as ParentTypes[ParentOpcodes.PLAYER_LEFT]).user,
          );
          if (!player) break;

          this.data.players.splice(this.data.players.indexOf(player), 1);
          break;
        }
        case ParentOpcodes.UPDATED_GAME_STATE:
          this.data.room.state =
            payload as ParentTypes[ParentOpcodes.UPDATED_GAME_STATE];
          break;
        case ParentOpcodes.UPDATED_PLAYER_STATE:
          const { user, state } =
            payload as ParentTypes[ParentOpcodes.UPDATED_PLAYER_STATE];
          const player = this.data.players.find((p) => p.id === user);
          if (!player) break;

          player.state = state;
          break;
      }
    } else if (opcode === ParentOpcodes.READY) {
      this.isWaiting = false;
      this.data = payload as ParentTypes[ParentOpcodes.READY];
    }

    this.emitter.emit(opcode, payload);
  }
  private postMessage<O extends MinigameOpcodes>(
    opcode: O,
    payload: MinigameTypes[O],
  ) {
    this.source.postMessage([opcode, payload], this.targetOrigin);
  }

  /**
   * Add a listener to recieve events from the parent
   * @param evt The parent type to listen to
   * @param listener The listener
   * @returns The event emitter
   */
  on<O extends ParentOpcodes>(
    evt: O,
    listener: (payload: ParentTypes[O]) => unknown,
  ) {
    return this.emitter.on(evt, listener);
  }
  /**
   * Add a one-time listener to recieve events from the parent
   * @param evt The parent type to listen to
   * @param listener The listener
   * @returns The event emitter
   */
  once<O extends ParentOpcodes>(
    evt: O,
    listener: (payload: ParentTypes[O]) => unknown,
  ) {
    return this.emitter.once(evt, listener);
  }
  /**
   * Disable a listener from recieve events
   * @param evt The parent type to listen to
   * @param listener The listener
   * @returns The event emitter
   */
  off<O extends ParentOpcodes>(
    evt: O,
    listener: (payload: ParentTypes[O]) => unknown,
  ) {
    return this.emitter.off(evt, listener);
  }

  /**
   * Sends a handshake to the parent to start listening to events
   * @returns The ready payload
   */
  ready() {
    if (this.data || this.isWaiting) {
      throw new Error("Already ready or requested to be ready");
    }

    this.isWaiting = true;
    this.postMessage(MinigameOpcodes.HANDSHAKE, {});
  }
  /**
   * End the minigame
   */
  endGame() {
    this.postMessage(MinigameOpcodes.END_GAME, {});
  }
  /**
   * Save local data store for the minigame (1KB limit)
   */
  saveLocalData(payload: MinigameTypes[MinigameOpcodes.SAVE_LOCAL_DATA]): void {
    if (
      typeof payload.data !== "string" &&
      !(payload.data instanceof Uint8Array)
    ) {
      throw new Error(
        "You can only set your local data as a string or UInt8Array",
      );
    }
    if (!this.data) {
      throw new Error("Cannot save local data before readying the minigame");
    }

    this.data.data = payload.data;
    this.postMessage(MinigameOpcodes.SAVE_LOCAL_DATA, payload);
  }
  /**
   * Set the game state (host-only, 1MB limit)
   * @param payload The state to set
   */
  setGameState(payload: MinigameTypes[MinigameOpcodes.SET_GAME_STATE]) {
    this.postMessage(MinigameOpcodes.SET_GAME_STATE, payload);
  }
  /**
   * Set a player state (host-only, 1MB limit)
   * @param payload The state to set
   */
  setPlayerState(payload: MinigameTypes[MinigameOpcodes.SET_PLAYER_STATE]) {
    this.postMessage(MinigameOpcodes.SET_PLAYER_STATE, payload);
  }
  /**
   * Send a game message (host-only, 1MB limit)
   * @param payload The message to send
   */
  sendGameMessage(payload: MinigameTypes[MinigameOpcodes.SEND_GAME_MESSAGE]) {
    this.postMessage(MinigameOpcodes.SEND_GAME_MESSAGE, payload);
  }
  /**
   * Send a player message (1MB limit)
   * @param payload The message to send
   */
  sendPlayerMessage(
    payload: MinigameTypes[MinigameOpcodes.SEND_PLAYER_MESSAGE],
  ) {
    this.postMessage(MinigameOpcodes.SEND_PLAYER_MESSAGE, payload);
  }
  /**
   * Send a private message to a player (1MB limit)
   *
   * Anyone can send messages to the host but only the host can send messages to other players.
   * @param payload The message to send
   */
  sendPrivateMessage(
    payload: MinigameTypes[MinigameOpcodes.SEND_PRIVATE_MESSAGE],
  ) {
    this.postMessage(MinigameOpcodes.SEND_PRIVATE_MESSAGE, payload);
  }
  /**
   * Send a binary game message (host-only, 1MB limit)
   * @param payload The message to send
   */
  sendBinaryGameMessage(
    payload: MinigameTypes[MinigameOpcodes.SEND_BINARY_GAME_MESSAGE],
  ) {
    this.postMessage(MinigameOpcodes.SEND_BINARY_GAME_MESSAGE, payload);
  }
  /**
   * Send a player message (1MB limit)
   * @param payload The message to send
   */
  sendBinaryPlayerMessage(
    payload: MinigameTypes[MinigameOpcodes.SEND_BINARY_PLAYER_MESSAGE],
  ) {
    this.postMessage(MinigameOpcodes.SEND_BINARY_PLAYER_MESSAGE, payload);
  }
  /**
   * Send a private message to a player (1MB limit)
   *
   * Anyone can send messages to the host but only the host can send messages to other players.
   * @param payload The message to send
   */
  sendBinaryPrivateMessage(
    payload: MinigameTypes[MinigameOpcodes.SEND_BINARY_PRIVATE_MESSAGE],
  ) {
    this.postMessage(MinigameOpcodes.SEND_BINARY_PRIVATE_MESSAGE, payload);
  }

  /**
   * Destroy the MinigameSDK.
   */
  destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    this.emitter.removeAllListeners();
    window.removeEventListener("message", this.handleMessage);
  }
}
