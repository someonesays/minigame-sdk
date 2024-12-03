export enum ErrorMessageCodes {
  UNEXPECTED_ERROR = "unexpected_error",
  INVALID_AUTHORIZATION = "missing_authorization",

  SERVERS_BUSY = "servers_busy",

  ALREADY_IN_GAME = "already_in_game",
  REACHED_MAXIMUM_PLAYER_LIMIT = "reached_maximum_player_limit",
  KICKED_FROM_ROOM = "kicked_from_room",
  TESTING_ENDED = "testing_ended",

  WS_DISABLED_IN_TESTING_ROOM = "ws_disabled_in_testing_room",
  WS_NOT_HOST = "ws_not_host",
  WS_DISABLED_DURING_GAME = "ws_disabled_during_game",
  WS_CANNOT_KICK_SELF = "ws_cannot_kick_self",
  WS_CANNOT_TRANSFER_SELF = "ws_cannot_transfer_self",
  WS_CANNOT_FIND_PACK = "ws_cannot_find_pack",
  WS_CANNOT_FIND_MINIGAME = "ws_cannot_find_minigame",
  WS_CANNOT_SELECT_PACK_WITHOUT_MINIGAME = "ws_cannot_select_pack_without_minigame",
  WS_CANNOT_FIND_MINIGAME_IN_PACK = "ws_cannot_find_minigame_in_pack",
  WS_CANNOT_START_WITHOUT_MINIGAME = "ws_cannot_start_without_minigame",
  WS_CANNOT_START_FAILED_REQUIREMENTS = "ws_cannot_start_failed_requirements",
  WS_GAME_HAS_NOT_STARTED = "ws_game_has_not_started",
  WS_CANNOT_HANDSHAKE_IF_READY = "ws_cannot_handshake_if_ready",
  WS_NOT_READY = "ws_not_ready",
  WS_CANNOT_FIND_READY_PLAYER = "ws_cannot_find_ready_player_to_send_message_to",
  WS_CANNOT_HAVE_MULTIPLE_PRIZES = "ws_cannot_have_multiple_prizes",
  WS_NOT_HOST_PRIVATE_MESSAGE = "ws_not_host_private_message",
}

export const ErrorMessageCodesToText = {
  [ErrorMessageCodes.UNEXPECTED_ERROR]: "An unexpected error has occurred.",
  [ErrorMessageCodes.INVALID_AUTHORIZATION]: "Invalid authorization!",

  [ErrorMessageCodes.SERVERS_BUSY]:
    "The servers are currently busy! Please try again later.",

  [ErrorMessageCodes.ALREADY_IN_GAME]:
    "A player with given ID is already in the game.",
  [ErrorMessageCodes.REACHED_MAXIMUM_PLAYER_LIMIT]:
    "Reached maximum player limit in this room.",
  [ErrorMessageCodes.KICKED_FROM_ROOM]: "You've been kicked from the room!",
  [ErrorMessageCodes.TESTING_ENDED]:
    "The minigame has ended on the testing server",

  [ErrorMessageCodes.WS_DISABLED_IN_TESTING_ROOM]:
    "Cannot use disabled opcode in testing room.",
  [ErrorMessageCodes.WS_NOT_HOST]: "Only the host can run this action!",
  [ErrorMessageCodes.WS_DISABLED_DURING_GAME]:
    "Cannot run this action during a game.",
  [ErrorMessageCodes.WS_CANNOT_KICK_SELF]: "Cannot kick yourself.",
  [ErrorMessageCodes.WS_CANNOT_TRANSFER_SELF]:
    "Cannot transfer host to yourself.",
  [ErrorMessageCodes.WS_CANNOT_FIND_PACK]:
    "A pack with given ID doesn't exist!",
  [ErrorMessageCodes.WS_CANNOT_FIND_MINIGAME]:
    "A minigame with given ID doesn't exist!",
  [ErrorMessageCodes.WS_CANNOT_SELECT_PACK_WITHOUT_MINIGAME]:
    "Cannot select pack without minigame.",
  [ErrorMessageCodes.WS_CANNOT_FIND_MINIGAME_IN_PACK]:
    "Cannot find minigame in pack.",
  [ErrorMessageCodes.WS_CANNOT_START_WITHOUT_MINIGAME]:
    "Cannot start game without selecting a minigame.",
  [ErrorMessageCodes.WS_CANNOT_START_FAILED_REQUIREMENTS]:
    "Cannot start game that fails to satisfy the minigame's minimum players to start requirement.",
  [ErrorMessageCodes.WS_GAME_HAS_NOT_STARTED]:
    "Cannot run this action when a game is not ongoing.",
  [ErrorMessageCodes.WS_CANNOT_HANDSHAKE_IF_READY]:
    "Cannot handshake if already ready.",
  [ErrorMessageCodes.WS_NOT_READY]:
    "Cannot run this action if you are not ready.",
  [ErrorMessageCodes.WS_CANNOT_FIND_READY_PLAYER]:
    "Cannot find ready player with given id to run this action",
  [ErrorMessageCodes.WS_CANNOT_HAVE_MULTIPLE_PRIZES]:
    "A user cannot have multiple prizes.",
  [ErrorMessageCodes.WS_NOT_HOST_PRIVATE_MESSAGE]:
    "Only the host can send private messages to other players.",
};
