"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Crown, Sparkles, Filter } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PREMIUM_PLANS, paymentProvider } from "@/services/premium";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

export function PremiumExperience() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const isGuest = useAuthStore((s) => s.isGuest);
  const isPremium = useAuthStore((s) => s.isPremium);
  const upgradeToPremium = useAuthStore((s) => s.upgradeToPremium);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const role = session?.user.role ?? "guest";

  const handleCta = async (planId: string) => {
    if (planId === "guest") return;
    if (planId === "registered") {
      if (isGuest()) router.push("/auth?tab=signup");
      else toast.message("You're already registered.");
      return;
    }
    if (isPremium()) {
      toast.success("You're already on Premium.");
      return;
    }
    if (isGuest()) {
      toast.info("Create an account first, then upgrade.");
      router.push("/auth?tab=signup");
      return;
    }
    setBusy(true);
    try {
      const intent = await paymentProvider.createCheckoutIntent("premium");
      setClientSecret(intent.clientSecret ?? null);
      setCheckoutOpen(true);
    } catch {
      toast.error("Could not start checkout.");
    } finally {
      setBusy(false);
    }
  };

  const confirmPayment = async () => {
    if (!clientSecret) return;
    setBusy(true);
    try {
      await paymentProvider.confirmCheckout(clientSecret);
      upgradeToPremium();
      setCheckoutOpen(false);
      toast.success("Welcome to LoungeChat Premium!");
    } catch {
      toast.error("Payment failed (demo). Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 pb-24 md:p-8 md:pb-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="mesh-bg relative mb-14 overflow-hidden rounded-3xl px-6 py-14 text-center md:px-12 md:py-16">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-16 -top-10 size-64 rounded-full bg-premium-gold/20 blur-[80px]" />
            <div className="absolute -bottom-12 -left-10 size-56 rounded-full bg-magenta/20 blur-[70px]" />
          </div>
          <div className="relative z-10">
            <span className="glow-primary mb-6 inline-flex size-16 items-center justify-center rounded-2xl premium-btn-gradient shadow-lg">
              <Crown className="size-9 text-white" />
            </span>
            <h1 className="font-heading mb-4 text-4xl font-bold tracking-tight text-on-surface sm:text-5xl">
              Go{" "}
              <span className="premium-text-gradient">Premium</span>
            </h1>
            <p className="mx-auto mb-6 max-w-xl text-lg text-on-surface-variant">
              Unlock gender preference filters, unlimited history, HD media, and
              priority matching — the full lounge experience.
            </p>
            <div className="mx-auto flex max-w-lg flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-premium-gold/30 bg-premium-gold/10 px-4 py-2 text-sm font-semibold text-premium-gold">
                <Filter className="size-4" />
                Gender preference filters
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-magenta/30 bg-magenta/10 px-4 py-2 text-sm font-semibold text-magenta">
                <Sparkles className="size-4" />
                Priority matching
              </span>
            </div>
          </div>
        </div>

        <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PREMIUM_PLANS.map((plan, index) => {
            const isCurrent =
              (plan.id === "guest" && role === "guest") ||
              (plan.id === "registered" && role === "registered") ||
              (plan.id === "premium" && role === "premium");

            return (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col overflow-hidden rounded-3xl p-8",
                  plan.id === "guest" && "glass-panel",
                  plan.id === "registered" &&
                    "glass-panel shadow-lg md:-translate-y-2",
                  plan.recommended &&
                    "border-2 border-premium-gold/40 bg-surface-container-highest shadow-[0_0_40px_rgba(251,191,36,0.18)] md:-translate-y-4"
                )}
              >
                {plan.recommended && (
                  <div className="absolute right-0 top-0 rounded-bl-2xl premium-btn-gradient px-4 py-1.5 text-xs font-bold text-white">
                    BEST VALUE
                  </div>
                )}
                <div className="mb-6">
                  <h3
                    className={cn(
                      "font-heading mb-2 text-2xl font-semibold",
                      plan.id === "guest" && "text-on-surface-variant",
                      plan.id === "registered" && "text-primary",
                      plan.id === "premium" && "premium-text-gradient"
                    )}
                  >
                    {plan.name}
                  </h3>
                  <div className="text-3xl font-bold text-on-surface">
                    {plan.priceLabel.includes("/mo") ? (
                      <>
                        $9.99{" "}
                        <span className="text-base font-normal text-on-surface-variant">
                          /mo
                        </span>
                      </>
                    ) : plan.priceLabel.includes("w/") ? (
                      <>
                        Free{" "}
                        <span className="text-base font-normal text-on-surface-variant">
                          w/ Account
                        </span>
                      </>
                    ) : (
                      plan.priceLabel
                    )}
                  </div>
                </div>
                <ul className="mb-8 flex flex-1 flex-col gap-4">
                  {plan.features.map((f) => {
                    const isGenderPerk =
                      f.label.toLowerCase().includes("gender");
                    return (
                      <li
                        key={f.label}
                        className={cn(
                          "flex items-start gap-3",
                          !f.included && "opacity-50",
                          isGenderPerk &&
                            f.included &&
                            "rounded-xl border border-premium-gold/25 bg-premium-gold/10 px-3 py-2"
                        )}
                      >
                        {f.included ? (
                          <CheckCircle2
                            className={cn(
                              "mt-0.5 size-5 shrink-0",
                              isGenderPerk
                                ? "text-premium-gold"
                                : plan.id === "premium"
                                  ? "text-premium-gold"
                                  : plan.id === "registered"
                                    ? "text-primary"
                                    : "text-outline"
                            )}
                          />
                        ) : (
                          <XCircle className="mt-0.5 size-5 shrink-0 text-outline" />
                        )}
                        <span
                          className={cn(
                            "text-base",
                            f.included
                              ? isGenderPerk
                                ? "font-semibold text-premium-gold"
                                : "text-on-surface"
                              : "text-on-surface-variant"
                          )}
                        >
                          {f.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <Button
                  disabled={busy || (isCurrent && plan.id !== "premium")}
                  onClick={() => handleCta(plan.id)}
                  className={cn(
                    "w-full rounded-2xl py-3 font-medium",
                    plan.recommended
                      ? "premium-btn-gradient py-4 text-lg font-bold text-white hover:opacity-90"
                      : plan.id === "registered"
                        ? ""
                        : "border border-outline-variant bg-transparent text-on-surface-variant"
                  )}
                  variant={
                    plan.recommended
                      ? undefined
                      : plan.id === "registered"
                        ? "outline"
                        : "ghost"
                  }
                >
                  {isCurrent
                    ? plan.id === "premium"
                      ? "Active plan"
                      : "Current Plan"
                    : plan.cta}
                </Button>
                {index === 2 && (
                  <p className="mt-3 text-center text-xs text-on-surface-variant">
                    Demo checkout — Stripe-ready interface
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="glass-panel border-outline-variant/40 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <Crown className="size-5 text-premium-gold" />
              Upgrade to Premium
            </DialogTitle>
            <DialogDescription>
              Unlock gender preference filters and more. Demo payment — in
              production this connects via{" "}
              <code className="text-primary">paymentProvider</code>.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-2xl border border-premium-gold/25 bg-premium-gold/5 p-4 text-sm">
            <div className="mb-2 flex justify-between">
              <span className="font-medium">LoungeChat Premium</span>
              <span className="font-semibold premium-text-gradient">
                $9.99 / mo
              </span>
            </div>
            <ul className="mb-2 space-y-1 text-xs text-on-surface-variant">
              <li className="font-semibold text-premium-gold">
                ✓ Gender preference filters
              </li>
              <li>✓ Unlimited history · HD media · Priority access</li>
            </ul>
            <p className="text-xs text-on-surface-variant">
              Intent: {clientSecret?.slice(0, 18)}…
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setCheckoutOpen(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={busy}
              className="premium-btn-gradient rounded-xl font-bold text-white"
              onClick={confirmPayment}
            >
              {busy ? "Processing…" : "Confirm payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
