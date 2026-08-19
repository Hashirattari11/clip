"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, register } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, name, password);
      }
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-2xl font-bold">
            C
          </div>
          <h1 className="text-3xl font-bold">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p className="mt-2 text-gray-400">
            {mode === "login"
              ? "Login to manage your API keys & clips"
              : "Sign up to start clipping videos with AI"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-card p-8">
          {mode === "register" && (
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="input-field"
                required
              />
            </div>
          )}

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-field"
              required
            />
          </div>

          <div className="mb-6">
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field"
              minLength={6}
              required
            />
            {mode === "register" && (
              <p className="mt-1 text-xs text-gray-500">At least 6 characters</p>
            )}
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-500/10 p-3 text-center text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <Spinner />
            ) : mode === "login" ? (
              "Login"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Toggle */}
        <p className="mt-6 text-center text-sm text-gray-400">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                onClick={() => { setMode("register"); setError(""); }}
                className="font-medium text-brand-400 hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => { setMode("login"); setError(""); }}
                className="font-medium text-brand-400 hover:underline"
              >
                Login
              </button>
            </>
          )}
        </p>

        {/* Back */}
        <p className="mt-4 text-center text-xs text-gray-600">
          <a href="/" className="hover:text-gray-400">← Back to home</a>
        </p>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
