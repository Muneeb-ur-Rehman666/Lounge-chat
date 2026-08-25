import type { Metadata } from "next";
import Link from "next/link";
import { Flag, Shield, SkipForward, Lock } from "lucide-react";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Safety",
  description: "LoungeChat safety guidelines and community protections.",
};

const TIPS = [
  {
    icon: Lock,
    title: "Keep it personal — not private",
    body: "Never share passwords, money details, or anything that could dox you in chat.",
  },
  {
    icon: SkipForward,
    title: "Skip when the vibe dies",
    body: "Use Skip or End Chat anytime a conversation feels off. No explanation needed.",
  },
  {
    icon: Flag,
    title: "Report the bad stuff",
    body: "Harassment, spam, or underage users — report them. We take every flag seriously.",
  },
];

export default function SafetyPage() {
  return (
    <div className="mesh-bg min-h-screen">
      <MarketingHeader />
      <main className="mx-auto max-w-3xl px-6 pb-20 pt-28">
        <div className="mb-10 flex items-center gap-4">
          <span className="glow-primary flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-magenta">
            <Shield className="size-7 text-white" />
          </span>
          <div>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-on-surface">
              Safety first, vibes second
            </h1>
            <p className="mt-1 text-on-surface-variant">
              Spontaneous chats should still feel safe.
            </p>
          </div>
        </div>

        <p className="mb-8 text-lg leading-relaxed text-on-surface-variant">
          LoungeChat is built for connection without chaos. Block and report are
          always one tap away — your dignity is non-negotiable.
        </p>

        <ul className="mb-10 flex flex-col gap-4">
          {TIPS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="glass-panel flex gap-4 rounded-3xl p-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-surface-container-high">
                <Icon className="size-5 text-primary" />
              </span>
              <div>
                <h2 className="font-heading mb-1 font-semibold text-on-surface">
                  {title}
                </h2>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  {body}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <Button
          render={<Link href="/auth?guest=1" />}
          size="lg"
          className="rounded-2xl"
        >
          Start chatting safely
        </Button>
      </main>
    </div>
  );
}
