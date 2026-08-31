import type {
  Session,
} from "@supabase/supabase-js";

import type {
  AuthSession,
  User,
} from "@/types";

import {
  createRecoveryClient,
} from "@/lib/supabase/recovery-client";

import { createClient } from "@/lib/supabase/client";

export class AuthServiceError
  extends Error {
  readonly code?: string;
  readonly status?: number;

  constructor(
    message: string,
    options?: {
      code?: string;
      status?: number;
    }
  ) {
    super(message);

    this.name =
      "AuthServiceError";

    this.code =
      options?.code;

    this.status =
      options?.status;
  }
}

export interface AuthService {
  signIn(
    email: string,
    password: string
  ): Promise<AuthSession>;

  signUp(input: {
    displayName: string;
    email: string;
    password: string;
  }): Promise<AuthSession | null>;

  signOut(): Promise<void>;

  signOutRecovery(): Promise<void>;

  verifyEmailOtp(
    email: string,
    token: string
  ): Promise<AuthSession>;

  resendVerificationOtp(
    email: string
  ): Promise<void>;

  refresh(
    refreshToken: string
  ): Promise<AuthSession>;

  getCurrentSession(): Promise<
    AuthSession | null
  >;

  buildSessionFromSupabaseSession(
    session: Session
  ): Promise<AuthSession>;

  requestPasswordReset(
    email: string
  ): Promise<void>;

  updatePassword(
    password: string
  ): Promise<void>;
}

type SupabaseUser =
  Session["user"];

type Profile = {
  display_name: string | null;
  avatar_url: string | null;
  role:
  | "registered"
  | "premium";
  status:
  | "online"
  | "away"
  | "offline";
  bio: string | null;
  gender:
  | "male"
  | "female"
  | "other"
  | "prefer_not_to_say"
  | null;
  interests: string[] | null;
  is_verified: boolean;
  created_at: string;
};

function toAuthServiceError(
  error: unknown
): AuthServiceError {
  const value =
    error as {
      message?: string;
      code?: string;
      status?: number;
    };

  return new AuthServiceError(
    value?.message ??
    "Authentication request failed.",
    {
      code: value?.code,
      status: value?.status,
    }
  );
}

function mapUser(
  supabaseUser: SupabaseUser,
  profile: Profile
): User {
  return {
    id: supabaseUser.id,

    displayName:
      profile.display_name ||
      supabaseUser.user_metadata
        ?.display_name ||
      "New User",

    email:
      supabaseUser.email ??
      undefined,

    avatarUrl:
      profile.avatar_url ??
      undefined,

    role: profile.role,

    status: profile.status,

    bio:
      profile.bio ??
      undefined,

    gender:
      profile.gender ??
      undefined,

    interests:
      profile.interests ??
      [],

    /*
     * This is the application profile's
     * verified state.
     *
     * Your database trigger should keep this
     * synchronized with Supabase verification.
     */
    isVerified:
      profile.is_verified,

    createdAt:
      profile.created_at ||
      supabaseUser.created_at,
  };
}

async function getProfile(
  userId: string
): Promise<Profile> {
  const supabase =
    createClient();

  const {
    data,
    error,
  } =
    await supabase
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
    throw new AuthServiceError(
      `Failed to load profile: ${error.message}`,
      {
        code: error.code
      }
    );
  }

  if (!data) {
    throw new AuthServiceError(
      "User profile was not found."
    );
  }

  return data as Profile;
}

async function buildSession(
  supabaseUser: SupabaseUser,
  accessToken: string,
  refreshToken:
    | string
    | undefined,
  expiresAt: number
): Promise<AuthSession> {
  const profile =
    await getProfile(
      supabaseUser.id
    );

  return {
    user: mapUser(
      supabaseUser,
      profile
    ),
    accessToken,
    refreshToken,
    expiresAt,
  };
}

