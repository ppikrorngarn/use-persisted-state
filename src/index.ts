import { useState } from "react";

interface UsePersistedStateOptions {
  namespace?: string;
}

export function usePersistedState<T>(
  key: string,
  initialValue: T,
  options?: UsePersistedStateOptions
): [T, (value: T) => void] {
  const storageKey = options?.namespace ? `${options.namespace}:${key}` : key;

  const [state, setState] = useState(() => {
    try {
      const item = localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
      setState(value);
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  };

  return [state, setValue];
}
