"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BadgeCheck,
  Check,
  Search,
  Shuffle,
  UserPlus,
  X,
  MoreVertical,
  UserMinus,
  Users,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusDot } from "@/components/shared/status-dot";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFriendsStore } from "@/stores/friends-store";
import { useChatStore } from "@/stores/chat-store";
import { useAuthStore } from "@/stores/auth-store";
import { useFriendsQuery } from "@/features/friends/use-friends-query";
import { addFriendSchema, type AddFriendValues } from "@/lib/validators";
import { cn, formatRelative } from "@/lib/utils";
import type { Friend } from "@/types";
import { FriendChatPanel } from "@/components/friends/friend-chat-panel";
import { Skeleton } from "@/components/ui/skeleton";

export function FriendsExperience() {
  const router = useRouter();
  const isGuest = useAuthStore((s) => s.isGuest);
  const {
    friends,
    requests,
    isLoading: friendsLoading,
  } = useFriendsQuery();
  const searchQuery = useFriendsStore((s) => s.searchQuery);
  const setSearchQuery = useFriendsStore((s) => s.setSearchQuery);
  const selectedFriendId = useFriendsStore((s) => s.selectedFriendId);
  const selectFriend = useFriendsStore((s) => s.selectFriend);
  const acceptRequest = useFriendsStore((s) => s.acceptRequest);
  const rejectRequest = useFriendsStore((s) => s.rejectRequest);
  const removeFriend = useFriendsStore((s) => s.removeFriend);
  const sendFriendRequest = useFriendsStore((s) => s.sendFriendRequest);
  const startMatchmaking = useChatStore((s) => s.startMatchmaking);
  const endChat = useChatStore((s) => s.endChat);

  const [addOpen, setAddOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const form = useForm<AddFriendValues>({
    resolver: zodResolver(addFriendSchema),
    defaultValues: { username: "" },
  });

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter((f) => f.displayName.toLowerCase().includes(q));
  }, [friends, searchQuery]);

  const online = filtered.filter((f) => f.status === "online" || f.status === "away");
  const offline = filtered.filter((f) => f.status === "offline");
  const selected = friends.find((f) => f.id === selectedFriendId) ?? null;

  if (isGuest()) {
    return (
      <div className="mesh-bg flex h-full flex-col items-center justify-center gap-5 p-8 text-center">
        <div className="glow-primary flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-magenta">
          <Users className="size-8 text-white" />
        </div>
        <h1 className="font-heading text-2xl font-bold">Friends are for members</h1>
        <p className="max-w-md text-on-surface-variant">
          Create a free account to save friends, accept requests, and keep the
          conversation going beyond one stranger chat.
        </p>
        <Button render={<Link href="/auth?tab=signup" />} className="rounded-2xl">
          Sign up free
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <section className="flex w-full flex-col border-r border-outline-variant/25 bg-surface lg:w-96">
        <div className="glass-panel sticky top-0 z-20 flex items-center justify-between border-b border-outline-variant/20 p-5 pb-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-on-surface">
              Friends
            </h2>
            <p className="text-xs text-on-surface-variant">Your crew, one tap away</p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="size-10 rounded-full bg-primary/15 text-primary hover:bg-primary/25"
            onClick={() => setAddOpen(true)}
            aria-label="Add friend"
          >
            <UserPlus className="size-5" />
          </Button>
        </div>

        <div className="px-5 py-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-on-surface-variant" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search friends..."
              className="rounded-2xl border-outline-variant/30 bg-surface-container py-2.5 pl-11"
              aria-label="Search friends"
            />
          </div>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto px-3 pb-6">
          {friendsLoading ? (
            <div
              className="flex flex-col gap-3 p-3"
              aria-busy="true"
              aria-label="Loading friends"
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-2">
                  <Skeleton className="size-12 rounded-full bg-surface-container-high" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-3 w-28 rounded-full bg-surface-container-high" />
                    <Skeleton className="h-3 w-40 rounded-full bg-surface-container-high" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {requests.length > 0 && (
                <>
                  <div className="mt-2 px-3 py-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-magenta">
                      Requests ({requests.length})
                    </span>
                  </div>
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center gap-3 rounded-2xl p-3 hover:bg-surface-container"
                    >
                      <Avatar className="size-12 ring-2 ring-primary/20">
                        <AvatarImage src={req.from.avatarUrl} alt="" />
                        <AvatarFallback>{req.from.displayName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">
                          {req.from.displayName}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          Wants to be friends
                        </p>
                      </div>
                      <Button
                        size="icon-sm"
                        className="rounded-full"
                        onClick={() => {
                          acceptRequest(req.id);
                          toast.success(
                            `You are now friends with ${req.from.displayName}`
                          );
                        }}
                        aria-label="Accept"
                      >
                        <Check className="size-4" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="rounded-full"
                        onClick={() => rejectRequest(req.id)}
                        aria-label="Reject"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ))}
                </>
              )}

              {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
                  <Sparkles className="size-8 text-primary/60" />
                  <p className="text-sm text-on-surface-variant">
                    {searchQuery
                      ? "No friends match your search."
                      : "No friends yet. Send a request and build your crew."}
                  </p>
                </div>
              ) : (
                <>
                  {online.length > 0 && (
                    <>
                      <div className="mt-2 px-3 py-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                          Online ({online.length})
                        </span>
                      </div>
                      {online.map((friend) => (
                        <FriendRow
                          key={friend.id}
                          friend={friend}
                          active={selectedFriendId === friend.id}
                          onSelect={() => selectFriend(friend.id)}
                          onRemove={() => {
                            removeFriend(friend.id);
                            toast.message(`${friend.displayName} removed`);
                          }}
                        />
                      ))}
                    </>
                  )}
                  {offline.length > 0 && (
                    <>
                      <div className="mt-4 px-3 py-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                          Offline ({offline.length})
                        </span>
                      </div>
                      {offline.map((friend) => (
                        <FriendRow
                          key={friend.id}
                          friend={friend}
                          active={selectedFriendId === friend.id}
                          dimmed
                          onSelect={() => selectFriend(friend.id)}
                          onRemove={() => {
                            removeFriend(friend.id);
                            toast.message(`${friend.displayName} removed`);
                          }}
                        />
                      ))}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </section>

      <main className="relative hidden flex-1 overflow-hidden lg:flex">
        {selected ? (
          <FriendChatPanel
            key={selected.id}
            friend={selected}
            onBack={() => selectFriend(null)}
          />
        ) : (
          <div className="mesh-bg relative flex flex-1 flex-col items-center justify-center overflow-hidden p-8">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -right-[10%] -top-[20%] size-[500px] rounded-full bg-primary/15 blur-[100px]" />
              <div className="absolute -bottom-[20%] -left-[10%] size-[420px] rounded-full bg-magenta/10 blur-[100px]" />
            </div>
            <div className="relative z-10 flex max-w-md flex-col items-center text-center">
              <div className="glow-primary mb-8 flex size-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary via-magenta to-secondary">
                <Users className="size-12 text-white" />
              </div>
              <h2 className="font-heading mb-3 text-3xl font-bold tracking-tight text-on-surface">
                Pick a friend
              </h2>
              <p className="mb-8 max-w-[85%] text-lg leading-relaxed text-on-surface-variant">
                Select someone from your list to keep chatting — or dive into a
                fresh stranger match.
              </p>
              <Button
                size="lg"
                className="rounded-2xl px-8 py-6 text-base"
                onClick={() => {
                  endChat();
                  void startMatchmaking();
                  router.push("/chats");
                }}
              >
                <Shuffle className="size-5" />
                Start a random chat
              </Button>
            </div>
          </div>
        )}
      </main>

      {selected && (
        <div className="fixed inset-0 z-50 bg-background lg:hidden">
          <FriendChatPanel
            key={`mobile_${selected.id}`}
            friend={selected}
            onBack={() => selectFriend(null)}
          />
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="glass-panel border-outline-variant/40 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-heading">Add a friend</DialogTitle>
            <DialogDescription>
              Search by display name or email to send a friend request.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              setSending(true);
              await sendFriendRequest(values.username);
              setSending(false);
              setAddOpen(false);
              form.reset();
              toast.success("Friend request sent");
            })}
            className="flex flex-col gap-4"
          >
            <Input
              placeholder="Username or email"
              className="h-11 rounded-2xl"
              {...form.register("username")}
            />
            {form.formState.errors.username && (
              <p className="text-xs text-destructive">
                {form.formState.errors.username.message}
              </p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setAddOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={sending} className="rounded-xl">
                {sending ? "Sending…" : "Send request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FriendRow({
  friend,
  active,
  dimmed,
  onSelect,
  onRemove,
}: {
  friend: Friend;
  active?: boolean;
  dimmed?: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={cn(
        "group flex items-center gap-4 rounded-2xl p-3 transition-colors hover:bg-surface-container",
        active && "nav-active-pill",
        dimmed && "opacity-60"
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-4 text-left"
      >
        <div className="relative">
          {friend.avatarUrl ? (
            <Avatar className={cn("size-12 ring-2 ring-primary/15", dimmed && "grayscale")}>
              <AvatarImage src={friend.avatarUrl} alt="" />
              <AvatarFallback>{friend.displayName[0]}</AvatarFallback>
            </Avatar>
          ) : (
            <div className="flex size-12 items-center justify-center rounded-full border border-outline-variant/20 bg-surface-container-highest text-lg font-semibold text-on-surface-variant">
              {friend.displayName[0]}
            </div>
          )}
          {friend.status !== "offline" && (
            <StatusDot
              status={friend.status}
              className="absolute bottom-0 right-0 size-3.5 border-[2.5px]"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-1 truncate text-sm font-bold text-on-surface">
              {friend.displayName}
              {friend.isVerified && (
                <BadgeCheck
                  className="size-3.5 text-primary"
                  aria-label="Verified"
                />
              )}
            </h3>
            <span className="shrink-0 text-[11px] text-on-surface-variant">
              {formatRelative(friend.lastActiveAt)}
            </span>
          </div>
          <p
            className={cn(
              "truncate text-[13px]",
              friend.status === "online" && friend.preview?.includes("Looking")
                ? "text-primary opacity-80"
                : "text-on-surface-variant",
              friend.status === "away" && "italic opacity-60"
            )}
          >
            {friend.preview}
          </p>
        </div>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="rounded-xl p-1.5 opacity-0 transition-opacity hover:bg-surface-container-high group-hover:opacity-100"
          aria-label="Friend options"
        >
          <MoreVertical className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="border-outline-variant/40 bg-surface-container"
        >
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={onSelect}>Open chat</DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={onRemove}>
              <UserMinus className="size-4" /> Remove friend
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
