"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useChatStore } from "@/stores/chat-store";
import { useFriendsStore } from "@/stores/friends-store";

/**
 * Manually rehydrates all persisted Zustand stores after mount.
 * Required when stores use `skipHydration: true` (SSR-safe Next.js pattern).
 *
 * Mounted once at the app root inside `Providers`.
 */
export function StoreHydration() {
  useEffect(() => {
    void Promise.all([
      useAuthStore.persist?.rehydrate(),
      useChatStore.persist?.rehydrate(),
      useFriendsStore.persist?.rehydrate(),
    ]);
  }, []);

  return null;
}
