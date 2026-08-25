"use client";

import Link from "next/link";
import { Bell, CheckCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFriendsStore } from "@/stores/friends-store";
import { useAuthStore } from "@/stores/auth-store";
import { cn, formatRelative } from "@/lib/utils";

export function NotificationsExperience() {
  const isGuest = useAuthStore((s) => s.isGuest);
  const notifications = useFriendsStore((s) => s.notifications);
  const markNotificationRead = useFriendsStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useFriendsStore(
    (s) => s.markAllNotificationsRead
  );

  if (isGuest()) {
    return (
      <div className="mesh-bg flex h-full flex-col items-center justify-center gap-5 p-8 text-center">
        <div className="glow-primary flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-magenta">
          <Bell className="size-8 text-white" />
        </div>
        <h1 className="font-heading text-2xl font-bold">Notifications</h1>
        <p className="max-w-md text-on-surface-variant">
          Sign up to catch friend requests, lounge updates, and all the good
          pings.
        </p>
        <Button render={<Link href="/auth?tab=signup" />} className="rounded-2xl">
          Sign up free
        </Button>
      </div>
    );
  }

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight">
              Notifications
            </h1>
            <p className="text-sm text-on-surface-variant">
              {unread > 0
                ? `${unread} unread — stay in the loop`
                : "You're all caught up"}
            </p>
          </div>
          {unread > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={markAllNotificationsRead}
            >
              <CheckCheck className="size-4" />
              Mark all read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="glass-panel flex flex-col items-center gap-3 rounded-3xl border-dashed p-12 text-center text-on-surface-variant">
            <Sparkles className="size-8 text-primary/50" />
            <p>No notifications yet — check back after you make some friends.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {notifications.map((n) => (
              <li key={n.id}>
                <Link
                  href={n.href || "#"}
                  onClick={() => markNotificationRead(n.id)}
                  className={cn(
                    "block rounded-2xl p-4 transition-colors hover:bg-surface-container-high",
                    n.read
                      ? "bg-surface-container/40"
                      : "glass-panel border border-primary/25"
                  )}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="font-semibold text-on-surface">{n.title}</p>
                    <span className="shrink-0 text-xs text-on-surface-variant">
                      {formatRelative(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant">{n.body}</p>
                  {!n.read && (
                    <span className="mt-2 inline-block size-2 rounded-full bg-magenta" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
