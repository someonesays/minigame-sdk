/**
 * These are the opcodes the minigame's iframe to the parent page
 */
export enum MinigameOpcodes {
  /**
   * The parent initiates the iframe and waits for a HANDSHAKE message.
   *
   * Sending a HANDSHAKE message is the equivalence to successfully connecting to a minigame.
   * You'll only start receiving events after the handshake is sent.
   */
  HANDSHAKE = "handshake",
  /**
   * When the host ends the game, they'll also provide information, such as who won (up to top 3, optional) and anyone else who should earn participation points (aka they did what the minigame told them to do, also optional).
   * 
   * The minigame should display who won and gained points once the game ends, before sending the END_GAME message.
   * 
   * The minigame will never recieve the END_GAME message, because when the game ends, the iframe will be deleted
and it will display the leaderboards.
   * 
   * Only the host can send this message.
   */
  END_GAME = "end_game",
  /**
   * Change the minigame prompt.
   *
   * This will only impact the client you are sending this message to.
   */
  SET_CLIENT_PROMPT = "set_client_prompt",
  /**
   * Set the game's state (persistent until the minigame ends).
   *
   * Only the host can send this message.
   */
  SET_GAME_STATE = "set_game_state",
  /**
   * Set your own player state (persistent until the minigame ends).
   *
   * The host can modify player states.
   */
  SET_PLAYER_STATE = "set_player_state",
  /**
   * Send a game message (one-time, think of it like a system message).
   *
   * Only the host can send this message.
   */
  SEND_GAME_MESSAGE = "send_game_message",
  /**
   * Send a player message (one-time, think of it like a system message).
   */
  SEND_PLAYER_MESSAGE = "send_player_message",
  /**
   * Send a private player message to another player (host by default).
   *
   * Only the host can send messages to other players.
   * Everyone else can only send private messages to the host.
   */
  SEND_PRIVATE_MESSAGE = "send_private_message",
}