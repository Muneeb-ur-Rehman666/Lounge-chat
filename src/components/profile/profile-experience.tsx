"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheck, Crown, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusDot } from "@/components/shared/status-dot";
import { useAuthStore } from "@/stores/auth-store";
import { profileSchema, type ProfileValues } from "@/lib/validators";
import { cn } from "@/lib/utils";

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
] as const;

const MAX_INTERESTS = 20;
const MAX_INTEREST_LEN = 24;

export function ProfileExperience() {
  const user = useAuthStore((s) => s.session?.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const isGuest = useAuthStore((s) => s.isGuest);
  const [saving, setSaving] = useState(false);
  const [interestDraft, setInterestDraft] = useState("");

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: {
      displayName: user?.displayName ?? "",
      bio: user?.bio ?? "",
      gender: user?.gender,
      interests: user?.interests ?? [],
    },
  });

  const interests = form.watch("interests") ?? [];

  const addInterest = (raw: string) => {
    const cleaned = raw.trim().replace(/\s+/g, " ");
    if (!cleaned) return;
    if (cleaned.length > MAX_INTEREST_LEN) {
      toast.error(`Keep interests under ${MAX_INTEREST_LEN} characters.`);
      return;
    }
    const key = cleaned.toLowerCase();
    if (interests.some((i) => i.toLowerCase() === key)) {
      toast.message("You already added that interest.");
      setInterestDraft("");
      return;
    }
    if (interests.length >= MAX_INTERESTS) {
      toast.error(`You can add up to ${MAX_INTERESTS} interests.`);
      return;
    }
    form.setValue("interests", [...interests, cleaned], {
      shouldDirty: true,
      shouldValidate: true,
    });
    setInterestDraft("");
  };

  const removeInterest = (tag: string) => {
    form.setValue(
      "interests",
      interests.filter((i) => i !== tag),
      { shouldDirty: true, shouldValidate: true }
    );
  };

  if (!user) return null;

  if (isGuest()) {
    return (
      <div className="mesh-bg flex h-full flex-col items-center justify-center gap-5 p-8 text-center">
        <div className="glow-primary flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-magenta">
          <Sparkles className="size-8 text-white" />
        </div>
        <h1 className="font-heading text-2xl font-bold">Guest profile</h1>
        <p className="max-w-md text-on-surface-variant">
          You&apos;re browsing as {user.displayName}. Create a free account to
          customize your look, save friends, and keep chat history.
        </p>
        <Button render={<Link href="/auth?tab=signup" />} className="rounded-2xl">
          Sign up free
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10">
      <div className="mx-auto max-w-xl">
        <h1 className="font-heading mb-2 text-3xl font-bold tracking-tight">
          Profile
        </h1>
        <p className="mb-8 text-on-surface-variant">
          Make it yours — name, bio, interests, and how you show up.
        </p>

        <div className="glass-panel mb-8 flex items-center gap-5 rounded-3xl p-5">
          <div className="relative">
            <div className="glow-primary rounded-full p-0.5">
              <Avatar className="size-20 ring-2 ring-primary/40">
                <AvatarImage src={user.avatarUrl} alt="" />
                <AvatarFallback className="bg-surface-container-high text-2xl">
                  {user.displayName[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            <StatusDot
              status={user.status}
              className="absolute bottom-1 right-1 size-3.5"
            />
          </div>
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 text-xl font-semibold">
              {user.displayName}
              {user.isVerified && (
                <BadgeCheck className="size-5 text-primary" aria-label="Verified" />
              )}
              {user.role === "premium" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-premium-gold/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-premium-gold">
                  <Crown className="size-3.5" aria-hidden />
                  Premium
                </span>
              )}
            </p>
            <p className="truncate text-sm capitalize text-on-surface-variant">
              {user.role} · {user.email}
            </p>
          </div>
        </div>

        <form
          className="flex flex-col gap-5"
          onSubmit={form.handleSubmit(async (values) => {
            setSaving(true);
            await new Promise((r) => setTimeout(r, 500));
            updateProfile({
              displayName: values.displayName,
              bio: values.bio,
              gender: values.gender,
              interests: values.interests ?? [],
            });
            setSaving(false);
            toast.success("Profile updated");
          })}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              className="h-11 rounded-2xl"
              {...form.register("displayName")}
            />
            {form.formState.errors.displayName && (
              <p className="text-xs text-destructive">
                {form.formState.errors.displayName.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={3}
              placeholder="A short intro for the lounge…"
              className="rounded-2xl"
              {...form.register("bio")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="gender">Gender (optional)</Label>
            <select
              id="gender"
              className={cn(
                "h-11 w-full rounded-2xl border border-outline-variant/40 bg-surface-container px-3 text-sm text-on-surface outline-none",
                "focus-visible:border-primary/50 focus-visible:ring-3 focus-visible:ring-ring/40"
              )}
              value={form.watch("gender") ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                form.setValue(
                  "gender",
                  v === ""
                    ? undefined
                    : (v as NonNullable<ProfileValues["gender"]>),
                  { shouldDirty: true, shouldValidate: true }
                );
              }}
            >
              <option value="">Select…</option>
              {GENDER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="interest-input">Interests</Label>
            <Input
              id="interest-input"
              className="h-11 rounded-2xl"
              placeholder="Type a keyword and press Enter (art, games, music…)"
              value={interestDraft}
              onChange={(e) => setInterestDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addInterest(interestDraft);
                }
              }}
            />
            {interests.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {interests.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full border border-magenta/30 bg-magenta/10 px-3 py-1 text-sm text-on-surface"
                  >
                    {tag}
                    <button
                      type="button"
                      aria-label={`Remove ${tag}`}
                      onClick={() => removeInterest(tag)}
                      className="rounded-full p-0.5 text-on-surface-variant hover:bg-magenta/20 hover:text-magenta"
                    >
                      <X className="size-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-on-surface-variant">
              Press Enter to add. Used for matching when Interests On is enabled
              in chat.
            </p>
          </div>

          <Button type="submit" disabled={saving} className="h-11 rounded-2xl">
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </div>
    </div>
  );
}
