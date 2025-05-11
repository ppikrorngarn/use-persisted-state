import { useState } from "react";
import { StorageProviderInterface, resolveStorageProvider } from "./storage";
import { DEFAULT_NAMESPACE } from "./constants";

export interface UsePersistedStateOptions {
  namespace?: string;
  storage?: StorageProviderInterface;
}

function resolveNamespace(customNamespace?: string): string {
  return customNamespace || DEFAULT_NAMESPACE;
}

function createStorageKey(key: string, namespace: string): string {
  return `${namespace}:${key}`;
}

export function usePersistedState<T>(
  key: string,
  initialValue: T,
  options?: UsePersistedStateOptions
): [T, (value: T) => void] {
  const namespace = resolveNamespace(options?.namespace);
  const storage = resolveStorageProvider(options?.storage);
  const storageKey = createStorageKey(key, namespace);

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
