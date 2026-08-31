import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request
) {
  const requestUrl =
    new URL(request.url);

  const code =
    requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL(
        "/auth",
        request.url
      )
    );
  }

  const supabase =
    await createClient();

  const {
    error,
  } =
    await supabase.auth.exchangeCodeForSession(
      code
    );

  if (error) {
    console.error(
      "PASSWORD RECOVERY CALLBACK FAILED:",
      {
        message: error.message,
        code: error.code,
        status: error.status,
      }
    );

    return NextResponse.redirect(
      new URL(
        "/auth/forgot-password?error=invalid_or_expired_link",
        request.url
      )
    );
  }

  return NextResponse.redirect(
    new URL(
      "/auth/reset-password",
      request.url
    )
  );
}