import { useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";

interface LoginIslandProps {
  redirectTo: string;
}

export default function LoginIsland({ redirectTo }: LoginIslandProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      // Redirect to admin dashboard or the specified redirect URL
      globalThis.location.href = redirectTo;
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} class="space-y-4">
        <div>
          <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={email}
            onChange={(e: Event) =>
              setEmail((e.target as HTMLInputElement).value)
            }
            required
          />
        </div>

        <div>
          <label
            class="block text-gray-700 text-sm font-bold mb-2"
            for="password"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={password}
            onChange={(e: Event) =>
              setPassword((e.target as HTMLInputElement).value)
            }
            required
          />
        </div>

        <Button type="submit" disabled={loading} class="w-full">
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </>
  );
}
