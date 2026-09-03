import Link from "next/link";
import { Shield, Sparkles, Users, Crown } from "lucide-react";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Button } from "@/components/ui/button";
import { StartChattingButton } from "@/components/shared/start-chatting-button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LoungeChat — Skip the Feed. Meet Actual Humans",
  description:
    "Jump into LoungeChat — spontaneous stranger chat with good vibes, real privacy, and a community that actually gets it.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-on-surface">
      <MarketingHeader />

      {/* Hero — first viewport only */}
      <section className="mesh-bg-animated relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 pb-16 pt-24">
        <div
          className="pointer-events-none absolute left-[12%] top-[28%] size-3 rounded-full bg-magenta/60 blur-[1px] animate-pulse"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-[18%] top-[36%] size-2 rounded-full bg-cyan-pulse/70 blur-[1px] animate-pulse [animation-delay:700ms]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-[22%] left-[40%] size-2.5 rounded-full bg-premium-gold/50 blur-[1px] animate-pulse [animation-delay:1.2s]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 top-1/3 size-[420px] rounded-full bg-primary/20 blur-[120px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-20 bottom-1/4 size-[360px] rounded-full bg-magenta/15 blur-[100px]"
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center">
          <div className="mb-8 scale-110 sm:mb-10 sm:scale-125">
            <BrandLogo size="lg" href="/" />
          </div>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-on-surface sm:text-5xl md:text-6xl">
            Skip the Feed.{" "}
            <span className="text-gradient">Meet Actual Humans</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg text-on-surface-variant sm:text-xl">
            Spontaneous chats, good vibes, zero awkward sign-up walls — jump in
            as a guest and see who&apos;s around.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <StartChattingButton
              size="lg"
              className="glow-primary gap-2 rounded-2xl px-10 py-6 text-base"
              arrowClassName="size-5"
            >
              Start chatting
            </StartChattingButton>
            <Button
              render={<Link href="/auth?tab=signup" />}
              size="lg"
              variant="outline"
              className="rounded-2xl px-8 py-6 text-base"
            >
              Create free account
            </Button>
          </div>
          <p className="mt-4 text-xs font-medium tracking-wide text-on-surface-variant/70">
            No account needed for guest mode · Skip anytime
          </p>
        </div>
      </section>

      {/* Features — below the fold */}
      <main className="relative mx-auto max-w-[1100px] px-6 py-20">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-magenta">
            Why LoungeChat
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Built for real vibes, not chaos
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <FeatureCard
            icon={<Shield className="size-7 text-primary" />}
            title="Privacy that sticks"
            body="Ephemeral stranger chats with block & report always one tap away. Your moment stays in the moment."
          />
          <FeatureCard
            icon={<Users className="size-7 text-secondary" />}
            title="People who get it"
            body="A curated crew, not a free-for-all. Respect is the dress code — curiosity is welcome."
          />
          <FeatureCard
            icon={<Crown className="size-7 text-premium-gold" />}
            title="Premium glow-ups"
            body="Gender filters, HD media, priority matching, and exclusive badges when you're ready to level up."
          />
        </div>

        <section className="glass-panel mt-16 flex flex-col items-center gap-5 rounded-3xl p-10 text-center md:p-14">
          <Sparkles className="size-8 text-magenta" />
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">
            Ready when you are
          </h2>
          <p className="max-w-md text-on-surface-variant">
            The lounge doesn&apos;t wait — hop in, say hey, and see where it goes.
          </p>
          <StartChattingButton
            size="lg"
            className="rounded-2xl px-8 py-6 text-base"
            arrowClassName="size-4"
          >
            Enter the lounge
          </StartChattingButton>
        </section>
      </main>

      <footer className="border-t border-outline-variant/30 py-10 text-center text-xs font-medium tracking-wide text-on-surface-variant">
        <p>© {new Date().getFullYear()} LoungeChat. Stay curious. Stay kind.</p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="glass-panel rounded-3xl p-8 transition-colors hover:bg-surface-container-high/80">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-surface-container-high/80">
        {icon}
      </div>
      <h3 className="font-heading mb-2 text-xl font-semibold text-on-surface">
        {title}
      </h3>
      <p className="text-base leading-relaxed text-on-surface-variant">{body}</p>
    </div>
  );
}
