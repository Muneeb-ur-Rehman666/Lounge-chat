import { AppShell } from "@/components/layout/app-shell";
import { PremiumExperience } from "@/components/premium/premium-experience";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium",
  description: "Upgrade LoungeChat for unlimited history, HD media, and exclusive badges.",
};

export default function PremiumPage() {
  return (
    <AppShell>
      <PremiumExperience />
    </AppShell>
  );
}
