import { AppShell } from "@/components/layout/app-shell";
import { NotificationsExperience } from "@/components/notifications/notifications-experience";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return (
    <AppShell>
      <NotificationsExperience />
    </AppShell>
  );
}
