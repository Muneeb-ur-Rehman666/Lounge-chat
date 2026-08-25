# LoungeChat

Premium stranger-chat experience built with **Next.js App Router**, TypeScript, Tailwind CSS, and the Midnight Bloom design system.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui (Base UI primitives)
- Motion, TanStack Query, Zustand
- React Hook Form + Zod
- Lucide icons, next/font (Inter), next-themes

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build (webpack)
npm start       # serve production build
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Marketing landing |
| `/auth` | Sign in / Sign up / Continue as Guest |
| `/auth/forgot-password` | Password reset (mock) |
| `/chats` | Random stranger chat |
| `/friends` | Friends list + friend chat |
| `/notifications` | Notification center |
| `/settings` | Preferences |
| `/profile` | Profile editing |
| `/premium` | Plans + placeholder checkout |
| `/safety`, `/community` | Marketing content |

## Guest vs registered

- **Guests** can start chatting immediately; Friends, Notifications, and media sharing are soft-gated.
- **Registered** users get friends, requests, profile, and history-ready account state.
- **Premium** unlocks via demo checkout (`src/services/premium.ts`) — swap `paymentProvider` for Stripe later.

## Architecture notes

- Auth session: `src/stores/auth-store.ts` (persisted) — API via `src/services/auth.ts`
- Chat: `src/stores/chat-store.ts` + `src/features/chat/use-chat-session.ts` (offline/reconnect)
- Friends: Zustand + TanStack Query (`src/features/friends/use-friends-query.ts`)
- Design tokens: `src/app/globals.css` (Midnight Bloom)

## Chat polish

- Matchmaking / searching / reconnect overlays
- Typing indicators, read receipts (sent → delivered → read)
- Skip rematches instantly; End Chat confirms then returns to lounge
- Report / block dialogs, drag-and-drop images, emoji + GIF picker
- Guest upsell banner on chats

## Demo tips

- Sign in with any email + password (6+ chars). Use an email containing `premium` to land as Premium.
- Toggle offline in DevTools to exercise reconnect UI.
- Skip ends the session and rematches instantly; End Chat returns to the lounge empty state.
