import { AppShell } from "@/components/layout/app-shell";
import { SettingsExperience } from "@/components/settings/settings-experience";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <AppShell>
      <SettingsExperience />
    </AppShell>
  );
}
