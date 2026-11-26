import { useEffect, useState, useSyncExternalStore } from "react";

/** Small localStorage-backed store that is safe to read during server rendering. */
export function createLocalStore<T>(key: string, initial: T) {
  let cache = initial;
  let loaded = false;
  const listeners = new Set<() => void>();

  const read = (): T => {
    if (!loaded && typeof window !== "undefined") {
      loaded = true;
      try {
        const raw = window.localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw) as T;
          cache =
            Array.isArray(initial) || typeof initial !== "object" || initial === null
              ? parsed
              : { ...initial, ...parsed };
        }
      } catch {
        cache = initial;
      }
    }
    return cache;
  };

  const set = (next: T | ((prev: T) => T)) => {
    const value = typeof next === "function" ? (next as (prev: T) => T)(read()) : next;
    cache = value;
    loaded = true;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage may be full or blocked; keep the in-memory value.
    }
    listeners.forEach((l) => l());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const use = () => useSyncExternalStore(subscribe, read, () => initial);

  return { get: read, set, use };
}

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
