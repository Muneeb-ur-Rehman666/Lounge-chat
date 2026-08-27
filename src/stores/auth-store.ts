import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AuthSession, User } from "@/types";
import { GUEST_TEMPLATE } from "@/constants/mock-data";
import { uid } from "@/lib/utils";
import { createLazyLocalStorage } from "@/lib/lazy-local-storage";
import { authService } from "@/services/auth";

interface AuthState {
  session: AuthSession | null;

  continueAsGuest: () => void;

  signIn(
    email: string,
    password: string
  ): Promise<void>;

  signUp(data: {
    displayName: string;
    email: string;
    password: string;
  }): Promise<AuthSession | null>;

  verifyEmailOtp(
    email: string,
    token: string
  ): Promise<void>;

  resendVerificationEmail(
    email: string
  ): Promise<void>;

  signOut: () => void;

  upgradeToPremium: () => void;

  updateProfile: (
    patch: Partial<
      Pick<
        User,
        | "displayName"
        | "bio"
        | "avatarUrl"
        | "status"
        | "gender"
        | "interests"
      >
    >
  ) => void;

  isGuest: () => boolean;
  isRegistered: () => boolean;
  isPremium: () => boolean;
}

function makeGuestSession(): AuthSession {
  const user: User = {
    id: uid("guest"),
    displayName: `Guest ${Math.floor(Math.random() * 9000 + 1000)}`,
    ...GUEST_TEMPLATE,
    createdAt: new Date().toISOString(),
  };

  return {
    user,
    accessToken: `mock_guest_${uid("tok")}`,
    refreshToken: `mock_guest_${uid("tok")}`,
    expiresAt: Date.now() + 7 * 24 * 60 * 60_000,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,

      continueAsGuest: () => {
        set({
          session: makeGuestSession(),
        });
      },

      signIn: async (email, password) => {
        const session = await authService.signIn(
          email,
          password
        );

        set({
          session,
        });
      },

      signUp: async (data) => {
        const session = await authService.signUp(data);

        if (session) {
          set({
            session,
          });
        }

        return session;
      },

      verifyEmailOtp: async (email, token) => {
        const session = await authService.verifyEmailOtp(
          email,
          token
        );

        set({
          session,
        });
      },

      resendVerificationEmail: async (email) => {
        await authService.resendVerificationOtp(email);
      },

      signOut: () => {
        set({
          session: null,
        });
      },

      upgradeToPremium: () => {
        const session = get().session;

        if (!session) return;

        set({
          session: {
            ...session,
            user: {
              ...session.user,
              role: "premium",
              isVerified: true,
            },
            accessToken: `mock_premium_${uid("tok")}`,
          },
        });
      },

      updateProfile: (patch) => {
        const session = get().session;

        if (!session) return;

        set({
          session: {
            ...session,
            user: {
              ...session.user,
              ...patch,
            },
          },
        });
      },

      isGuest: () =>
        get().session?.user.role === "guest",

      isRegistered: () => {
        const role = get().session?.user.role;

        return (
          role === "registered" ||
          role === "premium"
        );
      },

      isPremium: () =>
        get().session?.user.role === "premium",
    }),

    {
      name: "loungechat-auth",

      storage: createLazyLocalStorage(),

      partialize: (state) => ({
        session: state.session,
      }),

      skipHydration: true,
    }
  )
);

