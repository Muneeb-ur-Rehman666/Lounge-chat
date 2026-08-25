"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Tracks whether the auth persist layer has finished client rehydration.
 * Official Zustand pattern for Next.js App Router + persist.
 *
 * @see https://github.com/pmndrs/zustand/blob/main/docs/reference/integrations/persisting-store-data.md
 */
export function useAuthHydration(): boolean {
  const [hydrated, setHydrated] = useState(() => {
    const api = useAuthStore.persist;
    return api?.hasHydrated() ?? false;
  });

  useEffect(() => {
    const api = useAuthStore.persist;
    if (!api) {
      // Persist API missing — treat as hydrated so the app isn't blocked.
      setHydrated(true);
      return;
    }

    const unsubHydrate = api.onHydrate(() => {
      setHydrated(false);
    });

    const unsubFinish = api.onFinishHydration(() => {
      setHydrated(true);
    });

    if (api.hasHydrated()) {
      setHydrated(true);
    } else {
      void api.rehydrate();
    }

    return () => {
      unsubHydrate();
      unsubFinish();
    };
  }, []);

  return hydrated;
}
