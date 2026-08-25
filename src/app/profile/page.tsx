import { AppShell } from "@/components/layout/app-shell";
import { ProfileExperience } from "@/components/profile/profile-experience";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <AppShell>
      <ProfileExperience />
    </AppShell>
  );
}
