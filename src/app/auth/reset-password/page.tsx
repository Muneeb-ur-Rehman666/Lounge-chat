import type { Metadata } from "next";

import ResetPasswordClient from "./reset-password-client";

export const metadata: Metadata = {
  title: "Set new password",
  description: "Set a new password for your LoungeChat account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}