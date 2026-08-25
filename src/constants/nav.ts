import {
  Bell,
  MessageSquare,
  Settings,
  Users,
  Crown,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  premiumAccent?: boolean;
  guestGated?: boolean;
}

export const APP_NAV: NavItem[] = [
  { href: "/chats", label: "Chats", icon: MessageSquare },
  { href: "/friends", label: "Friends", icon: Users, guestGated: true },
  { href: "/notifications", label: "Notifications", icon: Bell, guestGated: true },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/premium", label: "Premium", icon: Crown, premiumAccent: true },
];

export const MOBILE_NAV: NavItem[] = [
  { href: "/chats", label: "Chats", icon: MessageSquare },
  { href: "/friends", label: "Friends", icon: Users, guestGated: true },
  { href: "/premium", label: "Premium", icon: Crown, premiumAccent: true },
  { href: "/profile", label: "Profile", icon: User },
];

export const MARKETING_NAV = [
  { href: "/safety", label: "Safety" },
  { href: "/community", label: "Community" },
  { href: "/premium", label: "Premium" },
] as const;
