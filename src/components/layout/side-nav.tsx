"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Crown } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { StatusDot } from "@/components/shared/status-dot";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { APP_NAV } from "@/constants/nav";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function SideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const signOut = useAuthStore((s) => s.signOut);
  const isGuest = useAuthStore((s) => s.isGuest);
  const isPremium = useAuthStore((s) => s.isPremium);
  const user = session?.user;

  const handleNav = (href: string) => {
    router.push(href);
  };;

  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-full w-72 flex-col justify-between border-r border-outline-variant/40 bg-sidebar/90 py-6 backdrop-blur-xl lg:flex">
      <div>
        <div className="mb-8 px-6">
          <BrandLogo href="/chats" size="lg" />
        </div>

        {user && (
          <div className="mb-6 px-6">
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="flex w-full items-center gap-3 rounded-2xl border border-outline-variant/25 bg-surface-container-high/80 p-3 text-left transition-all hover:border-primary/30 hover:bg-surface-bright/60 hover:shadow-[0_0_24px_rgba(168,85,247,0.12)]"
            >
              <div className="relative">
                <Avatar className="size-12 ring-2 ring-primary/40">
                  <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/40 to-magenta/40 font-semibold text-on-surface">
                    {user.displayName.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <StatusDot
                  status={user.status}
                  className="absolute bottom-0 right-0"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate font-heading text-sm font-semibold text-on-surface">
                  {user.displayName}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-secondary">
                  {user.role === "premium" ? (
                    <>
                      <Crown className="size-3 text-premium-gold" aria-hidden />
                      <span className="premium-text-gradient font-medium">
                        Premium
                      </span>
                    </>
                  ) : user.role === "guest" ? (
                    "Guest"
                  ) : (
                    "Online"
                  )}
                </p>
              </div>
            </button>
          </div>
        )}

        <nav className="flex flex-col gap-1 px-3" aria-label="Main">
          {APP_NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => handleNav(item.href)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all active:scale-[0.98]",
                  active
                    ? "nav-active-pill text-on-surface"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                  item.premiumAccent &&
                  !active &&
                  "text-premium-gold hover:text-premium-gold"
                )}
              >
                <Icon
                  className={cn(
                    "size-5",
                    active && "text-magenta",
                    item.premiumAccent && !active && "text-premium-gold"
                  )}
                  aria-hidden
                />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-3 px-3">
        {!isPremium() && !isGuest() && (
          <Button
            render={<Link href="/premium" />}
            className="mx-3 rounded-full premium-btn-gradient font-bold text-background shadow-[0_4px_24px_rgba(255,78,205,0.35)] hover:opacity-90 hover:shadow-[0_6px_32px_rgba(255,78,205,0.45)]"
          >
            <Crown className="size-4" aria-hidden />
            Upgrade to Premium
          </Button>
        )}
        <button
          type="button"
          onClick={async () => {
            try {
              await signOut();
              toast.success("You have been logged out.");
              router.replace("/");
            } catch (error) {
              console.error(
                "LOGOUT ERROR:",
                error
              );

              toast.error(
                error instanceof Error
                  ? error.message
                  : "Could not log out. Please try again."
              );
            }
          }}
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
        >
          <LogOut className="size-5" aria-hidden />
          Logout
        </button>
      </div>
    </aside>
  );
}
