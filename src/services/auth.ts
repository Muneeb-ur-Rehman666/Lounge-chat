import type { AuthSession, User } from "@/types";
import { delay, uid } from "@/lib/utils";
import { DEMO_USER } from "@/constants/mock-data";

/**
 * Auth API surface — swap MockAuthService for a real HTTP/JWT implementation later.
 */
export interface AuthService {
  signIn(email: string, password: string): Promise<AuthSession>;
  signUp(input: {
    displayName: string;
    email: string;
    password: string;
  }): Promise<AuthSession>;
  refresh(refreshToken: string): Promise<AuthSession>;
  requestPasswordReset(email: string): Promise<void>;
}

function sessionFromUser(user: User): AuthSession {
  return {
    user,
    accessToken: `mock_access_${uid("tok")}`,
    refreshToken: `mock_refresh_${uid("tok")}`,
    expiresAt: Date.now() + 7 * 24 * 60 * 60_000,
  };
}

export class MockAuthService implements AuthService {
  async signIn(email: string, password: string): Promise<AuthSession> {
    await delay(700);
    if (!email || password.length < 6) throw new Error("Invalid credentials");
    return sessionFromUser({
      ...DEMO_USER,
      email,
      role: email.includes("premium") ? "premium" : "registered",
    });
  }

  async signUp(input: {
    displayName: string;
    email: string;
    password: string;
  }): Promise<AuthSession> {
    await delay(900);
    return sessionFromUser({
      id: uid("user"),
      displayName: input.displayName,
      email: input.email,
      avatarUrl: "/avatars/alex.svg",
      role: "registered",
      status: "online",
      isVerified: true,
      bio: "",
      createdAt: new Date().toISOString(),
    });
  }

  async refresh(): Promise<AuthSession> {
    await delay(300);
    return sessionFromUser(DEMO_USER);
  }

  async requestPasswordReset(): Promise<void> {
    await delay(800);
  }
}

export const authService: AuthService = new MockAuthService();
