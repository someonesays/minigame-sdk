import EventEmitter from "eventemitter3";
import {
  BaseMinigameSdk,
  MinigameOpcodes,
  MinigameTypes,
  ParentOpcodes,
  ParentTypes,
  ClientOpcodes,
  ServerOpcodes,
  RoomWebsocket,
  GameStatus,
} from "../..";
import type { ApiErrorResponse, ServerTypes } from "../../";
import { generateCode } from "../../private/utils/generateCode";

export class TestingMinigameSdk implements BaseMinigameSdk {
  data?: ParentTypes[ParentOpcodes.READY];

  private isWaiting = false;
  private isDestroyed = false;

  private emitter = new EventEmitter<ParentOpcodes>();

  private baseUrl = "http://localhost:3001" as const;
  private ws?: RoomWebsocket;

  private minigameId: string;
  private testingAccessCode: string;
  private playersToStart: number;
  private opcode: "Json" | "Oppack";
  private displayName: string;
  private volume: number;
  private debug: boolean;

  /**
   * Create the TestingMinigameSDK for Someone Says.
   */
  constructor({
    minigameId,
    testingAccessCode,
    playersToStart,
    opcode = "Oppack",
    displayName,
    volume = 100,
    debug = true,
  }: {
    minigameId: string;
    testingAccessCode: string;
    playersToStart: number;
    opcode?: "Json" | "Oppack";
    displayName?: string;
    volume?: number;
    debug?: boolean;
  }) {
    this.minigameId = minigameId;
    this.testingAccessCode = testingAccessCode;
    this.playersToStart = playersToStart;
    this.displayName = displayName ?? `Guest_${generateCode()}`;
    this.opcode = opcode;
    this.volume = volume;
    this.debug = debug;
  }
  private handleMessage<O extends ParentOpcodes>({
    data,
  }: { data: [O, ParentTypes[O]] }) {
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
              p.id ===
              (payload as ParentTypes[ParentOpcodes.MINIGAME_PLAYER_READY])
                .player.id,
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

  private log(...message: any[]) {
    console.debug("[TestingMinigameSdk]", ...message);
  }
  private logError(...message: any[]) {
    console.error("[TestingMinigameSdk]", ...message);
  }

  private async connect() {
    return new Promise(async (resolve, reject) => {
      const matchmaking = await RoomWebsocket.getMatchmakingTesting({
        displayName: this.displayName,
        minigameId: this.minigameId,
        testingAccessCode: this.testingAccessCode,
        baseUrl: this.baseUrl,
      });

      let connected = false;
      let room: ServerTypes[ServerOpcodes.GET_INFORMATION] | null = null;
      let minigameReady = false;

      this.ws = new RoomWebsocket({
        url: matchmaking.data.room.server.url,
        authorization: matchmaking.authorization,
        messageType: this.opcode,
      });

      this.ws.on(ServerOpcodes.ERROR, (evt) => {
        this.logError(evt.message);
      });

      this.ws.once(ServerOpcodes.GET_INFORMATION, (evt) => {
        connected = true;
        room = evt;

        resolve(true);

        if (room.user === room.room.host) {
          this.ws.send({ opcode: ClientOpcodes.BEGIN_GAME, data: {} });
        } else if (room.status !== GameStatus.LOBBY) {
          this.ws.send({ opcode: ClientOpcodes.MINIGAME_HANDSHAKE, data: {} });
        }
      });
      this.ws.on(ServerOpcodes.PLAYER_JOIN, (evt) => {
        room?.players.push(evt.player);
      });
      this.ws.on(ServerOpcodes.PLAYER_LEFT, (evt) => {
        const player = room?.players.find((p) => p.id === evt.user);
        if (!player) return;

        if (minigameReady) {
          this.handleMessage({ data: [ParentOpcodes.PLAYER_LEFT, evt] });
        }

        room?.players.splice(room?.players.indexOf(player), 1);
      });
      this.ws.on(ServerOpcodes.TRANSFER_HOST, (evt) => {
        if (!room) throw new Error("Cannot find room on transfer host event");

        room.room.host = evt.user;
      });
      this.ws.on(ServerOpcodes.UPDATED_ROOM_SETTINGS, (evt) => {
        if (!room)
          throw new Error("Cannot find room on updated room settings event");

        room.minigame = evt.minigame;
        room.pack = evt.pack;
      });

      this.ws.on(ServerOpcodes.LOAD_MINIGAME, (evt) => {
        if (!room) throw new Error("Cannot find room on load minigame");

        room.status = GameStatus.WAITING_PLAYERS_TO_LOAD_MINIGAME;
        room.players = evt.players;

        if (room.user !== room.room.host || this.playersToStart <= 1) {
          this.ws.send({ opcode: ClientOpcodes.MINIGAME_HANDSHAKE, data: {} });
        }
      });
      this.ws.on(ServerOpcodes.END_MINIGAME, (evt) => {
        if (!room) throw new Error("Cannot find room on end minigame");

        room.status = GameStatus.LOBBY;
        room.room.state = null;
        room.players = evt.players;

        minigameReady = false;

        this.log(
          "The game has ended! Reload the host client to restart the room.",
          evt,
        );
      });
      this.ws.on(ServerOpcodes.MINIGAME_PLAYER_READY, (evt) => {
        if (!room) throw new Error("Cannot find room on end minigame");

        const player = room.players.find((p) => p.id === evt.user);
        if (!player) throw new Error("Cannot find the player who readied up");

        player.ready = true;

        if (room.user === player.id) {
          this.handleMessage({
            data: [
              ParentOpcodes.READY,
              {
                settings: {
                  language: "en-US",
                  volume: this.volume,
                },
                user: room.user,
                room: {
                  host: room.room.host,
                  state: room.room.state,
                },
                players: room.players
                  .filter((p) => p.ready)
                  .map((p) => ({
                    id: p.id,
                    displayName: p.displayName,
                    avatar: p.avatar,
                    state: p.state,
                  })),
              },
            ],
          });

          if (room.status === GameStatus.STARTED) {
            this.handleMessage({
              data: [ParentOpcodes.START_GAME, { joinedLate: true }],
            });
          }

          minigameReady = true;
        } else {
          this.handleMessage({
            data: [
              ParentOpcodes.MINIGAME_PLAYER_READY,
              {
                player: {
                  id: player.id,
                  displayName: player.displayName,
                  avatar: player.avatar,
                  state: player.state,
                },
                joinedLate: room.status === GameStatus.STARTED,
              },
            ],
          });
        }

        if (
          room.user === room.room.host &&
          !room.players.find((p) => p.id === room.user)?.ready &&
          room.players.filter((p) => p.ready).length + 1 >= this.playersToStart
        ) {
          this.ws.send({ opcode: ClientOpcodes.MINIGAME_HANDSHAKE, data: {} });
        }
      });
      this.ws.on(ServerOpcodes.MINIGAME_START_GAME, () => {
        if (!room) throw new Error("Cannot find room on start minigame");

        room.status = GameStatus.STARTED;

        if (!minigameReady) return;
        this.handleMessage({
          data: [ParentOpcodes.START_GAME, { joinedLate: false }],
        });
      });
      this.ws.on(ServerOpcodes.MINIGAME_SET_GAME_STATE, (evt) => {
        if (!room) throw new Error("Cannot find room on start minigame");

        room.room.state = evt.state;

        if (!minigameReady) return;
        this.handleMessage({
          data: [ParentOpcodes.UPDATED_GAME_STATE, evt],
        });
      });
      this.ws.on(ServerOpcodes.MINIGAME_SET_PLAYER_STATE, (evt) => {
        if (!room) throw new Error("Cannot find room on start minigame");

        const player = room.players.find((p) => p.id === evt.user);
        if (!player)
          throw new Error("Cannot find the player who set player state");

        player.state = evt.state;

        if (!minigameReady) return;
        this.handleMessage({
          data: [ParentOpcodes.UPDATED_PLAYER_STATE, evt],
        });
      });
      this.ws.on(ServerOpcodes.MINIGAME_SEND_GAME_MESSAGE, (evt) => {
        if (!minigameReady) return;
        this.handleMessage({
          data: [ParentOpcodes.RECEIVED_GAME_MESSAGE, evt],
        });
      });
      this.ws.on(ServerOpcodes.MINIGAME_SEND_PLAYER_MESSAGE, (evt) => {
        if (!minigameReady) return;
        this.handleMessage({
          data: [ParentOpcodes.RECEIVED_PLAYER_MESSAGE, evt],
        });
      });
      this.ws.on(ServerOpcodes.MINIGAME_SEND_PRIVATE_MESSAGE, (evt) => {
        if (!minigameReady) return;
        this.handleMessage({
          data: [ParentOpcodes.RECEIVED_PRIVATE_MESSAGE, evt],
        });
      });

      this.ws.onclose = (evt) => {
        try {
          const { code } = JSON.parse(evt.reason) as ApiErrorResponse;
          if (connected) return this.logError("Disconnected!", code);
          return reject(`Failed to connect to server: ${code}`);
        } catch (err) {
          if (connected) {
            return this.logError("Disconnected! (no reason provided)");
          }
          return reject(`Failed to connect to server: ${evt.reason}`);
        }
      };
    });
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
  ready() {
    if (this.data || this.isWaiting) {
      throw new Error("Already ready or requested to be ready");
    }

    this.connect();
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
    this.ws?.send({
      opcode: ClientOpcodes.MINIGAME_END_GAME,
      data: payload,
    });
  }
  /**
   * Set the client prompt (client-side only).
   * @param payload The prompt to set
   */
  setClientPrompt(payload: MinigameTypes[MinigameOpcodes.SET_CLIENT_PROMPT]) {
    if (!this.debug) return;
    this.log("Changed the client prompt to:", payload.prompt);
  }
  /**
   * Set the game state (host-only).
   * @param payload The state to set
   */
  setGameState(payload: MinigameTypes[MinigameOpcodes.SET_GAME_STATE]) {
    this.ws?.send({
      opcode: ClientOpcodes.MINIGAME_SET_GAME_STATE,
      data: payload,
    });
  }
  /**
   * Set a player state (host-only).
   * @param payload The state to set
   */
  setPlayerState(payload: MinigameTypes[MinigameOpcodes.SET_PLAYER_STATE]) {
    this.ws?.send({
      opcode: ClientOpcodes.MINIGAME_SET_PLAYER_STATE,
      data: payload,
    });
  }
  /**
   * Send a game message (host-only).
   * @param payload The message to send
   */
  sendGameMessage(payload: MinigameTypes[MinigameOpcodes.SEND_GAME_MESSAGE]) {
    this.ws?.send({
      opcode: ClientOpcodes.MINIGAME_SEND_GAME_MESSAGE,
      data: payload,
    });
  }
  /**
   * Send a player message (host-only).
   * @param payload The message to send
   */
  sendPlayerMessage(
    payload: MinigameTypes[MinigameOpcodes.SEND_PLAYER_MESSAGE],
  ) {
    this.ws?.send({
      opcode: ClientOpcodes.MINIGAME_SEND_PLAYER_MESSAGE,
      data: payload,
    });
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
    this.ws?.send({
      opcode: ClientOpcodes.MINIGAME_SEND_PRIVATE_MESSAGE,
      data: payload,
    });
  }

  /**
   * Destroy the MinigameSDK.
   */
  destroy() {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    this.ws?.close();
  }
}
