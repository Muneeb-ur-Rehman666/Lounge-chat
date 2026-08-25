"use client";

import { useChatSession } from "@/features/chat/use-chat-session";
import { ChatHeader } from "@/components/chat/chat-header";
import { MessageList } from "@/components/chat/message-list";
import { ChatComposer } from "@/components/chat/chat-composer";
import { MatchmakingOverlay } from "@/components/chat/matchmaking-overlay";
import { ConnectionBanner } from "@/components/chat/connection-banner";
import { GuestUpsellBanner } from "@/components/shared/guest-upsell-banner";

export function ChatExperience() {
  const {
    connection,
    session,
    error,
    startMatchmaking,
    skip,
    sendMessage,
    reportPartner,
    blockPartner,
    reconnect,
    isConnected,
  } = useChatSession();

  const midSessionDisconnect =
    !!session &&
    (connection === "disconnected" || connection === "reconnecting");

  if (!isConnected && !midSessionDisconnect) {
    return (
      <MatchmakingOverlay
        state={connection}
        onStart={startMatchmaking}
        onReconnect={reconnect}
      />
    );
  }

  if (!session) {
    return (
      <MatchmakingOverlay
        state={connection}
        onStart={startMatchmaking}
        onReconnect={reconnect}
      />
    );
  }

  return (
    <div className="relative flex h-full flex-col">
      <GuestUpsellBanner />
      <ConnectionBanner
        connection={connection}
        error={error}
        onReconnect={reconnect}
      />
      <ChatHeader
        partner={session.partner}
        onReport={reportPartner}
        onBlock={async () => {
          await blockPartner();
        }}
      />
      <MessageList
        messages={session.messages}
        isPartnerTyping={
          connection === "connected" && session.isPartnerTyping
        }
      />
      <ChatComposer
        disabled={connection !== "connected"}
        onSend={(content, type, mediaUrl) =>
          sendMessage(content, type, mediaUrl)
        }
        onSkip={skip}
      />
    </div>
  );
}
