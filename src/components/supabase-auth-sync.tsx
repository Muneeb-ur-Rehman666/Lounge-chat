"use client";

import { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";

import { useAuthStore } from "@/stores/auth-store";
import { useFriendsStore } from "@/stores/friends-store";

export function SupabaseAuthSync() {
  useEffect(() => {
    const supabase = createClient();
    let hadAuthenticatedSession =
      false;

    /*
     * Listen for Supabase authentication changes.
     *
     * IMPORTANT:
     * We already have StoreHydration taking care
     * of Zustand rehydration, so we do NOT call
     * authStore.persist.rehydrate() here again.
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        /*
         * ----------------------------------------
         * INITIAL SESSION
         * ----------------------------------------
         *
         * Supabase tells us whether a real
         * authenticated session already exists.
         */
        if (
          event === "INITIAL_SESSION"
        ) {
          if (!session) {
            /*
             * No Supabase session when the app first
             * starts.
             *
             * This is NOT considered an expired session.
             *
             * It could simply be:
             *
             * "A brand-new visitor."
             */
            useAuthStore
              .getState()
              .clearSupabaseSession(
                "initial"
              );

            useAuthStore
              .getState()
              .setAuthInitialized(
                true
              );

            return;
          }

          /*
           * We have a real Supabase user.
           */
          hadAuthenticatedSession = true;

          void useAuthStore
            .getState()
            .syncSupabaseSession(
              session
            )
            .catch((error) => {
              console.error(
                "Initial Supabase auth synchronization failed:",
                error
              );
            })
            .finally(() => {
              useAuthStore
                .getState()
                .setAuthInitialized(
                  true
                );
            });

          return;
        }

        /*
         * ----------------------------------------
         * SIGNED OUT
         * ----------------------------------------
         *
         * There is no real Supabase user anymore.
         *
         * Clear:
         *
         * 1. registered auth state
         * 2. Friends data belonging to that user
         *
         * clearSupabaseSession() intentionally
         * does not destroy a guest session.
         */
        if (event === "SIGNED_OUT") {
          const authState =
            useAuthStore.getState();

          const wasIntentional =
            authState.intentionalSignOut;

          /*
           * If the user intentionally logged out,
           * this is NOT an expired session.
           *
           * If there was a real Supabase session and
           * the user did not intentionally log out,
           * treat the session loss as unexpected.
           */
          const reason =
            wasIntentional
              ? "signout"
              : hadAuthenticatedSession
                ? "expired"
                : "signout";

          authState.clearSupabaseSession(
            reason
          );

          useFriendsStore
            .getState()
            .clearFriendsData();

          authState.setSigningOut(false);

          /*
           * The Supabase session is no longer active.
           */
          hadAuthenticatedSession =
            false;

          /*
           * Reset the one-time logout marker.
           */
          useAuthStore
            .getState()
            .resetIntentionalSignOut();

          return;
        }

        /*
         * ----------------------------------------
         * TOKEN REFRESHED
         * ----------------------------------------
         *
         * Supabase has given us a new access token.
         *
         * DO NOT rebuild the entire application
         * session here.
         *
         * Why?
         *
         * Rebuilding it calls getProfile(),
         * which causes another database request.
         *
         * The user's profile did not necessarily
         * change just because the token changed.
         *
         * Supabase itself is already managing the
         * token refresh lifecycle.
         */
        if (
          event === "TOKEN_REFRESHED" &&
          session
        ) {
          useAuthStore
            .getState()
            .updateSupabaseTokens(session);

          return;
        }

        /*
         * ----------------------------------------
         * SIGNED IN / USER UPDATED / PASSWORD RECOVERY
         * ----------------------------------------
         *
         * These events can change the actual
         * application user information, so here
         * we rebuild the LoungeChat session.
         *
         * This loads the user's profile once.
         */
        if (
          (
            event === "SIGNED_IN" ||
            event === "USER_UPDATED" ||
            event === "PASSWORD_RECOVERY"
          ) &&
          session
        ) {
          hadAuthenticatedSession = true;

          void useAuthStore
            .getState()
            .syncSupabaseSession(session)
            .catch((error) => {
              console.error(
                `Supabase auth synchronization failed (${event}):`,
                error
              );
            });

          return;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}