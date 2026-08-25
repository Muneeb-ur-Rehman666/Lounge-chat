import Link from "next/link";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mesh-bg-animated relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden px-6 text-center">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[15%] top-[20%] size-[300px] rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute bottom-[15%] left-[10%] size-[260px] rounded-full bg-magenta/15 blur-[90px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        <BrandLogo />
        <p className="font-heading text-8xl font-bold text-gradient opacity-80">
          404
        </p>
        <h1 className="font-heading text-3xl font-bold text-on-surface">
          Lost in the lounge?
        </h1>
        <p className="max-w-md text-on-surface-variant">
          This corner doesn&apos;t exist. Head home or jump into a chat — the
          vibes are still waiting.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button render={<Link href="/" />} className="rounded-2xl">
            Home
          </Button>
          <Button
            render={<Link href="/chats" />}
            variant="outline"
            className="rounded-2xl"
          >
            Open chats
          </Button>
        </div>
      </div>
    </div>
  );
}
