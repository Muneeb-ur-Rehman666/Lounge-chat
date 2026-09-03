import { create } from "zustand";

import { persist } from "zustand/middleware";

import type {
  Session as SupabaseSession,
} from "@supabase/supabase-js";

import type {
  AuthSession,
  User,
} from "@/types";

import { GUEST_TEMPLATE } from "@/constants/mock-data";

import { uid } from "@/lib/utils";

import {
  createLazyLocalStorage,
} from "@/lib/lazy-local-storage";

import {
  authService,
} from "@/services/auth";


interface AuthState {
  session: AuthSession | null;
  intentionalSignOut: boolean;
  isSigningOut: boolean;
  sessionExpired: boolean;
  authInitialized: boolean;

  continueAsGuest(): void;

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

  signOut(): Promise<void>;

  setSigningOut: (
    signingOut: boolean
  ) => void;

  clearSessionExpired(): void;
  resetIntentionalSignOut: () => void;

  syncSupabaseSession(
    session: SupabaseSession
  ): Promise<void>;

  clearSupabaseSession: (
    reason?: "initial" | "signout" | "expired"
  ) => void;

  setAuthInitialized(
    initialized: boolean
  ): void;

  updateSupabaseTokens(
    session: SupabaseSession
  ): void;

  upgradeToPremium(): void;

  updateProfile(
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
  ): void;



  isGuest(): boolean;

  isRegistered(): boolean;

  isPremium(): boolean;
}

function makeGuestSession(): AuthSession {
  const user: User = {
    id: uid("guest"),

    displayName:
      `Guest ${Math.floor(
        Math.random() * 9000 + 1000
      )}`,

    ...GUEST_TEMPLATE,

    createdAt:
      new Date().toISOString(),
  };

  return {
    user,

    accessToken:
      `mock_guest_${uid("tok")}`,

    refreshToken:
      `mock_guest_${uid("tok")}`,

    expiresAt:
      Date.now() +
      7 * 24 * 60 * 60_000,
  };
}

