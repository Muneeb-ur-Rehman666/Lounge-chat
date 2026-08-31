"use client";

import { useQuery } from "@tanstack/react-query";
import { useFriendsStore } from "@/stores/friends-store";
import { useAuthStore } from "@/stores/auth-store";

async function fetchFriendsSnapshot() {
  // Simulate API latency — ready to swap for real GET /friends
  await new Promise((r) => setTimeout(r, 250));
  const state = useFriendsStore.getState();
  return {
    friends: state.friends,
    requests: state.requests,
    notifications: state.notifications,
  };
}

export function useFriendsQuery() {
  const isGuest = useAuthStore((s) => s.isGuest);
  const friends = useFriendsStore((s) => s.friends);
  const requests = useFriendsStore((s) => s.requests);

  const query = useQuery({
    queryKey: ["friends", friends.length, requests.length],
    queryFn: fetchFriendsSnapshot,
    enabled: !isGuest(),
    staleTime: 15_000,
  });

  const guest = isGuest();

  return {
    ...query,

    friends: guest
      ? []
      : query.data?.friends ??
      friends,

    requests: guest
      ? []
      : query.data?.requests ??
      requests,

    isGuest: guest,
  };
}
