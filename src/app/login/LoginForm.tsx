"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });

      if (error) throw error;

      setResetSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-8 sm:py-16">
      <div className="cyber-card p-4 sm:p-8">
        <h1 className="pixel-text text-xl sm:text-2xl text-[#ff4500] font-bold mb-4 sm:mb-6 text-center">
          LOGIN
        </h1>
        {message && (
          <div className="pixel-text text-green-500 text-sm mb-4 text-center">
            {message}
          </div>
        )}
        {resetSent ? (
          <div className="text-center">
            <p className="pixel-text text-green-500 mb-4">
              Password reset instructions have been sent to your email.
            </p>
            <Button
              variant="outline"
              className="cyber-button pixel-text"
              onClick={() => setResetSent(false)}
            >
              Back to Login
            </Button>
          </div>
        ) : (
          <>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="pixel-text text-sm text-gray-400"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="cyber-input pixel-text mt-1"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="pixel-text text-sm text-gray-400"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="cyber-input pixel-text mt-1"
                  required
                />
              </div>
              {error && (
                <div className="pixel-text text-red-500 text-sm">{error}</div>
              )}
              <Button
                type="submit"
                className="cyber-button pixel-text w-full"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>

            <div className="relative my-4 sm:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                className="cyber-button pixel-text"
                onClick={() => handleSocialLogin("google")}
              >
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="cyber-button pixel-text"
                onClick={() => handleSocialLogin("github")}
              >
                GitHub
              </Button>
            </div>

            <div className="mt-4 text-center space-y-2">
              <div>
                <span className="pixel-text text-sm text-gray-400">
                  Don&apos;t have an account?{" "}
                </span>
                <Link
                  href="/signup"
                  className="pixel-text text-[#ff4500] hover:underline"
                >
                  Sign Up
                </Link>
              </div>
              <div>
                <button
                  onClick={handleResetPassword}
                  className="pixel-text text-sm text-[#ff4500] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
