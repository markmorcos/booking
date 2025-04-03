import { Handlers } from "$fresh/server.ts";
import { signOut } from "../../../utils/supabase.ts";
import { deleteCookie } from "https://deno.land/std@0.190.0/http/cookie.ts";

export const handler: Handlers = {
  async POST(_req) {
    try {
      await signOut();

      const response = new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

      // Delete the auth cookie
      deleteCookie(response.headers, "sb-auth-token", { path: "/" });

      return response;
    } catch (error) {
      console.error("Logout error:", error);
      return new Response(JSON.stringify({ error: "Failed to log out" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
