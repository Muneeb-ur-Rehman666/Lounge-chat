import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ChatConnectionState,
  ChatMessage,
  ChatSession,
  GenderPreference,
  MatchPreferences,
  StrangerPartner,
} from "@/types";
import { STRANGER_REPLIES } from "@/constants/mock-data";
import { DEFAULT_MATCH_PREFERENCES } from "@/services/chat";
import { createLazyLocalStorage } from "@/lib/lazy-local-storage";
import { delay, uid } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

interface ChatState {
  connection: ChatConnectionState;
  session: ChatSession | null;
  error: string | null;
  matchPreferences: MatchPreferences;
  setMatchPreferences: (patch: Partial<MatchPreferences>) => void;
  setGenderPreference: (gender: GenderPreference) => void;
  setInterestsEnabled: (enabled: boolean) => void;
  startMatchmaking: () => Promise<void>;
  skipStranger: () => Promise<void>;
  endChat: () => void;
  sendMessage: (
    content: string,
    type?: ChatMessage["type"],
    mediaUrl?: string
  ) => Promise<void>;
  setPartnerTyping: (typing: boolean) => void;
  simulateDisconnect: () => void;
  reconnect: () => Promise<void>;
  reportPartner: (reason: string, details?: string) => Promise<void>;
  blockPartner: () => Promise<void>;
}

const PARTNER_GENDERS: Array<"male" | "female" | "other"> = [
  "male",
  "female",
  "other",
];

const INTEREST_POOL = [
  "art",
  "games",
  "music",
  "movies",
  "sports",
  "travel",
  "coding",
  "cooking",
  "anime",
  "fitness",
  "books",
  "photography",
];

function pickInterests(prefs: MatchPreferences): string[] {
  const myInterests = useAuthStore.getState().session?.user.interests ?? [];
  const count = 2 + Math.floor(Math.random() * 3);
  const picked = new Set<string>();

  if (prefs.interestsEnabled && myInterests.length > 0 && Math.random() < 0.85) {
    const shuffled = [...myInterests].sort(() => Math.random() - 0.5);
    for (const tag of shuffled.slice(0, Math.min(2, shuffled.length))) {
      picked.add(tag.toLowerCase());
    }
  }

  while (picked.size < count) {
    picked.add(INTEREST_POOL[Math.floor(Math.random() * INTEREST_POOL.length)]!);
  }

  return [...picked];
}

function randomPartner(prefs: MatchPreferences): StrangerPartner {
  const isGuest = Math.random() > 0.55;
  let gender: "male" | "female" | "other";
  if (prefs.gender === "male" || prefs.gender === "female") {
    gender =
      Math.random() < 0.85
        ? prefs.gender
        : PARTNER_GENDERS[Math.floor(Math.random() * PARTNER_GENDERS.length)]!;
  } else {
    gender = PARTNER_GENDERS[Math.floor(Math.random() * PARTNER_GENDERS.length)]!;
  }

  return {
    id: uid("stranger"),
    displayName: isGuest
      ? "Anonymous Stranger"
      : `Member ${Math.floor(Math.random() * 900 + 100)}`,
    gender,
    interests: pickInterests(prefs),
    isVerified: !isGuest && Math.random() > 0.4,
    isGuest,
    status: "online",
  };
}

function systemMessage(sessionId: string, content: string): ChatMessage {
  return {
    id: uid("msg"),
    sessionId,
    senderId: "system",
    type: "system",
    content,
    createdAt: new Date().toISOString(),
    status: "sent",
  };
}

let typingTimer: ReturnType<typeof setTimeout> | null = null;
let replyTimer: ReturnType<typeof setTimeout> | null = null;

function clearTimers() {
  if (typingTimer) clearTimeout(typingTimer);
  if (replyTimer) clearTimeout(replyTimer);
  typingTimer = null;
  replyTimer = null;
}

function schedulePartnerReply(
  get: () => ChatState,
  set: (p: Partial<ChatState> | ((s: ChatState) => Partial<ChatState>)) => void
) {
  if (typingTimer) clearTimeout(typingTimer);
  if (replyTimer) clearTimeout(replyTimer);

  typingTimer = setTimeout(() => {
    const s = get();
    if (s.connection !== "connected" || !s.session) return;
    set({ session: { ...s.session, isPartnerTyping: true } });

    replyTimer = setTimeout(() => {
      const current = get();
      if (current.connection !== "connected" || !current.session) return;
      const reply =
        STRANGER_REPLIES[Math.floor(Math.random() * STRANGER_REPLIES.length)]!;
      const msg: ChatMessage = {
        id: uid("msg"),
        sessionId: current.session.id,
        senderId: current.session.partner.id,
        type: "text",
        content: reply,
        createdAt: new Date().toISOString(),
        status: "delivered",
      };
      set({
        session: {
          ...current.session,
          isPartnerTyping: false,
          messages: [...current.session.messages, msg],
        },
      });
    }, 1200 + Math.random() * 1800);
  }, 800 + Math.random() * 1200);
}

