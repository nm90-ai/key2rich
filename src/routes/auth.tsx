import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — The Quiet Ledger" },
      { name: "description", content: "Private sign-in for The Quiet Ledger dashboard." },
      { property: "og:title", content: "Sign in — The Quiet Ledger" },
      { property: "og:description", content: "Private sign-in for The Quiet Ledger dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const { error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/admin` },
          });
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    if (mode === "signup") {
      setMessage("Account created. If confirmation is required, check your inbox.");
    }
    const { data } = await supabase.auth.getUser();
    if (data.user) void navigate({ to: "/admin" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-5 text-ink">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-cardline bg-white p-6 shadow-sm"
      >
        <h1 className="font-serif text-2xl font-bold">The Quiet Ledger</h1>
        <p className="mt-1 mb-6 text-sm text-ink/60">Private dashboard access.</p>

        <label className="mb-1 block text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border border-cardline px-3 py-2 text-sm outline-none focus:border-brand"
        />

        <label className="mb-1 block text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-5 w-full rounded-lg border border-cardline px-3 py-2 text-sm outline-none focus:border-brand"
        />

        {message && <p className="mb-4 text-sm text-brand">{message}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand/90 disabled:opacity-60"
        >
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 w-full text-center text-sm text-ink/60 underline"
        >
          {mode === "signin" ? "Need to create the admin account?" : "Back to sign in"}
        </button>
      </form>
    </div>
  );
}
