import EventEmitter from 'eventemitter3';

var MinigameOpcodes = /* @__PURE__ */ ((MinigameOpcodes2) => {
  MinigameOpcodes2["HANDSHAKE"] = "handshake";
  MinigameOpcodes2["END_GAME"] = "end_game";
  MinigameOpcodes2["SET_CLIENT_PROMPT"] = "set_client_prompt";
  MinigameOpcodes2["SET_GAME_STATE"] = "set_game_state";
  MinigameOpcodes2["SET_PLAYER_STATE"] = "set_player_state";
  MinigameOpcodes2["SEND_GAME_MESSAGE"] = "send_game_message";
  MinigameOpcodes2["SEND_PLAYER_MESSAGE"] = "send_player_message";
  MinigameOpcodes2["SEND_PRIVATE_MESSAGE"] = "send_private_message";
  return MinigameOpcodes2;
})(MinigameOpcodes || {});

var ParentOpcodes = /* @__PURE__ */ ((ParentOpcodes2) => {
  ParentOpcodes2["READY"] = "ready";
  ParentOpcodes2["UPDATE_SETTINGS"] = "update_settings";
  ParentOpcodes2["START_GAME"] = "start_game";
  ParentOpcodes2["MINIGAME_PLAYER_READY"] = "player_ready";
  ParentOpcodes2["PLAYER_LEFT"] = "player_left";
  ParentOpcodes2["UPDATED_GAME_STATE"] = "updated_game_state";
  ParentOpcodes2["UPDATED_PLAYER_STATE"] = "updated_player_state";
  ParentOpcodes2["RECEIVED_GAME_MESSAGE"] = "received_game_message";
  ParentOpcodes2["RECEIVED_PLAYER_MESSAGE"] = "received_player_message";
  ParentOpcodes2["RECEIVED_PRIVATE_MESSAGE"] = "received_private_message";
  return ParentOpcodes2;
})(ParentOpcodes || {});

var GamePrizeType = /* @__PURE__ */ ((GamePrizeType2) => {
  GamePrizeType2[GamePrizeType2["PARTICIPATION"] = 0] = "PARTICIPATION";
  GamePrizeType2[GamePrizeType2["WINNER"] = 1] = "WINNER";
  GamePrizeType2[GamePrizeType2["SECOND"] = 2] = "SECOND";
  GamePrizeType2[GamePrizeType2["THIRD"] = 3] = "THIRD";
  return GamePrizeType2;
})(GamePrizeType || {});

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class MinigameSdk {
  /**
   * Create the MinigameSDK for Someone Says.
   */
  constructor() {
    __publicField(this, "isReady", false);
    __publicField(this, "isWaiting", false);
    __publicField(this, "isDestroyed", false);
    __publicField(this, "emitter", new EventEmitter());
    __publicField(this, "source", window.parent.opener ?? window.parent);
    __publicField(this, "targetOrigin", document.referrer || "*");
    try {
      if (window.self === window.top)
        throw new Error();
    } catch (e) {
      throw new Error(
        "Failed to initiate MinigameSdk. Are you running this minigame inside the game?"
      );
    }
    this.handleMessage = this.handleMessage.bind(this);
    window.addEventListener("message", this.handleMessage, false);
  }
  handleMessage({
    source,
    data
  }) {
    if (this.source !== source)
      return;
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
  postMessage(opcode, payload) {
    this.source.postMessage([opcode, payload], this.targetOrigin);
  }
  /**
   * Add a listener to recieve events from the parent.
   * @param evt The parent type to listen to
   * @param listener The listener
   * @returns The event emitter
   */
  on(evt, listener) {
    return this.emitter.on(evt, listener);
  }
  /**
   * Add a one-time listener to recieve events from the parent.
   * @param evt The parent type to listen to
   * @param listener The listener
   * @returns The event emitter
   */
  once(evt, listener) {
    return this.emitter.once(evt, listener);
  }
  /**
   * Disable a listener from recieve events.
   * @param evt The parent type to listen to
   * @param listener The listener
   * @returns The event emitter
   */
  off(evt, listener) {
    return this.emitter.off(evt, listener);
  }
  /**
   * Sends a handshake to the parent to start listening to events.
   * @returns The ready payload
   */
  ready() {
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
  endGame(payload) {
    this.postMessage(MinigameOpcodes.END_GAME, payload);
  }
  /**
   * Set the client prompt (client-side only).
   * @param payload The prompt to set
   */
  setClientPrompt(payload) {
    this.postMessage(MinigameOpcodes.SET_CLIENT_PROMPT, payload);
  }
  /**
   * Set the game state (host-only).
   * @param payload The state to set
   */
  setGameState(payload) {
    this.postMessage(MinigameOpcodes.SET_GAME_STATE, payload);
  }
  /**
   * Set a player state (host-only).
   * @param payload The state to set
   */
  setPlayerState(payload) {
    this.postMessage(MinigameOpcodes.SET_PLAYER_STATE, payload);
  }
  /**
   * Send a game message (host-only).
   * @param payload The message to send
   */
  sendGameMessage(payload) {
    this.postMessage(MinigameOpcodes.SEND_GAME_MESSAGE, payload);
  }
  /**
   * Send a player message (host-only).
   * @param payload The message to send
   */
  sendPlayerMessage(payload) {
    this.postMessage(MinigameOpcodes.SEND_PLAYER_MESSAGE, payload);
  }
  /**
   * Send a private message to a player.
   *
   * Anyone can send messages to the host but only the host can send messages to other players.
   * @param payload The message to send
   */
  sendPrivateMessage(payload) {
    this.postMessage(MinigameOpcodes.SEND_PRIVATE_MESSAGE, payload);
  }
  /**
   * Destroy the MinigameSDK.
   */
  destroy() {
    if (this.isDestroyed)
      return;
    this.isDestroyed = true;
    this.emitter.removeAllListeners();
    window.removeEventListener("message", this.handleMessage);
  }
}

export { GamePrizeType, MinigameOpcodes, MinigameSdk, ParentOpcodes };
