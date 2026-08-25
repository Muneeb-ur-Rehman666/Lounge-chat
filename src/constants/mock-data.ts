import type { Friend, FriendRequest, NotificationItem, User } from "@/types";

export const DEMO_USER: User = {
  id: "user_alex",
  displayName: "Alex Rivers",
  email: "alex@loungechat.app",
  avatarUrl: "/avatars/alex.svg",
  role: "registered",
  status: "online",
  bio: "Synthwave nights & lo-fi mornings.",
  isVerified: true,
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
};

export const GUEST_TEMPLATE: Omit<User, "id" | "displayName"> = {
  role: "guest",
  status: "online",
  isVerified: false,
  createdAt: new Date().toISOString(),
};

export const MOCK_FRIENDS: Friend[] = [
  {
    id: "friend_sarah",
    displayName: "Sarah J.",
    avatarUrl: "/avatars/sarah.svg",
    status: "online",
    isVerified: false,
    lastMessage: "Looking for a match...",
    lastActiveAt: new Date().toISOString(),
    preview: "Looking for a match...",
  },
  {
    id: "friend_marcus",
    displayName: "Marcus T.",
    avatarUrl: "/avatars/marcus.svg",
    status: "online",
    isVerified: true,
    lastMessage: "Haha, yeah that was crazy!",
    lastActiveAt: new Date(Date.now() - 2 * 60_000).toISOString(),
    preview: "Haha, yeah that was crazy!",
  },
  {
    id: "friend_elena",
    displayName: "Elena V.",
    avatarUrl: "/avatars/elena.svg",
    status: "away",
    isVerified: false,
    lastMessage: "Away",
    lastActiveAt: new Date(Date.now() - 60 * 60_000).toISOString(),
    preview: "Away",
  },
  {
    id: "friend_david",
    displayName: "David K.",
    status: "offline",
    isVerified: false,
    lastMessage: "Last seen 2 days ago",
    lastActiveAt: new Date(Date.now() - 2 * 24 * 60 * 60_000).toISOString(),
    preview: "Last seen 2 days ago",
  },
  {
    id: "friend_chloe",
    displayName: "Chloe M.",
    avatarUrl: "/avatars/chloe.svg",
    status: "offline",
    isVerified: false,
    lastMessage: "Last seen 1 week ago",
    lastActiveAt: new Date(Date.now() - 7 * 24 * 60 * 60_000).toISOString(),
    preview: "Last seen 1 week ago",
  },
];

export const MOCK_REQUESTS: FriendRequest[] = [
  {
    id: "req_1",
    from: {
      id: "friend_jordan",
      displayName: "Jordan P.",
      avatarUrl: "/avatars/jordan.svg",
      status: "online",
      isVerified: true,
      lastActiveAt: new Date().toISOString(),
    },
    toUserId: "user_alex",
    status: "pending",
    createdAt: new Date(Date.now() - 30 * 60_000).toISOString(),
  },
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_1",
    type: "friend_request",
    title: "New friend request",
    body: "Jordan P. wants to connect.",
    read: false,
    createdAt: new Date(Date.now() - 30 * 60_000).toISOString(),
    href: "/friends",
  },
  {
    id: "notif_2",
    type: "system",
    title: "Welcome to LoungeChat",
    body: "Your digital lounge is ready. Start a random chat anytime.",
    read: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60_000).toISOString(),
    href: "/chats",
  },
  {
    id: "notif_3",
    type: "premium",
    title: "Premium spotlight",
    body: "Unlock unlimited history and HD media sharing.",
    read: false,
    createdAt: new Date(Date.now() - 60 * 60_000).toISOString(),
    href: "/premium",
  },
];

export const STRANGER_REPLIES = [
  "Hey there! 👋",
  "I'm looking for some music recommendations, any genres you're into right now?",
  "Nice! Have you heard of The Midnight?",
  "That vibe is perfect for late-night chats.",
  "What's your favorite place to unwind?",
  "Ha, same here. LoungeChat feels different.",
];
