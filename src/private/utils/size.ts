export function getSize(value: string | Uint8Array) {
  return new Blob([value]).size;
}

export function exceedsStateSize(
  data: boolean | number | string | object | null,
) {
  return (
    (typeof data === "string" && data.length > 1e6) ||
    (typeof data === "object" && getSize(JSON.stringify(data)) > 1e6)
  );
}
