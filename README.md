# use-persisted-state

A tiny, flexible React hook for persisting state to localStorage, sessionStorage, or custom storage providers. Can be used with React Native via the custom storage option. Supports namespacing, pluggable storage, and SSR-safe fallbacks.

## Features

- Fully typed with TypeScript for a seamless developer experience.
- Persist React state to `localStorage` (default), `sessionStorage`, or any custom storage provider.
- Safe for server-side rendering (SSR): automatically falls back to noop storage when not in a browser.
- Easily customize key namespacing and serialization/deserialization as needed.
- Advanced: Plug in your own storage provider for testing or non-standard environments.

## Installation

```bash
npm install @piyawasin/use-persisted-state
```

## Usage

### Basic Example: Theme Switcher

```tsx
import usePersistedState from "@piyawasin/use-persisted-state";

function ThemeSwitcher() {
  const [theme, setTheme] = usePersistedState("theme", "light");
  // Persists to key: "persist:(default):theme"
  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      style={{ padding: 8 }}
    >
      Switch to {theme === "light" ? "dark" : "light"} mode
    </button>
  );
}
```

### With custom namespace

```tsx
import usePersistedState from "@piyawasin/use-persisted-state";

function ThemeSwitcherWithNamespace() {
  const [theme, setTheme] = usePersistedState("theme", "light", {
    namespace: "settings",
  });
  // Persists to key: "persist:settings:theme"
  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      style={{ padding: 8 }}
    >
      Switch to {theme === "light" ? "dark" : "light"} mode
    </button>
  );
}
```

### With sessionStorage

```tsx
import usePersistedState from "@piyawasin/use-persisted-state";

function ThemeSwitcherSession() {
  const [theme, setTheme] = usePersistedState("theme", "light", {
    storage: window.sessionStorage,
  });
  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      style={{ padding: 8 }}
    >
      Switch to {theme === "light" ? "dark" : "light"} mode
    </button>
  );
}
```

### With custom storage provider

```tsx
import usePersistedState, {
  type StorageProviderInterface,
} from "@piyawasin/use-persisted-state";

const memoryStorage: StorageProviderInterface = {
  store: {} as Record<string, string>,
  getItem(key) {
    return this.store[key] ?? null;
  },
  setItem(key, value) {
    this.store[key] = value;
  },
  removeItem(key) {
    delete this.store[key];
  },
};

function ThemeSwitcherCustomStorage() {
  const [theme, setTheme] = usePersistedState("theme", "light", {
    storage: memoryStorage,
  });
  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      style={{ padding: 8 }}
    >
      Switch to {theme === "light" ? "dark" : "light"} mode
    </button>
  );
}
```

### React Native Example (AsyncStorage)

You can use this hook in React Native by providing a custom storage provider based on `@react-native-async-storage/async-storage`:

```tsx
import usePersistedState, {
  type StorageProviderInterface,
} from "@piyawasin/use-persisted-state";
import AsyncStorage from "@react-native-async-storage/async-storage";

const asyncStorageProvider: StorageProviderInterface = {
  async getItem(key) {
    return await AsyncStorage.getItem(key);
  },
  async setItem(key, value) {
    await AsyncStorage.setItem(key, value);
  },
  async removeItem(key) {
    await AsyncStorage.removeItem(key);
  },
};

function ThemeSwitcherNative() {
  const [theme, setTheme] = usePersistedState("theme", "light", {
    storage: asyncStorageProvider,
  });
  return (
    <Button
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      onPress={() => setTheme(theme === "light" ? "dark" : "light")}
    />
  );
}
```

#### Note

- If you use an async storage provider (like AsyncStorage), you may need to handle asynchronous state initialization and updates in your component logic.
- This package is compatible with React Native as long as you provide a compatible storage provider.

## API

### `usePersistedState<T>(key, initialValue, options?)`

