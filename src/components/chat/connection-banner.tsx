"use client";

import { Loader2, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChatConnectionState } from "@/types";
import { cn } from "@/lib/utils";

export function ConnectionBanner({
  connection,
  error,
  onReconnect,
}: {
  connection: ChatConnectionState;
  error?: string | null;
  onReconnect: () => void;
}) {
  if (connection !== "reconnecting" && connection !== "disconnected") {
    return null;
  }

  const disconnected = connection === "disconnected";

  return (
    <div
      role="status"
      aria-live="assertive"
      className={cn(
        "flex items-center justify-between gap-3 border-b px-4 py-2.5 text-sm",
        disconnected
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-secondary/30 bg-secondary/10 text-secondary"
      )}
    >
      <div className="flex items-center gap-2">
        {disconnected ? (
          <WifiOff className="size-4 shrink-0" />
        ) : (
          <Loader2 className="size-4 shrink-0 animate-spin" />
        )}
        <span>
          {disconnected
            ? error || "Connection lost."
            : "Reconnecting to the lounge…"}
        </span>
      </div>
      {disconnected && (
        <Button
          size="sm"
          variant="outline"
          className="shrink-0 border-destructive/40 text-destructive"
          onClick={onReconnect}
        >
          Reconnect
        </Button>
      )}
    </div>
  );
}
