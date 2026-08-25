"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ChatSkeleton() {
  return (
    <div
      className="mesh-bg flex h-full flex-col"
      aria-busy="true"
      aria-label="Loading chat"
    >
      <div className="glass-panel flex h-20 items-center justify-between border-b border-outline-variant/20 px-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-12 rounded-full bg-primary/15" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-36 rounded-full bg-surface-container-high" />
            <Skeleton className="h-3 w-24 rounded-full bg-surface-container-high" />
          </div>
        </div>
        <div className="hidden gap-2 md:flex">
          <Skeleton className="h-9 w-24 rounded-full bg-surface-container-high" />
          <Skeleton className="h-9 w-28 rounded-full bg-surface-container-high" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <Skeleton className="mx-auto h-7 w-64 rounded-full bg-surface-container-high/80" />
        <Skeleton className="h-12 w-2/3 rounded-2xl bg-surface-container-high/90" />
        <Skeleton className="ml-auto h-16 w-1/2 rounded-2xl bg-primary/20" />
        <Skeleton className="h-10 w-1/2 rounded-2xl bg-surface-container-high/90" />
        <Skeleton className="ml-auto h-12 w-2/5 rounded-2xl bg-magenta/15" />
      </div>
    </div>
  );
}

export function FriendsListSkeleton() {
  return (
    <div
      className="flex flex-col gap-3 p-4"
      aria-busy="true"
      aria-label="Loading friends"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-2xl p-2"
        >
          <Skeleton className="size-12 rounded-full bg-primary/15" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-1/2 rounded-full bg-surface-container-high" />
            <Skeleton className="h-3 w-3/4 rounded-full bg-surface-container-high/80" />
          </div>
        </div>
      ))}
    </div>
  );
}
