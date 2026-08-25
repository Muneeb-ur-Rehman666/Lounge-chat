"use client";

import Link from "next/link";
import { Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

export function GuestUpsellBanner({
  message = "You're chatting as a guest. Create a free account to save friends and chat history.",
}: {
  message?: string;
}) {
  const isGuest = useAuthStore((s) => s.isGuest);
  const [dismissed, setDismissed] = useState(false);

  if (!isGuest() || dismissed) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-between gap-3 border-b border-magenta/25 bg-gradient-to-r from-primary/15 via-magenta/10 to-secondary/10 px-4 py-2.5 text-sm text-on-surface"
    >
      <div className="flex min-w-0 items-center gap-2">
        <Sparkles className="size-4 shrink-0 text-magenta" aria-hidden />
        <p className="truncate text-on-surface-variant sm:whitespace-normal">
          {message}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          size="sm"
          render={<Link href="/auth?tab=signup" />}
          className="rounded-full bg-gradient-to-r from-primary to-magenta font-semibold text-white glow-primary"
        >
          Sign up
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Dismiss"
          onClick={() => setDismissed(true)}
          className="text-on-surface-variant"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
