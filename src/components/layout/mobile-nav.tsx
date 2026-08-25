"use client";

import { usePathname, useRouter } from "next/navigation";
import { MOBILE_NAV } from "@/constants/nav";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const isGuest = useAuthStore((s) => s.isGuest);

  return (
    <nav
      className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around border-t border-outline-variant/30 bg-surface-container-lowest/95 px-2 backdrop-blur-2xl lg:hidden"
      aria-label="Mobile"
    >
      {MOBILE_NAV.map((item) => {
        const active = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <button
            key={item.href}
            type="button"
            onClick={() => {
              if (item.guestGated && isGuest()) {
                toast.info("Create an account to use Friends.");
                router.push("/auth?tab=signup");
                return;
              }
              router.push(item.href);
            }}
            className={cn(
              "relative flex w-16 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-all",
              active
                ? "scale-105 font-bold text-magenta"
                : "text-on-surface-variant"
            )}
          >
            {active && (
              <span
                className="absolute -top-0.5 size-1 rounded-full bg-magenta shadow-[0_0_8px_rgba(255,78,205,0.8)]"
                aria-hidden
              />
            )}
            <Icon
              className={cn("size-5 transition-colors", active && "fill-current")}
              aria-hidden
            />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
