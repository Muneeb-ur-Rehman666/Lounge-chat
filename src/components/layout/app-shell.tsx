"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SideNav } from "@/components/layout/side-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { BrandLogo } from "@/components/shared/brand-logo";
import { useAuthStore } from "@/stores/auth-store";
import { useAuthHydration } from "@/hooks/use-auth-hydration";
import { Skeleton } from "@/components/ui/skeleton";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const hydrated = useAuthHydration();

  useEffect(() => {
    if (hydrated && !session) {
      router.replace("/auth");
    }
  }, [hydrated, session, router]);

  if (!hydrated) {
    return (
      <div className="mesh-bg flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <BrandLogo href="/chats" />
          <Skeleton className="h-2 w-40 rounded-full bg-primary/30" />
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-surface">
      <SideNav />
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col lg:ml-72">
        <header className="sticky top-0 z-40 flex h-14 items-center border-b border-outline-variant/25 bg-surface-container/50 px-4 backdrop-blur-md lg:hidden">
          <BrandLogo href="/chats" size="sm" />
        </header>
        <main className="min-h-0 flex-1 overflow-hidden pb-16 lg:pb-0">
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
