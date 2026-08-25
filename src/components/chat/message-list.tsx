"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { User } from "lucide-react";
import type { ChatMessage } from "@/types";
import { MessageStatus } from "@/components/chat/message-status";
import { cn, formatTime } from "@/lib/utils";

export function MessageList({
  messages,
  isPartnerTyping,
}: {
  messages: ChatMessage[];
  isPartnerTyping: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPartnerTyping]);

  return (
    <div
      className="flex flex-1 flex-col gap-6 overflow-y-auto bg-gradient-to-b from-background via-surface-dim to-background p-4 pb-36 md:p-6"
      role="log"
      aria-live="polite"
      aria-relevant="additions"
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            if (msg.type === "system") {
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center py-2"
                >
                  <div className="rounded-full border border-primary/20 bg-surface-container-high/60 px-4 py-1.5 text-xs font-semibold text-on-surface-variant backdrop-blur-sm">
                    {msg.content}
                  </div>
                </motion.div>
              );
            }

            const mine = msg.senderId === "me";
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                className={cn(
                  "flex max-w-[85%] flex-col gap-1 md:max-w-[70%]",
                  mine ? "self-end items-end" : "self-start items-start"
                )}
              >
                <div className={cn("flex items-end gap-2", mine && "flex-row-reverse")}>
                  {!mine && (
                    <div className="hidden size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-secondary/30 to-primary/20 text-secondary ring-1 ring-secondary/30 md:flex">
                      <User className="size-4" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "px-4 py-2.5 text-base leading-relaxed",
                      mine
                        ? "bubble-mine rounded-3xl rounded-br-md"
                        : "bubble-theirs rounded-3xl rounded-bl-md"
                    )}
                  >
                    {msg.type === "image" || msg.type === "gif" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={msg.mediaUrl || msg.content}
                        alt={msg.type === "gif" ? "GIF" : "Shared image"}
                        className="max-h-56 max-w-full rounded-xl"
                      />
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 px-1",
                    mine ? "flex-row-reverse" : "pl-0 md:pl-10"
                  )}
                >
                  <span className="font-mono text-[10px] text-outline">
                    {formatTime(msg.createdAt)}
                  </span>
                  {mine && <MessageStatus status={msg.status} />}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isPartnerTyping && (
          <div className="flex max-w-[70%] items-end gap-2 self-start">
            <div className="hidden size-8 items-center justify-center rounded-full bg-gradient-to-br from-secondary/30 to-primary/20 md:flex">
              <User className="size-4 text-secondary" />
            </div>
            <div className="bubble-theirs rounded-3xl rounded-bl-md px-4 py-3">
              <div
                className="flex h-5 items-center gap-1.5"
                aria-label="Partner is typing"
              >
                <span className="size-2 animate-bounce rounded-full bg-secondary [animation-delay:0ms]" />
                <span className="size-2 animate-bounce rounded-full bg-magenta [animation-delay:150ms]" />
                <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
