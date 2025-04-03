import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { getCookies } from "https://deno.land/std@0.190.0/http/cookie.ts";
import { getSession } from "../../utils/supabase.ts";

export async function handler(req: Request, ctx: MiddlewareHandlerContext) {
  // Skip authentication for the login route
  if (req.url.includes("/admin/login")) {
    return ctx.next();
  }

  // Check authentication
  try {
    const cookies = getCookies(req.headers);
    const authToken = cookies["sb-auth-token"];

    // If no token, redirect to login
    if (!authToken) {
      const url = new URL(req.url);
      return new Response("", {
        status: 307,
        headers: {
          Location: `/admin/login?redirectTo=${encodeURIComponent(
            url.pathname
          )}`,
        },
      });
    }

    // Verify the session is valid
    const session = await getSession();
    if (!session) {
      // If no session, redirect to login
      const url = new URL(req.url);
      return new Response("", {
        status: 307,
        headers: {
          Location: `/admin/login?redirectTo=${encodeURIComponent(
            url.pathname
          )}`,
        },
      });
    }

    // Continue to the route handler
    return ctx.next();
  } catch (error) {
    console.error("Authentication error:", error);
    return new Response("", {
      status: 307,
      headers: { Location: "/admin/login" },
    });
  }
}
