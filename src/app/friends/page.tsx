import { AppShell } from "@/components/layout/app-shell";
import { FriendsExperience } from "@/components/friends/friends-experience";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Friends",
};

export default function FriendsPage() {
  return (
    <AppShell>
      <FriendsExperience />
    </AppShell>
  );
}
