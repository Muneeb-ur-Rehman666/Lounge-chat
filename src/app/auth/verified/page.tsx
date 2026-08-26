"use client";

import { CheckCircle2, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function EmailVerifiedPage() {
  return (
    <div className="mesh-bg relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-5%] top-[10%] size-[400px] rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute bottom-[5%] left-[-5%] size-[320px] rounded-full bg-magenta/15 blur-[90px]" />
      </div>

      <div className="glass-panel relative z-10 w-full max-w-md rounded-3xl p-8 text-center md:p-10">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-secondary/15">
          <CheckCircle2 className="size-8 text-secondary" />
        </div>

        <h1 className="font-heading text-2xl font-bold tracking-tight text-on-surface">
          Email verified! 🎉
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
          Your LoungeChat email has been successfully verified.
          You&apos;re all set to start chatting.
        </p>

        <p className="mt-2 text-xs leading-relaxed text-on-surface-variant/70">
          You can return to the device where you signed up. It will
          automatically continue to LoungeChat.
        </p>

        <Button
          className="mt-6 h-12 w-full rounded-2xl"
          onClick={() => {
            window.location.href = "/chats";
          }}
        >
          <MessageCircle className="size-4" />
          Continue to LoungeChat
        </Button>
      </div>
    </div>
  );
}