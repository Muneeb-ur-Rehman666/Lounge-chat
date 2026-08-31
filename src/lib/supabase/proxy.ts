import {
  createServerClient,
} from "@supabase/ssr";

import {
  NextResponse,
  type NextRequest,
} from "next/server";

export async function updateSession(
  request: NextRequest
) {
  let supabaseResponse =
    NextResponse.next({
      request,
    });

  const supabase =
    createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env
        .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },

          setAll(
            cookiesToSet,
            headers
          ) {
            /*
             * Put refreshed Supabase cookies
             * onto the incoming request.
             */
            cookiesToSet.forEach(
              ({
                name,
                value,
              }) => {
                request.cookies.set(
                  name,
                  value
                );
              }
            );

            /*
             * Recreate the response so the
             * refreshed cookies are sent back
             * to the browser.
             */
            supabaseResponse =
              NextResponse.next({
                request,
              });

            cookiesToSet.forEach(
              ({
                name,
                value,
                options,
              }) => {
                supabaseResponse.cookies.set(
                  name,
                  value,
                  options
                );
              }
            );

            /*
             * Supabase may provide cache /
             * response headers when it refreshes
             * the session.
             *
             * Keep them.
             */
            Object.entries(
              headers ?? {}
            ).forEach(
              ([key, value]) => {
                supabaseResponse.headers.set(
                  key,
                  value
                );
              }
            );
          },
        },
      }
    );

  /*
   * getClaims() verifies the JWT.
   *
   * This is the correct method for
   * server-side auth verification.
   */
  const {
    data: claimsData,
    error: claimsError,
  } =
    await supabase.auth.getClaims();

  const claims =
    claimsData?.claims;

  /*
   * Log unexpected validation failures,
   * but do not crash the request.
   */
  if (claimsError) {
    console.error(
      "Supabase claims validation failed:",
      claimsError
    );
  }

  const pathname =
    request.nextUrl.pathname;

  /*
   * Authenticated users should not
   * return to /auth.
   */
  if (
    pathname === "/auth" &&
    claims
  ) {
    return NextResponse.redirect(
      new URL(
        "/chats",
        request.url
      )
    );
  }

  /*
   * IMPORTANT:
   *
   * /chats stays open to guests.
   * /profile also stays open to guests
   * because LoungeChat has a guest profile
   * experience.
   *
   * Feature-level restrictions are
   * handled inside the application.
   */

  return supabaseResponse;
}