import { BASE_STORAGE_KEY } from "./constants";

export interface StorageProviderInterface {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const NOOP_STORAGE_PROVIDER: StorageProviderInterface = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export function createStorageKey(key: string, namespace: string): string {
  return `${BASE_STORAGE_KEY}:${namespace}:${key}`;
}

function isStorageProviderInterface(obj: any): obj is StorageProviderInterface {
  return (
    obj &&
    typeof obj.getItem === "function" &&
    typeof obj.setItem === "function" &&
    typeof obj.removeItem === "function"
  );
}

export function resolveStorageProvider(
  customStorage?: StorageProviderInterface
): StorageProviderInterface {
  if (typeof window === "undefined" && typeof customStorage === "undefined") {
    return NOOP_STORAGE_PROVIDER;
  }

  if (customStorage) {
    if (isStorageProviderInterface(customStorage)) {
      return customStorage;
    } else {
      console.error(
        "[usePersistedState] Provided customStorage does not conform to StorageProviderInterface. Falling back to default."
      );
    }
  }

  if (window.localStorage) {
    return window.localStorage;
  }

  console.error(
    "[usePersistedState] No valid storage provider found: persistence will not work. Please provide a valid storage option or ensure window.localStorage is available."
  );
  return NOOP_STORAGE_PROVIDER;
}
