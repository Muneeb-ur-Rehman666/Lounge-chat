import type { Metadata } from "next";
import { DM_Sans, Plus_Jakarta_Sans, Geist_Mono, Lobster } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lobster = Lobster({
  weight: "400",
  variable: "--font-lobster",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LoungeChat — Meet Someone New",
    template: "%s · LoungeChat",
  },
  description:
    "Jump into spontaneous chats with people around the world. Fun, vibrant, and built for meeting someone new.",
  keywords: ["stranger chat", "anonymous chat", "LoungeChat", "meet new people"],
  openGraph: {
    title: "LoungeChat — Meet Someone New",
    description:
      "Vibrant stranger chat with privacy, playful vibes, and premium match filters.",
    type: "website",
    siteName: "LoungeChat",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${plusJakarta.variable} ${dmSans.variable} ${geistMono.variable} ${lobster.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background font-sans text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
