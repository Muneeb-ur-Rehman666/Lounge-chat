import type { Metadata } from "next";
import Link from "next/link";
import { Heart, MessageCircleHeart, Sparkles, Users } from "lucide-react";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Community",
  description: "The LoungeChat community guidelines and culture of respect.",
};

const GUIDELINES = [
  {
    icon: Heart,
    text: "Respect boundaries and consent — always",
  },
  {
    icon: MessageCircleHeart,
    text: "No hate speech or harassment. Period.",
  },
  {
    icon: Sparkles,
    text: "Keep conversations real and authentic",
  },
  {
    icon: Users,
    text: "Report issues — protect the lounge together",
  },
];

export default function CommunityPage() {
  return (
    <div className="mesh-bg min-h-screen">
      <MarketingHeader />
      <main className="mx-auto max-w-3xl px-6 pb-20 pt-28">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-magenta">
          The lounge code
        </p>
        <h1 className="font-heading mb-4 text-4xl font-bold tracking-tight text-on-surface">
          Curiosity over chaos
        </h1>
        <p className="mb-10 text-lg leading-relaxed text-on-surface-variant">
          Be kind, be present, and treat every stranger like a guest in a shared
          lounge. That&apos;s the whole vibe.
        </p>

        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          {GUIDELINES.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="glass-panel flex items-start gap-3 rounded-3xl p-5 text-on-surface"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Icon className="size-5" />
              </span>
              <p className="pt-1.5 text-sm font-medium leading-snug">{text}</p>
            </div>
          ))}
        </div>

        <Button render={<Link href="/auth" />} size="lg" className="rounded-2xl">
          Join the lounge
        </Button>
      </main>
    </div>
  );
}
