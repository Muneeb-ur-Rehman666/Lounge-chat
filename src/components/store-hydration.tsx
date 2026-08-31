"use client";

import { useEffect } from "react";
import { useChatStore } from "@/stores/chat-store";
import { useFriendsStore } from "@/stores/friends-store";

export function StoreHydration() {
  useEffect(() => {
    void Promise.all([
      useChatStore.persist?.rehydrate(),
      useFriendsStore.persist?.rehydrate(),
    ]);
  }, []);

  return null;
}