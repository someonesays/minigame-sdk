import EventEmitter from 'eventemitter3';

/**
 * These are the opcodes the minigame's iframe to the parent page
 */
declare enum MinigameOpcodes {
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
    SEND_PRIVATE_MESSAGE = "send_private_message"
}

/**
 * These are the opcodes the parent page sends to the minigame's iframe
 */
declare enum ParentOpcodes {
    /**
     * Sends the room and player information, including the game's state and all player states.
     * This should also include player settings, such as volume and language.
     */
    READY = "ready",
    /**
     * Updated player's settings
     */
    UPDATE_SETTINGS = "update_settings",
    /**
     * The game has started.
     *
     * The minigame's game will "start" when everyone is readied (aka sent the HANDSHAKE).
     * The host needs to have the minigame loaded in for the game started.
     * If anyone takes over 30 seconds longer than the host to load the minigame, the game will start before they successfully load the minigame and will be treated as a player who joined the game mid-game.
     *
     * Also, it's necessary for the host to join to start the game, because they'll be treated like the "server" in a sense.
     */
    START_GAME = "start_game",
    /**
     * A player readied the minigame (consider this as a player join event for minigames).
     *
     * When a player readies a minigame, the player joined event is given to all clients who are readied as well.
     */
    MINIGAME_PLAYER_READY = "player_ready",
    /**
     * If a player leaves, a player left state will be given.
     *
     * If the host leaves, the PlayerLeft event will not be given to the minigame, because the game will alert every player that the host has left and forcibly end the minigame.
     *
     * The minigame will end with "no winner" and nobody will gain points.
     */
    PLAYER_LEFT = "player_left",
    /**
     * The game's state has been updated.
     */
    UPDATED_GAME_STATE = "updated_game_state",
    /**
     * The player's state has been updated.
     */
    UPDATED_PLAYER_STATE = "updated_player_state",
    /**
     * The game's host has sent a one-time message (think of it like a system message).
     */
    RECEIVED_GAME_MESSAGE = "received_game_message",
    /**
     * A player has sent a one-time message (think of it like a system message).
     */
    RECEIVED_PLAYER_MESSAGE = "received_player_message",
    /**
     * A host has recieved a one-time private player message.
     */
    RECEIVED_PRIVATE_MESSAGE = "received_private_message"
}

interface MinigameTypes {
    [MinigameOpcodes.HANDSHAKE]: {};
    [MinigameOpcodes.END_GAME]: {
        prizes: GamePrizes;
    };
    [MinigameOpcodes.SET_CLIENT_PROMPT]: {
        prompt: string;
    };
    [MinigameOpcodes.SET_GAME_STATE]: {
        state: State;
    };
    [MinigameOpcodes.SET_PLAYER_STATE]: {
        user: string;
        state: State;
    };
    [MinigameOpcodes.SEND_GAME_MESSAGE]: {
        message: State;
    };
    [MinigameOpcodes.SEND_PLAYER_MESSAGE]: {
        message: State;
    };
    [MinigameOpcodes.SEND_PRIVATE_MESSAGE]: {
        user?: string;
        message: State;
    };
}

interface ParentTypes {
    [ParentOpcodes.READY]: {
        settings: GameSettings;
        user: string;
        room: GameRoom;
        players: MinigamePlayer[];
    };
    [ParentOpcodes.UPDATE_SETTINGS]: {
        settings: GameSettings;
    };
    [ParentOpcodes.START_GAME]: {
        joinedLate: boolean;
    };
    [ParentOpcodes.MINIGAME_PLAYER_READY]: {
        player: MinigamePlayer;
        joinedLate: boolean;
    };
    [ParentOpcodes.PLAYER_LEFT]: {
        user: string;
    };
    [ParentOpcodes.UPDATED_GAME_STATE]: {
        state: State;
    };
    [ParentOpcodes.UPDATED_PLAYER_STATE]: {
        user: string;
        state: State;
    };
    [ParentOpcodes.RECEIVED_GAME_MESSAGE]: {
        message: State;
    };
    [ParentOpcodes.RECEIVED_PLAYER_MESSAGE]: {
        user: string;
        message: State;
    };
    [ParentOpcodes.RECEIVED_PRIVATE_MESSAGE]: {
        fromUser: string;
        toUser: string;
        message: State;
    };
}

