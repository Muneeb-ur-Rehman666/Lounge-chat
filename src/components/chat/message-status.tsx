"use client";

import { Check, CheckCheck } from "lucide-react";
import type { ChatMessage } from "@/types";
import { cn } from "@/lib/utils";

export function MessageStatus({
  status,
  className,
}: {
  status: ChatMessage["status"];
  className?: string;
}) {
  if (status === "sending") {
    return (
      <span
        className={cn("text-[10px] text-outline", className)}
        aria-label="Sending"
      >
        …
      </span>
    );
  }

  if (status === "failed") {
    return (
      <span
        className={cn("text-[10px] text-destructive", className)}
        aria-label="Failed to send"
      >
        !
      </span>
    );
  }

  const read = status === "read";
  const Icon = read || status === "delivered" ? CheckCheck : Check;

  return (
    <Icon
      className={cn(
        "size-3.5 shrink-0",
        read ? "text-cyan-pulse" : "text-white/70",
        className
      )}
      aria-label={
        read ? "Read" : status === "delivered" ? "Delivered" : "Sent"
      }
    />
  );
}