export const useAuthStore =
  create<AuthState>()(
    persist(
      (set, get) => ({
        session: null,

        authInitialized: false,
        isSigningOut: false,
        sessionExpired: false,
        intentionalSignOut: false,

        clearSessionExpired: () => {
          set({
            sessionExpired: false,
          });
        },

        continueAsGuest: () => {
          set({
            session: makeGuestSession(),
            sessionExpired: false,
            intentionalSignOut: false,
            isSigningOut: false,
          });
        },

        signIn: async (
          email,
          password
        ) => {
          const session =
            await authService.signIn(
              email,
              password
            );

          set({
            session,
            sessionExpired: false,
            intentionalSignOut: false,
            isSigningOut: false,
          });
        },

        signUp: async (data) => {
          const session =
            await authService.signUp(
              data
            );

          /*
           * With Confirm Email enabled,
           * this is null until OTP verification.
           */
          if (session) {
            set({
              session,
              sessionExpired: false,
              intentionalSignOut: false,
              isSigningOut: false,
            });
          }

          return session;
        },

        verifyEmailOtp: async (
          email,
          token
        ) => {
          const session =
            await authService
              .verifyEmailOtp(
                email,
                token
              );

          set({
            session,
          });
        },

        resendVerificationEmail:
          async (email) => {
            await authService
              .resendVerificationOtp(
                email
              );
          },



        resetIntentionalSignOut: () => {
          set({
            intentionalSignOut: false,
          });
        },

        signOut: async () => {
          const currentSession =
            get().session;

          /*
           * Guest logout never touches Supabase.
           */
          if (
            currentSession?.user.role ===
            "guest"
          ) {
            set({
              session: null,
              sessionExpired: false,
              intentionalSignOut: false,
            });

            return;
          }

          /*
           * Tell the auth listener BEFORE
           * we contact Supabase.
           *
           * Caveman:
           * "I am logging out on purpose."
           */
          set({
            intentionalSignOut: true,
            sessionExpired: false,
          });

          try {
            await authService.signOut();

            /*
             * Local mirror cleanup.
             */
            set({
              session: null,
              intentionalSignOut: false,
              sessionExpired: false,
            });
          } catch (error) {
            /*
             * Logout failed.
             *
             * Keep the user logged in.
             */
            set({
              intentionalSignOut: false,
            });

            throw error;
          }
        },

        setSigningOut: (
          signingOut
        ) => {
          set({
            isSigningOut:
              signingOut,
          });
        },

        syncSupabaseSession:
          async (
            supabaseSession
          ) => {
            const currentSession =
              get().session;

            /*
             * If Zustand already represents this
             * exact Supabase session, avoid another
             * profile query.
             *
             * This is especially useful because
             * Supabase can emit SIGNED_IN after
             * authService.signIn()/verifyOtp().
             */
            if (
              currentSession &&
              currentSession.user
                .role !== "guest" &&
              currentSession.accessToken ===
              supabaseSession.access_token
            ) {
              return;
            }

            const session =
              await authService
                .buildSessionFromSupabaseSession(
                  supabaseSession
                );

            set({
              session,
              sessionExpired: false,
              intentionalSignOut: false,
              isSigningOut: false,
            });
          },

        clearSupabaseSession: (
          reason = "expired"
        ) => {
          const currentSession =
            get().session;

          /*
           * Guests do not use Supabase Auth.
           *
           * Never destroy a guest session just because
           * Supabase has no registered-user session.
           */
          if (
            currentSession?.user.role ===
            "guest"
          ) {
            return;
          }

          set({
            session: null,

            /*
             * Only an unexpected session loss counts
             * as "expired".
             */
            sessionExpired:
              reason === "expired",
          });
        },

        setAuthInitialized:
          (initialized) => {
            set({
              authInitialized:
                initialized,
            });
          },

        /*
         * Temporary local application flag.
         *
         * Real premium authorization must
         * eventually come from your DB/payment
         * state, not a client-only role change.
         */
        upgradeToPremium: () => {
          const session =
            get().session;

          if (!session) {
            return;
          }

          if (
            session.user.role ===
            "guest"
          ) {
            return;
          }

          set({
            session: {
              ...session,

              user: {
                ...session.user,

                role: "premium",

                isVerified: true,
              },
            },
          });

          void authService.updateProfile(session.user.id, {
            role: "premium",
          });
        },

        updateProfile: (patch) => {
          const session =
            get().session;

          if (!session) {
            return;
          }

          if (
            session.user.role ===
            "guest"
          ) {
            return;
          }

          set({
            session: {
              ...session,

              user: {
                ...session.user,
                ...patch,
              },
            },
          });

          void authService.updateProfile(session.user.id, patch);
        },

        updateSupabaseTokens: (
          supabaseSession
        ) => {
          const currentSession =
            get().session;

          /*
           * Guests do not use Supabase Auth.
           */
          if (
            !currentSession ||
            currentSession.user.role === "guest"
          ) {
            return;
          }

          set({
            session: {
              ...currentSession,

              accessToken:
                supabaseSession.access_token,

              refreshToken:
                supabaseSession.refresh_token,

              expiresAt:
                supabaseSession.expires_at
                  ? supabaseSession.expires_at * 1000
                  : currentSession.expiresAt,
            },
          });
        },

        isGuest: () =>
          get().session?.user.role ===
          "guest",

        isRegistered: () => {
          const role =
            get().session?.user.role;

          return (
            role === "registered" ||
            role === "premium"
          );
        },

        isPremium: () =>
          get().session?.user.role ===
          "premium",
      }),

      {
        name: "loungechat-auth",

        storage:
          createLazyLocalStorage(),

        /*
         * CRITICAL:
         *
         * Only guest sessions are stored in
         * LoungeChat's Zustand persistence.
         *
         * A registered user's actual auth
         * session belongs to Supabase.
         */
        partialize: (state) => ({
          session:
            state.session?.user.role ===
              "guest"
              ? state.session
              : null,
        }),

        skipHydration: true,
      }
    )
  );