export function logError(message: string, error?: unknown) {
  const prefix = "[usePersistedState]";
  let details = "";

  if (error instanceof Error) {
    details = `\n  ${error.stack}`;
  } else if (error !== undefined) {
    details = `\n  ${String(error)}`;
  }

  console.error(`${prefix} ${message}${details}`);
}
