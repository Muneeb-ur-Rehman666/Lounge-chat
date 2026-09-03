"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, LogOut, Shield, Wifi } from "lucide-react";

export function SettingsExperience() {
  const user = useAuthStore((s) => s.session?.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const signOut = useAuthStore((s) => s.signOut);
  const isGuest = useAuthStore((s) => s.isGuest);
  const router = useRouter();

  const [friendReqNotifications, setFriendReqNotifications] = useState(true);
  const [messagePreviews, setMessagePreviews] = useState(true);

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10">
      <div className="mx-auto max-w-xl">
        <h1 className="font-heading mb-2 text-3xl font-bold tracking-tight">
          Settings
        </h1>
        <p className="mb-8 text-on-surface-variant">
          Preferences, privacy, and account settings.
        </p>

        <section className="glass-panel mb-5 rounded-3xl p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-on-surface-variant">
            <Wifi className="size-4 text-secondary" />
            Presence
          </h2>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="online">Show as online</Label>
              <p className="text-xs text-on-surface-variant">
                Friends and chat partners can see your status.
              </p>
            </div>
            <Switch
              id="online"
              checked={user?.status === "online"}
              disabled={isGuest()}
              onCheckedChange={(checked) => {
                if (isGuest()) {
                  return;
                }

                updateProfile({
                  status: checked ? "online" : "away",
                });

                toast.message(
                  checked ? "Status: Online" : "Status: Away"
                );
              }}
            />
          </div>
        </section>

        <section className="glass-panel mb-5 rounded-3xl p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-on-surface-variant">
            <Bell className="size-4 text-primary" />
            Notifications
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="friend-req">Friend requests</Label>
                <p className="text-xs text-on-surface-variant">
                  Notify when someone wants to connect
                </p>
              </div>
              <Switch
                id="friend-req"
                checked={friendReqNotifications}
                disabled={isGuest()}
                onCheckedChange={(checked) => {
                  setFriendReqNotifications(checked);
                  toast.success(
                    checked
                      ? "Friend request alerts on"
                      : "Friend request alerts off"
                  );
                }}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="messages">Message previews</Label>
                <p className="text-xs text-on-surface-variant">
                  Show message snippets in alerts
                </p>
              </div>
              <Switch
                id="messages"
                checked={messagePreviews}
                disabled={isGuest()}
                onCheckedChange={(checked) => {
                  setMessagePreviews(checked);
                  toast.success(
                    checked
                      ? "Message previews on"
                      : "Message previews off"
                  );
                }}
              />
            </div>
          </div>
          {isGuest() && (
            <p className="mt-4 text-xs text-on-surface-variant">
              Sign up to enable notification preferences.{" "}
              <Link
                href="/auth?tab=signup"
                className="text-magenta underline underline-offset-2"
              >
                Create account
              </Link>
            </p>
          )}
        </section>

        <section className="glass-panel mb-8 rounded-3xl p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-on-surface-variant">
            <Shield className="size-4 text-magenta" />
            Safety
          </h2>
          <Button
            variant="outline"
            render={<Link href="/safety" />}
            className="w-full justify-start rounded-2xl"
          >
            View safety guidelines
          </Button>
        </section>

        <Separator className="mb-6 bg-outline-variant/30" />

        <Button
          variant="destructive"
          className="rounded-2xl"
          onClick={async () => {
            try {
              await signOut();
              toast.success(
                isGuest()
                  ? "Exited guest session."
                  : "You have been logged out."
              );
              router.replace("/");
            } catch (error) {
              console.error("LOGOUT ERROR:", error);

              toast.error(
                error instanceof Error
                  ? error.message
                  : "Could not log out. Please try again."
              );
            }
          }}
        >
          <LogOut className="size-4" />
          {isGuest() ? "Exit guest mode" : "Log out"}
        </Button>
      </div>
    </div>
  );
}
