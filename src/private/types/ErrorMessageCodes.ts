export enum ErrorMessageCodes {
  NOT_FOUND = "not_found",
  UNEXPECTED_ERROR = "unexpected_error",
  INVALID_AUTHORIZATION = "invalid_authorization",
  RATE_LIMITED = "rate_limited",
  INTERNAL_ERROR = "internal_error",
  FAILED_CAPTCHA = "failed_captcha",

  FAILED_TO_FETCH = "failed_to_fetch",
  INVALID_CONTENT_TYPE = "invalid_content_type",

  CANNOT_FIND_MINIGAME_FOR_PACK = "cannot_find_minigame_for_pack",
  MINIGAME_ALREADY_IN_PACK = "minigame_already_in_pack",
  REACHED_PACK_MINIGAME_LIMIT = "reached_pack_minigame_limit",

  REACHED_MINIGAME_LIMIT = "reached_minigame_limit",
  REACHED_PACK_LIMIT = "reached_pack_limit",

  MISSING_LOCATION = "missing_location",
  ROOM_NOT_FOUND = "room_not_found",
  SERVERS_BUSY = "servers_busy",
  SERVER_SHUTDOWN = "server_shutdown",
  NOT_IMPLEMENTED = "not_implemented",

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
  WS_PACK_IS_EMPTY = "ws_pack_is_empty",
  WS_CANNOT_FIND_MINIGAME = "ws_cannot_find_minigame",
  WS_MINIGAME_MISSING_PROXY_URL = "ws_minigame_missing_proxy_url",
  WS_CANNOT_FIND_MINIGAME_IN_PACK = "ws_cannot_find_minigame_in_pack",
  WS_CANNOT_START_WITHOUT_MINIGAME = "ws_cannot_start_without_minigame",
  WS_CANNOT_START_FAILED_REQUIREMENTS = "ws_cannot_start_failed_requirements",
  WS_GAME_HAS_NOT_STARTED = "ws_game_has_not_started",
  WS_INCORRECT_HANDSHAKE_COUNT = "ws_incorrect_handshake_count",
  WS_CANNOT_HANDSHAKE_IF_READY = "ws_cannot_handshake_if_ready",
  WS_NOT_READY = "ws_not_ready",
  WS_CANNOT_FIND_READY_PLAYER = "ws_cannot_find_ready_player_to_send_message_to",
  WS_CANNOT_HAVE_MULTIPLE_PRIZES = "ws_cannot_have_multiple_prizes",
  WS_NOT_HOST_PRIVATE_MESSAGE = "ws_not_host_private_message",
}

export const ErrorMessageCodesToText = {
  [ErrorMessageCodes.NOT_FOUND]: "Not found.",
  [ErrorMessageCodes.UNEXPECTED_ERROR]: "An unexpected error has occurred.",
  [ErrorMessageCodes.INVALID_AUTHORIZATION]: "Invalid authorization!",
  [ErrorMessageCodes.RATE_LIMITED]:
    "You are currently being rate limited. Please try again in a bit.",
  [ErrorMessageCodes.INTERNAL_ERROR]: "An internal error has occurred.",
  [ErrorMessageCodes.FAILED_CAPTCHA]: "Failed to validate captcha.",

  [ErrorMessageCodes.FAILED_TO_FETCH]: "Failed to fetch.",
  [ErrorMessageCodes.INVALID_CONTENT_TYPE]: "Invalid Content-Type.",

  [ErrorMessageCodes.CANNOT_FIND_MINIGAME_FOR_PACK]:
    "Failed to find the minigame to add to the pack.",
  [ErrorMessageCodes.MINIGAME_ALREADY_IN_PACK]:
    "The minigame is already in the pack.",

  [ErrorMessageCodes.REACHED_MINIGAME_LIMIT]:
    "You have reached the minigames limit! (1000)",
  [ErrorMessageCodes.REACHED_PACK_LIMIT]:
    "You have reached the packs limit! (1000)",
  [ErrorMessageCodes.REACHED_PACK_MINIGAME_LIMIT]:
    "You have reached the maximum amount of minigames a pack can have! (1000)",

  [ErrorMessageCodes.MISSING_LOCATION]: "Missing location.",
  [ErrorMessageCodes.ROOM_NOT_FOUND]: "The room could not be found.",
  [ErrorMessageCodes.SERVERS_BUSY]:
    "The servers are currently busy! Please try again later.",
  [ErrorMessageCodes.SERVER_SHUTDOWN]: "The server has shutdown.",
  [ErrorMessageCodes.NOT_IMPLEMENTED]: "This has not been implemented.",

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
  [ErrorMessageCodes.WS_PACK_IS_EMPTY]:
    "The pack is empty! It doesn't contain any minigames.",
  [ErrorMessageCodes.WS_CANNOT_FIND_MINIGAME]:
    "A minigame with given ID doesn't exist!",
  [ErrorMessageCodes.WS_MINIGAME_MISSING_PROXY_URL]:
    "Cannot select a minigame missing a proxy URL",
  [ErrorMessageCodes.WS_CANNOT_FIND_MINIGAME_IN_PACK]:
    "Cannot find minigame in pack.",
  [ErrorMessageCodes.WS_CANNOT_START_WITHOUT_MINIGAME]:
    "Cannot start game without selecting a minigame.",
  [ErrorMessageCodes.WS_CANNOT_START_FAILED_REQUIREMENTS]:
    "Cannot start game that fails to satisfy the minigame's minimum players to start requirement.",
  [ErrorMessageCodes.WS_GAME_HAS_NOT_STARTED]:
    "Cannot run this action when a game is not ongoing.",
  [ErrorMessageCodes.WS_INCORRECT_HANDSHAKE_COUNT]:
    "Incorrect handshake count.",
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
