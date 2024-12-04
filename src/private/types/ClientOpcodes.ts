export enum ClientOpcodes {
  PING = 0,
  KICK_PLAYER = 1,
  TRANSFER_HOST = 2,
  SET_ROOM_SETTINGS = 3,
  BEGIN_GAME = 4,
  MINIGAME_HANDSHAKE = 5,
  MINIGAME_END_GAME = 6,
  MINIGAME_SET_GAME_STATE = 7,
  MINIGAME_SET_PLAYER_STATE = 8,
  MINIGAME_SEND_GAME_MESSAGE = 9,
  MINIGAME_SEND_PLAYER_MESSAGE = 10,
  MINIGAME_SEND_PRIVATE_MESSAGE = 11,
  MINIGAME_SEND_BINARY_GAME_MESSAGE = 12,
  MINIGAME_SEND_BINARY_PLAYER_MESSAGE = 13,
  MINIGAME_SEND_BINARY_PRIVATE_MESSAGE = 14,
}
