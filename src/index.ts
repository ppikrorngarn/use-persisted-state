import { useState } from "react";

export interface StorageProviderInterface {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function createNoopStorageProvider(): StorageProviderInterface {
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
}

export interface UsePersistedStateOptions {
  namespace?: string;
  storage?: StorageProviderInterface;
}

export function usePersistedState<T>(
  key: string,
  initialValue: T,
  options?: UsePersistedStateOptions
): [T, (value: T) => void] {
  const storageKey = options?.namespace ? `${options.namespace}:${key}` : key;
  let storage: StorageProviderInterface | undefined =
    options?.storage ||
    (typeof window !== "undefined" ? window.localStorage : undefined);

  if (!storage) {
    console.error(
      "[usePersistedState] No storage provider found: persistence will not work. Please provide a storage option or ensure window.localStorage is available."
    );
    storage = createNoopStorageProvider();
  }

  const [state, setState] = useState<T>(() => {
    try {
      const item = storage.getItem(storageKey);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading from storage:", error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      storage.setItem(storageKey, JSON.stringify(value));
      setState(value);
    } catch (error) {
      console.error("Error writing to storage:", error);
    }
  };

  return [state, setValue];
}
