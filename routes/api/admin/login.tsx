import { Handlers } from "$fresh/server.ts";
import { signIn } from "../../../utils/supabase.ts";
import { setCookie } from "https://deno.land/std@0.190.0/http/cookie.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      const body = await req.json();
      const { email, password } = body;

      if (!email || !password) {
        return new Response(
          JSON.stringify({ error: "Email and password are required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const authData = await signIn(email, password);

      // Create response and set auth cookies
      const response = new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

      // Set auth cookie with session data
      setCookie(response.headers, {
        name: "sb-auth-token",
        value: authData.session?.access_token || "",
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      return response;
    } catch (error) {
      console.error("Login error:", error);
      return new Response(
        JSON.stringify({
          error: (error as Error).message || "Authentication failed",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};
