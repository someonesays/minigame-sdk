import EventEmitter from "eventemitter3";
import {
  getSize,
  getIndexedDB,
  BaseMinigameSdk,
  MinigameOpcodes,
  MinigameTypes,
  ParentOpcodes,
  ParentTypes,
  ClientOpcodes,
  ServerOpcodes,
  RoomWebsocket,
  GameStatus,
  ErrorMessageCodesToText,
} from "../..";
import type { ApiErrorResponse, ServerTypes } from "../../";
import { generateCode } from "../../private/utils/generateCode";

export class TestingMinigameSdk implements BaseMinigameSdk {
  data?: ParentTypes[ParentOpcodes.READY];

  private isWaiting = false;
  private isDestroyed = false;

  private emitter = new EventEmitter<ParentOpcodes>();

  private baseUrl: string;
  private ws?: RoomWebsocket;

  private minigameId: string;
  private testingAccessCode: string;
  private playersToStart: number;
  private opcode: "Json" | "Oppack";
  private displayName: string;
  private volume: number;

  private db: Awaited<ReturnType<typeof getIndexedDB>>;
  private minigameReady = false;

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
    baseUrl = "https://api.someonesays.io",
  }: {
    minigameId: string;
    testingAccessCode: string;
    playersToStart: number;
    opcode?: "Json" | "Oppack";
    displayName?: string;
    volume?: number;
    baseUrl?: string;
  }) {
    this.minigameId = minigameId;
    this.testingAccessCode = testingAccessCode;
    this.playersToStart = playersToStart;
    this.displayName = displayName ?? `Guest_${generateCode()}`;
    this.opcode = opcode;
    this.volume = volume;
    this.baseUrl = baseUrl;
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

      this.ws = new RoomWebsocket({
        url: matchmaking.data.room.server.url,
        authorization: matchmaking.authorization,
        messageType: this.opcode,
      });

      this.ws.on(ServerOpcodes.ERROR, (code) => {
        this.logError(
          "An error has been given from the server:",
          ErrorMessageCodesToText[code] ?? code,
        );
      });

      this.ws.once(ServerOpcodes.GET_INFORMATION, (evt) => {
        connected = true;
        room = evt;

        resolve(true);

        if (room.user === room.room.host) {
          this.ws.send({ opcode: ClientOpcodes.BEGIN_GAME, data: null });
        } else if (room.status !== GameStatus.LOBBY) {
          this.ws.send({
            opcode: ClientOpcodes.MINIGAME_HANDSHAKE,
            data: null,
          });
        }
      });
      this.ws.on(ServerOpcodes.PLAYER_JOIN, (player) => {
        room?.players.push(player);
      });
      this.ws.on(ServerOpcodes.PLAYER_LEFT, (user) => {
        const player = room?.players.find((p) => p.id === user);
        if (!player) return;

        if (this.minigameReady) {
          this.handleMessage({ data: [ParentOpcodes.PLAYER_LEFT, { user }] });
        }

        room?.players.splice(room?.players.indexOf(player), 1);
      });
      this.ws.on(ServerOpcodes.TRANSFER_HOST, (user) => {
        if (!room) throw new Error("Cannot find room on transfer host event");

        room.room.host = user;
      });
      this.ws.on(ServerOpcodes.UPDATED_ROOM_SETTINGS, ({ minigame }) => {
        if (!room)
          throw new Error("Cannot find room on updated room settings event");

        room.minigame = minigame;
      });

      this.ws.on(ServerOpcodes.LOAD_MINIGAME, ({ players }) => {
        if (!room) throw new Error("Cannot find room on load minigame");

        room.status = GameStatus.WAITING_PLAYERS_TO_LOAD_MINIGAME;
        room.players = players;

        if (room.user !== room.room.host || this.playersToStart <= 1) {
          this.ws.send({
            opcode: ClientOpcodes.MINIGAME_HANDSHAKE,
            data: null,
          });
        }
      });
      this.ws.on(ServerOpcodes.END_MINIGAME, ({ players, reason }) => {
        if (!room) throw new Error("Cannot find room on end minigame");

        room.status = GameStatus.LOBBY;
        room.room.state = null;
        room.players = players;

        this.minigameReady = false;

        this.log(
          "The game has ended! Reload the host client to restart the room.",
          { players, reason },
        );
      });
      this.ws.on(ServerOpcodes.MINIGAME_PLAYER_READY, async (user) => {
        if (!room) throw new Error("Cannot find room on end minigame");

        const player = room.players.find((p) => p.id === user);
        if (!player) throw new Error("Cannot find the player who readied up");

        player.ready = true;

        if (room.user === player.id) {
          this.db = await getIndexedDB();
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
                data: await this.db.get(room.minigame.id),
                players: room.players
                  .filter((p) => p.ready)
                  .map((p) => ({
                    id: p.id,
                    displayName: p.displayName,
                    avatar: p.avatar,
                    mobile: p.mobile,
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

          this.minigameReady = true;
        } else {
          this.handleMessage({
            data: [
              ParentOpcodes.MINIGAME_PLAYER_READY,
              {
                player: {
                  id: player.id,
                  displayName: player.displayName,
                  avatar: player.avatar,
                  mobile: player.mobile,
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
          this.ws.send({
            opcode: ClientOpcodes.MINIGAME_HANDSHAKE,
            data: null,
          });
        }
      });
      this.ws.on(ServerOpcodes.MINIGAME_START_GAME, () => {
        if (!room) throw new Error("Cannot find room on start minigame");

        room.status = GameStatus.STARTED;

        if (!this.minigameReady) return;
        this.handleMessage({
          data: [ParentOpcodes.START_GAME, { joinedLate: false }],
        });
      });
      this.ws.on(ServerOpcodes.MINIGAME_SET_GAME_STATE, (state) => {
        if (!room) throw new Error("Cannot find room on start minigame");

        room.room.state = state;

        if (!this.minigameReady) return;
        this.handleMessage({
          data: [ParentOpcodes.UPDATED_GAME_STATE, { state }],
        });
      });
      this.ws.on(ServerOpcodes.MINIGAME_SET_PLAYER_STATE, ([user, state]) => {
        if (!room) throw new Error("Cannot find room on start minigame");

        const player = room.players.find((p) => p.id === user);
        if (!player)
          throw new Error("Cannot find the player who set player state");

        player.state = state;

        if (!this.minigameReady) return;
        this.handleMessage({
          data: [ParentOpcodes.UPDATED_PLAYER_STATE, { user, state }],
        });
      });
      this.ws.on(ServerOpcodes.MINIGAME_SEND_GAME_MESSAGE, (message) => {
        if (!this.minigameReady) return;
        this.handleMessage({
          data: [ParentOpcodes.RECEIVED_GAME_MESSAGE, { message }],
        });
      });
      this.ws.on(
        ServerOpcodes.MINIGAME_SEND_PLAYER_MESSAGE,
        ([user, message]) => {
          if (!this.minigameReady) return;
          this.handleMessage({
            data: [ParentOpcodes.RECEIVED_PLAYER_MESSAGE, { user, message }],
          });
        },
      );
      this.ws.on(
        ServerOpcodes.MINIGAME_SEND_PRIVATE_MESSAGE,
        ([fromUser, toUser, message]) => {
          if (!this.minigameReady) return;
          this.handleMessage({
            data: [
              ParentOpcodes.RECEIVED_PRIVATE_MESSAGE,
              { fromUser, toUser, message },
            ],
          });
        },
      );
      this.ws.on(ServerOpcodes.MINIGAME_SEND_BINARY_GAME_MESSAGE, (message) => {
        if (!this.minigameReady) return;
        this.handleMessage({
          data: [ParentOpcodes.RECEIVED_BINARY_GAME_MESSAGE, message],
        });
      });
      this.ws.on(
        ServerOpcodes.MINIGAME_SEND_BINARY_PLAYER_MESSAGE,
        ([user, message]) => {
          if (!this.minigameReady) return;
          this.handleMessage({
            data: [
              ParentOpcodes.RECEIVED_BINARY_PLAYER_MESSAGE,
              { user, message },
            ],
          });
        },
      );
      this.ws.on(
        ServerOpcodes.MINIGAME_SEND_BINARY_PRIVATE_MESSAGE,
        ([fromUser, toUser, message]) => {
          if (!this.minigameReady) return;
          this.handleMessage({
            data: [
              ParentOpcodes.RECEIVED_BINARY_PRIVATE_MESSAGE,
              { fromUser, toUser, message },
            ],
          });
        },
      );

      this.ws.onclose = (evt) => {
        try {
          const { code } = JSON.parse(evt.reason) as ApiErrorResponse;
          if (connected)
            return this.logError(
              "Disconnected!",
              ErrorMessageCodesToText[code] ?? code,
            );
          return reject(
            `Failed to connect to server: ${ErrorMessageCodesToText[code] ?? code}`,
          );
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
   * End the minigame
   */
  endGame() {
    this.ws?.send({
      opcode: ClientOpcodes.MINIGAME_END_GAME,
      data: false,
    });
  }
  /**
   * Save local data store for the minigame
   */
  saveLocalData({
    data,
  }: MinigameTypes[MinigameOpcodes.SAVE_LOCAL_DATA]): void {
    if (!this.minigameReady)
      throw new Error("Cannot save local data before readying the minigame");
    if (getSize(data) > 1024) throw new Error("Exceeds 1KB limit");
    if (!this.db) throw new Error("Cannot find database");

    if (typeof data !== "string" && !(data instanceof Uint8Array)) {
      throw new Error(
        "You can only set your local data as a string or UInt8Array",
      );
    }

    this.data.data = data;
    this.db.set(this.minigameId, data);
  }
  /**
   * Set the game state (host-only).
   * @param payload The state to set
   */
  setGameState({ state }: MinigameTypes[MinigameOpcodes.SET_GAME_STATE]) {
    this.ws?.send({
      opcode: ClientOpcodes.MINIGAME_SET_GAME_STATE,
      data: state,
    });
  }
  /**
   * Set a player state (host-only).
   * @param payload The state to set
   */
  setPlayerState(payload: MinigameTypes[MinigameOpcodes.SET_PLAYER_STATE]) {
    this.ws?.send({
      opcode: ClientOpcodes.MINIGAME_SET_PLAYER_STATE,
      data: [payload.user, payload.state],
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
  sendPlayerMessage({
    message,
  }: MinigameTypes[MinigameOpcodes.SEND_PLAYER_MESSAGE]) {
    this.ws?.send({
      opcode: ClientOpcodes.MINIGAME_SEND_PLAYER_MESSAGE,
      data: message,
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
      data: [payload.message, payload.user],
    });
  }
  /**
   * Send a binary game message (host-only).
   * @param payload The message to send
   */
  sendBinaryGameMessage(
    payload: MinigameTypes[MinigameOpcodes.SEND_BINARY_GAME_MESSAGE],
  ) {
    this.ws?.send({
      opcode: ClientOpcodes.MINIGAME_SEND_BINARY_GAME_MESSAGE,
      data: payload.message,
    });
  }
  /**
   * Send a player message.
   * @param payload The message to send
   */
  sendBinaryPlayerMessage(
    payload: MinigameTypes[MinigameOpcodes.SEND_BINARY_PLAYER_MESSAGE],
  ) {
    this.ws?.send({
      opcode: ClientOpcodes.MINIGAME_SEND_BINARY_PLAYER_MESSAGE,
      data: payload.message,
    });
  }
  /**
   * Send a private message to a player.
   *
   * Anyone can send messages to the host but only the host can send messages to other players.
   * @param payload The message to send
   */
  sendBinaryPrivateMessage(
    payload: MinigameTypes[MinigameOpcodes.SEND_BINARY_PRIVATE_MESSAGE],
  ) {
    this.ws?.send({
      opcode: ClientOpcodes.MINIGAME_SEND_BINARY_PRIVATE_MESSAGE,
      data: [payload.message, payload.user],
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
