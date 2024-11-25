import EventEmitter from "eventemitter3";
import { ParentOpcodes, MinigameOpcodes } from "../types";
import type { ParentTypes, MinigameTypes } from "../types";

export class MinigameSdk {
  private isReady = false;
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
  }: { source: MessageEvent["source"] } & { data: [O, ParentTypes[O]] }) {
    if (this.source !== source) return;

    const [opcode, payload] = data;
    switch (opcode) {
      case ParentOpcodes.READY:
        this.isReady = true;
        this.isWaiting = false;
        this.emitter.emit(ParentOpcodes.READY, payload);
        break;
      default:
        this.emitter.emit(opcode, payload);
        break;
    }
  }
  private postMessage<O extends MinigameOpcodes>(
    opcode: O,
    payload: MinigameTypes[O],
  ) {
    this.source.postMessage([opcode, payload], this.targetOrigin);
  }

  /**
   * Add a listener to recieve events from the parent.
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
   * Add a one-time listener to recieve events from the parent.
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
   * Disable a listener from recieve events.
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
   * Sends a handshake to the parent to start listening to events.
   * @returns The ready payload
   */
  ready(): Promise<ParentTypes[ParentOpcodes.READY]> {
    if (this.isReady || this.isWaiting)
      throw new Error("Already ready or requested to be ready");

    this.isWaiting = true;
    this.postMessage(MinigameOpcodes.HANDSHAKE, {});
    return new Promise((resolve) => this.once(ParentOpcodes.READY, resolve));
  }
  /**
   * End the game and assign the winner, second place, third place and anyone else who should earn points for participation.
   *
   * If there is no first place, second place becomes first place.
   * If there is no second place, third place becomes second place.
   *
   * @param payload The prizes to give
   */
  endGame(payload: MinigameTypes[MinigameOpcodes.END_GAME]) {
    this.postMessage(MinigameOpcodes.END_GAME, payload);
  }
  /**
   * Set the client prompt (client-side only).
   * @param payload The prompt to set
   */
  setClientPrompt(payload: MinigameTypes[MinigameOpcodes.SET_CLIENT_PROMPT]) {
    this.postMessage(MinigameOpcodes.SET_CLIENT_PROMPT, payload);
  }
  /**
   * Set the game state (host-only).
   * @param payload The state to set
   */
  setGameState(payload: MinigameTypes[MinigameOpcodes.SET_GAME_STATE]) {
    this.postMessage(MinigameOpcodes.SET_GAME_STATE, payload);
  }
  /**
   * Set a player state (host-only).
   * @param payload The state to set
   */
  setPlayerState(payload: MinigameTypes[MinigameOpcodes.SET_PLAYER_STATE]) {
    this.postMessage(MinigameOpcodes.SET_PLAYER_STATE, payload);
  }
  /**
   * Send a game message (host-only).
   * @param payload The message to send
   */
  sendGameMessage(payload: MinigameTypes[MinigameOpcodes.SEND_GAME_MESSAGE]) {
    this.postMessage(MinigameOpcodes.SEND_GAME_MESSAGE, payload);
  }
  /**
   * Send a player message (host-only).
   * @param payload The message to send
   */
  sendPlayerMessage(
    payload: MinigameTypes[MinigameOpcodes.SEND_PLAYER_MESSAGE],
  ) {
    this.postMessage(MinigameOpcodes.SEND_PLAYER_MESSAGE, payload);
  }
  /**
   * Send a private message to a player.
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
   * Destroy the MinigameSDK.
   */
  destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    this.emitter.removeAllListeners();
    window.removeEventListener("message", this.handleMessage);
  }
}
