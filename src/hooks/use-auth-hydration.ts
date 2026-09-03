"use client";

import { useSyncExternalStore } from "react";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Tracks whether the auth persist layer has finished client rehydration.
 * Uses useSyncExternalStore for React 19 / Next.js App Router compatibility.
 */
export function useAuthHydration(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const api = useAuthStore.persist;
      if (!api) return () => {};
      const unsubHydrate = api.onHydrate(onStoreChange);
      const unsubFinish = api.onFinishHydration(onStoreChange);
      if (!api.hasHydrated()) {
        void api.rehydrate();
      }
      return () => {
        unsubHydrate();
        unsubFinish();
      };
    },
    () => {
      const api = useAuthStore.persist;
      return api?.hasHydrated() ?? true;
    },
    () => false
  );
}
