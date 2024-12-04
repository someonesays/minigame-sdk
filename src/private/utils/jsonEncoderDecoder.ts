import { Buffer } from "buffer";
import { ClientOpcodes, ServerOpcodes } from "../../";
import type {
  ClientTypes,
  ServerOpcodeAndData,
  ServerOpcodeAndDatas,
} from "../../";

export function encodeJsonClient<O extends ClientOpcodes>(payload: {
  opcode: O;
  data: ClientTypes[O];
}) {
  if (
    [
      ClientOpcodes.MINIGAME_SEND_BINARY_GAME_MESSAGE,
      ClientOpcodes.MINIGAME_SEND_BINARY_PLAYER_MESSAGE,
    ].includes(payload.opcode)
  ) {
    return JSON.stringify({
      opcode: payload.opcode,
      data: toHexString(payload.data as Uint8Array),
    });
  }

  if (payload.opcode === ClientOpcodes.MINIGAME_SEND_BINARY_PRIVATE_MESSAGE) {
    const data =
      payload.data as ClientTypes[ClientOpcodes.MINIGAME_SEND_BINARY_PRIVATE_MESSAGE];
    return JSON.stringify({
      opcode: payload.opcode,
      data: {
        user: data.user,
        message: toHexString(data.message),
      },
    });
  }

  return JSON.stringify({ opcode: payload.opcode, data: payload.data });
}

export function decodeJsonServer(payload: { opcode: number; data: unknown }) {
  if (payload.opcode === ServerOpcodes.MINIGAME_SEND_BINARY_GAME_MESSAGE) {
    return {
      opcode: payload.opcode,
      data: new Uint8Array(Buffer.from(payload?.data as string, "hex").buffer),
    } as ServerOpcodeAndData<ServerOpcodes.MINIGAME_SEND_BINARY_GAME_MESSAGE>;
  }

  if (payload.opcode === ServerOpcodes.MINIGAME_SEND_BINARY_PLAYER_MESSAGE) {
    const data = payload.data as { user: string; message: string };
    return {
      opcode: payload.opcode,
      data: {
        user: data.user,
        message: new Uint8Array(
          Buffer.from(data.message as string, "hex").buffer,
        ),
      },
    } as ServerOpcodeAndData<ServerOpcodes.MINIGAME_SEND_BINARY_PLAYER_MESSAGE>;
  }

  if (payload.opcode === ServerOpcodes.MINIGAME_SEND_BINARY_PRIVATE_MESSAGE) {
    const data = payload.data as {
      fromUser: string;
      toUser: string;
      message: string;
    };
    return {
      opcode: payload.opcode,
      data: {
        fromUser: data.fromUser,
        toUser: data.toUser,
        message: new Uint8Array(
          Buffer.from(data.message as string, "hex").buffer,
        ),
      },
    } as ServerOpcodeAndData<ServerOpcodes.MINIGAME_SEND_BINARY_PRIVATE_MESSAGE>;
  }

  return { opcode: payload.opcode, data: payload.data } as ServerOpcodeAndDatas;
}

function toHexString(byteArray: Uint8Array) {
  return Array.from(byteArray, function (byte) {
    return ("0" + (byte & 0xff).toString(16)).slice(-2);
  }).join("");
}
