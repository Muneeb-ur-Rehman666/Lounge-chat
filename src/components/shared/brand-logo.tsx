import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandLogo({
  href = "/",
  size = "md",
  className,
}: {
  href?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-[28px]",
  };

  const iconSizes = {
    sm: "size-7",
    md: "size-8",
    lg: "size-9",
  };

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 tracking-tight text-on-surface transition-opacity hover:opacity-90",
        sizes[size],
        className
      )}
    >
      <span
        className={cn(
          "glow-primary flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-magenta to-secondary text-white",
          iconSizes[size]
        )}
      >
        <MessageCircle className="size-[55%] fill-current" aria-hidden />
      </span>
      <span className="font-logo text-gradient font-normal">LoungeChat</span>
    </Link>
  );
}
