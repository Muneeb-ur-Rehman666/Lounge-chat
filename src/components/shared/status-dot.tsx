import { cn } from "@/lib/utils";
import type { PresenceStatus } from "@/types";

const colors: Record<PresenceStatus, string> = {
  online: "bg-cyan-pulse shadow-[0_0_10px_rgba(34,211,238,0.7)]",
  away: "bg-premium-gold shadow-[0_0_8px_rgba(251,191,36,0.5)]",
  offline: "bg-outline",
};

export function StatusDot({
  status,
  className,
}: {
  status: PresenceStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block size-2.5 rounded-full border-2 border-surface-container",
        colors[status],
        className
      )}
      aria-hidden
    />
  );
}
