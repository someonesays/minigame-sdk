import type { ClientOpcodes, ClientTypes, ServerOpcodeAndDatas } from "../../";

export function encodeJsonClient<O extends ClientOpcodes>(payload: {
  opcode: O;
  data: ClientTypes[O];
}) {
  return JSON.stringify({
    opcode: payload.opcode,
    data: payload.data,
  });
}

export function decodeJsonServer(payload: { opcode: number; data: unknown }) {
  return { opcode: payload.opcode, data: payload.data } as ServerOpcodeAndDatas;
}
