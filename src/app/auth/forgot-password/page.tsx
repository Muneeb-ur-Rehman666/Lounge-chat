import type { Metadata } from "next";
import ForgotPasswordClient from "./forgot-password-client";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Reset your LoungeChat account password.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
