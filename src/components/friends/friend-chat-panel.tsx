"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Send, BadgeCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/shared/status-dot";
import type { Friend } from "@/types";
import { cn, formatTime } from "@/lib/utils";
import { useFriendsStore } from "@/stores/friends-store";

export function FriendChatPanel({
  friend,
  onBack,
}: {
  friend: Friend;
  onBack: () => void;
}) {
  const storedMessages = useFriendsStore((s) => s.directMessages[friend.id]);
  const sendDirectMessage = useFriendsStore((s) => s.sendDirectMessage);

  const messages = useMemo(() => {
    if (storedMessages && storedMessages.length > 0) return storedMessages;
    return [
      {
        id: `seed_${friend.id}`,
        mine: false,
        content: friend.lastMessage || "Hey! Good to see you again.",
        at: friend.lastActiveAt,
      },
    ];
  }, [storedMessages, friend.id, friend.lastMessage, friend.lastActiveAt]);

  const [value, setValue] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const send = () => {
    if (!value.trim()) return;
    sendDirectMessage(friend.id, value.trim());
    setValue("");
  };

  return (
    <div className="mesh-bg flex h-full w-full flex-col">
      <header className="glass-panel flex h-16 items-center gap-3 border-b border-outline-variant/20 px-4">
        <Button
          size="icon"
          variant="ghost"
          className="rounded-xl lg:hidden"
          onClick={onBack}
          aria-label="Back to friends"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="relative">
          <Avatar className="size-10 ring-2 ring-primary/30">
            <AvatarImage src={friend.avatarUrl} alt="" />
            <AvatarFallback>{friend.displayName[0]}</AvatarFallback>
          </Avatar>
          <StatusDot status={friend.status} className="absolute bottom-0 right-0" />
        </div>
        <div>
          <h2 className="flex items-center gap-1 text-sm font-semibold">
            {friend.displayName}
            {friend.isVerified && (
              <BadgeCheck className="size-3.5 text-primary" />
            )}
          </h2>
          <p className="text-xs capitalize text-on-surface-variant">
            {friend.status}
          </p>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 flex-col gap-3 overflow-y-auto p-4 custom-scrollbar">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "flex max-w-[75%] items-end gap-2",
              m.mine ? "self-end" : "self-start"
            )}
          >
            {m.mine && (
              <span className="text-xs text-outline">{formatTime(m.at)}</span>
            )}
            <div
              className={cn(
                "rounded-2xl px-4 py-3 text-sm",
                m.mine
                  ? "bubble-mine rounded-br-sm"
                  : "bubble-theirs rounded-bl-sm"
              )}
            >
              {m.content}
            </div>
            {!m.mine && (
              <span className="text-xs text-outline">{formatTime(m.at)}</span>
            )}
          </div>
        ))}
        <div ref={bottomRef} className="h-1 shrink-0" aria-hidden="true" />
      </div>

      <div className="border-t border-outline-variant/20 p-4">
        <div className="glass-panel flex items-end gap-2 rounded-3xl p-2">
          <textarea
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={`Message ${friend.displayName}…`}
            className="min-h-[44px] flex-1 resize-none bg-transparent px-3 py-3 text-sm outline-none placeholder:text-on-surface-variant/60"
            aria-label="Message"
          />
          <Button
            size="icon"
            className="size-10 shrink-0 rounded-full"
            onClick={send}
            disabled={!value.trim()}
            aria-label="Send"
          >
            <Send className="size-4 fill-current" />
          </Button>
        </div>
      </div>
    </div>
  );
}
