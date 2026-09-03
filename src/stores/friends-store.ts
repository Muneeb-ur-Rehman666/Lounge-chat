import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Friend, FriendRequest, NotificationItem } from "@/types";
import { MOCK_FRIENDS, MOCK_NOTIFICATIONS, MOCK_REQUESTS } from "@/constants/mock-data";
import { createLazyLocalStorage } from "@/lib/lazy-local-storage";
import { uid } from "@/lib/utils";



export interface DirectMessage {
  id: string;
  mine: boolean;
  content: string;
  at: string;
}

interface FriendsState {
  friends: Friend[];
  requests: FriendRequest[];
  notifications: NotificationItem[];
  directMessages: Record<string, DirectMessage[]>;
  selectedFriendId: string | null;
  selectFriend: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  acceptRequest: (id: string) => void;
  rejectRequest: (id: string) => void;
  removeFriend: (id: string) => void;
  sendFriendRequest: (username: string) => Promise<void>;
  sendDirectMessage: (friendId: string, content: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearFriendsData: () => void;
  resetToMockData: () => void;
}

export const useFriendsStore = create<FriendsState>()(
  persist(
    (set, get) => ({
      clearFriendsData: () => {
        set({
          friends: [],
          requests: [],
          notifications: [],
          selectedFriendId: null,
          searchQuery: "",
        });
      },
      resetToMockData: () => {
        set({
          friends: MOCK_FRIENDS,
          requests: MOCK_REQUESTS,
          notifications: MOCK_NOTIFICATIONS,
          selectedFriendId: null,
          searchQuery: "",
        });
      },
      
      friends: MOCK_FRIENDS,
      requests: MOCK_REQUESTS,
      notifications: MOCK_NOTIFICATIONS,
      directMessages: {},
      selectedFriendId: null,
      searchQuery: "",
      selectFriend: (id) => set({ selectedFriendId: id }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      acceptRequest: (id) => {
        const req = get().requests.find((r) => r.id === id);
        if (!req) return;
        set({
          requests: get().requests.filter((r) => r.id !== id),
          friends: [
            {
              ...req.from,
              status: "online",
              lastMessage: "You are now friends",
              lastActiveAt: new Date().toISOString(),
              preview: "You are now friends",
            },
            ...get().friends,
          ],
          notifications: get().notifications.map((n) =>
            n.type === "friend_request" && n.body.includes(req.from.displayName)
              ? { ...n, read: true }
              : n
          ),
        });
      },
      rejectRequest: (id) => {
        set({ requests: get().requests.filter((r) => r.id !== id) });
      },
      removeFriend: (id) => {
        set({
          friends: get().friends.filter((f) => f.id !== id),
          selectedFriendId:
            get().selectedFriendId === id ? null : get().selectedFriendId,
        });
      },
      sendFriendRequest: async (username) => {
        await new Promise((r) => setTimeout(r, 600));
        const name = username.trim();
        set({
          notifications: [
            {
              id: uid("notif"),
              type: "system",
              title: "Friend request sent",
              body: `Request sent to ${name}.`,
              read: false,
              createdAt: new Date().toISOString(),
              href: "/friends",
            },
            ...get().notifications,
          ],
        });
      },
      sendDirectMessage: (friendId, content) => {
        const text = content.trim();
        if (!text) return;
        const msg: DirectMessage = {
          id: uid("fm"),
          mine: true,
          content: text,
          at: new Date().toISOString(),
        };
        const current = get().directMessages[friendId] ?? [];
        set({
          directMessages: {
            ...get().directMessages,
            [friendId]: [...current, msg],
          },
          friends: get().friends.map((f) =>
            f.id === friendId
              ? {
                  ...f,
                  lastMessage: text,
                  lastActiveAt: new Date().toISOString(),
                  preview: text,
                }
              : f
          ),
        });
      },
      markNotificationRead: (id) => {
        set({
          notifications: get().notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        });
      },
      markAllNotificationsRead: () => {
        set({
          notifications: get().notifications.map((n) => ({ ...n, read: true })),
        });
      },
    }),
    {
      name: "loungechat-friends",
      storage: createLazyLocalStorage(),
      
      partialize: (state) => ({
        friends: state.friends,
        requests: state.requests,
        notifications: state.notifications,
        directMessages: state.directMessages,
      }),
      skipHydration: true,
    }
  )
);
