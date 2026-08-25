import Link from "next/link";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Button } from "@/components/ui/button";
import { MARKETING_NAV } from "@/constants/nav";

export function MarketingHeader() {
  return (
    <header className="glass-panel fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-outline-variant/25 px-6">
      <BrandLogo />
      <nav className="hidden items-center gap-6 md:flex" aria-label="Marketing">
        {MARKETING_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm font-medium text-on-surface-variant transition-colors hover:text-magenta"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          render={<Link href="/auth" />}
          className="text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
        >
          Log In
        </Button>
        <Button
          render={<Link href="/auth?tab=signup" />}
          className="rounded-full bg-gradient-to-r from-primary to-magenta font-semibold text-white shadow-[0_0_20px_rgba(232,121,249,0.35)] hover:opacity-90"
        >
          Sign Up
        </Button>
      </div>
    </header>
  );
}
