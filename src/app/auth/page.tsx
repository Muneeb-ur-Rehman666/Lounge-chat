import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthBrandMark, AuthForm } from "@/components/auth/auth-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to LoungeChat or continue as a guest.",
};

function AuthDoodles() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
      {/* Soft orbs */}
      <div className="absolute -left-8 top-16 size-40 rounded-full bg-primary/25 blur-3xl" />
      <div className="absolute -right-10 bottom-24 size-48 rounded-full bg-magenta/20 blur-3xl" />
      <div className="absolute left-1/3 top-1/2 size-28 rounded-full bg-cyan-pulse/15 blur-2xl" />

      {/* Chat bubble doodles */}
      <div className="absolute left-8 top-[22%] max-w-[200px] rotate-[-8deg] rounded-2xl rounded-bl-md bg-gradient-to-br from-primary/40 to-magenta/30 px-4 py-3 text-sm font-medium text-white shadow-[0_8px_24px_rgba(168,85,247,0.25)] ring-1 ring-white/10">
        hey, you free to chat? 👋
      </div>
      <div className="absolute right-6 top-[38%] max-w-[180px] rotate-[6deg] rounded-2xl rounded-br-md bg-surface-container-highest/90 px-4 py-3 text-sm text-on-surface shadow-lg ring-1 ring-cyan-pulse/20">
        always down for random convos ✨
      </div>
      <div className="absolute bottom-[28%] left-10 max-w-[190px] rotate-[3deg] rounded-2xl rounded-bl-md bg-gradient-to-r from-secondary/30 to-primary/25 px-4 py-3 text-sm text-on-surface ring-1 ring-secondary/25">
        found my people here 💜
      </div>

      {/* Floating dots / stars */}
      <span className="absolute left-[18%] top-[14%] size-2 rounded-full bg-magenta/70" />
      <span className="absolute right-[22%] top-[18%] size-1.5 rounded-full bg-cyan-pulse" />
      <span className="absolute bottom-[42%] right-[12%] size-2.5 rounded-full bg-premium-gold/60" />
      <span className="absolute left-[42%] top-[48%] size-1.5 rounded-full bg-primary" />

      {/* Squiggle accents */}
      <svg
        className="absolute right-8 top-[55%] w-16 text-magenta/40"
        viewBox="0 0 64 24"
        fill="none"
      >
        <path
          d="M2 12c6-8 10 8 16 0s10 8 16 0 10 8 16 0 10 8 12 0"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <svg
        className="absolute left-6 bottom-[18%] w-12 text-secondary/50"
        viewBox="0 0 48 48"
        fill="none"
      >
        <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" />
        <circle cx="24" cy="24" r="3" fill="currentColor" />
      </svg>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="mesh-bg relative flex h-dvh max-h-dvh items-center justify-center overflow-hidden text-on-surface antialiased">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute right-[-10%] top-[-20%] size-[500px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-15%] left-[-8%] size-[400px] rounded-full bg-magenta/15 blur-[100px]" />
      </div>

      <main className="relative z-10 flex h-full w-full max-w-[1000px] flex-col overflow-hidden lg:h-[min(640px,92dvh)] lg:flex-row lg:rounded-3xl lg:shadow-[0_0_50px_rgba(168,85,247,0.16)]">
        {/* Left brand panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden p-8 lg:flex lg:w-[42%]">
          <div className="absolute inset-0 z-0 mesh-bg-animated opacity-90" />
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/10 via-transparent to-background/80" />
          <AuthDoodles />

          <div className="relative z-10">
            <AuthBrandMark />
          </div>

          <div className="relative z-10 max-w-xs">
            <h2 className="font-heading mb-2 text-2xl font-bold tracking-tight text-on-surface">
              Skip the feed.{" "}
              <span className="text-gradient">Meet someone</span>
            </h2>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              Sign in for friends & history — or jump in as a guest in seconds.
            </p>
          </div>
        </div>

        {/* Form panel */}
        <div className="glass-panel relative z-10 flex w-full flex-1 flex-col justify-center overflow-y-auto px-5 py-6 sm:px-8 lg:w-[58%] lg:rounded-r-3xl lg:px-10 lg:py-8">
          <div className="mb-4 flex items-center justify-center gap-3 lg:hidden">
            <AuthBrandMark />
          </div>
          <Suspense
            fallback={
              <Skeleton className="h-72 w-full rounded-2xl bg-surface-container-high" />
            }
          >
            <AuthForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
