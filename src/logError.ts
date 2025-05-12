export function logError(message: string, error?: unknown) {
  const prefix = "[usePersistedState]";
  if (error instanceof Error) {
    console.error(`${prefix} ${message}\n  ${error.stack}`);
  } else if (error !== undefined) {
    console.error(`${prefix} ${message}\n  ${String(error)}`);
  } else {
    console.error(`${prefix} ${message}`);
  }
}
