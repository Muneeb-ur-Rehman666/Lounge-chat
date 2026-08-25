export type UserRole = "guest" | "registered" | "premium";

export type PresenceStatus = "online" | "away" | "offline";

export type Gender = "male" | "female" | "other" | "prefer_not_to_say";

export type GenderPreference = "any" | "male" | "female";

export interface MatchPreferences {
  gender: GenderPreference;
  interestsEnabled: boolean;
}

export interface User {
  id: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  role: UserRole;
  status: PresenceStatus;
  bio?: string;
  gender?: Gender;
  interests?: string[];
  isVerified: boolean;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export type MessageType = "text" | "image" | "gif" | "system";

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  type: MessageType;
  content: string;
  mediaUrl?: string;
  createdAt: string;
  status: "sending" | "sent" | "delivered" | "read" | "failed";
}

export type ChatConnectionState =
  | "idle"
  | "searching"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "ended";

export interface StrangerPartner {
  id: string;
  displayName: string;
  gender: "male" | "female" | "other";
  interests: string[];
  isVerified: boolean;
  isGuest: boolean;
  status: PresenceStatus;
}

export interface ChatSession {
  id: string;
  partner: StrangerPartner;
  startedAt: string;
  messages: ChatMessage[];
  isPartnerTyping: boolean;
}

export interface Friend {
  id: string;
  displayName: string;
  avatarUrl?: string;
  status: PresenceStatus;
  isVerified: boolean;
  lastMessage?: string;
  lastActiveAt: string;
  preview?: string;
}

export type FriendRequestStatus = "pending" | "accepted" | "rejected";

export interface FriendRequest {
  id: string;
  from: Friend;
  toUserId: string;
  status: FriendRequestStatus;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: "friend_request" | "message" | "system" | "premium";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  href?: string;
}

export interface PremiumPlan {
  id: "guest" | "registered" | "premium";
  name: string;
  priceLabel: string;
  features: { label: string; included: boolean }[];
  cta: string;
  recommended?: boolean;
}

export interface CheckoutIntent {
  planId: "premium";
  amountCents: number;
  currency: string;
  status: "pending" | "succeeded" | "canceled" | "failed";
  clientSecret?: string;
}