- `key: string` — The key to persist under.
- `initialValue: T` — The initial state value.
- `options?: { namespace?: string; storage?: StorageProviderInterface; serialize?: (value: T) => string; deserialize?: (raw: string) => T; }`
- `namespace` — Optional prefix for the key. Defaults to `"(default)"`
- `storage` — Optional storage provider. Defaults to `localStorage` (if available).

Returns `[state, setState]` — just like `useState`.

### `StorageProviderInterface`

A minimal interface for storage providers:

```ts
interface StorageProviderInterface {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
```

## SSR / Non-browser environments

If no valid storage is available, the hook logs a warning and falls back to a no-op provider (nothing is persisted).

## Comparison to `redux-persist`

While libraries like `redux-persist` are great for persisting entire Redux stores, sometimes you just want to persist a handful of values—like a theme, a language preference, or a form draft—without the complexity of global state management. `usePersistedState` is designed for these cases: it's intuitive, minimal, and lets you persist state with the same API as `useState`.

## Serialization

**Important:** All data passed to `usePersistedState` must be serializable by `JSON.stringify` and deserializable by `JSON.parse`. This means:

- Do not use functions, symbols, or non-serializable objects as state.
- Most plain objects, arrays, numbers, strings, and booleans are supported.
- If you need to persist more complex data, you can provide a custom serialization/deserialization mechanism using the `serialize` and `deserialize` options.

### Custom Serialization Example

If you want to persist data that is not directly supported by JSON (such as `Date`, `Map`, `Set`, or custom classes), you can pass custom `serialize` and `deserialize` functions to the hook:

```tsx
import usePersistedState from "@piyawasin/use-persisted-state";

// Example: Persisting a Date object
const [date, setDate] = usePersistedState<Date>("my-date", new Date(), {
  serialize: (value) => value.toISOString(),
  deserialize: (raw) => new Date(raw),
});

// Example: Persisting a Map
const [map, setMap] = usePersistedState<Map<string, number>>(
  "my-map",
  new Map(),
  {
    serialize: (value) => JSON.stringify([...value.entries()]),
    deserialize: (raw) => new Map(JSON.parse(raw)),
  }
);
```

---

## Higher-Order Hook: Pre-configuring usePersistedState

You can create a custom version of `usePersistedState` with certain options (like `namespace`, `serialize`, or `deserialize`) pre-filled. This is similar to a higher-order component (HOC) pattern, but for hooks. It allows you to DRY up your code and avoid repeating options everywhere.

### Example: Factory for Namespaced State

```tsx
import usePersistedState from "@piyawasin/use-persisted-state";

function createNamespacedPersistedState(namespace: string) {
  return function useNamespacedPersistedState<T>(
    key: string,
    initialValue: T,
    options = {}
  ) {
    return usePersistedState(key, initialValue, { ...options, namespace });
  };
}

// Usage
const useSettingsState = createNamespacedPersistedState("settings");
const [theme, setTheme] = useSettingsState("theme", "light");
```

### Example: Factory with Custom Serialization

```tsx
import usePersistedState from "@piyawasin/use-persisted-state";

function createCustomSerializedState<T>(
  serialize: (value: T) => string,
  deserialize: (raw: string) => T
) {
  return function useCustomSerializedState(
    key: string,
    initialValue: T,
    options = {}
  ) {
    return usePersistedState(key, initialValue, {
      ...options,
      serialize,
      deserialize,
    });
  };
}

// Usage for Dates
const useDateState = createCustomSerializedState<Date>(
  (date) => date.toISOString(),
  (raw) => new Date(raw)
);
const [date, setDate] = useDateState("my-date", new Date());
```

This pattern is especially useful if you have multiple pieces of state that should share the same namespace or serialization logic.

## Disclaimer

This library, originally developed for personal use, is being distributed on an "as-is" basis. The creator makes no warranties or guarantees regarding its performance, functionality, or suitability for any specific application.

## License

MIT
