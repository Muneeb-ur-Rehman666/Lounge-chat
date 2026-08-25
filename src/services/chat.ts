import type {
  ChatMessage,
  ChatSession,
  MatchPreferences,
  StrangerPartner,
} from "@/types";

/**
 * Chat API surface for future WebSocket / REST backend integration.
 * The Zustand chat store currently simulates these operations client-side.
 */
export interface ChatService {
  findMatch(
    prefs?: MatchPreferences
  ): Promise<{ session: ChatSession; partner: StrangerPartner }>;
  sendMessage(
    sessionId: string,
    payload: { content: string; type: ChatMessage["type"]; mediaUrl?: string }
  ): Promise<ChatMessage>;
  endSession(sessionId: string): Promise<void>;
  report(sessionId: string, reason: string, details?: string): Promise<void>;
  block(sessionId: string, partnerId: string): Promise<void>;
}

export const DEFAULT_MATCH_PREFERENCES: MatchPreferences = {
  gender: "any",
  interestsEnabled: false,
};

export const CHAT_SERVICE_NOTES =
  "Client-side mock via useChatStore. Replace with WebSocket-backed ChatService when backend is ready.";
