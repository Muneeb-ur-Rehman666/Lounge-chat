import type { AuthSession, User } from "@/types";
import { createClient } from "@/lib/supabase/client";

export interface AuthService {
  signIn(email: string, password: string): Promise<AuthSession>;
  signUp(input: {
    displayName: string;
    email: string;
    password: string;
  }): Promise<AuthSession | null>;
  refresh(refreshToken: string): Promise<AuthSession>;
  requestPasswordReset(email: string): Promise<void>;
}

function mapUser(
  supabaseUser: {
    id: string;
    email?: string;
    created_at: string;
    user_metadata?: {
      display_name?: string;
    };
  },
  profile: {
    display_name: string;
    avatar_url: string | null;
    role: "registered" | "premium";
    status: "online" | "away" | "offline";
    bio: string | null;
    gender: "male" | "female" | "other" | "prefer_not_to_say" | null;
    interests: string[];
    is_verified: boolean;
    created_at: string;
  }
): User {
  return {
    id: supabaseUser.id,
    displayName:
      profile.display_name ||
      supabaseUser.user_metadata?.display_name ||
      "New User",
    email: supabaseUser.email,
    avatarUrl: profile.avatar_url ?? undefined,
    role: profile.role,
    status: profile.status,
    bio: profile.bio ?? undefined,
    gender: profile.gender ?? undefined,
    interests: profile.interests,
    isVerified: profile.is_verified,
    createdAt: profile.created_at,
  };
}

async function getProfile(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
        display_name,
        avatar_url,
        role,
        status,
        bio,
        gender,
        interests,
        is_verified,
        created_at
      `
    )
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(`Failed to load profile: ${error.message}`);
  }

  return data;
}

async function buildSession(
  supabaseUser: {
    id: string;
    email?: string;
    created_at: string;
    user_metadata?: {
      display_name?: string;
    };
  },
  accessToken: string,
  refreshToken: string | undefined,
  expiresAt: number
): Promise<AuthSession> {
  const profile = await getProfile(supabaseUser.id);

  return {
    user: mapUser(supabaseUser, profile),
    accessToken,
    refreshToken,
    expiresAt,
  };
}

export class SupabaseAuthService implements AuthService {
  async signIn(
    email: string,
    password: string
  ): Promise<AuthSession> {
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.session || !data.user) {
      throw new Error("Sign in succeeded but no session was returned.");
    }

    return buildSession(
      data.user,
      data.session.access_token,
      data.session.refresh_token,
      data.session.expires_at
        ? data.session.expires_at * 1000
        : Date.now()
    );
  }

  async signUp(input: {
    displayName: string;
    email: string;
    password: string;
  }): Promise<AuthSession | null> {
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          display_name: input.displayName,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("Signup succeeded but no user was returned.");
    }

    if (!data.session) {
      return null;
    }

    return buildSession(
      data.user,
      data.session.access_token,
      data.session.refresh_token,
      data.session.expires_at
        ? data.session.expires_at * 1000
        : Date.now()
    );
  }

  async refresh(refreshToken: string): Promise<AuthSession> {
    const supabase = createClient();

    const { data, error } =
      await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.session || !data.user) {
      throw new Error("Session refresh failed.");
    }

    return buildSession(
      data.user,
      data.session.access_token,
      data.session.refresh_token,
      data.session.expires_at
        ? data.session.expires_at * 1000
        : Date.now()
    );
  }

  async requestPasswordReset(email: string): Promise<void> {
    const supabase = createClient();

    const { error } =
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

    if (error) {
      throw new Error(error.message);
    }
  }
}

export const authService: AuthService =
  new SupabaseAuthService();