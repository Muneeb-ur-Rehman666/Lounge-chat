import type { CheckoutIntent, PremiumPlan } from "@/types";
import { delay, uid } from "@/lib/utils";

export const PREMIUM_PLANS: PremiumPlan[] = [
  {
    id: "guest",
    name: "Guest",
    priceLabel: "Free",
    cta: "Current Plan",
    features: [
      { label: "Anonymous Chatting", included: true },
      { label: "Text Messages", included: true },
      { label: "No Chat History", included: false },
      { label: "No Media Sharing", included: false },
    ],
  },
  {
    id: "registered",
    name: "Registered",
    priceLabel: "Free w/ Account",
    cta: "Sign Up Free",
    features: [
      { label: "Verified Badge", included: true },
      { label: "Save Friends List", included: true },
      { label: "Basic Chat History (30 Days)", included: true },
      { label: "Limited Media Sharing", included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    priceLabel: "$9.99 /mo",
    cta: "Upgrade Now",
    recommended: true,
    features: [
      { label: "Gender preference filters", included: true },
      { label: "Unlimited Chat History", included: true },
      { label: "HD Media & File Sharing", included: true },
      { label: "Exclusive Profile Badges", included: true },
      { label: "Priority Lounge Access", included: true },
      { label: "Ad-Free Experience", included: true },
    ],
  },
];

/** Payment provider abstraction — swap implementation for Stripe later */
export interface PaymentProvider {
  createCheckoutIntent(planId: "premium"): Promise<CheckoutIntent>;
  confirmCheckout(intentId: string): Promise<CheckoutIntent>;
}

class MockPaymentProvider implements PaymentProvider {
  private intents = new Map<string, CheckoutIntent>();

  async createCheckoutIntent(): Promise<CheckoutIntent> {
    await delay(700);
    const intent: CheckoutIntent = {
      planId: "premium",
      amountCents: 999,
      currency: "usd",
      status: "pending",
      clientSecret: uid("cs"),
    };
    this.intents.set(intent.clientSecret!, intent);
    return intent;
  }

  async confirmCheckout(clientSecret: string): Promise<CheckoutIntent> {
    await delay(1200);
    const existing = this.intents.get(clientSecret);
    const intent: CheckoutIntent = {
      ...(existing ?? {
        planId: "premium",
        amountCents: 999,
        currency: "usd",
      }),
      status: "succeeded",
      clientSecret,
    };
    this.intents.set(clientSecret, intent);
    return intent;
  }
}

export const paymentProvider: PaymentProvider = new MockPaymentProvider();