async function connectSession(
  set: (p: Partial<ChatState> | ((s: ChatState) => Partial<ChatState>)) => void,
  get: () => ChatState
) {
  clearTimers();
  set({ connection: "searching", session: null, error: null });
  await delay(900 + Math.random() * 1400);
  if (get().connection !== "searching") return;

  set({ connection: "connecting" });
  await delay(400);
  if (get().connection !== "connecting" && get().connection !== "searching")
    return;

  const partner = randomPartner(get().matchPreferences);
  const sessionId = uid("session");
  const overlapHint =
    get().matchPreferences.interestsEnabled && partner.interests.length > 0
      ? ` · into ${partner.interests.slice(0, 2).join(", ")}`
      : "";
  const session: ChatSession = {
    id: sessionId,
    partner,
    startedAt: new Date().toISOString(),
    isPartnerTyping: false,
    messages: [
      systemMessage(sessionId, `Connected with a stranger${overlapHint}`),
    ],
  };

  set({ connection: "connected", session });

  setTimeout(() => {
    const s = get();
    if (s.connection !== "connected" || !s.session) return;
    const opener: ChatMessage = {
      id: uid("msg"),
      sessionId: s.session.id,
      senderId: s.session.partner.id,
      type: "text",
      content: "Hey there! 👋",
      createdAt: new Date().toISOString(),
      status: "delivered",
    };
    set({
      session: {
        ...s.session,
        messages: [...s.session.messages, opener],
      },
    });
  }, 600);
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      connection: "idle",
      session: null,
      error: null,
      matchPreferences: { ...DEFAULT_MATCH_PREFERENCES },

      setMatchPreferences: (patch) => {
        set((s) => ({
          matchPreferences: { ...s.matchPreferences, ...patch },
        }));
      },

      setGenderPreference: (gender) => {
        set((s) => ({
          matchPreferences: { ...s.matchPreferences, gender },
        }));
      },

      setInterestsEnabled: (enabled) => {
        set((s) => ({
          matchPreferences: {
            ...s.matchPreferences,
            interestsEnabled: enabled,
          },
        }));
      },

      startMatchmaking: async () => {
        await connectSession(set, get);
      },

      skipStranger: async () => {
        clearTimers();
        await connectSession(set, get);
      },

      endChat: () => {
        clearTimers();
        set({ connection: "ended", session: null });
      },

      sendMessage: async (content, type = "text", mediaUrl) => {
        const { session, connection } = get();
        if (
          !session ||
          connection !== "connected" ||
          (!content.trim() && !mediaUrl)
        )
          return;

        const optimistic: ChatMessage = {
          id: uid("msg"),
          sessionId: session.id,
          senderId: "me",
          type,
          content: content.trim(),
          mediaUrl,
          createdAt: new Date().toISOString(),
          status: "sending",
        };

        set({
          session: {
            ...session,
            messages: [...session.messages, optimistic],
          },
        });

        await delay(180);
        let current = get().session;
        if (!current || get().connection !== "connected") return;
        set({
          session: {
            ...current,
            messages: current.messages.map((m) =>
              m.id === optimistic.id ? { ...m, status: "sent" } : m
            ),
          },
        });

        await delay(350);
        current = get().session;
        if (!current || get().connection !== "connected") return;
        set({
          session: {
            ...current,
            messages: current.messages.map((m) =>
              m.id === optimistic.id ? { ...m, status: "delivered" } : m
            ),
          },
        });

        await delay(700 + Math.random() * 900);
        current = get().session;
        if (!current || get().connection !== "connected") return;
        set({
          session: {
            ...current,
            messages: current.messages.map((m) =>
              m.id === optimistic.id ||
              (m.senderId === "me" &&
                (m.status === "sent" || m.status === "delivered"))
                ? { ...m, status: "read" }
                : m
            ),
          },
        });

        schedulePartnerReply(get, set);
      },

      setPartnerTyping: (typing) => {
        const session = get().session;
        if (!session) return;
        set({ session: { ...session, isPartnerTyping: typing } });
      },

      simulateDisconnect: () => {
        if (typingTimer) {
          clearTimeout(typingTimer);
          typingTimer = null;
        }
        if (replyTimer) {
          clearTimeout(replyTimer);
          replyTimer = null;
        }
        const session = get().session;
        if (session?.isPartnerTyping) {
          set({
            connection: "disconnected",
            error: "Connection lost. Trying again…",
            session: { ...session, isPartnerTyping: false },
          });
        } else {
          set({
            connection: "disconnected",
            error: "Connection lost. Trying again…",
          });
        }
      },

      reconnect: async () => {
        set({ connection: "reconnecting", error: null });
        await delay(1200);
        const session = get().session;
        if (session) {
          set({ connection: "connected" });
        } else {
          await connectSession(set, get);
        }
      },

      reportPartner: async () => {
        await delay(500);
      },

      blockPartner: async () => {
        await delay(400);
        clearTimers();
        set({ connection: "ended", session: null });
      },
    }),
    {
      name: "loungechat-match-prefs",
      storage: createLazyLocalStorage(),
      partialize: (s) => ({ matchPreferences: s.matchPreferences }),
      merge: (persisted, current) => {
        const p = persisted as Partial<ChatState> | undefined;
        return {
          ...current,
          ...p,
          matchPreferences: {
            ...DEFAULT_MATCH_PREFERENCES,
            ...p?.matchPreferences,
          },
        };
      },
      skipHydration: true,
    }
  )
);
