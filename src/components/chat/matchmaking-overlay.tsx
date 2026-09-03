"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  WifiOff,
  Shuffle,
  Lock,
  Crown,
  Users,
  Mars,
  Venus,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/stores/auth-store";
import { useChatStore } from "@/stores/chat-store";
import type { ChatConnectionState, GenderPreference } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const GENDER_OPTIONS: {
  value: GenderPreference;
  label: string;
  icon: typeof Users;
  premium?: boolean;
}[] = [
  { value: "any", label: "Any", icon: Users },
  { value: "male", label: "Male", icon: Mars, premium: true },
  { value: "female", label: "Female", icon: Venus, premium: true },
];

export function MatchmakingOverlay({
  state,
  onStart,
  onReconnect,
}: {
  state: ChatConnectionState;
  onStart: () => void;
  onReconnect: () => void;
}) {
  const router = useRouter();
  const isPremium = useAuthStore((s) => s.isPremium);
  const userInterests = useAuthStore((s) => s.session?.user.interests);
  const matchPreferences = useChatStore((s) => s.matchPreferences);
  const setGenderPreference = useChatStore((s) => s.setGenderPreference);
  const setInterestsEnabled = useChatStore((s) => s.setInterestsEnabled);
  const premium = isPremium();
  const hasInterests = (userInterests?.length ?? 0) > 0;

  useEffect(() => {
    if (!premium && matchPreferences.gender !== "any") {
      setGenderPreference("any");
    }
  }, [premium, matchPreferences.gender, setGenderPreference]);

  if (state === "connected") return null;

  const searching = state === "searching" || state === "connecting";
  const reconnecting = state === "reconnecting";
  const disconnected = state === "disconnected";
  const idle = state === "idle" || state === "ended";

  const handleGenderSelect = (value: GenderPreference) => {
    const option = GENDER_OPTIONS.find((o) => o.value === value);
    if (option?.premium && !premium) {
      toast.info("Gender filters are a Premium perk.", {
        action: {
          label: "Upgrade",
          onClick: () => router.push("/premium"),
        },
      });
      return;
    }
    setGenderPreference(value);
  };

  const handleInterestsToggle = (enabled: boolean) => {
    if (enabled && !hasInterests) {
      toast.info("Add interests on your profile first.", {
        action: {
          label: "Profile",
          onClick: () => router.push("/profile"),
        },
      });
      return;
    }
    setInterestsEnabled(enabled);
  };

  const handleStart = () => {
    if (matchPreferences.gender !== "any" && !premium) {
      setGenderPreference("any");
      toast.info("Gender filters require Premium — matching with Anyone.");
    }
    if (matchPreferences.interestsEnabled && !hasInterests) {
      setInterestsEnabled(false);
    }
    onStart();
  };

  return (
    <div className="mesh-bg-animated relative flex h-full flex-1 flex-col items-center justify-center overflow-hidden p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className="relative z-10 flex w-full max-w-lg flex-col items-center text-center"
      >
        {(searching || reconnecting) && (
          <div className="flex flex-col items-center">
            <div className="relative mb-8 flex size-28 items-center justify-center">
              <span
                className="pulse-ring absolute inset-0 rounded-full border-2 border-magenta/50"
                aria-hidden
              />
              <span
                className="pulse-ring absolute inset-0 rounded-full border-2 border-secondary/40"
                style={{ animationDelay: "0.6s" }}
                aria-hidden
              />
              <span
                className="pulse-ring absolute inset-0 rounded-full border-2 border-primary/40"
                style={{ animationDelay: "1.2s" }}
                aria-hidden
              />
              <div className="relative flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-primary via-magenta to-secondary glow-primary">
                <Sparkles className="size-9 text-white" aria-hidden />
              </div>
            </div>
            <h2 className="font-heading mb-2 text-2xl font-bold text-on-surface md:text-3xl">
              {reconnecting ? "Reconnecting…" : "Finding your vibe…"}
            </h2>
            <p className="text-on-surface-variant" aria-live="polite">
              {state === "connecting"
                ? "Almost there — connecting you now."
                : matchPreferences.interestsEnabled
                  ? "Matching people who share your interests…"
                  : matchPreferences.gender === "any"
                    ? "Matching you with someone new in the lounge."
                    : `Looking for ${matchPreferences.gender} chat partners…`}
            </p>
            {searching && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => useChatStore.getState().endChat()}
                className="mt-6 rounded-full border-outline-variant/40 px-5 text-xs text-on-surface-variant hover:border-destructive/40 hover:bg-destructive/15 hover:text-destructive"
              >
                Cancel search
              </Button>
            )}
          </div>
        )}

        {idle && (
          <>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="mb-6 flex size-28 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/30 via-magenta/20 to-secondary/20 shadow-[0_0_48px_rgba(232,121,249,0.25)] ring-1 ring-primary/30"
            >
              <Shuffle className="size-12 text-magenta" aria-hidden />
            </motion.div>

            <h2 className="font-heading mb-2 text-3xl font-bold tracking-tight text-on-surface md:text-4xl">
              Ready to meet someone?
            </h2>
            <p className="mb-8 max-w-[90%] text-base leading-relaxed text-on-surface-variant md:text-lg">
              Pick who you want to chat with, then jump in.
            </p>

            <div className="mb-4 w-full">
              <div className="mb-2 flex items-center justify-between px-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Chat with
                </p>
                {!premium && (
                  <Link
                    href="/premium"
                    className="inline-flex items-center gap-1 text-xs font-medium text-premium-gold hover:underline"
                  >
                    <Crown className="size-3" aria-hidden />
                    Unlock filters
                  </Link>
                )}
              </div>
              <div
                role="radiogroup"
                aria-label="Gender preference"
                className="grid grid-cols-3 gap-2"
              >
                {GENDER_OPTIONS.map((opt) => {
                  const selected = matchPreferences.gender === opt.value;
                  const locked = !!opt.premium && !premium;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => handleGenderSelect(opt.value)}
                      className={cn(
                        "relative flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3.5 text-sm font-semibold transition-all active:scale-[0.97]",
                        selected
                          ? "border-magenta/60 bg-gradient-to-b from-primary/25 to-magenta/15 text-on-surface shadow-[0_0_20px_rgba(232,121,249,0.2)]"
                          : "border-outline-variant/30 bg-surface-container/60 text-on-surface-variant hover:border-primary/40 hover:bg-surface-container-high",
                        locked && "opacity-80"
                      )}
                    >
                      {locked && (
                        <Lock
                          className="absolute right-2 top-2 size-3 text-premium-gold"
                          aria-hidden
                        />
                      )}
                      <Icon
                        className={cn(
                          "size-5",
                          selected ? "text-magenta" : "text-on-surface-variant"
                        )}
                        aria-hidden
                      />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-8 flex w-full items-center justify-between rounded-2xl border border-outline-variant/30 bg-surface-container/60 px-4 py-3 text-left">
              <div className="min-w-0 pr-3">
                <p className="text-sm font-semibold text-on-surface">
                  Interests On
                </p>
                <p className="text-xs text-on-surface-variant">
                  Match using your profile keywords
                  {!hasInterests && (
                    <>
                      {" · "}
                      <Link href="/profile" className="text-magenta hover:underline">
                        add some
                      </Link>
                    </>
                  )}
                </p>
              </div>
              <Switch
                checked={matchPreferences.interestsEnabled}
                onCheckedChange={handleInterestsToggle}
                aria-label="Match based on interests"
              />
            </div>

            <Button
              size="lg"
              onClick={handleStart}
              className="w-full max-w-xs rounded-2xl px-8 py-6 text-base font-bold"
            >
              <Shuffle className="size-5" />
              Start chatting
            </Button>
          </>
        )}

        {disconnected && (
          <>
            <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-destructive/15">
              <WifiOff className="size-8 text-destructive" aria-hidden />
            </div>
            <h2 className="font-heading mb-2 text-2xl font-bold">
              Connection lost
            </h2>
            <p className="mb-6 text-on-surface-variant">
              Check your network, then try reconnecting.
            </p>
            <Button onClick={onReconnect} size="lg">
              Reconnect
            </Button>
          </>
        )}
      </motion.div>
    </div>
  );
}
