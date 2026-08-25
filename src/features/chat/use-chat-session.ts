"use client";

import { useCallback, useEffect } from "react";
import { useChatStore } from "@/stores/chat-store";

/**
 * Feature hook wrapping the chat store + browser connectivity.
 * Keeps presentation components free of low-level connection wiring.
 */
export function useChatSession() {
  const connection = useChatStore((s) => s.connection);
  const session = useChatStore((s) => s.session);
  const error = useChatStore((s) => s.error);
  const startMatchmaking = useChatStore((s) => s.startMatchmaking);
  const skipStranger = useChatStore((s) => s.skipStranger);
  const endChat = useChatStore((s) => s.endChat);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const reportPartner = useChatStore((s) => s.reportPartner);
  const blockPartner = useChatStore((s) => s.blockPartner);
  const reconnect = useChatStore((s) => s.reconnect);
  const simulateDisconnect = useChatStore((s) => s.simulateDisconnect);

  useEffect(() => {
    const onOffline = () => {
      if (useChatStore.getState().connection === "connected") {
        simulateDisconnect();
      }
    };
    const onOnline = () => {
      if (useChatStore.getState().connection === "disconnected") {
        void reconnect();
      }
    };
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, [simulateDisconnect, reconnect]);

  const skip = useCallback(async () => {
    await skipStranger();
  }, [skipStranger]);

  return {
    connection,
    session,
    error,
    startMatchmaking,
    skip,
    endChat,
    sendMessage,
    reportPartner,
    blockPartner,
    reconnect,
    isConnected: connection === "connected" && !!session,
  };
}