export class SupabaseAuthService
  implements AuthService {
  async signIn(
    email: string,
    password: string
  ): Promise<AuthSession> {
    const supabase =
      createClient();

    const {
      data,
      error,
    } =
      await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      );

    if (error) {
      throw toAuthServiceError(
        error
      );
    }

    if (
      !data.session ||
      !data.user
    ) {
      throw new AuthServiceError(
        "Sign in succeeded but no session was returned."
      );
    }

    return buildSession(
      data.user,
      data.session
        .access_token,
      data.session
        .refresh_token,
      data.session.expires_at
        ? data.session
          .expires_at * 1000
        : Date.now()
    );
  }

  async signOutRecovery(): Promise<void> {
    const supabase =
      createRecoveryClient();
  
    const {
      error,
    } =
      await supabase.auth.signOut({
        scope: "local",
      });
  
    if (error) {
      throw toAuthServiceError(
        error
      );
    }
  }
  
  async signOut(): Promise<void> {
    const supabase =
      createClient();

    const {
      error,
    } =
      await supabase.auth.signOut(
        {
          scope: "local",
        }
      );

    if (error) {
      throw toAuthServiceError(
        error
      );
    }
  }

  async signUp(input: {
    displayName: string;
    email: string;
    password: string;
  }): Promise<AuthSession | null> {
    const supabase =
      createClient();

    const {
      data,
      error,
    } =
      await supabase.auth.signUp(
        {
          email:
            input.email,
          password:
            input.password,

          options: {
            data: {
              display_name:
                input.displayName,
            },
          },
        }
      );

    if (error) {
      throw toAuthServiceError(
        error
      );
    }

    if (!data.user) {
      throw new AuthServiceError(
        "Signup succeeded but no user was returned."
      );
    }

    /*
     * Confirm Email enabled:
     *
     * user exists
     * session does not exist
     * OTP must be entered
     */
    if (!data.session) {
      return null;
    }

    return buildSession(
      data.user,
      data.session
        .access_token,
      data.session
        .refresh_token,
      data.session.expires_at
        ? data.session
          .expires_at * 1000
        : Date.now()
    );
  }

  async verifyEmailOtp(
    email: string,
    token: string
  ): Promise<AuthSession> {
    const supabase =
      createClient();

    const {
      data,
      error,
    } =
      await supabase.auth.verifyOtp(
        {
          email,
          token,
          type: "email",
        }
      );

    if (error) {
      throw toAuthServiceError(
        error
      );
    }

    if (
      !data.session ||
      !data.user
    ) {
      throw new AuthServiceError(
        "Email verification succeeded but no session was returned."
      );
    }

    return buildSession(
      data.user,
      data.session
        .access_token,
      data.session
        .refresh_token,
      data.session.expires_at
        ? data.session
          .expires_at * 1000
        : Date.now()
    );
  }

  async resendVerificationOtp(
    email: string
  ): Promise<void> {
    const supabase =
      createClient();

    const {
      error,
    } =
      await supabase.auth.resend(
        {
          type: "signup",
          email,
        }
      );

    if (error) {
      throw toAuthServiceError(
        error
      );
    }
  }

  async getCurrentSession(): Promise<
    AuthSession | null
  > {
    const supabase =
      createClient();

    const {
      data: {
        session,
      },
      error,
    } =
      await supabase.auth.getSession();

    if (error) {
      throw toAuthServiceError(
        error
      );
    }

    if (!session) {
      return null;
    }

    return this.buildSessionFromSupabaseSession(
      session
    );
  }

  async buildSessionFromSupabaseSession(
    session: Session
  ): Promise<AuthSession> {
    return buildSession(
      session.user,
      session.access_token,
      session.refresh_token,
      session.expires_at
        ? session.expires_at * 1000
        : Date.now()
    );
  }

  async refresh(
    refreshToken: string
  ): Promise<AuthSession> {
    const supabase =
      createClient();

    const {
      data,
      error,
    } =
      await supabase.auth.refreshSession(
        {
          refresh_token:
            refreshToken,
        }
      );

    if (error) {
      throw toAuthServiceError(
        error
      );
    }

    if (
      !data.session ||
      !data.user
    ) {
      throw new AuthServiceError(
        "Session refresh failed."
      );
    }

    return buildSession(
      data.user,
      data.session
        .access_token,
      data.session
        .refresh_token,
      data.session.expires_at
        ? data.session
          .expires_at * 1000
        : Date.now()
    );
  }

  async requestPasswordReset(
    email: string
  ): Promise<void> {
    const supabase =
      createRecoveryClient();

    const {
      error,
    } =
      await supabase.auth
        .resetPasswordForEmail(
          email,
          {
            redirectTo:
              `${window.location.origin}/auth/reset-password`,
          }
        );

    if (error) {
      throw toAuthServiceError(
        error
      );
    }
  }

  async updatePassword(
    password: string
  ): Promise<void> {
    const supabase =
      createRecoveryClient();

    /*
     * The recovery link establishes the
     * authenticated recovery session.
     *
     * We verify that a session actually exists
     * before allowing the password update.
     */
    const {
      data: {
        session,
      },
      error:
      sessionError,
    } =
      await supabase.auth.getSession();

    if (sessionError) {
      throw toAuthServiceError(
        sessionError
      );
    }

    if (!session) {
      throw new AuthServiceError(
        "No active password recovery session."
      );
    }

    const {
      error,
    } =
      await supabase.auth.updateUser(
        {
          password,
        }
      );

    if (error) {
      throw toAuthServiceError(
        error
      );
    }
  }
}

export const authService: AuthService =
  new SupabaseAuthService();