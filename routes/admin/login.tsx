import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { getSession } from "../../utils/supabase.ts";
import LoginIsland from "../../islands/LoginIsland.tsx";
export const handler: Handlers = {
  async GET(req, ctx) {
    const session = await getSession();
    const url = new URL(req.url);
    const redirectTo = url.searchParams.get("redirectTo") || "/admin";

    // If already logged in, redirect to admin
    if (session) {
      return new Response("", {
        status: 307,
        headers: { Location: redirectTo },
      });
    }

    return ctx.render({ redirectTo });
  },
};

interface LoginProps {
  redirectTo: string;
}

export default function Login({ data }: PageProps<LoginProps>) {
  return (
    <>
      <Head>
        <title>Admin Login - Appointment Booking</title>
      </Head>
      <div class="p-4 mx-auto max-w-md">
        <h1 class="text-2xl font-bold mb-6 text-center">Admin Login</h1>
        <LoginForm redirectTo={data.redirectTo} />
      </div>
    </>
  );
}

function LoginForm({ redirectTo }: LoginProps) {
  return (
    <div class="border rounded-lg p-6">
      <LoginIsland redirectTo={redirectTo} />
    </div>
  );
}
