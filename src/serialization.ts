export function resolveSerializeOption<T>(
  serialize?: (value: T) => string
): (value: T) => string {
  return serialize ?? JSON.stringify;
}

export function resolveDeserializeOption<T>(
  deserialize?: (raw: string) => T
): (raw: string) => T {
  return deserialize ?? ((raw: string) => JSON.parse(raw));
}
