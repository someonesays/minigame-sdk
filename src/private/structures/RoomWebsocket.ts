import EventEmitter from "eventemitter3";
import {
  ServerOpcodes,
  ClientOpcodes,
  MatchmakingType,
  encodeOppackClient,
  decodeOppackServer,
  encodeJsonClient,
  decodeJsonServer,
} from "../../";
import type { MatchmakingResponse, ClientTypes, ServerTypes } from "../../";

export class RoomWebsocket {
  ws: WebSocket;
  send: ReturnType<typeof RoomWebsocket.createSendMessage>;
  onclose?: ((evt: CloseEvent) => any) | null;

  private emitter = new EventEmitter();
  messageType: "Json" | "Oppack";

  static async getMatchmakingTesting({
    displayName,
    minigameId,
    testingAccessCode,
    baseUrl,
  }: {
    displayName: string;
    minigameId: string;
    testingAccessCode: string;
    baseUrl: string;
  }): Promise<MatchmakingResponse> {
    const res = await fetch(`${baseUrl}/api/matchmaking/testing`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: MatchmakingType.TESTING,
        displayName,
        minigameId,
        testingAccessCode,
      }),
    });
    const data = await res.json();
    if (res.status !== 200) {
      throw new Error(
        "Failed to create matchmaking server. Are you sure you put in the correct minigame ID and testing access code?",
      );
    }
    return data;
  }

  static async parseMessage({
    messageType,
    payload,
  }: { messageType: "Oppack" | "Json"; payload: any }) {
    switch (messageType) {
      case "Oppack":
        return decodeOppackServer(new Uint8Array(await payload.arrayBuffer()));
      case "Json":
        return decodeJsonServer(JSON.parse(payload as string));
    }
  }

  static createSendMessage({
    ws,
    messageType,
  }: { ws: WebSocket; messageType: "Oppack" | "Json" }) {
    return <O extends ClientOpcodes>({
      opcode,
      data,
    }: {
      opcode: O;
      data: ClientTypes[O];
    }) => {
      if (ws.readyState !== WebSocket.OPEN) return;

      switch (messageType) {
        case "Oppack":
          return ws.send(encodeOppackClient({ opcode, data }));
        case "Json":
          return ws.send(encodeJsonClient({ opcode, data }));
      }
    };
  }

  constructor({
    url,
    authorization,
    messageType = "Oppack",
  }: {
    url: string;
    authorization: string;
    messageType?: "Json" | "Oppack";
  }) {
    this.messageType = messageType;

    this.ws = new WebSocket(url, [authorization, messageType]);
    this.send = RoomWebsocket.createSendMessage({ ws: this.ws, messageType });

    this.ws.onmessage = async ({ data: payload }) => {
      const { opcode, data } = await RoomWebsocket.parseMessage({
        messageType,
        payload,
      });
      return this.emit(opcode, data);
    };

    this.ws.onclose = (evt) => {
      return this.onclose?.(evt);
    };
  }

  on<O extends ServerOpcodes>(
    evt: O,
    listener: (payload: ServerTypes[O]) => unknown,
  ) {
    return this.emitter.on(evt.toString(), listener);
  }
  once<O extends ServerOpcodes>(
    evt: O,
    listener: (payload: ServerTypes[O]) => unknown,
  ) {
    return this.emitter.once(evt.toString(), listener);
  }
  off<O extends ServerOpcodes>(
    evt: O,
    listener: (payload: ServerTypes[O]) => unknown,
  ) {
    return this.emitter.off(evt.toString(), listener);
  }
  private emit<O extends ServerOpcodes>(evt: O, msg: ServerTypes[O]) {
    return this.emitter.emit(evt.toString(), msg);
  }

  close() {
    this.ws?.close();
    this.emitter.removeAllListeners();
  }
}
