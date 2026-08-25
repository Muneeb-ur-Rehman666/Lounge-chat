import type { PersistStorage, StorageValue } from "zustand/middleware";

/**
 * Persist storage that never touches `localStorage` during SSR.
 * Using `createJSONStorage(() => localStorage)` at module init on the server
 * returns `undefined` storage, which makes Zustand skip attaching `.persist`
 * entirely — breaking `hasHydrated` / `rehydrate` on the client.
 */
export function createLazyLocalStorage<S>(): PersistStorage<S> {
  return {
    getItem: (name): StorageValue<S> | null => {
      if (typeof window === "undefined") return null;
      const raw = window.localStorage.getItem(name);
      if (raw == null) return null;
      try {
        return JSON.parse(raw) as StorageValue<S>;
      } catch {
        return null;
      }
    },
    setItem: (name, value): void => {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(name, JSON.stringify(value));
    },
    removeItem: (name): void => {
      if (typeof window === "undefined") return;
      window.localStorage.removeItem(name);
    },
  };
}
