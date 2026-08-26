import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  const verifiedUrl = new URL("/auth/verified", requestUrl.origin);
  const authUrl = new URL("/auth", requestUrl.origin);

  if (!code) {
    authUrl.searchParams.set("error", "verification_failed");
    return NextResponse.redirect(authUrl);
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    authUrl.searchParams.set("error", "verification_failed");
    return NextResponse.redirect(authUrl);
  }

  return NextResponse.redirect(verifiedUrl);
}