import { AppShell } from "@/components/layout/app-shell";
import { ChatExperience } from "@/components/chat/chat-experience";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chats",
};

export default function ChatsPage() {
  return (
    <AppShell>
      <ChatExperience />
    </AppShell>
  );
}