/** These are the different types of prizes the minigame can give when a minigame ends */
declare enum GamePrizeType {
    /** Send 1 point for participation */
    PARTICIPATION = 0,
    /** Give 5 points to the winner */
    WINNER = 1,
    /** Give 4 points to second place */
    SECOND = 2,
    /** Give 3 points to third place */
    THIRD = 3
}
/** A prize to give to a player */
interface GamePrize {
    user: string;
    type: GamePrizeType;
}
/** The array of prizes to give to players */
type GamePrizes = GamePrize[];

/** The room data */
interface GameRoom {
    host: string;
    state: State;
}

/** The game settings */
interface GameSettings {
    language: GameSettingsLanguages;
    volume: number;
}
/** The language the user has set */
type GameSettingsLanguages = "en-US";

/** A minigame player  */
interface MinigamePlayer {
    id: string;
    displayName: string;
    avatar: string;
    state: State;
}

/** The state or message */
type State = boolean | number | string | null | {
    [key: string]: State;
} | State[];

declare class MinigameSdk {
    private isReady;
    private isWaiting;
    private isDestroyed;
    private emitter;
    private source;
    private targetOrigin;
    /**
     * Create the MinigameSDK for Someone Says.
     */
    constructor();
    private handleMessage;
    private postMessage;
    /**
     * Add a listener to recieve events from the parent.
     * @param evt The parent type to listen to
     * @param listener The listener
     * @returns The event emitter
     */
    on<O extends ParentOpcodes>(evt: O, listener: (payload: ParentTypes[O]) => unknown): EventEmitter<ParentOpcodes, any>;
    /**
     * Add a one-time listener to recieve events from the parent.
     * @param evt The parent type to listen to
     * @param listener The listener
     * @returns The event emitter
     */
    once<O extends ParentOpcodes>(evt: O, listener: (payload: ParentTypes[O]) => unknown): EventEmitter<ParentOpcodes, any>;
    /**
     * Disable a listener from recieve events.
     * @param evt The parent type to listen to
     * @param listener The listener
     * @returns The event emitter
     */
    off<O extends ParentOpcodes>(evt: O, listener: (payload: ParentTypes[O]) => unknown): EventEmitter<ParentOpcodes, any>;
    /**
     * Sends a handshake to the parent to start listening to events.
     * @returns The ready payload
     */
    ready(): Promise<ParentTypes[ParentOpcodes.READY]>;
    /**
     * End the game and assign the winner, second place, third place and anyone else who should earn points for participation.
     *
     * If there is no first place, second place becomes first place.
     * If there is no second place, third place becomes second place.
     *
     * @param payload The prizes to give
     */
    endGame(payload: MinigameTypes[MinigameOpcodes.END_GAME]): void;
    /**
     * Set the client prompt (client-side only).
     * @param payload The prompt to set
     */
    setClientPrompt(payload: MinigameTypes[MinigameOpcodes.SET_CLIENT_PROMPT]): void;
    /**
     * Set the game state (host-only).
     * @param payload The state to set
     */
    setGameState(payload: MinigameTypes[MinigameOpcodes.SET_GAME_STATE]): void;
    /**
     * Set a player state (host-only).
     * @param payload The state to set
     */
    setPlayerState(payload: MinigameTypes[MinigameOpcodes.SET_PLAYER_STATE]): void;
    /**
     * Send a game message (host-only).
     * @param payload The message to send
     */
    sendGameMessage(payload: MinigameTypes[MinigameOpcodes.SEND_GAME_MESSAGE]): void;
    /**
     * Send a player message (host-only).
     * @param payload The message to send
     */
    sendPlayerMessage(payload: MinigameTypes[MinigameOpcodes.SEND_PLAYER_MESSAGE]): void;
    /**
     * Send a private message to a player.
     *
     * Anyone can send messages to the host but only the host can send messages to other players.
     * @param payload The message to send
     */
    sendPrivateMessage(payload: MinigameTypes[MinigameOpcodes.SEND_PRIVATE_MESSAGE]): void;
    /**
     * Destroy the MinigameSDK.
     */
    destroy(): void;
}

export { type GamePrize, GamePrizeType, type GamePrizes, type GameRoom, type GameSettings, type GameSettingsLanguages, MinigameOpcodes, type MinigamePlayer, MinigameSdk, type MinigameTypes, ParentOpcodes, type ParentTypes, type State };
