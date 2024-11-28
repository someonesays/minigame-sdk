import { decode, encode } from "@msgpack/msgpack";
import type { ClientOpcodes, ClientTypes, ServerOpcodeAndDatas } from "../../";

export function encodeOppackClient<O extends ClientOpcodes>(payload: {
  opcode: O;
  data: ClientTypes[O];
}) {
  const { opcode, data } = payload;
  const encoded = encode(data);
  const buffer = new Uint8Array(encoded.length + 1);
  buffer[0] = opcode;
  buffer.set(encoded, 1);
  return buffer;
}

export function decodeOppackServer(payload: Uint8Array) {
  return {
    opcode: payload[0],
    data: decode(payload.slice(1)),
  } as ServerOpcodeAndDatas;
}
