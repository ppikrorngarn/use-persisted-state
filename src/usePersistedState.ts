import { useState } from "react";
import {
  StorageProviderInterface,
  createStorageKey,
  resolveStorageProvider,
} from "./storage";
import {
  resolveSerializeOption,
  resolveDeserializeOption,
} from "./serialization";
import { DEFAULT_NAMESPACE } from "./constants";

export type UsePersistedStateOptions = {
  namespace?: string;
  storage?: StorageProviderInterface;
  serialize?: <T>(value: T) => string;
  deserialize?: <T>(raw: string) => T;
};

function resolveNamespaceOption(namespace?: string): string {
  return namespace || DEFAULT_NAMESPACE;
}

function resolveStorageOption(
  storage?: StorageProviderInterface
): StorageProviderInterface {
  return resolveStorageProvider(storage);
}

function usePersistedState<T>(
  key: string,
  initialValue: T,
  options?: UsePersistedStateOptions
): [T, (value: T) => void] {
  const namespace = resolveNamespaceOption(options?.namespace);
  const storage = resolveStorageOption(options?.storage);
  const storageKey = createStorageKey(key, namespace);
  const serialize = resolveSerializeOption<T>(options?.serialize);
  const deserialize = resolveDeserializeOption<T>(options?.deserialize);

  const [state, setState] = useState<T>(() => {
    try {
      const item = storage.getItem(storageKey);
      return item ? deserialize(item) : initialValue;
    } catch (error) {
      console.error("[usePersistedState] Error reading from storage:", error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      storage.setItem(storageKey, serialize(value));
      setState(value);
    } catch (error) {
      console.error("[usePersistedState] Error writing to storage:", error);
    }
  };

  return [state, setValue];
}

export default usePersistedState;
